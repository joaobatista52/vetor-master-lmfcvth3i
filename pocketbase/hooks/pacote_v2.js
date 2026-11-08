/// <reference path="../pb_data/types.d.ts" />

/**
 * ETAPA E2 — INGESTÃO DO PACOTE V2.0 (ROTA INTERNA ADMIN + CONSULTOR)
 *
 * REGRA CAPITAL: ingestão é operação INTERNA de Admin ou Consultor. NUNCA
 * exposta ao cliente final (o gate usa a matriz E0, ação 'ingestar_pacote').
 *
 * Rotas:
 * - POST /backend/v1/pacote-v2/validar  → dry-run: valida e retorna resultado
 *   por bloco (✅/❌) SEM persistir nada.
 * - POST /backend/v1/pacote-v2/ingestar → valida; válido grava em pacotes_v2
 *   (status "valido") e propaga para objetivos_estrategicos, projetos,
 *   planos_acao_v2, okrs_v2 e matriz_hoshin com IDs estáveis (upsert por id);
 *   inválido grava em pacotes_v2 (status "invalido" + erros_validacao) e
 *   retorna HTTP 400 com o código de erro específico (402–414).
 *
 * AS 11 REGRAS DE VALIDAÇÃO + BÔNUS:
 * R1  schema_versao === "2.0"                        → PACOTE_V2_SCHEMA_INVALIDO_402
 * R2  13 fases P1..P13 com status                    → PACOTE_V2_FASES_INVALIDAS_403
 * R3  DRE com exatamente 15 linhas, todas com fonte  → PACOTE_V2_DRE_INVALIDA_404
 * R4  EREC com as 4 seções (Eliminar/Reduzir/Elevar/Criar) → PACOTE_V2_EREC_INVALIDO_405
 * R5  gabarito_a8 com 7 ou 8 indicadores             → PACOTE_V2_GABARITO_INVALIDO_406
 * R6  nao_trafega com 4 itens = true                 → PACOTE_V2_NAOTRAFEGA_INVALIDO_407
 * R7  exatamente 6 projetos                          → PACOTE_V2_PRJ_INVALIDO_408
 * R8  exatamente 12 planos_acao                      → PACOTE_V2_PAC_INVALIDO_409
 * R9  soma de etapas === 116                         → PACOTE_V2_ETAPAS_INVALIDAS_410
 * R10 toda etapa com as 7 dimensões 5W2H            → PACOTE_V2_5W2H_INCOMPLETO_411
 *     (aceita "[REQUER VERIFICAÇÃO..." no campo "quanto")
 * R11 FK válida (PRJ→OE, PAC→PRJ, OKR→PRJ)          → PACOTE_V2_FK_INVALIDA_412
 * Bônus: 7 OKRs, 7 linhas Hoshin, 5 rituais         → PACOTE_V2_DESDOBRAMENTO_INVALIDO_413
 * Múltiplos blocos JSON externos no texto           → PACOTE_V2_MULTIBLOCO_414
 *
 * IDs estáveis: PRJ-01, PAC-01.1, OE1, OKR-OE1. Reenvio do MESMO id estável
 * ATUALIZA o registro (upsert), nunca duplica. Mesmo dossie_id cria NOVA
 * linha em pacotes_v2 (histórico por versão do dossiê).
 *
 * Self-contido: este arquivo NÃO referencia símbolos de outros hooks — o JSVM
 * executa callbacks em pools de VMs separados.
 */

var CODIGOS = {
  SCHEMA: 'PACOTE_V2_SCHEMA_INVALIDO_402',
  FASES: 'PACOTE_V2_FASES_INVALIDAS_403',
  DRE: 'PACOTE_V2_DRE_INVALIDA_404',
  EREC: 'PACOTE_V2_EREC_INVALIDO_405',
  GABARITO: 'PACOTE_V2_GABARITO_INVALIDO_406',
  NAOTRAFEGA: 'PACOTE_V2_NAOTRAFEGA_INVALIDO_407',
  PRJ: 'PACOTE_V2_PRJ_INVALIDO_408',
  PAC: 'PACOTE_V2_PAC_INVALIDO_409',
  ETAPAS: 'PACOTE_V2_ETAPAS_INVALIDAS_410',
  W2H: 'PACOTE_V2_5W2H_INCOMPLETO_411',
  FK: 'PACOTE_V2_FK_INVALIDA_412',
  DESDOBRAMENTO: 'PACOTE_V2_DESDOBRAMENTO_INVALIDO_413',
  MULTIBLOCO: 'PACOTE_V2_MULTIBLOCO_414',
}

