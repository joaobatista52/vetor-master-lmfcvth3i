/// <reference path="../pb_data/types.d.ts" />

/**
 * ETAPA E2-A — MÓDULO PURO DE VALIDAÇÃO DO PACOTE ESTRUTURADO V2.0
 *
 * Este arquivo NÃO registra hooks nem rotas: é um módulo CommonJS carregado
 * DENTRO dos callbacks de pacote_v2.js com require(`${__hooks}/pacote_v2_validacao.js`).
 * Regra do JSVM do PocketBase: handlers rodam em contexto isolado — funções de
 * topo do pacote_v2.js não são visíveis dentro dos callbacks; módulos carregados
 * com require() DENTRO do callback funcionam (registry compartilhado, sem mutações).
 *
 * AS 11 REGRAS DE VALIDAÇÃO + BÔNUS (códigos de erro HTTP padrão do projeto):
 * R1  schema_versao === "2.0"                        → PACOTE_V2_SCHEMA_INVALIDO_402
 * R2  13 fases P1..P13 com status                    → PACOTE_V2_FASES_INVALIDAS_403
 * R3  DRE com exatamente 15 linhas, todas com fonte  → PACOTE_V2_DRE_INVALIDA_404
 * R4  EREC com as 4 seções (Eliminar/Reduzir/Elevar/Criar) → PACOTE_V2_EREC_INVALIDO_405
 * R5  gabarito_a8 com 7 OU 8 indicadores (≤6 e ≥9 inválidos) → PACOTE_V2_GABARITO_INVALIDO_406
 * R6  nao_trafega com 4 itens = true                 → PACOTE_V2_NAOTRAFEGA_INVALIDO_407
 * R7  exatamente 6 projetos                          → PACOTE_V2_PRJ_INVALIDO_408
 * R8  exatamente 12 planos_acao                      → PACOTE_V2_PAC_INVALIDO_409
 * R9  soma das etapas === 116                        → PACOTE_V2_ETAPAS_INVALIDAS_410
 * R10 toda etapa com as 7 dimensões 5W2H preenchidas → PACOTE_V2_5W2H_INCOMPLETO_411
 *     (aceita "[REQUER VERIFICAÇÃO..." na dimensão "quanto")
 * R11 FK válida (PRJ→OE, PAC→PRJ, OKR→PRJ)          → PACOTE_V2_FK_INVALIDA_412
 * Bônus: 7 OKRs, 7 linhas Hoshin, 5 rituais          → PACOTE_V2_DESDOBRAMENTO_INVALIDO_413
 * Extra: parte indeterminada                          → PACOTE_V2_PARTE_INDETERMINADA_415
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
  PARTE_INDETERMINADA: 'PACOTE_V2_PARTE_INDETERMINADA_415',
}

/**
 * 1.1 extrairPacote(textoColado):
 * - localiza o primeiro '{' e o último '}' do texto e faz JSON.parse do recorte;
 * - texto vazio / sem bloco / JSON inválido → PACOTE_V2_JSON_INVALIDO_401;
 * - mais de um bloco JSON externo detectável → PACOTE_V2_MULTIBLOCO_414;
 * - ok → { ok: true, pacote }.
 * Tolerante a texto contaminado: o usuário pode colar prosa antes/depois do JSON.
 */
