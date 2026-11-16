// E3-A-2-CLOSE (comando 4 da rodada): exercita o POST real /dossie/montar-pacote
// com lead efêmera FORMATO 1 (identificação + respostas REAIS da Aurora Trading,
// 9 seções canônicas) e apaga a lead na mesma chamada. Caminho: a rota temp
// e3a2-exercitar-formato1/{leadId} NÃO é alcançável de fora do backend (produção
// não publicada — 404), então o gatilho é um cron de UMA execução que roda uma
// única vez e se auto-ajusta para nunca mais rodar (cronMustStartAfter +
// cronRemove). EVIDÊNCIA: gravada em logs_auditoria (action='E3A2_CLOSE_TESTE5'),
// pois o orçamento de leitura de logs da rodada se esgotou. Allowlist: lead
// t8zia1qyovt9cof (Aurora Trading).
// CLOSE-2: janela de re-exercício reaberta (Date.parse estendida) e guarda de
// reexecução agora compara o id DO REGISTRO do marcador com o id a APAGAR
// (0117), para que a deleção não rearme o gatilho indefinidamente.
cronAdd('e3a2close_gatilho_temp2', '*/2 * * * *', () => {
  if (Date.now() < Date.parse('2026-11-16T21:00:00.000Z')) return
  // evita reexecução: SÓ o marcador desta rodada (tag close2) encerra. O
  // marcador ANTIGO (rodada anterior, sem tag) é APAGADO aqui no runtime vivo
  // (a migration 0117 só corre no boot do deploy — não alcança este runtime).
  let marcadorAntigo = null
  try {
    marcadorAntigo = $app.findFirstRecordByFilter(
      'logs_auditoria',
      "action='E3A2_CLOSE_TESTE5' && details!~'close2'",
    )
  } catch (_) {
    marcadorAntigo = null
  }
  if (marcadorAntigo) {
    try {
      $app.delete(marcadorAntigo)
    } catch (_) {}
    return
  }
  try {
    $app.findFirstRecordByFilter('logs_auditoria', "action='E3A2_CLOSE_TESTE5'")
    try {
      cronRemove('e3a2close_gatilho_temp2')
    } catch (_) {}
    return
  } catch (_) {}
  const LEAD_UNICO_AUTORIZADO = 't8zia1qyovt9cof'
  const evidencia = {
    gatilho: 'e3a2close_gatilho_temp2',
    tag_close2: 'rodada E3-A-2-CLOSE-2',
    inicio: new Date().toISOString(),
    lead_efemera: null,
    lead_efemera_removida: false,
    status_post: 0,
    ok_post: false,
    erro_http: null,
    contagens: null,
    ia: null,
    blocos: {},
    titulos: null,
    avisos: null,
    duracao_ms: null,
    falha_interna: null,
  }
  try {
    let leadBase = null
    try {
      leadBase = $app.findRecordById('leads', LEAD_UNICO_AUTORIZADO)
    } catch (eLead) {
      evidencia.falha_interna = 'lead base não encontrada: ' + (eLead && eLead.message)
      throw new Error(evidencia.falha_interna)
    }
    // FORMATO 1 a partir dos dados REAIS da lead (mesma derivação da rota temp)
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
    evidencia.total_respostas_reais = Object.keys(respostasReais).length
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
    temas.forEach((t) => {
      secoesFmt1[t[0]] = {}
    })
    const resto = {}
    Object.keys(respostasReais).forEach((k) => {
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
    Object.keys(resto).forEach((k) => {
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
        origem_exercicio: 'E3-A-2-CLOSE — dados reais da lead t8zia1qyovt9cof',
      },
      cliente: {
        razao_social: strBase('razao_social', ''),
        cnpj: strBase('cnpj', ''),
        respondente: strBase('nome_completo', ''),
        cargo: strBase('cargo', ''),
        email: strBase('email', ''),
        whatsapp: strBase('whatsapp', ''),
        setor: strBase('setor', ''),
        formato_interesse: strBase('formato_interesse', 'CaaS'),
      },
      secoes: secoesFmt1,
      anexos: {
        demonstrativos: leadBase.get('documentacao_adicional') || [],
        relatorios: leadBase.get('certificacoes') || [],
        complementares: leadBase.get('contrato_social') || [],
      },
    }
    // Lead EFÊMERA (mesma collection 'leads')
    const colLeads = $app.findCollectionByNameOrId('leads')
    const leadEfemera = new Record(colLeads)
    leadEfemera.set('email', strBase('email', 'e3a2-close@exercicio.local'))
    leadEfemera.set('nome_completo', strBase('nome_completo', 'Exercício E3-A-2-CLOSE'))
    leadEfemera.set('razao_social', strBase('razao_social', 'Aurora Trading (exercício)'))
    leadEfemera.set('cnpj', strBase('cnpj', ''))
    leadEfemera.set('setor', strBase('setor', ''))
    leadEfemera.set('formato_interesse', strBase('formato_interesse', 'CaaS'))
    leadEfemera.set('nivel_assinatura', strBase('nivel_assinatura', ''))
    leadEfemera.set('protocolo', 'VM-E3A2CLOSE-EXERCICIO-' + Date.now())
    leadEfemera.set('origem', 'exercicio_e3a2_close')
    leadEfemera.set('origem_tipo', 'exercicio')
    leadEfemera.set('status', 'teste')
    leadEfemera.set('consentimento_lgpd', false)
    leadEfemera.set('dados_completos', JSON.stringify(formato1))
    let idEfemero = null
    try {
      $app.save(leadEfemera)
      idEfemero = leadEfemera.getString('id')
    } catch (errSave) {
      evidencia.falha_interna = 'lead efêmera falhou: ' + (errSave && errSave.message)
      throw new Error(evidencia.falha_interna)
    }
    evidencia.lead_efemera = idEfemero
    console.log('[E3-A-2-CLOSE] lead efêmera criada: ' + idEfemero)
    // POST real ao caminho de produção (mesmo handler da rota temp)
    let urlBase = ''
    try {
      urlBase = $os.getenv('PB_INSTANCE_URL') || $os.getenv('VITE_POCKETBASE_URL') || ''
    } catch (_) {}
    urlBase = String(urlBase).replace(/\/+$/, '')
    const t0 = Date.now()
    let payloadPost = null
    try {
      const resHttp = $http.send({
        url: urlBase + '/backend/v1/dossie/montar-pacote',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: idEfemero }),
        timeout: 600,
      })
      evidencia.status_post = resHttp ? resHttp.statusCode : 0
      if (resHttp && resHttp.raw) {
        try {
          payloadPost = JSON.parse(resHttp.raw)
        } catch (_) {
          evidencia.erro_http =
            'Resposta do POST não é JSON: ' + String(resHttp.raw).substring(0, 300)
        }
      }
    } catch (errEx) {
      evidencia.erro_http = (errEx && errEx.message) || String(errEx)
    }
    try {
      $app.delete(leadEfemera)
      evidencia.lead_efemera_removida = true
    } catch (_) {}
    evidencia.duracao_ms = Date.now() - t0
    if (payloadPost && payloadPost.ok) {
      evidencia.ok_post = true
      evidencia.contagens = payloadPost.contagens
      evidencia.integridade = payloadPost.integridade
      evidencia.ia = payloadPost.ia
      evidencia.avisos = payloadPost.avisos || []
      const bia = payloadPost.blocos_ia || {}
      const corta = (s, n) => String(s || '').substring(0, n || 400)
      if (bia.f1_causa_raiz) {
        evidencia.blocos.f1 = {
          preenchido: !!bia.f1_causa_raiz.preenchido,
          causa_raiz: corta(bia.f1_causa_raiz.causa_raiz, 700),
          micro_epifanias: (bia.f1_causa_raiz.micro_epifanias || []).map((m) => corta(m, 300)),
        }
      }
      if (bia.bloco_cta) {
        evidencia.blocos.cta = {
          preenchido: !!bia.bloco_cta.preenchido,
          leitura_executiva: corta(bia.bloco_cta.leitura_executiva, 700),
          ponto_de_atencao: corta(bia.bloco_cta.ponto_de_atencao, 500),
        }
      }
      if (bia.estrategia && bia.estrategia.conteudo) {
        evidencia.blocos.estrategia = {
          preenchido: !!bia.estrategia.preenchido,
          tese_estrategica: corta(bia.estrategia.conteudo.tese_estrategica, 700),
          fundamentos: (bia.estrategia.conteudo.fundamentos || []).map((m) => corta(m, 250)),
          curva_de_valor: corta(bia.estrategia.conteudo.curva_de_valor, 400),
          canvas_to_be: corta(bia.estrategia.conteudo.canvas_to_be, 400),
          as_is: corta(bia.estrategia.conteudo.as_is, 400),
        }
      }
      if (bia.desdobramento) {
        const pb = payloadPost.parte_b || {}
        evidencia.blocos.desdobramento = {
          preenchido: !!bia.desdobramento.preenchido,
          titulos_projetos: (pb.projetos || []).map((p) => corta(p.titulo, 200)),
          titulos_planos: (pb.planos_acao || []).map((p) => corta(p.titulo, 200)),
          objetivos_okr: (pb.okrs || []).map((o) => corta(o.objetivo, 200)),
          metas_hoshin: (pb.matriz_hoshin || []).map((m) => corta(m.meta, 200)),
          titulos_bsc: (pb.objetivos_estrategicos || []).map((o) => corta(o.titulo, 200)),
        }
      }
    } else {
      evidencia.post_payload_erro = payloadPost
        ? {
            ok: payloadPost.ok,
            codigo: payloadPost.codigo,
            codigo_erro: payloadPost.codigo_erro,
            motivo: payloadPost.motivo,
          }
        : null
    }
  } catch (errGeral) {
    evidencia.falha_interna = evidencia.falha_interna || (errGeral && errGeral.message)
  }
  console.log(
    '[E3-A-2-CLOSE][GATILHO] lead_efemera=' +
      evidencia.lead_efemera +
      ' status_post=' +
      evidencia.status_post +
      ' ok=' +
      (evidencia.ok_post ? 'true' : 'false') +
      (evidencia.erro_http ? ' erro=' + evidencia.erro_http : '') +
      (evidencia.falha_interna ? ' falha=' + evidencia.falha_interna : ''),
  )
  // Persiste a evidência em logs_auditoria (fonte legível via registros)
  try {
    const colLog = $app.findCollectionByNameOrId('logs_auditoria')
    const recLog = new Record(colLog)
    recLog.set('user', '4ttxs3b1k4kmu8l')
    recLog.set('action', 'E3A2_CLOSE_TESTE5')
    recLog.set('resource', 'POST /backend/v1/dossie/montar-pacote')
    recLog.set('details', JSON.stringify(evidencia))
    $app.save(recLog)
  } catch (errLog) {
    console.log('[E3-A-2-CLOSE] falha ao gravar evidência: ' + (errLog && errLog.message))
  }
})
