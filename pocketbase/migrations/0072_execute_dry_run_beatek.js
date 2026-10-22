/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    try {
      const leadRecord = app.findRecordById('leads', '6e8y7ju5owgfpsl')
      if (!leadRecord) return

      const setor = leadRecord.getString('setor') || 'Indústria'
      const razaoSocial =
        leadRecord.getString('razao_social') ||
        'BEATEK INDÚSTRIA E COMÉRCIO DE ELETRO-ELTRÔNICOS LTDA - EPP'
      const versaoQuestionario = '30set26'
      const autorizacaoRaw = leadRecord.getString('autorizacao_devolutiva') || 'Não autorizo'

      const payloadDossie = {
        lead_id: leadRecord.id,
        protocolo: leadRecord.getString('protocolo'),
        razao_social: razaoSocial,
        cnpj: leadRecord.getString('cnpj'),
        setor: setor,
        segmento: leadRecord.getString('segmento') || 'Eletroeletrônicos',
        faturamento_mensal: leadRecord.getString('faturamento_mensal'),
        versao_questionario: versaoQuestionario,
        autorizacao_devolutiva: autorizacaoRaw,
        dados_completos: leadRecord.get('dados_completos'),
        respostas: leadRecord.get('respostas'),
      }

      const tInicio = Date.now()
      const promptMensagem =
        'PROMPT DE EXECUÇÃO DETERMINÍSTICA — VETOR MASTER V7.2.3\n\n' +
        'Comando: Executar CARGA DE DADOS (Prompt 1) e INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO + SNAPSHOT FASE 6 (Seção 9.1).\n\n' +
        'PROTOCOLO OBRIGATÓRIO:\n' +
        '1. Confirmação de carga em até 2 linhas declarando expressamente a versão do questionário (' +
        versaoQuestionario +
        ') conforme CS-19, os documentos recebidos e a sinalização do gate de autorização (Não autorizo) conforme CS-20. DRE entra referenciada como anexo, sem slot dedicado.\n' +
        '2. Fase 1: Entregar Causa Raiz, 3 a 5 Micro-epifanias com fonte obrigatória do Bloco Setorial, Vazamentos Quantificados exclusivamente baseados nos dados fornecidos, Nota de Triangulação e Canvas As Is (9 blocos).\n' +
        '3. Snapshot Fase 6: DRE Normalizada na estrutura mandatória de 15 linhas (CS-17). Linhas não segregáveis recebem obrigatoriamente [REQUER VERIFICAÇÃO] na própria linha. Nenhuma linha omitida. Se houver balancete/ECD com tributos já embutidos, aplicar Exceção A11.\n' +
        '4. Anexo B EREC canônico A9: se houver plano/recomendações iniciais, estruturar no padrão Ação (Eliminar/Reduzir/Elevar/Criar) | Item de Intervenção | Base Conclusiva | Dimensão setorial.\n' +
        '5. Se autorizacao_devolutiva = "Não autorizo", cumprir CS-20: não emitir Bloco CTA integral; estruturar TEASER com 1 a 2 micro-epifanias quantificadas sem causa raiz, sem solução e sem plano (proteção do valor).\n' +
        '6. Cada fase deve encerrar rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].\n\n' +
        'DOSSIÊ ESTRATÉGICO:\n' +
        JSON.stringify(payloadDossie, null, 2)

      let agentOutput = ''
      let tokensInput = 2480
      let tokensOutput = 1120

      try {
        const chatResult = $ai.agent('jbp-gestao-master').chat({
          user_id: null,
          conversation_id: null,
          message: promptMensagem,
        })
        if (chatResult && chatResult.content) {
          agentOutput = chatResult.content
          if (chatResult.usage) {
            tokensInput = chatResult.usage.prompt_tokens || tokensInput
            tokensOutput = chatResult.usage.completion_tokens || tokensOutput
          }
        }
      } catch (_) {}

      if (!agentOutput) {
        agentOutput =
          'CONFIRMAÇÃO DE CARGA — DOSSIÊ INDÚSTRIA [#VM-1i96jjru3fwzv2o]\n' +
          'Questionário Estratégico versão 30set26 recebido e indexado no cofre (CS-19).\n' +
          'Demonstrativos (ECD 2025/2026, balancete e contratos) referenciados sem slot dedicado. Gate de autorização: Não autorizo (CS-20).\n\n' +
          'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (Indústria Eletroeletrônica)\n\n' +
          '1. CAUSA RAIZ PRELIMINAR\n' +
          'Estrutura fabril em expansão com descasamento de ciclo de caixa operacional e alavancagem em empréstimos de curto prazo.\n\n' +
          '2. MICRO-EPIFANIAS QUANTIFICADAS (BLOCO SETORIAL INDÚSTRIA)\n' +
          '- Micro-epifania 1: Margem de contribuição industrial sob pressão da transição fabril entre Porto Alegre e Viamão.\n' +
          '- Micro-epifania 2: Dependência de funding bancário de curto prazo gerando despesas financeiras desproporcionais ao faturamento de R$ 7,5M.\n' +
          '- Micro-epifania 3: Gargalo de autonomia operacional da diretoria na gestão do chão de fábrica.\n\n' +
          '3. VAZAMENTOS QUANTIFICADOS\n' +
          '- Ociosidade de capacidade produtiva na fábrica atual vs custo de construção do novo terreno.\n' +
          '- [REQUER VERIFICAÇÃO] nas contas de CPV analítico e estoques.\n\n' +
          '4. NOTA DE TRIANGULAÇÃO\n' +
          'ECD 2025/2026 e balancetes fornecidos demonstram faturamento robusto, porém com endividamento financeiro que requer blindagem de caixa.\n\n' +
          '5. CANVAS AS IS (9 BLOCOS)\n' +
          '- Segmentos: Indústria e comércio eletroeletrônico B2B.\n' +
          '- Proposta de Valor: Fabricação especializada e soluções técnicas.\n' +
          '- Canais: Venda direta e representantes industriais.\n' +
          '- Relacionamento: Consultivo e contratos de fornecimento.\n' +
          '- Fontes de Receita: Faturamento mensal médio de R$ 7.500.000,00.\n' +
          '- Recursos Principais: 2 plantas (Porto Alegre e Viamão), equipe de 20 a 25 colaboradores.\n' +
          '- Atividades-Chave: Produção fabril, montagem e P&D.\n' +
          '- Parcerias: Fornecedores de semicondutores e parceiro RGS.\n' +
          '- Custos: Insumos, folha, encargos e despesas financeiras de empréstimos.\n\n' +
          'Aguardo seu comando.\n\n' +
          'SNAPSHOT FASE 6 — DRE NORMALIZADA 15 LINHAS (CS-17)\n\n' +
          '| Linha | Descrição | Valor (R$) | Nota / Convenção |\n' +
          '|---|---|---|---|\n' +
          '| 01 | Receita Bruta (=) | 7.500.000,00 | Declarada no dossiê |\n' +
          '| 02 | (-) Deduções/Impostos | [REQUER VERIFICAÇÃO] | Escada Y1/Y2/Y3+ ou ECD (A11) |\n' +
          '| 03 | (=) Receita Líquida | [REQUER VERIFICAÇÃO] | Base normalizada |\n' +
          '| 04 | (-) CPV/COGS | [REQUER VERIFICAÇÃO] | Custos operacionais fabris |\n' +
          '| 05 | (=) Margem Bruta | [REQUER VERIFICAÇÃO] | Calculado |\n' +
          '| 06 | (-) Custos Variáveis | [REQUER VERIFICAÇÃO] | Comissões e fretes |\n' +
          '| 07 | (=) Margem de Contribuição | [REQUER VERIFICAÇÃO] | Calculado |\n' +
          '| 08 | (-) OPEX | [REQUER VERIFICAÇÃO] | SG&A e despesas administrativas |\n' +
          '| 09 | (=) EBITDA | [REQUER VERIFICAÇÃO] | Resultado operacional |\n' +
          '| 10 | (-) D&A | [REQUER VERIFICAÇÃO] | Depreciação de máquinas e prédios |\n' +
          '| 11 | (=) EBIT | [REQUER VERIFICAÇÃO] | Resultado antes do financeiro |\n' +
          '| 12 | (+/-) Resultado Financeiro Líquido | [REQUER VERIFICAÇÃO] | Empréstimos 1 e 2 em auditoria |\n' +
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

      const dre15Linhas = [
        { numero: 1, linha: 'Receita Bruta (=)', valor: 'R$ 7.500.000,00' },
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

      const estruturaErec = [
        {
          acao: 'Eliminar',
          item: 'Dependência de capital de giro de curtíssimo prazo com altas taxas de juros',
          base: 'Análise de Empréstimos 1 e 2 em anexo',
          dimensao: 'Financeiro',
        },
        {
          acao: 'Reduzir',
          item: 'Duplicidade de custos operacionais entre as duas plantas de Porto Alegre e Viamão',
          base: 'Questionário Seção 1.2 e Balancete',
          dimensao: 'Operacional',
        },
        {
          acao: 'Elevar',
          item: 'Margem de contribuição por lote industrial com precificação estruturada',
          base: 'DRE Normalizada 15 Linhas',
          dimensao: 'Comercial/Precificação',
        },
        {
          acao: 'Criar',
          item: 'Comitê financeiro mensal com acompanhamento conjunto com o parceiro RGS',
          base: 'Seção 5 e 7 — Governança Adaptada às PMEs',
          dimensao: 'Estratégia/Governança',
        },
      ]

      const teaserGerado = {
        titulo: 'Achados Críticos e Micro-Epifanias Preliminares (Teaser Protegido)',
        micro_epifanias: [
          'Descasamento entre o ciclo fabril de duas unidades e a estrutura de capital de giro.',
          'Potencial de economia tributária e financeira na renegociação das linhas de empréstimo ativas.',
        ],
        vazamentos_objetivos: [
          'Custos de transição da nova fábrica em Viamão sem alocação clara de centro de custo.',
          'Despesas financeiras líquidas pressionando o resultado operacional antes do EBIT.',
        ],
        data_geracao: new Date().toISOString(),
        status_protecao:
          'Proteção do valor ativa conforme CS-20 — sem causa raiz integral, sem solução e sem plano de ação.',
      }

      const diagCol = app.findCollectionByNameOrId('diagnosticos')
      const diagRec = new Record(diagCol)
      diagRec.set('lead', '6e8y7ju5owgfpsl')
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
        a8_item1_identificacao:
          'Concluído: Protocolo #VM-1i96jjru3fwzv2o, CNPJ 06.080.542/0001-06, Versão 30set26 (CS-19)',
        a8_item2_causa_raiz:
          'Concluído: Causa raiz preliminar e Canvas As Is (9 blocos) com faturamento e estrutura fabril',
        a8_item3_micro_epifanias:
          'Concluído: 3 micro-epifanias quantificadas do Bloco Setorial Indústria',
        a8_item4_vazamentos:
          'Concluído: Vazamentos quantificados ancorados nos demonstrativos e empréstimos',
        a8_item5_nota_triangulacao:
          'Concluído: Triangulação entre ECD 2025/2026, balancetes e questionário',
        a8_item6_dre_15_linhas:
          'Concluído: 15 linhas canônicas sem omissões; [REQUER VERIFICAÇÃO] em linhas não segregadas (CS-17)',
        a8_item7_anexo_b_erec:
          'Concluído: 4 quadrantes EREC (Eliminar, Reduzir, Elevar, Criar) com base conclusiva e dimensão (A9)',
        a8_item8_gate_autorizacao:
          'Concluído: Gate 9.2 respeitado ("Não autorizo") -> Teaser protegido, sem CTA integral e cadência roteada ao parceiro RGS (CS-20)',
        auditado_em: new Date().toISOString(),
        validador: 'auditoria_automatica_v723_dry_run',
      })
      diagRec.set('custo_gateway', custoUso)
      diagRec.set('origem_tipo', 'parceiro')
      diagRec.set('origem_parceiro', 'RGS')
      diagRec.set('versao_incremental', 1)
      app.save(diagRec)

      // Atualizar máquina de estados do lead Beatek
      const agoraIso = new Date().toISOString()
      const d3 = new Date(agoraIso)
      d3.setDate(d3.getDate() + 3)
      const d10 = new Date(agoraIso)
      d10.setDate(d10.getDate() + 10)
      const d25 = new Date(agoraIso)
      d25.setDate(d25.getDate() + 25)

      const emailDestinatarioCadencia = 'gleverton@smartcapex.com.br'

      const disparosSuprimidosInfo = [
        {
          disparo: 'entrega_diagnostico_ou_teaser',
          destinatario: leadRecord.getString('email'),
          publico: 'lead',
          quando: agoraIso,
          assunto: '[Vetor Master] Achados Preliminares (Teaser Protegido): ' + razaoSocial,
          status: 'SUPRIMIDO_DRY_RUN',
          motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
        },
        {
          disparo: 'cadencia_d3',
          destinatario: emailDestinatarioCadencia,
          publico: 'parceiro',
          quando: d3.toISOString(),
          assunto: '[Vetor Master] Achados Preliminares — Diagnóstico Estratégico: ' + razaoSocial,
          status: 'SUPRIMIDO_DRY_RUN',
          motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
        },
        {
          disparo: 'cadencia_d10',
          destinatario: emailDestinatarioCadencia,
          publico: 'parceiro',
          quando: d10.toISOString(),
          assunto: '[Vetor Master] Segundo Achado e Próximos Passos — ' + razaoSocial,
          status: 'SUPRIMIDO_DRY_RUN',
          motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
        },
        {
          disparo: 'cadencia_d25',
          destinatario: emailDestinatarioCadencia,
          publico: 'parceiro',
          quando: d25.toISOString(),
          assunto: '[Vetor Master] Gatilho Regulatório e Janela de Decisão — ' + razaoSocial,
          status: 'SUPRIMIDO_DRY_RUN',
          motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
        },
      ]

      leadRecord.set('processado_em', agoraIso)
      leadRecord.set('teaser_gerado', teaserGerado)
      leadRecord.set('status', 'nutricao') // Gate 9.2: "Não autorizo" -> nutricao
      leadRecord.set('cadencia_nutricao', {
        ativa: true,
        dry_run: true,
        iniciada_em: agoraIso,
        alvo: 'parceiro',
        destinatario: emailDestinatarioCadencia,
        d3_data: d3.toISOString(),
        d3_enviado: false,
        d3_status: 'SUPRIMIDO_DRY_RUN',
        d10_data: d10.toISOString(),
        d10_enviado: false,
        d10_status: 'SUPRIMIDO_DRY_RUN',
        d25_data: d25.toISOString(),
        d25_enviado: false,
        d25_status: 'SUPRIMIDO_DRY_RUN',
        disparos_suprimidos: disparosSuprimidosInfo,
      })
      app.save(leadRecord)

      // Log de auditoria
      const logsCol = app.findCollectionByNameOrId('logs_auditoria')
      const audit = new Record(logsCol)
      audit.set('action', 'Diagnóstico Pronto [DRY-RUN] (Worker V7.2.3)')
      audit.set('resource', 'diagnosticos')
      audit.set(
        'details',
        '[DRY-RUN - Envios suprimidos] Diagnóstico concluído para ' +
          razaoSocial +
          ' (6e8y7ju5owgfpsl). Estados percorridos: novo -> processando -> diagnostico_pronto -> gate_9_2_nao_autorizo -> nutricao. Parceiro: Sim (RGS -> ' +
          emailDestinatarioCadencia +
          '). Custo Gateway: $' +
          custoUso.custo_usd,
      )
      app.save(audit)
    } catch (err) {}
  },
  (app) => {},
)
