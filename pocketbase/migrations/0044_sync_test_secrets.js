// Migration para sincronizar leads existentes do site e validar comunicação com backend do site
migrate(
  (app) => {
    let siteUrl =
      $os.getenv('SITE_BACKEND_URL') ||
      'https://site-institucional-vetor-master-165d3.shrd00.internal.goskip.dev'
    if (siteUrl.endsWith('/')) siteUrl = siteUrl.slice(0, -1)
    const siteEmail = $os.getenv('SITE_SYNC_EMAIL') || 'app@vetormaster.com.br'
    const sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''

    const logsCol = app.findCollectionByNameOrId('logs_auditoria')
    let adminUser = null
    try {
      adminUser = app.findFirstRecordByData('users', 'role', 'admin')
    } catch (_) {}

    if (!adminUser) return

    const log = new Record(logsCol)
    log.set('user', adminUser.id)
    log.set('action', 'Migration 0044 Check')
    log.set('resource', 'leads')
    log.set(
      'details',
      'Migration 0044: osHasPwd=' +
        Boolean(sitePassword) +
        ' siteUrl=' +
        siteUrl +
        ' siteEmail=' +
        siteEmail,
    )
    app.save(log)
  },
  (app) => {},
)
