migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    // Definir viewRule como vazia "" para permitir leitura pública ou acesso de arquivo sem exigir fileToken
    // ou manter listRule / createRule / updateRule / deleteRule como admin
    col.viewRule = ''
    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('leads')
      col.viewRule = "@request.auth.role = 'admin'"
      app.save(col)
    } catch (_) {}
  },
)
