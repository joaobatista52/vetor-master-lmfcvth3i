migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'joao.batista@qgassist.com.br')
    } catch (_) {
      userRecord = new Record(users)
      userRecord.setEmail('joao.batista@qgassist.com.br')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Admin')
      app.save(userRecord)
    }

    const notasCol = app.findCollectionByNameOrId('notas_projeto')

    const seedNotes = [
      {
        title: 'Definição de Escopo',
        content:
          'Este documento consolida o escopo inicial do projeto Vetor Master. Inclui os objetivos principais, stakeholders identificados e marcos estratégicos definidos na reunião de alinhamento. Próximo passo: validar com a liderança antes de distribuir para o time.',
      },
      {
        title: 'Diretrizes de Design',
        content:
          'A paleta oficial do produto utiliza Azul Estratégico (#3B82F6), Verde Crescimento (#10B981) e Expert Navy (#1E293B). A tipografia padrão é Inter. Todos os componentes devem seguir o design system estabelecido, garantindo consistência visual em desktop e mobile.',
      },
    ]

    for (const note of seedNotes) {
      try {
        app.findFirstRecordByData('notas_projeto', 'title', note.title)
      } catch (_) {
        const record = new Record(notasCol)
        record.set('title', note.title)
        record.set('content', note.content)
        record.set('user', userRecord.id)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      const notes = app.findRecordsByFilter('notas_projeto', '1=1', '-created', 100, 0)
      for (const n of notes) {
        app.delete(n)
      }
    } catch (_) {}

    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'joao.batista@qgassist.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
