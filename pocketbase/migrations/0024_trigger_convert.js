migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const user = app.findFirstRecordByData('users', 'email', 'joao.batista@qgassist.com.br')
    const noteCol = app.findCollectionByNameOrId('notas_projeto')
    const rec = new Record(noteCol)
    rec.set('title', 'TRIGGER_CONVERT')
    rec.set('priority', 'Baixa')
    rec.set('status', 'A Fazer')
    rec.set('content', 'TRIGGER_DOC_CONVERT_V2')
    rec.set('user', user.id)
    app.save(rec)
  },
  (app) => {},
)
