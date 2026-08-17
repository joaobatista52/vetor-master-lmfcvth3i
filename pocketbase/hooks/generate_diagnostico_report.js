onRecordAfterCreateSuccess((e) => {
  var dados = e.record.get('dados_entrada')
  if (!dados) return e.next()

  var userId = e.record.getString('user')
  var dadosStr = typeof dados === 'string' ? dados : JSON.stringify(dados)

  // V6.5 — Instrui o agente a usar o Bloco Setorial parametrizavel (3 Pilares)
  // e as micro-epifanias do setor selecionado pelo lead.
  var messageText =
    'Contexto: JBP Gestao Master V6.5. Analise os dados de diagnostico abaixo (incluindo o setor e as respostas do Questionario Estrutural dos 3 Pilares) e gere o Diagnostico Executivo Estrategico com Heat Map das 8 areas, conforme o formato JSON especificado. Use as micro-epifanias do setor para gerar urgencia. Lembre-se: diagnostico gratuito = apenas dores + heat map + teaser (sem 5W2H/OKRs/financas detalhadas).\n\n' +
    dadosStr

  try {
    var result = $ai.agent('jbp-gestao-master').chat({
      user_id: userId,
      conversation_id: null,
      message: messageText,
    })

    var content = result.content || ''
    var relatorio = content
    var heatMap = null

    var jsonStart = content.indexOf('{')
    var jsonEnd = content.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      var jsonStr = content.substring(jsonStart, jsonEnd + 1)
      try {
        var parsed = JSON.parse(jsonStr)
        if (parsed.relatorio) relatorio = parsed.relatorio
        if (parsed.heat_map) heatMap = parsed.heat_map
      } catch (_) {}
    }

    var record = $app.findRecordById('diagnosticos', e.record.id)
    record.set('relatorio_gerado', relatorio)
    record.set('fase_atual', 1)

    if (heatMap) {
      var existingDados = record.get('dados_entrada')
      if (!existingDados || typeof existingDados !== 'object') {
        existingDados = {}
      }
      existingDados.heat_map = heatMap
      record.set('dados_entrada', existingDados)
    }

    $app.save(record)
  } catch (err) {
    var fallbackRecord = $app.findRecordById('diagnosticos', e.record.id)
    fallbackRecord.set(
      'relatorio_gerado',
      '## Diagnostico em Processamento\n\nSeu diagnostico estrategico V6.5 esta sendo processado. Nossa equipe foi notificada e em breve seu relatorio estara disponivel.',
    )
    $app.save(fallbackRecord)
    console.log('diagnosis report generation failed for record ' + e.record.id + ': ' + err.message)
  }

  return e.next()
}, 'diagnosticos')
