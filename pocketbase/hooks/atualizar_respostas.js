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
    // 1. Autenticação e autorização: replicar padrão da Fase 4 (role === 'admin')
    let authUser = null
    try {
      authUser = e.auth || (e.requestInfo && e.requestInfo().auth)
    } catch (_) {}

    let isAdmin = false
    if (authUser) {
      if (authUser.role === 'admin' || authUser.getString?.('role') === 'admin') {
        isAdmin = true
      }
    }

    if (!isAdmin) {
      return e.json(403, { erro: 'NAO_AUTORIZADO' })
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

    const chavesRespostas = Object.keys(respostasRecebidas)
    for (let i = 0; i < chavesRespostas.length; i++) {
      const idPergunta = chavesRespostas[i]
      const novaResposta = respostasRecebidas[idPergunta]

      // Verificar se a pergunta existe no dossiê armazenado (dados_entrada.respostas ou lead.respostas)
      const existeNoDossie = Object.prototype.hasOwnProperty.call(dossieRespostas, idPergunta)
      const existeNoLead = Object.prototype.hasOwnProperty.call(leadRespostas, idPergunta)

      if (existeNoDossie || existeNoLead) {
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

    // Se o lead foi atualizado, salvar o lead também preservando a consistência
    if (leadRec && perguntasAtualizadas.length > 0) {
      try {
        leadRec.set('respostas', leadRespostas)
        $app.save(leadRec)
      } catch (_) {}
    }

    // 6. Retorno 200 com estrutura estrita solicitada
    return e.json(200, {
      sucesso: true,
      perguntas_atualizadas: perguntasAtualizadas,
      perguntas_ignoradas: perguntasIgnoradas,
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
