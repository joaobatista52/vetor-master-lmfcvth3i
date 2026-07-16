migrate(
  (app) => {
    const logsCol = app.findCollectionByNameOrId('logs_auditoria')
    logsCol.addIndex('idx_logs_auditoria_user', false, 'user', '')
    app.save(logsCol)

    const convitesCol = app.findCollectionByNameOrId('convites')
    convitesCol.addIndex('idx_convites_email', true, 'email', '')
    app.save(convitesCol)
  },
  (app) => {
    const logsCol = app.findCollectionByNameOrId('logs_auditoria')
    logsCol.removeIndex('idx_logs_auditoria_user')
    app.save(logsCol)

    const convitesCol = app.findCollectionByNameOrId('convites')
    convitesCol.removeIndex('idx_convites_email')
    app.save(convitesCol)
  },
)
