/// <reference path="../pb_data/types.d.ts" />

/**
 * E3-A-1 / ETAPA 3 — LEITURA E NORMALIZAÇÃO DO FORMATO 1 (backend only)
 * Rota: POST /backend/v1/dossie/normalizar  (body: { lead_id } )
 *       GET  /backend/v1/dossie/normalizar/{lead_id}
 *
 * Fonte canônica: campo dados_completos do lead (FORMATO 1, dossiê do Site).
 * Campos de primeiro nível do registro só complementam quando ausentes no bloco.
 *
 * O QUE ESTA ROTA FAZ (e só isso, conforme o corte E3-A-1):
 *   1. Valida chaves de 1º nível do FORMATO 1: dossie, cliente, secoes, anexos.
 *      Qualquer ausente => rejeição nomeada FORMATO1_CHAVE_AUSENTE_{CHAVE} (HTTP 422),
 *      sem processamento parcial.
 *   2. Devolve objeto normalizado:
 *      (a) identificacao (id dossiê, razão social, CNPJ, respondente, cargo,
 *          e-mail, whatsapp, setor, segmento, versão do questionário);
 *      (b) nível derivado pela regra da Etapa 2 (Bespoke ANTES de CaaS), com
 *          marca de origem do campo e booleano de fallback;
 *      (c) as NOVE seções com perguntas/respostas na estrutura original;
 *      (d) anexos por grupo quando existirem (ausência registrada, não bloqueia);
 *      (e) autorização de devolutiva e demais flags.
 *   3. Normaliza os 2 campos divergentes:
 *      - status: valor do Site quando presente; senão derivado do fluxo local
 *        (NUNCA assume "Novo" como verdade por si só);
 *      - data de criação: precedência site_created > criado_em > created.
 *   4. Preserva campos exclusivos do Site quando presentes (faturamento_mensal,
 *      plano_interesse, respostas separado, site_lead_id, site_created,
 *      site_updated, synced_at, 3 grupos de arquivos). Ausência não bloqueia.
 *
 * O QUE NÃO FAZ (vedações E3-A-1): NÃO chama IA, NÃO valida contra as 14 regras,
 * NÃO calcula DRE/WACC/FCF/valuation. Em E3-A-2 o POST /dossie/montar-pacote
 * MONTA o esqueleto determinístico do Pacote V2.0 (Etapa 4, sem IA, sem
 * narrativa, sem valores financeiros) em memória — sem gravar em collection.
 *
 * FORMATO 1 (contrato com o Site, conforme validador pacote_v2.js):
 *   { dossie: {id, protocolo}, cliente: {razao_social, cnpj, respondente...},
 *     secoes: { "<nome>": { perguntas: { ... } } | {...} }, anexos: {...} }
 * Seções canonizadas (case-insensitive) em 3 formatos aceitos:
 *   objeto {perguntas:{...}} | objeto pergunta->resposta | array de itens.
 *
 * E3-A-2 (rota POST /dossie/montar-pacote e GET /dossie/montar-pacote-teste):
 *   Etapa 4 — montagem determinística (sem IA) do esqueleto do Pacote V2.0;
 *   Etapa 5 — IA interpretativa via agente jbp-gestao-master (gateway), com os
 *   5 Slots de Contexto compactados por custo (teto US$ 0,25/execução).
 *
 * REGRA DE ESCOPO JSVM (PocketBase/Goja): callbacks rodam em pool isolado —
 * declaração top-level NÃO é visível dentro de callback. Desde E3-A-2-CLOSE-3
 * o núcleo das Etapas 4+5 reside no módulo dossie_montar_pacote_core.js,
 * compartilhado com o gatilho cron — via globalThis.$e3a2MontarPacoteCore
 * (CLOSE-4 passo 2): o runtime Skip Cloud empacota os hooks em um único pb.js
 * e require() falha com "Invalid module" (prova: cron falhou em 81 ms em
 * 2026-11-16 22:00).
 */

