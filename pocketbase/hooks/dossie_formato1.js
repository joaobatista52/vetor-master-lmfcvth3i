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

// --------------------- E3-A-2 · Etapa 4: montagem determinística ---------------------
// Esqueleto completo do Pacote V2.0 a partir do objeto normalizado da Etapa 3.
// SEM IA: estrutura, contagens por nível (Tabela E3-A-2, valores do Comando 0 V2.2)
// e vínculos. Narrativa, valores financeiros e validação das 14 regras ficam para
// E3-B e Etapa 6. IDs determinísticos (hash FNV-1a de chaves estáveis).
// Somente leitura: não grava em nenhuma collection (corte E3-A-1 contínuo).

// Tabela de contagens por nível (Comando E3-A-2 item 4b — valores do Comando 0 V2.2)
const CONTAGENS_POR_NIVEL_E3A2 = {
  'Bespoke CaaS': {
    projetos: 6,
    planos_acao: 12,
    okrs: 7,
    objetivos_bsc: 14,
    itens_erec: 20,
    linhas_hoshin: 7,
    ews: 8,
    indicadores_buffett: [7, 8],
    linhas_dre: 15,
    conselho_consultivo: true,
    conselho_administracao: true,
    benchmark_setorial: true,
    valuation: true,
  },
  'MaaS Híbrido': {
    projetos: 3,
    planos_acao: 6,
    okrs: 3,
    objetivos_bsc: 4,
    itens_erec: 8,
    linhas_hoshin: 0,
    ews: 2,
    indicadores_buffett: [4, 4],
    linhas_dre: [8, 10],
    conselho_consultivo: false,
    conselho_administracao: false,
    benchmark_setorial: false,
    valuation: false,
  },
  'SaaS Puro': {
    projetos: 4,
    planos_acao: 8,
    okrs: 7,
    objetivos_bsc: 8,
    itens_erec: 12,
    linhas_hoshin: 4,
    ews: 5,
    indicadores_buffett: [7, 8],
    linhas_dre: 15,
    conselho_consultivo: true,
    conselho_administracao: false,
    benchmark_setorial: false,
    valuation: false,
  },
}

const TITULOS_FASES_E3A2 = [
  'P1 — Diagnóstico e Estruturação (Skill 13 Prompts V7.2.3-A9 · Prompt 1)',
  'P2 — Contexto Estratégico Global (Skill 13 Prompts V7.2.3-A9 · Prompt 2)',
  'P3 — Epifanias e Causa Raiz (Skill 13 Prompts V7.2.3-A9 · Prompt 3)',
  'P4 — Estratégia e Curva de Valor (Skill 13 Prompts V7.2.3-A9 · Prompt 4)',
  'P5 — BSC e Desdobramento (Skill 13 Prompts V7.2.3-A9 · Prompt 5)',
  'P6 — Validação Financeira e Alocação (Skill 13 Prompts V7.2.3-A9 · Prompt 6)',
  'P7 — Governança e Liderança (Skill 13 Prompts V7.2.3-A9 · Prompt 7)',
  'P8 — Inovação e Tecnologia (Skill 13 Prompts V7.2.3-A9 · Prompt 8)',
  'P9 — Consolidação do Bloco Solução (Skill 13 Prompts V7.2.3-A9 · Prompt 9)',
  'P10 — Auditoria de Aderência (Skill 13 Prompts V7.2.3-A9 · Prompt 10)',
  'P11 — DRE de 15 Linhas (Skill 13 Prompts V7.2.3-A9 · Prompt 11)',
  'P12 — EREC e Gabaritos (Skill 13 Prompts V7.2.3-A9 · Prompt 12)',
  'P13 — Consolidação do Pacote (Skill 13 Prompts V7.2.3-A9 · Prompt 13)',
]

// Hash FNV-1a 32 bits → base36 (IDs determinísticos, sem aleatoriedade)
function hashIdE3A2(entrada) {
  const s = String(entrada)
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(36)
}
function idObjetivoE3A2(execId, i) {
  return 'obj-' + hashIdE3A2(execId + '|obj|' + i)
}
function idProjetoE3A2(execId, i) {
  return 'prj-' + hashIdE3A2(execId + '|prj|' + i)
}
function idPlanoE3A2(execId, i) {
  return 'pln-' + hashIdE3A2(execId + '|pln|' + i)
}
function idOkrE3A2(execId, i) {
  return 'okr-' + hashIdE3A2(execId + '|okr|' + i)
}
function idHoshinE3A2(execId, i) {
  return 'hsh-' + hashIdE3A2(execId + '|hsh|' + i)
}
function idEtapaE3A2(execId, planoIdx, i) {
  return 'etp-' + hashIdE3A2(execId + '|etp|' + planoIdx + '|' + i)
}

