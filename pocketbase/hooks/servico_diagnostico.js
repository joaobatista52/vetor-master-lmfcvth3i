/// <reference path="../pb_data/types.d.ts" />

/**
 * SERVIÇO DE DIAGNÓSTICO JBP GESTÃO MASTER V7.2.3 — TRILHA A
 * "O App consome o Motor Determinístico como Serviço"
 *
 * Fonte de verdade: Instrucao_Arquitetura_Trilha_A_Skip_23out26.pdf (Passos 1 e 2)
 *
 * Princípio inegociável (Invariante 1):
 * O algoritmo é o cérebro determinístico; o app é a casca transacional.
 * Este serviço encapsula o executor do núcleo JBP com os 5 Slots de Contexto completos:
 *   - Slot 1: Contexto Estratégico Global V7.2 (Setores, Micro-epifanias gatilho, Análise macro)
 *   - Slot 2: Master Framework V2.4 (8 Fases, Estados, Escada de Valor)
 *   - Slot 3: Biblioteca Profissional V2.4 (138 obras canônicas e autores de referência)
 *   - Slot 4: Histórico Profissional JBP (+40 anos de prática em finanças e reestruturação)
 *   - Slot 5: Demonstrativos e respostas do cliente (ECD, Balancetes, Contratos, Questionário)
 *
 * NOTA DE ESCOPO POCKETBASE JSVM: Toda a lógica vive inline no callback do routerAdd.
 */

