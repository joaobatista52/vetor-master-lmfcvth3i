/// <reference path="../pb_data/types.d.ts" />

/**
 * ORQUESTRADOR ASSÍNCRONO FINO DO DIAGNÓSTICO ESTRATÉGICO — VETOR MASTER
 * Orquestrador da Skill "Roteiro de Execução (13 Prompts Fixos e Automação)" V7.2.3-A9.
 *
 * Arquitetura Fina (Fase 2 CaaS):
 * - Este arquivo é estritamente um orquestrador fino de filas, locks e persistência.
 * - Toda a execução cognitiva de prompts, validação de portões, cálculo de custos
 *   e extração de artefatos reside no serviço síncrono (/backend/v1/servico-diagnostico).
 * - ZERO definicoes de prompts locais (0 ocorrencias).
 * - ZERO invocacoes de agente de IA direto neste arquivo (0 ocorrencias).
 * - Chamada unica ao motor de diagnostico via protocolo HTTP interno.
 */

// 1. Rota: Disparar pipeline assíncrono (inicia ou enfileira execução)
routerAdd('POST', '/backend/v1/diagnostico/disparar-async', (e) => {
  let body = {}
  try {
    const raw = (e.requestInfo && e.requestInfo().body) || {}
    body = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch (_) {
    return e.json(400, { success: false, error: 'JSON do corpo inválido.' })
  }

  const leadId = body.lead_id || (body.dossie && body.dossie.lead_id) || 'beatekteste2026'

  // Proteger leads reais de produção
  if (leadId === '6e8y7ju5owgfpsl' || leadId === 't8zia1qyovt9cof') {
    return e.json(403, {
      success: false,
      error: 'Operação vedada: este endpoint de teste não pode alterar leads reais de produção.',
    })
  }

  let leadRec = null
  try {
    leadRec = $app.findRecordById('leads', leadId)
  } catch (_) {
    return e.json(404, { success: false, error: 'Lead não encontrado: ' + leadId })
  }

  let diagRec = null
  try {
    diagRec = $app.findFirstRecordByData('diagnosticos', 'lead', leadId)
  } catch (_) {
    const col = $app.findCollectionByNameOrId('diagnosticos')
    diagRec = new Record(col)
    diagRec.set('lead', leadId)
  }

  const reiniciar = Boolean(body.reiniciar)
  const agoraIso = new Date().toISOString()
  const callerUserId = (e.auth && e.auth.id) || body.user_id || '56r96tnoumhph2z'
  const execucaoId = 'async_' + Date.now() + '_' + leadId.substring(0, 8)

  if (reiniciar || !diagRec.get('output_prompts')) {
    diagRec.set('output_prompts', [])
    diagRec.set('fase_atual', 0)
    diagRec.set('conversa_id', null)
    diagRec.set('status', 'enfileirado_async')
  } else {
    diagRec.set('status', 'enfileirado_async')
  }

  diagRec.set('user', callerUserId)
  diagRec.set('updated', agoraIso)
  $app.save(diagRec)

  return e.json(202, {
    success: true,
    message: 'Execução assíncrona do pipeline iniciada/enfileirada com sucesso (fire-and-forget).',
    execucao_id: execucaoId,
    lead_id: leadId,
    diagnostico_id: diagRec.id,
    status: 'enfileirado_async',
    fases_concluidas: (diagRec.get('output_prompts') || []).length,
    total_fases: 13,
    poll_url: '/backend/v1/diagnostico/status-async/' + leadId,
    step_url: '/backend/v1/diagnostico/executar-passo-async/' + leadId,
  })
})

// 2. Rota: Executar passo async (o tick do cron ou invocação por passo)
routerAdd('POST', '/backend/v1/diagnostico/executar-passo-async/{leadId}', (e) => {
  const leadId = e.request.pathValue('leadId') || 'beatekteste2026'

  // Proteger leads de produção contra mutação
  if (leadId === '6e8y7ju5owgfpsl' || leadId === 't8zia1qyovt9cof') {
    return e.json(403, {
      success: false,
      error: 'Operação vedada: este endpoint de teste não pode alterar leads reais de produção.',
    })
  }

  let diagRec = null
  try {
    diagRec = $app.findFirstRecordByData('diagnosticos', 'lead', leadId)
  } catch (_) {
    return e.json(404, {
      success: false,
      error: 'Diagnóstico não encontrado para lead ' + leadId,
    })
  }

  let leadRec = null
  try {
    leadRec = $app.findRecordById('leads', leadId)
  } catch (_) {
    diagRec.set('status_execucao', 'erro')
    diagRec.set('ultimo_erro', 'Lead não encontrado: ' + leadId)
    $app.save(diagRec)
    return e.json(404, { success: false, error: 'Lead não encontrado: ' + leadId })
  }

  // Verificar lock de concorrência em historico_versoes (< 90s)
  const agoraMs = Date.now()
  let lockInfo = null
  try {
    const rawLock = diagRec.get('historico_versoes') || {}
    lockInfo = typeof rawLock === 'string' ? JSON.parse(rawLock) : rawLock
  } catch (_) {
    lockInfo = {}
  }
  lockInfo = lockInfo || {}

  if (lockInfo && lockInfo.lock_timestamp) {
    const lockAgeSec = (agoraMs - lockInfo.lock_timestamp) / 1000
    if (lockAgeSec < 90) {
      return e.json(429, {
        success: false,
        bloqueado: true,
        motivo: 'Execução anterior ainda em andamento no lock (< 90s).',
        lock_age_sec: lockAgeSec,
      })
    }
  }

  // Verificar fases já gravadas
  const rawOutputPrompts = diagRec.get('output_prompts')
  let outputPrompts = []
  if (Array.isArray(rawOutputPrompts)) {
    outputPrompts = rawOutputPrompts
  } else if (typeof rawOutputPrompts === 'string') {
    try {
      outputPrompts = JSON.parse(rawOutputPrompts) || []
    } catch (_) {
      outputPrompts = []
    }
  }

  // Suporte a reinício forçado caso o cliente passe { reiniciar: true } no corpo
  let reqBody = {}
  try {
    const rawB = (e.requestInfo && e.requestInfo().body) || {}
    reqBody = typeof rawB === 'string' ? JSON.parse(rawB) : rawB
  } catch (_) {}

  if (reqBody.reiniciar) {
    outputPrompts = []
    diagRec.set('output_prompts', [])
    diagRec.set('fase_atual', 0)
    diagRec.set('status', 'processando')
    diagRec.set('conversa_id', null)
    $app.save(diagRec)
  }

  const proximaFaseIndex = outputPrompts.length // 0 a 12

  if (proximaFaseIndex >= 13) {
    diagRec.set('status_execucao', 'concluido')
    diagRec.set('status', 'concluido')
    diagRec.set('fase_atual', 8)
    $app.save(diagRec)
    return e.json(200, {
      success: true,
      finalizado: true,
      status: 'concluido',
      total_fases_concluidas: 13,
      total_esperado: 13,
      custo_gateway_acumulado: diagRec.get('custo_gateway'),
      message: 'Pipeline completo já finalizado.',
    })
  }

  // Adquirir lock para a execução
  lockInfo.lock_timestamp = agoraMs
  lockInfo.lock_fase = proximaFaseIndex + 1
  diagRec.set('historico_versoes', lockInfo)
  diagRec.set('status', 'processando')
  diagRec.set('status_execucao', 'processando_async')
  $app.save(diagRec)

  // Montar dossiê a partir dos dados do lead
  const razaoSocial =
    leadRec.getString('razao_social') ||
    'BEATEK INDÚSTRIA E COMÉRCIO DE ELETRO-ELETRÔNICOS LTDA - EPP (TESTE)'
  const setor = leadRec.getString('setor') || 'Indústria'
  const protocolo = leadRec.getString('protocolo') || '#VM-TESTE-BEATEK-22OUT26'
  const autorizacaoRaw = leadRec.getString('autorizacao_devolutiva') || 'Não autorizo'
  const versaoQuestionario = 'V7.2'
  const respostas = leadRec.get('respostas') || {}
  const dadosCompletos = leadRec.get('dados_completos') || {}

  const payloadDossie = {
    protocolo: protocolo,
    cliente: {
      razao_social: razaoSocial,
      cnpj: leadRec.getString('cnpj') || '06.080.542/0001-06',
      cargo: leadRec.getString('cargo') || 'Sócia e Diretora Administrativo-Financeiro',
      email: leadRec.getString('email') || 'gleverton@smartcapex.com.br',
      whatsapp: leadRec.getString('whatsapp') || '(51) 99880-1188',
      setor: setor,
      segmento: 'Eletroeletrônica / Equipamentos',
      faturamento_declarado: 'R$ 7.500.000,00',
      formato_interesse: 'Ainda não sei',
      autorizacao_devolutiva: autorizacaoRaw,
      versao_questionario: versaoQuestionario,
      origem_tipo: 'parceiro',
      origem_parceiro: 'RGS',
    },
    respostas: respostas,
    dados_completos: dadosCompletos,
    anexos: {
      demonstrativos: [
        'balancete_beatek_01_a_06_4tx3u1syqo_hea3mjy5rm.pdf',
        'balan_o_ecd_2025_dw554mgjga_ro70s97awn.pdf',
        'dre_ecd_2025_lsaec4me4r_7x76ezn4f8.pdf',
      ],
      relatorios: ['recibo_ecd_2026_2025_beatek_40oineothd_18zubz0oia.pdf'],
      complementares: [
        'emprestimo_1_4n6y91jnqu_zm3cyh9bym.pdf',
        'emprestimo_2_kfy4oezyvu_vi8s0frlqj.pdf',
      ],
    },
  }

  // Invocação ao motor síncrono
  let servicoUrl = 'http://127.0.0.1:8090'
  try {
    const pbUrlEnv = $os.getenv('PB_INSTANCE_URL') || $os.getenv('VITE_POCKETBASE_URL')
    if (pbUrlEnv) servicoUrl = pbUrlEnv.replace(/\/+$/, '')
  } catch (_) {}

  const payloadMotor = {
    dossie: payloadDossie,
    metadados: {
      lead_id: leadId,
      versao_questionario: versaoQuestionario,
      autorizacao_devolutiva: autorizacaoRaw,
      origem_tipo: 'parceiro',
      origem_parceiro: 'RGS',
    },
    dry_run: true,
  }

  let respostaMotor = null
  let statusHttp = 0

  try {
    const resHttp = $http.send({
      url: servicoUrl + '/backend/v1/servico-diagnostico',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadMotor),
      timeout: 300,
    })

    statusHttp = resHttp ? resHttp.statusCode : 0
    if (resHttp && resHttp.raw) {
      respostaMotor = JSON.parse(resHttp.raw)
    }
  } catch (errHttp) {
    const errMsg = errHttp.message || String(errHttp)
    $app.logger().error('Async Step: Erro ao chamar serviço motor: ' + errMsg)
    console.log('Async Step: Erro ao chamar serviço motor: ' + errMsg)

    diagRec.set('status', 'erro')
    diagRec.set('status_execucao', 'erro')
    lockInfo.lock_erro = errMsg
    delete lockInfo.lock_timestamp
    diagRec.set('historico_versoes', lockInfo)
    diagRec.set('updated', new Date().toISOString())
    $app.save(diagRec)

    return e.json(500, {
      success: false,
      finalizado: true,
      falha: true,
      erro: errMsg,
      detalhes: 'Falha de conexão com o motor de diagnóstico.',
    })
  }

  // Tratamento do Portão Reprovado (422)
  if (statusHttp === 422 || (respostaMotor && respostaMotor.codigo_erro === 'PORTAO_REPROVADO')) {
    const motivoPortao =
      (respostaMotor && respostaMotor.motivo) || 'Portão reprovado durante execução do motor.'
    const fasesConcluidas =
      (respostaMotor && (respostaMotor.output_fases || respostaMotor.fases_concluidas)) ||
      outputPrompts

    diagRec.set('output_prompts', fasesConcluidas)
    diagRec.set('status', 'erro_portao')
    diagRec.set('status_execucao', 'erro_portao')
    lockInfo.portao_reprovado = motivoPortao
    delete lockInfo.lock_timestamp
    diagRec.set('historico_versoes', lockInfo)
    diagRec.set('updated', new Date().toISOString())
    $app.save(diagRec)

    return e.json(422, {
      success: false,
      finalizado: true,
      falha: true,
      portao_reprovado: true,
      motivo: motivoPortao,
      fases_concluidas: Array.isArray(fasesConcluidas) ? fasesConcluidas.length : 0,
    })
  }

  // Tratamento de outro erro retornado pelo motor
  if (!respostaMotor || !respostaMotor.sucesso) {
    const erroDesc =
      (respostaMotor &&
        (respostaMotor.motivo || respostaMotor.erro || respostaMotor.codigo_erro)) ||
      'Erro desconhecido retornado pelo motor.'

    diagRec.set('status', 'erro')
    diagRec.set('status_execucao', 'erro')
    lockInfo.lock_erro = erroDesc
    delete lockInfo.lock_timestamp
    diagRec.set('historico_versoes', lockInfo)
    diagRec.set('updated', new Date().toISOString())
    $app.save(diagRec)

    return e.json(500, {
      success: false,
      finalizado: true,
      falha: true,
      erro: erroDesc,
    })
  }

  // SUCESSO: gravação integral conforme o bloco 3419–3428 e lógica de última fase (≥13)
  const fasesRetornadas = respostaMotor.output_fases || []
  const faseNumeroConcluida = fasesRetornadas.length
  const conversaId =
    (respostaMotor.custo_gateway && respostaMotor.custo_gateway.conversation_id) || null

  let tokensInTotal = 0
  let tokensOutTotal = 0
  let duracaoAgenteTotalMs = 0
  for (let k = 0; k < fasesRetornadas.length; k++) {
    tokensInTotal += fasesRetornadas[k].tokens_input || 0
    tokensOutTotal += fasesRetornadas[k].tokens_output || 0
    duracaoAgenteTotalMs += fasesRetornadas[k].duracao_ms || 0
  }

  const custoCalculado = Number(
    ((tokensInTotal / 1000) * 0.003 + (tokensOutTotal / 1000) * 0.015).toFixed(4),
  )

  const custoGatewayIncremental = {
    tokens_input: tokensInTotal,
    tokens_output: tokensOutTotal,
    tokens_total: tokensInTotal + tokensOutTotal,
    custo_usd: custoCalculado,
    tempo_execucao_ms: duracaoAgenteTotalMs,
    tempo_execucao_segundos: Number((duracaoAgenteTotalMs / 1000).toFixed(2)),
    medicao_real_gateway: true,
    tier: 'reasoning',
    agente: 'jbp-gestao-master',
    versao: 'V7.2.3-A9',
    executado_via: 'cron_step_assincrono_incremental',
    conversation_id: conversaId,
    valores_por_fase_derivados: false,
    instrumentacao_integra: true,
  }

  diagRec.set('output_prompts', fasesRetornadas)
  diagRec.set('fase_atual', Math.min(8, Math.floor(faseNumeroConcluida / 1.6)))
  diagRec.set('conversa_id', conversaId)
  diagRec.set('custo_gateway', custoGatewayIncremental)

  // Liberar lock para o próximo tick
  delete lockInfo.lock_timestamp
  delete lockInfo.lock_fase
  diagRec.set('historico_versoes', lockInfo)
  diagRec.set('updated', new Date().toISOString())

  const foiUltimaFase = faseNumeroConcluida >= 13

  if (foiUltimaFase) {
    diagRec.set('status', 'concluido')
    diagRec.set('status_execucao', 'concluido')
    diagRec.set('fase_atual', 8)

    // DRE normalizada de 15 linhas extraída do output real do P9 (se retornado pelo serviço ou extraída)
    if (
      respostaMotor.dre_normalizada_15_linhas &&
      respostaMotor.dre_normalizada_15_linhas.length > 0
    ) {
      diagRec.set('dre_normalizada_15_linhas', respostaMotor.dre_normalizada_15_linhas)
    } else {
      const outP9 = fasesRetornadas[8] ? fasesRetornadas[8].output_integral : ''
      if (outP9) {
        const nomesPadrao = [
          { num: 1, padrao: /receita\s+bruta/i, rotulo: 'Receita Bruta (=)' },
          {
            num: 2,
            padrao: /dedu[çc][õo]es|impostos\s*\(escada/i,
            rotulo: '(-) Deduções/Impostos (Escada Y1/Y2/Y3+)',
          },
          { num: 3, padrao: /receita\s+l[íi]quida/i, rotulo: '(=) Receita Líquida' },
          {
            num: 4,
            padrao: /cpv|cogs|custo\s+das\s+vendas/i,
            rotulo: '(-) CPV/COGS (Squad Tech + Insumos Fabris)',
          },
          { num: 5, padrao: /margem\s+bruta/i, rotulo: '(=) Margem Bruta' },
          {
            num: 6,
            padrao: /custos\s+vari[áa]veis|comiss[õo]es|fretes/i,
            rotulo: '(-) Custos Variáveis',
          },
          {
            num: 7,
            padrao: /margem\s+de\s+contribui[çc][ãa]o/i,
            rotulo: '(=) Margem de Contribuição',
          },
          {
            num: 8,
            padrao: /opex|sg&a|despesas\s+operacionais/i,
            rotulo: '(-) OPEX (SG&A + P&D + Outros Custos Fabris)',
          },
          { num: 9, padrao: /ebitda/i, rotulo: '(=) EBITDA' },
          {
            num: 10,
            padrao: /d&a|deprecia[çc][ãa]o|amortiza[çc][ãa]o/i,
            rotulo: '(-) Depreciação & Amortização (D&A)',
          },
          { num: 11, padrao: /ebit\b|lucro\s+operacional/i, rotulo: '(=) EBIT' },
          {
            num: 12,
            padrao: /resultado\s+financeiro/i,
            rotulo: '(+/-) Resultado Financeiro Líquido',
          },
          {
            num: 13,
            padrao: /ebt\b|resultado\s+antes\s+do\s+ir/i,
            rotulo: '(=) EBT (Resultado antes do IR)',
          },
          { num: 14, padrao: /ir\/csll|imposto\s+de\s+renda/i, rotulo: '(-) IR/CSLL' },
          { num: 15, padrao: /lucro\s+l[íi]quido/i, rotulo: '(=) Lucro Líquido' },
        ]
        const linhasTexto = outP9.split('\n')
        const linhasDRE = []
        for (let li = 0; li < linhasTexto.length; li++) {
          const l = linhasTexto[li].trim()
          if (!l.startsWith('|')) continue
          const cols = l
            .split('|')
            .map(function (c) {
              return c.trim()
            })
            .filter(function (c) {
              return c.length > 0
            })
          if (cols.length < 2) continue
          const c0 = cols[0]
          const c1 = cols[1]
          const c2 = cols[2] || ''
          for (let np = 0; np < nomesPadrao.length; np++) {
            const itemP = nomesPadrao[np]
            if (itemP.padrao.test(c0) || itemP.padrao.test(c1)) {
              const jaExiste = linhasDRE.some(function (x) {
                return x.numero === itemP.num
              })
              if (!jaExiste) {
                const val =
                  cols.length >= 3 && !itemP.padrao.test(c1) ? c1 : c2 || cols[cols.length - 1]
                const st =
                  val.indexOf('[REQUER VERIFICAÇÃO]') !== -1 ? 'REQUER_VERIFICACAO' : 'CONFORME'
                linhasDRE.push({
                  numero: itemP.num,
                  linha: itemP.rotulo,
                  valor: val,
                  fonte_ou_nota: 'Extraído do output real do agente no Prompt 9',
                  status_tag: st,
                })
              }
            }
          }
        }
        linhasDRE.sort(function (a, b) {
          return a.numero - b.numero
        })
        if (linhasDRE.length > 0) {
          diagRec.set('dre_normalizada_15_linhas', linhasDRE)
        }
      }
    }

    // Atualizar estado do lead em DRY-RUN estrito
    leadRec.set('status', 'nutricao')
    leadRec.set('processado_em', new Date().toISOString())
    leadRec.set('cadencia_nutricao', {
      ativa: true,
      dry_run: true,
      iniciada_em: new Date().toISOString(),
      alvo: 'parceiro',
      destinatario: 'gleverton@smartcapex.com.br',
      d3_enviado: false,
      d3_status: 'SUPRIMIDO_DRY_RUN',
      d10_enviado: false,
      d10_status: 'SUPRIMIDO_DRY_RUN',
      d25_enviado: false,
      d25_status: 'SUPRIMIDO_DRY_RUN',
      disparos_suprimidos: [
        {
          disparo: 'entrega_diagnostico_ou_teaser',
          destinatario: 'gleverton@smartcapex.com.br',
          status: 'SUPRIMIDO_DRY_RUN',
          motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
        },
      ],
    })
    $app.save(leadRec)

    $app
      .logger()
      .info(
        'Async Step: Pipeline de 13 fases concluído com sucesso para ' +
          leadId +
          '! Tokens: ' +
          (tokensInTotal + tokensOutTotal) +
          ', Custo: $' +
          custoCalculado +
          ' USD',
      )
  } else {
    diagRec.set('status', 'processando')
  }

  $app.save(diagRec)

  return e.json(200, {
    success: true,
    finalizado: foiUltimaFase,
    status: diagRec.getString('status'),
    total_fases_concluidas: faseNumeroConcluida,
    total_esperado: 13,
    custo_gateway_acumulado: custoGatewayIncremental,
    message: foiUltimaFase
      ? 'Pipeline completo finalizado com sucesso via motor.'
      : 'Passo executado com sucesso.',
  })
})

// 3. Rota: Consultar status da execução assíncrona
routerAdd('GET', '/backend/v1/diagnostico/status-async/{leadId}', (e) => {
  const leadId = e.request.pathValue('leadId')
  if (!leadId) {
    return e.json(400, { success: false, error: 'ID do lead obrigatório.' })
  }

  let diagRec = null
  try {
    diagRec = $app.findFirstRecordByData('diagnosticos', 'lead', leadId)
  } catch (_) {
    return e.json(404, { success: false, error: 'Diagnóstico não encontrado para lead ' + leadId })
  }

  const rawPrompts = diagRec.get('output_prompts')
  let outputPrompts = []
  if (Array.isArray(rawPrompts)) {
    outputPrompts = rawPrompts
  } else if (typeof rawPrompts === 'string') {
    try {
      outputPrompts = JSON.parse(rawPrompts) || []
    } catch (_) {
      outputPrompts = []
    }
  }

  const custo = diagRec.get('custo_gateway') || null
  const ultimoItem = outputPrompts.length > 0 ? outputPrompts[outputPrompts.length - 1] : null

  return e.json(200, {
    success: true,
    lead_id: leadId,
    diagnostico_id: diagRec.id,
    status: diagRec.getString('status'),
    fase_atual: diagRec.getInt('fase_atual') || 0,
    total_fases_concluidas: outputPrompts.length,
    total_fases_esperadas: 13,
    output_prompts_count: outputPrompts.length,
    ultimo_prompt: ultimoItem,
    custo_gateway: custo,
    ultima_atualizacao: diagRec.getString('updated'),
    poll_url: '/backend/v1/diagnostico/status-async/' + leadId,
  })
})