function montarPacoteV2E3A2(normalizado) {
  try {
    const nivel = normalizado.nivel.nivel
    const cont = CONTAGENS_POR_NIVEL_E3A2[nivel]
    if (!cont) {
      return {
        ok: false,
        codigo_erro: 'NIVEL_SEM_TABELA',
        motivo: 'Nível sem tabela de contagens: ' + nivel,
      }
    }
    const ident = normalizado.identificacao || {}
    const dossieId = ident.id_dossie || normalizado.lead_id || ''
    const execId =
      'exec-' +
      hashIdE3A2(
        (dossieId || '') +
          '|' +
          (ident.protocolo || '') +
          '|' +
          (normalizado.lead_id || '') +
          '|v7.2|' +
          nivel,
      )

    // (a) 13 objetos conteudo_fases — cobertura P1..P13 é condição da montagem
    const conteudoFases = []
    for (let i = 1; i <= 13; i++) {
      conteudoFases.push({
        fase_id: 'P' + i,
        fase_titulo: TITULOS_FASES_E3A2[i - 1],
        status: 'pendente_execucao',
        fonte_prompt: 'Skill 13 Prompts V7.2.3-A9 · Prompt ' + i,
        campos: {},
      })
    }
    if (conteudoFases.length !== 13) {
      return {
        ok: false,
        codigo_erro: 'COBERTURA_FASES_INCOMPLETA',
        motivo: 'Esperadas 13 fases, montadas ' + conteudoFases.length,
      }
    }

    // (c) artefatos_financeiros — 4 subobjetos, estrutura vazia (valores = E3-B)
    const artefatosFinanceiros = {
      dre_15_linhas: { total_linhas: cont.linhas_dre, linhas: [] },
      erec_a9: { total_itens: cont.itens_erec, itens: [] },
      gabarito_a8: { itens: [] },
      cs19: { itens: [] },
    }

    const metadadosExecucao = {
      execucao_id: execId,
      dossie_id: dossieId,
      lead_id: normalizado.lead_id || '',
      nivel_profundidade: nivel,
      versao_questionario: ident.versao_questionario || 'V7.2',
      setor: ident.setor || '',
      protocolo: ident.protocolo || '',
      respondente: ident.respondente || '',
      montado_em: new Date().toISOString(),
      modo: 'deterministico_sem_ia',
    }

    const parteA = {
      conteudo_fases: conteudoFases,
      artefatos_financeiros: artefatosFinanceiros,
      metadados_execucao: metadadosExecucao,
      projetos_e_planos: null,
      nao_trafega: {
        dados_sensiveis: false,
        motivo: 'Parte A sem dados sensíveis do cliente (regra E3-A-2 4c)',
      },
    }

    // (b)+(d) Parte B — seis arrays com a contagem do nível derivado
    const areasBsc = ['Financeira', 'Clientes', 'Processos Internos', 'Aprendizado e Crescimento']
    const objetivosEstrategicos = []
    for (let i = 1; i <= cont.objetivos_bsc; i++) {
      objetivosEstrategicos.push({
        objetivo_estrategico_id: idObjetivoE3A2(execId, i),
        perspectiva: areasBsc[(i - 1) % 4],
        sequencia: i,
        titulo: '',
        descricao: '',
        requer_verificacao: false,
        fonte: 'estrutura_deterministica',
      })
    }
    const projetos = []
    for (let i = 1; i <= cont.projetos; i++) {
      const objVinc = objetivosEstrategicos[(i - 1) % objetivosEstrategicos.length]
      projetos.push({
        projeto_id: idProjetoE3A2(execId, i),
        sequencia: i,
        titulo: '',
        objetivo_estrategico_id: objVinc.objetivo_estrategico_id,
        escopo: '',
        riscos: '',
        horizonte_roadmap: 'H1',
        requer_verificacao: false,
        fonte: 'estrutura_deterministica',
      })
    }
    const planosAcao = []
    for (let i = 1; i <= cont.planos_acao; i++) {
      const prjVinc = projetos[(i - 1) % projetos.length]
      planosAcao.push({
        plano_id: idPlanoE3A2(execId, i),
        sequencia: i,
        projeto_id: prjVinc.projeto_id,
        objetivo_estrategico_id: prjVinc.objetivo_estrategico_id,
        titulo: '',
        etapas_5w2h: [],
        requer_verificacao: false,
        fonte: 'estrutura_deterministica',
      })
    }
    // Etapas 5W2H determinísticas (títulos/escopo = Etapa 5 IA; estrutura já aqui)
    for (let p = 0; p < planosAcao.length; p++) {
      const nEtapas = 4
      for (let t = 1; t <= nEtapas; t++) {
        planosAcao[p].etapas_5w2h.push({
          etapa_id: idEtapaE3A2(execId, p + 1, t),
          sequencia: t,
          o_que: '',
          porque: '',
          como: '',
          quem: '',
          quando: '',
          quanto: null,
          requer_verificacao: false,
          fonte: 'estrutura_deterministica',
        })
      }
    }
    const okrs = []
    for (let i = 1; i <= cont.okrs; i++) {
      const prjVinc = projetos[(i - 1) % projetos.length]
      okrs.push({
        okr_id: idOkrE3A2(execId, i),
        sequencia: i,
        projeto_id: prjVinc.projeto_id,
        plano_id: i <= planosAcao.length ? planosAcao[i - 1].plano_id : null,
        objetivo: '',
        resultados_chave: [],
        requer_verificacao: false,
        fonte: 'estrutura_deterministica',
      })
    }
    const matrizHoshin = []
    for (let i = 1; i <= cont.linhas_hoshin; i++) {
      const objVinc = objetivosEstrategicos[(i - 1) % objetivosEstrategicos.length]
      matrizHoshin.push({
        linha_hoshin_id: idHoshinE3A2(execId, i),
        sequencia: i,
        objetivo_estrategico_id: objVinc.objetivo_estrategico_id,
        meta: '',
        plano_id: i <= planosAcao.length ? planosAcao[i - 1].plano_id : null,
        requer_verificacao: false,
        fonte: 'estrutura_deterministica',
      })
    }
    const rituais = []
    const tiposRitual = [
      'Reunião semanal de acompanhamento',
      'Revisão mensal de OKRs',
      'Roda de revisão trimestral',
      'Revisão anual de estratégia',
      'Cadência de epifanias e causa raiz',
      'Ritual de early warning signals',
    ]
    for (let i = 0; i < tiposRitual.length; i++) {
      rituais.push({
        ritual_id: 'rit-' + hashIdE3A2(execId + '|rit|' + (i + 1)),
        sequencia: i + 1,
        tipo: tiposRitual[i],
        periodicidade: ['semanal', 'mensal', 'trimestral', 'anual', 'quinzenal', 'semanal'][i],
        vinculado_a: 'pacote',
        requer_verificacao: false,
        fonte: 'estrutura_deterministica',
      })
    }

    const parteB = {
      objetivos_estrategicos: objetivosEstrategicos,
      projetos: projetos,
      planos_acao: planosAcao,
      okrs: okrs,
      matriz_hoshin: matrizHoshin,
      rituais_desdobramento: rituais,
    }

    // (e) Integridade referencial — FK órfã bloqueia o pacote
    const fkOrfas = []
    const idxObj = {}
    for (let i = 0; i < objetivosEstrategicos.length; i++) {
      idxObj[objetivosEstrategicos[i].objetivo_estrategico_id] = true
    }
    const idxPrj = {}
    for (let i = 0; i < projetos.length; i++) {
      idxPrj[projetos[i].projeto_id] = true
    }
    const idxPln = {}
    for (let i = 0; i < planosAcao.length; i++) {
      idxPln[planosAcao[i].plano_id] = true
    }
    for (let i = 0; i < projetos.length; i++) {
      if (!idxObj[projetos[i].objetivo_estrategico_id]) {
        fkOrfas.push('projetos[' + i + '].objetivo_estrategico_id')
      }
    }
    for (let i = 0; i < planosAcao.length; i++) {
      if (!idxPrj[planosAcao[i].projeto_id]) fkOrfas.push('planos_acao[' + i + '].projeto_id')
      if (!idxObj[planosAcao[i].objetivo_estrategico_id]) {
        fkOrfas.push('planos_acao[' + i + '].objetivo_estrategico_id')
      }
      for (let t = 0; t < planosAcao[i].etapas_5w2h.length; t++) {
        if (!idxPln[planosAcao[i].plano_id]) {
          fkOrfas.push('planos_acao[' + i + '].etapas_5w2h[' + t + ']')
        }
      }
    }
    for (let i = 0; i < okrs.length; i++) {
      if (!idxPrj[okrs[i].projeto_id]) fkOrfas.push('okrs[' + i + '].projeto_id')
      if (okrs[i].plano_id && !idxPln[okrs[i].plano_id]) fkOrfas.push('okrs[' + i + '].plano_id')
    }
    for (let i = 0; i < matrizHoshin.length; i++) {
      if (!idxObj[matrizHoshin[i].objetivo_estrategico_id]) {
        fkOrfas.push('matriz_hoshin[' + i + '].objetivo_estrategico_id')
      }
      if (matrizHoshin[i].plano_id && !idxPln[matrizHoshin[i].plano_id]) {
        fkOrfas.push('matriz_hoshin[' + i + '].plano_id')
      }
    }

    const integridade = {
      fk_orfas: fkOrfas,
      total_fk_orfas: fkOrfas.length,
      teste_integridade_passou: fkOrfas.length === 0,
    }
    if (fkOrfas.length > 0) {
      return {
        ok: false,
        codigo_erro: 'FK_ORFA_BLOQUEIA_PACOTE',
        motivo: 'Integridade referencial reprovada — há FK sem destino no pacote.',
        detalhe: { fk_orfas: fkOrfas },
      }
    }

    const contagens = {
      nivel_profundidade: nivel,
      fases: conteudoFases.length,
      objetivos_estrategicos: objetivosEstrategicos.length,
      projetos: projetos.length,
      planos_acao: planosAcao.length,
      etapas_5w2h: planosAcao.reduce((a, p) => a + p.etapas_5w2h.length, 0),
      okrs: okrs.length,
      linhas_hoshin: matrizHoshin.length,
      rituais_desdobramento: rituais.length,
      itens_erec_previstos: cont.itens_erec,
      linhas_dre_previstas: cont.linhas_dre,
      ews_previstos: cont.ews,
      indicadores_buffett_previstos: cont.indicadores_buffett,
      conselho_consultivo: cont.conselho_consultivo,
      conselho_administracao: cont.conselho_administracao,
      benchmark_setorial: cont.benchmark_setorial,
      valuation: cont.valuation,
    }

    const raiz = {
      schema_versao: '2.0',
      parte: 'A/B',
      execucao_id: execId,
      dossie_id: dossieId,
      nivel_profundidade: nivel,
      tipo_pacote: 'completo',
      origem_pacote: 'automatico',
    }

    return {
      ok: true,
      pacote: {
        raiz: raiz,
        parte_a: parteA,
        parte_b: parteB,
        contagens: contagens,
        integridade: integridade,
      },
    }
  } catch (errMont) {
    return {
      ok: false,
      codigo_erro: 'MONTAGEM_EXCECAO',
      motivo: 'Exceção na montagem determinística: ' + errMont.message,
    }
  }
}

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

