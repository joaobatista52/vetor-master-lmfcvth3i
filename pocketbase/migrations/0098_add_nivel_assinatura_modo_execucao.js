migrate(
  (app) => {
    const leadsCol = app.findCollectionByNameOrId('leads')
    if (!leadsCol.fields.getByName('nivel_assinatura')) {
      leadsCol.fields.add(
        new SelectField({
          name: 'nivel_assinatura',
          values: ['SaaS Puro', 'MaaS Híbrido', 'Bespoke CaaS'],
          maxSelect: 1,
          required: false,
        }),
      )
      app.save(leadsCol)
    }

    const diagCol = app.findCollectionByNameOrId('diagnosticos')
    if (!diagCol.fields.getByName('modo_execucao')) {
      diagCol.fields.add(
        new SelectField({
          name: 'modo_execucao',
          values: ['completo', 'pausado'],
          maxSelect: 1,
          required: false,
        }),
      )
      app.save(diagCol)
    }
  },
  (app) => {
    const leadsCol = app.findCollectionByNameOrId('leads')
    if (leadsCol.fields.getByName('nivel_assinatura')) {
      leadsCol.fields.removeByName('nivel_assinatura')
      app.save(leadsCol)
    }

    const diagCol = app.findCollectionByNameOrId('diagnosticos')
    if (diagCol.fields.getByName('modo_execucao')) {
      diagCol.fields.removeByName('modo_execucao')
      app.save(diagCol)
    }
  },
)