/**
 * Extrai o bloco JSON do texto colado: do primeiro '{' ao último '}'.
 * Rejeita quando existe mais de um bloco JSON externo (MULTIBLOCO_414).
 */
function extrairPacote(texto) {
  var recortado = String(texto || '').trim()
  if (!recortado) {
    return {
      ok: false,
      codigo: CODIGOS.MULTIBLOCO,
      motivo: 'Texto vazio: nenhum pacote para extrair.',
    }
  }

  var primeiro = recortado.indexOf('{')
  var ultimo = recortado.lastIndexOf('}')
  if (primeiro === -1 || ultimo === -1 || ultimo <= primeiro) {
    return {
      ok: false,
      codigo: CODIGOS.MULTIBLOCO,
      motivo: 'Nenhum bloco JSON encontrado no texto informado.',
    }
  }

  // Detector de múltiplos blocos externos: varre o texto contando aberturas e
  // fechamentos fora de strings. Mais de um retorno ao nível 0 com conteúdo = multibloco.
  var nivel = 0
  var emString = false
  var escape = false
  var blocosExternos = 0
  var viuConteudo = false
  for (var i = 0; i < recortado.length; i++) {
    var ch = recortado.charAt(i)
    if (emString) {
      if (escape) escape = false
      else if (ch === '\\') escape = true
      else if (ch === '"') emString = false
      continue
    }
    if (ch === '"') {
      emString = true
      continue
    }
    if (ch === '{') {
      if (nivel === 0) blocosExternos++
      nivel++
      viuConteudo = true
    } else if (ch === '}') {
      nivel--
    }
  }

  if (blocosExternos > 1) {
    return {
      ok: false,
      codigo: CODIGOS.MULTIBLOCO,
      motivo:
        'O texto contém ' +
        blocosExternos +
        ' blocos JSON externos. Cole APENAS UM pacote por vez (do primeiro "{" ao último "}").',
    }
  }

  var recorte = recortado.substring(primeiro, ultimo + 1)
  var pacote = null
  try {
    pacote = JSON.parse(recorte)
  } catch (errParse) {
    return {
      ok: false,
      codigo: CODIGOS.MULTIBLOCO,
      motivo: 'O bloco extraído não é um JSON válido: ' + (errParse && errParse.message),
    }
  }

  if (!pacote || typeof pacote !== 'object' || Array.isArray(pacote)) {
    return { ok: false, codigo: CODIGOS.MULTIBLOCO, motivo: 'O pacote precisa ser um objeto JSON.' }
  }

  return { ok: true, pacote: pacote }
}

function ehObjeto(v) {
  return v !== null && v !== undefined && typeof v === 'object' && !Array.isArray(v)
}

function primeiraChave(obj, nomes) {
  if (!ehObjeto(obj)) return null
  for (var i = 0; i < nomes.length; i++) {
    if (obj[nomes[i]] !== undefined && obj[nomes[i]] !== null) return obj[nomes[i]]
  }
  return null
}

/** Coleta todas as etapas dos planos (formato array direto ou objeto com plano_id). */
function coletarEtapas(plano) {
  var etapas = primeiraChave(plano, ['etapas', 'etapas_5w2h', 'plano_etapas'])
  if (Array.isArray(etapas)) return etapas
  if (ehObjeto(etapas)) {
    var lista = []
    for (var k in etapas) {
      if (Object.prototype.hasOwnProperty.call(etapas, k)) lista.push(etapas[k])
    }
    return lista
  }
  return []
}

var DIMENSOES_5W2H = ['o_que', 'por_que', 'onde', 'quando', 'quem', 'como', 'quanto']

