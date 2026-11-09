/// <reference lib="dom" />
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    col.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'consultor'"
    app.save(col)
    console.log('[0104] leads.listRule =', app.findCollectionByNameOrId('leads').listRule)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    col.listRule = "@request.auth.role = 'admin'"
    app.save(col)
  },
)
