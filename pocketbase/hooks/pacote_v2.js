/// <reference path="../pb_data/types.d.ts" />

/**
 * ETAPA E2-A — INGESTÃO DO PACOTE ESTRUTURADO V2.0 (ROTA INTERNA ADMIN + CONSULTOR)
 *
 * REGRA CAPITAL: ingestão é operação INTERNA de Admin ou Consultor. NUNCA
 * exposta ao cliente final (gate usa a matriz E0, ação 'ingestar_pacote').
 *
 * REGRA DE DEPLOY (JSVM do PocketBase): handlers são executados em contexto
 * isolado — funções/variáveis de topo deste arquivo NÃO são visíveis dentro
 * dos callbacks, e require() no topo também não roda na serialização do
 * handler. Por isso o require do módulo de validação e do helper de permissões
 * é feito DENTRO de cada callback, com o path absoluto `${__hooks}/...`.
 * Módulos carregados assim usam registry compartilhado e funcionam no runtime.
 *
 * Rotas:
 * - POST /backend/v1/pacote-v2/validar  → dry-run: extrai + valida e retorna o
 *   resultado por bloco (status "ok"/"erro") SEM persistir nada.
 * - POST /backend/v1/pacote-v2/ingestar → valida; válido grava em pacotes_v2
 *   (status "valido", payload integral, parte, execucao_id, dossie_id, lead,
 *   importado_por, importado_em) e propaga para objetivos_estrategicos,
 *   projetos, planos_acao_v2, okrs_v2 e matriz_hoshin com upsert por IDs
 *   estáveis (PRJ-01, PAC-01.1, OE1, OKR-OE1) — reenvio ATUALIZA, não duplica.
 *   Inválido grava status "invalido" + erros_validacao e retorna HTTP 400 com
 *   o código específico da regra violada (402–413).
 *   Mesmo dossie_id com pacote anterior cria NOVO registro em pacotes_v2
 *   (histórico), nunca sobrescreve.
 *
 * Códigos de erro: ver CODIGOS em pacote_v2_validacao.js (401 JSON inválido,
 * 402–413 regras R1–R11+bônus, 414 multibloco, 415 parte indeterminada).
 */

