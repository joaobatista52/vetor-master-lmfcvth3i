migrate(
  (app) => {
    // dummy migration to see what $secrets or env has
    let secPwd = ''
    try {
      secPwd = $secrets.get('SITE_SYNC_PASSWORD') || ''
    } catch (e) {
      secPwd = 'ERR:' + e.message
    }
    let hasSec = false
    try {
      hasSec = $secrets.has('SITE_SYNC_PASSWORD')
    } catch (e) {
      hasSec = 'ERR:' + e.message
    }

    const logsCol = app.findCollectionByNameOrId('logs_auditoria')
    let adminUser = null
    try {
      adminUser = app.findFirstRecordByData('users', 'role', 'admin')
    } catch (_) {}
    if (!adminUser) return

    const log = new Record(logsCol)
    log.set('user', adminUser.id)
    log.set('action', 'Migration 0045 Check')
    log.set('resource', 'leads')
    log.set(
      'details',
      'Migration 0045: hasSec=' + hasSec + ' secPwdLen=' + (secPwd ? secPwd.length : 0),
    )
    app.save(log)
  },
  (app) => {},
)
