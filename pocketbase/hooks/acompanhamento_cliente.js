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

    // 5.6 Bloco epifanias (Fase F4 CaaS)
    // Extrai micro-epifanias da Fase 1 e vincula aos OKRs do BSC da Fase 3
    let epifaniasList = []
    try {
      const recFase1 = fasesMaisRecentes[1] || null
      let microEpifaniasRaw = []
      if (recFase1) {
        try {
          const artFase1 = recFase1.get('artefatos')
          if (artFase1) {
            const rawEpif = artFase1.micro_epifanias
            if (Array.isArray(rawEpif)) {
              microEpifaniasRaw = rawEpif
            } else if (rawEpif && Array.isArray(rawEpif.itens)) {
              microEpifaniasRaw = rawEpif.itens
            } else if (rawEpif && typeof rawEpif === 'object' && Array.isArray(rawEpif.lista)) {
              microEpifaniasRaw = rawEpif.lista
            }
          }
        } catch (_) {
          microEpifaniasRaw = []
        }
      }

      // Tabela de correspondência perspectiva -> área crítica canônica
      // Financeira -> Financeiro (variantes: Administrativo/Financeiro, Controladoria)
      // Clientes e Mercado -> Comercial (variante: Marketing)
      // Processos Internos -> Operações (variantes: Industrial, Logística, PCP)
      // Aprendizado e Crescimento -> RH (variante: Desenvolvimento Organizacional)
      function derivarAreaDePerspectiva(persp) {
        if (!persp || typeof persp !== 'string') return null
        const pLow = persp.toLowerCase()
        if (pLow.indexOf('financeir') !== -1 || pLow.indexOf('controladoria') !== -1) {
          return 'Financeiro'
        }
        if (
          pLow.indexOf('cliente') !== -1 ||
          pLow.indexOf('mercado') !== -1 ||
          pLow.indexOf('comercial') !== -1 ||
          pLow.indexOf('marketing') !== -1
        ) {
          return 'Comercial'
        }
        if (
          pLow.indexOf('processo') !== -1 ||
          pLow.indexOf('intern') !== -1 ||
          pLow.indexOf('opera') !== -1 ||
          pLow.indexOf('industr') !== -1 ||
          pLow.indexOf('log[íi]st') !== -1 ||
          pLow.indexOf('pcp') !== -1
        ) {
          return 'Operações'
        }
        if (
          pLow.indexOf('aprendiz') !== -1 ||
          pLow.indexOf('cresciment') !== -1 ||
          pLow.indexOf('rh') !== -1 ||
          pLow.indexOf('desenvolvimento organiz') !== -1 ||
          pLow.indexOf('gente') !== -1
        ) {
          return 'RH'
        }
        return null
      }

      function normalizarAreaCritica(areaRaw) {
        if (!areaRaw || typeof areaRaw !== 'string') return null
        const aLow = areaRaw.toLowerCase().trim()
        if (aLow.indexOf('financ') !== -1 || aLow.indexOf('controladoria') !== -1)
          return 'Financeiro'
        if (
          aLow.indexOf('comercial') !== -1 ||
          aLow.indexOf('vendas') !== -1 ||
          aLow.indexOf('marketing') !== -1 ||
          aLow.indexOf('cliente') !== -1
        )
          return 'Comercial'
        if (
          aLow.indexOf('opera') !== -1 ||
          aLow.indexOf('industr') !== -1 ||
          aLow.indexOf('fabr') !== -1 ||
          aLow.indexOf('produ') !== -1 ||
          aLow.indexOf('pcp') !== -1 ||
          aLow.indexOf('log[íi]st') !== -1
        )
          return 'Operações'
        if (
          aLow.indexOf('rh') !== -1 ||
          aLow.indexOf('humano') !== -1 ||
          aLow.indexOf('pessoas') !== -1 ||
          aLow.indexOf('gente') !== -1 ||
          aLow.indexOf('aprendiz') !== -1
        )
          return 'RH'
        if (aLow.indexOf('estrat') !== -1) return 'Estratégia'
        return null
      }

      // Extração de OKRs do artefato BSC da Fase 3
      const recFase3 = fasesMaisRecentes[3] || null
      const okrsBscFase3 = []
      if (recFase3) {
        try {
          const artFase3 = recFase3.get('artefatos')
          if (artFase3) {
            const bscRaw = artFase3.mapa_estrategico_bsc || artFase3.bsc || null
            const objEstratRaw = artFase3.objetivos_estrategicos || null

            // Extrair de array direto se houver
            function extrairOkrsDeFonte(fonte) {
              if (!fonte) return
              if (Array.isArray(fonte)) {
                for (let fIdx = 0; fIdx < fonte.length; fIdx++) {
                  const item = fonte[fIdx]
                  if (item && typeof item === 'object') {
                    const idOkr = item.id || 'okr_f3_' + (okrsBscFase3.length + 1)
                    const obj = item.objetivo || item.nome || item.titulo || item.enunciado || ''
                    const persp = item.perspectiva || ''
                    const areaDireta = item.area || item.area_critica || null
                    const areaFinal =
                      normalizarAreaCritica(areaDireta) || derivarAreaDePerspectiva(persp) || null
                    const prog = typeof item.progresso === 'number' ? item.progresso : 0
                    if (obj || persp) {
                      okrsBscFase3.push({
                        id: idOkr,
                        objetivo: obj,
                        perspectiva: persp,
                        area: areaFinal,
                        progresso: prog,
                      })
                    }
                  }
                }
              } else if (typeof fonte === 'object') {
                // Caso seja mapa de perspectivas: { financeira: [...], clientes: [...] }
                const chaves = Object.keys(fonte)
                for (let cIdx = 0; cIdx < chaves.length; cIdx++) {
                  const k = chaves[cIdx]
                  const val = fonte[k]
                  if (Array.isArray(val)) {
                    for (let vIdx = 0; vIdx < val.length; vIdx++) {
                      const vItem = val[vIdx]
                      if (vItem && typeof vItem === 'object') {
                        const idOkr = vItem.id || 'okr_f3_' + (okrsBscFase3.length + 1)
                        const obj = vItem.objetivo || vItem.nome || vItem.titulo || ''
                        const persp = vItem.perspectiva || k
                        const areaFinal =
                          normalizarAreaCritica(vItem.area || vItem.area_critica) ||
                          derivarAreaDePerspectiva(persp) ||
                          null
                        const prog = typeof vItem.progresso === 'number' ? vItem.progresso : 0
                        if (obj || persp) {
                          okrsBscFase3.push({
                            id: idOkr,
                            objetivo: obj,
                            perspectiva: persp,
                            area: areaFinal,
                            progresso: prog,
                          })
                        }
                      } else if (typeof vItem === 'string' && vItem.trim().length > 0) {
                        const areaFinal = derivarAreaDePerspectiva(k)
                        okrsBscFase3.push({
                          id: 'okr_f3_' + (okrsBscFase3.length + 1),
                          objetivo: vItem.trim(),
                          perspectiva: k,
                          area: areaFinal,
                          progresso: 0,
                        })
                      }
                    }
                  }
                }
              } else if (typeof fonte === 'string') {
                // Caso o artefato seja texto tabular ou em lista
                const linhasFonte = fonte.split('\n')
                let perspAtual = ''
                for (let lIdx = 0; lIdx < linhasFonte.length; lIdx++) {
                  const lf = linhasFonte[lIdx].trim()
                  if (!lf) continue
                  const lfLow = lf.toLowerCase()
                  if (
                    lfLow.indexOf('financeir') !== -1 &&
                    (lfLow.indexOf('perspectiva') !== -1 ||
                      lf.startsWith('#') ||
                      lf.startsWith('*'))
                  ) {
                    perspAtual = 'Financeira'
                  } else if (
                    (lfLow.indexOf('cliente') !== -1 || lfLow.indexOf('mercado') !== -1) &&
                    (lfLow.indexOf('perspectiva') !== -1 ||
                      lf.startsWith('#') ||
                      lf.startsWith('*'))
                  ) {
                    perspAtual = 'Clientes e Mercado'
                  } else if (
                    (lfLow.indexOf('processo') !== -1 || lfLow.indexOf('opera') !== -1) &&
                    (lfLow.indexOf('perspectiva') !== -1 ||
                      lf.startsWith('#') ||
                      lf.startsWith('*'))
                  ) {
                    perspAtual = 'Processos Internos'
                  } else if (
                    (lfLow.indexOf('aprendiz') !== -1 ||
                      lfLow.indexOf('crescimento') !== -1 ||
                      lfLow.indexOf('rh') !== -1) &&
                    (lfLow.indexOf('perspectiva') !== -1 ||
                      lf.startsWith('#') ||
                      lf.startsWith('*'))
                  ) {
                    perspAtual = 'Aprendizado e Crescimento'
                  } else if (lf.startsWith('-') || lf.startsWith('*') || /^\d+[.)]/.test(lf)) {
                    const objTxt = lf.replace(/^[-*•]|\d+[.)]\s*/, '').trim()
                    if (objTxt.length > 10) {
                      const areaDerivada = derivarAreaDePerspectiva(perspAtual)
                      okrsBscFase3.push({
                        id: 'okr_f3_' + (okrsBscFase3.length + 1),
                        objetivo: objTxt,
                        perspectiva: perspAtual || 'Geral',
                        area: areaDerivada,
                        progresso: 0,
                      })
                    }
                  }
                }
              }
            }

            extrairOkrsDeFonte(bscRaw)
            if (okrsBscFase3.length === 0) {
              extrairOkrsDeFonte(objEstratRaw)
            }
          }
        } catch (_) {}
      }

      // Processar cada micro-epifania
      for (let mIdx = 0; mIdx < microEpifaniasRaw.length; mIdx++) {
        const rawItem = microEpifaniasRaw[mIdx]
        let enunciado = ''
        let pilar = null
        let areaCritica = null
        let secaoFonte = null
        let valor = null

        if (typeof rawItem === 'string') {
          enunciado = rawItem.trim()
        } else if (rawItem && typeof rawItem === 'object') {
          enunciado =
            rawItem.enunciado || rawItem.texto || rawItem.descricao || rawItem.titulo || ''
          if (rawItem.pilar === 1 || rawItem.pilar === 2 || rawItem.pilar === 3) {
            pilar = rawItem.pilar
          } else if (
            rawItem.pilar_origem === 1 ||
            rawItem.pilar_origem === 2 ||
            rawItem.pilar_origem === 3
          ) {
            pilar = rawItem.pilar_origem
          }
          areaCritica = normalizarAreaCritica(rawItem.area_critica || rawItem.area)
          secaoFonte = rawItem.secao_fonte || rawItem.secao_fonte_dossie || rawItem.fonte || null
          valor = rawItem.valor || rawItem.valor_quantificado || null
        }

        if (!enunciado) continue

        // Detecção de pilar no texto caso null
        if (!pilar) {
          const eLow = enunciado.toLowerCase()
          if (
            eLow.indexOf('prisão do fundador') !== -1 ||
            eLow.indexOf('prisao do fundador') !== -1 ||
            eLow.indexOf('pilar 1') !== -1 ||
            eLow.indexOf('centraliza') !== -1 ||
            eLow.indexOf('sobrecarga cognitiva') !== -1 ||
            eLow.indexOf('gargalo decisório') !== -1 ||
            eLow.indexOf('gargalo decisorio') !== -1 ||
            eLow.indexOf('fundador') !== -1
          ) {
            pilar = 1
          } else if (
            eLow.indexOf('ineficiência invisível') !== -1 ||
            eLow.indexOf('ineficiencia invisivel') !== -1 ||
            eLow.indexOf('pilar 2') !== -1 ||
            eLow.indexOf('vazamento') !== -1 ||
            eLow.indexOf('sangramento') !== -1 ||
            eLow.indexOf('custo oculto') !== -1 ||
            eLow.indexOf('retrabalho') !== -1 ||
            eLow.indexOf('desperdício') !== -1 ||
            eLow.indexOf('desperdicio') !== -1
          ) {
            pilar = 2
          } else if (
            eLow.indexOf('abismo') !== -1 ||
            eLow.indexOf('estratégia vs') !== -1 ||
            eLow.indexOf('estrategia vs') !== -1 ||
            eLow.indexOf('pilar 3') !== -1 ||
            eLow.indexOf('desalinhamento') !== -1 ||
            eLow.indexOf('desconexão') !== -1 ||
            eLow.indexOf('falha de execução') !== -1 ||
            eLow.indexOf('execução') !== -1
          ) {
            pilar = 3
          }
        }

        // Detecção de seção fonte no texto caso null
        if (!secaoFonte) {
          const mSec = enunciado.match(/(?:se[çc][ãa]o\s*\d+(?:\s*\([^)]+\))?)/i)
          if (mSec) {
            secaoFonte = mSec[0]
          }
        }

        // Detecção de valor no texto caso null
        if (!valor) {
          const mVal = enunciado.match(/R\$\s*[\d.,]+(?:\s*(?:k|mil|milh[õo]es|m))?/i)
          if (mVal) {
            valor = mVal[0]
          } else if (
            enunciado.indexOf('[REQUER VERIFICAÇÃO]') !== -1 ||
            enunciado.indexOf('[REQUER VERIFICACAO]') !== -1
          ) {
            valor = '[REQUER VERIFICAÇÃO]'
          }
        }

        // Detecção de área crítica no texto caso null
        if (!areaCritica) {
          areaCritica = normalizarAreaCritica(enunciado)
        }

        // Regra de vinculação ao OKR da Fase 3
        // Procura no artefatos.bsc da Fase 3 o OKR cuja área (detalhada ou derivada) corresponde à área crítica da epifania
        let okrVinculado = null
        if (areaCritica && okrsBscFase3.length > 0) {
          const okrMatch = okrsBscFase3.find(function (o) {
            return o.area === areaCritica
          })
          if (okrMatch) {
            okrVinculado = {
              id: okrMatch.id,
              objetivo: okrMatch.objetivo,
              perspectiva: okrMatch.perspectiva,
              area: okrMatch.area,
              progresso: okrMatch.progresso,
            }
          }
        }

        // Se a área crítica ainda for null, tentar derivar a partir do primeiro OKR do BSC que dê match textual
        if (!areaCritica && okrsBscFase3.length > 0) {
          for (let oIdx = 0; oIdx < okrsBscFase3.length; oIdx++) {
            const cand = okrsBscFase3[oIdx]
            if (cand.area) {
              const candAreaLow = cand.area.toLowerCase()
              if (enunciado.toLowerCase().indexOf(candAreaLow) !== -1) {
                areaCritica = cand.area
                okrVinculado = {
                  id: cand.id,
                  objetivo: cand.objetivo,
                  perspectiva: cand.perspectiva,
                  area: cand.area,
                  progresso: cand.progresso,
                }
                break
              }
            }
          }
        }

        // Status de evolução da epifania
        // Regra de Bloqueio (Seção 3): Sem OKR vinculado, permanece bloqueado em "Não reconhecida"
        let statusEpifania = 'Não reconhecida'
        if (okrVinculado) {
          if (okrVinculado.progresso >= 100) {
            statusEpifania = 'Resolvida'
          } else if (okrVinculado.progresso > 0) {
            statusEpifania = 'Endereçada'
          } else {
            statusEpifania = 'Reconhecida'
          }
        }

        epifaniasList.push({
          enunciado: enunciado,
          pilar: pilar,
          area_critica: areaCritica,
          secao_fonte: secaoFonte,
          valor: valor,
          fase_origem: 1,
          status: statusEpifania,
          okr_vinculado: okrVinculado,
        })
      }
    } catch (errEpif) {
      $app.logger().error('Erro ao montar bloco epifanias: ' + (errEpif.message || String(errEpif)))
      epifaniasList = []
    }

    // 6. Resposta consolidada 200 OK (somente leitura — zero gravações, zero chamadas externas)
    return e.json(200, {
      fases: fasesRetorno,
      planos_acao: planosList,
      okrs: okrsList,
      epifanias: epifaniasList,
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
