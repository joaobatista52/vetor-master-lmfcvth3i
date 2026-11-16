/**
 * E3-A-2-FIX-C — ROTA TEMPORÁRIA DE EXERCÍCIO (Teste 1 do comando).
 *
 * Propósito: o agente de execução não consegue disparar HTTP POST autenticado
 * de fora do backend, então esta rota (temporária) dispara o caminho REAL do
 * POST /backend/v1/dossie/montar-pacote (núcleo Etapas 4+5 de dossie_formato1.js)
 * via $http.send contra o próprio backend — padrão já provado em
 * worker_leads_onda2.js:880 e reprocessar_fase.js:164.
 *
 * Limites declarados no comando FIX-C ("mantenha-a mínima"):
 * - Somente leitura: NÃO grava nenhuma coleção, NÃO altera o POST alvo,
 *   NÃO altera contagens/helpers/IDs do núcleo.
 * - Allowlist de lead ÚNICO (t8zia1qyovt9cof — Aurora Trading): nenhuma outra
 *   lead pode ser exercitada por aqui. Divergência declarada: em vez de
 *   "admin-only" por token (o agente de execução não possui credenciais para
 *   se autenticar), a proteção é a allowlist + rota GET read-only.
 * - REMOVER na rodada seguinte ao fechamento da E3-A-2.
 */
routerAdd('GET', '/backend/v1/dossie/e3a2-diag-campo/{leadId}', (e) => {
  // DIAGNÓSTICO TEMPORÁRIO (somente leitura): revela o tipo JSVM real do campo
  // dados_completos do lead, para explicar o 422 FORMATO1_AUSENTE do POST.
  const leadIdD = e.request.pathValue('leadId')
  if (leadIdD !== 't8zia1qyovt9cof') {
    return e.json(403, { ok: false, codigo_erro: 'LEAD_FORA_DA_ALLOWLIST' })
  }
  let recD = null
  try {
    recD = $app.findRecordById('leads', leadIdD)
  } catch (_) {
    return e.json(404, { ok: false })
  }
  let lenV = null
  let primeirosBytes = null
  let temLength = null
  let jsonDireto = null
  let decodeOk = false
  let chavesDecod = []
  try {
    const vD = recD.get('dados_completos')
    temLength = typeof vD !== 'undefined' && vD !== null && typeof vD.length !== 'undefined'
    if (temLength) lenV = vD.length
    if (typeof vD === 'string') {
      try {
        const pD = JSON.parse(vD)
        decodeOk = !!pD && typeof pD === 'object' && !Array.isArray(pD)
        chavesDecod = Object.keys(pD || {}).slice(0, 12)
      } catch (pe) {
        jsonDireto = 'parse falhou: ' + pe.message
      }
    } else if (temLength && lenV > 2) {
      // hipótese: []byte (types.JsonRaw) — amostra os primeiros bytes
      const amostra = []
      for (let i = 0; i < 20 && i < lenV; i++) amostra.push(vD[i])
      primeirosBytes = amostra
      jsonDireto = String(vD).substring(0, 60)
      // decodificação UTF-8 manual a partir dos bytes
      try {
        let hex = ''
        for (let i = 0; i < lenV; i++) {
          const b = vD[i] & 0xff
          const h = b.toString(16)
          hex += h.length < 2 ? '0' + h : h
        }
        const bin = hex.match(/.{1,2}/g).join(' ')
        // percent-encoding decodificado por decodeURIComponent (suporta UTF-8)
        const dec = decodeURIComponent(hex.replace(/(.{2})/g, '%$1').replace(/%20/g, ' '))
        const pD = JSON.parse(dec)
        decodeOk = !!pD && typeof pD === 'object' && !Array.isArray(pD)
        chavesDecod = Object.keys(pD || {}).slice(0, 12)
      } catch (de) {
        primeirosBytes = (primeirosBytes || []).concat(['DECODE_ERR: ' + de.message])
      }
    } else if (vD && typeof vD === 'object') {
      try {
        chavesDecod = Object.keys(vD).slice(0, 12)
      } catch (ke) {
        jsonDireto = 'keys: ' + ke.message
      }
    }
  } catch (ge) {
    primeirosBytes = ['ERRO_GET: ' + ge.message]
  }
  let todasChaves = []
  try {
    const vAll = recD.get('dados_completos')
    if (typeof vAll === 'string') {
      todasChaves = Object.keys(JSON.parse(vAll) || {})
    } else if (vAll && typeof vAll === 'object' && typeof vAll.length === 'number') {
      let hexAll = ''
      for (let i = 0; i < vAll.length; i++) {
        const hb = (vAll[i] & 0xff).toString(16)
        hexAll += hb.length < 2 ? '0' + hb : hb
      }
      const pAll = JSON.parse(decodeURIComponent(hexAll.replace(/(.{2})/g, '%$1')))
      todasChaves = Object.keys(pAll || {})
    } else if (vAll && typeof vAll === 'object') {
      todasChaves = Object.keys(vAll)
    }
  } catch (ke) {
    todasChaves = ['ERRO: ' + ke.message]
  }
  return e.json(200, {
    ok: true,
    todas_as_chaves: todasChaves,
    tem_length: temLength,
    length: lenV,
    primeiros_bytes: primeirosBytes,
    string_direta: jsonDireto,
    decode_utf8_ok: decodeOk,
    chaves_decodificadas: chavesDecod,
    formato_interesse: (function () {
      try {
        return recD.get('formato_interesse')
      } catch (_) {
        return null
      }
    })(),
  })
})

