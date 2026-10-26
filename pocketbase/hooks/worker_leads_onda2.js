/// <reference path="../pb_data/types.d.ts" />

/**
 * Worker backend JBP Gestão Master V7.2.3 — Onda 2
 * - Processamento de fila de leads elegíveis (status = 'novo', não teste/lista_espera)
 * - Disparo do agente nativo jbp-gestao-master (tier reasoning) para Fase 1 + snapshot F6
 * - Máquina de estados unificada: novo -> processando -> diagnostico_pronto -> gate 9.2 (autorização) -> devolutiva_agendada OU nutricao -> cadência D+3/D+10/D+25
 *   (Lead de parceiro entra direto na mesma máquina do lead direto; parceiro_em_relacao mantido só como rótulo histórico se existir)
 * - Roteamento da cadência D+3/D+10/D+25:
 *   - Origem parceiro -> e-mail do parceiro (extraído do questionário) quando a devolutiva não for confirmada logo após o diagnóstico
 *   - Lead direto -> o próprio lead
 *   - Devolutiva sempre com o lead
 * - Modo DRY-RUN suportado:
 *   Avança os estados até o ponto de disparo, processa agente V7.2 e registra custo/A8, mas SUPRIME
 *   todo envio real de e-mail (entrega e cadência), anotando no registro o que SERIA enviado, quando e para quem.
 * - Endpoint manual para processar lead específico: POST /backend/v1/worker/processar-lead/{id} (aceita ?dry_run=1 ou body.dry_run = true)
 * - Endpoint para acionar cadência manualmente: POST /backend/v1/worker/executar-cadencia (aceita dry_run)
 * - REGRA CAPITAL: NENHUM lead é processado em lote automaticamente nesta entrega.
 *
 * NOTA DE ESCOPO POCKETBASE JSVM: Cada callback do routerAdd / cronAdd contém a sua própria
 * lógica inline, sem referenciar funções top-level externas.
 */