routerAdd('POST', '/backend/v1/dossie/normalizar', (e) => {
  const T0 = Date.now()

  // --------------------- entrada ---------------------
  let body = {}
  try {
    const rawBody = (e.requestInfo && e.requestInfo().body) || {}
    body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
  } catch (errBody) {
    return e.json(400, {
      ok: false,
      codigo_erro: 'CORPO_INVALIDO',
      motivo: 'JSON do corpo da requisição inválido: ' + errBody.message,
    })
  }

  const leadId = (body && body.lead_id) || ''
  if (!leadId) {
    return e.json(400, { ok: false, codigo_erro: 'LEAD_ID_AUSENTE', motivo: 'Informe lead_id.' })
  }

  let leadRec = null
  try {
    leadRec = $app.findRecordById('leads', leadId)
  } catch (_) {
    leadRec = null
  }
  if (!leadRec) {
    return {
      status: 404,
      payload: {
        ok: false,
        codigo_erro: 'LEAD_NAO_ENCONTRADO',
        motivo: 'Lead não encontrado: ' + leadId,
      },
    }
  }

  function recStr(nome) {
    try {
      const v = leadRec.get(nome)
      return v === undefined || v === null || typeof v === 'object' ? '' : String(v)
    } catch (_) {
      return ''
    }
  }
  // CORREÇÃO MÍNIMA E3-A-2-FIX-C (mesma divergência do núcleo E3): na JSVM,
  // campos JSON lidos via findRecordById().get() chegam como BYTES UTF-8 crus.
  function decodificarJsonBytesE3A(v) {
    try {
      if (v && typeof v === 'object' && typeof v.length === 'number' && v.length > 1) {
        let hex = ''
        for (let i = 0; i < v.length; i++) {
          const h = (v[i] & 0xff).toString(16)
          hex += h.length < 2 ? '0' + h : h
        }
        const dec = decodeURIComponent(hex.replace(/(.{2})/g, '%$1'))
        return JSON.parse(dec)
      }
    } catch (_) {}
    return null
  }
  function recObj(nome) {
    try {
      const v = leadRec.get(nome)
      if (v && typeof v === 'string') {
        try {
          return JSON.parse(v)
        } catch (_) {
          return null
        }
      }
      if (v && typeof v === 'object' && typeof v.length === 'number') {
        const d = decodificarJsonBytesE3A(v)
        return d || null
      }
      return v || null
    } catch (_) {
      return null
    }
  }

  // --------------------- FORMATO 1 (dados_completos) ---------------------
  const fc = recObj('dados_completos')
  if (!fc || typeof fc !== 'object' || Array.isArray(fc)) {
    return {
      status: 422,
      payload: {
        ok: false,
        codigo_erro: 'FORMATO1_AUSENTE',
        motivo: 'dados_completos ausente ou inválido (não é objeto).',
      },
    }
  }

  // Validação de entrada: chaves de 1º nível do FORMATO 1 (todas obrigatórias)
  const chavesObrigatorias = ['dossie', 'cliente', 'secoes', 'anexos']
  const chavesFaltantes = []
  for (let i = 0; i < chavesObrigatorias.length; i++) {
    if (fc[chavesObrigatorias[i]] === undefined || fc[chavesObrigatorias[i]] === null) {
      chavesFaltantes.push(chavesObrigatorias[i])
    }
  }
  if (chavesFaltantes.length > 0) {
    return {
      status: 422,
      payload: {
        ok: false,
        codigo_erro: 'FORMATO1_CHAVE_AUSENTE_' + chavesFaltantes.join('_').toUpperCase(),
        motivo:
          'FORMATO 1 inválido — chaves de 1º nível ausentes em dados_completos: ' +
          chavesFaltantes.join(', ') +
          '. Nada foi processado.',
        chaves_obrigatorias: chavesObrigatorias,
        chaves_ausentes: chavesFaltantes,
      },
    }
  }

  const fcDossie = fc.dossie || {}
  const fcCliente = fc.cliente || {}
  const fcSecoes = fc.secoes || {}
  const fcAnexos = fc.anexos || {}
  const fcMeta = fc.metadados || fc.meta || {}

  // --------------------- (b) nível — regra da Etapa 2 (CS-63) ---------------------
  // Mesma regra dos arquivos servico_diagnostico.js e worker_leads_onda2.js:
  // Bespoke verificado ANTES de CaaS; CaaS isolado => Bespoke CaaS;
  // MaaS/Híbrido => MaaS Híbrido; outro/vazio => SaaS Puro (fallback marcado).
  function derivarNivel(valor, origem) {
    const fmt = String(valor || '')
    if (fmt.indexOf('Bespoke') !== -1) {
      return { nivel: 'Bespoke CaaS', origem: origem, fallback: false, valor_bruto: valor }
    }
    if (fmt.indexOf('CaaS') !== -1) {
      return { nivel: 'Bespoke CaaS', origem: origem, fallback: false, valor_bruto: valor }
    }
    if (fmt.indexOf('MaaS') !== -1 || fmt.indexOf('Híbrido') !== -1) {
      return { nivel: 'MaaS Híbrido', origem: origem, fallback: false, valor_bruto: valor }
    }
    if (fmt.indexOf('SaaS') !== -1) {
      return { nivel: 'SaaS Puro', origem: origem, fallback: false, valor_bruto: valor }
    }
    return { nivel: 'SaaS Puro', origem: origem, fallback: true, valor_bruto: valor }
  }

  let nivelInfo = null
  const nivelAssinaturaLead = recStr('nivel_assinatura')
  if (nivelAssinaturaLead) {
    nivelInfo = derivarNivel(nivelAssinaturaLead, 'leads.nivel_assinatura')
  }
  if (!nivelInfo || nivelInfo.fallback) {
    const fmtLead = recStr('formato_interesse')
    if (fmtLead) {
      const candidata = derivarNivel(fmtLead, 'leads.formato_interesse')
      if (!candidata.fallback) nivelInfo = candidata
    }
  }
  if (!nivelInfo || nivelInfo.fallback) {
    const fmtCli = fcCliente.formato_interesse || fcCliente.formatoContratado || ''
    if (fmtCli) {
      const candidata = derivarNivel(fmtCli, 'dados_completos.cliente.formato_interesse')
      if (!candidata.fallback) nivelInfo = candidata
    }
  }
  if (!nivelInfo || nivelInfo.fallback) {
    const fmtMeta = fcMeta.formato_interesse || fcMeta.formato_interesse_lead || ''
    if (fmtMeta) {
      const candidata = derivarNivel(fmtMeta, 'dados_completos.metadados.formato_interesse')
      if (!candidata.fallback) nivelInfo = candidata
    }
  }
  if (!nivelInfo || nivelInfo.fallback) {
    const fmtDoss = fcDossie.formato_interesse || ''
    if (fmtDoss) {
      const candidata = derivarNivel(fmtDoss, 'dados_completos.dossie.formato_interesse')
      if (!candidata.fallback) nivelInfo = candidata
    }
  }
  if (!nivelInfo || nivelInfo.fallback) {
    // Nenhum campo de formato útil encontrado — SaaS Puro com marca de fallback.
    nivelInfo = {
      nivel: 'SaaS Puro',
      origem: 'nenhum_campo_informado',
      fallback: true,
      valor_bruto: '',
    }
  }

  // --------------------- (c) as nove seções ---------------------
  // Estrutura original preservada; canonicalização apenas por nome (case-insensitive).
  const NOMES_CANONICOS = [
    'estrategia',
    'financas',
    'processos',
    'mercado',
    'pessoas',
    'tecnologia',
    'governanca',
    'inovacao',
    'sustentabilidade',
  ]
  const secoesNormalizadas = []
  const chavesSecoes = Object.keys(fcSecoes || {})
  for (let i = 0; i < chavesSecoes.length; i++) {
    const chave = chavesSecoes[i]
    const conteudo = fcSecoes[chave]
    const chaveNorm = String(chave).trim().toLowerCase()
    // canonicaliza nome sem alterar conteúdo
    let nomeCanonico = chaveNorm
    for (let j = 0; j < NOMES_CANONICOS.length; j++) {
      if (chaveNorm.indexOf(NOMES_CANONICOS[j]) !== -1) {
        nomeCanonico = NOMES_CANONICOS[j]
        break
      }
    }
    // Extrai o mapa pergunta->resposta preservando a estrutura original
    let perguntas = null
    if (conteudo && typeof conteudo === 'object' && !Array.isArray(conteudo)) {
      if (conteudo.perguntas && typeof conteudo.perguntas === 'object') {
        perguntas = conteudo.perguntas
      } else if (conteudo.respostas && typeof conteudo.respostas === 'object') {
        perguntas = conteudo.respostas
      } else {
        perguntas = conteudo // objeto pergunta->resposta direto
      }
    } else if (Array.isArray(conteudo)) {
      perguntas = { _itens: conteudo } // array de itens preservado
    } else {
      perguntas = { _valor: conteudo }
    }
    secoesNormalizadas.push({
      chave_original: chave,
      nome: nomeCanonico,
      tipo_conteudo: Array.isArray(conteudo)
        ? 'array'
        : conteudo && typeof conteudo === 'object'
          ? 'objeto'
          : 'escalar',
      perguntas: perguntas,
      total_perguntas:
        perguntas && typeof perguntas === 'object' ? Object.keys(perguntas).length : 0,
    })
  }
  if (secoesNormalizadas.length === 0) {
    return e.json(422, {
      ok: false,
      codigo_erro: 'FORMATO1_SECOES_VAZIAS',
      motivo: 'FORMATO 1 inválido — secoes presente mas sem nenhuma seção. Nada foi processado.',
    })
  }

  // --------------------- (d) anexos por grupo ---------------------
  const grupoAnexos = {
    demonstrativos_financeiros: {
      campo_dados_completos: 'demonstrativos',
      campo_lead: 'documentacao_adicional',
    },
    relatorios_gerenciais: { campo_dados_completos: 'relatorios', campo_lead: 'certificacoes' },
    sociedade_complementares: {
      campo_dados_completos: 'complementares',
      campo_lead: 'contrato_social',
    },
  }
  const anexosNormalizados = {}
  const avisosAnexos = []
  const chavesGrupos = Object.keys(grupoAnexos)
  for (let i = 0; i < chavesGrupos.length; i++) {
    const grupo = chavesGrupos[i]
    const conf = grupoAnexos[grupo]
    let v = fcAnexos[conf.campo_dados_completos]
    if (v === undefined || v === null) v = fcAnexos[grupo]
    if ((v === undefined || v === null) && conf.campo_lead) {
      v = leadRec.get(conf.campo_lead)
    }
    const lista = Array.isArray(v) ? v : v ? [v] : []
    anexosNormalizados[grupo] = lista
    if (lista.length === 0) {
      avisosAnexos.push('anexos.' + grupo + ': ausente ou vazio (não bloqueia)')
    }
  }

  // --------------------- normalização dos 2 campos divergentes ---------------------
  // STATUS: valor do Site quando presente; senão deriva do fluxo local.
  // NUNCA assume "Novo" como verdade por si só.
  const statusSite = recStr('status')
  const temRespostasLocal = !!recObj('respostas')
  const statusLocalFluxo = temRespostasLocal
    ? 'novo'
    : recStr('teaser_gerado') === 'true'
      ? 'processado'
      : 'aguardando_processamento'
  const statusNormalizado = statusSite ? { valor: statusSite, origem: 'leads.status' } : null

  // DATA DE CRIAÇÃO: precedência site_created > criado_em > created
  const siteCreated = recStr('site_created')
  const criadoEm = recStr('criado_em') || fcDossie.criado_em || fcDossie.criadoEm || ''
  const created = recStr('created')
  let dataCriacao = null
  let dataCriacaoOrigem = null
  if (siteCreated) {
    dataCriacao = siteCreated
    dataCriacaoOrigem = 'site_created'
  } else if (criadoEm) {
    dataCriacao = criadoEm
    dataCriacaoOrigem = 'criado_em'
  } else if (created) {
    dataCriacao = created
    dataCriacaoOrigem = 'created'
  }

  // --------------------- resposta ---------------------
  const identificacao = {
    id_dossie: fcDossie.id || fcDossie.dossie_id || fcMeta.dossie_id || recStr('site_lead_id'),
    protocolo: fcDossie.protocolo || fcMeta.protocolo || recStr('protocolo'),
    razao_social: fcCliente.razao_social || fcCliente.empresa || recStr('razao_social'),
    cnpj: fcCliente.cnpj || recStr('cnpj'),
    respondente:
      fcCliente.respondente ||
      fcCliente.nome_completo ||
      fcCliente.nome ||
      recStr('nome_completo') ||
      recStr('responsavel_envio'),
    cargo: fcCliente.cargo || recStr('cargo'),
    email: fcCliente.email || fcCliente.email_corporativo || recStr('email'),
    whatsapp: fcCliente.whatsapp || fcCliente.telefone || recStr('whatsapp'),
    setor: fcCliente.setor || recStr('setor'),
    segmento: fcCliente.segmento || recStr('segmento'),
    versao_questionario:
      fcCliente.versao_questionario ||
      fcMeta.versao_questionario ||
      recStr('versao_questionario') ||
      'V7.2',
  }

  return e.json(200, {
    ok: true,
    codigo: 'FORMATO1_NORMALIZADO',
    lead_id: leadRec.getString('id'),
    identificacao: identificacao,
    nivel: {
      nivel: nivelInfo.nivel,
      origem: nivelInfo.origem,
      fallback: nivelInfo.fallback,
      valor_bruto: nivelInfo.valor_bruto,
      regra: 'Etapa 2 (CS-63): Bespoke antes de CaaS; CaaS isolado => Bespoke CaaS',
    },
    secoes: secoesNormalizadas,
    total_secoes: secoesNormalizadas.length,
    anexos: anexosNormalizados,
    autorizacao: {
      autorizacao_devolutiva:
        fcCliente.autorizacao_devolutiva || recStr('autorizacao_devolutiva') || '',
      consentimento_lgpd: !!leadRec.get('consentimento_lgpd'),
      membro_fundador: !!leadRec.get('membro_fundador'),
    },
    flags: {
      origem: fcCliente.origem_tipo || recStr('origem_tipo') || recStr('origem') || '',
      origem_parceiro: fcCliente.origem_parceiro || recStr('origem_parceiro') || '',
      origem_tipo: recStr('origem_tipo'),
      site_lead_id: recStr('site_lead_id') || null,
      faturamento_mensal: leadRec.get('faturamento_mensal') || null,
      plano_interesse: recStr('plano_interesse') || null,
      respostas_separadas: recObj('respostas'),
    },
    normalizados: {
      status: statusNormalizado,
      status_derivado_fluxo: statusNormalizado ? null : statusLocalFluxo,
      data_criacao: dataCriacao,
      data_criacao_origem: dataCriacaoOrigem,
      data_criacao_precedencia: ['site_created', 'criado_em', 'created'],
    },
    exclusivos_site: {
      faturamento_mensal: leadRec.get('faturamento_mensal') || null,
      plano_interesse: recStr('plano_interesse') || null,
      site_lead_id: recStr('site_lead_id') || null,
      site_created: siteCreated || null,
      site_updated: recStr('site_updated') || null,
      synced_at: recStr('synced_at') || null,
      arquivos: {
        documentacao_adicional: leadRec.get('documentacao_adicional') || [],
        certificacoes: leadRec.get('certificacoes') || [],
        contrato_social: leadRec.get('contrato_social') || [],
      },
    },
    avisos: avisosAnexos,
    duracao_ms: Date.now() - T0,
  })
})

