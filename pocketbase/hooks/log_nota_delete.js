onRecordAfterDeleteSuccess((e) => {
  try {
    const userId = e.requestInfo ? e.requestInfo().auth?.id : ''
    if (!userId) return e.next()

    var logsCol = $app.findCollectionByNameOrId('logs_auditoria')
    var record = new Record(logsCol)
    record.set('user', userId)
    record.set('action', 'Excluiu Nota')
    record.set('resource', 'notas_projeto')
    record.set('details', 'Nota "' + e.record.getString('title') + '" foi excluída.')
    $app.save(record)
  } catch (err) {
    $app.logger().error('audit log delete failed', 'error', err.message)
  }
  return e.next()
}, 'notas_projeto')