function etapaTem5W2H(etapa) {
  if (!ehObjeto(etapa)) return false
  for (var i = 0; i < DIMENSOES_5W2H.length; i++) {
    var dim = DIMENSOES_5W2H[i]
    var valor = primeiraChave(etapa, [dim, dim.toUpperCase()])
    if (valor === null || valor === undefined || String(valor).trim() === '') {
      // Aceita placeholder "[REQUER VERIFICAÇÃO..." APENAS na dimensão "quanto"
      return false
    }
  }
  return true
}

/**
 * Executa as 11 regras + bônus. Retorna { ok, erros: [código...], blocos: {...} }.
 * blocos traz o resultado por seção (✅/❌) para o dry-run da tela.
 */
function validarPacote(pacote) {
  var erros = []
  var blocos = {}

  function marcar(nome, okRef) {
    blocos[nome] = { ok: !!okRef }
    if (!okRef) return false
    return true
  }

  // R1 — schema_versao
  var r1 = String(pacote.schema_versao || '') === '2.0'
  marcar('R1 schema_versao 2.0', r1)
  if (!r1) erros.push(CODIGOS.SCHEMA)

  // R2 — 13 fases P1..P13 com status
  var fases = primeiraChave(pacote, ['fases', 'fases_execucao', 'execucao_fases'])
  var fasesOk = false
  var fasesTotal = 0
  if (Array.isArray(fases)) {
    for (var i = 0; i < fases.length; i++) {
      var f = fases[i]
      if (
        ehObjeto(f) &&
        String(f.fase || f.id || '').match(/^P(1[0-3]|[1-9])$/) &&
        f.status !== undefined &&
        f.status !== null &&
        String(f.status) !== ''
      ) {
        fasesTotal++
      }
    }
  } else if (ehObjeto(fases)) {
    for (var fk in fases) {
      if (Object.prototype.hasOwnProperty.call(fases, fk)) {
        var fv = fases[fk]
        if (
          ehObjeto(fv) &&
          /^P(1[0-3]|[1-9])$/.test(String(fk)) &&
          fv.status !== undefined &&
          fv.status !== null &&
          String(fv.status) !== ''
        ) {
          fasesTotal++
        }
      }
    }
  }
  fasesOk = fasesTotal === 13
  marcar('R2 13 fases P1..P13 com status (' + fasesTotal + '/13)', fasesOk)
  if (!fasesOk) erros.push(CODIGOS.FASES)

  // R3 — DRE 15 linhas com campo fonte
  var dre = primeiraChave(pacote, ['dre', 'dre_15_linhas', 'demonstrativo_dre'])
  var dreLinhas = Array.isArray(dre) ? dre : dre && Array.isArray(dre.linhas) ? dre.linhas : null
  var dreOk = false
  var dreContadas = 0
  if (dreLinhas) {
    dreContadas = dreLinhas.length
    var todasComFonte = dreContadas > 0
    for (var d = 0; d < dreLinhas.length; d++) {
      var linha = dreLinhas[d]
      var fonte = ehObjeto(linha)
        ? linha.fonte !== undefined && linha.fonte !== null && String(linha.fonte).trim() !== ''
          ? linha.fonte
          : null
        : null
      if (fonte === null) {
        todasComFonte = false
        break
      }
    }
    dreOk = dreContadas === 15 && todasComFonte
  }
  marcar('R3 DRE 15 linhas com fonte (' + (dreLinhas ? dreContadas : 0) + '/15)', dreOk)
  if (!dreOk) erros.push(CODIGOS.DRE)

  // R4 — EREC 4 seções
  var erec = primeiraChave(pacote, ['erec', 'matriz_erec'])
  var secoesErec = ['eliminar', 'reduzir', 'elevar', 'criar']
  var erecOk = false
  var erecPresentes = 0
  if (ehObjeto(erec)) {
    for (var s = 0; s < secoesErec.length; s++) {
      var secao = erec[secoesErec[s]]
      var secaoNome = secoesErec[s].charAt(0).toUpperCase() + secoesErec[s].slice(1)
      if (secao !== undefined && secao !== null) {
        var ok = Array.isArray(secao)
          ? secao.length > 0
          : ehObjeto(secao)
            ? Object.keys(secao).length > 0
            : String(secao).trim() !== ''
        if (ok) erecPresentes++
        else blocos['R4 EREC seção ' + secaoNome + ' vazia'] = { ok: false }
      }
    }
  }
  erecOk = erecPresentes === 4
  marcar('R4 EREC 4 seções (Eliminar/Reduzir/Elevar/Criar) (' + erecPresentes + '/4)', erecOk)
  if (!erecOk) erros.push(CODIGOS.EREC)

  // R5 — gabarito_a8 com 7 ou 8 indicadores
  var gabarito = primeiraChave(pacote, ['gabarito_a8', 'gabaritoA8', 'a8_gabarito'])
  var indicadores = null
  if (Array.isArray(gabarito)) indicadores = gabarito
  else if (ehObjeto(gabarito))
    indicadores = primeiraChave(gabarito, ['indicadores', 'linhas', 'itens'])
  if (!indicadores && ehObjeto(gabarito)) {
    // gabarito é objeto direto de indicadores
    var chaves = Object.keys(gabarito)
    if (chaves.length >= 7 && chaves.length <= 8) indicadores = chaves
  }
  var gabOk = Array.isArray(indicadores) && (indicadores.length === 7 || indicadores.length === 8)
  marcar(
    'R5 gabarito_a8 com 7-8 indicadores (' + (indicadores ? indicadores.length : 0) + ')',
    gabOk,
  )
  if (!gabOk) erros.push(CODIGOS.GABARITO)

  // R6 — nao_trafega com 4 itens true
  var naoTrafega = primeiraChave(pacote, ['nao_trafega', 'naoTrafega'])
  var itensNaoTrafega = null
  if (Array.isArray(naoTrafega)) itensNaoTrafega = naoTrafega
  else if (ehObjeto(naoTrafega)) itensNaoTrafega = primeiraChave(naoTrafega, ['itens', 'lista'])
  if (!itensNaoTrafega && ehObjeto(naoTrafega)) {
    var chaves2 = Object.keys(naoTrafega)
    if (chaves2.length === 4)
      itensNaoTrafega = chaves2.map(function (k) {
        return naoTrafega[k]
      })
  }
  var naoTrafegaOk = false
  if (Array.isArray(itensNaoTrafega) && itensNaoTrafega.length === 4) {
    var todosTrue = true
    for (var n = 0; n < 4; n++) {
      if (itensNaoTrafega[n] !== true) {
        todosTrue = false
        break
      }
    }
    naoTrafegaOk = todosTrue
  }
  marcar(
    'R6 nao_trafega 4 itens = true (' + (itensNaoTrafega ? itensNaoTrafega.length : 0) + '/4)',
    naoTrafegaOk,
  )
  if (!naoTrafegaOk) erros.push(CODIGOS.NAOTRAFEGA)

  // R7 a R10 — dependem de projetos/planos
  var projetos = pacote.projetos
  var planos = primeiraChave(pacote, ['planos_acao', 'planos_de_acao', 'planos'])
  var objetivos = primeiraChave(pacote, ['objetivos_estrategicos', 'objetivos'])
  var okrs = primeiraChave(pacote, ['okrs', 'okrs_v2'])
  var hoshin = primeiraChave(pacote, ['matriz_hoshin', 'hoshin'])
  var rituais = primeiraChave(pacote, ['rituais', 'rituais_operacionais'])

  var prjOk = Array.isArray(projetos) && projetos.length === 6
  marcar(
    'R7 exatamente 6 projetos (' + (Array.isArray(projetos) ? projetos.length : 0) + '/6)',
    prjOk,
  )
  if (!prjOk) erros.push(CODIGOS.PRJ)

  var pacOk = Array.isArray(planos) && planos.length === 12
  marcar(
    'R8 exatamente 12 planos_acao (' + (Array.isArray(planos) ? planos.length : 0) + '/12)',
    pacOk,
  )
  if (!pacOk) erros.push(CODIGOS.PAC)

  // R9 — soma das etapas === 116
  var somaEtapas = 0
  if (Array.isArray(planos)) {
    for (var p = 0; p < planos.length; p++) somaEtapas += coletarEtapas(planos[p]).length
  }
  var etapasOk = somaEtapas === 116
  marcar('R9 soma das etapas === 116 (' + somaEtapas + '/116)', etapasOk)
  if (!etapasOk) erros.push(CODIGOS.ETAPAS)

  // R10 — 5W2H completo em toda etapa
  var w2hOk = true
  var primeiraFalha = ''
  if (Array.isArray(planos) && planos.length > 0) {
    for (var p2 = 0; p2 < planos.length; p2++) {
      var etapasPlano = coletarEtapas(planos[p2])
      for (var t = 0; t < etapasPlano.length; t++) {
        if (!etapaTem5W2H(etapasPlano[t])) {
          w2hOk = false
          primeiraFalha =
            'Plano ' +
            ((planos[p2] && (planos[p2].plano_id || planos[p2].id)) || p2 + 1) +
            ', etapa ' +
            (t + 1)
          break
        }
      }
      if (!w2hOk) break
    }
  } else {
    w2hOk = false
  }
  marcar(
    'R10 5W2H completo nas etapas' +
      (primeiraFalha ? ' (primeira falha: ' + primeiraFalha + ')' : ''),
    w2hOk,
  )
  if (!w2hOk) erros.push(CODIGOS.W2H)

  // R11 — FK: PRJ→OE, PAC→PRJ, OKR→PRJ
  var idsOE = {}
  var idsPRJ = {}
  var idsPAC = {}
  var fkOk = true
  var motivoFk = ''
  if (Array.isArray(objetivos)) {
    for (var o = 0; o < objetivos.length; o++) {
      if (ehObjetivo(objetivos[o]) && objetivos[o].objetivo_id)
        idsOE[String(objetivos[o].objetivo_id)] = true
    }
  }
  if (Array.isArray(projetos)) {
    for (var pr = 0; pr < projetos.length; pr++) {
      var prj = projetos[pr]
      if (!ehObjeto(prj)) continue
      var pid = String(prj.projeto_id || prj.id || '')
      if (pid) idsPRJ[pid] = true
      var oeRef = String(prj.objetivo_estrategico_id || prj.objetivo_id || '')
      if (oeRef && !idsOE[oeRef]) {
        fkOk = false
        motivoFk = 'Projeto ' + pid + ' referencia OE inexistente: ' + oeRef
      }
    }
  }
  if (Array.isArray(planos)) {
    for (var pa = 0; pa < planos.length; pa++) {
      var plano = planos[pa]
      if (!ehObjeto(plano)) continue
      var plid = String(plano.plano_id || plano.id || '')
      if (plid) idsPAC[plid] = true
      var prjRef = String(plano.projeto_id || '')
      if (prjRef && !idsPRJ[prjRef]) {
        fkOk = false
        motivoFk = 'Plano ' + plid + ' referencia projeto inexistente: ' + prjRef
      }
    }
  }
  if (Array.isArray(okrs)) {
    for (var ok = 0; ok < okrs.length; ok++) {
      var okr = okrs[ok]
      if (!ehObjeto(okr)) continue
      var prjRef2 = String(okr.projeto_id || '')
      if (prjRef2 && !idsPRJ[prjRef2]) {
        fkOk = false
        motivoFk =
          'OKR ' +
          String(okr.okr_id || okr.id || '') +
          ' referencia projeto inexistente: ' +
          prjRef2
      }
    }
  }
  marcar('R11 FKs válidas (PRJ→OE, PAC→PRJ, OKR→PRJ)' + (motivoFk ? ' — ' + motivoFk : ''), fkOk)
  if (!fkOk) erros.push(CODIGOS.FK)

  // Bônus — desdobramento: 7 OKRs, 7 linhas Hoshin, 5 rituais
  var bonusOk = true
  var motivoBonus = []
  if (!Array.isArray(okrs) || okrs.length !== 7) {
    bonusOk = false
    motivoBonus.push('OKRs: ' + (Array.isArray(okrs) ? okrs.length : 0) + '/7')
  }
  if (!Array.isArray(hoshin) || hoshin.length !== 7) {
    bonusOk = false
    motivoBonus.push('Hoshin: ' + (Array.isArray(hoshin) ? hoshin.length : 0) + '/7')
  }
  if (!Array.isArray(rituais) || rituais.length !== 5) {
    bonusOk = false
    motivoBonus.push('Rituais: ' + (Array.isArray(rituais) ? rituais.length : 0) + '/5')
  }
  marcar(
    'Bônus desdobramento: 7 OKRs, 7 linhas Hoshin, 5 rituais' +
      (motivoBonus.length ? ' — ' + motivoBonus.join(', ') : ''),
    bonusOk,
  )
  if (!bonusOk) erros.push(CODIGOS.DESDOBRAMENTO)

  return { ok: erros.length === 0, erros: erros, blocos: blocos }
}

