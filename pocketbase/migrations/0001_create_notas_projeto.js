migrate(
  (app) => {
    const collection = new Collection({
      name: 'notas_projeto',
      type: 'base',
      listRule: '@request.auth.id = user.id',
      viewRule: '@request.auth.id = user.id',
      createRule: '@request.auth.id = user.id',
      updateRule: '@request.auth.id = user.id',
      deleteRule: '@request.auth.id = user.id',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'text', required: true },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          minSelect: 0,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_notas_projeto_user ON notas_projeto (user)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('notas_projeto')
    app.delete(collection)
  },
)
