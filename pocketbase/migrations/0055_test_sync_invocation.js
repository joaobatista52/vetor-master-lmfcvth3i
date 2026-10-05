migrate(
  (app) => {
    // Disparar sincronização manual para teste com as credenciais gravadas
    const credRec = app.findFirstRecordByData(
      'integracoes_site',
      'chave',
      'site_institucional_vetor_master',
    )
    const siteUrl = credRec.getString('site_backend_url')
    const siteEmail = credRec.getString('site_sync_email')
    const sitePassword = credRec.getString('site_sync_password')

    const logsCol = app.findCollectionByNameOrId('logs_auditoria')
    let adminUser = null
    try {
      adminUser = app.findFirstRecordByData('users', 'role', 'admin')
    } catch (_) {}

    const logAudit = (action, details) => {
      if (!adminUser) return
      const log = new Record(logsCol)
      log.set('user', adminUser.id)
      log.set('action', action)
      log.set('resource', 'leads')
      log.set('details', details)
      app.save(log)
    }

    logAudit(
      'Trigger Sync Test Invocado',
      'Iniciando teste de sincronização manual via migration 0055 com credenciais da colecao_interna (' +
        siteUrl +
        ' / ' +
        siteEmail +
        ')',
    )
  },
  (app) => {},
)