function ehObjetivo(v) {
  return v !== null && v !== undefined && typeof v === 'object' && !Array.isArray(v)
}

/** Upsert por id estável: retorna o record existente (para update) ou null (create). */
function buscarPorIdEstavel($app, collection, campoId, valorId) {
  try {
    return $app.findFirstRecordByFilter(collection, campoId + ' = {:v}', { v: String(valorId) })
  } catch (_) {
    return null
  }
}

/** Grava (upsert) um registro derivado do pacote, por id estável. */
function upsertDerivado($app, collection, campoId, dados, pacoteRecId, dossieId) {
  var existente = buscarPorIdEstavel($app, collection, campoId, dados[campoId])
  var col = $app.findCollectionByNameOrId(collection)
  var reg = existente || new Record(col)
  var chaves = Object.keys(dados)
  for (var i = 0; i < chaves.length; i++) {
    var k = chaves[i]
    if (k === campoId) continue
    reg.set(k, dados[k])
  }
  reg.set(campoId, dados[campoId])
  reg.set('schema_versao', '2.0')
  reg.set('pacote', pacoteRecId)
  reg.set('dossie_id', dossieId || '')
  $app.save(reg)
  return reg
}

function propagarPacote($app, pacote, pacoteRecId, dossieId) {
  var contagem = { objetivos: 0, projetos: 0, planos: 0, okrs: 0, hoshin: 0 }

  var objetivos = pacote.objetivos_estrategicos || pacote.objetivos || []
  if (Array.isArray(objetivos)) {
    for (var i = 0; i < objetivos.length; i++) {
      var oe = objetivos[i]
      if (!ehObjeto(oe) || !oe.objetivo_id) continue
      upsertDerivado(
        $app,
        'objetivos_estrategicos',
        'objetivo_id',
        {
          objetivo_id: String(oe.objetivo_id),
          perspectiva_bsc: String(oe.perspectiva_bsc || oe.perspectiva || ''),
          descricao: String(oe.descricao || ''),
          ancora: String(oe.ancora || ''),
          indicadores: oe.indicadores || [],
        },
        pacoteRecId,
        dossieId,
      )
      contagem.objetivos++
    }
  }

  var projetos = pacote.projetos || []
  if (Array.isArray(projetos)) {
    for (var p = 0; p < projetos.length; p++) {
      var prj = projetos[p]
      if (!ehObjeto(prj) || !prj.projeto_id) continue
      upsertDerivado(
        $app,
        'projetos',
        'projeto_id',
        {
          projeto_id: String(prj.projeto_id),
          objetivo_estrategico_id: String(prj.objetivo_estrategico_id || ''),
          projeto_nome: String(prj.projeto_nome || prj.nome || ''),
          sponsor: String(prj.sponsor || ''),
          escopo: String(prj.escopo || ''),
          objetivos: String(prj.objetivos || ''),
          melhorias_esperadas: prj.melhorias_esperadas || [],
          aplicacao_abrangencia: String(prj.aplicacao_abrangencia || ''),
          planos_acao_ids: prj.planos_acao_ids || [],
          fundamentacao: prj.fundamentacao || {},
          benchmark_setorial: String(prj.benchmark_setorial || ''),
          prazo: String(prj.prazo || ''),
          criterio_aceite: String(prj.criterio_aceite || ''),
          status: String(prj.status || 'ativo'),
        },
        pacoteRecId,
        dossieId,
      )
      contagem.projetos++
    }
  }

  var planos = pacote.planos_acao || pacote.planos_de_acao || pacote.planos || []
  if (Array.isArray(planos)) {
    for (var a = 0; a < planos.length; a++) {
      var plano = planos[a]
      if (!ehObjeto(plano) || !plano.plano_id) continue
      upsertDerivado(
        $app,
        'planos_acao_v2',
        'plano_id',
        {
          plano_id: String(plano.plano_id),
          projeto_id: String(plano.projeto_id || ''),
          objetivo_estrategico_id: String(plano.objetivo_estrategico_id || ''),
          plano_nome: String(plano.plano_nome || plano.nome || ''),
          sponsor: String(plano.sponsor || ''),
          escopo: String(plano.escopo || ''),
          objetivos: String(plano.objetivos || ''),
          melhorias_esperadas: plano.melhorias_esperadas || [],
          aplicacao_abrangencia: String(plano.aplicacao_abrangencia || ''),
          etapas: plano.etapas || [],
          fundamentacao: plano.fundamentacao || {},
        },
        pacoteRecId,
        dossieId,
      )
      contagem.planos++
    }
  }

  var okrs = pacote.okrs || []
  if (Array.isArray(okrs)) {
    for (var k = 0; k < okrs.length; k++) {
      var okr = okrs[k]
      if (!ehObjeto(okr) || !okr.okr_id) continue
      upsertDerivado(
        $app,
        'okrs_v2',
        'okr_id',
        {
          okr_id: String(okr.okr_id),
          objetivo_estrategico_id: String(okr.objetivo_estrategico_id || ''),
          projeto_id: String(okr.projeto_id || ''),
          plano_id: String(okr.plano_id || ''),
          objetivo: String(okr.objetivo || ''),
          key_results: okr.key_results || [],
          prazo: String(okr.prazo || ''),
        },
        pacoteRecId,
        dossieId,
      )
      contagem.okrs++
    }
  }

  var hoshin = pacote.matriz_hoshin || pacote.hoshin || []
  if (Array.isArray(hoshin)) {
    for (var h = 0; h < hoshin.length; h++) {
      var linha = hoshin[h]
      if (!ehObjeto(linha)) continue
      var colH = $app.findCollectionByNameOrId('matriz_hoshin')
      var regH = new Record(colH) // Hoshin não tem id estável declarado — cada pacote grava novas linhas
      regH.set('schema_versao', '2.0')
      regH.set('objetivo_estrategico_id', String(linha.objetivo_estrategico_id || ''))
      regH.set('area', String(linha.area || ''))
      regH.set('meta', String(linha.meta || ''))
      regH.set('responsavel', String(linha.responsavel || ''))
      regH.set('prazo', String(linha.prazo || ''))
      regH.set('pacote', pacoteRecId)
      regH.set('dossie_id', dossieId || '')
      $app.save(regH)
      contagem.hoshin++
    }
  }

  return contagem
}

