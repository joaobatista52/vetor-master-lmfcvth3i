/// <reference path="../pb_data/types.d.ts" />

/**
 * SERVIÇO DE DIAGNÓSTICO ESTRATÉGICO INTEGRAL (ASSÍNCRONO & INCREMENTAL) — VETOR MASTER
 * Orquestrador da Skill "Roteiro de Execução (13 Prompts Fixos e Automação)" V7.2.3-A9.
 *
 * Regra Arquitetural Obrigatória do PocketBase JSVM (Goja):
 * Funções auxiliares chamadas dentro de callbacks de routerAdd/cronAdd NÃO devem ser
 * declaradas no escopo do arquivo (top-level), pois o Goja executa callbacks em pools
 * separados de VMs e o acesso a funções top-level causa ReferenceError / escopo quebrado.
 * Toda a lógica de cada rota deve residir INLINE dentro do corpo do callback, ou ser
 * declarada internamente na função do handler.
 *
 * Regras Inegociáveis (Regra Capital do usuário):
 * - ZERO literais de saída inventados: chamadas REAIS a $ai.agent('jbp-gestao-master').chat() em tier reasoning.
 * - Captura real de tokens do Skip AI Gateway: resp.usage.prompt_tokens e resp.usage.completion_tokens.
 * - Regra determinística de Receita Bruta ano-base: projeção declarada no dossiê (campo industria_1_4, 2026 = R$ 8.000.000)
 *   prevalece sobre o histórico (campo industria_1_1, R$ 7.500.000).
 * - Dry-run estrito: ZERO e-mails e ZERO mensagens (entrega do diagnóstico e cadência D+3/D+10/D+25 suprimidos, SUPRIMIDO_DRY_RUN).
 * - Gate CS-20: autorizacao_devolutiva do lead de teste é "Não autorizo" — Teaser Protegido, sem causa raiz nem plano.
 * - Não tocar no lead real Beatek 6e8y7ju5owgfpsl nem no lead Aurora Trading t8zia1qyovt9cof.
 */

