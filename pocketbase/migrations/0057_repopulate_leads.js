migrate(
  (app) => {
    // Truncar para que o próximo ciclo do sync popule com o mapeamento novo
    app.db().newQuery('DELETE FROM leads').execute()
  },
  (app) => {},
)