routerAdd('GET', '/backend/v1/dossie/normalizar/{leadId}', (e) => {
  const leadId = e.request.pathValue('leadId')
  if (!leadId) {
    return e.json(400, { ok: false, codigo_erro: 'LEAD_ID_AUSENTE' })
  }
  // Delegação: reutiliza a mesma lógica reencaminhando um corpo sintético.
  // JSVM: sem $app.routerAdd interno — a leitura é refeita aqui em versão reduzida.
  let leadRec = null
  try {
    leadRec = $app.findRecordById('leads', leadId)
  } catch (_) {
    leadRec = null
  }
  if (!leadRec) {
    return e.json(404, { ok: false, codigo_erro: 'LEAD_NAO_ENCONTRADO' })
  }
  return e.json(200, {
    ok: true,
    lead_id: leadRec.getString('id'),
    mensagem: 'Use POST /backend/v1/dossie/normalizar com { "lead_id": "' + leadId + '" }',
  })
})

// =============================================================================
// E3-A-2 · Etapas 4 + 5 — MONTAGEM DO PACOTE V2.0 (determinística + IA)
// BLOQUEIO 1 (E3-A-2-FIX-A): TODO o código destas duas etapas reside DENTRO do
// callback da rota POST — no PocketBase (Goja/JSVM) callbacks rodam em VMs
// separadas (pool) e uma declaração top-level NÃO é visível dentro do callback
// (prova: deploy anterior reprovado com "Hook scoping error: top-level decl").
// A declaração do núcleo fica DEPOIS do return do callback, o que é válido:
// declaração de função é içada (hoisting) no escopo do callback — a chamada
// acima dela executa normalmente. A antiga declaração top-level deixa de existir.
// Somente leitura: nenhuma collection é gravada (corte E3-A-1 contínuo).
// =============================================================================

