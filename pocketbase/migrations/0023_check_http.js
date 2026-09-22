migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const user = app.findFirstRecordByData('users', 'email', 'joao.batista@qgassist.com.br')
    const noteCol = app.findCollectionByNameOrId('notas_projeto')

    const urls = [
      {
        key: 'prompt',
        url: 'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/2ea479b9-0fb0-4cf6-acbd-4fd598cfdfc0/systenpromptjbpgmv7.2aplicado21set26-7d95c.pdf',
      },
      {
        key: 'contexto',
        url: 'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/2ea479b9-0fb0-4cf6-acbd-4fd598cfdfc0/contextoestrategicoglobal12setoresv7.218set26-3cc39.pdf',
      },
      {
        key: 'framework',
        url: 'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/2ea479b9-0fb0-4cf6-acbd-4fd598cfdfc0/masterframework-consolidadov2.4jbpgestaomasterv7.218set26-d732d.pdf',
      },
      {
        key: 'questionarios',
        url: 'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/2ea479b9-0fb0-4cf6-acbd-4fd598cfdfc0/questionariosconsolidados12setoresv7.218set26-829a9.pdf',
      },
      {
        key: 'skill',
        url: 'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/2ea479b9-0fb0-4cf6-acbd-4fd598cfdfc0/skilljbproteirodeexecucao13prompts21set26-576e4.pdf',
      },
    ]

    const note = new Record(noteCol)
    note.set('title', 'MIGRATION_HTTP_CHECK')
    note.set('priority', 'Baixa')
    note.set('status', 'Concluído')
    note.set('user', user.id)
    note.set('content', typeof $http === 'undefined' ? 'NO_$http' : 'HAS_$http')
    app.save(note)
  },
  (app) => {},
)