// --------------------- E3-A-2 · Etapa 4: MONTAGEM DETERMINÍSTICA (sem IA) ---------------------
// Contagens por nível (Tabela do Comando 0 V2.2). Profundo = linha da Aurora
// Trading (deriva de "CaaS"/"Bespoke"); Essencial e Completo conforme tabela.
function contagensPorNivel(nivel) {
  const n = String(nivel || '')
  if (n.indexOf('Bespoke') !== -1) {
    // Linha Profundo — produção da Aurora Trading
    return {
      rotulo_linha: 'Profundo',
      objetivos_estrategicos: 14,
      projetos: 6,
      planos_acao: 12,
      okrs: 7,
      itens_erec: 20,
      linhas_hoshin: 7,
      early_warning_signals: 8,
      indicadores_buffett: 8,
      linhas_dre: 15,
      objetivos_bsc: 14,
      conselho_consultivo: true,
      conselho_administracao: true,
      benchmark_setorial: true,
      valuation: true,
    }
  }
  if (n.indexOf('MaaS') !== -1 || n.indexOf('Híbrido') !== -1) {
    // Linha Completo
    return {
      rotulo_linha: 'Completo',
      objetivos_estrategicos: 8,
      projetos: 4,
      planos_acao: 8,
      okrs: 7,
      itens_erec: 12,
      linhas_hoshin: 4,
      early_warning_signals: 5,
      indicadores_buffett: 8,
      linhas_dre: 15,
      objetivos_bsc: 8,
      conselho_consultivo: true,
      conselho_administracao: false,
      benchmark_setorial: true,
      valuation: true,
    }
  }
  // Linha Essencial (SaaS Puro)
  return {
    rotulo_linha: 'Essencial',
    objetivos_estrategicos: 4,
    projetos: 3,
    planos_acao: 3,
    okrs: 4,
    itens_erec: 8,
    linhas_hoshin: 2,
    early_warning_signals: 2,
    indicadores_buffett: 4,
    linhas_dre: 15,
    objetivos_bsc: 4,
    conselho_consultivo: false,
    conselho_administracao: false,
    benchmark_setorial: false,
    valuation: false,
  }
}

// Etiquetas canônicas das 13 fases (P1..P13) — espelham a Skill 13 Prompts V7.2.3-A9
function titulosFasesV72() {
  return [
    'Carga de Dados — Dossiê Normalizado',
    'Fase 1 — Diagnóstico Profundo (Causa Raiz e Canvas As Is)',
    'Bloco CTA — Devolutiva de 45 Min',
    'Bloco Solução Executivo (pós-conversão)',
    'Fase 2 — Foresight Estratégico',
    'Fase 3 — Estratégia e Diferenciação (EREC A9 + BSC)',
    'Fase 4 — Capacidade e Design Organizacional',
    'Fase 5 — Execução e Roadmap',
    'Fase 6 — Validação Financeira e Alocação',
    'Fase 7 — Governança e Liderança',
    'Fase 8 — Inovação e Tecnologia (Moat)',
    'Consolidação do Bloco Solução Completo',
    'Auditoria de Aderência ao Protocolo (A8)',
  ]
}

// IDs determinísticos — mesma entrada => mesmos IDs (aleatoriedade vedada)
function idDeterministico(partes) {
  const base = partes
    .filter(function (p) {
      return p !== null && p !== undefined && String(p).length > 0
    })
    .join('::')
  const s = String(base)
  // FNV-1a (32 bits) em JS puro — determinístico e estável entre execuções
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return 'id' + h.toString(16).padStart(8, '0') + '_' + s.length.toString(16)
}

// --------------------- Etapa 4 (a): 13 conteudo_fases ---------------------
function montarConteudoFases(execucaoId) {
  const titulos = titulosFasesV72()
  const fases = []
  for (let i = 1; i <= 13; i++) {
    fases.push({
      fase_id: 'P' + i,
      fase_titulo: titulos[i - 1],
      status: 'estrutura_criada',
      fonte_prompt: 'Skill 13 Prompts V7.2.3-A9 — Prompt P' + i + ' (agente jbp-gestao-master)',
      campos: {},
    })
  }
  return fases
}

// --------------------- Etapa 4 (c): Parte A ---------------------
function montarParteA(nivel, c, execucaoId, normalizado) {
  const titulos = titulosFasesV72()
  const conteudoFases = []
  for (let i = 1; i <= 13; i++) {
    conteudoFases.push({
      fase_id: 'P' + i,
      fase_titulo: titulos[i - 1],
      status: 'estrutura_criada',
      fonte_prompt: 'Skill 13 Prompts V7.2.3-A9 — Prompt P' + i + ' (agente jbp-gestao-master)',
      campos: {},
    })
  }
  return {
    conteudo_fases: conteudoFases,
    artefatos_financeiros: {
      dre_15_linhas: { preenchido: false, total_linhas: c.linhas_dre, valores: null },
      erec_a9: { preenchido: false, total_itens: c.itens_erec, itens: null },
      gabarito_a8: { preenchido: false, total_itens: 13, itens: null },
      cs19: { preenchido: false, itens: null },
    },
    metadados_execucao: {
      execucao_id: execucaoId,
      nivel_profundidade: nivel,
      linha_tabela_comando0: c.rotulo_linha,
      origem_pacote: 'automatico',
      versao_questionario: normalizado.identificacao.versao_questionario || 'V7.2',
      montado_em: new Date().toISOString(),
      ia_executada: false,
    },
    nao_trafega: { preenchido: false, motivo: 'reservado E3-B' },
    projetos_e_planos: null,
  }
}

