/// <reference path="../pb_data/types.d.ts" />

/**
 * ACOMPANHAMENTO CONSOLIDADO DO CLIENTE — VETOR MASTER (FASE 7-BIS CaaS)
 * Rota GET que entrega planos de ação, OKRs e bloco curadoria consolidado.
 *
 * Rota: GET /backend/v1/diagnostico/acompanhamento/{leadId}
 *
 * Somente leitura — zero gravações ($app.save), zero chamadas HTTP ($http.send), zero chamadas de agente ($ai.agent).
 */

routerAdd('GET', '/backend/v1/diagnostico/acompanhamento/{leadId}', (e) => {
  try {
    // 1. Autenticação e autorização: replicar padrão das Fases 4 e 5 (role === 'admin')
    let authUser = null
    try {
      authUser = e.auth || (e.requestInfo && e.requestInfo().auth)
    } catch (_) {}

    let isAdmin = false
    if (authUser) {
      if (authUser.role === 'admin' || authUser.getString?.('role') === 'admin') {
        isAdmin = true
      }
    }

    if (!isAdmin) {
      return e.json(403, { erro: 'NAO_AUTORIZADO' })
    }

    const leadId = e.request.pathValue('leadId')
    if (!leadId) {
      return e.json(404, { erro: 'LEAD_NAO_ENCONTRADO' })
    }

    // 2. Leitura do lead e do diagnóstico
    let leadRec = null
    try {
      leadRec = $app.findRecordById('leads', leadId)
    } catch (_) {
      return e.json(404, { erro: 'LEAD_NAO_ENCONTRADO' })
    }

    let diagRec = null
    try {
      diagRec = $app.findFirstRecordByData('diagnosticos', 'lead', leadId)
    } catch (_) {
      return e.json(404, { erro: 'DIAGNOSTICO_NAO_ENCONTRADO' })
    }

    const diagId = diagRec.id

    // 3. Leitura dos Planos de Ação vinculados ao diagnóstico
    let planosList = []
    try {
      const planosRecords = $app.findRecordsByFilter(
        'planos_acao',
        "diagnostico = '" + diagId + "'",
        '-created',
        500,
        0,
      )

      planosList = planosRecords.map((p) => {
        let tarefas = []
        try {
          tarefas = p.get('tarefas_5w2h') || []
        } catch (_) {
          tarefas = []
        }

        return {
          id: p.id,
          status: p.getString('status') || '',
          fase_origem: p.getInt('fase_origem') || 0,
          versao_diagnostico: p.getInt('versao_diagnostico') || 0,
          curadoria_vinculada: p.getString('curadoria_vinculada') || '',
          tarefas_5w2h: tarefas,
        }
      })
    } catch (errPlanos) {
      $app
        .logger()
        .error(
          'Erro ao buscar planos_acao para acompanhamento: ' +
            (errPlanos.message || String(errPlanos)),
        )
      planosList = []
    }

    // 4. Leitura dos OKRs vinculados ao diagnóstico
    // Os OKRs possuem vinculo direto ao user do diagnostico ou curadoria_vinculada
    let okrsList = []
    try {
      const diagUserId = diagRec.getString('user') || ''
      let filterOkrs = "user = '" + diagUserId + "'"
      if (!diagUserId) {
        filterOkrs = "id != ''"
      }

      const okrsRecords = $app.findRecordsByFilter('okrs', filterOkrs, '-created', 500, 0)

      okrsList = okrsRecords.map((o) => {
        return {
          id: o.id,
          progresso: o.getFloat('progresso') || o.getInt('progresso') || 0,
          fase_origem: o.getInt('fase_origem') || 0,
          curadoria_vinculada: o.getString('curadoria_vinculada') || '',
        }
      })
    } catch (errOkrs) {
      $app
        .logger()
        .error('Erro ao buscar okrs para acompanhamento: ' + (errOkrs.message || String(errOkrs)))
      okrsList = []
    }

    // 5. Bloco curadoria
    // 5.1 nivel_assinatura: valor do lead, fallback 'SaaS Puro'
    const nivelAssinaturaLead = leadRec.getString('nivel_assinatura')
    const nivelAssinatura =
      nivelAssinaturaLead && nivelAssinaturaLead.trim().length > 0
        ? nivelAssinaturaLead
        : 'SaaS Puro'

    // 5.2 Leitura dos registros de diagnostico_fases vinculados ao diagnóstico
    let fasesRecords = []
    try {
      fasesRecords = $app.findRecordsByFilter(
        'diagnostico_fases',
        "diagnostico = '" + diagId + "'",
        '-versao',
        500,
        0,
      )
    } catch (errFases) {
      $app
        .logger()
        .error('Erro ao buscar diagnostico_fases: ' + (errFases.message || String(errFases)))
      fasesRecords = []
    }

    // 5.3 fases_desatualizadas e lista das fases mais recentes com artefatos
    // Como está ordenado por -versao, a primeira ocorrência de cada número de fase é a sua versão mais recente.
    const fasesMaisRecentes = {}
    for (let i = 0; i < fasesRecords.length; i++) {
      const fRec = fasesRecords[i]
      const fNum = fRec.getInt('fase')
      if (fNum && !fasesMaisRecentes[fNum]) {
        fasesMaisRecentes[fNum] = fRec
      }
    }

    const fasesDesatualizadas = []
    const fasesRetorno = []
    const chavesFases = Object.keys(fasesMaisRecentes)
    for (let k = 0; k < chavesFases.length; k++) {
      const fNumKey = Number(chavesFases[k])
      const rec = fasesMaisRecentes[fNumKey]
      if (rec && rec.getString('status') === 'desatualizada') {
        fasesDesatualizadas.push(fNumKey)
      }

      if (rec) {
        let artefatosVal = null
        try {
          artefatosVal = rec.get('artefatos') || null
        } catch (_) {
          artefatosVal = null
        }

        fasesRetorno.push({
          fase: fNumKey,
          versao: rec.getInt('versao') || 1,
          status: rec.getString('status') || '',
          artefatos: artefatosVal,
          updated: rec.getString('updated') || '',
        })
      }
    }
    fasesDesatualizadas.sort((a, b) => a - b)
    fasesRetorno.sort((a, b) => a.fase - b.fase)

    // 5.4 ultima_curadoria: data (updated) do registro mais recente em diagnostico_fases para o diagnóstico; null se nenhum
    let ultimaCuradoria = null
    if (fasesRecords.length > 0) {
      // Procura a maior data updated dentre os registros
      let dataMaisRecente = ''
      for (let j = 0; j < fasesRecords.length; j++) {
        const up = fasesRecords[j].getString('updated') || ''
        if (!dataMaisRecente || up > dataMaisRecente) {
          dataMaisRecente = up
        }
      }
      ultimaCuradoria = dataMaisRecente || null
    }

    // 5.5 planos_vinculados: contagem de planos de ação com curadoria_vinculada preenchida
    let planosVinculados = 0
    for (let pIdx = 0; pIdx < planosList.length; pIdx++) {
      const pItem = planosList[pIdx]
      if (
        pItem.curadoria_vinculada &&
        typeof pItem.curadoria_vinculada === 'string' &&
        pItem.curadoria_vinculada.trim().length > 0
      ) {
        planosVinculados++
      }
    }

    // 6. Resposta consolidada 200 OK (somente leitura — zero gravações, zero chamadas externas)
    return e.json(200, {
      fases: fasesRetorno,
      planos_acao: planosList,
      okrs: okrsList,
      curadoria: {
        nivel_assinatura: nivelAssinatura,
        fases_desatualizadas: fasesDesatualizadas,
        ultima_curadoria: ultimaCuradoria,
        planos_vinculados: planosVinculados,
      },
    })
  } catch (errGlobal) {
    const msg = errGlobal.message || String(errGlobal)
    $app.logger().error('Erro inesperado em acompanhamento_cliente: ' + msg)
    return e.json(500, {
      erro: 'ERRO_INTERNO',
      mensagem: msg,
    })
  }
})
