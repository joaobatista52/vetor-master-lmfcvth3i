/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // 1. Campo 'historico_versoes' na coleção 'diagnosticos' (Adendo III - Atualização Incremental)
    const diagCol = app.findCollectionByNameOrId('diagnosticos')
    if (!diagCol.fields.getByName('historico_versoes')) {
      diagCol.fields.add(new Field({ name: 'historico_versoes', type: 'json' }))
    }
    if (!diagCol.fields.getByName('versao_incremental')) {
      diagCol.fields.add(new Field({ name: 'versao_incremental', type: 'number' }))
    }
    app.save(diagCol)

    // 2. Coleção 'bibliocompanion_consultas' para registrar consultas conceituais e fronteira
    try {
      app.findCollectionByNameOrId('bibliocompanion_consultas')
    } catch (_) {
      const col = new Collection({
        name: 'bibliocompanion_consultas',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id = user.id || @request.auth.role = "admin"',
        deleteRule: '@request.auth.role = "admin"',
        fields: [
          { name: 'user', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
          { name: 'pergunta', type: 'text', required: true },
          { name: 'resposta', type: 'text' },
          { name: 'tema_conceitual', type: 'text' },
          { name: 'camada', type: 'text' }, // '1_conceito' | '2_metodologia' | '3_socratico'
          { name: 'obras_referenciadas', type: 'json' },
          { name: 'barreira_consultoria_acionada', type: 'bool' },
        ],
      })
      app.save(col)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('bibliocompanion_consultas')
      app.delete(col)
    } catch (_) {}
  },
)