routerAdd(
  'POST',
  '/backend/v1/pacote-v2/validar',
  (e) => {
    // REGRA CAPITAL: interno — admin + consultor (nunca cliente/user)
    const perm = require(`${__hooks}/permissao.js`)
    const gate = perm.exigirPermissao(e, 'ingestar_pacote', 'pacote')
    if (gate.resposta) {
      return gate.resposta
    }

    const val = require(`${__hooks}/pacote_v2_validacao.js`)

    let body = {}
    try {
      const rawBody = (e.requestInfo && e.requestInfo().body) || {}
      body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    } catch (_) {
      return e.json(400, {
        sucesso: false,
        erro: val.CODIGOS.JSON_INVALIDO,
        motivo: 'Corpo da requisição não é JSON válido.',
      })
    }

    const texto = body ? body.texto || body.pacote_texto || body.conteudo || '' : ''
    const extracao = val.extrairPacote(texto)
    if (!extracao.ok) {
      return e.json(400, { sucesso: false, erro: extracao.codigo, motivo: extracao.motivo })
    }

    const resultado = val.validarPacote(extracao.pacote)
    return e.json(200, {
      sucesso: true,
      valido: resultado.ok,
      parte: resultado.parte,
      blocos: resultado.blocos,
      erros: resultado.erros,
      dossie_id: String(extracao.pacote.dossie_id || ''),
      dry_run: true,
      motivo: resultado.ok
        ? 'Pacote V2.0 válido — nada foi persistido (dry-run).'
        : 'Pacote inválido — nada foi persistido (dry-run).',
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/pacote-v2/ingestar',
  (e) => {
    // REGRA CAPITAL: interno — admin + consultor (nunca cliente/user)
    const perm = require(`${__hooks}/permissao.js`)
    const gate = perm.exigirPermissao(e, 'ingestar_pacote', 'pacote')
    if (gate.resposta) {
      return gate.resposta
    }

    const val = require(`${__hooks}/pacote_v2_validacao.js`)
    const app = $app

    const authUser = e.auth || (e.requestInfo && e.requestInfo().auth) || null
    const importadoPor = (authUser && authUser.id) || ''

    let body = {}
    try {
      const rawBody = (e.requestInfo && e.requestInfo().body) || {}
      body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    } catch (_) {
      return e.json(400, {
        sucesso: false,
        erro: val.CODIGOS.JSON_INVALIDO,
        motivo: 'Corpo da requisição não é JSON válido.',
      })
    }

    const texto = body ? body.texto || body.pacote_texto || body.conteudo || '' : ''
    const leadIdBody = body ? body.lead_id || body.lead || '' : ''
    const diagnosticoIdBody = body ? body.diagnostico_id || body.diagnostico || '' : ''

    const extracao = val.extrairPacote(texto)
    if (!extracao.ok) {
      // Registro de rastreabilidade para extração falha (JSON inválido/multibloco)
      try {
        const colP = $app.findCollectionByNameOrId('pacotes_v2')
        const regP = new Record(colP)
        regP.set('schema_versao', '2.0')
        regP.set('parte', '')
        regP.set('dossie_id', '')
        regP.set('payload', { texto_original: String(texto || '').substring(0, 20000) })
        regP.set('status_validacao', 'invalido')
        regP.set('erros_validacao', [
          { codigo: extracao.codigo, mensagem: extracao.motivo, detalhe: '' },
        ])
        if (leadIdBody) regP.set('lead', leadIdBody)
        if (diagnosticoIdBody) regP.set('diagnostico', diagnosticoIdBody)
        if (importadoPor) regP.set('importado_por', importadoPor)
        regP.set('importado_em', new Date().toISOString())
        $app.save(regP)
      } catch (_) {}
      return e.json(400, { sucesso: false, erro: extracao.codigo, motivo: extracao.motivo })
    }

    const pacote = extracao.pacote
    const resultado = val.validarPacote(pacote)
    const dossieId = String(pacote.dossie_id || body.dossie_id || '')
    const parte = String(pacote.parte || body.parte || resultado.parte || '')

    // Vínculo com lead/diagnóstico quando o payload ou o corpo trouxer
    let leadRecId = leadIdBody || ''
    if (!leadRecId && dossieId) {
      try {
        const leadVinculado = $app.findFirstRecordByFilter(
          'leads',
          'id = {:d} || protocolo = {:d}',
          { d: dossieId },
        )
        leadRecId = leadVinculado.id
      } catch (_) {}
    }
    let diagRecId = diagnosticoIdBody || ''
    if (!diagRecId && leadRecId) {
      try {
        const diagVinculado = $app.findFirstRecordByData('diagnosticos', 'lead', leadRecId)
        if (diagVinculado) diagRecId = diagVinculado.id
      } catch (_) {}
    }

    const colPacotes = $app.findCollectionByNameOrId('pacotes_v2')

    // ------------------------------------------------------------------
    // INVÁLIDO: grava com status "invalido" + erros_validacao e retorna 400
    // com o código do PRIMEIRO erro (regra violada específica).
    // ------------------------------------------------------------------
    if (!resultado.ok) {
      const pacoteRecInv = new Record(colPacotes)
      pacoteRecInv.set('schema_versao', '2.0')
      pacoteRecInv.set('parte', resultado.parte || parte)
      pacoteRecInv.set('execucao_id', String(pacote.execucao_id || ''))
      pacoteRecInv.set('dossie_id', dossieId)
      pacoteRecInv.set('payload', pacote)
      pacoteRecInv.set('status_validacao', 'invalido')
      pacoteRecInv.set('erros_validacao', resultado.erros)
      if (leadRecId) pacoteRecInv.set('lead', leadRecId)
      if (diagRecId) pacoteRecInv.set('diagnostico', diagRecId)
      if (importadoPor) pacoteRecInv.set('importado_por', importadoPor)
      pacoteRecInv.set('importado_em', new Date().toISOString())
      $app.save(pacoteRecInv)

      return e.json(400, {
        sucesso: false,
        valido: false,
        erro: resultado.erros[0].codigo,
        erros: resultado.erros,
        blocos: resultado.blocos,
        pacote_id: pacoteRecInv.id,
        motivo:
          'Pacote inválido: gravado em pacotes_v2 com status "invalido" para rastreabilidade (nenhuma propagação executada).',
      })
    }

    // ------------------------------------------------------------------
    // VÁLIDO: grava em pacotes_v2 (novo registro — histórico por versão do
    // dossiê; mesmo dossie_id NÃO sobrescreve pacote anterior) e propaga.
    // ------------------------------------------------------------------
    const pacoteRec = new Record(colPacotes)
    pacoteRec.set('schema_versao', '2.0')
    pacoteRec.set('parte', parte)
    pacoteRec.set('execucao_id', String(pacote.execucao_id || ''))
    pacoteRec.set('dossie_id', dossieId)
    pacoteRec.set('payload', pacote)
    pacoteRec.set('status_validacao', 'valido')
    pacoteRec.set('erros_validacao', [])
    if (leadRecId) pacoteRec.set('lead', leadRecId)
    if (diagRecId) pacoteRec.set('diagnostico', diagRecId)
    if (importadoPor) pacoteRec.set('importado_por', importadoPor)
    pacoteRec.set('importado_em', new Date().toISOString())
    $app.save(pacoteRec)

    // Propaga com IDs estáveis — reenvio ATUALIZA (upsert), não duplica
    const propagacao = val.propagarPacote(app, pacote, {
      pacote_id: pacoteRec.id,
      dossie_id: dossieId,
    })
    if (!propagacao.ok) {
      return e.json(500, {
        sucesso: false,
        erro: 'PACOTE_V2_PROPAGACAO_FALHOU',
        motivo: 'Pacote gravado em pacotes_v2, mas a propagação às collections derivadas falhou.',
        pacote_id: pacoteRec.id,
      })
    }
    const contagem = propagacao.contagem

    return e.json(200, {
      sucesso: true,
      valido: true,
      parte: parte,
      prj: contagem.prj,
      pac: contagem.pac,
      etapas: contagem.etapas,
      okrs: contagem.okrs,
      hoshin: contagem.hoshin,
      rituais: contagem.rituais,
      pacote_id: pacoteRec.id,
      dossie_id: dossieId,
      blocos: resultado.blocos,
      motivo: 'Pacote V2.0 válido: gravado em pacotes_v2 e propagado com upsert por IDs estáveis.',
    })
  },
  $apis.requireAuth(),
)
