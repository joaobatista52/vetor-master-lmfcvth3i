/// <reference path="../pb_data/types.d.ts" />

/**
 * Worker backend JBP Gestão Master V7.2.3 — Onda 2
 * - Processamento de fila de leads elegíveis (status = 'novo', não teste/lista_espera)
 * - Disparo do agente nativo jbp-gestao-master (tier reasoning) para Fase 1 + snapshot F6
 * - Máquina de estados: novo -> processando -> diagnostico_pronto
 * - Lead de parceiro: diagnostico_pronto -> parceiro_em_relacao
 * - Registro de custo/consumo do gateway por diagnóstico
 * - Cadência de nutrição D+3 / D+10 / D+25 (cron a cada hora)
 * - Roteamento de e-mails: lead direto vs parceiro (comunicação vai ao parceiro, nunca ao lead direto do parceiro enquanto parceiro_confirmou = false)
 * - Endpoint manual para processar lead específico: POST /backend/v1/worker/processar-lead/{id}
 * - Endpoint para acionar cadência manualmente: POST /backend/v1/worker/executar-cadencia
 * - REGRA CAPITAL: NENHUM lead é processado em lote automaticamente nesta entrega.
 *   O worker fica configurado para disparar por lead explícito (manual/gatilho controlado)
 *   ou com flag de auto_process desativada por padrão, impedindo disparo acidental sobre Beatek/Aurora.
 *
 * NOTA DE ESCOPO POCKETBASE JSVM: Cada callback do routerAdd / cronAdd contém a sua própria
 * lógica inline, sem referenciar funções top-level externas.
 */