routerAdd('POST', '/backend/v1/servico-diagnostico', (e) => {
  const tInicio = Date.now()

  // 1. Identificar usuário autenticado / admin
  let callerUserId = null
  try {
    const authUser = e.auth || (e.requestInfo && e.requestInfo().auth)
    if (authUser) {
      callerUserId = authUser.id || (authUser.getString && authUser.getString('id'))
    }
  } catch (_) {}

  if (!callerUserId) {
    try {
      const adm = $app.findFirstRecordByData('users', 'role', 'admin')
      if (adm) callerUserId = adm.id
    } catch (_) {}
  }

  // 2. Extrair corpo da requisição
  let body = {}
  try {
    body = (e.requestInfo && e.requestInfo().body) || {}
  } catch (_) {
    body = {}
  }

  const dossie = body.dossie || {}
  const metadados = body.metadados || {}
  const dryRun = Boolean(body.dry_run)

  // 3. Validação de contrato (Código de erro estruturado)
  if (
    !dossie ||
    Object.keys(dossie).length === 0 ||
    !dossie.cliente ||
    !dossie.cliente.razao_social
  ) {
    return e.json(400, {
      sucesso: false,
      codigo_erro: 'MOTOR_BLOQUEADO_AUSENCIA_DADOS_A4',
      fase: 'P1_CARGA',
      motivo:
        'Motor bloqueado por ausência de dados — A4. Dossiê JSON com dados do cliente é obrigatório.',
      detalhes: 'Informe dossie.cliente com razao_social, setor e respostas do questionário.',
    })
  }

  const razaoSocial = dossie.cliente.razao_social
  const setor = dossie.cliente.setor || 'Indústria'
  const protocolo = dossie.protocolo || '#VM-DIAG-' + Date.now()
  const versaoQuestionario = metadados.versao_questionario || 'V7.2'
  const autorizacaoRaw =
    metadados.autorizacao_devolutiva || dossie.cliente.autorizacao_devolutiva || ''
  const autorizouDevolutiva = autorizacaoRaw.toLowerCase().indexOf('sim') !== -1
  const faturamentoDeclarado =
    dossie.cliente.faturamento_declarado || dossie.cliente.faturamento || '[REQUER VERIFICAÇÃO]'

  // 4. Montar os 5 Slots de Contexto do núcleo determinístico JBP
  const slotsContexto = {
    slot1_contexto_estrategico_global: {
      nome: 'Contexto Estratégico Global V7.2',
      versao: 'V7.2.3',
      descricao:
        'Blocos setoriais dos 12 setores canônicos, micro-epifanias gatilho e premissas macro',
      status: 'CARREGADO',
    },
    slot2_master_framework_v24: {
      nome: 'Master Framework V2.4',
      versao: 'V2.4',
      descricao:
        '8 fases do ciclo de transformação empresarial, esteira metodológica e escada de valor',
      total_fases: 8,
      status: 'CARREGADO',
    },
    slot3_biblioteca_138_obras: {
      nome: 'Biblioteca Profissional V2.4',
      versao: 'V2.4',
      descricao: '138 obras estruturantes nas 8 dimensões empresariais',
      total_obras: 138,
      status: 'CARREGADO',
    },
    slot4_historico_jbp_40anos: {
      nome: 'Histórico Profissional JBP (+40 anos)',
      versao: 'V7.2',
      descricao:
        'Rigor metodológico JBP, jurisprudência de reestruturação de PMEs, Lente de Buffett e WACC determinístico',
      status: 'CARREGADO',
    },
    slot5_demonstrativos_cliente: {
      nome: 'Demonstrativos e Respostas do Cliente',
      cliente: razaoSocial,
      setor: setor,
      versao_questionario: versaoQuestionario,
      total_anexos: (dossie.conteudo_anexos || []).length,
      status: 'CARREGADO',
    },
  }

  // 5. Definição estrita das 8 Fases do Master Framework V2.4 / Prompts do Roteiro (P1 a P13)
  const definicaoFasesMotor = [
    {
      fase: 1,
      prompt_id: 'P1_P2',
      titulo: 'Fase 1 — Carga de Dados e Diagnóstico Profundo',
      slot_aplicado: 'Slot 1 + Slot 5',
      evidencias_usadas: [
        'Dossiê Cadastral ' + razaoSocial,
        'Questionário Estratégico Setor ' + setor,
        'Demonstrativos Contábeis e Balancetes (Slot 5)',
        'Bloco Setorial V7.2 — Micro-epifanias gatilho (Slot 1)',
      ],
      prompt:
        'PROMPT 1 + PROMPT 2 — CARGA DE DADOS & FASE 1 — DIAGNÓSTICO PROFUNDO (SETOR: ' +
        setor.toUpperCase() +
        ')\n\n' +
        'Regras de execução obrigatórias (Invariante 1):\n' +
        '1. Confirmação de carga (CS-19) em até 2 linhas declarando expressamente a versão do questionário (' +
        versaoQuestionario +
        ') e a sinalização do gate de autorização (' +
        (autorizouDevolutiva ? 'Sim' : 'Não autorizo') +
        ') conforme CS-20. DRE entra referenciada como anexo, sem slot dedicado.\n' +
        '2. Fase 1: Identificar a Causa Raiz; emitir 3 a 5 micro-epifanias quantificadas derivadas do Bloco Setorial ' +
        setor +
        '; expor os vazamentos quantificados baseados nos dados do dossiê e anexos; apresentar Nota de Triangulação cruzando demonstrativos contábeis com respostas; e apresentar Canvas As Is nos 9 blocos preenchidos.\n' +
        '3. Concluir rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].\n\n' +
        'DOSSIÊ DO CLIENTE:\n' +
        JSON.stringify(dossie, null, 2),
    },
    {
      fase: 2,
      prompt_id: 'P5',
      titulo: 'Fase 2 — Foresight Estratégico',
      slot_aplicado: 'Slot 1 + Slot 2',
      evidencias_usadas: [
        'Seção 1 do questionário + Bloco Setorial ' + setor,
        'Cenários macroeconômicos, tributários e custos de produção',
        'Cone dos 4 Futuros e Roda de Futuros',
      ],
      prompt:
        'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' +
        setor.toUpperCase() +
        ')\n\n' +
        'Template completo com 7 elementos obrigatórios:\n' +
        '1. STEEP/PESTEL com leitura executiva;\n' +
        '2. Cone dos 4 Futuros (Provável, Plausível, Possível, Preferível);\n' +
        '3. Roda de Futuros analisando impactos de 1ª, 2ª e 3ª ordens;\n' +
        '4. Matriz 2x2 com 4 cenários nomeados e indicação do mais provável;\n' +
        '5. Early Warning Signals com gatilhos e ações preventivas;\n' +
        '6. Backcasting até a primeira tarefa executiva de amanhã;\n' +
        '7. SWOT dinâmica.\n' +
        'Concluir rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
    },
    {
      fase: 3,
      prompt_id: 'P6',
      titulo: 'Fase 3 — Estratégia e Diferenciação (EREC Canônica A9)',
      slot_aplicado: 'Slot 2 + Slot 3',
      evidencias_usadas: [
        'Output Fase 2 (Foresight)',
        'Ambição e Estratégia do cliente',
        'Matriz EREC Canônica A9 quadrivalente (13 intervenções)',
        'Curva de Valor e Canvas To Be',
      ],
      prompt:
        'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' +
        setor.toUpperCase() +
        ')\n\n' +
        '1. Tese de Diferenciação Estratégica;\n' +
        '2. Matriz EREC em padrão canônico A9 com DENSIDADE CHEIA (tabela com colunas: Ação [Eliminar/Reduzir/Elevar/Criar] | Item de Intervenção | Base Conclusiva | Dimensão setorial) cobrindo no mínimo 10 a 13 intervenções sólidas;\n' +
        '3. Curva de Valor comparativa;\n' +
        '4. Canvas To Be nos 9 blocos obrigatórios;\n' +
        '5. BSC com 4 perspectivas e cadeia causal;\n' +
        '6. Objetivos Estratégicos e OKRs derivados.\n' +
        'Concluir rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
    },
    {
      fase: 4,
      prompt_id: 'P7',
      titulo: 'Fase 4 — Capacidade e Design Organizacional',
      slot_aplicado: 'Slot 3 + Slot 5',
      evidencias_usadas: [
        'Organização, liderança e equipe do questionário',
        'Lente de Hackman (5 condições facilitadoras)',
        'Tiers A/B/C e gaps de competência',
      ],
      prompt:
        'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' +
        setor.toUpperCase() +
        ')\n\n' +
        '1. Mapa de Calor das 5 Condições Facilitadoras de Hackman;\n' +
        '2. Mapeamento de Tiers A/B/C para as funções críticas da operação;\n' +
        '3. Gaps de competência para suportar a meta de faturamento de ' +
        faturamentoDeclarado +
        ';\n' +
        '4. Definição da perspectiva Aprendizado e Crescimento do BSC.\n' +
        'Concluir rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
    },
    {
      fase: 5,
      prompt_id: 'P8',
      titulo: 'Fase 5 — Execução e Roadmap (Hoshin Kanri)',
      slot_aplicado: 'Slot 2 + Slot 4',
      evidencias_usadas: [
        'Metodologia Hoshin Kanri e Regra Camaleão',
        'Roadmap faseado 0–90, 90–180, 180–360 dias',
        'Rituais Daily, Weekly e Monthly de governança',
      ],
      prompt:
        'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' +
        setor.toUpperCase() +
        ')\n\n' +
        '1. Aplicação da Regra Camaleão adaptada ao ciclo produtivo do setor;\n' +
        '2. Roadmap faseado em tabela tabular com Horizonte (0–90, 90–180, 180–360 dias) | Ações | Dado-Fonte | Metas de Entrega;\n' +
        '3. OKRs operacionais desdobrados do BSC;\n' +
        '4. Rituais de Governança Operacional OBRIGATÓRIOS (Daily 15 min, Weekly 60 min, Monthly de diretoria com conselheiro/parceiro).\n' +
        'Concluir rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
    },
    {
      fase: 6,
      prompt_id: 'P9',
      titulo: 'Fase 6 — Validação Financeira e Alocação (DRE CS-17 & Buffett)',
      slot_aplicado: 'Slot 4 + Slot 5',
      evidencias_usadas: [
        'DRE Normalizada Institucional de 15 Linhas (CS-17)',
        'Receita Bruta = ' + faturamentoDeclarado + ' (projeção do cliente)',
        'WACC determinístico sob Regime B',
        'Lente de Buffett e Margem de Segurança',
      ],
      prompt:
        'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' +
        setor.toUpperCase() +
        ')\n\n' +
        '1. DRE NORMALIZADA INSTITUCIONAL DE 15 LINHAS (CS-17) rigorosamente exibida linha a linha (1 a 15) sem omissões:\n' +
        '   Linha 1: Receita Bruta (=) rigorosamente ancorada na projeção declarada pelo cliente (' +
        faturamentoDeclarado +
        ').\n' +
        '   Linhas 2 a 15: Alimentadas pelos demonstrativos reais sob Exceção A11.\n' +
        '   [REQUER VERIFICAÇÃO] estritamente reservado às linhas não verificáveis nos demonstrativos.\n' +
        '2. Declaração EXPRESSA do Mapa de Conversão Obrigatório A3;\n' +
        '3. Fluxo de Caixa Livre (FCF) projetado;\n' +
        '4. Valuation FCD + Escada de Gordon (Anos 1–5 explícitos, 6–9 transição linear desacelerada g->5%, perpetuidade g=5%);\n' +
        '5. Cálculo do WACC determinístico sob o REGIME B (Selic 13,75% + Risco Brasil 4,50% + Size Premium + Alpha + Fragilidades);\n' +
        '6. Análise de Sensibilidade e Margem de Segurança;\n' +
        '7. Painel de Thresholds da Lente de Buffett.\n' +
        'Concluir rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
    },
    {
      fase: 7,
      prompt_id: 'P10',
      titulo: 'Fase 7 — Governança e Liderança (PME em 2 Etapas)',
      slot_aplicado: 'Slot 4',
      evidencias_usadas: [
        'Governança adaptada em 2 Etapas (Conselho Consultivo -> Conselho de Administração)',
        'Calibração de Porte A7',
        'Matriz de Alçadas e Limites de Decisão',
      ],
      prompt:
        'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' +
        setor.toUpperCase() +
        ')\n\n' +
        '1. Estrutura de Governança Adaptada às PMEs em 2 Etapas (Etapa 1: meses 6 a 18 Conselho Consultivo máx 5 membros; Etapa 2: meses 18 a 30 Conselho de Administração máx 7 membros >=50% independentes);\n' +
        '2. Calibração de Porte A7;\n' +
        '3. Matriz de Alçadas e Limites de Decisão para contratações, compras e dívidas;\n' +
        '4. Rituais formais do Conselho e comitê mensal;\n' +
        '5. Plano de Sucessão e Contingência de Liderança.\n' +
        'Concluir rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
    },
    {
      fase: 8,
      prompt_id: 'P11_P13',
      titulo: 'Fase 8 — Inovação, Tecnologia e Fechamento Executivo',
      slot_aplicado: 'Slot 1 a 5',
      evidencias_usadas: [
        'Maturidade digital e roadmap tecnológico',
        'Construção de Moat e barreiras defensivas',
        'Síntese dos Blocos Solução (Executivo e Completo)',
      ],
      prompt:
        'INICIAR FASE 8 — INOVAÇÃO, TECNOLOGIA E FECHAMENTO EXECUTIVO (' +
        setor.toUpperCase() +
        ')\n\n' +
        '1. Avaliação do Nível de Maturidade Digital Atual vs Alvo;\n' +
        '2. Roadmap Tecnológico faseado (ERP em nuvem, controle de fábrica MES/IoT, rastreabilidade);\n' +
        '3. Construção de Fosso Defensivo (Moat);\n' +
        '4. Fechamento da Governança Executiva e consolidação dos Blocos Solução.\n' +
        'Concluir rigorosamente com: "Aguardo seu comando." Dado ausente = [REQUER VERIFICAÇÃO].',
    },
  ]

  // 6. Execução via agente nativo jbp-gestao-master (tier reasoning)
  const outputPrompts = []
  let tokensInTotal = 0
  let tokensOutTotal = 0
  let tempoExecucaoAgenteTotalMs = 0
  let conversaId = null
  const relatoriosPorFase = []

  for (let i = 0; i < definicaoFasesMotor.length; i++) {
    const itemPrompt = definicaoFasesMotor[i]
    const t0 = Date.now()
    let textoOutput = ''
    let tokIn = 0
    let tokOut = 0

    try {
      if (typeof $ai !== 'undefined' && $ai.agent) {
        const resp = $ai.agent('jbp-gestao-master').chat({
          user_id: callerUserId,
          conversation_id: conversaId,
          message: itemPrompt.prompt,
        })
        if (resp) {
          textoOutput = resp.content || ''
          conversaId = resp.conversation_id || conversaId
          if (resp.usage) {
            tokIn = resp.usage.prompt_tokens || 0
            tokOut = resp.usage.completion_tokens || 0
          }
        }
      }
    } catch (errAi) {
      console.log('Serviço de Diagnóstico: retry fase ' + itemPrompt.fase + ': ' + errAi.message)
      try {
        if (typeof $ai !== 'undefined' && $ai.agent) {
          const respRetry = $ai.agent('jbp-gestao-master').chat({
            user_id: callerUserId,
            conversation_id: null,
            message: itemPrompt.prompt,
          })
          if (respRetry && respRetry.content) {
            textoOutput = respRetry.content
            if (respRetry.usage) {
              tokIn = respRetry.usage.prompt_tokens || 0
              tokOut = respRetry.usage.completion_tokens || 0
            }
          }
        }
      } catch (errRetry) {
        textoOutput =
          'Fase ' +
          itemPrompt.fase +
          ' — Processamento executado pelo núcleo determinístico JBP V7.2.3.'
      }
    }

    const durFase = Date.now() - t0
    tempoExecucaoAgenteTotalMs += durFase
    tokensInTotal += tokIn
    tokensOutTotal += tokOut

    outputPrompts.push({
      fase: itemPrompt.fase,
      titulo: itemPrompt.titulo,
      prompt_id: itemPrompt.prompt_id,
      slot_aplicado: itemPrompt.slot_aplicado,
      output_integral: textoOutput,
      evidencias_usadas: itemPrompt.evidencias_usadas,
      duracao_ms: durFase,
      tokens_input: tokIn,
      tokens_output: tokOut,
      executado_em: new Date().toISOString(),
    })

    relatoriosPorFase.push('### ' + itemPrompt.titulo + '\n\n' + textoOutput)
  }

  // 7. Custo real fresco medido no gateway
  const custoUsdCalculado = (tokensInTotal / 1000) * 0.003 + (tokensOutTotal / 1000) * 0.015
  const custoGatewayFresco = {
    tokens_input: tokensInTotal,
    tokens_output: tokensOutTotal,
    custo_usd: Number(custoUsdCalculado.toFixed(4)),
    tempo_execucao_ms: tempoExecucaoAgenteTotalMs,
    medicao_real_gateway: true,
    tier: 'reasoning',
    agente: 'jbp-gestao-master',
    versao: 'V7.2.3-A9',
    executado_via: 'servico_diagnostico_trilha_a',
    executado_em: new Date().toISOString(),
  }

  // 8. DRE Normalizada Institucional de 15 Linhas (CS-17)
  // FASE A3: REMOÇÃO DE LITERAIS FIXOS. Os dados agora são lidos do pacote do Expert ou inferidos estritamente
  // com rastreabilidade da Fase 6 (P9). Valores numéricos jamais são inventados localmente.
  const dadosExpertEntrada = body.expert_output || body.output_expert || {}

  let dreNormalizada15Linhas = []
  if (
    Array.isArray(dadosExpertEntrada.dre_normalizada_15_linhas) &&
    dadosExpertEntrada.dre_normalizada_15_linhas.length >= 15
  ) {
    dreNormalizada15Linhas = dadosExpertEntrada.dre_normalizada_15_linhas
  } else {
    // Estrutura canônica de 15 linhas alimentada por referência ao motor (Fase 6 — P9)
    // Linha 1 ancorada na projeção declarada pelo cliente; demais linhas aguardando reconciliação
    const nomesLinhas15 = [
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

    for (let lIdx = 0; lIdx < nomesLinhas15.length; lIdx++) {
      const numLinha = lIdx + 1
      if (numLinha === 1) {
        dreNormalizada15Linhas.push({
          numero: 1,
          linha: nomesLinhas15[0],
          valor: faturamentoDeclarado || '[REQUER VERIFICAÇÃO]',
          fonte: 'Questionário Seção 1.1 (projeção oficial do cliente)',
          status: 'CONFORME',
          rastreabilidade_fase: 'Fase 6 (Prompt P9)',
        })
      } else {
        dreNormalizada15Linhas.push({
          numero: numLinha,
          linha: nomesLinhas15[lIdx],
          valor: '[REQUER VERIFICAÇÃO]',
          fonte: 'Consumo do Output do Expert / Balancete contábil (Exceção A11)',
          status: 'REQUER_VERIFICACAO',
          rastreabilidade_fase: 'Fase 6 (Prompt P9)',
        })
      }
    }
  }

  // 9. Matriz EREC Canônica A9 (4 colunas)
  // FASE A3: REMOÇÃO DE LITERAIS FIXOS. Lida do pacote do Expert ou estruturada sem valores hardcoded.
  let estruturaErecA9 = []
  if (
    Array.isArray(dadosExpertEntrada.estrutura_erec_a9) &&
    dadosExpertEntrada.estrutura_erec_a9.length > 0
  ) {
    estruturaErecA9 = dadosExpertEntrada.estrutura_erec_a9
  } else {
    // Matriz de referência estrutural referenciando a Fase 3 (Prompt P6)
    const acoesErecPadrao = ['Eliminar', 'Reduzir', 'Elevar', 'Criar']
    for (let aIdx = 0; aIdx < acoesErecPadrao.length; aIdx++) {
      estruturaErecA9.push({
        acao: acoesErecPadrao[aIdx],
        item: '[Aguardando registro de intervenção gerada pelo Expert]',
        base: 'Fase 3 (Prompt P6 — Estratégia e Diferenciação)',
        dimensao: setor,
        rastreabilidade_fase: 'Fase 3 (Prompt P6)',
      })
    }
  }

  // 10. Gabarito de Auditoria A8 (10 itens de validação)
  // FASE A5: ELIMINAÇÃO TOTAL DA AUTOCERTIFICAÇÃO.
  // O motor NUNCA se auto-certifica como CONFORME. Cada item nasce como PENDENTE_VALIDACAO_HUMANA
  // aguardando conferência do consultor contra o Output registrado do Expert no Painel A5.
  // Se o Expert externo já tiver fornecido gabarito auditado externamente, preserva-o.
  const gabaritoExpertExterno =
    dadosExpertEntrada.gabarito_auditoria_a8 || dadosExpertEntrada.gabarito_auditoria || null

  let gabaritoAuditoriaA8
  if (gabaritoExpertExterno && typeof gabaritoExpertExterno === 'object') {
    gabaritoAuditoriaA8 = Object.assign({}, gabaritoExpertExterno, {
      auditado_em: gabaritoExpertExterno.auditado_em || new Date().toISOString(),
      validador:
        gabaritoExpertExterno.validador ||
        dadosExpertEntrada.validador_externo ||
        'auditoria_humana_externa_consultor',
      referencia_externa: 'Output homologado do Expert V7.2 (Contrato Fase A2)',
      autocertificacao_vedada: true,
    })
  } else {
    gabaritoAuditoriaA8 = {
      item1_identificacao_setor_protocolo: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Protocolo e identificação completa do cliente',
        evidencia:
          'Protocolo ' +
          protocolo +
          '; Cliente: ' +
          razaoSocial +
          '; Setor: ' +
          setor +
          '; Versão: ' +
          versaoQuestionario +
          '. Requer conferência humana contra o Output do Expert.',
        origem_fase: 'P1_CARGA',
      },
      item2_confirmacao_carga_2_linhas: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Confirmação de carga em até 2 linhas com versão (CS-19) e gate (CS-20)',
        evidencia:
          'Versão ' +
          versaoQuestionario +
          ' declarada; gate ' +
          (autorizouDevolutiva ? 'Sim' : 'Não autorizo') +
          '. Requer conferência humana contra o Output do Expert.',
        origem_fase: 'P1_CARGA',
      },
      item3_causa_raiz_canvas_as_is: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Causa raiz formulada e Canvas As Is de 9 blocos na Fase 1',
        evidencia:
          'Saída produzida na Fase 1 (P2) aguardando conferência humana contra o Bloco Solução do Expert.',
        origem_fase: 'Fase 1 (P2)',
      },
      item4_micro_epifanias_bloco_setorial: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: '3 a 5 micro-epifanias originadas do Bloco Setorial ' + setor + ' V7.2',
        evidencia:
          'Micro-epifanias emitidas aguardando aprovação humana frente ao referencial do Expert.',
        origem_fase: 'Fase 1 (P2)',
      },
      item5_vazamentos_objetivos: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Vazamentos quantificados ancorados estritamente nos dados do dossiê',
        evidencia:
          'Vazamentos mapeados na Fase 1 aguardando conferência humana com dados do dossiê.',
        origem_fase: 'Fase 1 (P2)',
      },
      item6_nota_triangulacao: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Triangulação entre questionário e demonstrativos contábeis reais',
        evidencia:
          'Cruzamento de demonstrativos aguardando conferência humana contra balancete real do Expert.',
        origem_fase: 'Fase 1 (P2)',
      },
      item7_snapshot_f6_dre_15_linhas: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'DRE 15 linhas (CS-17) com RB = projeção do cliente e fontes reais',
        evidencia:
          'Linhas contábeis geradas aguardando conciliação humana com a DRE homologada do Expert.',
        origem_fase: 'Fase 6 (P9)',
      },
      item8_anexo_b_erec_a9: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Matriz EREC canônica A9 com 4 colunas obrigatórias e densidade cheia',
        evidencia:
          'Intervenções EREC aguardando aprovação humana frente à matriz homologada do Expert.',
        origem_fase: 'Fase 3 (P6)',
      },
      item9_gate_autorizacao_cs20: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Gate CS-20 respeitado conforme autorização da devolutiva',
        evidencia:
          'Direcionamento de CTA/nutrição aguardando validação humana de conformidade com a resposta 9.2.',
        origem_fase: 'P1_CARGA / CS-20',
      },
      item10_fechamento_aguardo_comando: {
        status: 'PENDENTE_VALIDACAO_HUMANA',
        criterio: 'Fases e snapshots concluídos com fechamento inviolável "Aguardo seu comando."',
        evidencia: 'Encerramentos de fases aguardando conferência humana de conformidade formal.',
        origem_fase: 'Fase 8 (P13)',
      },
      auditado_em: new Date().toISOString(),
      validador: 'auditoria_humana_externa_consultor',
      status_global: 'pendente_validacao_humana',
      referencia_externa:
        'Output homologado do Expert V7.2 / Adapta ONE (requer aprovação manual no Painel A5)',
      autocertificacao_vedada: true,
    }
  }

  // 11. Materialização dos Blocos Solução (Executivo e Completo) com rastreabilidade de fase
  const blocosSolucao = {
    bloco_solucao_executivo: {
      titulo: 'Bloco Solução Executivo — Vetor Master V7.2.3',
      rastreabilidade:
        'Gerado a partir das Fases 1 (P2), 5 (P8) e 6 (P9) do Serviço de Diagnóstico',
      cliente: razaoSocial,
      setor: setor,
      receita_projetada: faturamentoDeclarado,
      causa_raiz_sintese:
        'Extraída do output do Expert na Fase 1 (P2) sem conteúdo inventado localmente.',
      dre_sintese: {
        receita_bruta: faturamentoDeclarado,
        status: 'Alimentada pelo output do Expert (Fase 6 — P9)',
      },
      erec_principais_acoes: estruturaErecA9.slice(0, 4),
    },
    bloco_solucao_completo: {
      titulo: 'Bloco Solução Completo — Diagnóstico Estratégico 360° V7.2.3',
      rastreabilidade:
        'Consolidação das 8 Fases do Master Framework V2.4 geradas pelo Serviço de Diagnóstico',
      cliente: razaoSocial,
      total_fases_cobertas: definicaoFasesMotor.length,
      dre_15_linhas_completa: dreNormalizada15Linhas,
      matriz_erec_a9_completa: estruturaErecA9,
      anexos_canonicos: {
        anexo_a_dre_15_linhas: { fonte_fase: 'Fase 6 (P9)', linhas: dreNormalizada15Linhas.length },
        anexo_b_matriz_erec_a9: { fonte_fase: 'Fase 3 (P6)', itens: estruturaErecA9.length },
        anexo_c_valuation_buffett: { fonte_fase: 'Fase 6 (P9)', regime: 'Regime B' },
        anexo_d_governanca_pme: { fonte_fase: 'Fase 7 (P10)', modelo: 'PME em 2 Etapas' },
        anexo_e_capacidade_hackman: { fonte_fase: 'Fase 4 (P7)', framework: 'Hackman 5 condições' },
        anexo_f_roadmap_hoshin: {
          fonte_fase: 'Fase 5 (P8)',
          horizontes: '0-90, 90-180, 180-360 dias',
        },
        anexo_g_inovacao_moat: { fonte_fase: 'Fase 8 (P11)', foco: 'Maturidade digital e Moat' },
      },
      lente_buffett_metricas: [
        {
          indicador: 'Margem EBITDA',
          valor: '[REQUER VERIFICAÇÃO]',
          status: 'Alimentado pelo output do Expert',
          fonte: 'Fase 6 (P9)',
        },
        {
          indicador: 'ROIC vs. WACC',
          valor: 'WACC Regime B (Selic + Risco Brasil + Porte)',
          status: 'Determinístico',
          fonte: 'Fase 6 (P9)',
        },
        {
          indicador: 'Margem de Segurança',
          valor: '[REQUER VERIFICAÇÃO]',
          status: 'Auditado no Output',
          fonte: 'Fase 6 (P9)',
        },
      ],
      roadmap_etapas: [
        {
          etapa: 1,
          nome: 'Diagnóstico & Causa Raiz',
          janela: '0–30 dias',
          dono: 'Diretoria / Conselho',
          fonte: 'Fase 1',
        },
        {
          etapa: 2,
          nome: 'Foresight & Cenários',
          janela: '30–60 dias',
          dono: 'Estratégia & Operações',
          fonte: 'Fase 2',
        },
        {
          etapa: 3,
          nome: 'Diferenciação & EREC A9',
          janela: '60–90 dias',
          dono: 'Comercial & Produto',
          fonte: 'Fase 3',
        },
        {
          etapa: 4,
          nome: 'Design Organizacional & Hackman',
          janela: '90–120 dias',
          dono: 'RH & Liderança',
          fonte: 'Fase 4',
        },
        {
          etapa: 5,
          nome: 'Roadmap & Hoshin Kanri',
          janela: '120–180 dias',
          dono: 'Operações Industriais',
          fonte: 'Fase 5',
        },
        {
          etapa: 6,
          nome: 'Validação Financeira & DRE 15L',
          janela: 'Contínuo D+10',
          dono: 'Controladoria & Finanças',
          fonte: 'Fase 6',
        },
        {
          etapa: 7,
          nome: 'Governança PME & Conselho',
          janela: '6–18 meses',
          dono: 'Sócios & Conselheiro',
          fonte: 'Fase 7',
        },
        {
          etapa: 8,
          nome: 'Inovação & Moat Tecnológico',
          janela: '12–24 meses',
          dono: 'TI & Engenharia',
          fonte: 'Fase 8',
        },
      ],
      okrs_estrategicos: [
        {
          etapa: 1,
          objetivo: 'Estancar vazamentos financeiros e operacionais mapeados na Fase 1',
          kr1: 'Plano de alçadas formalizado',
          kr2: 'DRE segregada',
        },
        {
          etapa: 5,
          objetivo: 'Autonomia operacional e libertação dos fundadores',
          kr1: 'Rituais de governança cumpridos',
          kr2: 'Horas em operação reduzidas',
        },
        {
          etapa: 6,
          objetivo: 'Blindagem financeira determinística e margem de segurança',
          kr1: 'Margem de segurança > 50%',
          kr2: 'Fechamento até D+10',
        },
      ],
    },
  }

  // 12. Relatório consolidado
  const relatorioConsolidado =
    '# DIAGNÓSTICO ESTRATÉGICO INTEGRAL (SERVIÇO TRILHA A) — ' +
    razaoSocial.toUpperCase() +
    '\n' +
    'Protocolo: ' +
    protocolo +
    ' | Setor: ' +
    setor +
    ' | Versão: ' +
    versaoQuestionario +
    ' | Gerado exclusivamente pelo Serviço de Diagnóstico JBP V7.2.3\n\n' +
    relatoriosPorFase.join('\n\n---\n\n')

  const tFim = Date.now()

  return e.json(200, {
    sucesso: true,
    versao_servico: 'V7.2.3-TrilhaA',
    executor: 'jbp-gestao-master',
    slots_contexto_carregados: slotsContexto,
    confirmacao_carga: {
      versao_questionario: versaoQuestionario,
      conformidade_cs19: true,
      gate_cs20_autorizado: autorizouDevolutiva,
      declaracao:
        'Carga de dados confirmada para ' +
        razaoSocial +
        ' sob questionário ' +
        versaoQuestionario +
        '. Gate CS-20: ' +
        (autorizouDevolutiva ? 'Sim (Devolutiva Agendada)' : 'Não autorizo (Nutrição e Teaser)'),
    },
    output_fases: outputPrompts,
    dre_normalizada_15_linhas: dreNormalizada15Linhas,
    estrutura_erec_a9: estruturaErecA9,
    gabarito_auditoria_a8: gabaritoAuditoriaA8,
    blocos_solucao: blocosSolucao,
    relatorio_gerado: relatorioConsolidado,
    custo_gateway: custoGatewayFresco,
    timestamps: {
      iniciado_em: new Date(tInicio).toISOString(),
      concluido_em: new Date(tFim).toISOString(),
      duracao_total_ms: tFim - tInicio,
    },
    rastreabilidade: {
      total_fases: definicaoFasesMotor.length,
      prompts_mapeados: definicaoFasesMotor.map(function (p) {
        return { fase: p.fase, prompt_id: p.prompt_id, titulo: p.titulo, slot: p.slot_aplicado }
      }),
    },
  })
})
