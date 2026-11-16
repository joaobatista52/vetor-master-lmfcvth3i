// TEMP (E3-A-2-CLOSE) — sonda de diagnóstico da IA: rota GET única que chama o
// agente nativo jbp-gestao-master exatamente como o Etapa 5 chama (user_id real
// + message) e devolve o resultado/erro bruto na resposta HTTP. Existe APENAS
// para evidenciar por que blocos_ia veio vazio no Teste 5. Remoção: junto com
// e3a2_exercitador_temp.js no fechamento da rodada.
routerAdd('GET', '/backend/v1/dossie/e3a2-ia-probe-temp', (e) => {
  let idUsuario = null
  let erroLookup = null
  try {
    idUsuario = $app.findFirstRecordByFilter(
      'users',
      "email = 'svc-pipeline@vetormaster.com.br'",
    ).id
  } catch (errL) {
    erroLookup = (errL && errL.message) || String(errL)
  }
  if (!idUsuario) {
    return e.json(200, { ok: false, etapa: 'lookup_user', erro_lookup: erroLookup })
  }
  let temAi = typeof $ai !== 'undefined'
  let temAgent = false
  try {
    temAgent = temAi && !!$ai.agent
  } catch (_) {}
  if (!temAi || !temAgent) {
    return e.json(200, { ok: false, etapa: 'disponibilidade', tem_ai: temAi, tem_agent: temAgent })
  }
  const t0 = Date.now()
  try {
    const resp = $ai.agent('jbp-gestao-master').chat({
      user_id: idUsuario,
      message:
        'Teste de sonda E3-A-2: responda em uma única frase, sem citação acadêmica, o que é causa raiz em um diagnóstico estratégico.',
    })
    const texto = (resp && resp.content) || ''
    return e.json(200, {
      ok: !!texto,
      user_id: idUsuario,
      duracao_ms: Date.now() - t0,
      usage: resp && resp.usage ? resp.usage : null,
      content_preview: String(texto).substring(0, 400),
      resp_keys: resp ? Object.keys(resp) : [],
    })
  } catch (errIa) {
    return e.json(200, {
      ok: false,
      user_id: idUsuario,
      duracao_ms: Date.now() - t0,
      erro: (errIa && errIa.message) || String(errIa),
    })
  }
})