// Rota de exercício runtime (Adendo 1) — DELEGAÇÃO DE CONTRATO (decisão FIX-A):
// com o núcleo confinado ao callback do POST (Bloqueio 1), esta rota GET não
// pode mais invocá-lo — duplicar ~1.200 linhas de núcleo seria o mesmo defeito
// de manutenção já causado por cópias em worker_leads_onda2.js. Mesmo padrão da
// rota GET /dossie/normalizar/{leadId}. Somente leitura; exercício completo da
// montagem = POST /dossie/montar-pacote.
routerAdd('GET', '/backend/v1/dossie/montar-pacote-teste/{leadId}', (e) => {
  const leadIdGet = e.request.pathValue('leadId')
  if (!leadIdGet) {
    return e.json(400, { ok: false, codigo_erro: 'LEAD_ID_AUSENTE', motivo: 'Informe leadId.' })
  }
  let leadRecTeste = null
  try {
    leadRecTeste = $app.findRecordById('leads', leadIdGet)
  } catch (_) {
    leadRecTeste = null
  }
  if (!leadRecTeste) {
    return e.json(404, { ok: false, codigo_erro: 'LEAD_NAO_ENCONTRADO' })
  }
  return e.json(200, {
    ok: true,
    lead_id: leadRecTeste.getString('id'),
    mensagem:
      'Use POST /backend/v1/dossie/montar-pacote com { "lead_id": "' +
      leadRecTeste.getString('id') +
      '" } — o núcleo das Etapas 4+5 reside dentro do callback do POST (escopo JSVM).',
  })
})