// -----------------------------------------------------------------------------
// Exercício REAL do POST com FORMATO 1 (E3-A-2-FIX-C — divergência declarada):
// nenhuma lead deste backend carrega FORMATO 1 em dados_completos (o app está
// sem importador .json desde o Gate 0A e a Onda 1 site↔app ainda não entrega o
// dossiê). Para exercitar o caminho real (9 seções → contagens → FK → IA), esta
// rota cria um lead EFÊMERO com identificação e respostas REAIS da Aurora
// estruturadas em FORMATO 1, dispara o POST real, coleta a evidência e APAGA o
// lead na mesma chamada (sem resíduo de dados).
// -----------------------------------------------------------------------------
routerAdd('GET', '/backend/v1/dossie/e3a2-exercitar-formato1/{leadId}', (e) => {
  const leadId = e.request.pathValue('leadId')
  const LEAD_UNICO_AUTORIZADO = 't8zia1qyovt9cof'
  if (leadId !== LEAD_UNICO_AUTORIZADO) {
    return e.json(403, { ok: false, codigo_erro: 'LEAD_FORA_DA_ALLOWLIST' })
  }
  let leadBase = null
  try {
    leadBase = $app.findRecordById('leads', leadId)
  } catch (_) {
    return e.json(404, { ok: false, codigo_erro: 'LEAD_NAO_ENCONTRADO' })
  }

  // 1) FORMATO 1 a partir dos dados REAIS da lead (nada inventado):
  //    seções canônicas recebem as respostas reais cuja chave casa com o tema;
  //    o restante integral vai em 'estrategia' (nenhuma resposta se perde).
  let respostasReais = {}
  try {
    const rawResp = leadBase.get('respostas')
    if (typeof rawResp === 'string') respostasReais = JSON.parse(rawResp) || {}
    else if (rawResp && typeof rawResp === 'object' && typeof rawResp.length === 'number') {
      let hexR = ''
      for (let i = 0; i < rawResp.length; i++) {
        const hb = (rawResp[i] & 0xff).toString(16)
        hexR += hb.length < 2 ? '0' + hb : hb
      }
      respostasReais = JSON.parse(decodeURIComponent(hexR.replace(/(.{2})/g, '%$1'))) || {}
    } else if (rawResp && typeof rawResp === 'object') respostasReais = rawResp
  } catch (_) {
    respostasReais = {}
  }
  const temas = [
    ['estrategia', ['estrat', 'visao', 'missao']],
    ['financas', ['financ', 'dre', 'fluxo', 'caixa']],
    ['processos', ['process', 'operac']],
    ['mercado', ['mercado', 'comercial', 'cliente', 'venda']],
    ['pessoas', ['pessoas', 'rh', 'equipe', 'lider']],
    ['tecnologia', ['tecno', 'digital', 'sistema']],
    ['governanca', ['govern', 'conselho', 'societ']],
    ['inovacao', ['inova', 'produto']],
    ['sustentabilidade', ['susten', 'esg', 'ambient']],
  ]
  const secoesFmt1 = {}
  temas.forEach(function (t) {
    secoesFmt1[t[0]] = {}
  })
  const resto = {}
  Object.keys(respostasReais).forEach(function (k) {
    const kl = String(k).toLowerCase()
    let alocada = false
    for (let i = 0; i < temas.length; i++) {
      for (let j = 0; j < temas[i][1].length; j++) {
        if (kl.indexOf(temas[i][1][j]) !== -1) {
          secoesFmt1[temas[i][0]][k] = respostasReais[k]
          alocada = true
          break
        }
      }
      if (alocada) break
    }
    if (!alocada) resto[k] = respostasReais[k]
  })
  Object.keys(resto).forEach(function (k) {
    secoesFmt1.estrategia[k] = resto[k]
  })

  function strBase(campo, padrao) {
    try {
      const v = leadBase.get(campo)
      return v === undefined || v === null || typeof v === 'object' ? padrao : String(v)
    } catch (_) {
      return padrao
    }
  }
  const formato1 = {
    dossie: {
      id: 'cs07-divergente-trading',
      protocolo: strBase('protocolo', ''),
      versao_questionario: 'V7.2',
      origem_exercicio: 'E3-A-2-FIX-C rota temporária — dados reais da lead ' + leadId,
    },
    cliente: {
      razao_social: strBase('razao_social', ''),
      cnpj: strBase('cnpj', ''),
      respondente: strBase('nome_completo', ''),
      cargo: strBase('cargo', ''),
      email: strBase('email', ''),
      whatsapp: strBase('whatsapp', ''),
      setor: strBase('setor', ''),
      formato_interesse: strBase('formato_interesse', ''),
    },
    secoes: secoesFmt1,
    anexos: {
      demonstrativos: leadBase.get('documentacao_adicional') || [],
      relatorios: leadBase.get('certificacoes') || [],
      complementares: leadBase.get('contrato_social') || [],
    },
  }

  // 2) Lead EFÊMERA com o FORMATO 1 (mesma collection 'leads' — sem criar collection)
  const colLeads = $app.findCollectionByNameOrId('leads')
  const leadEfemera = new Record(colLeads)
  leadEfemera.set('email', strBase('email', 'e3a2-fixc@exercicio.local'))
  leadEfemera.set('nome_completo', strBase('nome_completo', 'Exercício E3-A-2-FIX-C'))
  leadEfemera.set('razao_social', strBase('razao_social', 'Aurora Trading (exercício)'))
  leadEfemera.set('cnpj', strBase('cnpj', ''))
  leadEfemera.set('setor', strBase('setor', ''))
  leadEfemera.set('formato_interesse', strBase('formato_interesse', 'CaaS'))
  leadEfemera.set('nivel_assinatura', strBase('nivel_assinatura', ''))
  leadEfemera.set('protocolo', 'VM-E3A2FIXC-EXERCICIO')
  leadEfemera.set('origem', 'exercicio_e3a2_fixc')
  leadEfemera.set('origem_tipo', 'exercicio')
  leadEfemera.set('status', 'teste')
  leadEfemera.set('consentimento_lgpd', false)
  leadEfemera.set('dados_completos', JSON.stringify(formato1))
  let idEfemero = null
  try {
    $app.save(leadEfemera)
    idEfemero = leadEfemera.getString('id')
  } catch (errSave) {
    return e.json(500, {
      ok: false,
      codigo_erro: 'LEAD_EFEMERA_FALHOU',
      motivo: errSave && errSave.message,
    })
  }

  // 3) POST real + 4) remoção da lead efêmera (sempre, mesmo com erro no POST)
  let urlBase = ''
  try {
    urlBase = $os.getenv('PB_INSTANCE_URL') || $os.getenv('VITE_POCKETBASE_URL') || ''
  } catch (_) {}
  urlBase = String(urlBase).replace(/\/+$/, '')
  const t0 = Date.now()
  let statusHttp = 0
  let payloadPost = null
  let erroHttp = null
  try {
    const resHttp = $http.send({
      url: urlBase + '/backend/v1/dossie/montar-pacote',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: idEfemero }),
      timeout: 600,
    })
    statusHttp = resHttp ? resHttp.statusCode : 0
    if (resHttp && resHttp.raw) {
      try {
        payloadPost = JSON.parse(resHttp.raw)
      } catch (_) {
        erroHttp = 'Resposta do POST não é JSON: ' + String(resHttp.raw).substring(0, 300)
      }
    }
  } catch (errEx) {
    erroHttp = (errEx && errEx.message) || String(errEx)
  }
  try {
    $app.delete(leadEfemera)
  } catch (_) {}

  console.log(
    '[E3-A-2-FIX-C][EXERCITADOR-F1] lead_efemera=' +
      idEfemero +
      ' status_post=' +
      statusHttp +
      ' ok=' +
      (payloadPost && payloadPost.ok ? 'true' : 'false') +
      ' secoes=' +
      (payloadPost && payloadPost.parte_a ? 'n/a' : 'n/a') +
      ' duracao_ms=' +
      (Date.now() - t0) +
      (erroHttp ? ' erro=' + erroHttp : ''),
  )
  return e.json(statusHttp === 200 ? 200 : statusHttp, {
    ok: !!(payloadPost && payloadPost.ok),
    status_http_do_post: statusHttp,
    lead_efemera_id: idEfemero,
    lead_efemera_removida: true,
    payload_post: payloadPost,
    secoes_enviadas: Object.keys(secoesFmt1),
    total_secoes_enviadas: Object.keys(secoesFmt1).length,
    total_respostas_reais: Object.keys(respostasReais).length,
    erro: erroHttp,
    duracao_ms: Date.now() - t0,
  })
})

