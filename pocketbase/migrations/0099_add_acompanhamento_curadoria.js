migrate(
  (app) => {
    const diagFasesCol = app.findCollectionByNameOrId('diagnostico_fases')
    const diagFasesId = diagFasesCol.id

    const planosCol = app.findCollectionByNameOrId('planos_acao')
    if (!planosCol.fields.getByName('fase_origem')) {
      planosCol.fields.add(
        new NumberField({
          name: 'fase_origem',
          min: 1,
          max: 13,
          onlyInt: true,
        }),
      )
    }
    if (!planosCol.fields.getByName('versao_diagnostico')) {
      planosCol.fields.add(
        new NumberField({
          name: 'versao_diagnostico',
          min: 1,
          onlyInt: true,
        }),
      )
    }
    if (!planosCol.fields.getByName('curadoria_vinculada')) {
      planosCol.fields.add(
        new RelationField({
          name: 'curadoria_vinculada',
          collectionId: diagFasesId,
          maxSelect: 1,
        }),
      )
    }
    app.save(planosCol)

    const okrsCol = app.findCollectionByNameOrId('okrs')
    if (!okrsCol.fields.getByName('fase_origem')) {
      okrsCol.fields.add(
        new NumberField({
          name: 'fase_origem',
          min: 1,
          max: 13,
          onlyInt: true,
        }),
      )
    }
    if (!okrsCol.fields.getByName('curadoria_vinculada')) {
      okrsCol.fields.add(
        new RelationField({
          name: 'curadoria_vinculada',
          collectionId: diagFasesId,
          maxSelect: 1,
        }),
      )
    }
    app.save(okrsCol)
  },
  (app) => {
    const planosCol = app.findCollectionByNameOrId('planos_acao')
    if (planosCol.fields.getByName('fase_origem')) {
      planosCol.fields.removeByName('fase_origem')
    }
    if (planosCol.fields.getByName('versao_diagnostico')) {
      planosCol.fields.removeByName('versao_diagnostico')
    }
    if (planosCol.fields.getByName('curadoria_vinculada')) {
      planosCol.fields.removeByName('curadoria_vinculada')
    }
    app.save(planosCol)

    const okrsCol = app.findCollectionByNameOrId('okrs')
    if (okrsCol.fields.getByName('fase_origem')) {
      okrsCol.fields.removeByName('fase_origem')
    }
    if (okrsCol.fields.getByName('curadoria_vinculada')) {
      okrsCol.fields.removeByName('curadoria_vinculada')
    }
    app.save(okrsCol)
  },
)