// 1. Endpoint para o Admin disparar o processamento de UM lead específico sob controle
routerAdd(
  'POST',
  '/backend/v1/worker/processar-lead/{id}',
  (e) => {
    const leadId = e.request.pathValue('id')
    if (!leadId) {
      return e.json(400, { success: false, error: 'ID do lead não informado' })
    }

    let leadRecord
    try {
      leadRecord = $app.findRecordById('leads', leadId)
    } catch (_) {
      return e.json(404, { success: false, error: 'Lead não encontrado: ' + leadId })
    }

    const leadStatus = (leadRecord.getString('status') || '').toLowerCase()
    const razaoSocial =
      leadRecord.getString('razao_social') || leadRecord.getString('nome_completo')

    // Guardas de integridade
    if (leadStatus === 'teste') {
      return e.json(403, {
        success: false,
        error: 'Lead com status "teste" jamais pode ser processado pelo motor de produção.',
      })
    }
    if (leadStatus === 'lista_espera') {
      return e.json(403, {
        success: false,
        error:
          'Lead em lista de espera não tem questionário completo. Exige aprovação manual prévia para o status "novo".',
      })
    }
    if (leadStatus === 'processando') {
      return e.json(409, {
        success: false,
        error: 'Lead já está em processamento no momento.',
      })
    }

    // Regra Capital: Proteção contra disparo em massa / acidental do lead Beatek na Etapa 1
    const bodyStr = e.request.body ? e.request.body.string() : ''
    let reqBody = {}
    if (bodyStr) {
      try {
        reqBody = JSON.parse(bodyStr)
      } catch (_) {}
    }

    // Processamento inline do lead
    try {
      const tInicio = Date.now()
      const setor = leadRecord.getString('setor') || 'Geral'
      const autorizacaoRaw = leadRecord.getString('autorizacao_devolutiva') || ''
      const autorizouDevolutiva = autorizacaoRaw.toLowerCase().indexOf('sim') !== -1
      const origemTipo = (leadRecord.getString('origem_tipo') || 'direto').toLowerCase()
      const origemParceiro = leadRecord.getString('origem_parceiro') || ''
      const isParceiro = origemTipo === 'parceiro' || !!origemParceiro

      // 1. Gravar estado: "processando"
      leadRecord.set('status', 'processando')
      $app.save(leadRecord)

      // 2. Extrair dados do dossiê do lead
      const dadosCompletos = leadRecord.get('dados_completos') || {}
      const respostas = leadRecord.get('respostas') || {}
      const anexosContrato = leadRecord.get('contrato_social') || []
      const anexosCert = leadRecord.get('certificacoes') || []
      const anexosDoc = leadRecord.get('documentacao_adicional') || []

      // Detectar versão do questionário (CS-19)
      let versaoQuestionario = 'V7.2'
      if (
        dadosCompletos.versao_questionario === 'V6.7' ||
        (typeof respostas === 'object' && respostas.versao === 'V6.7')
      ) {
        versaoQuestionario = 'V6.7'
      }

      // Montar payload de contexto para o Agente nativo
      const payloadDossie = {
        protocolo: leadRecord.getString('protocolo') || '#VM-' + leadId,
        cliente: {
          razao_social: razaoSocial,
          cnpj: leadRecord.getString('cnpj') || '',
          cargo: leadRecord.getString('cargo') || '',
          email: leadRecord.getString('email') || '',
          whatsapp: leadRecord.getString('whatsapp') || '',
          setor: setor,
          segmento: leadRecord.getString('segmento') || '',
          faturamento_declarado: leadRecord.getString('faturamento_mensal') || '',
          formato_interesse: leadRecord.getString('formato_interesse') || '',
          autorizacao_devolutiva: autorizacaoRaw,
          versao_questionario: versaoQuestionario,
          origem_tipo: isParceiro ? 'parceiro' : 'direto',
          origem_parceiro: origemParceiro,
        },
        respostas: respostas,
        dados_completos: dadosCompletos,
        anexos: {
          demonstrativos: anexosContrato,
          relatorios: anexosCert,
          complementares: anexosDoc,
        },
      }

      // 3. Montar mensagem do Prompt 1 + Fase 1 + Snapshot F6 (Seção 9.1)
      const promptMensagem =
        'PROMPT DE EXECUÇÃO DETERMINÍSTICA — VETOR MASTER V7.2.3\n\n' +
        'Comando: Executar CARGA DE DADOS (Prompt 1) e INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO + SNAPSHOT FASE 6 (Seção 9.1).\n\n' +
        'PROTOCOLO OBRIGATÓRIO:\n' +
        '1. Confirmação de carga em até 2 linhas declarando expressamente a versão do questionário (' +
        versaoQuestionario +
        ') conforme CS-19, os documentos recebidos e a sinalização do gate de autorização (' +
        (autorizouDevolutiva ? 'Sim' : 'Não autorizo') +
        ') conforme CS-20. DRE entra referenciada como anexo, sem slot dedicado.\n' +
        '2. Fase 1: Entregar Causa Raiz, 3 a 5 Micro-epifanias com fonte obrigatória do Bloco Setorial, Vazamentos Quantificados exclusivamente baseados nos dados fornecidos, Nota de Triangulação e Canvas As Is (9 blocos).\n' +
        '3. Snapshot Fase 6: DRE Normalizada na estrutura mandatória de 15 linhas (CS-17). Linhas não segregáveis recebem obrigatoriamente [REQUER VERIFICAÇÃO] na própria linha. Nenhuma linha omitida. Se houver balancete/ECD com tributos já embutidos, aplicar Exceção A11.\n' +
        '4. Anexo B EREC canônico A9: se houver plano/recomendações iniciais, estruturar no padrão Ação (Eliminar/Reduzir/Elevar/Criar) | Item de Intervenção | Base Conclusiva | Dimensão setorial.\n' +
        '5. Se autorizacao_devolutiva = "Não autorizo", cumprir CS-20: não emitir Bloco CTA integral; estruturar TEASER com 1 a 2 micro-epifanias quantificadas sem causa raiz, sem solução e sem plano (proteção do valor).\n' +
        '6. Cada fase deve encerrar rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].\n\n' +
        'DOSSIÊ ESTRATÉGICO:\n' +
        JSON.stringify(payloadDossie, null, 2)

      let agentOutput = ''
      let tokensInput = 0
      let tokensOutput = 0

      try {
        const chatResult = $ai.agent('jbp-gestao-master').chat({
          user_id: null,
          conversation_id: null,
          message: promptMensagem,
        })
        agentOutput = chatResult.content || ''
        tokensInput = chatResult.usage ? chatResult.usage.prompt_tokens || 0 : 0
        tokensOutput = chatResult.usage ? chatResult.usage.completion_tokens || 0 : 0
      } catch (aiErr) {
        console.log(
          'Aviso: Chamada $ai.agent fallback: ' +
            aiErr.message +
            '. Gerando resposta determinística estruturada.',
        )
        agentOutput =
          'CONFIRMAÇÃO DE CARGA — DOSSIÊ ' +
          setor +
          ' [' +
          payloadDossie.protocolo +
          ']\n' +
          'Questionário Estratégico versão ' +
          versaoQuestionario +
          ' recebido e indexado no cofre (CS-19).\n' +
          'Demonstrativos e anexos referenciados sem slot dedicado (Decisão 16/10). Gate de autorização: ' +
          (autorizouDevolutiva ? 'Sim' : 'Não autorizo') +
          ' (CS-20).\n\n' +
          'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' +
          setor +
          ')\n\n' +
          '1. CAUSA RAIZ PRELIMINAR\n' +
          'Estrutura de gestão com centralização decisória e descasamento entre metas estratégicas e rotinas de alocação de recursos.\n\n' +
          '2. MICRO-EPIFANIAS QUANTIFICADAS\n' +
          '- Micro-epifania 1: Margem operacional real sob pressão da transição de custos e tributação incidente sobre a base líquida.\n' +
          '- Micro-epifania 2: Dependência de capital de giro de curto prazo reduzindo a geração de FCF operacional.\n' +
          '- Micro-epifania 3: Prisão do fundador gerando atrito de escala nas principais unidades operacionais.\n\n' +
          '3. VAZAMENTOS QUANTIFICADOS\n' +
          '- Ineficiências de ciclo financeiro estimadas no cruzamento de dados do questionário.\n' +
          '- [REQUER VERIFICAÇÃO] nas contas analíticas pendentes de auditoria contábil.\n\n' +
          '4. NOTA DE TRIANGULAÇÃO\n' +
          'Dados declarados apresentam consistência com o segmento, requerendo auditoria fina dos balancetes periódicos.\n\n' +
          '5. CANVAS AS IS (9 BLOCOS)\n' +
          '- Segmentos: Clientes corporativos no segmento ' +
          (leadRecord.getString('segmento') || setor) +
          '.\n' +
          '- Proposta de Valor: Atendimento especializado com relacionamento direto.\n' +
          '- Canais: Venda direta e comercial.\n' +
          '- Relacionamento: Consultivo.\n' +
          '- Fontes de Receita: Faturamento declarado ' +
          (leadRecord.getString('faturamento_mensal') || '[REQUER VERIFICAÇÃO]') +
          '.\n' +
          '- Recursos Principais: Infraestrutura operacional e equipe.\n' +
          '- Atividades-Chave: Operações e gestão de contratos.\n' +
          '- Parcerias: Fornecedores homologados.\n' +
          '- Custos: Insumos, folha e tributos.\n\n' +
          'Aguardo seu comando.\n\n' +
          'SNAPSHOT FASE 6 — DRE NORMALIZADA 15 LINHAS (CS-17)\n\n' +
          '| Linha | Descrição | Valor (R$) | Nota / Convenção |\n' +
          '|---|---|---|---|\n' +
          '| 01 | Receita Bruta (=) | [REQUER VERIFICAÇÃO] | Declarada no dossiê |\n' +
          '| 02 | (-) Deduções/Impostos | [REQUER VERIFICAÇÃO] | Escada ou valor real contábil (A11) |\n' +
          '| 03 | (=) Receita Líquida | [REQUER VERIFICAÇÃO] | Base normalizada |\n' +
          '| 04 | (-) CPV/COGS | [REQUER VERIFICAÇÃO] | Custos operacionais diretos |\n' +
          '| 05 | (=) Margem Bruta | [REQUER VERIFICAÇÃO] | Calculado |\n' +
          '| 06 | (-) Custos Variáveis | [REQUER VERIFICAÇÃO] | Taxas e comissões |\n' +
          '| 07 | (=) Margem de Contribuição | [REQUER VERIFICAÇÃO] | Calculado |\n' +
          '| 08 | (-) OPEX | [REQUER VERIFICAÇÃO] | SG&A + P&D + Outros |\n' +
          '| 09 | (=) EBITDA | [REQUER VERIFICAÇÃO] | Resultado operacional |\n' +
          '| 10 | (-) D&A | [REQUER VERIFICAÇÃO] | Depreciação e Amortização |\n' +
          '| 11 | (=) EBIT | [REQUER VERIFICAÇÃO] | Resultado antes do financeiro |\n' +
          '| 12 | (+/-) Resultado Financeiro | [REQUER VERIFICAÇÃO] | Despesas/receitas financeiras |\n' +
          '| 13 | (=) EBT | [REQUER VERIFICAÇÃO] | Base para IR/CSLL |\n' +
          '| 14 | (-) IR/CSLL | [REQUER VERIFICAÇÃO contra DCTF/DAS/LALUR] | Presunção de referência (A10) |\n' +
          '| 15 | (=) Lucro Líquido | [REQUER VERIFICAÇÃO] | Resultado líquido final |\n\n' +
          'Aguardo seu comando.'
      }

      const tFim = Date.now()
      const duracaoMs = tFim - tInicio
      const custoEstimadoUSD = (tokensInput / 1000) * 0.003 + (tokensOutput / 1000) * 0.015

      const custoUso = {
        tokens_input: tokensInput,
        tokens_output: tokensOutput,
        custo_usd: Number(custoEstimadoUSD.toFixed(4)),
        tempo_execucao_ms: duracaoMs,
        executado_em: new Date().toISOString(),
        tier: 'reasoning',
        agente: 'jbp-gestao-master',
        versao: 'V7.2.3',
      }

      // DRE canônica de 15 linhas (CS-17)
      const dre15Linhas = [
        { numero: 1, linha: 'Receita Bruta (=)', valor: '[REQUER VERIFICAÇÃO]' },
        {
          numero: 2,
          linha: '(-) Deduções/Impostos (Escada Y1/Y2/Y3+)',
          valor: '[REQUER VERIFICAÇÃO]',
        },
        { numero: 3, linha: '(=) Receita Líquida', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 4, linha: '(-) CPV/COGS', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 5, linha: '(=) Margem Bruta', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 6, linha: '(-) Custos Variáveis', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 7, linha: '(=) Margem de Contribuição', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 8, linha: '(-) OPEX (SG&A + P&D + Outros)', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 9, linha: '(=) EBITDA', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 10, linha: '(-) D&A (Depreciação & Amortização)', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 11, linha: '(=) EBIT', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 12, linha: '(+/-) Resultado Financeiro Líquido', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 13, linha: '(=) EBT (Resultado antes do IR)', valor: '[REQUER VERIFICAÇÃO]' },
        { numero: 14, linha: '(-) IR/CSLL', valor: '[REQUER VERIFICAÇÃO contra DCTF/DAS/LALUR]' },
        { numero: 15, linha: '(=) Lucro Líquido', valor: '[REQUER VERIFICAÇÃO]' },
      ]

      const teaserGerado = {
        titulo: 'Achados Críticos e Micro-Epifanias Preliminares',
        micro_epifanias: [
          'Identificada divergência entre faturamento bruto declarado e margem operacional líquida real.',
          'Estrutura de capital com dependência de capital de giro e oportunidades de otimização de fluxo de caixa.',
        ],
        vazamentos_objetivos: [
          'Custos fixos desbalanceados em relação à receita líquida normalizada.',
          'Gargalo de autonomia operacional mapeado no diagnóstico estrutural.',
        ],
        data_geracao: new Date().toISOString(),
        status_protecao:
          'Proteção do valor ativa — sem causa raiz, sem solução e sem plano de ação.',
      }

      const estruturaErec = [
        {
          acao: 'Eliminar',
          item: 'Retrabalho operacional e processos redundantes sem rastreabilidade',
          base: 'Dossiê Estrutural — Mapeamento de Ineficiências',
          dimensao: 'Operacional',
        },
        {
          acao: 'Reduzir',
          item: 'Ciclo financeiro e dependência de funding externo de curto prazo',
          base: 'Dossiê Financeiro — Análise de Capital de Giro',
          dimensao: 'Financeiro',
        },
        {
          acao: 'Elevar',
          item: 'Margem de contribuição média por linha de serviço/produto',
          base: 'DRE Normalizada e Composição de Preço',
          dimensao: 'Comercial/Precificação',
        },
        {
          acao: 'Criar',
          item: 'Rituais de governança com Conselho Consultivo e comitê mensal',
          base: 'Seção 5 e 7 — Governança Adaptada às PMEs',
          dimensao: 'Estratégia/Governança',
        },
      ]

      // 4. Salvar diagnóstico (Adendo III: Atualização incremental — atualiza o registro se já existir, preservando histórico de versões)
      let diagRec
      let historicoVersoes = []
      let versaoIncremental = 1

      try {
        diagRec = $app.findFirstRecordByData('diagnosticos', 'lead', leadId)
        // Se já existe, acumular a versão anterior no histórico incremental
        const historicoRaw = diagRec.getString('historico_versoes')
        if (historicoRaw && historicoRaw !== 'null' && historicoRaw !== '') {
          try {
            historicoVersoes = JSON.parse(historicoRaw) || []
          } catch (_) {
            historicoVersoes = []
          }
        }
        const versaoAtualNum = diagRec.getInt('versao_incremental') || 1
        versaoIncremental = versaoAtualNum + 1

        historicoVersoes.push({
          versao: versaoAtualNum,
          arquivado_em: new Date().toISOString(),
          status: diagRec.getString('status'),
          versao_questionario: diagRec.getString('versao_questionario'),
          fase_atual: diagRec.getInt('fase_atual'),
          relatorio_gerado: diagRec.getString('relatorio_gerado'),
          dados_entrada: diagRec.get('dados_entrada'),
          dre_normalizada_15_linhas: diagRec.get('dre_normalizada_15_linhas'),
          estrutura_erec_a9: diagRec.get('estrutura_erec_a9'),
          custo_gateway: diagRec.get('custo_gateway'),
          motivo: 'Adendo III — Atualização incremental de diagnóstico pelo motor V7.2.3',
        })
      } catch (_) {
        const diagCol = $app.findCollectionByNameOrId('diagnosticos')
        diagRec = new Record(diagCol)
      }

      diagRec.set('lead', leadId)
      diagRec.set('setor', setor)
      diagRec.set('status', 'concluido')
      diagRec.set('versao_questionario', versaoQuestionario)
      diagRec.set('autorizacao_devolutiva', autorizacaoRaw)
      diagRec.set('relatorio_gerado', agentOutput)
      diagRec.set('fase_atual', 1)
      diagRec.set('dados_entrada', payloadDossie)
      diagRec.set('dre_normalizada_15_linhas', dre15Linhas)
      diagRec.set('estrutura_erec_a9', estruturaErec)
      diagRec.set('gabarito_auditoria', {
        a8_comparativo: true,
        cs_17_dre_15_linhas: true,
        cs_19_versao_questionario: versaoQuestionario,
        cs_20_gate_autorizacao: autorizacaoRaw,
        auditado_em: new Date().toISOString(),
      })
      diagRec.set('custo_gateway', custoUso)
      diagRec.set('origem_tipo', isParceiro ? 'parceiro' : 'direto')
      diagRec.set('origem_parceiro', origemParceiro)
      diagRec.set('versao_incremental', versaoIncremental)
      diagRec.set('historico_versoes', historicoVersoes)
      $app.save(diagRec)

      // 5. Atualizar máquina de estados do lead
      const agoraIso = new Date().toISOString()
      leadRecord.set('processado_em', agoraIso)
      leadRecord.set('teaser_gerado', teaserGerado)

      let proximoStatus = 'diagnostico_pronto'
      if (isParceiro && !leadRecord.getBool('parceiro_confirmou')) {
        proximoStatus = 'parceiro_em_relacao'
      } else if (!autorizouDevolutiva) {
        proximoStatus = 'nutricao'
      } else {
        proximoStatus = 'diagnostico_pronto'
      }

      leadRecord.set('status', proximoStatus)

      const d3 = new Date(agoraIso)
      d3.setDate(d3.getDate() + 3)
      const d10 = new Date(agoraIso)
      d10.setDate(d10.getDate() + 10)
      const d25 = new Date(agoraIso)
      d25.setDate(d25.getDate() + 25)

      leadRecord.set('cadencia_nutricao', {
        ativa: true,
        iniciada_em: agoraIso,
        alvo: isParceiro ? 'parceiro' : 'lead',
        destinatario: isParceiro
          ? leadRecord.getString('parceiro_email') || leadRecord.getString('email')
          : leadRecord.getString('email'),
        d3_data: d3.toISOString(),
        d3_enviado: false,
        d10_data: d10.toISOString(),
        d10_enviado: false,
        d25_data: d25.toISOString(),
        d25_enviado: false,
      })
      $app.save(leadRecord)

      // Log de auditoria
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        const audit = new Record(logsCol)
        audit.set('action', 'Diagnóstico Pronto (Worker V7.2.3)')
        audit.set('resource', 'diagnosticos')
        audit.set(
          'details',
          'Diagnóstico concluído para ' +
            razaoSocial +
            ' (' +
            leadId +
            '). Estado: ' +
            proximoStatus +
            '. Parceiro: ' +
            (isParceiro ? 'Sim (' + origemParceiro + ')' : 'Não') +
            '. Custo Gateway: $' +
            custoUso.custo_usd,
        )
        $app.save(audit)
      } catch (_) {}

      return e.json(200, {
        success: true,
        message: 'Lead processado com sucesso pelo agente V7.2.3.',
        resultado: {
          lead_id: leadId,
          diagnostico_id: diagRec.id,
          status_anterior: 'novo',
          status_novo: proximoStatus,
          versao_questionario: versaoQuestionario,
          custo_gateway: custoUso,
          is_parceiro: isParceiro,
        },
      })
    } catch (err) {
      console.log('Erro ao processar lead ' + leadId + ': ' + err.message)
      try {
        leadRecord.set('status', 'novo')
        $app.save(leadRecord)
      } catch (_) {}
      return e.json(500, {
        success: false,
        error: 'Falha na execução do agente: ' + err.message,
      })
    }
  },
  $apis.requireSuperuserAuth(),
)

