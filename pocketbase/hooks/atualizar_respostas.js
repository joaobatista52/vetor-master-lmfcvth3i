/// <reference path="../pb_data/types.d.ts" />

/**
 * ATUALIZAÇÃO DE RESPOSTAS DO CLIENTE — VETOR MASTER (FASE 5 CaaS)
 * Registra mudanças do dia a dia no dossiê do diagnóstico sem disparar reprocessamento.
 *
 * Rota: POST /backend/v1/diagnostico/atualizar-respostas/{leadId}
 *
 * Corpo esperado (JSON):
 * - respostas: obrigatório (objeto com pares id_da_pergunta: nova_resposta)
 * - motivo: obrigatório (texto com a justificativa da atualização)
 */

routerAdd('POST', '/backend/v1/diagnostico/atualizar-respostas/{leadId}', (e) => {
  try {
    // REGRA DE DEPLOY (JSVM — padrão E2-A): require() DENTRO do callback,
    // com path absoluto ${__hooks} — declarações de topo não são visíveis
    // dentro dos handlers do pool de VMs.
    const perm = require(`${__hooks}/permissao.js`)

    // 1. Autenticação e autorização (E0): papel admin OU consultor via helper verificarPermissao
    const gate = perm.exigirPermissao(e, 'atualizar_respostas', 'diagnostico')
    if (gate.resposta) {
      return gate.resposta
    }

    // 2. Validação de entrada
    let body = {}
    try {
      const rawBody = (e.requestInfo && e.requestInfo().body) || {}
      body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    } catch (_) {
      return e.json(400, { erro: 'RESPOSTAS_INVALIDAS' })
    }

    const respostasRecebidas = body ? body.respostas : null
    if (
      !respostasRecebidas ||
      typeof respostasRecebidas !== 'object' ||
      Array.isArray(respostasRecebidas) ||
      Object.keys(respostasRecebidas).length === 0
    ) {
      return e.json(400, { erro: 'RESPOSTAS_INVALIDAS' })
    }

    const motivoRecebido = body ? body.motivo : null
    if (
      !motivoRecebido ||
      typeof motivoRecebido !== 'string' ||
      motivoRecebido.trim().length === 0
    ) {
      return e.json(400, { erro: 'MOTIVO_OBRIGATORIO' })
    }

    const leadId = e.request.pathValue('leadId')
    if (!leadId) {
      return e.json(404, { erro: 'DIAGNOSTICO_NAO_ENCONTRADO' })
    }

    // ETAPA E2-B (Decisão 4): carregar também o lead (para versionamento)
    // e o usuário autenticado (criado_por), ANTES de qualquer mutação.
    let authUser = null
    try {
      authUser = e.auth || (e.requestInfo && e.requestInfo().auth) || null
    } catch (_) {
      authUser = null
    }

    // 3. Leitura do diagnóstico pelo leadId
    let diagRec = null
    try {
      diagRec = $app.findFirstRecordByData('diagnosticos', 'lead', leadId)
    } catch (_) {
      return e.json(404, { erro: 'DIAGNOSTICO_NAO_ENCONTRADO' })
    }

    if (!diagRec) {
      return e.json(404, { erro: 'DIAGNOSTICO_NAO_ENCONTRADO' })
    }

    // 4. Atualização das respostas
    // Extrair dados_entrada existente no registro de diagnosticos
    let dadosEntrada = {}
    try {
      const rawDados = diagRec.get('dados_entrada')
      if (typeof rawDados === 'string') {
        dadosEntrada = JSON.parse(rawDados) || {}
      } else if (rawDados && typeof rawDados === 'object' && !Array.isArray(rawDados)) {
        dadosEntrada = rawDados
      }
    } catch (_) {
      dadosEntrada = {}
    }

    // Obter ou inicializar o mapa de respostas dentro do dossiê
    let dossieRespostas = dadosEntrada.respostas
    if (!dossieRespostas || typeof dossieRespostas !== 'object' || Array.isArray(dossieRespostas)) {
      dossieRespostas = {}
    }

    // Obter mapa de controle de metadados das perguntas atualizadas (atualizada_em)
    let perguntasAtualizadasEm = dadosEntrada.perguntas_atualizadas_em
    if (
      !perguntasAtualizadasEm ||
      typeof perguntasAtualizadasEm !== 'object' ||
      Array.isArray(perguntasAtualizadasEm)
    ) {
      perguntasAtualizadasEm = {}
    }

    // Opcionalmente carregar respostas de leads correspondente se não encontradas no dossie de diagnosticos
    let leadRec = null
    let leadRespostas = {}
    try {
      leadRec = $app.findRecordById('leads', leadId)
      const rawLeadResp = leadRec ? leadRec.get('respostas') : null
      if (typeof rawLeadResp === 'string') {
        leadRespostas = JSON.parse(rawLeadResp) || {}
      } else if (rawLeadResp && typeof rawLeadResp === 'object' && !Array.isArray(rawLeadResp)) {
        leadRespostas = rawLeadResp
      }
    } catch (_) {
      leadRespostas = {}
    }

    const timestampIso = new Date().toISOString()
    const perguntasAtualizadas = []
    const perguntasIgnoradas = []

    // ETAPA E2-B (2.1): clone profundo do estado ANTERIOR — capturado ANTES de
    // qualquer mutação. Necessário porque dossieRespostas referencia o mesmo
    // objeto de dadosEntrada (comparação por valor, nunca por referência).
    let estadoAnteriorClone = {}
    try {
      estadoAnteriorClone = JSON.parse(JSON.stringify(dadosEntrada))
    } catch (_) {
      estadoAnteriorClone = {}
    }

    // ETAPA E2-B (2.3): só conta como mudança real quando o VALOR efetivamente
    // diverge do estado anterior (comparação por valor, nunca por referência).
    let houveMudancaReal = false

    const chavesRespostas = Object.keys(respostasRecebidas)
    for (let i = 0; i < chavesRespostas.length; i++) {
      const idPergunta = chavesRespostas[i]
      const novaResposta = respostasRecebidas[idPergunta]

      // Verificar se a pergunta existe no dossiê armazenado (dados_entrada.respostas ou lead.respostas)
      const existeNoDossie = Object.prototype.hasOwnProperty.call(dossieRespostas, idPergunta)
      const existeNoLead = Object.prototype.hasOwnProperty.call(leadRespostas, idPergunta)

      if (existeNoDossie || existeNoLead) {
        // Mudança real? compara o valor atual com o novo (deep, via JSON)
        const valorAtual = existeNoDossie ? dossieRespostas[idPergunta] : leadRespostas[idPergunta]
        const mudou =
          JSON.stringify(valorAtual === undefined ? null : valorAtual) !==
          JSON.stringify(novaResposta === undefined ? null : novaResposta)
        if (mudou) {
          houveMudancaReal = true
        }

        // Se existir no dossiê armazenado, atualiza o valor da resposta
        dossieRespostas[idPergunta] = novaResposta
        perguntasAtualizadasEm[idPergunta] = timestampIso
        perguntasAtualizadas.push(idPergunta)

        // Se o lead existir e possuir o campo, reflete também no lead correspondente
        if (leadRec && (existeNoLead || existeNoDossie)) {
          leadRespostas[idPergunta] = novaResposta
        }
      } else {
        // Se NÃO existir no dossiê, ignora silenciosamente e inclui seu id na lista perguntas_ignoradas
        perguntasIgnoradas.push(idPergunta)
      }
    }

    // 5. Registro da atualização
    // ETAPA E2-B (Decisão 4): VERSIONAMENTO ANTES da sobrescrita —
    // snapshot do estado ANTERIOR de dados_entrada em dossies_versoes,
    // criado SOMENTE se o novo estado divergir do anterior.
    const novoEstadoCompleto = {
      respostas: dossieRespostas,
      perguntas_atualizadas_em: perguntasAtualizadasEm,
      ultima_atualizacao_respostas: {
        data: timestampIso,
        motivo: motivoRecebido.trim(),
        perguntas_atualizadas: perguntasAtualizadas,
        perguntas_ignoradas: perguntasIgnoradas,
      },
    }

    // ETAPA E2-B (2.1): helper via require() DENTRO do callback (padrão E2-A).
    // snapshot = dados_entrada completo do ESTADO ANTERIOR (clone pré-mutação).
    // Se nada divergiu de valor, helper retorna 0 e NENHUMA versão é criada.
    let versaoCriada = 0
    if (houveMudancaReal) {
      const helper = require(`${__hooks}/dossie_versoes_helper.js`)
      const estadoAnterior = {
        respostas: estadoAnteriorClone.respostas,
        dados_completos: estadoAnteriorClone,
      }
      versaoCriada = helper.versionarDossieAntesDeSobrescrever(
        $app,
        leadRec || { id: leadId },
        novoEstadoCompleto,
        {
          snapshot: estadoAnterior,
          motivo: 'atualizacao_respostas',
          criadoPor: authUser ? authUser.id : null,
        },
      )
    }

    dadosEntrada.respostas = dossieRespostas
    dadosEntrada.perguntas_atualizadas_em = perguntasAtualizadasEm

    const rastroOperacao = {
      data: timestampIso,
      motivo: motivoRecebido.trim(),
      perguntas_atualizadas: perguntasAtualizadas,
      perguntas_ignoradas: perguntasIgnoradas,
    }

    dadosEntrada.ultima_atualizacao_respostas = rastroOperacao

    diagRec.set('dados_entrada', dadosEntrada)

    // Grava exclusivamente via $app.save sem tocar output_prompts, fase_atual ou status
    $app.save(diagRec)

    console.log('[atualizar-respostas] Estado gravado', {
      lead: leadId,
      versao_criada: versaoCriada,
      sem_alteracao: versaoCriada === 0,
    })

    // Se o lead foi atualizado, salvar o lead também preservando a consistência
    if (leadRec && perguntasAtualizadas.length > 0) {
      try {
        leadRec.set('respostas', leadRespostas)
        $app.save(leadRec)
      } catch (_) {}
    }

    // 6. Retorno 200 com estrutura estrita solicitada
    // ETAPA E2-B (2.3): sem mudança real => sem_alteracao: true, sem versão criada.
    if (perguntasAtualizadas.length === 0) {
      return e.json(200, {
        sucesso: true,
        sem_alteracao: true,
        perguntas_atualizadas: [],
        perguntas_ignoradas: perguntasIgnoradas,
        versao_criada: 0,
        aviso: 'Nenhuma resposta efetivamente alterada — nenhuma versão do dossiê foi criada.',
      })
    }

    return e.json(200, {
      sucesso: true,
      sem_alteracao: false,
      perguntas_atualizadas: perguntasAtualizadas,
      perguntas_ignoradas: perguntasIgnoradas,
      versao_criada: versaoCriada,
      aviso:
        'Respostas atualizadas. O diagnóstico não foi reprocessado — acione o consultor para reprocessar as fases afetadas.',
    })
  } catch (errGeral) {
    return e.json(500, {
      sucesso: false,
      erro: 'FALHA_ATUALIZACAO_RESPOSTAS',
      motivo: errGeral ? errGeral.message || String(errGeral) : 'Erro desconhecido',
    })
  }
})
