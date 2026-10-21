/// <reference path="../pb_data/types.d.ts" />

/**
 * Hook de Atendimento do Consultor Digital V7.2.3 — Onda 2
 *
 * Consome o agente nativo 'jbp-gestao-master' (System Prompt V7.2.3 + skill roteiro-execucao-13-prompts).
 * Suporta modo síncrono e streaming de eventos.
 * Rotas:
 * - POST /backend/v1/consultor/chat (síncrono)
 * - POST /backend/v1/consultor/chat-stream (streaming SSE)
 * - GET  /backend/v1/consultor/mensagens/{conversationId} (histórico)
 */

routerAdd(
  'POST',
  '/backend/v1/consultor/chat',
  (e) => {
    const authUser = e.authRecord
    if (!authUser) {
      return e.json(401, {
        success: false,
        error: 'Acesso restrito. Faça login para conversar com o Consultor Digital.',
      })
    }

    let body = {}
    try {
      body = e.requestInfo().body || {}
    } catch (_) {
      return e.json(400, { success: false, error: 'Corpo da requisição inválido.' })
    }

    const message = (body.message || '').trim()
    const conversationId = body.conversation_id || null
    const promptAtivo = body.prompt_ativo || null

    if (!message) {
      return e.json(400, { success: false, error: 'A mensagem do usuário é obrigatória.' })
    }

    // Contexto metodológico injetado caso haja prompt ativo (13 prompts)
    let mensagemComContexto = message
    if (promptAtivo) {
      mensagemComContexto = `[SITUAÇÃO / PORTÃO: ${promptAtivo}]\n${message}`
    }

    try {
      const result = $ai.agent('jbp-gestao-master').chat({
        user_id: authUser.id,
        conversation_id: conversationId,
        message: mensagemComContexto,
      })

      return e.json(200, {
        success: true,
        conversation_id: result.conversation_id,
        message_id: result.message_id,
        content: result.content,
        citations: result.citations || [],
      })
    } catch (err) {
      console.log('Erro no chat do Consultor Digital: ' + err.message)
      return e.json(500, {
        success: false,
        error: 'Falha ao processar mensagem com o Consultor Digital: ' + err.message,
      })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/consultor/chat-stream',
  (e) => {
    const authUser = e.authRecord
    if (!authUser) {
      return e.json(401, {
        success: false,
        error: 'Acesso restrito. Faça login para conversar com o Consultor Digital.',
      })
    }

    let body = {}
    try {
      body = e.requestInfo().body || {}
    } catch (_) {
      return e.json(400, { success: false, error: 'Corpo da requisição inválido.' })
    }

    const message = (body.message || '').trim()
    const promptAtivo = body.prompt_ativo || null

    if (!message) {
      return e.json(400, { success: false, error: 'A mensagem do usuário é obrigatória.' })
    }

    let mensagemComContexto = message
    if (promptAtivo) {
      mensagemComContexto = `[SITUAÇÃO / PORTÃO: ${promptAtivo}]\n${message}`
    }

    try {
      const conv = $ai.agent('jbp-gestao-master').getOrCreateConversation({
        user_id: authUser.id,
        id: body.conversation_id || null,
      })

      const iter = $ai.agent('jbp-gestao-master').chat({
        user_id: authUser.id,
        conversation_id: conv.id,
        message: mensagemComContexto,
        stream: true,
      })

      e.response.header().set('Content-Type', 'text/event-stream')
      e.response.header().set('Cache-Control', 'no-cache')
      e.response.header().set('X-Conversation-Id', conv.id)
      $response.stream(e, iter)
    } catch (err) {
      console.log('Erro no streaming do Consultor Digital: ' + err.message)
      return e.json(500, {
        success: false,
        error: 'Falha ao iniciar streaming com o Consultor Digital: ' + err.message,
      })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/consultor/mensagens/{conversationId}',
  (e) => {
    const authUser = e.authRecord
    if (!authUser) {
      return e.json(401, { success: false, error: 'Acesso restrito.' })
    }

    const conversationId = e.request.pathValue('conversationId')
    if (!conversationId) {
      return e.json(400, { success: false, error: 'ID da conversa obrigatório.' })
    }

    try {
      const msgs = $ai.agent('jbp-gestao-master').listMessages({
        conversation_id: conversationId,
        user_id: authUser.id,
        limit: 50,
      })

      return e.json(200, {
        success: true,
        messages: msgs,
      })
    } catch (err) {
      return e.json(404, {
        success: false,
        error: 'Conversa não encontrada ou sem permissão de visualização.',
      })
    }
  },
  $apis.requireAuth(),
)