// --------------------- Etapa 4 (b)+(d): Parte B (6 arrays com FKs) ---------------------
function montarParteB(c, execucaoId, nivel, identificacao) {
  const avisosEstrutura = []
  const ctx = (execucaoId + '|' + nivel + '|' + (identificacao.id_dossie || '')).substring(0, 40)

  // (1) objetivos_estrategicos — c.objetivos_estrategicos itens, BSC 4 perspectivas
  const objetivos = []
  const perspectivasBsc = [
    'Financeira',
    'Clientes',
    'Processos Internos',
    'Aprendizado e Crescimento',
  ]
  for (let i = 1; i <= c.objetivos_estrategicos; i++) {
    const persp = perspectivasBsc[(i - 1) % 4]
    objetivos.push({
      objetivo_estrategico_id: idDeterministico([ctx, 'oe', i]),
      ordem: i,
      perspectiva_bsc: persp,
      descricao: '[IA Etapa 5] Objetivo estratégico ' + i + ' — perspetiva ' + persp,
      requer_verificacao: true,
    })
  }

  // (2) projetos — cada projeto ancora em um objetivo estratégico (FK obrigatória)
  const projetos = []
  for (let i = 1; i <= c.projetos; i++) {
    const oeIdx =
      Math.min(objetivos.length, Math.max(1, Math.ceil((i * objetivos.length) / c.projetos))) - 1
    projetos.push({
      projeto_id: idDeterministico([ctx, 'prj', i]),
      ordem: i,
      objetivo_estrategico_id: objetivos[oeIdx].objetivo_estrategico_id,
      titulo: '[IA Etapa 5] Projeto ' + i,
      status: 'estrutura_criada',
      horizonte_hoshin: i <= Math.ceil(c.projetos / 2) ? 'curto_prazo' : 'medio_prazo',
    })
  }

  // (3) planos_acao — 5W2H (etapas preenchidas por IA na Etapa 5)
  const planos = []
  for (let i = 1; i <= c.planos_acao; i++) {
    const pIdx =
      Math.min(projetos.length, Math.max(1, Math.ceil((i * projetos.length) / c.planos_acao))) - 1
    const etapas = []
    const numEtapas = 3 + (i % 3) // 3 a 5 etapas por plano
    for (let j = 1; j <= numEtapas; j++) {
      etapas.push({
        etapa_id: idDeterministico([ctx, 'plano', i, 'etapa', j]),
        ordem: j,
        what: null,
        why: null,
        who: null,
        when: null,
        where: null,
        how: null,
        how_much: null,
        status: 'pendente_ia',
      })
    }
    planos.push({
      plano_id: idDeterministico([ctx, 'plano', i]),
      ordem: i,
      projeto_id: projetos[pIdx].projeto_id,
      objetivo_estrategico_id: projetos[pIdx].objetivo_estrategico_id,
      titulo: '[IA Etapa 5] Plano de ação ' + i,
      metodologia: '5W2H',
      etapas: etapas,
    })
  }

  // (4) okrs — ancorados em projeto e plano (ambos preenchidos)
  const okrs = []
  for (let i = 1; i <= c.okrs; i++) {
    const pIdx = (i - 1) % projetos.length
    const plIdx = (i - 1) % planos.length
    okrs.push({
      okr_id: idDeterministico([ctx, 'okr', i]),
      ordem: i,
      projeto_id: projetos[pIdx].projeto_id,
      plano_id: planos[plIdx].plano_id,
      perspectiva_bsc: perspectivasBsc[(i - 1) % 4],
      objetivo: null,
      krs: [],
    })
  }

  // (5) matriz_hoshin — objetivos_estrategico_id obrigatório
  const hoshin = []
  for (let i = 1; i <= c.linhas_hoshin; i++) {
    const oeIdx =
      Math.min(objetivos.length, Math.max(1, Math.ceil((i * objetivos.length) / c.linhas_hoshin))) -
      1
    hoshin.push({
      linha_id: idDeterministico([ctx, 'hoshin', i]),
      ordem: i,
      objetivo_estrategico_id: objetivos[oeIdx].objetivo_estrategico_id,
      projeto_vinculado_id: projetos[(i - 1) % projetos.length].projeto_id,
      objetivo: null,
      meta: null,
      indicador: null,
    })
  }

  // (6) rituais_desdobramento — caiam do Hoshin, sem FK obrigatória além do nível raiz
  const rituais = []
  const cadencias = ['daily', 'weekly', 'monthly', 'quarterly']
  const nRituais = Math.max(4, Math.min(12, c.planos_acao + 2))
  for (let i = 1; i <= nRituais; i++) {
    const plIdx = (i - 1) % planos.length
    rituais.push({
      ritual_id: idDeterministico([ctx, 'ritual', i]),
      ordem: i,
      plano_id: planos[plIdx].plano_id,
      cadencia: cadencias[(i - 1) % cadencias.length],
      participantes: null,
      pauta: null,
    })
  }

  const parteB = {
    objetivos_estrategicos: objetivos,
    projetos: projetos,
    planos_acao: planos,
    okrs: okrs,
    matriz_hoshin: hoshin,
    rituais_desdobramento: rituais,
  }

  // (e) Integridade referencial — toda FK resolve dentro do próprio pacote.
  const fkOrfas = []
  const idxObjetivos = {}
  for (let i = 0; i < objetivos.length; i++)
    idxObjetivos[objetivos[i].objetivo_estrategico_id] = true
  const idxProjetos = {}
  for (let i = 0; i < projetos.length; i++) idxProjetos[projetos[i].projeto_id] = true
  const idxPlanos = {}
  for (let i = 0; i < planos.length; i++) idxPlanos[planos[i].plano_id] = true

  for (let i = 0; i < projetos.length; i++) {
    if (!idxObjetivos[projetos[i].objetivo_estrategico_id]) {
      fkOrfas.push(
        'projetos[' + i + '].objetivo_estrategico_id=' + projetos[i].objetivo_estrategico_id,
      )
    }
  }
  for (let i = 0; i < planos.length; i++) {
    if (!idxProjetos[planos[i].projeto_id]) {
      fkOrfas.push('planos_acao[' + i + '].projeto_id=' + planos[i].projeto_id)
    }
    if (!idxObjetivos[planos[i].objetivo_estrategico_id]) {
      fkOrfas.push(
        'planos_acao[' + i + '].objetivo_estrategico_id=' + planos[i].objetivo_estrategico_id,
      )
    }
    for (let j = 0; j < planos[i].etapas.length; j++) {
      if (!planos[i].etapas[j].etapa_id.startsWith('id')) {
        fkOrfas.push('planos_acao[' + i + '].etapas[' + j + '].etapa_id')
      }
    }
  }
  for (let i = 0; i < okrs.length; i++) {
    if (okrs[i].projeto_id && !idxProjetos[okrs[i].projeto_id]) {
      fkOrfas.push('okrs[' + i + '].projeto_id=' + okrs[i].projeto_id)
    }
    if (okrs[i].plano_id && !idxPlanos[okrs[i].plano_id]) {
      fkOrfas.push('okrs[' + i + '].plano_id=' + okrs[i].plano_id)
    }
  }
  for (let i = 0; i < hoshin.length; i++) {
    if (!idxObjetivos[hoshin[i].objetivo_estrategico_id]) {
      fkOrfas.push(
        'matriz_hoshin[' + i + '].objetivo_estrategico_id=' + hoshin[i].objetivo_estrategico_id,
      )
    }
    if (hoshin[i].projeto_vinculado_id && !idxProjetos[hoshin[i].projeto_vinculado_id]) {
      fkOrfas.push(
        'matriz_hoshin[' + i + '].projeto_vinculado_id=' + hoshin[i].projeto_vinculado_id,
      )
    }
  }
  for (let i = 0; i < rituais.length; i++) {
    if (!idxPlanos[rituais[i].plano_id]) {
      fkOrfas.push('rituais_desdobramento[' + i + '].plano_id=' + rituais[i].plano_id)
    }
  }

  return { parte_b: parteB, fk_orfas: fkOrfas, avisos_estrutura: avisosEstrutura }
}

