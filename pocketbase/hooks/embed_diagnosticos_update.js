onRecordAfterUpdateSuccess((e) => {
  var dadosChanged =
    JSON.stringify(e.record.get('dados_entrada')) !==
    JSON.stringify(e.record.original().get('dados_entrada'))
  var relatorioChanged =
    e.record.getString('relatorio_gerado') !== e.record.original().getString('relatorio_gerado')
  if (!dadosChanged && !relatorioChanged) return e.next()
  var dados = e.record.get('dados_entrada')
  var dadosStr = dados ? JSON.stringify(dados) : ''
  var relatorio = e.record.getString('relatorio_gerado')
  var text = (dadosStr + '\n' + relatorio).trim()
  if (!text) return e.next()
  try {
    var res = $ai.embed({ input: text })
    var record = $app.findRecordById('diagnosticos', e.record.id)
    record.set('vector', res.data[0].embedding)
    $app.save(record)
  } catch (err) {
    console.log('embedding failed for record ' + e.record.id, err.message)
  }
  return e.next()
}, 'diagnosticos')
