onRecordAfterUpdateSuccess((e) => {
  try {
    const userId = e.requestInfo ? e.requestInfo().auth?.id : ''
    if (!userId) return e.next()

    var changes = []
    var fields = ['title', 'content', 'priority', 'status']
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i]
      var oldVal = e.record.original().getString(f)
      var newVal = e.record.getString(f)
      if (oldVal !== newVal) {
        changes.push(f + ': "' + oldVal + '" → "' + newVal + '"')
      }
    }
    var tagsChanged = false
    try {
      var oldTags = JSON.stringify(e.record.original().get('tags') || [])
      var newTags = JSON.stringify(e.record.get('tags') || [])
      if (oldTags !== newTags) {
        tagsChanged = true
        changes.push('tags atualizadas')
      }
    } catch (_) {}

    if (changes.length === 0) return e.next()

    var details = 'Nota "' + e.record.getString('title') + '" editada: ' + changes.join(', ')

    var logsCol = $app.findCollectionByNameOrId('logs_auditoria')
    var record = new Record(logsCol)
    record.set('user', userId)
    record.set('action', 'Editou Nota')
    record.set('resource', 'notas_projeto')
    record.set('details', details)
    $app.save(record)
  } catch (err) {
    $app.logger().error('audit log update failed', 'error', err.message)
  }
  return e.next()
}, 'notas_projeto')
