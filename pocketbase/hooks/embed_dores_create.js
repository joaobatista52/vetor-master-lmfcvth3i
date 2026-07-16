onRecordAfterCreateSuccess((e) => {
  var text = e.record.getString('descricao_dor').trim()
  if (!text) return e.next()
  try {
    var res = $ai.embed({ input: text })
    var record = $app.findRecordById('mapeamento_dores', e.record.id)
    record.set('vector', res.data[0].embedding)
    $app.save(record)
  } catch (err) {
    console.log('embedding failed for record ' + e.record.id, err.message)
  }
  return e.next()
}, 'mapeamento_dores')
