migrate(
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'joao.batista@qgassist.com.br')
      app.delete(record)
    } catch (_) {}
  },
  (app) => {},
)