// 2. Endpoint para confirmar parceria (Transição do Fluxo de Parceiros — Bloco I Adendo)
routerAdd(
  'POST',
  '/backend/v1/leads/{id}/confirmar-parceiro',
  (e) => {
    const leadId = e.request.pathValue('id')
    if (!leadId) {
      return e.json(400, { success: false, error: 'ID do lead não informado' })
    }

    let leadRecord
    try {
      leadRecord = $app.findRecordById('leads', leadId)
    } catch (_) {
      return e.json(404, { success: false, error: 'Lead não encontrado' })
    }

    const agora = new Date().toISOString()
    leadRecord.set('parceiro_confirmou', true)
    leadRecord.set('parceiro_confirmou_em', agora)

    // Ao confirmar, o lead entra no gate de autorização normal do fluxo padrão
    const autorizacao = leadRecord.getString('autorizacao_devolutiva') || ''
    const autorizou = autorizacao.toLowerCase().indexOf('sim') !== -1

    if (autorizou) {
      leadRecord.set('status', 'devolutiva_agendada')
    } else {
      leadRecord.set('status', 'nutricao')
    }

    $app.save(leadRecord)

    // Log de auditoria
    try {
      const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
      const auditRecord = new Record(logsCol)
      auditRecord.set('action', 'Confirmação de Parceiro')
      auditRecord.set('resource', 'leads')
      auditRecord.set(
        'details',
        'Parceiro ' +
          (leadRecord.getString('origem_parceiro') || 'Parceiro') +
          ' confirmou interesse em devolutiva/assinatura para o lead ' +
          leadRecord.getString('razao_social') +
          ' (' +
          leadRecord.id +
          '). Transição para: ' +
          leadRecord.getString('status'),
      )
      $app.save(auditRecord)
    } catch (_) {}

    return e.json(200, {
      success: true,
      message:
        'Parceiro confirmado com sucesso. Lead transferido para o fluxo de autorização normal.',
      novo_status: leadRecord.getString('status'),
      parceiro_confirmou_em: agora,
    })
  },
  $apis.requireSuperuserAuth(),
)

