migrate(
  (app) => {
    const user = app.findFirstRecordByData('users', 'email', 'joao.batista@qgassist.com.br')
    const noteCol = app.findCollectionByNameOrId('notas_projeto')

    const res = $http.send({
      url: 'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/2ea479b9-0fb0-4cf6-acbd-4fd598cfdfc0/systenpromptjbpgmv7.2aplicado21set26-7d95c.pdf',
      method: 'GET',
      timeout: 30,
    })

    const note = new Record(noteCol)
    note.set('title', 'MIG_PROMPT_INFO')
    note.set('priority', 'Baixa')
    note.set('status', 'Concluído')
    note.set('user', user.id)
    note.set(
      'content',
      'status=' +
        res.statusCode +
        ' keys=' +
        Object.keys(res).join(',') +
        ' typeof_body=' +
        typeof res.body +
        ' str=' +
        String(res.body).substring(0, 100),
    )
    app.save(note)
  },
  (app) => {},
)
