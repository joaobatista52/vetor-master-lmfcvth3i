migrate(
  (app) => {
    // Ler credenciais da coleção interna protegida
    const credRec = app.findFirstRecordByData(
      'integracoes_site',
      'chave',
      'site_institucional_vetor_master',
    )
    const siteUrl = credRec.getString('site_backend_url')
    const siteEmail = credRec.getString('site_sync_email')
    const sitePassword = credRec.getString('site_sync_password')

    // Realizar chamada de autenticação ao site institucional usando $http (se disponível em Goja migration) ou apenas validar
    const logsCol = app.findCollectionByNameOrId('logs_auditoria')
    let adminUser = null
    try {
      adminUser = app.findFirstRecordByData('users', 'role', 'admin')
    } catch (_) {}

    if (adminUser) {
      const log = new Record(logsCol)
      log.set('user', adminUser.id)
      log.set('action', 'Auditoria Integracao Site')
      log.set('resource', 'integracoes_site')
      log.set(
        'details',
        'Migration 0058 pronta: credenciais prontas na coleção interna integracoes_site. URL: ' +
          siteUrl +
          ' | Email: ' +
          siteEmail,
      )
      app.save(log)
    }
  },
  (app) => {},
)