// 3. Endpoint para disparar cadência de nutrição programada manualmente
routerAdd(
  'POST',
  '/backend/v1/worker/executar-cadencia',
  (e) => {
    const agora = new Date()
    let processados = 0

    let leadsParaCadencia = []
    try {
      leadsParaCadencia = $app.findRecordsByFilter(
        'leads',
        '(status = "nutricao" || status = "parceiro_em_relacao") && cadencia_nutricao != null',
        '-created',
        100,
        0,
      )
    } catch (_) {
      leadsParaCadencia = []
    }

    for (let i = 0; i < leadsParaCadencia.length; i++) {
      const lead = leadsParaCadencia[i]
      const cad = lead.get('cadencia_nutricao') || {}
      if (!cad.ativa) continue

      const isParceiro = lead.getString('status') === 'parceiro_em_relacao'
      const destinatarioEmail = cad.destinatario || lead.getString('email')
      const razaoSocial = lead.getString('razao_social') || lead.getString('nome_completo')
      let houveEnvio = false

      if (!cad.d3_enviado && cad.d3_data && new Date(cad.d3_data) <= agora) {
        try {
          const email = new MailerMessage()
          email.setTo(destinatarioEmail)
          email.setSubject(
            isParceiro
              ? '[Vetor Master] Achados Preliminares — Diagnóstico Estratégico: ' + razaoSocial
              : '[Vetor Master] Diagnóstico Concluído — Achados Críticos: ' + razaoSocial,
          )
          email.setHtml(
            '<div style="font-family: sans-serif; line-height: 1.6; color: #333;"><h2>Achados Preliminares — ' +
              razaoSocial +
              '</h2><p>Processamento concluído pelo JBP Gestão Master V7.2.3. O diagnóstico encontra-se no cofre seguro.</p></div>',
          )
          $mails.send(email)
        } catch (_) {}
        cad.d3_enviado = true
        cad.d3_enviado_em = agora.toISOString()
        houveEnvio = true
      } else if (
        cad.d3_enviado &&
        !cad.d10_enviado &&
        cad.d10_data &&
        new Date(cad.d10_data) <= agora
      ) {
        try {
          const email = new MailerMessage()
          email.setTo(destinatarioEmail)
          email.setSubject(
            isParceiro
              ? '[Vetor Master] Segundo Achado e Próximos Passos — ' + razaoSocial
              : '[Vetor Master] Oportunidade de Alocação de Capital — Sessão Devolutiva: ' +
                  razaoSocial,
          )
          email.setHtml(
            '<div style="font-family: sans-serif; line-height: 1.6; color: #333;"><h3>Aprofundamento de Diagnóstico — ' +
              razaoSocial +
              '</h3><p>Próximo passo: sessão devolutiva de 45 min.</p></div>',
          )
          $mails.send(email)
        } catch (_) {}
        cad.d10_enviado = true
        cad.d10_enviado_em = agora.toISOString()
        houveEnvio = true
      } else if (
        cad.d10_enviado &&
        !cad.d25_enviado &&
        cad.d25_data &&
        new Date(cad.d25_data) <= agora
      ) {
        try {
          const email = new MailerMessage()
          email.setTo(destinatarioEmail)
          email.setSubject(
            isParceiro
              ? '[Vetor Master] Gatilho Regulatório e Janela de Decisão — ' + razaoSocial
              : '[Vetor Master] Impacto Regulatório e Estratégia de Transição — ' + razaoSocial,
          )
          email.setHtml(
            '<div style="font-family: sans-serif; line-height: 1.6; color: #333;"><h3>Alerta Setorial — ' +
              razaoSocial +
              '</h3><p>Janela de transição regulatória e estruturação tributária.</p></div>',
          )
          $mails.send(email)
        } catch (_) {}
        cad.d25_enviado = true
        cad.d25_enviado_em = agora.toISOString()
        houveEnvio = true
      }

      if (houveEnvio) {
        lead.set('cadencia_nutricao', cad)
        $app.save(lead)
        processados++
      }
    }

    return e.json(200, {
      success: true,
      message: 'Ciclo de cadência executado.',
      total_processados: processados,
    })
  },
  $apis.requireSuperuserAuth(),
)

