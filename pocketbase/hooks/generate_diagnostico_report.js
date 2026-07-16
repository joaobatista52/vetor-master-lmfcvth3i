onRecordAfterCreateSuccess((e) => {
  var dados = e.record.get('dados_entrada')
  if (!dados) return e.next()

  var userId = e.record.getString('user')
  var dadosStr = typeof dados === 'string' ? dados : JSON.stringify(dados)

  var messageText =
    'Analise os seguintes dados de diagnóstico empresarial e gere o relatório executivo estratégico com heat map conforme o formato JSON especificado:\n\n' +
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
      '## Diagnóstico em Processamento\n\nSeu diagnóstico estratégico está sendo processado. Nossa equipe foi notificada e em breve seu relatório estará disponível.',
    )
    $app.save(fallbackRecord)
    console.log('diagnosis report generation failed for record ' + e.record.id + ': ' + err.message)
  }

  return e.next()
}, 'diagnosticos')
