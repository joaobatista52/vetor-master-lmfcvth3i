onRecordAfterUpdateSuccess((e) => {
  var tituloChanged = e.record.getString('titulo') !== e.record.original().getString('titulo')
  var autorChanged = e.record.getString('autor') !== e.record.original().getString('autor')
  var catChanged = e.record.getString('categoria') !== e.record.original().getString('categoria')
  var resumoChanged = e.record.getString('resumo') !== e.record.original().getString('resumo')
  if (!tituloChanged && !autorChanged && !catChanged && !resumoChanged) return e.next()
  var text = (
    e.record.getString('titulo') +
    '\n' +
    e.record.getString('autor') +
    '\n' +
    e.record.getString('categoria') +
    '\n' +
    e.record.getString('resumo')
  ).trim()
  if (!text) return e.next()
  try {
    var res = $ai.embed({ input: text })
    var record = $app.findRecordById('livros', e.record.id)
    record.set('vector', res.data[0].embedding)
    $app.save(record)
  } catch (err) {
    console.log('embedding failed for record ' + e.record.id, err.message)
  }
  return e.next()
}, 'livros')