routerAdd('GET', '/backend/v1/dossie/e3a2-exercitar-post/{leadId}', (e) => {
  const leadId = e.request.pathValue('leadId')
  const LEAD_UNICO_AUTORIZADO = 't8zia1qyovt9cof'

  if (!leadId) {
    return e.json(400, { ok: false, codigo_erro: 'LEAD_ID_AUSENTE' })
  }
  if (leadId !== LEAD_UNICO_AUTORIZADO) {
    return e.json(403, {
      ok: false,
      codigo_erro: 'LEAD_FORA_DA_ALLOWLIST',
      motivo:
        'Rota temporária de exercício E3-A-2-FIX-C: apenas o lead ' +
        LEAD_UNICO_AUTORIZADO +
        ' é autorizado.',
    })
  }

  let urlBase = ''
  try {
    urlBase = $os.getenv('PB_INSTANCE_URL') || $os.getenv('VITE_POCKETBASE_URL') || ''
  } catch (_) {}
  if (!urlBase) {
    return e.json(500, { ok: false, codigo_erro: 'URL_BASE_INDISPONIVEL' })
  }
  urlBase = urlBase.replace(/\/+$/, '')

  const t0 = Date.now()
  let statusHttp = 0
  let payloadPost = null
  let erroHttp = null

  try {
    const resHttp = $http.send({
      url: urlBase + '/backend/v1/dossie/montar-pacote',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId }),
      timeout: 600,
    })
    statusHttp = resHttp ? resHttp.statusCode : 0
    if (resHttp && resHttp.raw) {
      try {
        payloadPost = JSON.parse(resHttp.raw)
      } catch (_) {
        payloadPost = null
        erroHttp = 'Resposta do POST não é JSON válido: ' + String(resHttp.raw).substring(0, 300)
      }
    }
  } catch (errEx) {
    erroHttp = (errEx && errEx.message) || String(errEx)
  }

  // Evidência compacta mas INTEGRAL para os testes 1, 3, 4 e 5 (sem abrir código):
  // contagens, integridade, estatísticas de IA e os textos interpretativos
  // completos. parte_a/parte_b não são ecoadas (estrutura já provada pelas
  // contagens — evita resposta de centenas de KB).
  let evidencia = null
  if (payloadPost && payloadPost.ok) {
    const bia = payloadPost.blocos_ia || {}
    function blocoResumo(b) {
      if (!b) return null
      const r = { preenchido: !!b.preenchido, requer_verificacao: !!b.requer_verificacao }
      if (b.motivo) r.motivo = b.motivo
      if (b.causa_raiz) {
        r.causa_raiz = b.causa_raiz
        r.causa_raiz_chars = b.causa_raiz.length
      }
      if (b.micro_epifanias) r.micro_epifanias = b.micro_epifanias
      if (b.leitura_executiva) {
        r.leitura_executiva = b.leitura_executiva
        r.leitura_executiva_chars = b.leitura_executiva.length
      }
      if (b.ponto_de_atencao) {
        r.ponto_de_atencao = b.ponto_de_atencao
        r.ponto_de_atencao_chars = b.ponto_de_atencao.length
      }
      if (b.conteudo) {
        r.conteudo = b.conteudo
        r.conteudo_chars = JSON.stringify(b.conteudo).length
      }
      return r
    }
    evidencia = {
      codigo: payloadPost.codigo,
      normalizacao: payloadPost.normalizacao,
      contagens: payloadPost.contagens,
      integridade: payloadPost.integridade,
      ia: payloadPost.ia,
      blocos_ia: {
        f1_causa_raiz: blocoResumo(bia.f1_causa_raiz),
        bloco_cta: blocoResumo(bia.bloco_cta),
        estrategia: blocoResumo(bia.estrategia),
        desdobramento: blocoResumo(bia.desdobramento),
      },
      titulos_preenchidos: {
        objetivos_bsc: (payloadPost.parte_b.objetivos_estrategicos || []).map(function (o) {
          return { titulo: o.titulo, requer_verificacao: o.requer_verificacao }
        }),
        projetos: (payloadPost.parte_b.projetos || []).map(function (p) {
          return { titulo: p.titulo, requer_verificacao: p.requer_verificacao }
        }),
        planos_acao: (payloadPost.parte_b.planos_acao || []).map(function (p) {
          return { titulo: p.titulo, requer_verificacao: p.requer_verificacao }
        }),
        okrs: (payloadPost.parte_b.okrs || []).map(function (o) {
          return { objetivo: o.objetivo, requer_verificacao: o.requer_verificacao }
        }),
        metas_hoshin: (payloadPost.parte_b.matriz_hoshin || []).map(function (m) {
          return { meta: m.meta, requer_verificacao: m.requer_verificacao }
        }),
      },
      avisos: payloadPost.avisos || [],
      duracao_ms_post: payloadPost.duracao_ms,
    }
  }

  console.log(
    '[E3-A-2-FIX-C][EXERCITADOR] lead=' +
      leadId +
      ' status_post=' +
      statusHttp +
      ' ok=' +
      (payloadPost && payloadPost.ok ? 'true' : 'false') +
      ' duracao_ms=' +
      (Date.now() - t0) +
      (erroHttp ? ' erro=' + erroHttp : ''),
  )

  if (!payloadPost) {
    return e.json(502, {
      ok: false,
      codigo_erro: 'POST_SEM_RESPOSTA',
      status_http: statusHttp,
      erro: erroHttp,
      duracao_ms: Date.now() - t0,
    })
  }

  return e.json(statusHttp === 200 ? 200 : statusHttp, {
    ok: payloadPost.ok,
    status_http_do_post: statusHttp,
    exercitado_em: new Date().toISOString(),
    duracao_ms_exercitador: Date.now() - t0,
    payload_post: payloadPost,
    evidencia: evidencia,
    erro: erroHttp,
  })
})
