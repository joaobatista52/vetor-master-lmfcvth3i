migrate(
  (app) => {
    // 1. Criar coleção integracoes_site protegida (apenas superusuários e admins)
    let integracoesCol
    try {
      integracoesCol = app.findCollectionByNameOrId('integracoes_site')
    } catch (_) {
      integracoesCol = new Collection({
        name: 'integracoes_site',
        type: 'base',
        listRule: "@request.auth.role = 'admin'",
        viewRule: "@request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
          { name: 'chave', type: 'text', required: true },
          { name: 'site_backend_url', type: 'text', required: true },
          { name: 'site_sync_email', type: 'text', required: true },
          { name: 'site_sync_password', type: 'text', required: true },
          { name: 'descricao', type: 'text' },
          { name: 'ativo', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_integracoes_site_chave ON integracoes_site (chave)'],
      })
      app.save(integracoesCol)
    }

    // 2. Gravar o registro das credenciais do site institucional Vetor Master
    const chavePadrao = 'site_institucional_vetor_master'
    const siteUrl = 'https://site-institucional-vetor-master-165d3.shrd00.internal.goskip.dev'
    const siteEmail = 'app@vetormaster.com.br'
    const sitePassword = 'VmApp#2026@SecureAccess!'

    let credRecord = null
    try {
      credRecord = app.findFirstRecordByData('integracoes_site', 'chave', chavePadrao)
    } catch (_) {}

    if (!credRecord) {
      credRecord = new Record(integracoesCol)
      credRecord.set('chave', chavePadrao)
    }

    credRecord.set('site_backend_url', siteUrl)
    credRecord.set('site_sync_email', siteEmail)
    credRecord.set('site_sync_password', sitePassword)
    credRecord.set('descricao', 'Credenciais internas para sincronização de leads Site ↔ App')
    credRecord.set('ativo', true)
    app.save(credRecord)

    // 3. Registrar log de auditoria
    try {
      const logsCol = app.findCollectionByNameOrId('logs_auditoria')
      let adminUser = null
      try {
        adminUser = app.findFirstRecordByData('users', 'role', 'admin')
      } catch (_) {}

      if (adminUser) {
        const log = new Record(logsCol)
        log.set('user', adminUser.id)
        log.set('action', 'Configuração de Integração Site')
        log.set('resource', 'integracoes_site')
        log.set(
          'details',
          'Coleção integracoes_site criada e credenciais do site institucional gravadas com sucesso.',
        )
        app.save(log)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('integracoes_site')
      app.delete(col)
    } catch (_) {}
  },
)