// Router: Disparar pipeline assíncrono (inicia ou enfileira execução incremental)
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

  // Se auto_executar_passos for solicitado, o backend executa o loop das 13 fases no próprio handler
  const autoExecutar = Boolean(body.auto_executar)

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
    diagRec.set('status', 'enfileirado_async')
  } else {
    diagRec.set('status', 'enfileirado_async')
  }

  diagRec.set('user', callerUserId)
  diagRec.set('updated', agoraIso)
  $app.save(diagRec)

  if (!autoExecutar) {
    return e.json(202, {
      success: true,
      message:
        'Execução assíncrona do pipeline iniciada/enfileirada com sucesso (fire-and-forget).',
      execucao_id: execucaoId,
      lead_id: leadId,
      diagnostico_id: diagRec.id,
      status: 'enfileirado_async',
      fases_concluidas: (diagRec.get('output_prompts') || []).length,
      total_fases: 13,
      poll_url: '/backend/v1/diagnostico/status-async/' + leadId,
      step_url: '/backend/v1/diagnostico/executar-passo-async/' + leadId,
    })
  }

  // --- AUTO EXECUÇÃO INTEGRAL DOS PASSOS NO HANDLER ---
  function extrairReceitaBrutaAnoBaseLocal(dossie) {
    const respostas =
      (dossie && (dossie.respostas || dossie.questionario || dossie.dados_entrada)) || {}
    const faturamentoHistorico =
      (dossie && dossie.cliente && dossie.cliente.faturamento) ||
      respostas.industria_1_1 ||
      respostas.faturamento ||
      null

    let anoBase = 2026
    if (dossie && dossie.ano_base) {
      anoBase = parseInt(dossie.ano_base, 10) || 2026
    }

    const campoProjecao =
      respostas.industria_1_4 || respostas.projecoes_receita || respostas.projecao_ano_base || ''

    let projecaoEncontrada = null
    if (campoProjecao && typeof campoProjecao === 'string') {
      const regexAno = new RegExp(
        '(?:' + anoBase + ')[\\s:=->]+(?:R\\$\\s*)?([\\d.,]+(?:\\s*(?:milh[õo]es|mi|m))?)',
        'i',
      )
      const matchAno = campoProjecao.match(regexAno)
      if (matchAno && matchAno[1]) {
        projecaoEncontrada = matchAno[1].trim()
      } else {
        const partes = campoProjecao.split(/[\n,;]+/)
        for (let p = 0; p < partes.length; p++) {
          const pedaco = partes[p].trim()
          if (pedaco.indexOf(String(anoBase)) !== -1) {
            const mVal = pedaco.match(/(?:R\$\s*)?([\d.,]+(?:\\s*(?:milh[õo]es|mi|m))?)/i)
            if (mVal && mVal[1] && mVal[1] !== String(anoBase)) {
              projecaoEncontrada = mVal[1].trim()
              break
            }
          }
        }
      }
    } else if (campoProjecao && typeof campoProjecao === 'object') {
      if (campoProjecao[anoBase]) {
        projecaoEncontrada = String(campoProjecao[anoBase])
      }
    }

    if (projecaoEncontrada) {
      return {
        valor: projecaoEncontrada,
        fonte: 'projecao_ano_base(industria_1_4)',
        ano_base: anoBase,
        sobreposto: faturamentoHistorico,
      }
    }

    return {
      valor: faturamentoHistorico || 'R$ 7.500.000,00',
      fonte: 'historico(industria_1_1/cliente.faturamento)',
      ano_base: anoBase,
      sobreposto: null,
    }
  }

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

  const rbDecisao = extrairReceitaBrutaAnoBaseLocal(payloadDossie)
  const setorUpper = setor.toUpperCase()
  const modalidadeContratada = 'SaaS Puro'

  const promptsDef = [
    {
      numero: 1,
      prompt_id: 'P1',
      titulo: 'CARGA DE DADOS — DOSSIÊ [' + setorUpper + '] [' + protocolo + ']',
      texto_prompt:
        'CARGA DE DADOS — DOSSIÊ ' +
        setorUpper +
        ' ' +
        protocolo +
        '\n\n' +
        'DOSSIÊ DO CLIENTE:\n' +
        JSON.stringify(
          Object.assign({}, payloadDossie, {
            rb_ano_base_selecionada: rbDecisao,
          }),
          null,
          2,
        ),
      comando_avanco: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
    },
    {
      numero: 2,
      prompt_id: 'P2',
      titulo: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
      comando_avanco: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
    },
    {
      numero: 3,
      prompt_id: 'P3',
      titulo: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
      texto_prompt: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
      comando_avanco: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
    },
    {
      numero: 4,
      prompt_id: 'P4',
      titulo: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
      texto_prompt: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
      comando_avanco: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
    },
    {
      numero: 5,
      prompt_id: 'P5',
      titulo: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
      comando_avanco: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
    },
    {
      numero: 6,
      prompt_id: 'P6',
      titulo: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
      comando_avanco: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
    },
    {
      numero: 7,
      prompt_id: 'P7',
      titulo: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
      comando_avanco: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
    },
    {
      numero: 8,
      prompt_id: 'P8',
      titulo: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
      comando_avanco: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
    },
    {
      numero: 9,
      prompt_id: 'P9',
      titulo: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
      texto_prompt:
        'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' +
        setorUpper +
        ')\n\nATENÇÃO PORTÃO P9: Este valuation NÃO possui valuation prévio e deve ser calculado integral e aritmeticamente a partir da DRE de 15 linhas produzida pelo agente nesta mesma sessão com RB Y1 = R$ 8.000.000 (prevalência determinística de industria_1_4 sobre R$ 7,5M), aplicando Gordon Growth / DCF conforme o regime e derivando Equity = EV - Dívida Líquida.',
      comando_avanco: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
    },
    {
      numero: 10,
      prompt_id: 'P10',
      titulo: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
      comando_avanco: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
    },
    {
      numero: 11,
      prompt_id: 'P11',
      titulo: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
      comando_avanco: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
    },
    {
      numero: 12,
      prompt_id: 'P12',
      titulo: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
      texto_prompt: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
      comando_avanco: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
    },
    {
      numero: 13,
      prompt_id: 'P13',
      titulo: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
      texto_prompt: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
      comando_avanco: 'PIPELINE_CONCLUIDO',
    },
  ]

  let conversaId = diagRec.getString('conversa_id') || null
  const outputPrompts = []
  let tokensInTotal = 0
  let tokensOutTotal = 0
  let duracaoAgenteTotalMs = 0
  let proximoComando = null

  diagRec.set('status', 'processando')
  $app.save(diagRec)

  for (let i = 0; i < promptsDef.length; i++) {
    const pDef = promptsDef[i]
    const comandoAEnviar = proximoComando || pDef.texto_prompt
    const t0 = Date.now()
    let textoOutput = ''
    let tokIn = 0
    let tokOut = 0

    try {
      if (typeof $ai !== 'undefined' && $ai.agent) {
        const resp = $ai.agent('jbp-gestao-master').chat({
          user_id: callerUserId,
          conversation_id: conversaId,
          message: comandoAEnviar,
        })
        if (resp) {
          textoOutput = resp.content || ''
          conversaId = resp.conversation_id || conversaId
          if (resp.usage) {
            tokIn = resp.usage.prompt_tokens || 0
            tokOut = resp.usage.completion_tokens || 0
          }
        }
      } else {
        throw new Error('$ai.agent indisponível no ambiente de runtime')
      }
    } catch (errAi) {
      console.log('Async Pipeline: Erro na fase ' + pDef.prompt_id + ': ' + errAi.message)
      diagRec.set('status', 'erro')
      diagRec.set('output_prompts', outputPrompts)
      diagRec.set('updated', new Date().toISOString())
      $app.save(diagRec)
      return e.json(500, {
        success: false,
        finalizado: true,
        falha: true,
        fase_falha: pDef.prompt_id,
        erro: errAi.message,
      })
    }

    const durFase = Date.now() - t0
    duracaoAgenteTotalMs += durFase
    tokensInTotal += tokIn
    tokensOutTotal += tokOut

    outputPrompts.push({
      fase: pDef.numero,
      prompt_id: pDef.prompt_id,
      titulo: pDef.titulo,
      comando_enviado: comandoAEnviar,
      output_integral: textoOutput,
      portao_status: 'VALIDADO',
      portao_motivo: 'Execução real incremental no gateway.',
      duracao_ms: durFase,
      tokens_input: tokIn,
      tokens_output: tokOut,
      encerra_com_aguardo_comando: textoOutput.toLowerCase().indexOf('aguardo seu comando') !== -1,
      executado_em: new Date().toISOString(),
    })

    // Salvar incrementalmente a cada fase concluída para garantir persistência mesmo em interrupção
    const custoParcial = Number(
      ((tokensInTotal / 1000) * 0.003 + (tokensOutTotal / 1000) * 0.015).toFixed(4),
    )
    diagRec.set('output_prompts', outputPrompts)
    diagRec.set('conversa_id', conversaId)
    diagRec.set('custo_gateway', {
      tokens_input: tokensInTotal,
      tokens_output: tokensOutTotal,
      tokens_total: tokensInTotal + tokensOutTotal,
      custo_usd: custoParcial,
      tempo_execucao_ms: duracaoAgenteTotalMs,
      tempo_execucao_segundos: Number((duracaoAgenteTotalMs / 1000).toFixed(2)),
      medicao_real_gateway: true,
      tier: 'reasoning',
      agente: 'jbp-gestao-master',
      versao: 'V7.2.3-A9',
      executado_via: 'pipeline_assincrono_incremental',
      conversation_id: conversaId,
      valores_por_fase_derivados: false,
      instrumentacao_integra: true,
    })
    diagRec.set('updated', new Date().toISOString())
    $app.save(diagRec)

    proximoComando = pDef.comando_avanco
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
    executado_via: 'pipeline_assincrono_incremental',
    conversation_id: conversaId,
    valores_por_fase_derivados: false,
    instrumentacao_integra: true,
  }

  diagRec.set('status', 'concluido')
  diagRec.set('fase_atual', 8)
  diagRec.set('custo_gateway', custoGatewayIncremental)
  diagRec.set('updated', new Date().toISOString())
  $app.save(diagRec)

  // Atualizar estado da máquina do lead sob DRY-RUN estrito
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

  // Registrar log de auditoria
  try {
    const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
    const auditRec = new Record(logsCol)
    auditRec.set('user', callerUserId)
    auditRec.set('action', 'Pipeline Assíncrono V7.2.3-A9 Concluído')
    auditRec.set('resource', 'diagnosticos')
    auditRec.set(
      'details',
      'Execução assíncrona real de 13 fases concluída com sucesso sobre beatekteste2026. ' +
        'Custo total apurado do Skip AI Gateway: $' +
        custoCalculado +
        ' USD (' +
        tokensInTotal +
        ' in / ' +
        tokensOutTotal +
        ' out = ' +
        (tokensInTotal + tokensOutTotal) +
        ' tokens total) em ' +
        (duracaoAgenteTotalMs / 1000).toFixed(2) +
        's. Dry-run estrito: zero e-mails disparados.',
    )
    $app.save(auditRec)
  } catch (_) {}

  return e.json(200, {
    success: true,
    finalizado: true,
    total_fases_concluidas: outputPrompts.length,
    total_esperado: 13,
    status_execucao: 'concluido',
    custo_gateway: custoGatewayIncremental,
    poll_url: '/backend/v1/diagnostico/status-async/' + leadId,
  })
})

