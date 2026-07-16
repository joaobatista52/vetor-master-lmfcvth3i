onRecordAfterCreateSuccess((e) => {
  try {
    const userId = e.requestInfo ? e.requestInfo().auth?.id : ''
    if (!userId) return e.next()

    const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
    const record = new Record(logsCol)
    record.set('user', userId)
    record.set('action', 'Criou Nota')
    record.set('resource', 'notas_projeto')
    record.set('details', 'Nota "' + e.record.getString('title') + '" foi criada.')
    $app.save(record)
  } catch (err) {
    $app.logger().error('audit log create failed', 'error', err.message)
  }
  return e.next()
}, 'notas_projeto')
