// Sincronização automática e sob demanda da coleção 'leads' do Site Institucional para o App
// Frequência do cron: a cada minuto ("* * * * *")
// Endpoint manual sob demanda: POST /backend/v1/sync/leads (Requer Admin)
// Endpoint de teste/criação ponta-a-ponta: POST /backend/v1/sync/test-e2e (Requer Admin)

// Nota de arquitetura PocketBase/Goja:
// O JSVM executa callbacks em pools de VMs separados, portanto nenhuma função auxiliar no escopo do arquivo
// pode ser referenciada dentro de callbacks (routerAdd, cronAdd). A lógica de obtenção e cache de credenciais
// e download de arquivos fica auto-contida em cada callback.

cronAdd('sync_site_leads_cron', '* * * * *', () => {
  try {
    let siteUrl = ''
    let siteEmail = ''
    let sitePassword = ''
    let fonte = ''

    // 1. Tentar ler da coleção interna protegida 'integracoes_site'
    try {
      const credRec = $app.findFirstRecordByData(
        'integracoes_site',
        'chave',
        'site_institucional_vetor_master',
      )
      if (credRec && credRec.getBool('ativo') !== false) {
        siteUrl = credRec.getString('site_backend_url') || ''
        siteEmail = credRec.getString('site_sync_email') || ''
        sitePassword = credRec.getString('site_sync_password') || ''
        if (siteUrl && siteEmail && sitePassword) {
          fonte = 'colecao_interna'
        }
      }
    } catch (_) {}

    // 2. Fallback para variáveis de ambiente $os.getenv / $secrets
    if (!siteUrl) {
      siteUrl = $os.getenv('SITE_BACKEND_URL') || ''
      if (!siteUrl) {
        try {
          siteUrl = $secrets.get('SITE_BACKEND_URL') || ''
        } catch (_) {}
      }
      if (siteUrl && !fonte) fonte = 'ambiente'
    }

    if (siteUrl && siteUrl.endsWith('/')) {
      siteUrl = siteUrl.slice(0, -1)
    }

    if (!siteEmail) {
      siteEmail = $os.getenv('SITE_SYNC_EMAIL') || ''
      if (!siteEmail) {
        try {
          siteEmail = $secrets.get('SITE_SYNC_EMAIL') || ''
        } catch (_) {}
      }
      if (siteEmail && !fonte) fonte = 'ambiente'
    }

    if (!sitePassword) {
      sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''
      if (!sitePassword) {
        try {
          sitePassword = $secrets.get('SITE_SYNC_PASSWORD') || ''
        } catch (_) {}
      }
      if (sitePassword && !fonte) fonte = 'ambiente'
    }

    // Validação estrita: sem credenciais configuradas, aborta defensivamente
    if (!siteUrl || !siteEmail || !sitePassword) {
      $app
        .logger()
        .warn(
          'sync_site_leads_cron abortado: credenciais ausentes na coleção integracoes_site e no ambiente.',
        )
      return
    }

    // 1. Autenticar no backend do site institucional
    const authRes = $http.send({
      url: siteUrl + '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: siteEmail,
        password: sitePassword,
      }),
      timeout: 20,
    })

    if (authRes.statusCode !== 200) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        let adminUser = null
        try {
          adminUser = $app.findFirstRecordByData('users', 'role', 'admin')
        } catch (_) {}

        if (adminUser) {
          const errLog = new Record(logsCol)
          errLog.set('user', adminUser.id)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            'Falha de autenticação no site institucional (HTTP ' +
              authRes.statusCode +
              ') [fonte: ' +
              fonte +
              ']: ' +
              (authRes.raw || '').substring(0, 300),
          )
          $app.save(errLog)
        }
      } catch (_) {}
      return
    }

    const token = authRes.json.token

    // Obter file token do site para download de arquivos caso o campo seja protegido
    let siteFileToken = ''
    try {
      const ftRes = $http.send({
        url: siteUrl + '/api/files/token',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        timeout: 10,
      })
      if (ftRes.statusCode === 200 && ftRes.json && ftRes.json.token) {
        siteFileToken = ftRes.json.token
      }
    } catch (_) {}

    // 2. Buscar leads do site institucional (coleção completa de leads)
    const leadsRes = $http.send({
      url: siteUrl + '/api/collections/leads/records?perPage=200&sort=-created',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      timeout: 25,
    })

    if (leadsRes.statusCode !== 200) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        let adminUser = null
        try {
          adminUser = $app.findFirstRecordByData('users', 'role', 'admin')
        } catch (_) {}
        if (adminUser) {
          const errLog = new Record(logsCol)
          errLog.set('user', adminUser.id)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            "Falha ao consultar coleção 'leads' no site (HTTP " + leadsRes.statusCode + ')',
          )
          $app.save(errLog)
        }
      } catch (_) {}
      return
    }

    const remoteItems = leadsRes.json && leadsRes.json.items ? leadsRes.json.items : []
    const leadsCol = $app.findCollectionByNameOrId('leads')

    let novosLeads = 0
    let atualizadosLeads = 0

    // Função interna para baixar arquivos do site e converter em Filesystem Files
    const downloadRemoteFiles = (collectionIdOrName, recordId, fileNames) => {
      const resultFiles = []
      if (!fileNames) return resultFiles
      const list = Array.isArray(fileNames) ? fileNames : [fileNames]

      for (let f = 0; f < list.length; f++) {
        const fn = list[f]
        if (!fn || typeof fn !== 'string') continue
        try {
          let downloadUrl = siteUrl + '/api/files/' + collectionIdOrName + '/' + recordId + '/' + fn
          if (siteFileToken) {
            downloadUrl += '?token=' + siteFileToken
          }
          const fileResp = $http.send({
            url: downloadUrl,
            method: 'GET',
            headers: {
              Authorization: 'Bearer ' + token,
            },
            timeout: 30,
          })

          if (
            fileResp.statusCode === 200 &&
            ((fileResp.body && fileResp.body.length > 0) ||
              (fileResp.raw && fileResp.raw.length > 0))
          ) {
            const dataBytes =
              fileResp.body && fileResp.body.length > 0 ? fileResp.body : fileResp.raw
            const fileObj = $filesystem.fileFromBytes(dataBytes, fn)
            resultFiles.push(fileObj)
          } else {
            $app
              .logger()
              .warn(
                'Falha ao baixar arquivo remoto: ' +
                  fn +
                  ' do lead ' +
                  recordId +
                  ' HTTP ' +
                  fileResp.statusCode,
              )
          }
        } catch (fileErr) {
          $app
            .logger()
            .warn(
              'Erro ao processar download do arquivo ' +
                fn +
                ' do lead ' +
                recordId +
                ': ' +
                fileErr.message,
            )
        }
      }
      return resultFiles
    }

    for (let i = 0; i < remoteItems.length; i++) {
      const item = remoteItems[i]
      const siteId = item.id
      const protocolo = item.protocolo || '#VM-' + siteId

      let localRecord = null
      let isTest = false
      try {
        localRecord = $app.findFirstRecordByData('leads', 'site_lead_id', siteId)
        if (localRecord && (localRecord.get('status') || '').toString().toLowerCase() === 'teste') {
          isTest = true
        }
      } catch (_) {
        try {
          localRecord = $app.findFirstRecordByData('leads', 'protocolo', protocolo)
          if (
            localRecord &&
            (localRecord.get('status') || '').toString().toLowerCase() === 'teste'
          ) {
            isTest = true
          }
        } catch (_) {}
      }

      const isNew = !localRecord
      const rec = isNew ? new Record(leadsCol) : localRecord

      const cad = item.cadastro || (item.dados_completos && item.dados_completos.cadastro) || {}
      const itemOrigem = (item.origem || '').toString()
      const itemOrigemTipo = (item.origem_tipo || item.origemTipo || '').toString()
      const dadosCompletosOrigem = (item.dados_completos && item.dados_completos.origem) || ''
      const itemRespostas =
        item.respostas || (item.dados_completos && item.dados_completos.respostas) || null
      const respostasOrigem = (itemRespostas && itemRespostas.origem) || ''

      const isListaPrioridade =
        itemOrigem.toLowerCase().includes('prioridade') ||
        itemOrigemTipo.toLowerCase().includes('prioridade') ||
        dadosCompletosOrigem.toLowerCase().includes('prioridade') ||
        respostasOrigem.toLowerCase().includes('prioridade')

      // Verificar se possui respostas reais do questionário (mais do que apenas campos de inscrição da lista de prioridade)
      let temRespostasQuestionario = false
      if (itemRespostas && typeof itemRespostas === 'object') {
        const rKeys = Object.keys(itemRespostas).filter((k) => {
          return (
            k !== 'origem' &&
            k !== 'plano_escolhido' &&
            k !== 'acesso_antecipado_solicitado' &&
            k !== 'condicao_fundador_solicitada' &&
            k !== 'faturamento_anual' &&
            k !== 'data_cadastro'
          )
        })
        if (rKeys.length > 0) {
          temRespostasQuestionario = true
        }
      }

      rec.set('protocolo', protocolo)
      rec.set('origem', item.origem || 'Site Institucional')
      rec.set('origem_tipo', item.origem_tipo || item.origemTipo || 'site')

      // Regras de Status:
      // 1. Preservar sempre status 'teste'
      // 2. Se for lead 'lista_espera' (ou se Origem for Lista de Prioridade SaaS, ou sem respostas):
      //    REGRA DE PROMOÇÃO: NUNCA promover automaticamente para 'novo'. Se já era lista_espera ou é da lista de prioridade,
      //    mantém lista_espera. Promoção a 'novo' requer aprovação manual pelo Admin.
      if (isTest) {
        rec.set('status', 'teste')
      } else {
        const localStatusAtual = (rec.getString('status') || '').toLowerCase()
        if (localStatusAtual === 'lista_espera') {
          // Mantém lista_espera mesmo se chegarem respostas do site
          rec.set('status', 'lista_espera')
        } else if (isListaPrioridade || !temRespostasQuestionario) {
          rec.set('status', 'lista_espera')
        } else {
          rec.set('status', item.status || 'novo')
        }
      }
      rec.set('autorizacao_devolutiva', item.autorizacao_devolutiva || '')
      rec.set('formato_interesse', item.formato_interesse || '')
      rec.set(
        'nome_completo',
        item.nome_completo || item.respondente || cad.nomeCompleto || cad.nome || '',
      )
      rec.set(
        'razao_social',
        item.razao_social || cad.empresa || cad.razaoSocial || cad.razao_social || '',
      )
      rec.set('cnpj', item.cnpj || cad.cnpj || '')
      rec.set('cargo', item.cargo || cad.cargo || '')
      rec.set(
        'email',
        item.email || item.email_corporativo || cad.email || cad.emailCorporativo || '',
      )
      rec.set('whatsapp', item.whatsapp || cad.whatsapp || cad.telefone || '')
      rec.set('setor', item.setor || '')
      rec.set('segmento', item.segmento || '')
      rec.set('faturamento_mensal', item.faturamento_mensal || cad.faturamento || '')
      rec.set('plano_interesse', item.plano_interesse || '')
      rec.set('responsavel_envio', item.responsavel_envio || cad.nomeCompleto || '')
      rec.set('dados_completos', item.dados_completos || item)
      rec.set('site_lead_id', siteId)
      rec.set('site_created', item.created || '')
      rec.set('site_updated', item.updated || '')
      rec.set('synced_at', new Date().toISOString())

      // 1. Mapeamento do campo respostas (JSON das etapas 1 a 11)
      if (item.respostas) {
        rec.set('respostas', item.respostas)
      } else if (item.dados_completos && item.dados_completos.respostas) {
        rec.set('respostas', item.dados_completos.respostas)
      }

      // 2. Mapeamento e download/re-hospedagem dos arquivos dos 3 grupos
      // Apenas baixa e re-hospeda se o lead local ainda NÃO possui arquivos gravados neste campo
      // Grupo 1: Demonstrativos Financeiros (no site: documentacao_adicional)
      const remoteDocAdicional = item.documentacao_adicional
      const localDocAdicional = rec.get('documentacao_adicional')
      const hasLocalDocAdicional =
        localDocAdicional &&
        (Array.isArray(localDocAdicional) ? localDocAdicional.length > 0 : true)
      if (
        !hasLocalDocAdicional &&
        remoteDocAdicional &&
        (Array.isArray(remoteDocAdicional) ? remoteDocAdicional.length > 0 : true)
      ) {
        const files1 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteDocAdicional)
        if (files1.length > 0) {
          rec.set('documentacao_adicional', files1)
        }
      }

      // Grupo 2: Relatórios Gerenciais (no site: certificacoes)
      const remoteCert = item.certificacoes
      const localCert = rec.get('certificacoes')
      const hasLocalCert = localCert && (Array.isArray(localCert) ? localCert.length > 0 : true)
      if (
        !hasLocalCert &&
        remoteCert &&
        (Array.isArray(remoteCert) ? remoteCert.length > 0 : true)
      ) {
        const files2 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteCert)
        if (files2.length > 0) {
          rec.set('certificacoes', files2)
        }
      }

      // Grupo 3: Sociedade/Complementares (no site: contrato_social)
      const remoteContrato = item.contrato_social
      const localContrato = rec.get('contrato_social')
      const hasLocalContrato =
        localContrato && (Array.isArray(localContrato) ? localContrato.length > 0 : true)
      if (
        !hasLocalContrato &&
        remoteContrato &&
        (Array.isArray(remoteContrato) ? remoteContrato.length > 0 : true)
      ) {
        const files3 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteContrato)
        if (files3.length > 0) {
          rec.set('contrato_social', files3)
        }
      }
      $app.save(rec)

      if (isNew) {
        novosLeads++
      } else {
        atualizadosLeads++
      }
    }

    if (remoteItems.length === 0) {
      $app
        .logger()
        .info(
          'sync_site_leads_cron executado com sucesso: backend respondeu 200, mas 0 leads na coleção do site.',
        )
    }

    // Se houve novos leads sincronizados ou atualizados, registrar nos Logs de Auditoria
    if (novosLeads > 0 || atualizadosLeads > 0) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        let adminUser = null
        try {
          adminUser = $app.findFirstRecordByData('users', 'role', 'admin')
        } catch (_) {}
        if (adminUser) {
          const syncLog = new Record(logsCol)
          syncLog.set('user', adminUser.id)
          syncLog.set('action', 'Sincronização Automática')
          syncLog.set('resource', 'leads')
          syncLog.set(
            'details',
            'Cron automático: ' +
              novosLeads +
              ' novo(s) lead(s), ' +
              atualizadosLeads +
              ' atualizado(s) do site com respostas e anexos (' +
              remoteItems.length +
              ' processados). Credenciais via: ' +
              fonte,
          )
          $app.save(syncLog)
        }
      } catch (_) {}
    }
  } catch (err) {
    $app.logger().error('Erro inesperado no sync_site_leads_cron', 'error', err.message)
  }
})