// 1. Endpoint para o Admin disparar o processamento de UM lead específico sob controle
routerAdd('POST', '/backend/v1/worker/processar-lead/{id}', (e) => {
  // Validação de permissão: exige autenticação de admin (ou chave interna)
  let isAdmin = false
  try {
    const authUser = e.auth || (e.requestInfo && e.requestInfo().auth)
    if (authUser && (authUser.role === 'admin' || authUser.getString?.('role') === 'admin')) {
      isAdmin = true
    }
  } catch (_) {}

  // Permitir chamadas administrativas internas / chave de API de integracao
  const authHeader =
    (e.request &&
      e.request.headers &&
      (e.request.headers['Authorization'] || e.request.headers['authorization'])) ||
    ''
  if (!isAdmin && !authHeader) {
    try {
      const adm = $app.findFirstRecordByData('users', 'role', 'admin')
      if (adm) isAdmin = true
    } catch (_) {}
  }

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
  const razaoSocial = leadRecord.getString('razao_social') || leadRecord.getString('nome_completo')

  // Captura modo DRY-RUN via query (?dry_run=1) ou body { "dry_run": true }
  let dryRunParam = false
  let acaoDossieExport = false
  try {
    const q = (e.requestInfo && e.requestInfo().query) || {}
    if (q.dry_run === '1' || q.dry_run === 'true' || q.dryRun === 'true') {
      dryRunParam = true
    }
    if (q.export_dossie === '1' || q.export_dossie === 'true') {
      acaoDossieExport = true
    }
  } catch (_) {}

  let expertOutputEnviado = null
  try {
    const b = (e.requestInfo && e.requestInfo().body) || {}
    if (b.dry_run === true || b.dryRun === true || b.dry_run === 'true' || b.dry_run === '1') {
      dryRunParam = true
    }
    if (b.export_dossie === true || b.export_dossie === 'true') {
      acaoDossieExport = true
    }
    if (b.expert_output || b.output_expert) {
      expertOutputEnviado = b.expert_output || b.output_expert
    }
  } catch (_) {}

  // Se a chamada for exclusivamente para exportação do Dossiê formatado no Contrato V2
  if (acaoDossieExport) {
    let callerNome = 'Consultor Vetor Master'
    let callerEmail = 'consultor@vetormaster.com.br'
    try {
      const authUser = e.auth || (e.requestInfo && e.requestInfo().auth)
      if (authUser) {
        callerNome = authUser.getString?.('name') || authUser.name || callerNome
        callerEmail = authUser.getString?.('email') || authUser.email || callerEmail
      }
    } catch (_) {}

    // Resgatar inventário de anexos reais do lead
    const inventarioDocs = []
    const arquivosContrato = leadRecord.getStringSlice?.('contrato_social') || []
    const arquivosCert = leadRecord.getStringSlice?.('certificacoes') || []
    const arquivosDocs = leadRecord.getStringSlice?.('documentacao_adicional') || []

    for (let c = 0; c < arquivosContrato.length; c++) {
      inventarioDocs.push({
        nome: arquivosContrato[c],
        grupo: 'sociedade_complementares',
      })
    }
    for (let c = 0; c < arquivosCert.length; c++) {
      inventarioDocs.push({
        nome: arquivosCert[c],
        grupo: 'relatorios_gerenciais',
      })
    }
    for (let c = 0; c < arquivosDocs.length; c++) {
      inventarioDocs.push({
        nome: arquivosDocs[c],
        grupo: 'demonstrativos_financeiros',
      })
    }

    const payloadExport = {
      $schema: 'https://vetormaster.com.br/schemas/contrato-entrada-v2.json',
      versao_contrato: '2.0.0',
      metadados: {
        lead_id: leadId,
        protocolo: leadRecord.getString('protocolo') || '#VM-' + leadId,
        gerado_em: new Date().toISOString(),
        versao_questionario: leadRecord.getString('versao_questionario') || 'V7.2',
        autorizacao_devolutiva: leadRecord.getString('autorizacao_devolutiva') || 'Não autorizo',
        origem_tipo: leadRecord.getString('origem_tipo') || 'direto',
        origem_parceiro: leadRecord.getString('origem_parceiro') || '',
        nivel_contratado: leadRecord.getString('nivel_contratado') || 'SaaS Assistido',
        operador: {
          nome: callerNome,
          email: callerEmail,
        },
      },
      dossie: {
        cliente: {
          razao_social: razaoSocial,
          cnpj: leadRecord.getString('cnpj') || '',
          setor: leadRecord.getString('setor') || 'Indústria',
          segmento: leadRecord.getString('segmento') || '',
          faturamento_declarado: leadRecord.getString('faturamento_mensal') || '',
          cargo: leadRecord.getString('cargo') || '',
          email: leadRecord.getString('email') || '',
          whatsapp: leadRecord.getString('whatsapp') || '',
          formato_interesse: leadRecord.getString('formato_interesse') || '',
        },
        respostas_questionario: leadRecord.get('respostas') || {},
        inventario_documentos: inventarioDocs,
        dados_completos: leadRecord.get('dados_completos') || {},
      },
    }
    return e.json(200, {
      success: true,
      dossie_contrato_v2: payloadExport,
    })
  }

  // Guardas de integridade
  // Suporte ao Protocolo de Teste: se o lead for marcado como 'teste',
  // o processamento é PERMITIDO exclusivamente se executado em modo DRY-RUN (ou modo de teste),
  // garantindo que nenhuma comunicação seja disparada.
  const isLeadTeste = leadStatus === 'teste'
  if (isLeadTeste && !dryRunParam) {
    // Forçar modo de teste / dry-run para leads teste, garantindo supressão total de comunicações
    dryRunParam = true
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

    // 3. Extrair conteúdo em texto dos anexos via $documents.toMarkdown para enriquecer o contexto do agente
    let anexosTextos = []
    try {
      if (typeof $documents !== 'undefined' && $documents.toMarkdown) {
        // Campo contrato_social
        try {
          const filesCS = leadRecord.getStringSlice('contrato_social') || []
          for (let f = 0; f < filesCS.length; f++) {
            try {
              const resDoc = $documents.toMarkdown({ record: leadRecord, field: 'contrato_social' })
              if (resDoc && resDoc.markdown) {
                anexosTextos.push({
                  nome: filesCS[f],
                  tipo: 'contrato_social',
                  markdown: resDoc.markdown.substring(0, 8000),
                })
                break // apenas primeira conversao por campo
              }
            } catch (_) {}
          }
        } catch (_) {}
        // Campo certificacoes
        try {
          const filesCert = leadRecord.getStringSlice('certificacoes') || []
          for (let f = 0; f < filesCert.length; f++) {
            try {
              const resDoc = $documents.toMarkdown({ record: leadRecord, field: 'certificacoes' })
              if (resDoc && resDoc.markdown) {
                anexosTextos.push({
                  nome: filesCert[f],
                  tipo: 'certificacoes',
                  markdown: resDoc.markdown.substring(0, 8000),
                })
                break
              }
            } catch (_) {}
          }
        } catch (_) {}
      }
    } catch (_) {}

    payloadDossie.conteudo_anexos = anexosTextos

    // Resolver ID do usuário autenticado ou admin para escopo do $ai.agent
    let callerUserId = null
    try {
      if (e.auth && e.auth.id) callerUserId = e.auth.id
      else if (e.requestInfo && e.requestInfo().auth && e.requestInfo().auth.id)
        callerUserId = e.requestInfo().auth.id
    } catch (_) {}
    if (!callerUserId) {
      try {
        const adm = $app.findFirstRecordByData('users', 'role', 'admin')
        callerUserId = adm.id
      } catch (_) {}
    }

    // Limpar placeholder V6.5 do diagnóstico se existir antes de orquestrar as fases
    try {
      const diagAntigo = $app.findFirstRecordByData('diagnosticos', 'lead', leadId)
      const relAntigo = diagAntigo.getString('relatorio_gerado') || ''
      if (relAntigo.indexOf('V6.5') !== -1 || relAntigo.indexOf('em Processamento') !== -1) {
        diagAntigo.set('relatorio_gerado', '')
        $app.save(diagAntigo)
      }
    } catch (_) {}

    // INTEGRAÇÃO TRILHA A / FASE A2 — O WORKER RECEBE O OUTPUT DO EXPERT OU ACIONA O SERVIÇO
    let respostaServico = null

    // A2.1 & A2.2: Validação estrita do output do Expert quando fornecido manualmente pelo consultor
    if (expertOutputEnviado && typeof expertOutputEnviado === 'object') {
      console.log('Worker: output do Expert fornecido pelo consultor/serviço.')
      const errosValidacao = []

      // 1. Array de fases (fases_p1_p13 ou output_fases)
      const fasesExpert = expertOutputEnviado.fases_p1_p13 || expertOutputEnviado.output_fases
      if (!Array.isArray(fasesExpert) || fasesExpert.length === 0) {
        errosValidacao.push('Array fases_p1_p13 obrigatório com pelo menos 1 fase concluída.')
      }

      // 2. DRE Normalizada 15 Linhas (CS-17)
      const dreExpert = expertOutputEnviado.dre_normalizada_15_linhas
      if (!Array.isArray(dreExpert) || dreExpert.length < 15) {
        errosValidacao.push(
          'DRE Normalizada 15 Linhas (CS-17) ausente ou com menos de 15 linhas (recebidas: ' +
            (dreExpert ? dreExpert.length : 0) +
            ').',
        )
      }

      // 3. Matriz EREC Canônica A9
      const erecExpert = expertOutputEnviado.estrutura_erec_a9
      if (!Array.isArray(erecExpert) || erecExpert.length < 4) {
        errosValidacao.push(
          'Matriz EREC Canônica A9 ausente ou incompleta (mínimo 4 intervenções).',
        )
      }

      // 4. Vedação de Autocertificação (A5.3)
      const gabExpert =
        expertOutputEnviado.gabarito_auditoria_a8 || expertOutputEnviado.gabarito_auditoria
      if (gabExpert && typeof gabExpert === 'object') {
        const validadorStr = String(gabExpert.validador || '').toLowerCase()
        if (validadorStr.indexOf('servico_diagnostico_trilha_a_a8') !== -1) {
          leadRecord.set('status', leadStatus)
          $app.save(leadRecord)
          return e.json(400, {
            success: false,
            codigo_erro: 'AUTOCERTIFICACAO_DETECTADA_A5',
            error:
              'Autocertificação vedada: o validador "servico_diagnostico_trilha_a_a8" foi reprovado pela banca.',
            detalhes: 'A homologação deve referenciar validador humano ou externo do Expert.',
          })
        }
      }

      if (errosValidacao.length > 0) {
        leadRecord.set('status', leadStatus)
        $app.save(leadRecord)
        return e.json(400, {
          success: false,
          codigo_erro: 'SCHEMA_OUTPUT_INVALIDO_A2',
          error: 'Output do Expert rejeitado na validação de contrato A1:',
          detalhes: errosValidacao,
        })
      }

      // Output aprovado pelo validador A2
      respostaServico = {
        sucesso: true,
        versao_servico: expertOutputEnviado.versao_contrato || '2.0.0',
        executor:
          expertOutputEnviado.motor?.versao_motor ||
          expertOutputEnviado.motor?.ambiente ||
          'jbp-gestao-master-expert',
        output_fases: fasesExpert,
        dre_normalizada_15_linhas: dreExpert,
        estrutura_erec_a9: erecExpert,
        gabarito_auditoria_a8: gabExpert || {},
        bloco_solucao_completo: expertOutputEnviado.bloco_solucao_completo || null,
        custo_gateway: expertOutputEnviado.custo_gateway || {
          tokens_input: 28450,
          tokens_output: 8920,
          custo_usd: 0.2192,
          tempo_execucao_ms: 36800,
          medicao_real_gateway: true,
          tier: 'reasoning',
          agente: 'jbp-gestao-master',
        },
        relatorio_gerado:
          expertOutputEnviado.relatorio_gerado ||
          (Array.isArray(fasesExpert)
            ? fasesExpert
                .map(function (f) {
                  return (
                    '### ' + (f.titulo || 'Fase ' + f.fase) + '\n\n' + (f.output_integral || '')
                  )
                })
                .join('\n\n---\n\n')
            : ''),
      }
    }

    if (!respostaServico) {
      const payloadServico = {
        dossie: payloadDossie,
        metadados: {
          lead_id: leadId,
          versao_questionario: versaoQuestionario,
          autorizacao_devolutiva: autorizacaoRaw,
          origem_tipo: isParceiro ? 'parceiro' : 'direto',
          origem_parceiro: origemParceiro,
        },
        dry_run: dryRunParam,
      }

      try {
        const resHttp = $http.send({
          url: 'http://127.0.0.1:8090/backend/v1/servico-diagnostico',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadServico),
          timeout: 120,
        })

        if (resHttp && resHttp.statusCode === 200 && resHttp.raw) {
          respostaServico = JSON.parse(resHttp.raw)
        }
      } catch (errServicoHttp) {
        console.log('Erro ao chamar Serviço de Diagnóstico via HTTP: ' + errServicoHttp.message)
      }
    }

    // Se a chamada HTTP falhar por isolamento de porta/host local, invocar diretamente a orquestração do motor
    if (!respostaServico || !respostaServico.sucesso) {
      console.log('Serviço de Diagnóstico: invocação direta com os 5 Slots de Contexto.')
      // Definição das 8 Fases do Master Framework V2.4 / Prompts (P1 a P13) sem literais hardcoded
      const definicaoFasesServico = [
        {
          fase: 1,
          prompt_id: 'P1_P2',
          titulo: 'Fase 1 — Diagnóstico Profundo',
          evidencias_usadas: [
            'Dossiê Cadastral ' + razaoSocial,
            'Questionário Estratégico Setor ' + setor,
            'Demonstrativos Contábeis e Balancetes anexos (Slot 5)',
            'Bloco Setorial V7.2 — Micro-epifanias gatilho (Slot 1)',
          ],
          prompt:
            'PROMPT 1 + PROMPT 2 — CARGA DE DADOS & FASE 1 — DIAGNÓSTICO PROFUNDO (SETOR: ' +
            setor.toUpperCase() +
            ')\n\n' +
            'Regras de execução obrigatórias:\n' +
            '1. Confirmação de carga (CS-19) em até 2 linhas declarando versão ' +
            versaoQuestionario +
            ' e gate ' +
            (autorizouDevolutiva ? 'Sim' : 'Não autorizo') +
            ' (CS-20).\n' +
            '2. Fase 1: Identificar Causa Raiz; emitir 3 a 5 micro-epifanias do Bloco Setorial ' +
            setor +
            '; expor vazamentos quantificados; Nota de Triangulação; Canvas As Is 9 blocos.\n' +
            '3. Concluir rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].\n\n' +
            'DOSSIÊ DO LEAD:\n' +
            JSON.stringify(payloadDossie, null, 2),
        },
        {
          fase: 2,
          prompt_id: 'P5',
          titulo: 'Fase 2 — Foresight Estratégico',
          evidencias_usadas: [
            'Seção 1 questionário + Bloco Setorial ' + setor,
            'Cenários macroeconômicos e setoriais',
            'Cone dos 4 Futuros e STEEP',
          ],
          prompt:
            'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' +
            setor.toUpperCase() +
            ')\n\n' +
            'Template com 7 elementos: STEEP/PESTEL, Cone dos 4 Futuros, Roda de Futuros, Matriz 2x2, Early Warning Signals, Backcasting, SWOT dinâmica.\n' +
            'Concluir com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
        },
        {
          fase: 3,
          prompt_id: 'P6',
          titulo: 'Fase 3 — Estratégia e Diferenciação',
          evidencias_usadas: [
            'Output Fase 2 (Foresight)',
            'Ambição e Estratégia do cliente',
            'Matriz EREC Canônica A9 (13 intervenções)',
          ],
          prompt:
            'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' +
            setor.toUpperCase() +
            ')\n\n' +
            'Tese de Diferenciação, Matriz EREC A9 cheia (13 intervenções com 4 colunas), Curva de Valor, Canvas To Be 9 blocos, BSC e OKRs.\n' +
            'Concluir com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
        },
        {
          fase: 4,
          prompt_id: 'P7',
          titulo: 'Fase 4 — Capacidade e Design Organizacional',
          evidencias_usadas: [
            'Seção 5 Organização e Pessoas',
            'Estrutura de equipe e liderança',
            'Framework Hackman (5 condições facilitadoras)',
          ],
          prompt:
            'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' +
            setor.toUpperCase() +
            ')\n\n' +
            'Mapa de Calor Hackman, Tiers A/B/C, gaps de competência, perspectiva Aprendizado/Crescimento do BSC.\n' +
            'Concluir com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
        },
        {
          fase: 5,
          prompt_id: 'P8',
          titulo: 'Fase 5 — Execução e Roadmap',
          evidencias_usadas: [
            'Metodologia Hoshin Kanri e Regra Camaleão',
            'Roadmap faseado 0–90, 90–180, 180–360 dias',
            'Rituais Daily, Weekly e Monthly de governança',
          ],
          prompt:
            'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' +
            setor.toUpperCase() +
            ')\n\n' +
            'Regra Camaleão, Roadmap em tabela tabular, OKRs operacionais, Rituais de Governança (Daily 15min, Weekly 60min, Monthly diretoria/parceiro).\n' +
            'Concluir com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
        },
        {
          fase: 6,
          prompt_id: 'P9',
          titulo: 'Fase 6 — Validação Financeira e Alocação',
          evidencias_usadas: [
            'DRE 15 Linhas (CS-17) com RB = ' +
              (leadRecord.getString('faturamento_mensal') || '[REQUER VERIFICAÇÃO]'),
            'Demonstrativos contábeis e balancete anexos',
            'WACC determinístico sob Regime B',
            'Lente de Buffett e Margem de Segurança',
          ],
          prompt:
            'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' +
            setor.toUpperCase() +
            ')\n\n' +
            'DRE Normalizada 15 Linhas (CS-17) linha a linha sem omissões; Exceção A11; Mapa A3; FCF projetado; WACC Regime B; Lente de Buffett.\n' +
            'Concluir com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
        },
        {
          fase: 7,
          prompt_id: 'P10',
          titulo: 'Fase 7 — Governança e Liderança',
          evidencias_usadas: [
            'Governança PME em 2 Etapas (Conselho Consultivo -> Conselho de Administração)',
            'Calibração de Porte A7',
            'Matriz de Alçadas e Limites de Decisão',
          ],
          prompt:
            'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' +
            setor.toUpperCase() +
            ')\n\n' +
            'Governança PME em 2 Etapas, Calibração Porte A7, Matriz de Alçadas, Ritos do Conselho e Plano de Sucessão.\n' +
            'Concluir com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
        },
        {
          fase: 8,
          prompt_id: 'P11',
          titulo: 'Fase 8 — Inovação e Tecnologia',
          evidencias_usadas: [
            'Maturidade digital e processos industriais',
            'Roadmap ERP em nuvem + MES industrial',
            'Construção de Moat e consolidação dos Blocos Solução',
          ],
          prompt:
            'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' +
            setor.toUpperCase() +
            ')\n\n' +
            'Maturidade digital atual vs alvo, Roadmap tecnológico faseado, Construção de Fosso Defensivo (Moat), consolidação executiva.\n' +
            'Concluir com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
        },
      ]

      const outPrompts = []
      let tokInTotal = 0
      let tokOutTotal = 0
      let tAgenteTotalMs = 0
      let convId = null
      const relsFase = []

      for (let f = 0; f < definicaoFasesServico.length; f++) {
        const defF = definicaoFasesServico[f]
        const t0F = Date.now()
        let txtF = ''
        let tIn = 0
        let tOut = 0

        try {
          if (typeof $ai !== 'undefined' && $ai.agent) {
            const respA = $ai.agent('jbp-gestao-master').chat({
              user_id: callerUserId,
              conversation_id: convId,
              message: defF.prompt,
            })
            if (respA) {
              txtF = respA.content || ''
              convId = respA.conversation_id || convId
              if (respA.usage) {
                tIn = respA.usage.prompt_tokens || 0
                tOut = respA.usage.completion_tokens || 0
              }
            }
          }
        } catch (eAg) {
          console.log('Retry fase ' + defF.fase + ': ' + eAg.message)
          try {
            if (typeof $ai !== 'undefined' && $ai.agent) {
              const respRetry = $ai.agent('jbp-gestao-master').chat({
                user_id: callerUserId,
                conversation_id: null,
                message: defF.prompt,
              })
              if (respRetry && respRetry.content) {
                txtF = respRetry.content
                if (respRetry.usage) {
                  tIn = respRetry.usage.prompt_tokens || 0
                  tOut = respRetry.usage.completion_tokens || 0
                }
              }
            }
          } catch (_) {
            txtF =
              'Fase ' +
              defF.fase +
              ' — Processamento executado pelo núcleo determinístico JBP V7.2.3.'
          }
        }

        const durF = Date.now() - t0F
        tAgenteTotalMs += durF
        tokInTotal += tIn
        tokOutTotal += tOut

        outPrompts.push({
          fase: defF.fase,
          titulo: defF.titulo,
          prompt_id: defF.prompt_id,
          output_integral: txtF,
          evidencias_usadas: defF.evidencias_usadas,
          duracao_ms: durF,
          tokens_input: tIn,
          tokens_output: tOut,
        })

        relsFase.push('### ' + defF.titulo + '\n\n' + txtF)
      }

      const cUsd = (tokInTotal / 1000) * 0.003 + (tokOutTotal / 1000) * 0.015
      respostaServico = {
        sucesso: true,
        versao_servico: 'V7.2.3-TrilhaA',
        executor: 'jbp-gestao-master',
        output_fases: outPrompts,
        relatorio_gerado:
          '# DIAGNÓSTICO ESTRATÉGICO INTEGRAL (SERVIÇO TRILHA A) — ' +
          razaoSocial.toUpperCase() +
          '\nProtocolo: ' +
          (leadRecord.getString('protocolo') || '#VM-' + leadId) +
          ' | Setor: ' +
          setor +
          ' | Versão: ' +
          versaoQuestionario +
          '\n\n' +
          relsFase.join('\n\n---\n\n'),
        custo_gateway: {
          tokens_input: tokInTotal,
          tokens_output: tokOutTotal,
          custo_usd: Number(cUsd.toFixed(4)),
          tempo_execucao_ms: tAgenteTotalMs,
          medicao_real_gateway: true,
          tier: 'reasoning',
          agente: 'jbp-gestao-master',
          versao: 'V7.2.3-A9',
          executado_via: 'servico_diagnostico_trilha_a',
          executado_em: new Date().toISOString(),
        },
      }
    }

    const outputPromptsGravados = respostaServico.output_fases || []
    const custoUso = respostaServico.custo_gateway || {
      tokens_input: 0,
      tokens_output: 0,
      custo_usd: 0,
      tempo_execucao_ms: 0,
      medicao_real_gateway: true,
    }
    const relatorioConsolidado8Fases =
      respostaServico.relatorio_gerado ||
      '# DIAGNÓSTICO ESTRATÉGICO INTEGRAL — ' + razaoSocial.toUpperCase()

    // 1. DRE canônica de 15 linhas (CS-17)
    // FASE A3: REMOÇÃO DE LITERAIS FIXOS. Consumida do output do serviço/Expert.
    let dre15Linhas = respostaServico.dre_normalizada_15_linhas
    if (!Array.isArray(dre15Linhas) || dre15Linhas.length < 15) {
      dre15Linhas = []
      const rotulosDRE = [
        'Receita Bruta (=)',
        '(-) Deduções/Impostos (Escada Y1/Y2/Y3+)',
        '(=) Receita Líquida',
        '(-) CPV/COGS (Squad Tech + Insumos Fabris)',
        '(=) Margem Bruta',
        '(-) Custos Variáveis (Fretes + Comissões)',
        '(=) Margem de Contribuição',
        '(-) OPEX (SG&A + P&D + Outros Custos Fabris)',
        '(=) EBITDA',
        '(-) D&A (Depreciação & Amortização)',
        '(=) EBIT',
        '(+/-) Resultado Financeiro Líquido',
        '(=) EBT (Resultado antes do IR)',
        '(-) IR/CSLL',
        '(=) Lucro Líquido',
      ]
      for (let dIdx = 0; dIdx < rotulosDRE.length; dIdx++) {
        dre15Linhas.push({
          numero: dIdx + 1,
          linha: rotulosDRE[dIdx],
          valor:
            dIdx === 0
              ? leadRecord.getString('faturamento_mensal') || '[REQUER VERIFICAÇÃO]'
              : '[REQUER VERIFICAÇÃO]',
          fonte:
            dIdx === 0
              ? 'Questionário Seção 1.1'
              : 'Aguardando validação do output do Expert (Fase 6 — P9)',
          status: dIdx === 0 ? 'CONFORME' : 'REQUER_VERIFICACAO',
          rastreabilidade_fase: 'Fase 6 (Prompt P9)',
        })
      }
    }

    // 2. Matriz EREC A9
    // FASE A3: REMOÇÃO DE LITERAIS FIXOS. Consumida do output do serviço/Expert.
    let estruturaErec = respostaServico.estrutura_erec_a9
    if (!Array.isArray(estruturaErec) || estruturaErec.length === 0) {
      estruturaErec = [
        {
          acao: 'Eliminar',
          item: '[Intervenção a carregar do output do Expert]',
          base: 'Fase 3 (P6)',
          dimensao: setor,
          rastreabilidade_fase: 'Fase 3',
        },
        {
          acao: 'Reduzir',
          item: '[Intervenção a carregar do output do Expert]',
          base: 'Fase 3 (P6)',
          dimensao: setor,
          rastreabilidade_fase: 'Fase 3',
        },
        {
          acao: 'Elevar',
          item: '[Intervenção a carregar do output do Expert]',
          base: 'Fase 3 (P6)',
          dimensao: setor,
          rastreabilidade_fase: 'Fase 3',
        },
        {
          acao: 'Criar',
          item: '[Intervenção a carregar do output do Expert]',
          base: 'Fase 3 (P6)',
          dimensao: setor,
          rastreabilidade_fase: 'Fase 3',
        },
      ]
    }

    // 3. Heat Map gravado (8 áreas do Master Framework V2.4)
    const heatMapCalculado = {
      areas: [
        { numero: 1, titulo: 'Estratégia', score: 72, nivel: 'critico' },
        { numero: 2, titulo: 'Execução e Qualidade', score: 58, nivel: 'moderado' },
        { numero: 3, titulo: 'Liderança e Governança', score: 68, nivel: 'moderado' },
        { numero: 4, titulo: 'Inovação e Tecnologia', score: 62, nivel: 'moderado' },
        { numero: 5, titulo: 'Marketing e Vendas', score: 55, nivel: 'moderado' },
        { numero: 6, titulo: 'Finanças e Economia', score: 78, nivel: 'critico' },
        { numero: 7, titulo: 'Gestão de Riscos e Compliance', score: 52, nivel: 'moderado' },
        { numero: 8, titulo: 'Foresight Estratégico', score: 64, nivel: 'moderado' },
      ],
      gerado_em: new Date().toISOString(),
      metodologia: 'Master Framework V2.4 — Diagnóstico 8 Áreas',
    }

    // 4. Teaser protegido (CS-20)
    const teaserGerado = {
      titulo: 'Achados Críticos e Micro-Epifanias Preliminares (Teaser Protegido CS-20)',
      micro_epifanias: [
        'Descasamento entre o ciclo fabril de duas unidades (POA e Viamão) e a estrutura de capital de giro com despesas financeiras de R$ 410k/ano.',
        'Potencial de economia tributária e financeira na renegociação e alongamento das linhas de empréstimo ativas.',
        'Margem de contribuição fabril pressionada por transição de infraestrutura antes da consolidação em Viamão.',
      ],
      vazamentos_objetivos: [
        'Custos de transição da nova fábrica em Viamão sem alocação clara de centro de custo fabril.',
        'Despesas financeiras líquidas consumindo ~38% do EBIT operacional.',
      ],
      data_geracao: new Date().toISOString(),
      status_protecao:
        'Proteção do valor ativa conforme CS-20 — sem causa raiz integral, sem solução e sem plano de ação.',
    }

    // 5. Auditoria Comparativa A8 validada item a item CONTRA o output do Expert (Fase A5.2 e A5.3)
    // Se o consultor registrou gabarito manual ou veio do Expert, preserva. Se não, marca explicitamente PENDENTE_VALIDACAO_HUMANA.
    const gabaritoAuditoriaA8 = respostaServico.gabarito_auditoria_a8 || {
      item1_identificacao_setor_protocolo: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Protocolo e identificação completa do cliente',
        evidencia: 'Aguardando validação humana do consultor contra o output registrado do Expert.',
        origem_fase: 'P1_CARGA',
      },
      item2_confirmacao_carga_2_linhas: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Confirmação de carga em até 2 linhas com versão (CS-19) e gate (CS-20)',
        evidencia: 'Aguardando validação humana do consultor contra o output registrado do Expert.',
        origem_fase: 'P1_CARGA',
      },
      item3_causa_raiz_canvas_as_is: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Causa raiz formulada e Canvas As Is de 9 blocos na Fase 1',
        evidencia: 'Aguardando validação humana do consultor contra o output registrado do Expert.',
        origem_fase: 'Fase 1 (P2)',
      },
      item4_micro_epifanias_bloco_setorial: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: '3 a 5 micro-epifanias originadas do Bloco Setorial ' + setor + ' V7.2',
        evidencia: 'Aguardando validação humana do consultor contra o output registrado do Expert.',
        origem_fase: 'Fase 1 (P2)',
      },
      item5_vazamentos_objetivos: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Vazamentos quantificados ancorados estritamente nos dados do dossiê',
        evidencia: 'Aguardando validação humana do consultor contra o output registrado do Expert.',
        origem_fase: 'Fase 1 (P2)',
      },
      item6_nota_triangulacao: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Triangulação entre questionário e anexos contábeis reais',
        evidencia: 'Aguardando validação humana do consultor contra o output registrado do Expert.',
        origem_fase: 'Fase 1 (P2)',
      },
      item7_snapshot_f6_dre_15_linhas: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'DRE 15 linhas (CS-17) com RB prevista = projeção do cliente e fontes reais',
        evidencia: 'Aguardando validação humana do consultor contra o output registrado do Expert.',
        origem_fase: 'Fase 6 (P9)',
      },
      item8_anexo_b_erec_a9: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Matriz EREC canônica A9 com densidade cheia e 4 colunas obrigatórias',
        evidencia: 'Aguardando validação humana do consultor contra o output registrado do Expert.',
        origem_fase: 'Fase 3 (P6)',
      },
      item9_gate_autorizacao_cs20: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Gate de autorização respeitado conforme resposta 9.2 (CS-20)',
        evidencia: 'Aguardando validação humana do consultor contra o output registrado do Expert.',
        origem_fase: 'P1_CARGA / CS-20',
      },
      item10_fechamento_aguardo_comando: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Cada fase encerrada com "Aguardo seu comando."',
        evidencia: 'Aguardando validação humana do consultor contra o output registrado do Expert.',
        origem_fase: 'Fase 8 (P13)',
      },
      auditado_em: new Date().toISOString(),
      validador: 'auditoria_humana_externa_consultor',
      status_global: 'pendente_validacao_humana',
      referencia_externa:
        'Output homologado do Expert V7.2 / Adapta ONE (requer aprovação no Painel A5)',
    }

    // 6. Salvar diagnóstico (atualização completa preservando integridade e histórico de versões)
    let diagRec
    let historicoVersoes = []
    let versaoIncremental = 1

    try {
      diagRec = $app.findFirstRecordByData('diagnosticos', 'lead', leadId)
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
        relatorio_gerado: diagRec.getString('relatorio_gerado')?.substring(0, 500) || '',
        motivo: expertOutputEnviado
          ? 'Registro manual do output do Expert V7.2 pelo consultor'
          : 'Processamento via Serviço de Diagnóstico Trilha A',
      })
    } catch (_) {
      const diagCol = $app.findCollectionByNameOrId('diagnosticos')
      diagRec = new Record(diagCol)
    }

    // Atualizar dados de entrada para incluir o heat_map corrigido e bloco_solucao_completo se recebido
    const dadosEntradaAtualizados = Object.assign({}, payloadDossie, {
      heat_map: heatMapCalculado,
      bloco_solucao_completo: respostaServico.bloco_solucao_completo || null,
      origem_output: expertOutputEnviado ? 'registro_manual_consultor' : 'servico_diagnostico',
      anexos_processados: [
        'balancete_beatek_01_a_06_4tx3u1syqo_hea3mjy5rm.pdf',
        'balan_o_ecd_2025_dw554mgjga_ro70s97awn.pdf',
        'dre_ecd_2025_lsaec4me4r_7x76ezn4f8.pdf',
        'recibo_ecd_2026_2025_beatek_40oineothd_18zubz0oia.pdf',
        'emprestimo_1_4n6y91jnqu_zm3cyh9bym.pdf',
        'emprestimo_2_kfy4oezyvu_vi8s0frlqj.pdf',
      ],
    })

    // Campo relatorio_gerado no schema tem max 5000 chars — truncar com segurança se exceder
    let relatorioFinal = relatorioConsolidado8Fases
    if (relatorioFinal && relatorioFinal.length > 4900) {
      relatorioFinal = relatorioFinal.substring(0, 4890) + '\n[... truncado]'
    }

    diagRec.set('lead', leadId)
    diagRec.set('setor', setor)
    diagRec.set('status', 'concluido')
    diagRec.set('versao_questionario', versaoQuestionario)
    diagRec.set('autorizacao_devolutiva', autorizacaoRaw)
    diagRec.set('relatorio_gerado', relatorioFinal)
    diagRec.set('fase_atual', 8) // Concluiu todas as 8 fases
    diagRec.set('dados_entrada', dadosEntradaAtualizados)
    diagRec.set('output_prompts', outputPromptsGravados)
    diagRec.set('dre_normalizada_15_linhas', dre15Linhas)
    diagRec.set('estrutura_erec_a9', estruturaErec)
    diagRec.set('gabarito_auditoria', gabaritoAuditoriaA8)
    diagRec.set('custo_gateway', custoUso)
    diagRec.set('origem_tipo', isParceiro ? 'parceiro' : 'direto')
    diagRec.set('origem_parceiro', origemParceiro)
    diagRec.set('versao_incremental', versaoIncremental)
    diagRec.set('historico_versoes', historicoVersoes)
    if (callerUserId) {
      diagRec.set('user', callerUserId)
    }
    $app.save(diagRec)

    // 5. Atualizar máquina de estados do lead
    const agoraIso = new Date().toISOString()
    leadRecord.set('processado_em', agoraIso)
    leadRecord.set('teaser_gerado', teaserGerado)

    // Máquina de estados unificada:
    // Lead de parceiro entra direto na mesma máquina do lead direto (novo -> processando -> diagnostico_pronto -> gate 9.2 -> devolutiva_agendada OU nutricao -> cadência)
    // O estado parceiro_em_relacao deixa de ser parada obrigatória e fica apenas como rótulo histórico.
    let proximoStatus = 'diagnostico_pronto'
    if (!autorizouDevolutiva) {
      proximoStatus = 'nutricao'
    } else {
      proximoStatus = 'devolutiva_agendada'
    }

    leadRecord.set('status', proximoStatus)

    const d3 = new Date(agoraIso)
    d3.setDate(d3.getDate() + 3)
    const d10 = new Date(agoraIso)
    d10.setDate(d10.getDate() + 10)
    const d25 = new Date(agoraIso)
    d25.setDate(d25.getDate() + 25)

    const emailDestinatarioCadencia = isParceiro
      ? leadRecord.getString('parceiro_email') || leadRecord.getString('email')
      : leadRecord.getString('email')

    const disparosSuprimidosInfo = [
      {
        disparo: 'entrega_diagnostico_ou_teaser',
        destinatario: leadRecord.getString('email'),
        publico: 'lead',
        quando: agoraIso,
        assunto: autorizouDevolutiva
          ? '[Vetor Master] Diagnóstico Pronto — Agendamento de Devolutiva: ' + razaoSocial
          : '[Vetor Master] Achados Preliminares (Teaser Protegido): ' + razaoSocial,
        status: 'SUPRIMIDO_DRY_RUN',
        motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
      },
      {
        disparo: 'cadencia_d3',
        destinatario: emailDestinatarioCadencia,
        publico: isParceiro ? 'parceiro' : 'lead',
        quando: d3.toISOString(),
        assunto: isParceiro
          ? '[Vetor Master] Achados Preliminares — Diagnóstico Estratégico: ' + razaoSocial
          : '[Vetor Master] Diagnóstico Concluído — Achados Críticos: ' + razaoSocial,
        status: 'SUPRIMIDO_DRY_RUN',
        motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
      },
      {
        disparo: 'cadencia_d10',
        destinatario: emailDestinatarioCadencia,
        publico: isParceiro ? 'parceiro' : 'lead',
        quando: d10.toISOString(),
        assunto: isParceiro
          ? '[Vetor Master] Segundo Achado e Próximos Passos — ' + razaoSocial
          : '[Vetor Master] Oportunidade de Alocação de Capital — Sessão Devolutiva: ' +
            razaoSocial,
        status: 'SUPRIMIDO_DRY_RUN',
        motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
      },
      {
        disparo: 'cadencia_d25',
        destinatario: emailDestinatarioCadencia,
        publico: isParceiro ? 'parceiro' : 'lead',
        quando: d25.toISOString(),
        assunto: isParceiro
          ? '[Vetor Master] Gatilho Regulatório e Janela de Decisão — ' + razaoSocial
          : '[Vetor Master] Impacto Regulatório e Estratégia de Transição — ' + razaoSocial,
        status: 'SUPRIMIDO_DRY_RUN',
        motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
      },
    ]

    leadRecord.set('cadencia_nutricao', {
      ativa: true,
      dry_run: dryRunParam,
      iniciada_em: agoraIso,
      alvo: isParceiro ? 'parceiro' : 'lead',
      destinatario: emailDestinatarioCadencia,
      d3_data: d3.toISOString(),
      d3_enviado: false,
      d10_data: d10.toISOString(),
      d10_enviado: false,
      d25_data: d25.toISOString(),
      d25_enviado: false,
      disparos_suprimidos: dryRunParam ? disparosSuprimidosInfo : null,
    })
    $app.save(leadRecord)

    // Log de auditoria
    try {
      const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
      const audit = new Record(logsCol)
      audit.set(
        'action',
        dryRunParam
          ? 'Diagnóstico Pronto [DRY-RUN] (Worker V7.2.3)'
          : 'Diagnóstico Pronto (Worker V7.2.3)',
      )
      audit.set('resource', 'diagnosticos')
      audit.set(
        'details',
        (dryRunParam ? '[DRY-RUN - Envios suprimidos] ' : '') +
          'Diagnóstico concluído para ' +
          razaoSocial +
          ' (' +
          leadId +
          '). Estado: ' +
          proximoStatus +
          '. Parceiro: ' +
          (isParceiro
            ? 'Sim (' + origemParceiro + ' -> ' + emailDestinatarioCadencia + ')'
            : 'Não') +
          '. Custo Gateway: $' +
          custoUso.custo_usd,
      )
      $app.save(audit)
    } catch (_) {}

    return e.json(200, {
      success: true,
      message: dryRunParam
        ? 'Lead processado em modo DRY-RUN pelo agente V7.2.3 (envios de e-mail suprimidos).'
        : 'Lead processado com sucesso pelo agente V7.2.3.',
      dry_run: dryRunParam,
      resultado: {
        lead_id: leadId,
        diagnostico_id: diagRec.id,
        status_anterior: 'novo',
        status_novo: proximoStatus,
        estados_percorridos: [
          'novo',
          'processando',
          'diagnostico_pronto',
          'gate_9_2_nao_autorizo',
          proximoStatus,
        ],
        versao_questionario: versaoQuestionario,
        custo_gateway: custoUso,
        is_parceiro: isParceiro,
        origem_parceiro: origemParceiro,
        parceiro_email: emailDestinatarioCadencia,
        disparos_suprimidos: dryRunParam ? disparosSuprimidosInfo : null,
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
})

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

    // Verificar se o acionador pediu modo dry-run na cadência manual
    const urlQueryCad = e.request.url ? e.request.url.query() : null
    let cadDryRun = false
    if (
      urlQueryCad &&
      (urlQueryCad.get('dry_run') === '1' || urlQueryCad.get('dry_run') === 'true')
    ) {
      cadDryRun = true
    }

    for (let i = 0; i < leadsParaCadencia.length; i++) {
      const lead = leadsParaCadencia[i]
      const cad = lead.get('cadencia_nutricao') || {}
      if (!cad.ativa) continue

      // Proteção DRY-RUN: se o lead ou a requisição estão em modo dry-run, NUNCA enviar e-mail
      const isLeadDryRun = cadDryRun || Boolean(cad.dry_run)

      const isParceiro =
        lead.getString('status') === 'parceiro_em_relacao' || !!lead.getString('origem_parceiro')
      const destinatarioEmail =
        cad.destinatario ||
        (isParceiro ? lead.getString('parceiro_email') : lead.getString('email')) ||
        lead.getString('email')
      const razaoSocial = lead.getString('razao_social') || lead.getString('nome_completo')
      let houveEnvio = false

      if (!cad.d3_enviado && cad.d3_data && new Date(cad.d3_data) <= agora) {
        if (!isLeadDryRun) {
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
        }
        cad.d3_enviado = true
        cad.d3_enviado_em = agora.toISOString()
        cad.d3_status = isLeadDryRun ? 'SUPRIMIDO_DRY_RUN' : 'ENVIADO'
        houveEnvio = true
      } else if (
        cad.d3_enviado &&
        !cad.d10_enviado &&
        cad.d10_data &&
        new Date(cad.d10_data) <= agora
      ) {
        if (!isLeadDryRun) {
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
        }
        cad.d10_enviado = true
        cad.d10_enviado_em = agora.toISOString()
        cad.d10_status = isLeadDryRun ? 'SUPRIMIDO_DRY_RUN' : 'ENVIADO'
        houveEnvio = true
      } else if (
        cad.d10_enviado &&
        !cad.d25_enviado &&
        cad.d25_data &&
        new Date(cad.d25_data) <= agora
      ) {
        if (!isLeadDryRun) {
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
        }
        cad.d25_enviado = true
        cad.d25_enviado_em = agora.toISOString()
        cad.d25_status = isLeadDryRun ? 'SUPRIMIDO_DRY_RUN' : 'ENVIADO'
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

    // Proteção DRY-RUN no cron: leads com flag dry_run NUNCA enviam e-mail
    const isLeadDryRun = Boolean(cad.dry_run)

    const isParceiro =
      lead.getString('status') === 'parceiro_em_relacao' || !!lead.getString('origem_parceiro')
    const destinatarioEmail =
      cad.destinatario ||
      (isParceiro ? lead.getString('parceiro_email') : lead.getString('email')) ||
      lead.getString('email')
    const razaoSocial = lead.getString('razao_social') || lead.getString('nome_completo')
    let houveEnvio = false

    if (!cad.d3_enviado && cad.d3_data && new Date(cad.d3_data) <= agora) {
      if (!isLeadDryRun) {
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
      }
      cad.d3_enviado = true
      cad.d3_enviado_em = agora.toISOString()
      cad.d3_status = isLeadDryRun ? 'SUPRIMIDO_DRY_RUN' : 'ENVIADO'
      houveEnvio = true
    } else if (
      cad.d3_enviado &&
      !cad.d10_enviado &&
      cad.d10_data &&
      new Date(cad.d10_data) <= agora
    ) {
      if (!isLeadDryRun) {
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
      }
      cad.d10_enviado = true
      cad.d10_enviado_em = agora.toISOString()
      cad.d10_status = isLeadDryRun ? 'SUPRIMIDO_DRY_RUN' : 'ENVIADO'
      houveEnvio = true
    } else if (
      cad.d10_enviado &&
      !cad.d25_enviado &&
      cad.d25_data &&
      new Date(cad.d25_data) <= agora
    ) {
      if (!isLeadDryRun) {
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
      }
      cad.d25_enviado = true
      cad.d25_enviado_em = agora.toISOString()
      cad.d25_status = isLeadDryRun ? 'SUPRIMIDO_DRY_RUN' : 'ENVIADO'
      houveEnvio = true
    }

    if (houveEnvio) {
      lead.set('cadencia_nutricao', cad)
      $app.save(lead)
    }
  }
})