// ----------------------------------------------------------------------------
// Endpoint DRY-RUN: valida e retorna resultado por bloco, SEM persistir
// ----------------------------------------------------------------------------
routerAdd(
  'POST',
  '/backend/v1/pacote-v2/validar',
  (e) => {
    // REGRA CAPITAL: interno — admin + consultor (nunca cliente)
    const gate = exigirPermissao(e, 'ingestar_pacote', 'pacote')
    if (gate.resposta) {
      return gate.resposta
    }

    let body = {}
    try {
      const rawBody = (e.requestInfo && e.requestInfo().body) || {}
      body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    } catch (_) {
      return e.json(400, {
        sucesso: false,
        erro: 'PACOTE_V2_MULTIBLOCO_414',
        motivo: 'Corpo da requisição não é JSON válido.',
      })
    }

    const texto = body ? body.texto || body.pacote_texto || body.conteudo || '' : ''
    const extracao = extrairPacote(texto)
    if (!extracao.ok) {
      return e.json(400, { sucesso: false, erro: extracao.codigo, motivo: extracao.motivo })
    }

    const resultado = validarPacote(extracao.pacote)
    return e.json(200, {
      sucesso: true,
      valido: resultado.ok,
      erros: resultado.erros,
      blocos: resultado.blocos,
      dossie_id: extracao.pacote.dossie_id || '',
      parte: extracao.pacote.parte || '',
      dry_run: true,
    })
  },
  $apis.requireAuth(),
)