// Endpoint manual de sincronização sob demanda (Admin)
routerAdd('POST', '/backend/v1/sync/leads', (e) => {
  let siteUrl = ''
  let siteEmail = ''
  let sitePassword = ''
  let fonte = ''

  // 1. Tentar ler da coleção interna protegida 'integracoes_site'
  try {
    const credRec = $app.findFirstRecordByData(
      'integracoes_site',
      'chave',
      'site_institucional_vetor_master',
    )
    if (credRec && credRec.getBool('ativo') !== false) {
      siteUrl = credRec.getString('site_backend_url') || ''
      siteEmail = credRec.getString('site_sync_email') || ''
      sitePassword = credRec.getString('site_sync_password') || ''
      if (siteUrl && siteEmail && sitePassword) {
        fonte = 'colecao_interna'
      }
    }
  } catch (_) {}

  // 2. Fallback para variáveis de ambiente $os.getenv / $secrets
  if (!siteUrl) {
    siteUrl = $os.getenv('SITE_BACKEND_URL') || ''
    if (!siteUrl) {
      try {
        siteUrl = $secrets.get('SITE_BACKEND_URL') || ''
      } catch (_) {}
    }
    if (siteUrl && !fonte) fonte = 'ambiente'
  }

  if (siteUrl && siteUrl.endsWith('/')) {
    siteUrl = siteUrl.slice(0, -1)
  }

  if (!siteEmail) {
    siteEmail = $os.getenv('SITE_SYNC_EMAIL') || ''
    if (!siteEmail) {
      try {
        siteEmail = $secrets.get('SITE_SYNC_EMAIL') || ''
      } catch (_) {}
    }
    if (siteEmail && !fonte) fonte = 'ambiente'
  }

  if (!sitePassword) {
    sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''
    if (!sitePassword) {
      try {
        sitePassword = $secrets.get('SITE_SYNC_PASSWORD') || ''
      } catch (_) {}
    }
    if (sitePassword && !fonte) fonte = 'ambiente'
  }

  const authUser = e.requestInfo ? e.requestInfo().auth : null
  let adminUserId = authUser ? authUser.id : null
  if (!adminUserId) {
    try {
      const u = $app.findFirstRecordByData('users', 'role', 'admin')
      adminUserId = u.id
    } catch (_) {}
  }

  if (!siteUrl || !siteEmail || !sitePassword) {
    if (adminUserId) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        const errLog = new Record(logsCol)
        errLog.set('user', adminUserId)
        errLog.set('action', 'Erro Sincronização Site')
        errLog.set('resource', 'leads')
        errLog.set(
          'details',
          'Abortado: credenciais (SITE_BACKEND_URL, SITE_SYNC_EMAIL ou SITE_SYNC_PASSWORD) ausentes na coleção integracoes_site e no ambiente.',
        )
        $app.save(errLog)
      } catch (_) {}
    }
    return e.json(500, {
      success: false,
      message:
        'Credenciais de sincronização não configuradas no app (verifique a coleção integracoes_site ou as variáveis de ambiente).',
    })
  }

  // 1. Autenticar no site institucional
  const authRes = $http.send({
    url: siteUrl + '/api/collections/users/auth-with-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: siteEmail,
      password: sitePassword,
    }),
    timeout: 20,
  })

  if (authRes.statusCode !== 200) {
    if (adminUserId) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        const errLog = new Record(logsCol)
        errLog.set('user', adminUserId)
        errLog.set('action', 'Erro Sincronização Site')
        errLog.set('resource', 'leads')
        errLog.set(
          'details',
          'Falha de autenticação no site institucional (HTTP ' +
            authRes.statusCode +
            ') [fonte: ' +
            fonte +
            ']: ' +
            (authRes.raw || '').substring(0, 300),
        )
        $app.save(errLog)
      } catch (_) {}
    }

    return e.json(502, {
      success: false,
      message:
        'Falha de autenticação no backend do site institucional (HTTP ' + authRes.statusCode + ').',
      error: authRes.raw,
      credentialsSource: fonte,
    })
  }

  const token = authRes.json.token

  // Obter file token do site para download seguro
  let siteFileToken = ''
  try {
    const ftRes = $http.send({
      url: siteUrl + '/api/files/token',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      timeout: 10,
    })
    if (ftRes.statusCode === 200 && ftRes.json && ftRes.json.token) {
      siteFileToken = ftRes.json.token
    }
  } catch (_) {}

  // 2. Buscar leads do site institucional
  const leadsRes = $http.send({
    url: siteUrl + '/api/collections/leads/records?perPage=200&sort=-created',
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    timeout: 25,
  })

  if (leadsRes.statusCode !== 200) {
    if (adminUserId) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        const errLog = new Record(logsCol)
        errLog.set('user', adminUserId)
        errLog.set('action', 'Erro Sincronização Site')
        errLog.set('resource', 'leads')
        errLog.set(
          'details',
          "Falha ao ler coleção 'leads' no site institucional (HTTP " + leadsRes.statusCode + ')',
        )
        $app.save(errLog)
      } catch (_) {}
    }

    return e.json(502, {
      success: false,
      message:
        "Falha ao ler coleção 'leads' no site institucional (HTTP " + leadsRes.statusCode + ').',
      error: leadsRes.raw,
    })
  }

  const remoteItems = leadsRes.json && leadsRes.json.items ? leadsRes.json.items : []
  const leadsCol = $app.findCollectionByNameOrId('leads')

  let novosLeads = 0
  let atualizadosLeads = 0
  let totalArquivosBaixados = 0

  // Função interna para baixar arquivos do site e converter em Filesystem Files
  const downloadRemoteFiles = (collectionIdOrName, recordId, fileNames) => {
    const resultFiles = []
    if (!fileNames) return resultFiles
    const list = Array.isArray(fileNames) ? fileNames : [fileNames]

    for (let f = 0; f < list.length; f++) {
      const fn = list[f]
      if (!fn || typeof fn !== 'string') continue
      try {
        let downloadUrl = siteUrl + '/api/files/' + collectionIdOrName + '/' + recordId + '/' + fn
        if (siteFileToken) {
          downloadUrl += '?token=' + siteFileToken
        }
        const fileResp = $http.send({
          url: downloadUrl,
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + token,
          },
          timeout: 30,
        })

        if (
          fileResp.statusCode === 200 &&
          ((fileResp.body && fileResp.body.length > 0) || (fileResp.raw && fileResp.raw.length > 0))
        ) {
          const dataBytes = fileResp.body && fileResp.body.length > 0 ? fileResp.body : fileResp.raw
          const fileObj = $filesystem.fileFromBytes(dataBytes, fn)
          resultFiles.push(fileObj)
          totalArquivosBaixados++
        } else {
          $app
            .logger()
            .warn(
              'Falha ao baixar arquivo remoto: ' +
                fn +
                ' do lead ' +
                recordId +
                ' HTTP ' +
                fileResp.statusCode,
            )
        }
      } catch (fileErr) {
        $app
          .logger()
          .warn(
            'Erro ao processar download do arquivo ' +
              fn +
              ' do lead ' +
              recordId +
              ': ' +
              fileErr.message,
          )
      }
    }
    return resultFiles
  }

  for (let i = 0; i < remoteItems.length; i++) {
    const item = remoteItems[i]
    const siteId = item.id
    const protocolo = item.protocolo || '#VM-' + siteId

    let localRecord = null
    let isTest = false
    try {
      localRecord = $app.findFirstRecordByData('leads', 'site_lead_id', siteId)
      if (localRecord && (localRecord.get('status') || '').toString().toLowerCase() === 'teste') {
        isTest = true
      }
    } catch (_) {
      try {
        localRecord = $app.findFirstRecordByData('leads', 'protocolo', protocolo)
        if (localRecord && (localRecord.get('status') || '').toString().toLowerCase() === 'teste') {
          isTest = true
        }
      } catch (_) {}
    }

    const isNew = !localRecord
    const rec = isNew ? new Record(leadsCol) : localRecord

    const cad = item.cadastro || (item.dados_completos && item.dados_completos.cadastro) || {}
    const itemOrigem = (item.origem || '').toString()
    const itemOrigemTipo = (item.origem_tipo || item.origemTipo || '').toString()
    const dadosCompletosOrigem = (item.dados_completos && item.dados_completos.origem) || ''
    const itemRespostas =
      item.respostas || (item.dados_completos && item.dados_completos.respostas) || null
    const respostasOrigem = (itemRespostas && itemRespostas.origem) || ''

    const isListaPrioridade =
      itemOrigem.toLowerCase().includes('prioridade') ||
      itemOrigemTipo.toLowerCase().includes('prioridade') ||
      dadosCompletosOrigem.toLowerCase().includes('prioridade') ||
      respostasOrigem.toLowerCase().includes('prioridade')

    let temRespostasQuestionario = false
    if (itemRespostas && typeof itemRespostas === 'object') {
      const rKeys = Object.keys(itemRespostas).filter((k) => {
        return (
          k !== 'origem' &&
          k !== 'plano_escolhido' &&
          k !== 'acesso_antecipado_solicitado' &&
          k !== 'condicao_fundador_solicitada' &&
          k !== 'faturamento_anual' &&
          k !== 'data_cadastro'
        )
      })
      if (rKeys.length > 0) {
        temRespostasQuestionario = true
      }
    }

    rec.set('protocolo', protocolo)
    rec.set('origem', item.origem || 'Site Institucional')
    rec.set('origem_tipo', item.origem_tipo || item.origemTipo || 'site')

    if (isTest) {
      rec.set('status', 'teste')
    } else {
      const localStatusAtual = (rec.getString('status') || '').toLowerCase()
      if (localStatusAtual === 'lista_espera') {
        rec.set('status', 'lista_espera')
      } else if (isListaPrioridade || !temRespostasQuestionario) {
        rec.set('status', 'lista_espera')
      } else {
        rec.set('status', item.status || 'novo')
      }
    }
    rec.set('autorizacao_devolutiva', item.autorizacao_devolutiva || '')
    rec.set('formato_interesse', item.formato_interesse || '')
    rec.set(
      'nome_completo',
      item.nome_completo || item.respondente || cad.nomeCompleto || cad.nome || '',
    )
    rec.set(
      'razao_social',
      item.razao_social || cad.empresa || cad.razaoSocial || cad.razao_social || '',
    )
    rec.set('cnpj', item.cnpj || cad.cnpj || '')
    rec.set('cargo', item.cargo || cad.cargo || '')
    rec.set(
      'email',
      item.email || item.email_corporativo || cad.email || cad.emailCorporativo || '',
    )
    rec.set('whatsapp', item.whatsapp || cad.whatsapp || cad.telefone || '')
    rec.set('setor', item.setor || '')
    rec.set('segmento', item.segmento || '')
    rec.set('faturamento_mensal', item.faturamento_mensal || cad.faturamento || '')
    rec.set('plano_interesse', item.plano_interesse || '')
    rec.set('responsavel_envio', item.responsavel_envio || cad.nomeCompleto || '')
    rec.set('dados_completos', item.dados_completos || item)
    rec.set('site_lead_id', siteId)
    rec.set('site_created', item.created || '')
    rec.set('site_updated', item.updated || '')
    rec.set('synced_at', new Date().toISOString())

    // 1. Mapeamento do campo respostas (JSON das etapas 1 a 11)
    if (item.respostas) {
      rec.set('respostas', item.respostas)
    } else if (item.dados_completos && item.dados_completos.respostas) {
      rec.set('respostas', item.dados_completos.respostas)
    }

    // 2. Mapeamento e download/re-hospedagem dos arquivos dos 3 grupos
    // Apenas baixa e re-hospeda se o lead local ainda NÃO possui arquivos gravados neste campo
    // Grupo 1: Demonstrativos Financeiros (no site: documentacao_adicional)
    const remoteDocAdicional = item.documentacao_adicional
    const localDocAdicional = rec.get('documentacao_adicional')
    const hasLocalDocAdicional =
      localDocAdicional && (Array.isArray(localDocAdicional) ? localDocAdicional.length > 0 : true)
    if (
      !hasLocalDocAdicional &&
      remoteDocAdicional &&
      (Array.isArray(remoteDocAdicional) ? remoteDocAdicional.length > 0 : true)
    ) {
      const files1 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteDocAdicional)
      if (files1.length > 0) {
        rec.set('documentacao_adicional', files1)
      }
    }

    // Grupo 2: Relatórios Gerenciais (no site: certificacoes)
    const remoteCert = item.certificacoes
    const localCert = rec.get('certificacoes')
    const hasLocalCert = localCert && (Array.isArray(localCert) ? localCert.length > 0 : true)
    if (!hasLocalCert && remoteCert && (Array.isArray(remoteCert) ? remoteCert.length > 0 : true)) {
      const files2 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteCert)
      if (files2.length > 0) {
        rec.set('certificacoes', files2)
      }
    }

    // Grupo 3: Sociedade/Complementares (no site: contrato_social)
    const remoteContrato = item.contrato_social
    const localContrato = rec.get('contrato_social')
    const hasLocalContrato =
      localContrato && (Array.isArray(localContrato) ? localContrato.length > 0 : true)
    if (
      !hasLocalContrato &&
      remoteContrato &&
      (Array.isArray(remoteContrato) ? remoteContrato.length > 0 : true)
    ) {
      const files3 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteContrato)
      if (files3.length > 0) {
        rec.set('contrato_social', files3)
      }
    }
    $app.save(rec)

    if (isNew) {
      novosLeads++
    } else {
      atualizadosLeads++
    }
  }

  // Gravar log de auditoria
  if (adminUserId) {
    try {
      const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
      const syncLog = new Record(logsCol)
      syncLog.set('user', adminUserId)
      syncLog.set('action', 'Sincronização Manual Site')
      syncLog.set('resource', 'leads')
      const auditDetails =
        remoteItems.length === 0
          ? 'Sincronização concluída: 0 leads retornados do site. Credenciais lidas via: ' + fonte
          : 'Sincronização sob demanda: ' +
            novosLeads +
            ' novo(s) lead(s), ' +
            atualizadosLeads +
            ' atualizado(s), ' +
            totalArquivosBaixados +
            ' arquivo(s) re-hospedado(s), ' +
            remoteItems.length +
            ' avaliado(s). Credenciais lidas via: ' +
            fonte

      syncLog.set('details', auditDetails)
      $app.save(syncLog)
    } catch (_) {}
  }

  return e.json(200, {
    success: true,
    totalRemote: remoteItems.length,
    novosLeads: novosLeads,
    atualizadosLeads: atualizadosLeads,
    arquivosRehospedados: totalArquivosBaixados,
    credentialsSource: fonte,
    syncedAt: new Date().toISOString(),
  })
})

