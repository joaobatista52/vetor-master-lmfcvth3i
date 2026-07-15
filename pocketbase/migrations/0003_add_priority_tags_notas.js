migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('notas_projeto')

    if (!col.fields.getByName('priority')) {
      col.fields.add(
        new SelectField({
          name: 'priority',
          values: ['Alta', 'Média', 'Baixa'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('tags')) {
      col.fields.add(
        new JSONField({
          name: 'tags',
          maxSize: 50000,
        }),
      )
    }

    col.addIndex('idx_notas_projeto_priority', false, 'priority', '')
    col.addIndex('idx_notas_projeto_tags', false, 'tags', '')

    app.save(col)

    try {
      const records = app.findRecordsByFilter('notas_projeto', '1=1', '-created', 100, 0)
      var seedData = {
        'Definição de Escopo': { priority: 'Alta', tags: ['Plano de Ação', 'Estratégia'] },
        'Diretrizes de Design': { priority: 'Média', tags: ['Decisão Técnica', 'Design'] },
      }
      for (var i = 0; i < records.length; i++) {
        var r = records[i]
        var title = r.getString('title')
        var defaults = seedData[title] || { priority: 'Média', tags: ['Geral'] }
        if (!r.getString('priority')) {
          r.set('priority', defaults.priority)
        }
        if (!r.get('tags')) {
          r.set('tags', defaults.tags)
        }
        app.save(r)
      }
    } catch (_) {}
  },
  (app) => {
    const col = app.findCollectionByNameOrId('notas_projeto')
    col.removeIndex('idx_notas_projeto_priority')
    col.removeIndex('idx_notas_projeto_tags')
    app.save(col)
  },
)