// ----------------------------------------------------------------------------
// Endpoint de INGESTÃO: valida e grava (válido → status "valido"; inválido →
// status "invalido" + erros_validacao, HTTP 400)
// ----------------------------------------------------------------------------
routerAdd(
  'POST',
  '/backend/v1/pacote-v2/ingestar',
  (e) => {
    const gate = exigirPermissao(e, 'ingestar_pacote', 'pacote')
    if (gate.resposta) {
      return gate.resposta
    }
    const authUser = e.auth || (e.requestInfo && e.requestInfo().auth) || null
    const importadoPor = (authUser && authUser.id) || ''

    let body = {}
    try {
      const rawBody = (e.requestInfo && e.requestInfo().body) || {}
      body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    } catch (_) {
      return e.json(400, {
        sucesso: false,
        erro: 'PACOTE_V2_MULTIBLOCO_414',
        motivo: 'Corpo da requisição não é JSON válido.',
      })
    }

    const texto = body ? body.texto || body.pacote_texto || body.conteudo || '' : ''
    const leadIdBody = body ? body.lead_id || body.lead || '' : ''
    const diagnosticoIdBody = body ? body.diagnostico_id || body.diagnostico || '' : ''

    const extracao = extrairPacote(texto)
    if (!extracao.ok) {
      // Multibloco/JSON inválido: registra como inválido também (rastreabilidade)
      try {
        const colP = $app.findCollectionByNameOrId('pacotes_v2')
        const regP = new Record(colP)
        regP.set('schema_versao', '2.0')
        regP.set('parte', '')
        regP.set('dossie_id', '')
        regP.set('payload', { texto_original: String(texto || '').substring(0, 20000) })
        regP.set('status_validacao', 'invalido')
        regP.set('erros_validacao', [{ codigo: extracao.codigo, motivo: extracao.motivo }])
        if (leadIdBody) regP.set('lead', leadIdBody)
        if (diagnosticoIdBody) regP.set('diagnostico', diagnosticoIdBody)
        if (importadoPor) regP.set('importado_por', importadoPor)
        regP.set('importado_em', new Date().toISOString())
        $app.save(regP)
      } catch (_) {}
      return e.json(400, { sucesso: false, erro: extracao.codigo, motivo: extracao.motivo })
    }

    const pacote = extracao.pacote
    const resultado = validarPacote(pacote)
    const dossieId = String(pacote.dossie_id || body.dossie_id || '')
    const parte = String(pacote.parte || body.parte || '')

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
    let pacoteRec = null
    let resposta = null

    if (!resultado.ok) {
      // INVÁLIDO: grava com status "invalido" + erros_validacao e retorna 400
      pacoteRec = new Record(colPacotes)
      pacoteRec.set('schema_versao', '2.0')
      pacoteRec.set('parte', parte)
      pacoteRec.set('execucao_id', String(pacote.execucao_id || ''))
      pacoteRec.set('dossie_id', dossieId)
      pacoteRec.set('payload', pacote)
      pacoteRec.set('status_validacao', 'invalido')
      pacoteRec.set(
        'erros_validacao',
        resultado.erros.map(function (c) {
          return { codigo: c }
        }),
      )
      if (leadRecId) pacoteRec.set('lead', leadRecId)
      if (diagRecId) pacoteRec.set('diagnostico', diagRecId)
      if (importadoPor) pacoteRec.set('importado_por', importadoPor)
      pacoteRec.set('importado_em', new Date().toISOString())
      $app.save(pacoteRec)

      resposta = e.json(400, {
        sucesso: false,
        valido: false,
        erro: resultado.erros[0],
        erros: resultado.erros,
        blocos: resultado.blocos,
        pacote_id: pacoteRec.id,
        motivo:
          'Pacote inválido: gravado em pacotes_v2 com status "invalido" para rastreabilidade.',
      })
      return resposta
    }

    // VÁLIDO: mesmo dossie_id cria NOVA linha em pacotes_v2 (histórico por versão)
    pacoteRec = new Record(colPacotes)
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
    const contagem = propagarPacote($app, pacote, pacoteRec.id, dossieId)

    return e.json(200, {
      sucesso: true,
      valido: true,
      pacote_id: pacoteRec.id,
      dossie_id: dossieId,
      parte: parte,
      propagado: contagem,
      blocos: resultado.blocos,
      motivo: 'Pacote V2.0 válido: gravado em pacotes_v2 e propagado com IDs estáveis.',
    })
  },
  $apis.requireAuth(),
)
