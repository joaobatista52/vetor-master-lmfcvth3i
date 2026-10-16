migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    if (!col.fields.getByName('membro_fundador')) {
      col.fields.add(new BoolField({ name: 'membro_fundador', required: false }))
    }
    if (!col.fields.getByName('checkpoint_valido_ate')) {
      col.fields.add(new DateField({ name: 'checkpoint_valido_ate', required: false }))
    }
    app.save(col)

    // Backfill idempotente: leads com Origem 'Lista de Prioridade SaaS' recebem membro_fundador=true
    try {
      app
        .db()
        .newQuery(`
      UPDATE leads 
      SET membro_fundador = 1 
      WHERE (
        origem LIKE '%Prioridade%' 
        OR origem_tipo LIKE '%prioridade%' 
        OR dados_completos LIKE '%Prioridade%' 
        OR respostas LIKE '%Lista de Prioridade SaaS%' 
        OR respostas LIKE '%condicao_fundador_solicitada%'
      ) AND (membro_fundador IS NULL OR membro_fundador = 0)
    `)
        .execute()
    } catch (_) {}
  },
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    if (col.fields.getByName('membro_fundador')) {
      col.fields.removeByName('membro_fundador')
    }
    if (col.fields.getByName('checkpoint_valido_ate')) {
      col.fields.removeByName('checkpoint_valido_ate')
    }
    app.save(col)
  },
)