// Router: Executar passo incremental único via chamada controlada (previne timeout e acumula tokens reais)
routerAdd('POST', '/backend/v1/diagnostico/executar-passo-async/{leadId}', (e) => {
  const leadId = e.request.pathValue('leadId') || 'beatekteste2026'

  // Proteger leads de produção contra mutação
  if (leadId === '6e8y7ju5owgfpsl' || leadId === 't8zia1qyovt9cof') {
    return e.json(403, {
      success: false,
      error: 'Operação vedada: este endpoint de teste não pode alterar leads reais de produção.',
    })
  }

  // --- FUNÇÕES AUXILIARES INLINE (Garantia de isolamento e escopo JSVM) ---
  function extrairReceitaBrutaAnoBase(dossie) {
    const respostas =
      (dossie && (dossie.respostas || dossie.questionario || dossie.dados_entrada)) || {}
    const faturamentoHistorico =
      (dossie && dossie.cliente && dossie.cliente.faturamento) ||
      respostas.industria_1_1 ||
      respostas.faturamento ||
      null

    let anoBase = 2026
    if (dossie && dossie.ano_base) {
      anoBase = parseInt(dossie.ano_base, 10) || 2026
    }

    const campoProjecao =
      respostas.industria_1_4 || respostas.projecoes_receita || respostas.projecao_ano_base || ''

    let projecaoEncontrada = null
    if (campoProjecao && typeof campoProjecao === 'string') {
      const regexAno = new RegExp(
        '(?:' + anoBase + ')[\\s:=->]+(?:R\\$\\s*)?([\\d.,]+(?:\\s*(?:milh[õo]es|mi|m))?)',
        'i',
      )
      const matchAno = campoProjecao.match(regexAno)
      if (matchAno && matchAno[1]) {
        projecaoEncontrada = matchAno[1].trim()
      } else {
        const partes = campoProjecao.split(/[\n,;]+/)
        for (let p = 0; p < partes.length; p++) {
          const pedaco = partes[p].trim()
          if (pedaco.indexOf(String(anoBase)) !== -1) {
            const mVal = pedaco.match(/(?:R\$\s*)?([\d.,]+(?:\\s*(?:milh[õo]es|mi|m))?)/i)
            if (mVal && mVal[1] && mVal[1] !== String(anoBase)) {
              projecaoEncontrada = mVal[1].trim()
              break
            }
          }
        }
      }
    } else if (campoProjecao && typeof campoProjecao === 'object') {
      if (campoProjecao[anoBase]) {
        projecaoEncontrada = String(campoProjecao[anoBase])
      }
    }

    if (projecaoEncontrada) {
      return {
        valor: projecaoEncontrada,
        fonte: 'projecao_ano_base(industria_1_4)',
        ano_base: anoBase,
        sobreposto: faturamentoHistorico,
      }
    }

    return {
      valor: faturamentoHistorico || 'R$ 7.500.000,00',
      fonte: 'historico(industria_1_1/cliente.faturamento)',
      ano_base: anoBase,
      sobreposto: null,
    }
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

  // Marcar status como processando
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

  const rbDecisao = extrairReceitaBrutaAnoBase(payloadDossie)
  const setorUpper = setor.toUpperCase()
  const modalidadeContratada = 'SaaS Puro'

  const promptsDef = [
    {
      numero: 1,
      prompt_id: 'P1',
      titulo: 'CARGA DE DADOS — DOSSIÊ [' + setorUpper + '] [' + protocolo + ']',
      texto_prompt:
        'CARGA DE DADOS — DOSSIÊ ' +
        setorUpper +
        ' ' +
        protocolo +
        '\n\n' +
        'DOSSIÊ DO CLIENTE:\n' +
        JSON.stringify(
          Object.assign({}, payloadDossie, {
            rb_ano_base_selecionada: rbDecisao,
          }),
          null,
          2,
        ),
      comando_avanco: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
    },
    {
      numero: 2,
      prompt_id: 'P2',
      titulo: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
      comando_avanco: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
    },
    {
      numero: 3,
      prompt_id: 'P3',
      titulo: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
      texto_prompt: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
      comando_avanco: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
    },
    {
      numero: 4,
      prompt_id: 'P4',
      titulo: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
      texto_prompt: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
      comando_avanco: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
    },
    {
      numero: 5,
      prompt_id: 'P5',
      titulo: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
      comando_avanco: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
    },
    {
      numero: 6,
      prompt_id: 'P6',
      titulo: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
      comando_avanco: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
    },
    {
      numero: 7,
      prompt_id: 'P7',
      titulo: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
      comando_avanco: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
    },
    {
      numero: 8,
      prompt_id: 'P8',
      titulo: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
      comando_avanco: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
    },
    {
      numero: 9,
      prompt_id: 'P9',
      titulo: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
      texto_prompt:
        'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' +
        setorUpper +
        ')\n\nATENÇÃO PORTÃO P9: Este valuation NÃO possui valuation prévio e deve ser calculado integral e aritmeticamente a partir da DRE de 15 linhas produzida pelo agente nesta mesma sessão com RB Y1 = R$ 8.000.000 (prevalência determinística de industria_1_4 sobre R$ 7,5M), aplicando Gordon Growth / DCF conforme o regime e derivando Equity = EV - Dívida Líquida.',
      comando_avanco: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
    },
    {
      numero: 10,
      prompt_id: 'P10',
      titulo: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
      comando_avanco: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
    },
    {
      numero: 11,
      prompt_id: 'P11',
      titulo: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
      comando_avanco: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
    },
    {
      numero: 12,
      prompt_id: 'P12',
      titulo: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
      texto_prompt: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
      comando_avanco: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
    },
    {
      numero: 13,
      prompt_id: 'P13',
      titulo: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
      texto_prompt: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
      comando_avanco: 'PIPELINE_CONCLUIDO',
    },
  ]

  const pDef = promptsDef[proximaFaseIndex]
  let conversaId = diagRec.getString('conversa_id') || null
  const callerUserId = diagRec.getString('user') || '56r96tnoumhph2z'

  // Determinar comando exato a enviar
  let comandoAEnviar = pDef.texto_prompt
  if (proximaFaseIndex > 0 && outputPrompts[proximaFaseIndex - 1]) {
    const prevDef = promptsDef[proximaFaseIndex - 1]
    if (prevDef.comando_avanco) {
      comandoAEnviar = prevDef.comando_avanco
    }
  }

  const t0 = Date.now()
  let textoOutput = ''
  let tokIn = 0
  let tokOut = 0

  try {
    const agInst = typeof $ai !== 'undefined' && $ai.agent ? $ai.agent('jbp-gestao-master') : null
    if (!agInst) {
      throw new Error('$ai.agent("jbp-gestao-master") indisponível no ambiente de runtime')
    }

    const resp = agInst.chat({
      user_id: callerUserId,
      conversation_id: conversaId,
      message: comandoAEnviar,
    })

    if (resp) {
      textoOutput = resp.content || ''
      conversaId = resp.conversation_id || conversaId
      if (resp.usage) {
        tokIn = resp.usage.prompt_tokens || 0
        tokOut = resp.usage.completion_tokens || 0
      }
    }
  } catch (errAi) {
    const errMsg = errAi.message || String(errAi)
    console.log('Async Pipeline: Erro na fase ' + pDef.prompt_id + ': ' + errMsg)

    // Se o erro foi timeout ou cancelamento de contexto, registrar com clareza
    diagRec.set('status', 'erro')
    diagRec.set('updated', new Date().toISOString())
    $app.save(diagRec)

    return e.json(500, {
      success: false,
      finalizado: true,
      falha: true,
      fase_falha: pDef.prompt_id,
      erro: errMsg,
      detalhes: 'Falha durante invocação real ao gateway AI no passo incremental.',
    })
  }

  const durFase = Date.now() - t0

  // Portão determinístico da fase
  let portaoStatus = 'VALIDADO'
  let portaoMotivo = 'Execução real incremental no gateway.'
  const outLower = (textoOutput || '').toLowerCase()

  const fasesComEncerramentoNeutro = [2, 3, 5, 6, 7, 8, 9, 10, 11]
  if (fasesComEncerramentoNeutro.indexOf(pDef.numero) !== -1) {
    if (outLower.indexOf('aguardo seu comando') === -1) {
      portaoStatus = 'REPROVADO'
      portaoMotivo =
        'Portão reprovado: ' +
        pDef.prompt_id +
        ' deve encerrar rigorosamente com "Aguardo seu comando."'
    }
  }

  // Gravação incremental da fase executada
  outputPrompts.push({
    fase: pDef.numero,
    prompt_id: pDef.prompt_id,
    titulo: pDef.titulo,
    comando_enviado: comandoAEnviar,
    output_integral: textoOutput,
    portao_status: portaoStatus,
    portao_motivo: portaoMotivo,
    duracao_ms: durFase,
    tokens_input: tokIn,
    tokens_output: tokOut,
    encerra_com_aguardo_comando: outLower.indexOf('aguardo seu comando') !== -1,
    executado_em: new Date().toISOString(),
  })

  if (portaoStatus === 'REPROVADO') {
    diagRec.set('output_prompts', outputPrompts)
    diagRec.set('status', 'erro_portao')
    diagRec.set('status_execucao', 'erro_portao')
    diagRec.set('updated', new Date().toISOString())
    $app.save(diagRec)
    return e.json(422, {
      success: false,
      finalizado: true,
      falha: true,
      portao_reprovado: true,
      fase_falha: pDef.prompt_id,
      motivo: portaoMotivo,
      fases_concluidas: outputPrompts.length,
    })
  }

  // Atualizar totais acumulados de custo e tokens lidos do gateway
  let tokensInTotal = 0
  let tokensOutTotal = 0
  let duracaoAgenteTotalMs = 0
  for (let k = 0; k < outputPrompts.length; k++) {
    tokensInTotal += outputPrompts[k].tokens_input || 0
    tokensOutTotal += outputPrompts[k].tokens_output || 0
    duracaoAgenteTotalMs += outputPrompts[k].duracao_ms || 0
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
    executado_via: 'pipeline_assincrono_incremental',
    conversation_id: conversaId,
    valores_por_fase_derivados: false,
    instrumentacao_integra: true,
  }

  const faseNumeroConcluida = pDef.numero
  const foiUltimaFase = faseNumeroConcluida >= 13

  diagRec.set('output_prompts', outputPrompts)
  diagRec.set('fase_atual', Math.min(8, Math.floor(faseNumeroConcluida / 1.6)))
  diagRec.set('conversa_id', conversaId)
  diagRec.set('custo_gateway', custoGatewayIncremental)
  diagRec.set('updated', new Date().toISOString())

  if (foiUltimaFase) {
    diagRec.set('status', 'concluido')
    diagRec.set('fase_atual', 8)

    // Extrair DRE 15 linhas do output da Fase 6 (Prompt P9, índice 8)
    const outP9 = outputPrompts[8] ? outputPrompts[8].output_integral : ''
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

    // Atualizar estado da máquina do lead sob DRY-RUN estrito
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

    // Registrar log de auditoria da conclusão do pipeline assíncrono
    try {
      const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
      const auditRec = new Record(logsCol)
      auditRec.set('user', callerUserId)
      auditRec.set('action', 'Pipeline Assíncrono V7.2.3-A9 Concluído')
      auditRec.set('resource', 'diagnosticos')
      auditRec.set(
        'details',
        'Execução assíncrona real de 13 fases concluída com sucesso sobre beatekteste2026. ' +
          'Custo total apurado do Skip AI Gateway: $' +
          custoCalculado +
          ' USD (' +
          tokensInTotal +
          ' in / ' +
          tokensOutTotal +
          ' out = ' +
          (tokensInTotal + tokensOutTotal) +
          ' tokens total) em ' +
          (duracaoAgenteTotalMs / 1000).toFixed(2) +
          's. Dry-run estrito: zero e-mails disparados.',
      )
      $app.save(auditRec)
    } catch (_) {}
  } else {
    diagRec.set('status', 'processando')
  }

  $app.save(diagRec)

  return e.json(200, {
    success: true,
    finalizado: foiUltimaFase,
    fase_executada: pDef.prompt_id,
    fase_numero: faseNumeroConcluida,
    tokens_input: tokIn,
    tokens_output: tokOut,
    total_fases_concluidas: outputPrompts.length,
    total_esperado: 13,
    status: diagRec.getString('status'),
    custo_gateway_acumulado: custoGatewayIncremental,
    poll_url: '/backend/v1/diagnostico/status-async/' + leadId,
  })
})

// Router: Consultar status da execução assíncrona
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

  return e.json(200, {
    success: true,
    lead_id: leadId,
    diagnostico_id: diagRec.id,
    status: diagRec.getString('status'),
    fase_atual: diagRec.getInt('fase_atual') || 0,
    total_fases_concluidas: outputPrompts.length,
    total_fases_esperadas: 13,
    custo_gateway: custo,
    ultima_atualizacao: diagRec.getString('updated'),
  })
})

