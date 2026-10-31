migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('diagnostico_fases')
    if (!col.fields.getByName('artefatos')) {
      col.fields.add(
        new JSONField({
          name: 'artefatos',
          required: false,
        }),
      )
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('diagnostico_fases')
    if (col.fields.getByName('artefatos')) {
      col.fields.removeByName('artefatos')
      app.save(col)
    }
  },
)