// --------------------- E3-A-2 · Etapa 5: suporte de contexto (5 Slots) ---------------------
// Carrega os 5 Slots de contexto do agente jbp-gestao-master (Seção 11 do System
// Prompt V7.2 A5–A10). Chamada de IA sem os 5 Slots não é chamada desta rodada.
function carregarSlotsContextoE3A2(leadRec) {
  const slots = {
    slot_1_contexto_estrategico_global: null,
    slot_2_master_framework: null,
    slot_3_biblioteca_profissional: null,
    slot_4_historico_profissional: null,
    slot_5_demonstrativos_cliente: null,
    origem: [],
  }
  // Slot 1 + 4: System Prompt integral do agente nativo (agentes_versoes, última versão)
  try {
    const recsAg = $app.findRecordsByFilter(
      'agentes_versoes',
      "slug_agente='jbp-gestao-master'",
      '-created',
      1,
      0,
    )
    if (recsAg && recsAg.length > 0) {
      const sp = String(recsAg[0].get('system_prompt') || '')
      slots.slot_4_historico_profissional = sp.substring(0, 6000)
      slots.slot_1_contexto_estrategico_global = sp.substring(6000, 12000)
      slots.origem.push('agentes_versoes')
    }
  } catch (errAg) {
    slots.origem.push('agentes_versoes:indisponivel')
  }
  // Slot 2: Master Framework V2.4 (frameworks — áreas 1 a 8)
  try {
    const recsFr = $app.findRecordsByFilter('frameworks', '', 'area_numero', 8, 0)
    const digFr = []
    for (let i = 0; i < recsFr.length; i++) {
      digFr.push(
        'Área ' +
          recsFr[i].get('area_numero') +
          ' — ' +
          recsFr[i].get('titulo') +
          ': ' +
          String(recsFr[i].get('conteudo') || '').substring(0, 400),
      )
    }
    slots.slot_2_master_framework = digFr.join('\n')
    slots.origem.push('frameworks(' + recsFr.length + ')')
  } catch (_) {
    slots.origem.push('frameworks:indisponivel')
  }
  // Slot 3: Biblioteca Profissional V2.4 (livros)
  try {
    const recsLv = $app.findRecordsByFilter('livros', '', '-created', 20, 0)
    const digLv = []
    for (let i = 0; i < recsLv.length; i++) {
      digLv.push(recsLv[i].get('titulo') + ' — ' + recsLv[i].get('autor'))
    }
    slots.slot_3_biblioteca_profissional = digLv.join('; ')
    slots.origem.push('livros(' + recsLv.length + ')')
  } catch (_) {
    slots.origem.push('livros:indisponivel')
  }
  // Slot 5: Demonstrativos do cliente (anexos do lead — slot rotativo)
  try {
    const digAn = []
    if (leadRec) {
      const camposAnexo = ['documentacao_adicional', 'certificacoes', 'contrato_social']
      for (let i = 0; i < camposAnexo.length; i++) {
        const v = leadRec.get(camposAnexo[i])
        if (v && (typeof v !== 'string' || v.trim())) {
          digAn.push(camposAnexo[i] + '=' + JSON.stringify(v).substring(0, 600))
        }
      }
    }
    slots.slot_5_demonstrativos_cliente = digAn.length > 0 ? digAn.join(' | ') : null
    slots.origem.push('anexos_lead(' + digAn.length + ')')
  } catch (_) {
    slots.origem.push('anexos_lead:indisponivel')
  }
  return slots
}

// Contexto compacto injetado em CADA chamada de IA (5 Slots + estrutura do pacote
// + amostra das respostas do questionário — sem dado sensível além do necessário).
function construirContextoCompactoE3A2(normalizado, pacote, slots) {
  const partes = []
  const identC = normalizado.identificacao || {}
  partes.push(
    'CONTEXTO COMPACTO — ' +
      (identC.razao_social || 'empresa não informada') +
      ' | setor: ' +
      (identC.setor || 'não informado') +
      ' | segmento: ' +
      (identC.segmento || '—') +
      ' | nível: ' +
      (pacote && pacote.raiz ? pacote.raiz.nivel_profundidade : '') +
      ' | protocolo: ' +
      (identC.protocolo || '—'),
  )
  if (pacote && pacote.contagens) {
    partes.push(
      'Estrutura determinística do pacote (não alterar contagens): ' +
        pacote.contagens.projetos +
        ' projetos, ' +
        pacote.contagens.planos_acao +
        ' planos de ação, ' +
        pacote.contagens.okrs +
        ' OKRs, ' +
        pacote.contagens.objetivos_estrategicos +
        ' objetivos BSC, ' +
        pacote.contagens.linhas_hoshin +
        ' linhas Hoshin, ' +
        pacote.contagens.itens_erec_previstos +
        ' itens EREC, ' +
        pacote.contagens.linhas_dre_previstas +
        ' linhas DRE.',
    )
  }
  const secoesC = normalizado.secoes || []
  for (let i = 0; i < secoesC.length && i < 9; i++) {
    const s = secoesC[i]
    const perg = (s && s.perguntas) || {}
    const chaves = Object.keys(perg).slice(0, 3)
    const digSe = chaves
      .map(function (k) {
        return k + ': ' + JSON.stringify(perg[k]).substring(0, 160)
      })
      .join(' | ')
    partes.push('Seção ' + s.nome + ' (' + s.total_perguntas + ' respostas): ' + (digSe || 'vazia'))
  }
  if (slots) {
    const rotulos = [
      ['slot_1_contexto_estrategico_global', 'Slot 1 — Contexto Estratégico Global V7.2'],
      ['slot_2_master_framework', 'Slot 2 — Master Framework V2.4'],
      ['slot_3_biblioteca_profissional', 'Slot 3 — Biblioteca Profissional V2.4'],
      ['slot_4_historico_profissional', 'Slot 4 — Histórico Profissional JBP'],
      ['slot_5_demonstrativos_cliente', 'Slot 5 — Demonstrativos do cliente'],
    ]
    for (let i = 0; i < rotulos.length; i++) {
      const v = slots[rotulos[i][0]]
      if (v) {
        partes.push(rotulos[i][1] + ': ' + String(v).substring(0, 800))
      }
    }
  }
  return partes.join('\n\n').substring(0, 12000)
}

