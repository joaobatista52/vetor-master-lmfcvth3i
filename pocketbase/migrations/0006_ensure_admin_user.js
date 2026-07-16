migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'joao.batista@qgassist.com.br')
    } catch (_) {
      userRecord = new Record(usersCol)
      userRecord.setEmail('joao.batista@qgassist.com.br')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Admin')
      app.save(userRecord)
    }

    if (userRecord.getString('role') !== 'admin') {
      userRecord.set('role', 'admin')
      app.save(userRecord)
    }
  },
  (app) => {
    try {
      const userRecord = app.findAuthRecordByEmail(
        '_pb_users_auth_',
        'joao.batista@qgassist.com.br',
      )
      userRecord.set('role', 'user')
      app.save(userRecord)
    } catch (_) {}
  },
)
