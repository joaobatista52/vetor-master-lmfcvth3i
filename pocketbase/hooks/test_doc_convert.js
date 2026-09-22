onRecordAfterCreateSuccess((e) => {
  const content = e.record.getString('content')
  if (content !== 'TRIGGER_DOC_CONVERT_V2') return e.next()

  const pdfs = [
    {
      key: 'skill',
      url: 'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/2ea479b9-0fb0-4cf6-acbd-4fd598cfdfc0/skilljbproteirodeexecucao13prompts21set26-576e4.pdf',
    },
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
  ]

  const docsCol = $app.findCollectionByNameOrId('temp_docs')

  for (let i = 0; i < pdfs.length; i++) {
    const item = pdfs[i]
    try {
      const res = $http.send({ url: item.url, method: 'GET', timeout: 60 })
      const docRec = new Record(docsCol)
      docRec.set('nome', item.key)
      const file = $filesystem.fileFromBytes(res.body, item.key + '.pdf')
      docRec.set('arquivo', file)
      $app.save(docRec)

      const md = $documents.toMarkdown({ record: docRec, field: 'arquivo' })
      docRec.set('texto', md.markdown || '')
      $app.save(docRec)
    } catch (err) {
      const docRec = new Record(docsCol)
      docRec.set('nome', 'ERR_' + item.key)
      docRec.set('texto', err.message)
      $app.save(docRec)
    }
  }

  return e.next()
}, 'notas_projeto')