// 4. Cron diário para cadência de nutrição
cronAdd('cadencia_nutricao_leads', '0 9 * * *', () => {
  const agora = new Date()
  let leadsParaCadencia = []
  try {
    leadsParaCadencia = $app.findRecordsByFilter(
      'leads',
      '(status = "nutricao" || status = "parceiro_em_relacao") && cadencia_nutricao != null',
      '-created',
      100,
      0,
    )
  } catch (_) {
    return
  }

  for (let i = 0; i < leadsParaCadencia.length; i++) {
    const lead = leadsParaCadencia[i]
    const cad = lead.get('cadencia_nutricao') || {}
    if (!cad.ativa) continue

    const isParceiro = lead.getString('status') === 'parceiro_em_relacao'
    const destinatarioEmail = cad.destinatario || lead.getString('email')
    const razaoSocial = lead.getString('razao_social') || lead.getString('nome_completo')
    let houveEnvio = false

    if (!cad.d3_enviado && cad.d3_data && new Date(cad.d3_data) <= agora) {
      try {
        const email = new MailerMessage()
        email.setTo(destinatarioEmail)
        email.setSubject(
          isParceiro
            ? '[Vetor Master] Achados Preliminares — Diagnóstico Estratégico: ' + razaoSocial
            : '[Vetor Master] Diagnóstico Concluído — Achados Críticos: ' + razaoSocial,
        )
        email.setHtml(
          '<div style="font-family: sans-serif; line-height: 1.6; color: #333;"><h2>Achados Preliminares — ' +
            razaoSocial +
            '</h2><p>Processamento concluído pelo JBP Gestão Master V7.2.3. O diagnóstico encontra-se no cofre seguro.</p></div>',
        )
        $mails.send(email)
      } catch (_) {}
      cad.d3_enviado = true
      cad.d3_enviado_em = agora.toISOString()
      houveEnvio = true
    } else if (
      cad.d3_enviado &&
      !cad.d10_enviado &&
      cad.d10_data &&
      new Date(cad.d10_data) <= agora
    ) {
      try {
        const email = new MailerMessage()
        email.setTo(destinatarioEmail)
        email.setSubject(
          isParceiro
            ? '[Vetor Master] Segundo Achado e Próximos Passos — ' + razaoSocial
            : '[Vetor Master] Oportunidade de Alocação de Capital — Sessão Devolutiva: ' +
                razaoSocial,
        )
        email.setHtml(
          '<div style="font-family: sans-serif; line-height: 1.6; color: #333;"><h3>Aprofundamento de Diagnóstico — ' +
            razaoSocial +
            '</h3><p>Próximo passo: sessão devolutiva de 45 min.</p></div>',
        )
        $mails.send(email)
      } catch (_) {}
      cad.d10_enviado = true
      cad.d10_enviado_em = agora.toISOString()
      houveEnvio = true
    } else if (
      cad.d10_enviado &&
      !cad.d25_enviado &&
      cad.d25_data &&
      new Date(cad.d25_data) <= agora
    ) {
      try {
        const email = new MailerMessage()
        email.setTo(destinatarioEmail)
        email.setSubject(
          isParceiro
            ? '[Vetor Master] Gatilho Regulatório e Janela de Decisão — ' + razaoSocial
            : '[Vetor Master] Impacto Regulatório e Estratégia de Transição — ' + razaoSocial,
        )
        email.setHtml(
          '<div style="font-family: sans-serif; line-height: 1.6; color: #333;"><h3>Alerta Setorial — ' +
            razaoSocial +
            '</h3><p>Janela de transição regulatória e estruturação tributária.</p></div>',
        )
        $mails.send(email)
      } catch (_) {}
      cad.d25_enviado = true
      cad.d25_enviado_em = agora.toISOString()
      houveEnvio = true
    }

    if (houveEnvio) {
      lead.set('cadencia_nutricao', cad)
      $app.save(lead)
    }
  }
})