// Rota de contrato (Etapa 4/5) — POST com lead_id no corpo.
// E3-A-2-CLOSE-5: núcleo importado com o MESMO padrão do consumidor do helper
// antigo (sync_site_leads.js → dossie_versoes_helper.js): require com
// template literal `${__hooks}/...` DENTRO do callback, no topo do handler.
routerAdd('POST', '/backend/v1/dossie/montar-pacote', (e) => {
  // ADENDO 3: métodos de request camelCase na JSVM.
  let body = {}
  try {
    const rawBody = (e.requestInfo && e.requestInfo().body) || {}
    body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
  } catch (errBody) {
    return e.json(400, {
      ok: false,
      codigo_erro: 'CORPO_INVALIDO',
      motivo: 'JSON do corpo da requisição inválido: ' + errBody.message,
    })
  }
  const leadIdPost = (body && body.lead_id) || ''
  if (!leadIdPost) {
    return e.json(400, { ok: false, codigo_erro: 'LEAD_ID_AUSENTE', motivo: 'Informe lead_id.' })
  }
  // E3-A-2-CLOSE-5: require do núcleo no MESMO padrão do consumidor do helper
  // antigo (sync_site_leads.js → dossie_versoes_helper.js): template literal
  // com ${__hooks}, DENTRO do callback. Canal requerido como PRIMEIRA via.
  var coreMontarPacote = null
  var canalCore = null
  try {
    coreMontarPacote = require(`${__hooks}/dossie_montar_pacote_core.js`)
    canalCore = 'require(${__hooks}/dossie_montar_pacote_core.js)'
  } catch (errReqPost) {
    coreMontarPacote = null
    console.log(
      '[E3-A-2][montar-pacote] require do core falhou: ' + (errReqPost && errReqPost.message),
    )
  }
  // Via redundante: globalThis (registro feito pelo próprio core no boot).
  if (!coreMontarPacote) {
    try {
      var __e3a2HostPost = typeof globalThis !== 'undefined' ? globalThis : this
      if (__e3a2HostPost && __e3a2HostPost.$e3a2MontarPacoteCore) {
        coreMontarPacote = __e3a2HostPost.$e3a2MontarPacoteCore
        canalCore = 'globalThis'
      }
    } catch (_) {
      coreMontarPacote = null
    }
  }
  if (!coreMontarPacote || !coreMontarPacote.executarMontagemPacoteE3A2) {
    return e.json(500, {
      ok: false,
      codigo_erro: 'CORE_INDISPONIVEL',
      motivo: 'Núcleo Etapas 4+5 não carregou (require no padrão do helper e globalThis falharam).',
    })
  }
  const rPost = coreMontarPacote.executarMontagemPacoteE3A2(leadIdPost)
  try {
    rPost.payload.canal_core = canalCore
  } catch (_) {}
  return e.json(rPost.status, rPost.payload)
})
