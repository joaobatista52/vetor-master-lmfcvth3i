migrate(
  (app) => {
    // 1. Add 'role' select field to users collection
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'user'],
          maxSelect: 1,
        }),
      )
    }
    app.save(usersCol)

    // 2. Set admin role on joao.batista@qgassist.com.br
    try {
      const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'joao.batista@qgassist.com.br')
      adminUser.set('role', 'admin')
      app.save(adminUser)
    } catch (_) {}

    // 3. Update notas_projeto rules to allow admin access
    const notasCol = app.findCollectionByNameOrId('notas_projeto')
    notasCol.listRule = 'user = @request.auth.id || @request.auth.role = "admin"'
    notasCol.viewRule = 'user = @request.auth.id || @request.auth.role = "admin"'
    notasCol.updateRule = 'user = @request.auth.id || @request.auth.role = "admin"'
    notasCol.deleteRule = 'user = @request.auth.id || @request.auth.role = "admin"'
    notasCol.createRule = '@request.auth.id = user.id || @request.auth.role = "admin"'
    app.save(notasCol)

    // 4. Update users rules — admin can list/view all, users can only see themselves
    usersCol.listRule = 'id = @request.auth.id || @request.auth.role = "admin"'
    usersCol.viewRule = 'id = @request.auth.id || @request.auth.role = "admin"'
    app.save(usersCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.listRule = 'id = @request.auth.id'
    usersCol.viewRule = 'id = @request.auth.id'
    app.save(usersCol)

    const notasCol = app.findCollectionByNameOrId('notas_projeto')
    notasCol.listRule = '@request.auth.id = user.id'
    notasCol.viewRule = '@request.auth.id = user.id'
    notasCol.updateRule = '@request.auth.id = user.id'
    notasCol.deleteRule = '@request.auth.id = user.id'
    notasCol.createRule = '@request.auth.id = user.id'
    app.save(notasCol)

    try {
      const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'joao.batista@qgassist.com.br')
      adminUser.set('role', 'user')
      app.save(adminUser)
    } catch (_) {}
  },
)