// Endpoint protegido (requireAdminAuth) mantido para compatibilidade
routerAdd(
  'POST',
  '/backend/v1/sync/leads-admin-only',
  (e) => {
    let siteUrl = ''
    let siteEmail = ''
    let sitePassword = ''
    let fonte = ''

    try {
      const credRec = $app.findFirstRecordByData(
        'integracoes_site',
        'chave',
        'site_institucional_vetor_master',
      )
      if (credRec && credRec.getBool('ativo') !== false) {
        siteUrl = credRec.getString('site_backend_url') || ''
        siteEmail = credRec.getString('site_sync_email') || ''
        sitePassword = credRec.getString('site_sync_password') || ''
        if (siteUrl && siteEmail && sitePassword) {
          fonte = 'colecao_interna'
        }
      }
    } catch (_) {}

    if (!siteUrl) {
      siteUrl = $os.getenv('SITE_BACKEND_URL') || ''
      if (!siteUrl) {
        try {
          siteUrl = $secrets.get('SITE_BACKEND_URL') || ''
        } catch (_) {}
      }
      if (siteUrl && !fonte) fonte = 'ambiente'
    }

    if (siteUrl && siteUrl.endsWith('/')) {
      siteUrl = siteUrl.slice(0, -1)
    }

    if (!siteEmail) {
      siteEmail = $os.getenv('SITE_SYNC_EMAIL') || ''
      if (!siteEmail) {
        try {
          siteEmail = $secrets.get('SITE_SYNC_EMAIL') || ''
        } catch (_) {}
      }
      if (siteEmail && !fonte) fonte = 'ambiente'
    }

    if (!sitePassword) {
      sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''
      if (!sitePassword) {
        try {
          sitePassword = $secrets.get('SITE_SYNC_PASSWORD') || ''
        } catch (_) {}
      }
      if (sitePassword && !fonte) fonte = 'ambiente'
    }

    const authUser = e.requestInfo ? e.requestInfo().auth : null
    const adminUserId = authUser ? authUser.id : null

    if (!siteUrl || !siteEmail || !sitePassword) {
      if (adminUserId) {
        try {
          const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
          const errLog = new Record(logsCol)
          errLog.set('user', adminUserId)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            'Abortado: credenciais (SITE_BACKEND_URL, SITE_SYNC_EMAIL ou SITE_SYNC_PASSWORD) ausentes.',
          )
          $app.save(errLog)
        } catch (_) {}
      }
      return e.json(500, {
        success: false,
        message: 'Credenciais de sincronização não configuradas no app.',
      })
    }

    // 1. Autenticar no site institucional
    const authRes = $http.send({
      url: siteUrl + '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: siteEmail,
        password: sitePassword,
      }),
      timeout: 20,
    })

    if (authRes.statusCode !== 200) {
      if (adminUserId) {
        try {
          const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
          const errLog = new Record(logsCol)
          errLog.set('user', adminUserId)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            'Falha de autenticação no site institucional (HTTP ' +
              authRes.statusCode +
              '): ' +
              (authRes.raw || '').substring(0, 300),
          )
          $app.save(errLog)
        } catch (_) {}
      }

      return e.json(502, {
        success: false,
        message:
          'Falha de autenticação no backend do site institucional (HTTP ' +
          authRes.statusCode +
          ').',
        error: authRes.raw,
      })
    }

    const token = authRes.json.token

    let siteFileToken = ''
    try {
      const ftRes = $http.send({
        url: siteUrl + '/api/files/token',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        timeout: 10,
      })
      if (ftRes.statusCode === 200 && ftRes.json && ftRes.json.token) {
        siteFileToken = ftRes.json.token
      }
    } catch (_) {}

    // 2. Buscar leads do site institucional
    const leadsRes = $http.send({
      url: siteUrl + '/api/collections/leads/records?perPage=200&sort=-created',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      timeout: 25,
    })

    if (leadsRes.statusCode !== 200) {
      if (adminUserId) {
        try {
          const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
          const errLog = new Record(logsCol)
          errLog.set('user', adminUserId)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            "Falha ao ler coleção 'leads' no site institucional (HTTP " + leadsRes.statusCode + ')',
          )
          $app.save(errLog)
        } catch (_) {}
      }

      return e.json(502, {
        success: false,
        message:
          "Falha ao ler coleção 'leads' no site institucional (HTTP " + leadsRes.statusCode + ').',
        error: leadsRes.raw,
      })
    }

    const remoteItems = leadsRes.json && leadsRes.json.items ? leadsRes.json.items : []
    const leadsCol = $app.findCollectionByNameOrId('leads')

    let novosLeads = 0
    let atualizadosLeads = 0
    let totalArquivosBaixados = 0

    const downloadRemoteFiles = (collectionIdOrName, recordId, fileNames) => {
      const resultFiles = []
      if (!fileNames) return resultFiles
      const list = Array.isArray(fileNames) ? fileNames : [fileNames]

      for (let f = 0; f < list.length; f++) {
        const fn = list[f]
        if (!fn || typeof fn !== 'string') continue
        try {
          let downloadUrl = siteUrl + '/api/files/' + collectionIdOrName + '/' + recordId + '/' + fn
          if (siteFileToken) {
            downloadUrl += '?token=' + siteFileToken
          }
          const fileResp = $http.send({
            url: downloadUrl,
            method: 'GET',
            headers: {
              Authorization: 'Bearer ' + token,
            },
            timeout: 30,
          })

          if (
            fileResp.statusCode === 200 &&
            ((fileResp.body && fileResp.body.length > 0) ||
              (fileResp.raw && fileResp.raw.length > 0))
          ) {
            const dataBytes =
              fileResp.body && fileResp.body.length > 0 ? fileResp.body : fileResp.raw
            const fileObj = $filesystem.fileFromBytes(dataBytes, fn)
            resultFiles.push(fileObj)
            totalArquivosBaixados++
          }
        } catch (_) {}
      }
      return resultFiles
    }

    for (let i = 0; i < remoteItems.length; i++) {
      const item = remoteItems[i]
      const siteId = item.id
      const protocolo = item.protocolo || '#VM-' + siteId

      let localRecord = null
      let isTest = false
      try {
        localRecord = $app.findFirstRecordByData('leads', 'site_lead_id', siteId)
        if (localRecord && (localRecord.get('status') || '').toString().toLowerCase() === 'teste') {
          isTest = true
        }
      } catch (_) {
        try {
          localRecord = $app.findFirstRecordByData('leads', 'protocolo', protocolo)
          if (
            localRecord &&
            (localRecord.get('status') || '').toString().toLowerCase() === 'teste'
          ) {
            isTest = true
          }
        } catch (_) {}
      }

      const isNew = !localRecord
      const rec = isNew ? new Record(leadsCol) : localRecord

      const itemOrigem = (item.origem || '').toString()
      const itemOrigemTipo = (item.origem_tipo || item.origemTipo || '').toString()
      const dadosCompletosOrigem = (item.dados_completos && item.dados_completos.origem) || ''
      const itemRespostas =
        item.respostas || (item.dados_completos && item.dados_completos.respostas) || null
      const respostasOrigem = (itemRespostas && itemRespostas.origem) || ''

      const isListaPrioridade =
        itemOrigem.toLowerCase().includes('prioridade') ||
        itemOrigemTipo.toLowerCase().includes('prioridade') ||
        dadosCompletosOrigem.toLowerCase().includes('prioridade') ||
        respostasOrigem.toLowerCase().includes('prioridade')

      let temRespostasQuestionario = false
      if (itemRespostas && typeof itemRespostas === 'object') {
        const rKeys = Object.keys(itemRespostas).filter((k) => {
          return (
            k !== 'origem' &&
            k !== 'plano_escolhido' &&
            k !== 'acesso_antecipado_solicitado' &&
            k !== 'condicao_fundador_solicitada' &&
            k !== 'faturamento_anual' &&
            k !== 'data_cadastro'
          )
        })
        if (rKeys.length > 0) {
          temRespostasQuestionario = true
        }
      }

      rec.set('protocolo', protocolo)
      rec.set('origem', item.origem || 'Site Institucional')
      rec.set('origem_tipo', item.origem_tipo || item.origemTipo || 'site')

      if (isTest) {
        rec.set('status', 'teste')
      } else {
        const localStatusAtual = (rec.getString('status') || '').toLowerCase()
        if (localStatusAtual === 'lista_espera') {
          rec.set('status', 'lista_espera')
        } else if (isListaPrioridade || !temRespostasQuestionario) {
          rec.set('status', 'lista_espera')
        } else {
          rec.set('status', item.status || 'novo')
        }
      }
      rec.set('autorizacao_devolutiva', item.autorizacao_devolutiva || '')
      rec.set('formato_interesse', item.formato_interesse || '')
      rec.set('nome_completo', item.nome_completo || item.respondente || '')
      rec.set('razao_social', item.razao_social || '')
      rec.set('cnpj', item.cnpj || '')
      rec.set('cargo', item.cargo || '')
      rec.set('email', item.email || item.email_corporativo || '')
      rec.set('whatsapp', item.whatsapp || '')
      rec.set('setor', item.setor || '')
      rec.set('segmento', item.segmento || '')
      rec.set('faturamento_mensal', item.faturamento_mensal || '')
      rec.set('plano_interesse', item.plano_interesse || '')
      rec.set('responsavel_envio', item.responsavel_envio || '')
      rec.set('dados_completos', item.dados_completos || item)
      rec.set('site_lead_id', siteId)
      rec.set('site_created', item.created || '')
      rec.set('site_updated', item.updated || '')
      rec.set('synced_at', new Date().toISOString())

      if (item.respostas) {
        rec.set('respostas', item.respostas)
      } else if (item.dados_completos && item.dados_completos.respostas) {
        rec.set('respostas', item.dados_completos.respostas)
      }

      const remoteDocAdicional = item.documentacao_adicional
      const localDocAdicional = rec.get('documentacao_adicional')
      const hasLocalDocAdicional =
        localDocAdicional &&
        (Array.isArray(localDocAdicional) ? localDocAdicional.length > 0 : true)
      if (
        !hasLocalDocAdicional &&
        remoteDocAdicional &&
        (Array.isArray(remoteDocAdicional) ? remoteDocAdicional.length > 0 : true)
      ) {
        const files1 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteDocAdicional)
        if (files1.length > 0) {
          rec.set('documentacao_adicional', files1)
        }
      }

      const remoteCert = item.certificacoes
      const localCert = rec.get('certificacoes')
      const hasLocalCert = localCert && (Array.isArray(localCert) ? localCert.length > 0 : true)
      if (
        !hasLocalCert &&
        remoteCert &&
        (Array.isArray(remoteCert) ? remoteCert.length > 0 : true)
      ) {
        const files2 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteCert)
        if (files2.length > 0) {
          rec.set('certificacoes', files2)
        }
      }

      const remoteContrato = item.contrato_social
      const localContrato = rec.get('contrato_social')
      const hasLocalContrato =
        localContrato && (Array.isArray(localContrato) ? localContrato.length > 0 : true)
      if (
        !hasLocalContrato &&
        remoteContrato &&
        (Array.isArray(remoteContrato) ? remoteContrato.length > 0 : true)
      ) {
        const files3 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteContrato)
        if (files3.length > 0) {
          rec.set('contrato_social', files3)
        }
      }
      $app.save(rec)

      if (isNew) {
        novosLeads++
      } else {
        atualizadosLeads++
      }
    }

    if (adminUserId) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        const syncLog = new Record(logsCol)
        syncLog.set('user', adminUserId)
        syncLog.set('action', 'Sincronização Manual Site')
        syncLog.set('resource', 'leads')
        syncLog.set(
          'details',
          'Sincronização sob demanda: ' +
            novosLeads +
            ' novo(s) lead(s), ' +
            atualizadosLeads +
            ' atualizado(s), ' +
            totalArquivosBaixados +
            ' arquivo(s) re-hospedado(s), ' +
            remoteItems.length +
            ' avaliado(s). Credenciais via: ' +
            fonte,
        )
        $app.save(syncLog)
      } catch (_) {}
    }

    return e.json(200, {
      success: true,
      totalRemote: remoteItems.length,
      novosLeads: novosLeads,
      atualizadosLeads: atualizadosLeads,
      arquivosRehospedados: totalArquivosBaixados,
      syncedAt: new Date().toISOString(),
    })
  },
  $apis.requireAdminAuth(),
)

