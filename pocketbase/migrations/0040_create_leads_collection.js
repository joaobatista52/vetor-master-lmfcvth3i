migrate(
  (app) => {
    // Test if leads collection already exists
    try {
      app.findCollectionByNameOrId('leads')
      return // already exists
    } catch (_) {}

    const leadsCol = new Collection({
      name: 'leads',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'protocolo', type: 'text', required: true },
        { name: 'origem', type: 'text' },
        { name: 'origem_tipo', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'autorizacao_devolutiva', type: 'text' },
        { name: 'formato_interesse', type: 'text' },
        { name: 'nome_completo', type: 'text' },
        { name: 'razao_social', type: 'text' },
        { name: 'cnpj', type: 'text' },
        { name: 'cargo', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'whatsapp', type: 'text' },
        { name: 'setor', type: 'text' },
        { name: 'segmento', type: 'text' },
        { name: 'faturamento_mensal', type: 'text' },
        { name: 'plano_interesse', type: 'text' },
        { name: 'responsavel_envio', type: 'text' },
        { name: 'dados_completos', type: 'json' },
        { name: 'site_lead_id', type: 'text' },
        { name: 'site_created', type: 'text' },
        { name: 'site_updated', type: 'text' },
        { name: 'synced_at', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_leads_protocolo ON leads (protocolo)',
        'CREATE INDEX idx_leads_site_lead_id ON leads (site_lead_id)',
        'CREATE INDEX idx_leads_email ON leads (email)',
        'CREATE INDEX idx_leads_status ON leads (status)',
      ],
    })

    app.save(leadsCol)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('leads')
      app.delete(col)
    } catch (_) {}
  },
)
