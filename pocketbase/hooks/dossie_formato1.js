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
 * O QUE NÃO FAZ (vedações E3-A-1): NÃO chama IA, NÃO monta pacote V2.0, NÃO
 * valida contra as 14 regras, NÃO grava em nenhuma collection, NÃO calcula
 * DRE/WACC/FCF/valuation. Termina na leitura normalizada.
 *
 * FORMATO 1 (contrato com o Site, conforme validador pacote_v2.js):
 *   { dossie: {id, protocolo}, cliente: {razao_social, cnpj, respondente...},
 *     secoes: { "<nome>": { perguntas: { ... } } | {...} }, anexos: {...} }
 * Seções canonizadas (case-insensitive) em 3 formatos aceitos:
 *   objeto {perguntas:{...}} | objeto pergunta->resposta | array de itens.
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
    return e.json(404, {
      ok: false,
      codigo_erro: 'LEAD_NAO_ENCONTRADO',
      motivo: 'Lead não encontrado: ' + leadId,
    })
  }

  function recStr(nome) {
    try {
      const v = leadRec.get(nome)
      return v === undefined || v === null || typeof v === 'object' ? '' : String(v)
    } catch (_) {
      return ''
    }
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
      return v || null
    } catch (_) {
      return null
    }
  }

  // --------------------- FORMATO 1 (dados_completos) ---------------------
  const fc = recObj('dados_completos')
  if (!fc || typeof fc !== 'object' || Array.isArray(fc)) {
    return e.json(422, {
      ok: false,
      codigo_erro: 'FORMATO1_AUSENTE',
      motivo: 'dados_completos ausente ou inválido (não é objeto).',
    })
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
    return e.json(422, {
      ok: false,
      codigo_erro: 'FORMATO1_CHAVE_AUSENTE_' + chavesFaltantes.join('_').toUpperCase(),
      motivo:
        'FORMATO 1 inválido — chaves de 1º nível ausentes em dados_completos: ' +
        chavesFaltantes.join(', ') +
        '. Nada foi processado.',
      chaves_obrigatorias: chavesObrigatorias,
      chaves_ausentes: chavesFaltantes,
    })
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
  const leadId = e.request.PathValue('leadId')
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
