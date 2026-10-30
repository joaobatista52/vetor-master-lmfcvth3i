migrate(
  (app) => {
    try {
      app.findCollectionByNameOrId('diagnostico_fases')
      return
    } catch (_) {}

    const diagId = app.findCollectionByNameOrId('diagnosticos').id
    const leadsId = app.findCollectionByNameOrId('leads').id

    const diagnosticoFases = new Collection({
      name: 'diagnostico_fases',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'diagnostico',
          type: 'relation',
          collectionId: diagId,
          required: true,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: 'lead',
          type: 'relation',
          collectionId: leadsId,
          required: true,
          maxSelect: 1,
          cascadeDelete: false,
        },
        {
          name: 'fase',
          type: 'number',
          required: true,
          min: 1,
          max: 13,
          onlyInt: true,
        },
        {
          name: 'versao',
          type: 'number',
          required: true,
          min: 1,
          onlyInt: true,
        },
        {
          name: 'output',
          type: 'json',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          values: ['executada', 'aprovada', 'reprocessada', 'desatualizada'],
          maxSelect: 1,
        },
        {
          name: 'consultor_id',
          type: 'text',
        },
        {
          name: 'motivo_reprocessamento',
          type: 'text',
        },
        {
          name: 'cascata_aplicada',
          type: 'select',
          values: ['total', 'seletiva', 'nenhuma'],
          maxSelect: 1,
        },
        {
          name: 'executado_via',
          type: 'select',
          values: ['pipeline_inicial', 'reprocessamento_consultor'],
          maxSelect: 1,
        },
        {
          name: 'custo_gateway',
          type: 'json',
        },
        {
          name: 'created',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_diagnostico_fases_diag_fase_versao ON diagnostico_fases (diagnostico, fase, versao)',
      ],
    })

    app.save(diagnosticoFases)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('diagnostico_fases')
      app.delete(col)
    } catch (_) {}
  },
)
