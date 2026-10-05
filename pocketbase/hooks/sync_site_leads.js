// Sincronização automática e sob demanda da coleção 'leads' do Site Institucional para o App
// Frequência do cron: a cada 5 minutos ("*/5 * * * *")
// Endpoint manual sob demanda: POST /backend/v1/sync/leads (Requer Admin)
// Endpoint de teste/criação ponta-a-ponta: POST /backend/v1/sync/test-e2e (Requer Admin)

cronAdd('sync_site_leads_cron', '*/5 * * * *', () => {
  try {
    let siteUrl =
      $os.getenv('SITE_BACKEND_URL') ||
      'https://site-institucional-vetor-master-165d3.shrd00.internal.goskip.dev'
    if (siteUrl.endsWith('/')) siteUrl = siteUrl.slice(0, -1)
    const siteEmail = $os.getenv('SITE_SYNC_EMAIL') || 'app@vetormaster.com.br'
    const sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''

    if (!sitePassword) {
      $app.logger().warn('sync_site_leads_cron: SITE_SYNC_PASSWORD not configured')
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
      // Registrar log de auditoria de erro
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
              '): ' +
              (authRes.raw || '').substring(0, 300),
          )
          $app.save(errLog)
        }
      } catch (_) {}
      return
    }

    const token = authRes.json.token

    // 2. Buscar leads do site institucional (últimos 50 por página ordenados por criação)
    const leadsRes = $http.send({
      url: siteUrl + '/api/collections/leads/records?perPage=50&sort=-created',
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

    for (let i = 0; i < remoteItems.length; i++) {
      const item = remoteItems[i]
      const siteId = item.id
      const protocolo = item.protocolo || '#VM-' + siteId

      let localRecord = null
      try {
        localRecord = $app.findFirstRecordByData('leads', 'site_lead_id', siteId)
      } catch (_) {
        try {
          localRecord = $app.findFirstRecordByData('leads', 'protocolo', protocolo)
        } catch (_) {}
      }

      const isNew = !localRecord
      const rec = isNew ? new Record(leadsCol) : localRecord

      rec.set('protocolo', protocolo)
      rec.set('origem', item.origem || 'Site Institucional')
      rec.set('origem_tipo', item.origem_tipo || item.origemTipo || 'site')
      rec.set('status', item.status || 'Novo')
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

      $app.save(rec)

      if (isNew) {
        novosLeads++
      } else {
        atualizadosLeads++
      }
    }

    // Se houve novos leads sincronizados, registrar nos Logs de Auditoria
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
            'Cron a cada 5 min: ' +
              novosLeads +
              ' novo(s) lead(s) importado(s), ' +
              atualizadosLeads +
              ' atualizado(s) do site institucional.',
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
routerAdd(
  'POST',
  '/backend/v1/sync/leads',
  (e) => {
    let siteUrl =
      $os.getenv('SITE_BACKEND_URL') ||
      'https://site-institucional-vetor-master-165d3.shrd00.internal.goskip.dev'
    if (siteUrl.endsWith('/')) siteUrl = siteUrl.slice(0, -1)
    const siteEmail = $os.getenv('SITE_SYNC_EMAIL') || 'app@vetormaster.com.br'
    const sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''

    if (!sitePassword) {
      return e.json(500, {
        success: false,
        message: 'Credenciais de sincronização SITE_SYNC_PASSWORD não configuradas no app.',
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

    const authUser = e.requestInfo ? e.requestInfo().auth : null
    const adminUserId = authUser ? authUser.id : null

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

    // 2. Buscar leads do site institucional
    const leadsRes = $http.send({
      url: siteUrl + '/api/collections/leads/records?perPage=100&sort=-created',
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

    for (let i = 0; i < remoteItems.length; i++) {
      const item = remoteItems[i]
      const siteId = item.id
      const protocolo = item.protocolo || '#VM-' + siteId

      let localRecord = null
      try {
        localRecord = $app.findFirstRecordByData('leads', 'site_lead_id', siteId)
      } catch (_) {
        try {
          localRecord = $app.findFirstRecordByData('leads', 'protocolo', protocolo)
        } catch (_) {}
      }

      const isNew = !localRecord
      const rec = isNew ? new Record(leadsCol) : localRecord

      rec.set('protocolo', protocolo)
      rec.set('origem', item.origem || 'Site Institucional')
      rec.set('origem_tipo', item.origem_tipo || item.origemTipo || 'site')
      rec.set('status', item.status || 'Novo')
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
        syncLog.set(
          'details',
          'Sincronização sob demanda: ' +
            novosLeads +
            ' novo(s) lead(s), ' +
            atualizadosLeads +
            ' atualizado(s), ' +
            remoteItems.length +
            ' avaliado(s).',
        )
        $app.save(syncLog)
      } catch (_) {}
    }

    return e.json(200, {
      success: true,
      totalRemote: remoteItems.length,
      novosLeads: novosLeads,
      atualizadosLeads: atualizadosLeads,
      syncedAt: new Date().toISOString(),
    })
  },
  $apis.requireAdminAuth(),
)

// Endpoint para criação de lead de teste ponta-a-ponta no site institucional e sincronização imediata
routerAdd(
  'POST',
  '/backend/v1/sync/test-e2e',
  (e) => {
    let siteUrl =
      $os.getenv('SITE_BACKEND_URL') ||
      'https://site-institucional-vetor-master-165d3.shrd00.internal.goskip.dev'
    if (siteUrl.endsWith('/')) siteUrl = siteUrl.slice(0, -1)
    const siteEmail = $os.getenv('SITE_SYNC_EMAIL') || 'app@vetormaster.com.br'
    const sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''

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
            testLeadPayload.protocolo,
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
