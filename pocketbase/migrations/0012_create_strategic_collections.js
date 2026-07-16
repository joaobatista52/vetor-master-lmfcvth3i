migrate(
  (app) => {
    const livros = new Collection({
      name: 'livros',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'titulo', type: 'text', required: true },
        { name: 'autor', type: 'text', required: true },
        { name: 'categoria', type: 'text' },
        { name: 'resumo', type: 'text' },
        {
          name: 'capa',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png'],
        },
        { name: 'vector', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [],
    })
    app.save(livros)

    const frameworks = new Collection({
      name: 'frameworks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'area_numero', type: 'number', required: true, min: 1, max: 7, onlyInt: true },
        { name: 'titulo', type: 'text', required: true },
        { name: 'conteudo', type: 'text', required: true },
        { name: 'regras_ouro', type: 'text' },
        { name: 'vector', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_frameworks_area ON frameworks (area_numero)'],
    })
    app.save(frameworks)

    const livrosId = app.findCollectionByNameOrId('livros').id
    const frameworksId = app.findCollectionByNameOrId('frameworks').id

    const dores = new Collection({
      name: 'mapeamento_dores',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'descricao_dor', type: 'text', required: true },
        { name: 'framework', type: 'relation', collectionId: frameworksId, maxSelect: 1 },
        { name: 'livros_referencia', type: 'relation', collectionId: livrosId, maxSelect: 10 },
        { name: 'vector', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [],
    })
    app.save(dores)

    const diagnosticos = new Collection({
      name: 'diagnosticos',
      type: 'base',
      listRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      viewRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      deleteRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'dados_entrada', type: 'json' },
        { name: 'relatorio_gerado', type: 'text' },
        { name: 'vector', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_diagnosticos_user ON diagnosticos (user)'],
    })
    app.save(diagnosticos)

    const diagId = app.findCollectionByNameOrId('diagnosticos').id

    const planos = new Collection({
      name: 'planos_acao',
      type: 'base',
      listRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      viewRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      deleteRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'diagnostico', type: 'relation', collectionId: diagId, maxSelect: 1 },
        { name: 'tarefas_5w2h', type: 'json' },
        {
          name: 'status',
          type: 'select',
          values: ['A Fazer', 'Em Progresso', 'Concluído'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_planos_acao_user ON planos_acao (user)',
        'CREATE INDEX idx_planos_acao_status ON planos_acao (status)',
      ],
    })
    app.save(planos)

    const okrs = new Collection({
      name: 'okrs',
      type: 'base',
      listRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      viewRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      deleteRule: "user = @request.auth.id || @request.auth.role = 'admin'",
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'objetivo', type: 'text', required: true },
        { name: 'resultados_chave', type: 'json' },
        { name: 'progresso', type: 'number', min: 0, max: 100, onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_okrs_user ON okrs (user)'],
    })
    app.save(okrs)
  },
  (app) => {
    var names = ['okrs', 'planos_acao', 'diagnosticos', 'mapeamento_dores', 'frameworks', 'livros']
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (_) {}
    }
  },
)