// --------------------- E3-A-2 · Etapa 4 + 5: execução da montagem ---------------------
// Núcleo compartilhado pelo POST /dossie/montar-pacote (contrato Etapa 4/5) e pela
// rota GET de exercício runtime (Adendo 1 — sem POST disponível ao agente).
// Retorna { status, payload } — conversão para e.json fica nas rotas.
function executarMontagemPacoteE3A2(leadId) {
  const T0 = Date.now()

  // Normalização da Etapa 3 — MESMA lógica do POST /dossie/normalizar, reescrita
  // aqui inline: o JSVM executa cada callback em VM própria, funções de um
  // routerAdd não são visíveis em outro (padrão E2-A).
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

  function recStrE3(nome) {
    try {
      const v = leadRec.get(nome)
      return v === undefined || v === null || typeof v === 'object' ? '' : String(v)
    } catch (_) {
      return ''
    }
  }
  function recObjE3(nome) {
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
  function derivarNivelE3(valor, origem) {
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

  const fc = recObjE3('dados_completos')
  if (!fc || typeof fc !== 'object' || Array.isArray(fc)) {
    return e.json(422, {
      ok: false,
      codigo_erro: 'FORMATO1_AUSENTE',
      motivo: 'dados_completos ausente ou inválido (não é objeto).',
    })
  }
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

  // Nível — precedência idêntica ao POST /dossie/normalizar (CS-63)
  let nivelInfo = null
  const nivelAssinaturaLeadE3 = recStrE3('nivel_assinatura')
  if (nivelAssinaturaLeadE3) {
    nivelInfo = derivarNivelE3(nivelAssinaturaLeadE3, 'leads.nivel_assinatura')
  }
  if (!nivelInfo || nivelInfo.fallback) {
    const fmtLead = recStrE3('formato_interesse')
    if (fmtLead) {
      const candidata = derivarNivelE3(fmtLead, 'leads.formato_interesse')
      if (!candidata.fallback) nivelInfo = candidata
    }
  }
  if (!nivelInfo || nivelInfo.fallback) {
    const fmtCli = fcCliente.formato_interesse || fcCliente.formatoContratado || ''
    if (fmtCli) {
      const candidata = derivarNivelE3(fmtCli, 'dados_completos.cliente.formato_interesse')
      if (!candidata.fallback) nivelInfo = candidata
    }
  }
  if (!nivelInfo || nivelInfo.fallback) {
    const fmtMeta = fcMeta.formato_interesse || fcMeta.formato_interesse_lead || ''
    if (fmtMeta) {
      const candidata = derivarNivelE3(fmtMeta, 'dados_completos.metadados.formato_interesse')
      if (!candidata.fallback) nivelInfo = candidata
    }
  }
  if (!nivelInfo || nivelInfo.fallback) {
    const fmtDoss = fcDossie.formato_interesse || ''
    if (fmtDoss) {
      const candidata = derivarNivelE3(fmtDoss, 'dados_completos.dossie.formato_interesse')
      if (!candidata.fallback) nivelInfo = candidata
    }
  }
  if (!nivelInfo || nivelInfo.fallback) {
    nivelInfo = {
      nivel: 'SaaS Puro',
      origem: 'nenhum_campo_informado',
      fallback: true,
      valor_bruto: '',
    }
  }

  // Seções (mesma canonicalização case-insensitive do POST /dossie/normalizar)
  const NOMES_CANONICOS_E3 = [
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
  const secoesNormalizadasE3 = []
  const chavesSecoesE3 = Object.keys(fcSecoes || {})
  for (let i = 0; i < chavesSecoesE3.length; i++) {
    const chave = chavesSecoesE3[i]
    const conteudo = fcSecoes[chave]
    const chaveNorm = String(chave).trim().toLowerCase()
    let nomeCanonico = chaveNorm
    for (let j = 0; j < NOMES_CANONICOS_E3.length; j++) {
      if (chaveNorm.indexOf(NOMES_CANONICOS_E3[j]) !== -1) {
        nomeCanonico = NOMES_CANONICOS_E3[j]
        break
      }
    }
    let perguntas = null
    if (conteudo && typeof conteudo === 'object' && !Array.isArray(conteudo)) {
      if (conteudo.perguntas && typeof conteudo.perguntas === 'object') {
        perguntas = conteudo.perguntas
      } else if (conteudo.respostas && typeof conteudo.respostas === 'object') {
        perguntas = conteudo.respostas
      } else {
        perguntas = conteudo
      }
    } else if (Array.isArray(conteudo)) {
      perguntas = { _itens: conteudo }
    } else {
      perguntas = { _valor: conteudo }
    }
    secoesNormalizadasE3.push({
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
  if (secoesNormalizadasE3.length === 0) {
    return {
      status: 422,
      payload: {
        ok: false,
        codigo_erro: 'FORMATO1_SECOES_VAZIAS',
        motivo: 'FORMATO 1 inválido — secoes presente mas sem nenhuma seção. Nada foi processado.',
      },
    }
  }

  const normalizado = {
    ok: true,
    lead_id: leadRec.getString('id'),
    identificacao: {
      id_dossie: fcDossie.id || fcDossie.dossie_id || fcMeta.dossie_id || recStrE3('site_lead_id'),
      protocolo: fcDossie.protocolo || fcMeta.protocolo || recStrE3('protocolo'),
      razao_social: fcCliente.razao_social || fcCliente.empresa || recStrE3('razao_social'),
      cnpj: fcCliente.cnpj || recStrE3('cnpj'),
      respondente:
        fcCliente.respondente ||
        fcCliente.nome_completo ||
        fcCliente.nome ||
        recStrE3('nome_completo') ||
        recStrE3('responsavel_envio'),
      cargo: fcCliente.cargo || recStrE3('cargo'),
      email: fcCliente.email || fcCliente.email_corporativo || recStrE3('email'),
      whatsapp: fcCliente.whatsapp || fcCliente.telefone || recStrE3('whatsapp'),
      setor: fcCliente.setor || recStrE3('setor'),
      segmento: fcCliente.segmento || recStrE3('segmento'),
      versao_questionario:
        fcCliente.versao_questionario ||
        fcMeta.versao_questionario ||
        recStrE3('versao_questionario') ||
        'V7.2',
    },
    nivel: nivelInfo,
    secoes: secoesNormalizadasE3,
    total_secoes: secoesNormalizadasE3.length,
    dados_completos: fc,
    avisos: [],
  }

  const nivel = normalizado.nivel.nivel
  const respMontagem = montarPacoteV2E3A2(normalizado)
  if (!respMontagem.ok) {
    return {
      status: 422,
      payload: {
        ok: false,
        codigo_erro: respMontagem.codigo_erro,
        motivo: respMontagem.motivo,
        detalhe: respMontagem.detalhe || null,
      },
    }
  }
  const pacote = respMontagem.pacote
  const nivelE = pacote.raiz.nivel_profundidade

  // (E3-A-2 · Etapa 5) Referência de preço oficial do nível Bespoke P3 (BRL),
  // usada apenas na declaração de custo do bloco IA — sem alterar estrutura.
  const custoBRLBespokeP3 = 15750

  // Log da montagem — evidência de estrutura e contagens sem abrir o código.
  console.log(
    '[E3-A-2][ETAPA4] pacote montado lead=' +
      leadId +
      ' nivel=' +
      nivelE +
      ' execucao=' +
      pacote.raiz.execucao_id +
      ' fases=' +
      pacote.parte_a.conteudo_fases.length +
      ' objetivos=' +
      pacote.parte_b.objetivos_estrategicos.length +
      ' projetos=' +
      pacote.parte_b.projetos.length +
      ' planos=' +
      pacote.parte_b.planos_acao.length +
      ' okrs=' +
      pacote.parte_b.okrs.length +
      ' hoshin=' +
      pacote.parte_b.matriz_hoshin.length +
      ' rituais=' +
      pacote.parte_b.rituais_desdobramento.length +
      ' fk_orfas=' +
      pacote.integridade.fk_orfas.length +
      ' duracao_ms=' +
      (Date.now() - T0),
  )

  // --------------------- E3-A-2 · Etapa 5: IA interpretativa ---------------------
  // Preenche SOMENTE campos interpretativos já existentes no esqueleto (Etapa 4).
  // NÃO cria estrutura, NÃO muda contagens, NÃO recalcula financeiros, NÃO inventa
  // dado (ausência de dado => requer_verificacao). Agente nativo jbp-gestao-master
  // via gateway, tier reasoning (System Prompt A5–A10, migração 0065/0066).
  // D12: voz direta e assertiva, sem adjetivação, sem citação acadêmica.
  const slotsContexto = carregarSlotsContextoE3A2(leadRec)
  const contextoCompacto = construirContextoCompactoE3A2(normalizado, pacote, slotsContexto)
  const custoIa = { chamadas: 0, tokens_prompt: 0, tokens_resposta: 0, custo_usd: 0 }

  function registrarCustoIa(resp) {
    custoIa.chamadas += 1
    if (resp && resp.usage) {
      custoIa.tokens_prompt += resp.usage.prompt_tokens || 0
      custoIa.tokens_resposta += resp.usage.completion_tokens || 0
      custoIa.custo_usd +=
        (resp.usage.prompt_tokens || 0) * 0.0000001 +
        (resp.usage.completion_tokens || 0) * 0.0000004
    }
  }

  function chatIaE3A2(rotulo, pergunta) {
    try {
      if (typeof $ai !== 'undefined' && $ai.agent) {
        // Os 5 Slots viajam em TODA chamada (comando E3-A-2, Etapa 5 — contexto).
        const msg = (contextoCompacto ? contextoCompacto + '\n\n---\n\n' : '') + pergunta
        const resp = $ai.agent('jbp-gestao-master').chat({ message: msg })
        registrarCustoIa(resp)
        const texto = (resp && resp.content) || ''
        if (texto && texto.trim()) return texto.trim()
      }
      return null
    } catch (errIa) {
      console.log('[E3-A-2][ETAPA5] falha IA (' + rotulo + '): ' + (errIa && errIa.message))
      return null
    }
  }

  function limparTextoIa(txt) {
    let t = String(txt || '')
    t = t.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '')
    t = t.replace(/\*\*/g, '')
    t = t.replace(/^#+\s*/gm, '')
    return t.trim()
  }

  function jsonDeTextoIa(txt) {
    if (!txt) return null
    const ini = txt.indexOf('{')
    const fim = txt.lastIndexOf('}')
    if (ini === -1 || fim === -1 || fim <= ini) return null
    try {
      return JSON.parse(txt.substring(ini, fim + 1))
    } catch (_) {
      return null
    }
  }

  // Tarefa 1 — F1: causa raiz + micro-epifanias (contexto = respostas estratégicas)
  const secaoEstrategia = (normalizado.secoes || []).filter(function (s) {
    return s.nome === 'estrategia'
  })[0]
  const respostasEstrategia = secaoEstrategia ? secaoEstrategia.perguntas || {} : {}
  const perguntasChave = Object.keys(respostasEstrategia)
    .slice(0, 12)
    .map(function (k) {
      return k + ': ' + JSON.stringify(respostasEstrategia[k])
    })
    .join('\n')
  let f1CausaRaiz = null
  let f1MicroEpifanias = null
  const respF1 = chatIaE3A2(
    'F1',
    'Diagnóstico da empresa ' +
      (normalizado.identificacao.razao_social || '') +
      ' (setor: ' +
      (normalizado.identificacao.setor || '') +
      '). Nível: ' +
      nivelE +
      '.\n' +
      'Respostas da seção Estratégia:\n' +
      (perguntasChave || '(seção vazia)') +
      '\n\n' +
      'Produza a causa raiz e três micro-epifanias desta empresa, no padrão do Contexto Estratégico Global V7.2:\n' +
      '1. CAUSA RAIZ — parágrafo único (3 a 5 linhas), voz direta e assertiva, sem adjetivação, sem citação acadêmica ou teórica; fundamentação por Área e Subtema com no máximo um conceito em uma frase.\n' +
      '2. MICRO-EPIFANIAS — 3 itens, cada um uma frase de insight aplicável a esta empresa.\n' +
      'Responda em JSON: {"causa_raiz": "...", "micro_epifanias": ["...","...","..."]}',
  )
  if (respF1) {
    const jF1 = jsonDeTextoIa(limparTextoIa(respF1))
    if (jF1 && jF1.causa_raiz) {
      f1CausaRaiz = String(jF1.causa_raiz).substring(0, 4000)
      if (Array.isArray(jF1.micro_epifanias)) {
        f1MicroEpifanias = jF1.micro_epifanias
          .map(function (x) {
            return String(x).substring(0, 800)
          })
          .slice(0, 5)
      }
    } else {
      f1CausaRaiz = limparTextoIa(respF1).substring(0, 4000)
    }
  }
  const blocosIa = {
    f1_causa_raiz: f1CausaRaiz
      ? { preenchido: true, causa_raiz: f1CausaRaiz, micro_epifanias: f1MicroEpifanias }
      : {
          preenchido: false,
          requer_verificacao: true,
          motivo: 'IA indisponível — campo pendente, sem inferência.',
        },
  }

  // Tarefa 2 — Bloco CTA: leitura executiva + ponto de atenção
  const respCTA = chatIaE3A2(
    'Bloco CTA',
    'Diagnóstico da empresa ' +
      (normalizado.identificacao.razao_social || '') +
      ' (setor: ' +
      (normalizado.identificacao.setor || '') +
      '), nível ' +
      nivelE +
      '. Estrutura do pacote: ' +
      pacote.contagens.projetos +
      ' projetos, ' +
      pacote.contagens.planos_acao +
      ' planos de ação, ' +
      pacote.contagens.okrs +
      ' OKRs, ' +
      pacote.contagens.objetivos_estrategicos +
      ' objetivos BSC, ' +
      pacote.contagens.linhas_hoshin +
      ' linhas Hoshin.\n\n' +
      'Produza o BLOCO CTA da devolutiva de 45 minutos:\n' +
      '1. LEITURA EXECUTIVA — 2 parágrafos curtos, voz direta e assertiva, sem adjetivação, sem citação acadêmica, apontando onde a estratégia da empresa trava hoje.\n' +
      '2. PONTO DE ATENÇÃO — 1 parágrafo curto com o risco mais concreto para os próximos 90 dias.\n' +
      'Responda em JSON: {"leitura_executiva": "...", "ponto_de_atencao": "..."}',
  )
  let ctaLeitura = null
  let ctaPonto = null
  if (respCTA) {
    const jCTA = jsonDeTextoIa(limparTextoIa(respCTA))
    if (jCTA && jCTA.leitura_executiva) {
      ctaLeitura = String(jCTA.leitura_executiva).substring(0, 5000)
      if (jCTA.ponto_de_atencao) ctaPonto = String(jCTA.ponto_de_atencao).substring(0, 5000)
    } else {
      ctaLeitura = limparTextoIa(respCTA).substring(0, 5000)
    }
  }
  blocosIa.bloco_cta = ctaLeitura
    ? { preenchido: true, leitura_executiva: ctaLeitura, ponto_de_atencao: ctaPonto }
    : {
        preenchido: false,
        requer_verificacao: true,
        motivo: 'IA indisponível — campo pendente, sem inferência.',
      }

  // Tarefa 3 — Estratégia (P4): tese, fundamentos, Curva de Valor, Canvas To-Be,
  // As-Is + títulos BSC (preenche os N títulos de objetivos já criados na Etapa 4)
  const respEstr = chatIaE3A2(
    'Estratégia',
    'Empresa ' +
      (normalizado.identificacao.razao_social || '') +
      ' (setor: ' +
      (normalizado.identificacao.setor || '') +
      '), nível ' +
      nivelE +
      '.\n\n' +
      'Produza, voz direta e assertiva, sem adjetivação, sem citação acadêmica:\n' +
      '1. TESE ESTRATÉGICA — 1 parágrafo (3 a 4 linhas).\n' +
      '2. FUNDAMENTOS — 3 itens de uma frase cada.\n' +
      '3. CURVA DE VALOR — 1 parágrafo curto: fatores a elevar, reduzir e eliminar.\n' +
      '4. CANVAS TO-BE — 1 parágrafo curto do modelo de negócio desejado.\n' +
      '5. AS-IS — 1 parágrafo curto do modelo de negócio atual.\n' +
      '6. TITULOS_BSC — exatamente ' +
      pacote.contagens.objetivos_estrategicos +
      ' títulos curtos (3 a 7 palavras) de objetivos estratégicos, um por linha, sem numeração.\n' +
      'Responda em JSON: {"tese_estrategica":"...","fundamentos":["..."],"curva_de_valor":"...","canvas_to_be":"...","as_is":"...","titulos_bsc":["..."]}',
  )
  let estr = null
  if (respEstr) {
    const jEstr = jsonDeTextoIa(limparTextoIa(respEstr))
    if (jEstr && jEstr.tese_estrategica) {
      estr = {
        tese_estrategica: String(jEstr.tese_estrategica).substring(0, 4000),
        fundamentos: Array.isArray(jEstr.fundamentos)
          ? jEstr.fundamentos
              .map(function (x) {
                return String(x).substring(0, 500)
              })
              .slice(0, 6)
          : null,
        curva_de_valor: jEstr.curva_de_valor
          ? String(jEstr.curva_de_valor).substring(0, 4000)
          : null,
        canvas_to_be: jEstr.canvas_to_be ? String(jEstr.canvas_to_be).substring(0, 4000) : null,
        as_is: jEstr.as_is ? String(jEstr.as_is).substring(0, 4000) : null,
      }
    }
    if (jEstr && Array.isArray(jEstr.titulos_bsc) && jEstr.titulos_bsc.length > 0) {
      const tit = jEstr.titulos_bsc
      for (let i = 0; i < pacote.parte_b.objetivos_estrategicos.length; i++) {
        const o = pacote.parte_b.objetivos_estrategicos[i]
        if (i < tit.length && String(tit[i]).trim()) {
          o.titulo = String(tit[i]).substring(0, 200)
        } else {
          o.titulo = 'Requer verificação: título BSC ' + (i + 1)
          o.requer_verificacao = true
        }
      }
    }
  }
  blocosIa.estrategia = estr
    ? { preenchido: true, conteudo: estr }
    : {
        preenchido: false,
        requer_verificacao: true,
        motivo: 'IA indisponível — campo pendente, sem inferência.',
      }

  // Tarefa 4 — Desdobramento (P5): títulos de projetos/planos/OKRs e metas Hoshin
  const respDesd = chatIaE3A2(
    'Desdobramento',
    'Empresa ' +
      (normalizado.identificacao.razao_social || '') +
      ' (setor: ' +
      (normalizado.identificacao.setor || '') +
      '), nível ' +
      nivelE +
      '. Estrutura: ' +
      pacote.contagens.projetos +
      ' projetos, ' +
      pacote.contagens.planos_acao +
      ' planos de ação, ' +
      pacote.contagens.okrs +
      ' OKRs, ' +
      pacote.contagens.linhas_hoshin +
      ' linhas Hoshin.\n\n' +
      'Produza, voz direta e assertiva, sem adjetivação, sem citação acadêmica:\n' +
      '1. TITULOS_PROJETOS — exatamente ' +
      pacote.contagens.projetos +
      ' títulos curtos de projetos, um por linha.\n' +
      '2. TITULOS_PLANOS — exatamente ' +
      pacote.contagens.planos_acao +
      ' títulos curtos de planos de ação, um por linha.\n' +
      '3. OBJETIVOS_OKR — exatamente ' +
      pacote.contagens.okrs +
      ' objetivos de OKR (1 frase cada), um por linha.\n' +
      '4. METAS_HOSHIN — exatamente ' +
      pacote.contagens.linhas_hoshin +
      ' metas mensuráveis, uma por linha.\n' +
      'Responda em JSON: {"titulos_projetos":["..."],"titulos_planos":["..."],"objetivos_okr":["..."],"metas_hoshin":["..."]}',
  )
  let desd = null
  if (respDesd) {
    const jDesd = jsonDeTextoIa(limparTextoIa(respDesd))
    if (jDesd && (jDesd.titulos_projetos || jDesd.titulos_planos)) {
      desd = { preenchido: true }
      const tp = Array.isArray(jDesd.titulos_projetos) ? jDesd.titulos_projetos : []
      for (let i = 0; i < pacote.parte_b.projetos.length; i++) {
        const p = pacote.parte_b.projetos[i]
        if (i < tp.length && String(tp[i]).trim()) {
          p.titulo = String(tp[i]).substring(0, 200)
        } else {
          p.titulo = 'Requer verificação: projeto ' + (i + 1)
          p.requer_verificacao = true
        }
      }
      const tl = Array.isArray(jDesd.titulos_planos) ? jDesd.titulos_planos : []
      for (let i = 0; i < pacote.parte_b.planos_acao.length; i++) {
        const p = pacote.parte_b.planos_acao[i]
        if (p) {
          if (i < tl.length && String(tl[i]).trim()) {
            p.titulo = String(tl[i]).substring(0, 200)
          } else {
            p.titulo = 'Requer verificação: plano ' + (i + 1)
            p.requer_verificacao = true
          }
        }
      }
      const oo = Array.isArray(jDesd.objetivos_okr) ? jDesd.objetivos_okr : []
      for (let i = 0; i < pacote.parte_b.okrs.length; i++) {
        const o = pacote.parte_b.okrs[i]
        if (i < oo.length && String(oo[i]).trim()) {
          o.objetivo = String(oo[i]).substring(0, 400)
        } else {
          o.objetivo = 'Requer verificação: OKR ' + (i + 1)
          o.requer_verificacao = true
        }
      }
      const mh = Array.isArray(jDesd.metas_hoshin) ? jDesd.metas_hoshin : []
      for (let i = 0; i < pacote.parte_b.matriz_hoshin.length; i++) {
        const m = pacote.parte_b.matriz_hoshin[i]
        if (i < mh.length && String(mh[i]).trim()) {
          m.meta = String(mh[i]).substring(0, 400)
        } else {
          m.meta = 'Requer verificação: meta Hoshin ' + (i + 1)
          m.requer_verificacao = true
        }
      }
    }
  }
  if (!desd) {
    desd = {
      preenchido: false,
      requer_verificacao: true,
      motivo: 'IA indisponível — campo pendente, sem inferência.',
    }
  }
  blocosIa.desdobramento = desd

  console.log(
    '[E3-A-2][ETAPA5] IA lead=' +
      leadId +
      ' chamadas=' +
      custoIa.chamadas +
      ' tokens_in=' +
      custoIa.tokens_prompt +
      ' tokens_out=' +
      custoIa.tokens_resposta +
      ' custo_usd=' +
      custoIa.custo_usd.toFixed(4),
  )

  return {
    status: 200,
    payload: {
      ok: true,
      codigo: 'PACOTE_V2_MONTADO_E_PREENCHIDO',
      lead_id: leadId,
      normalizacao: {
        nivel: nivelE,
        origem_nivel: normalizado.nivel.origem,
        fallback_nivel: normalizado.nivel.fallback,
      },
      raiz: pacote.raiz,
      contagens: pacote.contagens,
      integridade: pacote.integridade,
      ia: {
        agente: 'jbp-gestao-master',
        via: 'gateway_skip_cloud',
        tier_reasoning: true,
        chamadas: custoIa.chamadas,
        tokens_prompt: custoIa.tokens_prompt,
        tokens_resposta: custoIa.tokens_resposta,
        custo_usd: Number(custoIa.custo_usd.toFixed(4)),
        custo_brl_ref_bespoke_p3: custoBRLBespokeP3,
        dentro_orcamento: custoIa.custo_usd <= 0.25,
      },
      blocos_ia: blocosIa,
      parte_a: pacote.parte_a,
      parte_b: pacote.parte_b,
      avisos: normalizado.avisos || [],
      duracao_ms: Date.now() - T0,
    },
  }
}

// Rota de contrato (Etapa 4/5) — POST com lead_id no corpo.
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
  const rPost = executarMontagemPacoteE3A2(leadIdPost)
  return e.json(rPost.status, rPost.payload)
})

// Rota de exercício runtime (Adendo 1) — mesmo núcleo, GET com leadId no caminho.
// Somente leitura: não grava em nenhuma collection (corte E3-A-1 contínuo).
routerAdd('GET', '/backend/v1/dossie/montar-pacote-teste/{leadId}', (e) => {
  const leadIdGet = e.request.pathValue('leadId')
  if (!leadIdGet) {
    return e.json(400, { ok: false, codigo_erro: 'LEAD_ID_AUSENTE', motivo: 'Informe leadId.' })
  }
  const rGet = executarMontagemPacoteE3A2(leadIdGet)
  return e.json(rGet.status, rGet.payload)
})
