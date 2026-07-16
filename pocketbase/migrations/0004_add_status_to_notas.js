migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('notas_projeto')

    if (!col.fields.getByName('status')) {
      col.fields.add(
        new SelectField({
          name: 'status',
          values: ['A Fazer', 'Em Progresso', 'Concluído'],
          maxSelect: 1,
        }),
      )
    }

    col.addIndex('idx_notas_projeto_status', false, 'status', '')

    app.save(col)

    try {
      const records = app.findRecordsByFilter('notas_projeto', '1=1', '-created', 500, 0)
      for (var i = 0; i < records.length; i++) {
        var r = records[i]
        if (!r.getString('status')) {
          r.set('status', 'A Fazer')
          app.save(r)
        }
      }
    } catch (_) {}
  },
  (app) => {
    const col = app.findCollectionByNameOrId('notas_projeto')
    col.removeIndex('idx_notas_projeto_status')
    app.save(col)
  },
)