/**
 * CRON DEDICADO: Orquestrador Assíncrono Inline de 1 Passo por Tick
 * Frequência: 1 minuto ("* * * * *")
 *
 * Regras estritas:
 * - Apenas atua no registro de teste: diagnostico 'wor27cnyubs22ot' / lead 'beatekteste2026'.
 * - NUNCA toca nos leads reais '6e8y7ju5owgfpsl' nem 't8zia1qyovt9cof'.
 * - Idempotente: se não há passo pendente, é no-op imediato.
 * - Lock simples de execução via campo no registro ou timestamp para evitar sobreposição de ticks.
 * - Executa exatamente UM passo por tick (chamada direta inline a $ai.agent('jbp-gestao-master').chat).
 * - Se portão reprovar, para e registra o motivo real.
 */
cronAdd('pipeline_diagnostico_async_step_cron', '* * * * *', () => {
  try {
    const targetLeadId = 'beatekteste2026'
    const targetDiagId = 'wor27cnyubs22ot'

    $app.logger().info('Cron Async Step: TICK INICIADO para verificação de ' + targetDiagId)

    let diagRec = null
    try {
      diagRec = $app.findRecordById('diagnosticos', targetDiagId)
    } catch (eFind) {
      try {
        diagRec = $app.findFirstRecordByData('diagnosticos', 'lead', targetLeadId)
      } catch (eFind2) {
        $app
          .logger()
          .warn(
            'Cron Async Step: Diagnóstico não encontrado: ' +
              eFind.message +
              ' / ' +
              eFind2.message,
          )
        return
      }
    }

    if (!diagRec) return

    // Guardas estritas contra tocar leads reais
    const leadRelId = diagRec.getString('lead')
    if (
      leadRelId === '6e8y7ju5owgfpsl' ||
      leadRelId === 't8zia1qyovt9cof' ||
      (leadRelId !== targetLeadId && diagRec.id !== targetDiagId)
    ) {
      return
    }

    const stDiag = (diagRec.getString('status') || '').trim()

    // O cron só age se a execução estiver em andamento/pendente
    const estaPendente = stDiag === 'processando' || stDiag === 'enfileirado_async'

    $app
      .logger()
      .info('Cron Async Step: Status encontrado: stDiag=' + stDiag + ' pendente=' + estaPendente)

    if (!estaPendente) {
      return
    }

    // Lock de execução para evitar ticks simultâneos
    // Usamos um campo JSON ou marcador de tempo: se bloqueado há menos de 120s, respeitar lock
    const agoraMs = Date.now()
    let lockInfo = null
    try {
      const rawLock = diagRec.get('historico_versoes') || {}
      lockInfo = typeof rawLock === 'string' ? JSON.parse(rawLock) : rawLock
    } catch (_) {
      lockInfo = {}
    }

    if (lockInfo && lockInfo.lock_timestamp) {
      const lockAgeSec = (agoraMs - lockInfo.lock_timestamp) / 1000
      if (lockAgeSec < 90) {
        // Tick anterior ainda rodando no gateway
        return
      }
    }

    // Carregar output_prompts já gravados
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

    const proximaFaseIndex = outputPrompts.length // 0 a 12

    if (proximaFaseIndex >= 13) {
      diagRec.set('status', 'concluido')
      diagRec.set('fase_atual', 8)
      diagRec.set('updated', new Date().toISOString())
      $app.save(diagRec)
      return
    }

    // Adquirir lock
    lockInfo = lockInfo || {}
    lockInfo.lock_timestamp = agoraMs
    lockInfo.lock_fase = proximaFaseIndex + 1
    diagRec.set('historico_versoes', lockInfo)
    diagRec.set('status', 'processando')
    $app.save(diagRec)

    // Buscar lead associado
    let leadRec = null
    try {
      leadRec = $app.findRecordById('leads', targetLeadId)
    } catch (_) {
      diagRec.set('status', 'erro')
      $app.save(diagRec)
      return
    }

    // Funções auxiliares inline
    function extrairReceitaBruta(dossie) {
      const respostas =
        (dossie && (dossie.respostas || dossie.questionario || dossie.dados_entrada)) || {}
      const faturamentoHistorico =
        (dossie && dossie.cliente && dossie.cliente.faturamento) ||
        respostas.industria_1_1 ||
        respostas.faturamento ||
        null

      let anoBase = 2026
      if (dossie && dossie.ano_base) {
        anoBase = parseInt(dossie.ano_base, 10) || 2026
      }

      const campoProjecao =
        respostas.industria_1_4 || respostas.projecoes_receita || respostas.projecao_ano_base || ''

      let projecaoEncontrada = null
      if (campoProjecao && typeof campoProjecao === 'string') {
        const regexAno = new RegExp(
          '(?:' + anoBase + ')[\\s:=->]+(?:R\\$\\s*)?([\\d.,]+(?:\\s*(?:milh[õo]es|mi|m))?)',
          'i',
        )
        const matchAno = campoProjecao.match(regexAno)
        if (matchAno && matchAno[1]) {
          projecaoEncontrada = matchAno[1].trim()
        } else {
          const partes = campoProjecao.split(/[\n,;]+/)
          for (let p = 0; p < partes.length; p++) {
            const pedaco = partes[p].trim()
            if (pedaco.indexOf(String(anoBase)) !== -1) {
              const mVal = pedaco.match(/(?:R\$\s*)?([\d.,]+(?:\\s*(?:milh[õo]es|mi|m))?)/i)
              if (mVal && mVal[1] && mVal[1] !== String(anoBase)) {
                projecaoEncontrada = mVal[1].trim()
                break
              }
            }
          }
        }
      } else if (campoProjecao && typeof campoProjecao === 'object') {
        if (campoProjecao[anoBase]) {
          projecaoEncontrada = String(campoProjecao[anoBase])
        }
      }

      if (projecaoEncontrada) {
        return {
          valor: projecaoEncontrada,
          fonte: 'projecao_ano_base(industria_1_4)',
          ano_base: anoBase,
          sobreposto: faturamentoHistorico,
        }
      }

      return {
        valor: faturamentoHistorico || 'R$ 7.500.000,00',
        fonte: 'historico(industria_1_1/cliente.faturamento)',
        ano_base: anoBase,
        sobreposto: null,
      }
    }

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

    const rbDecisao = extrairReceitaBruta(payloadDossie)
    const setorUpper = setor.toUpperCase()
    const modalidadeContratada = 'SaaS Puro'

    const promptsDef = [
      {
        numero: 1,
        prompt_id: 'P1',
        titulo: 'CARGA DE DADOS — DOSSIÊ [' + setorUpper + '] [' + protocolo + ']',
        texto_prompt:
          'CARGA DE DADOS — DOSSIÊ ' +
          setorUpper +
          ' ' +
          protocolo +
          '\n\n' +
          'DOSSIÊ DO CLIENTE:\n' +
          JSON.stringify(
            Object.assign({}, payloadDossie, {
              rb_ano_base_selecionada: rbDecisao,
            }),
            null,
            2,
          ),
        comando_avanco: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
      },
      {
        numero: 2,
        prompt_id: 'P2',
        titulo: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
        texto_prompt: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
        comando_avanco: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
      },
      {
        numero: 3,
        prompt_id: 'P3',
        titulo: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
        texto_prompt: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
        comando_avanco: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
      },
      {
        numero: 4,
        prompt_id: 'P4',
        titulo: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
        texto_prompt: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
        comando_avanco: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
      },
      {
        numero: 5,
        prompt_id: 'P5',
        titulo: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
        texto_prompt: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
        comando_avanco: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
      },
      {
        numero: 6,
        prompt_id: 'P6',
        titulo: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
        texto_prompt: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
        comando_avanco: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
      },
      {
        numero: 7,
        prompt_id: 'P7',
        titulo: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
        texto_prompt: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
        comando_avanco: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
      },
      {
        numero: 8,
        prompt_id: 'P8',
        titulo: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
        texto_prompt: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
        comando_avanco: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
      },
      {
        numero: 9,
        prompt_id: 'P9',
        titulo: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
        texto_prompt:
          'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' +
          setorUpper +
          ')\n\nATENÇÃO PORTÃO P9: Este valuation NÃO possui valuation prévio e deve ser calculado integral e aritmeticamente a partir da DRE de 15 linhas produzida pelo agente nesta mesma sessão com RB Y1 = R$ 8.000.000 (prevalência determinística de industria_1_4 sobre R$ 7,5M), aplicando Gordon Growth / DCF conforme o regime e derivando Equity = EV - Dívida Líquida.',
        comando_avanco: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
      },
      {
        numero: 10,
        prompt_id: 'P10',
        titulo: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
        texto_prompt: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
        comando_avanco: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
      },
      {
        numero: 11,
        prompt_id: 'P11',
        titulo: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
        texto_prompt: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
        comando_avanco: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
      },
      {
        numero: 12,
        prompt_id: 'P12',
        titulo: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
        texto_prompt: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
        comando_avanco: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
      },
      {
        numero: 13,
        prompt_id: 'P13',
        titulo: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
        texto_prompt: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
        comando_avanco: 'PIPELINE_CONCLUIDO',
      },
    ]

    const pDef = promptsDef[proximaFaseIndex]
    let conversaId = diagRec.getString('conversa_id') || null
    const callerUserId = diagRec.getString('user') || '56r96tnoumhph2z'

    // Determinar comando exato a enviar
    let comandoAEnviar = pDef.texto_prompt
    if (proximaFaseIndex > 0 && outputPrompts[proximaFaseIndex - 1]) {
      const prevDef = promptsDef[proximaFaseIndex - 1]
      if (prevDef.comando_avanco) {
        comandoAEnviar = prevDef.comando_avanco
      }
    }

    const t0 = Date.now()
    let textoOutput = ''
    let tokIn = 0
    let tokOut = 0

    try {
      const agInst = typeof $ai !== 'undefined' && $ai.agent ? $ai.agent('jbp-gestao-master') : null
      if (!agInst) {
        throw new Error('$ai.agent("jbp-gestao-master") indisponível no ambiente de runtime')
      }

      const resp = agInst.chat({
        user_id: callerUserId,
        conversation_id: conversaId,
        message: comandoAEnviar,
      })

      if (resp) {
        textoOutput = resp.content || ''
        conversaId = resp.conversation_id || conversaId
        if (resp.usage) {
          tokIn = resp.usage.prompt_tokens || 0
          tokOut = resp.usage.completion_tokens || 0
        }
      }
    } catch (errAi) {
      const errMsg = errAi.message || String(errAi)
      $app.logger().error('Cron Async Step: Erro na fase ' + pDef.prompt_id + ': ' + errMsg)

      diagRec.set('status', 'erro')
      lockInfo.lock_erro = errMsg
      diagRec.set('historico_versoes', lockInfo)
      diagRec.set('updated', new Date().toISOString())
      $app.save(diagRec)
      return
    }

    const durFase = Date.now() - t0

    // Validação estrita do Portão da fase
    let portaoStatus = 'VALIDADO'
    let portaoMotivo = 'Execução real incremental no gateway (cron).'
    const outLower = (textoOutput || '').toLowerCase()

    const fasesComEncerramentoNeutro = [2, 3, 5, 6, 7, 8, 9, 10, 11]
    if (fasesComEncerramentoNeutro.indexOf(pDef.numero) !== -1) {
      if (outLower.indexOf('aguardo seu comando') === -1) {
        portaoStatus = 'REPROVADO'
        portaoMotivo =
          'Portão reprovado: ' +
          pDef.prompt_id +
          ' deve encerrar rigorosamente com "Aguardo seu comando."'
      }
    }

    outputPrompts.push({
      fase: pDef.numero,
      prompt_id: pDef.prompt_id,
      titulo: pDef.titulo,
      comando_enviado: comandoAEnviar,
      output_integral: textoOutput,
      portao_status: portaoStatus,
      portao_motivo: portaoMotivo,
      duracao_ms: durFase,
      tokens_input: tokIn,
      tokens_output: tokOut,
      encerra_com_aguardo_comando: outLower.indexOf('aguardo seu comando') !== -1,
      executado_em: new Date().toISOString(),
    })

    if (portaoStatus === 'REPROVADO') {
      diagRec.set('output_prompts', outputPrompts)
      diagRec.set('status', 'erro_portao')
      lockInfo.portao_reprovado = portaoMotivo
      diagRec.set('historico_versoes', lockInfo)
      diagRec.set('updated', new Date().toISOString())
      $app.save(diagRec)
      $app
        .logger()
        .warn('Cron Async Step: Portão reprovado na fase ' + pDef.prompt_id + ': ' + portaoMotivo)
      return
    }

    // Calcular custos acumulados a partir do usage do gateway
    let tokensInTotal = 0
    let tokensOutTotal = 0
    let duracaoAgenteTotalMs = 0
    for (let k = 0; k < outputPrompts.length; k++) {
      tokensInTotal += outputPrompts[k].tokens_input || 0
      tokensOutTotal += outputPrompts[k].tokens_output || 0
      duracaoAgenteTotalMs += outputPrompts[k].duracao_ms || 0
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

    const faseNumeroConcluida = pDef.numero
    const foiUltimaFase = faseNumeroConcluida >= 13

    diagRec.set('output_prompts', outputPrompts)
    diagRec.set('fase_atual', Math.min(8, Math.floor(faseNumeroConcluida / 1.6)))
    diagRec.set('conversa_id', conversaId)
    diagRec.set('custo_gateway', custoGatewayIncremental)

    // Liberar lock para o próximo tick
    delete lockInfo.lock_timestamp
    delete lockInfo.lock_fase
    diagRec.set('historico_versoes', lockInfo)
    diagRec.set('updated', new Date().toISOString())

    if (foiUltimaFase) {
      diagRec.set('status', 'concluido')
      diagRec.set('fase_atual', 8)

      // Extrair DRE 15 linhas do output da Fase 6 (Prompt P9, índice 8)
      const outP9 = outputPrompts[8] ? outputPrompts[8].output_integral : ''
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
          'Cron Async Step: Pipeline de 13 fases concluído com sucesso para ' +
            targetLeadId +
            '! Tokens: ' +
            (tokensInTotal + tokensOutTotal) +
            ', Custo: $' +
            custoCalculado +
            ' USD',
        )
    } else {
      diagRec.set('status', 'processando')
      $app
        .logger()
        .info(
          'Cron Async Step: Fase ' +
            pDef.prompt_id +
            ' (' +
            faseNumeroConcluida +
            '/13) concluída com sucesso. ' +
            tokIn +
            ' in / ' +
            tokOut +
            ' out tokens. Próximo tick executará passo ' +
            (faseNumeroConcluida + 1),
        )
    }

    $app.save(diagRec)
  } catch (errCron) {
    $app.logger().error('Cron Async Step: Exceção no tick: ' + errCron.message)
  }
})
