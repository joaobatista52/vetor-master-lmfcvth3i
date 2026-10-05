migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('leads')

    // 1. Campo respostas (JSON com respostas das etapas 1 a 11)
    if (!col.fields.getByName('respostas')) {
      col.fields.add(
        new JSONField({
          name: 'respostas',
          maxSize: 52428800, // 50MB
        }),
      )
    }

    // 2. Campo contrato_social (Grupo Sociedade/Complementares - arquivos múltiplos)
    if (!col.fields.getByName('contrato_social')) {
      col.fields.add(
        new FileField({
          name: 'contrato_social',
          maxSelect: 15,
          maxSize: 104857600, // 100MB
          mimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.oasis.opendocument.text',
            'application/vnd.oasis.opendocument.spreadsheet',
            'text/plain',
            'text/csv',
          ],
        }),
      )
    }

    // 3. Campo certificacoes (Grupo Relatórios Gerenciais / Certificações - arquivos múltiplos)
    if (!col.fields.getByName('certificacoes')) {
      col.fields.add(
        new FileField({
          name: 'certificacoes',
          maxSelect: 15,
          maxSize: 104857600, // 100MB
          mimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.oasis.opendocument.text',
            'application/vnd.oasis.opendocument.spreadsheet',
            'text/plain',
            'text/csv',
          ],
        }),
      )
    }

    // 4. Campo documentacao_adicional (Grupo Demonstrativos Financeiros / Adicionais - arquivos múltiplos)
    if (!col.fields.getByName('documentacao_adicional')) {
      col.fields.add(
        new FileField({
          name: 'documentacao_adicional',
          maxSelect: 15,
          maxSize: 104857600, // 100MB
          mimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.oasis.opendocument.text',
            'application/vnd.oasis.opendocument.spreadsheet',
            'text/plain',
            'text/csv',
          ],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('leads')
      const f1 = col.fields.getByName('respostas')
      if (f1) col.fields.removeByName('respostas')
      const f2 = col.fields.getByName('contrato_social')
      if (f2) col.fields.removeByName('contrato_social')
      const f3 = col.fields.getByName('certificacoes')
      if (f3) col.fields.removeByName('certificacoes')
      const f4 = col.fields.getByName('documentacao_adicional')
      if (f4) col.fields.removeByName('documentacao_adicional')
      app.save(col)
    } catch (_) {}
  },
)