function extrairPacote(textoColado) {
  var texto = String(textoColado === null || textoColado === undefined ? '' : textoColado).trim()
  if (!texto) {
    return {
      ok: false,
      codigo: CODIGOS.JSON_INVALIDO,
      motivo: 'Texto vazio: nenhum pacote para extrair.',
    }
  }

  var primeiro = texto.indexOf('{')
  var ultimo = texto.lastIndexOf('}')
  if (primeiro === -1 || ultimo === -1 || ultimo <= primeiro) {
    return {
      ok: false,
      codigo: CODIGOS.JSON_INVALIDO,
      motivo: 'Nenhum bloco JSON encontrado no texto informado.',
    }
  }

  // Detector de múltiplos blocos externos: varre o texto contando '{' e '}'
  // no nível 0, ignorando o conteúdo dentro de strings JSON.
  var nivel = 0
  var emString = false
  var escapeAtivo = false
  var blocosExternos = 0
  for (var i = 0; i < texto.length; i++) {
    var ch = texto.charAt(i)
    if (emString) {
      if (escapeAtivo) escapeAtivo = false
      else if (ch === '\\') escapeAtivo = true
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
    } else if (ch === '}') {
      if (nivel > 0) nivel--
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

  var recorte = texto.substring(primeiro, ultimo + 1)
  var pacote = null
  try {
    pacote = JSON.parse(recorte)
  } catch (errParse) {
    return {
      ok: false,
      codigo: CODIGOS.JSON_INVALIDO,
      motivo:
        'O bloco extraído não é um JSON válido: ' +
        String((errParse && errParse.message) || errParse),
    }
  }

  if (!pacote || typeof pacote !== 'object' || Array.isArray(pacote)) {
    return {
      ok: false,
      codigo: CODIGOS.JSON_INVALIDO,
      motivo: 'O pacote precisa ser um objeto JSON.',
    }
  }

  return { ok: true, pacote: pacote }
}

function ehObjeto(v) {
  return v !== null && v !== undefined && typeof v === 'object' && !Array.isArray(v)
}

/** Primeira propriedade presente e não-nula entre os nomes dados. */
function primeiraChave(obj, nomes) {
  if (!ehObjeto(obj)) return null
  for (var i = 0; i < nomes.length; i++) {
    if (obj[nomes[i]] !== undefined && obj[nomes[i]] !== null) return obj[nomes[i]]
  }
  return null
}

/** Todas as etapas de um plano (array direto ou objeto indexado). */
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

/**
 * R10: as 7 dimensões 5W2H preenchidas. A dimensão "quanto" aceita
 * o placeholder literal "[REQUER VERIFICAÇÃO..." (produção do Expert).
 */
function etapaTem5W2H(etapa) {
  if (!ehObjeto(etapa)) return false
  for (var i = 0; i < DIMENSOES_5W2H.length; i++) {
    var dim = DIMENSOES_5W2H[i]
    var valor = primeiraChave(etapa, [dim, dim.toUpperCase()])
    if (valor === null || String(valor).trim() === '') return false
  }
  return true
}

/**
 * DETECÇÃO DE PARTE do Pacote Estruturado V2.0:
 * - conteudo_fases presente → "A"
 * - projetos_e_planos presente e não-nulo → "B"
 * - ambos → "AB"; nenhum → erro PARTE_INDETERMINADA.
 * Retorna { parte: "A"|"B"|"AB", erro: null | { codigo, motivo } }.
 */
function detectarParte(pacote) {
  var temA = pacote.conteudo_fases !== undefined && pacote.conteudo_fases !== null
  var brutoB = pacote.projetos_e_planos
  var temB = brutoB !== undefined && brutoB !== null

  if (temA && temB) return { parte: 'AB', erro: null }
  if (temA) return { parte: 'A', erro: null }
  if (temB) return { parte: 'B', erro: null }
  return {
    parte: '',
    erro: {
      codigo: CODIGOS.PARTE_INDETERMINADA,
      motivo:
        'Parte indeterminada: o pacote não traz "conteudo_fases" (Parte A) nem "projetos_e_planos" (Parte B).',
    },
  }
}

/** Normaliza conteudo_fases (array direto ou objeto indexado por fase). */
function normalizarFases(fases) {
  if (Array.isArray(fases)) return fases
  if (ehObjeto(fases)) {
    var lista = []
    for (var k in fases) {
      if (Object.prototype.hasOwnProperty.call(fases, k)) lista.push(fases[k])
    }
    return lista
  }
  return []
}

/** Pacote Parte B completo: pacote.projetos_e_planos (objeto) ou chaves diretas. */
function blocoB(pacote) {
  if (ehObjeto(pacote.projetos_e_planos)) return pacote.projetos_e_planos
  return pacote
}

/**
 * 1.2 validarPacote(pacote): executa as 11 regras + bônus sobre o pacote em
 * memória. NUNCA persiste nada. Retorna:
 * { ok, parte: "A"|"B"|"AB", blocos: [...], erros: [{ codigo, mensagem, detalhe }] }
 * blocos traz o resultado por seção para exibição (status "ok" | "erro").
 */
function validarPacote(pacote) {
  var erros = []
  var blocos = []

  function marcar(nome, okRef, detalhe) {
    blocos.push({ nome: nome, status: okRef ? 'ok' : 'erro', detalhe: detalhe || '' })
  }

  function erro(codigo, mensagem, detalhe) {
    erros.push({ codigo: codigo, mensagem: mensagem, detalhe: detalhe || '' })
  }

  if (!ehObjeto(pacote)) {
    return {
      ok: false,
      parte: '',
      blocos: [],
      erros: [
        {
          codigo: CODIGOS.JSON_INVALIDO,
          mensagem: 'Pacote precisa ser um objeto JSON.',
          detalhe: '',
        },
      ],
    }
  }

  var parteDetectada = detectarParte(pacote)
  if (parteDetectada.erro) {
    return {
      ok: false,
      parte: '',
      blocos: blocos,
      erros: [parteDetectada.erro],
    }
  }
  var parte = parteDetectada.parte
  var contemB = parte === 'B' || parte === 'AB'
  var bb = blocoB(pacote)

  // ---------- R1 — schema_versao ----------
  var r1 = String(pacote.schema_versao || '') === '2.0'
  marcar(
    'R1 schema_versao 2.0',
    r1,
    'schema_versao informado: ' + String(pacote.schema_versao || '(ausente)'),
  )
  if (!r1)
    erro(
      CODIGOS.SCHEMA,
      'schema_versao deve ser exatamente "2.0".',
      String(pacote.schema_versao || '(ausente)'),
    )

  // ---------- R2 — 13 fases P1..P13 com status (apenas Parte A/AB) ----------
  if (parte === 'A' || parte === 'AB') {
    var fases = normalizarFases(pacote.conteudo_fases.fases || pacote.conteudo_fases.fases_p1_p13)
    var fasesOk = 0
    for (var f = 0; f < fases.length; f++) {
      var fase = fases[f]
      var idFase = ehObjeto(fase) ? String(fase.fase || fase.prompt_id || fase.id || '') : ''
      if (/^P(1[0-3]|[1-9])$/.test(idFase) && fase.status) fasesOk++
    }
    var r2 = fasesOk === 13
    marcar(
      'R2 13 fases P1..P13 com status (' + fasesOk + '/13)',
      r2,
      'fases com status válidos: ' + fasesOk,
    )
    if (!r2)
      erro(
        CODIGOS.FASES,
        'O pacote deve conter as 13 fases P1..P13, cada uma com status.',
        fasesOk + '/13 fases válidas',
      )
  }

  // ---------- R3 — DRE com exatamente 15 linhas, todas com "fonte" ----------
  if (parte === 'A' || parte === 'AB') {
    var dre = primeiraChave(pacote.conteudo_fases, ['dre', 'dre_15_linhas', 'demonstrativo_dre'])
    var linhasDre = Array.isArray(dre)
      ? dre
      : ehObjeto(dre)
        ? primeiraChave(dre, ['linhas', 'itens'])
        : null
    if (!linhasDre && Array.isArray(pacote.dre_15_linhas)) linhasDre = pacote.dre_15_linhas
    var contadas = linhasDre ? linhasDre.length : 0
    var todasComFonte = contadas > 0
    for (var d = 0; d < contadas; d++) {
      var linha = linhasDre[d]
      var fonte = ehObjeto(linha)
        ? primeiraChave(linha, ['fonte', 'fonte_ou_nota', 'fonte_dado'])
        : null
      if (fonte === null || String(fonte).trim() === '') {
        todasComFonte = false
        break
      }
    }
    var r3 = contadas === 15 && todasComFonte
    marcar(
      'R3 DRE 15 linhas com fonte (' + contadas + '/15)',
      r3,
      'linhas sem "fonte": ' + (todasComFonte ? '0' : '≥1'),
    )
    if (!r3)
      erro(
        CODIGOS.DRE,
        'A DRE deve ter exatamente 15 linhas, cada uma com o campo "fonte".',
        contadas + '/15 linhas',
      )
  }

  // ---------- R4 — EREC com as 4 seções (Eliminar/Reduzir/Elevar/Criar) ----------
  if (parte === 'A' || parte === 'AB') {
    var erec = primeiraChave(pacote.conteudo_fases, ['erec', 'matriz_erec', 'matriz_erec_a9'])
    var secoes = ['eliminar', 'reduzir', 'elevar', 'criar']
    var presentes = 0
    var vazias = []
    if (ehObjeto(erec)) {
      for (var s = 0; s < secoes.length; s++) {
        var secao = erec[secoes[s]]
        if (secao === undefined || secao === null) {
          vazias.push(secoes[s])
          continue
        }
        var temConteudo = Array.isArray(secao)
          ? secao.length > 0
          : ehObjeto(secao)
            ? Object.keys(secao).length > 0
            : String(secao).trim() !== ''
        if (temConteudo) presentes++
        else vazias.push(secoes[s])
      }
    }
    var r4 = presentes === 4
    marcar(
      'R4 EREC 4 seções (' + presentes + '/4)',
      r4,
      vazias.length ? 'seções ausentes/vazias: ' + vazias.join(', ') : '',
    )
    if (!r4)
      erro(
        CODIGOS.EREC,
        'A matriz EREC deve ter as 4 seções: Eliminar, Reduzir, Elevar e Criar.',
        vazias.join(', '),
      )
  }

  // ---------- R5 — gabarito_a8 com 7 OU 8 indicadores ----------
  if (parte === 'A' || parte === 'AB') {
    var gabarito = primeiraChave(pacote.conteudo_fases, [
      'gabarito_a8',
      'gabaritoA8',
      'a8_gabarito',
    ])
    var indicadores = null
    if (Array.isArray(gabarito)) indicadores = gabarito
    else if (ehObjeto(gabarito)) {
      indicadores = primeiraChave(gabarito, ['indicadores', 'linhas', 'itens'])
      if (!indicadores) {
        var chaves = Object.keys(gabarito)
        if (chaves.length >= 7 && chaves.length <= 8) indicadores = chaves
      }
    }
    var qtdGab = indicadores ? indicadores.length : 0
    var r5 = qtdGab === 7 || qtdGab === 8
    marcar(
      'R5 gabarito_a8 7 OU 8 indicadores (' + qtdGab + ')',
      r5,
      'indicadores contados: ' + qtdGab,
    )
    if (!r5)
      erro(
        CODIGOS.GABARITO,
        'O gabarito A8 deve ter 7 OU 8 indicadores (≤6 e ≥9 são inválidos).',
        qtdGab + ' indicadores',
      )
  }

  // ---------- R6 — nao_trafega com 4 itens = true ----------
  if (parte === 'A' || parte === 'AB') {
    var naoTrafega = primeiraChave(pacote.conteudo_fases, ['nao_trafega', 'naoTrafega'])
    var itens = null
    if (Array.isArray(naoTrafega)) itens = naoTrafega
    else if (ehObjeto(naoTrafega)) itens = primeiraChave(naoTrafega, ['itens', 'lista'])
    var qtdTrue = 0
    if (Array.isArray(itens)) {
      for (var n = 0; n < itens.length; n++) {
        if (itens[n] === true) qtdTrue++
      }
    } else if (ehObjeto(itens)) {
      var chavesIt = Object.keys(itens)
      for (var n2 = 0; n2 < chavesIt.length; n2++) {
        if (itens[chavesIt[n2]] === true) qtdTrue++
      }
    }
    var r6 = qtdTrue === 4
    marcar('R6 nao_trafega 4 itens = true (' + qtdTrue + '/4)', r6, 'itens true: ' + qtdTrue)
    if (!r6)
      erro(
        CODIGOS.NAOTRAFEGA,
        'nao_trafega deve ter exatamente 4 itens, todos = true.',
        qtdTrue + '/4 itens true',
      )
  }

  // ---------- R7 — exatamente 6 projetos (Parte B/AB) ----------
  var projetos = contemB ? bb.projetos : null
  var qtdPrj = Array.isArray(projetos) ? projetos.length : 0
  var r7 = qtdPrj === 6
  marcar('R7 exatamente 6 projetos (' + qtdPrj + '/6)', r7, 'projetos contados: ' + qtdPrj)
  if (!r7) erro(CODIGOS.PRJ, 'O pacote deve conter exatamente 6 projetos.', qtdPrj + '/6 projetos')

  // ---------- R8 — exatamente 12 planos_acao ----------
  var planos = contemB ? primeiraChave(bb, ['planos_acao', 'planos_de_acao', 'planos']) : null
  var qtdPac = Array.isArray(planos) ? planos.length : 0
  var r8 = qtdPac === 12
  marcar('R8 exatamente 12 planos_acao (' + qtdPac + '/12)', r8, 'planos contados: ' + qtdPac)
  if (!r8)
    erro(CODIGOS.PAC, 'O pacote deve conter exatamente 12 planos de ação.', qtdPac + '/12 planos')

  // ---------- R9 — soma das etapas === 116 ----------
  var somaEtapas = 0
  if (Array.isArray(planos)) {
    for (var p = 0; p < planos.length; p++) somaEtapas += coletarEtapas(planos[p]).length
  }
  var r9 = somaEtapas === 116
  marcar('R9 soma das etapas === 116 (' + somaEtapas + '/116)', r9, 'etapas somadas: ' + somaEtapas)
  if (!r9)
    erro(
      CODIGOS.ETAPAS,
      'A soma das etapas dos 12 planos deve ser exatamente 116.',
      String(somaEtapas),
    )

  // ---------- R10 — 5W2H completo em toda etapa ----------
  var r10 = true
  var primeiraFalha = ''
  if (!Array.isArray(planos) || planos.length === 0) {
    r10 = false
    primeiraFalha = 'nenhum plano para verificar'
  }
  for (var p2 = 0; r10 && p2 < planos.length; p2++) {
    var etapasPlano = coletarEtapas(planos[p2])
    if (etapasPlano.length === 0) {
      r10 = false
      primeiraFalha =
        'plano ' +
        ((planos[p2] && (planos[p2].plano_id || planos[p2].id)) || p2 + 1) +
        ' sem etapas'
      break
    }
    for (var t = 0; t < etapasPlano.length; t++) {
      if (!etapaTem5W2H(etapasPlano[t])) {
        r10 = false
        primeiraFalha =
          'plano ' +
          ((planos[p2] && (planos[p2].plano_id || planos[p2].id)) || p2 + 1) +
          ', etapa ' +
          (t + 1)
        break
      }
    }
  }
  marcar(
    'R10 5W2H completo nas etapas',
    r10,
    primeiraFalha ? 'primeira falha: ' + primeiraFalha : '',
  )
  if (!r10)
    erro(
      CODIGOS.W2H,
      'Toda etapa deve ter as 7 dimensões 5W2H preenchidas ("quanto" aceita "[REQUER VERIFICAÇÃO...").',
      primeiraFalha,
    )

  // ---------- R11 — FKs válidas (PRJ→OE, PAC→PRJ, OKR→PRJ) ----------
  var idsOE = {}
  var idsPRJ = {}
  var motivosFk = []
  var objetivos = contemB ? primeiraChave(bb, ['objetivos_estrategicos', 'objetivos']) : null
  var okrs = contemB ? primeiraChave(bb, ['okrs', 'okrs_v2']) : null
  if (Array.isArray(objetivos)) {
    for (var o = 0; o < objetivos.length; o++) {
      var oe = objetivos[o]
      if (ehObjeto(oe) && oe.objetivo_id) idsOE[String(oe.objetivo_id)] = true
    }
  }
  if (Array.isArray(projetos)) {
    for (var pr = 0; pr < projetos.length; pr++) {
      var prj = projetos[pr]
      if (!ehObjeto(prj)) continue
      var pid = String(prj.projeto_id || prj.id || '')
      if (pid) idsPRJ[pid] = true
      var oeRef = String(prj.objetivo_estrategico_id || prj.objetivo_id_ref || '')
      if (oeRef && !idsOE[oeRef])
        motivosFk.push('Projeto ' + (pid || pr) + ' referencia OE inexistente: ' + oeRef)
    }
  }
  if (Array.isArray(planos)) {
    for (var pa = 0; pa < planos.length; pa++) {
      var plano = planos[pa]
      if (!ehObjeto(plano)) continue
      var prjRef = String(plano.projeto_id || '')
      if (prjRef && !idsPRJ[prjRef])
        motivosFk.push(
          'Plano ' +
            String(plano.plano_id || plano.id || pa) +
            ' referencia projeto inexistente: ' +
            prjRef,
        )
    }
  }
  if (Array.isArray(okrs)) {
    for (var ok = 0; ok < okrs.length; ok++) {
      var okr = okrs[ok]
      if (!ehObjeto(okr)) continue
      var prjRef2 = String(okr.projeto_id || '')
      if (prjRef2 && !idsPRJ[prjRef2])
        motivosFk.push(
          'OKR ' +
            String(okr.okr_id || okr.id || ok) +
            ' referencia projeto inexistente: ' +
            prjRef2,
        )
    }
  }
  var r11 = motivosFk.length === 0
  marcar('R11 FKs válidas (PRJ→OE, PAC→PRJ, OKR→PRJ)', r11, motivosFk.length ? motivosFk[0] : '')
  if (!r11)
    erro(
      CODIGOS.FK,
      'Violação de chave estrangeira: PRJ→OE, PAC→PRJ ou OKR→PRJ.',
      motivosFk.join('; '),
    )

  // ---------- Bônus — desdobramento: 7 OKRs, 7 linhas Hoshin, 5 rituais ----------
  var hoshin = contemB ? primeiraChave(bb, ['matriz_hoshin', 'hoshin']) : null
  var rituais = contemB ? primeiraChave(bb, ['rituais', 'rituais_operacionais']) : null
  var motivosBonus = []
  var qtdOkrs = Array.isArray(okrs) ? okrs.length : 0
  var qtdHoshin = Array.isArray(hoshin) ? hoshin.length : 0
  var qtdRituais = Array.isArray(rituais) ? rituais.length : 0
  if (qtdOkrs !== 7) motivosBonus.push('OKRs: ' + qtdOkrs + '/7')
  if (qtdHoshin !== 7) motivosBonus.push('Hoshin: ' + qtdHoshin + '/7')
  if (qtdRituais !== 5) motivosBonus.push('Rituais: ' + qtdRituais + '/5')
  var bonusOk = motivosBonus.length === 0
  marcar('Bônus desdobramento (7 OKRs, 7 Hoshin, 5 rituais)', bonusOk, motivosBonus.join(', '))
  if (!bonusOk)
    erro(
      CODIGOS.DESDOBRAMENTO,
      'Desdobramento esperado: 7 OKRs, 7 linhas Hoshin e 5 rituais.',
      motivosBonus.join(', '),
    )

  return { ok: erros.length === 0, parte: parte, blocos: blocos, erros: erros }
}

/**
 * 1.3 propagarPacote(app, pacote, context): persiste nas collections com
 * upsert por ID estável (PRJ-01, PAC-01.1, OE1, OKR-OE1). Recebe o app como
 * parâmetro (nunca o global $app). Retorna
 * { ok, contagem: { prj, pac, etapas, okrs, hoshin, rituais } }.
 *
 * context: { pacote_id (relation pacotes_v2), dossie_id, lead_id, importado_por }
 */
function propagarPacote(app, pacote, context) {
  var ctx = context || {}
  var pacoteRecId = ctx.pacote_id || ''
  var dossieId = ctx.dossie_id || ''
  var contagem = { prj: 0, pac: 0, etapas: 0, okrs: 0, hoshin: 0, rituais: 0 }

  function marcarComuns(reg) {
    reg.set('schema_versao', '2.0')
    if (pacoteRecId) reg.set('pacote', pacoteRecId)
    if (dossieId) reg.set('dossie_id', dossieId)
  }

  /** Upsert por id estável: retorna o registro existente (update) ou null (create). */
  function buscarPorIdEstavel(collection, campoId, valorId) {
    try {
      return app.findFirstRecordByFilter(collection, campoId + ' = {:v}', { v: String(valorId) })
    } catch (_) {
      return null
    }
  }

  /** Grava (upsert) um registro derivado do pacote, por id estável. */
  function upsertDerivado(collection, campoId, dados) {
    var existente = buscarPorIdEstavel(collection, campoId, dados[campoId])
    var col = app.findCollectionByNameOrId(collection)
    var reg = existente || new Record(col)
    var chaves = Object.keys(dados)
    for (var i = 0; i < chaves.length; i++) {
      var k = chaves[i]
      if (k === campoId) continue
      reg.set(k, dados[k])
    }
    reg.set(campoId, dados[campoId])
    marcarComuns(reg)
    app.save(reg)
    return reg
  }

  var bb = blocoB(pacote)

  // ---------- objetivos_estrategicos ----------
  var objetivos = primeiraChave(bb, ['objetivos_estrategicos', 'objetivos']) || []
  if (Array.isArray(objetivos)) {
    for (var i = 0; i < objetivos.length; i++) {
      var oe = objetivos[i]
      if (!ehObjeto(oe) || !oe.objetivo_id) continue
      upsertDerivado('objetivos_estrategicos', 'objetivo_id', {
        objetivo_id: String(oe.objetivo_id),
        perspectiva_bsc: String(oe.perspectiva_bsc || oe.perspectiva || ''),
        descricao: String(oe.descricao || ''),
        ancora: String(oe.ancora || ''),
        indicadores: oe.indicadores || [],
      })
    }
  }

  // ---------- projetos ----------
  var projetos = bb.projetos || []
  if (Array.isArray(projetos)) {
    for (var p = 0; p < projetos.length; p++) {
      var prj = projetos[p]
      if (!ehObjeto(prj) || !prj.projeto_id) continue
      upsertDerivado('projetos', 'projeto_id', {
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
      })
      contagem.prj++
    }
  }

  // ---------- planos_acao_v2 + contagem de etapas ----------
  var planos = primeiraChave(bb, ['planos_acao', 'planos_de_acao', 'planos']) || []
  if (Array.isArray(planos)) {
    for (var a = 0; a < planos.length; a++) {
      var plano = planos[a]
      if (!ehObjeto(plano) || !plano.plano_id) continue
      upsertDerivado('planos_acao_v2', 'plano_id', {
        plano_id: String(plano.plano_id),
        projeto_id: String(plano.projeto_id || ''),
        objetivo_estrategico_id: String(plano.objetivo_estrategico_id || ''),
        plano_nome: String(plano.plano_nome || plano.nome || ''),
        sponsor: String(plano.sponsor || ''),
        escopo: String(plano.escopo || ''),
        objetivos: String(plano.objetivos || ''),
        melhorias_esperadas: plano.melhorias_esperadas || [],
        aplicacao_abrangencia: String(plano.aplicacao_abrangencia || ''),
        etapas: coletarEtapas(plano),
        fundamentacao: plano.fundamentacao || {},
      })
      contagem.pac++
      contagem.etapas += coletarEtapas(plano).length
    }
  }

  // ---------- okrs_v2 ----------
  var okrs = primeiraChave(bb, ['okrs', 'okrs_v2']) || []
  if (Array.isArray(okrs)) {
    for (var k = 0; k < okrs.length; k++) {
      var okr = okrs[k]
      if (!ehObjeto(okr) || !okr.okr_id) continue
      upsertDerivado('okrs_v2', 'okr_id', {
        okr_id: String(okr.okr_id),
        objetivo_estrategico_id: String(okr.objetivo_estrategico_id || ''),
        projeto_id: String(okr.projeto_id || ''),
        plano_id: String(okr.plano_id || ''),
        objetivo: String(okr.objetivo || ''),
        key_results: okr.key_results || [],
        prazo: String(okr.prazo || ''),
      })
      contagem.okrs++
    }
  }

  // ---------- matriz_hoshin ----------
  var hoshin = primeiraChave(bb, ['matriz_hoshin', 'hoshin']) || []
  if (Array.isArray(hoshin)) {
    for (var h = 0; h < hoshin.length; h++) {
      var linhaH = hoshin[h]
      if (!ehObjeto(linhaH)) continue
      var colHoshin = app.findCollectionByNameOrId('matriz_hoshin')
      var regH = new Record(colHoshin) // Hoshin não tem id estável: novas linhas por pacote
      regH.set('schema_versao', '2.0')
      regH.set('objetivo_estrategico_id', String(linhaH.objetivo_estrategico_id || ''))
      regH.set('area', String(linhaH.area || ''))
      regH.set('meta', String(linhaH.meta || ''))
      regH.set('responsavel', String(linhaH.responsavel || ''))
      regH.set('prazo', String(linhaH.prazo || ''))
      if (pacoteRecId) regH.set('pacote', pacoteRecId)
      if (dossieId) regH.set('dossie_id', dossieId)
      app.save(regH)
      contagem.hoshin++
    }
  }

  // ---------- rituais (bônus, sem collection própria — contados para o retorno) ----------
  var rituais = primeiraChave(bb, ['rituais', 'rituais_operacionais']) || []
  contagem.rituais = Array.isArray(rituais) ? rituais.length : 0

  return { ok: true, contagem: contagem }
}

module.exports = { extrairPacote, validarPacote, propagarPacote, CODIGOS }
