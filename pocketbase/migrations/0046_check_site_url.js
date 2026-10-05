migrate(
  (app) => {
    let envSiteUrl = ''
    try {
      envSiteUrl = $os.getenv('SITE_URL') || ''
    } catch (e) {
      envSiteUrl = 'ERR:' + e.message
    }
    let secSiteUrl = ''
    try {
      secSiteUrl = $secrets.get('SITE_URL') || ''
    } catch (e) {
      secSiteUrl = 'ERR:' + e.message
    }

    const logsCol = app.findCollectionByNameOrId('logs_auditoria')
    let adminUser = null
    try {
      adminUser = app.findFirstRecordByData('users', 'role', 'admin')
    } catch (_) {}
    if (!adminUser) return

    const log = new Record(logsCol)
    log.set('user', adminUser.id)
    log.set('action', 'Migration 0046 Check')
    log.set('resource', 'leads')
    log.set('details', '0046: os(SITE_URL)=' + envSiteUrl + ' sec(SITE_URL)=' + secSiteUrl)
    app.save(log)
  },
  (app) => {},
)