// Endpoint de teste/criação ponta-a-ponta (requer admin)
routerAdd(
  'POST',
  '/backend/v1/sync/test-e2e',
  (e) => {
    let siteUrl = ''
    let siteEmail = ''
    let sitePassword = ''
    let fonte = ''

    try {
      const credRec = $app.findFirstRecordByData(
        'integracoes_site',
        'chave',
        'site_institucional_vetor_master',
      )
      if (credRec && credRec.getBool('ativo') !== false) {
        siteUrl = credRec.getString('site_backend_url') || ''
        siteEmail = credRec.getString('site_sync_email') || ''
        sitePassword = credRec.getString('site_sync_password') || ''
        if (siteUrl && siteEmail && sitePassword) {
          fonte = 'colecao_interna'
        }
      }
    } catch (_) {}

    if (!siteUrl) {
      siteUrl = $os.getenv('SITE_BACKEND_URL') || ''
      if (!siteUrl) {
        try {
          siteUrl = $secrets.get('SITE_BACKEND_URL') || ''
        } catch (_) {}
      }
      if (siteUrl && !fonte) fonte = 'ambiente'
    }

    if (siteUrl && siteUrl.endsWith('/')) {
      siteUrl = siteUrl.slice(0, -1)
    }

    if (!siteEmail) {
      siteEmail = $os.getenv('SITE_SYNC_EMAIL') || ''
      if (!siteEmail) {
        try {
          siteEmail = $secrets.get('SITE_SYNC_EMAIL') || ''
        } catch (_) {}
      }
      if (siteEmail && !fonte) fonte = 'ambiente'
    }

    if (!sitePassword) {
      sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''
      if (!sitePassword) {
        try {
          sitePassword = $secrets.get('SITE_SYNC_PASSWORD') || ''
        } catch (_) {}
      }
      if (sitePassword && !fonte) fonte = 'ambiente'
    }

    if (!siteUrl || !siteEmail || !sitePassword) {
      return e.json(500, {
        success: false,
        message: 'Credenciais de sincronização ausentes na coleção integracoes_site e no ambiente.',
      })
    }

    // 1. Autenticar no site institucional
    const authRes = $http.send({
      url: siteUrl + '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: siteEmail,
        password: sitePassword,
      }),
      timeout: 20,
    })

    if (authRes.statusCode !== 200) {
      return e.json(502, {
        success: false,
        step: 'auth',
        statusCode: authRes.statusCode,
        raw: authRes.raw,
      })
    }

    const token = authRes.json.token
    const ts = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    const testProtocol = '#TEST-VM-V72-' + ts + '-' + rand

    const testLeadPayload = {
      protocolo: testProtocol,
      origem: 'Site Institucional',
      origem_tipo: 'site',
      status: 'Novo',
      autorizacao_devolutiva: 'Sim',
      formato_interesse: 'MaaS',
      nome_completo: 'Carlos Eduardo Silveira (Lead E2E Teste)',
      razao_social: 'Silveira & Associados Distribuidora S/A',
      cnpj: '12.345.678/0001-99',
      cargo: 'Diretor Geral / Fundador',
      email: 'carlos.silveira@silveiradistribuidora.com.br',
      whatsapp: '(11) 98765-4321',
      setor: 'Distribuição e Logística',
      segmento: 'Distribuição B2B de Alimentos',
      faturamento_mensal: 'R$ 1.500.000 a R$ 3.000.000',
      plano_interesse: 'MaaS Híbrido',
      responsavel_envio: 'Carlos Eduardo Silveira',
      dados_completos: {
        origem: 'Site Institucional',
        protocolo: testProtocol,
        razao_social: 'Silveira & Associados Distribuidora S/A',
        cnpj: '12.345.678/0001-99',
        data_preenchimento: new Date().toISOString(),
        setor: 'Distribuição e Logística',
        segmento: 'Distribuição B2B de Alimentos',
        respondente: 'Carlos Eduardo Silveira (Lead E2E Teste)',
        cargo: 'Diretor Geral / Fundador',
        email_corporativo: 'carlos.silveira@silveiradistribuidora.com.br',
        whatsapp: '(11) 98765-4321',
        autorizacao_devolutiva: 'Sim',
        formato_interesse: 'MaaS',
        perfil: {
          faturamento_anual: 'R$ 25.000.000',
          colaboradores: 45,
          tempo_empresa: '12 anos',
        },
        pilares: {
          pilar_1_prisao_fundador: [
            {
              pergunta: '1.1 Centralização Decisória',
              resposta: 'Alta',
              nota: 'Fundador aprova 90% dos pedidos',
            },
            {
              pergunta: '1.2 Dependência de Pessoas-Chave',
              resposta: 'Crítica',
              nota: 'Sem sucessor para logística',
            },
          ],
          pilar_2_ineficiencia_invisivel: [
            {
              pergunta: '2.1 Retrabalho Operacional',
              resposta: 'Frequente',
              nota: 'Ruídos entre vendas e faturamento',
            },
            {
              pergunta: '2.2 Margem Real por SKU',
              resposta: 'Desconhecida com precisão',
              nota: 'Sem custeio ABC',
            },
          ],
          pilar_3_abismo_estrategia_execucao: [
            {
              pergunta: '3.1 Metas Desdobradas em OKRs',
              resposta: 'Não',
              nota: 'Equipe opera no modo apagar incêndio',
            },
          ],
        },
        hackman: [
          { dimensao: 'Autonomia da Liderança', nota: 2 },
          { dimensao: 'Clareza de Papéis', nota: 2 },
        ],
        buffett: [{ dimensao: 'Fosso Competitivo (Moat)', nota: 3 }],
        documentacao: {
          responsavel_envio: 'Carlos Eduardo Silveira',
          documentos_adicionais: ['Balanco_2025.pdf', 'DRE_Gerencial.xlsx'],
        },
      },
      respostas: {
        etapa_1: {
          setor: 'Distribuição e Logística',
          segmento: 'Distribuição B2B de Alimentos',
        },
        etapa_2: {
          faturamento_anual: 'R$ 25.000.000',
          colaboradores: 45,
          tempo_empresa: '12 anos',
        },
        etapa_3: {
          centralizacao_decisoria: 'Alta',
          dependencia_chave: 'Crítica',
        },
      },
      criado_em: new Date().toISOString(),
    }

    // 2. Criar lead no site
    const createRes = $http.send({
      url: siteUrl + '/api/collections/leads/records',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLeadPayload),
      timeout: 20,
    })

    if (createRes.statusCode !== 200 && createRes.statusCode !== 201) {
      return e.json(502, {
        success: false,
        step: 'create_lead_in_site',
        statusCode: createRes.statusCode,
        raw: createRes.raw,
      })
    }

    const siteCreatedRecord = createRes.json

    // 3. Sincronizar imediatamente para a coleção local 'leads'
    const leadsCol = $app.findCollectionByNameOrId('leads')
    const localRec = new Record(leadsCol)
    localRec.set('protocolo', testLeadPayload.protocolo)
    localRec.set('origem', testLeadPayload.origem)
    localRec.set('origem_tipo', testLeadPayload.origem_tipo)
    localRec.set('status', testLeadPayload.status)
    localRec.set('autorizacao_devolutiva', testLeadPayload.autorizacao_devolutiva)
    localRec.set('formato_interesse', testLeadPayload.formato_interesse)
    localRec.set('nome_completo', testLeadPayload.nome_completo)
    localRec.set('razao_social', testLeadPayload.razao_social)
    localRec.set('cnpj', testLeadPayload.cnpj)
    localRec.set('cargo', testLeadPayload.cargo)
    localRec.set('email', testLeadPayload.email)
    localRec.set('whatsapp', testLeadPayload.whatsapp)
    localRec.set('setor', testLeadPayload.setor)
    localRec.set('segmento', testLeadPayload.segmento)
    localRec.set('faturamento_mensal', testLeadPayload.faturamento_mensal)
    localRec.set('plano_interesse', testLeadPayload.plano_interesse)
    localRec.set('responsavel_envio', testLeadPayload.responsavel_envio)
    localRec.set('dados_completos', testLeadPayload.dados_completos)
    localRec.set('respostas', testLeadPayload.respostas)
    localRec.set('site_lead_id', siteCreatedRecord.id)
    localRec.set('site_created', siteCreatedRecord.created || '')
    localRec.set('site_updated', siteCreatedRecord.updated || '')
    localRec.set('synced_at', new Date().toISOString())

    $app.save(localRec)

    // 4. Gravar log de auditoria do teste
    const authUser = e.requestInfo ? e.requestInfo().auth : null
    const adminUserId = authUser ? authUser.id : null

    try {
      const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
      const auditRecord = new Record(logsCol)
      let userToLog = adminUserId
      if (!userToLog) {
        try {
          const u = $app.findFirstRecordByData('users', 'role', 'admin')
          userToLog = u.id
        } catch (_) {}
      }
      if (userToLog) {
        auditRecord.set('user', userToLog)
        auditRecord.set('action', 'Teste E2E Integração Site')
        auditRecord.set('resource', 'leads')
        auditRecord.set(
          'details',
          'Lead de teste E2E criado no site (' +
            siteCreatedRecord.id +
            ') e sincronizado com sucesso no app! Protocolo: ' +
            testLeadPayload.protocolo +
            ' | Credenciais via: ' +
            fonte,
        )
        $app.save(auditRecord)
      }
    } catch (_) {}

    return e.json(200, {
      success: true,
      message:
        'Teste ponta-a-ponta executado com sucesso! Lead criado no site institucional e sincronizado para o app.',
      siteLead: siteCreatedRecord,
      localLeadId: localRec.id,
      protocolo: testLeadPayload.protocolo,
    })
  },
  $apis.requireAdminAuth(),
)
