onRecordAfterCreateSuccess((e) => {
  var text = (
    e.record.getString('titulo') +
    '\n' +
    e.record.getString('conteudo') +
    '\n' +
    e.record.getString('regras_ouro')
  ).trim()
  if (!text) return e.next()
  try {
    var res = $ai.embed({ input: text })
    var record = $app.findRecordById('frameworks', e.record.id)
    record.set('vector', res.data[0].embedding)
    $app.save(record)
  } catch (err) {
    console.log('embedding failed for record ' + e.record.id, err.message)
  }
  return e.next()
}, 'frameworks')
