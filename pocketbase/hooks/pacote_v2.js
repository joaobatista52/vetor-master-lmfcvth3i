/// <reference path="../pb_data/types.d.ts" />

/**
 * PACOTE V2.0 — ROTAS DE VALIDAÇÃO E INGESTÃO (ADMIN/CONSULTOR)
 * Rota: POST /backend/v1/pacote-v2/validar
 * Rota: POST /backend/v1/pacote-v2/ingestar
 *
 * ETAPA E2-F — VALIDAÇÃO COM MAPEAMENTO CORRETO (esta rodada):
 * O validador antigo procurava campos V1 na raiz (fases, dre, erec,
 * gabarito_auditoria, projetos, planos_acao, okrs) que não existem no
 * Pacote V2.0 real (que usa conteudo_fases, artefatos_financeiros.*,
 * projetos_e_planos.*). Correções:
 *   1. ADAPTADOR DE CAMPOS (criarPacoteNormalizado): função PURA, trabalha
 *      sobre leitura (não clona nem muta o pacote original — as regras lêem
 *      caminhos aninhados dele). Mapeia origem → destino:
 *        conteudo_fases → fases
 *        artefatos_financeiros.dre_15_linhas → dre {linhas:[...]}
 *        artefatos_financeiros.erec_a9 → erec
 *        artefatos_financeiros.gabarito_a8 → gabarito_auditoria
 *        nao_trafega → nao_trafega (mantém)
 *        projetos_e_planos.projetos → projetos
 *        projetos_e_planos.planos_acao → planos_acao
 *        projetos_e_planos.okrs → okrs
 *        projetos_e_planos.matriz_hoshin → matriz_hoshin
 *        projetos_e_planos.rituais_desdobramento → rituais
 *      Campo de origem ausente → destino null; presente (mesmo vazio) →
 *      valor real. Mesma entrada → mesma saída, sem efeito colateral.
 *   2. PARTIÇÃO EXPLÍCITA DE REGRAS POR PARTE (tabela em código, abaixo):
 *        PARTE A  → R1, R2, R3, R4, R5, R6
 *        PARTE B  → R1, R7, R8, R9, R10, R11 + bônus
 *        PARTE AB → R1..R11 + bônus
 *      Parte não detectada (null) → validação NÃO roda (415 já existente).
 *   3. REGRAS AJUSTADAS AO COMANDO 0 V2.0:
 *      R2 = conteudo_fases com P1..P13 (status ∈ {completo,parcial,bloqueado});
 *      R3 = DRE 15–18 linhas de conta com "fonte" (mantém E2-C);
 *      R4 = EREC A9 com 4 seções canônicas (contagem informativa);
 *      R5 = gabarito A8 aceita 7 OU 8 indicadores (total_indicadores);
 *      (E2-G) R4/R5 leem estruturas NORMALIZADAS no adaptador:
 *        erec vem de .secoes (case-insensitive), itens_por_secao e
 *        total_itens reportados; contagem ≠ Aurora (4/5/5/6=20) não falha.
 *        gabarito conta .indicadores (array); falha só se ausente, vazio
 *        ou fora da faixa 7–8. Faixa dentro → sem aviso.
 *      R6 = nao_trafega com 4 booleanos true;
 *      R7/R8/R9/bônus (okrs/hoshin/rituais) = contagens INFORMATIVAS.
 *   4. MENSAGENS: cada erro/aviso carrega componente_validado (nome REAL
 *      V2.0 do campo), encontrado, esperado e status_regra
 *      (bloqueante | informativa). Códigos PACOTE_V2_* mantidos.
 *
 * CORREÇÃO DE SINTAXE (esta rodada): a tentativa anterior da E2-F (não
 * commitada) tinha o token solto "migrations" dentro de validarR9 da rota
 * /validar (linha ~698) — sintaxe inválida que impedia o hook inteiro de
 * carregar; por isso o validador antigo V1 continuava respondendo em
 * produção com 403/404/405/406/407/408/409/413. Corrigido.
 *
 * GARANTIAS E2-C/E2-E MANTIDAS (E2-E intacta — detecção em 4 níveis, 415/416):
 * (E2-G) EREC normalizado (.secoes case-insensitive) e gabarito contando
 * .indicadores; partição A ≠ B e detecção de parte NÃO alteradas.
 * 1. TODAS as respostas são JSON formatado — inclusive falha interna (500).
 * 2. Nenhuma regra lança throw (regraDefensiva converte exceção em erro).
 * 3. Detecção de parte em 4 níveis (E2-E) INTACTA — validada e não alterada.
 * 4. TODO o validador vive INLINE dentro de CADA callback: a JSVM executa
 *    callbacks em pools de VM separados e require() de módulo local falha
 *    ("Invalid module") — por isso nada é importado de pacote_v2_validacao.js.
 */

// ============================================================================
// ROTAS — cada callback é AUTOSSUFICIENTE (zero referências de topo).
// A TABELA DE PARTIÇÃO (E2-F 2.2) é declarada DENTRO de cada callback:
//   PARTE A  → ['R1','R2','R3','R4','R5','R6']
//   PARTE B  → ['R1','R7','R8','R9','R10','R11','BONUS']
//   PARTE AB → ['R1'..'R11','BONUS']
// ============================================================================

routerAdd('POST', '/backend/v1/pacote-v2/validar', (e) => {
  // --------------------- Constantes locais do callback ---------------------
  // TABELA DE PARTIÇÃO DE REGRAS POR PARTE (E2-F 2.2 — declarada em código)
  const PARTITION_TABLE = {
    A: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'],
    B: ['R1', 'R7', 'R8', 'R9', 'R10', 'R11', 'BONUS'],
    AB: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'BONUS'],
  }
  const CODIGOS = {
    JSON_INVALIDO: 'PACOTE_V2_JSON_INVALIDO_401',
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
    PARTE_INDETERMINADA: 'PACOTE_V2_PARTE_INDETERMINADA_415',
    PARTE_INCOERENTE: 'PACOTE_V2_PARTE_INCOERENTE_416',
    AVISO_DRE: 'PACOTE_V2_DRE_AVISO_404A',
  }
  const CODIGO_INTERNO = 'PACOTE_V2_ERRO_INTERNO_500'

  // Referências de contagem (Aurora) — INFORMATIVAS, não bloqueiam (E2-F 2.3)
  const REFERENCIA_CONTAGENS = {
    projetos: 6,
    planos_acao: 12,
    etapas: 116,
    okrs: 7,
    hoshin: 7,
    rituais: 5,
  }

  // --------------------- Helpers locais (defensivos) ----------------------

  function ehObjeto(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v)
  }

  function responder500(err, contexto) {
    const mensagem = err && err.message ? String(err.message) : String(err)
    try {
      console.error('[pacote_v2/validar] ' + contexto + ': ' + mensagem)
      if (err && err.stack) {
        console.error('[pacote_v2/validar] stack: ' + String(err.stack))
      }
    } catch (_) {}
    return e.json(500, {
      ok: false,
      codigo: CODIGO_INTERNO,
      mensagem: mensagem,
    })
  }

  function extrairJsonCorpo() {
    try {
      const info = e.requestInfo ? e.requestInfo() : {}
      const raw = (info && info.body) || {}
      if (typeof raw === 'string') {
        return JSON.parse(raw)
      }
      return raw
    } catch (_) {
      return null
    }
  }

  // Extrai o primeiro objeto JSON embutido em texto (com ou sem texto ao redor)
  function extrairJsonDeTexto(texto) {
    const trimmed = (texto || '').trim()
    if (!trimmed) return null
    try {
      return JSON.parse(trimmed)
    } catch (_) {
      // continua: procura objeto embutido balanceado
    }
    const start = trimmed.indexOf('{')
    if (start === -1) return null
    let depth = 0
    let inString = false
    let escaped = false
    for (let i = start; i < trimmed.length; i++) {
      const ch = trimmed.charAt(i)
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === '"') inString = !inString
      if (inString) continue
      if (ch === '{') depth++
      if (ch === '}') {
        depth--
        if (depth === 0) {
          const candidate = trimmed.slice(start, i + 1)
          try {
            return JSON.parse(candidate)
          } catch (_) {
            // continua procurando outro início
          }
        }
      }
    }
    return null
  }

  // ---------------- E2-F — formatadores de erro/aviso (modo auditoria) ----

  // Descritor compacto do valor encontrado (nunca vaza o objeto inteiro)
  function descriptorDe(v) {
    if (v === undefined || v === null) return null
    if (Array.isArray(v)) return 'array (' + v.length + ' itens)'
    if (typeof v === 'object') return 'objeto (' + Object.keys(v).length + ' chaves)'
    return String(v)
  }

  function erro(codigo, componente, encontrado, esperado, mensagem, extra) {
    const item = {
      codigo: codigo,
      mensagem: mensagem,
      componente_validado: componente,
      status_regra: 'bloqueante',
    }
    item.detalhe = { encontrado: encontrado === undefined ? null : encontrado, esperado: esperado }
    if (extra) {
      for (const k in extra) item.detalhe[k] = extra[k]
    }
    return item
  }

  function aviso(codigo, componente, encontrado, esperado, mensagem, extra) {
    const item = erro(codigo, componente, encontrado, esperado, mensagem, extra)
    item.status_regra = 'informativa'
    return item
  }

  function regraDefensiva(nomeRegra, fn) {
    try {
      return fn()
    } catch (err) {
      // Nunca propaga: converte qualquer exceção de regra em erro formatado
      return {
        ok: false,
        erros: [
          {
            codigo: CODIGO_INTERNO,
            mensagem:
              'Regra ' +
              nomeRegra +
              ' falhou inesperadamente: ' +
              String(err && err.message ? err.message : err),
            componente_validado: nomeRegra,
            status_regra: 'bloqueante',
            detalhe: { encontrado: null, esperado: null },
          },
        ],
        avisos: [],
        contagens: null,
      }
    }
  }

  // ---------------- E2-F — ADAPTADOR DE CAMPOS (V2.0 → normalizado) -------
  /**
   * Função PURA: recebe o objeto raiz do pacote e devolve um leitor com os
   * nomes que as 11 regras conhecem. NÃO muta nem clona o pacote original —
   * apenas lê caminhos aninhados dele. Mesma entrada → mesma saída.
   * Origem ausente → destino null; origem presente (mesmo vazia) → valor real.
   *
   * E2-G — NORMALIZAÇÃO DO EREC (R4) E DO GABARITO (R5) no adaptador:
   *   erec: se existir .secoes, usa .secoes como fonte (JSON real da Aurora
   *     coloca as 4 seções lá, capitalizadas); senão usa o próprio EREC.
   *     As 4 chaves são procuradas CASE-INSENSITIVE ("Eliminar"/"eliminar").
   *     Saída normalizada: { eliminar:[], reduzir:[], elevar:[], criar:[],
   *     _erec_meta: { secoes_encontradas, itens_por_secao, total_itens } }.
   *     Itens preservados como estão.
   *   gabarito_auditoria: se o objeto tiver .indicadores (array), esse é o
   *     array de indicadores; se NÃO tiver (array cru), é tratado como
   *     array direto (compatibilidade). _gabarito_meta carrega
   *     total_indicadores (do ARRAY, não das chaves do objeto pai),
   *     faixa_aceita ("7-8") e nomes_dos_indicadores.
   *     Ausente → null (e meta = null), como antes.
   */
  function normalizarErec(erec) {
    if (!ehObjeto(erec)) return { norm: null, meta: null }
    const fonte = ehObjeto(erec.secoes) ? erec.secoes : erec
    const mapa = {}
    const chaves = Object.keys(fonte)
    for (let i = 0; i < chaves.length; i++) {
      mapa[String(chaves[i]).trim().toLowerCase()] = fonte[chaves[i]]
    }
    const secoes = ['eliminar', 'reduzir', 'elevar', 'criar']
    const secoesEncontradas = []
    const itensPorSecao = {}
    const norm = {}
    let totalItens = 0
    for (let i = 0; i < secoes.length; i++) {
      const s = secoes[i]
      const v = mapa[s]
      if (v === undefined) continue
      secoesEncontradas.push(s)
      const itens = Array.isArray(v) ? v : ehObjeto(v) ? Object.keys(v).length : []
      const n = Array.isArray(itens) ? itens.length : itens
      itensPorSecao[s] = n
      totalItens += n
      norm[s] = Array.isArray(v) ? v : ehObjeto(v) ? v : []
    }
    return {
      norm: norm,
      meta: {
        secoes_encontradas: secoesEncontradas,
        itens_por_secao: itensPorSecao,
        total_itens: totalItens,
      },
    }
  }

  function normalizarGabarito(g) {
    if (!ehObjeto(g) && !Array.isArray(g)) return { norm: null, meta: null }
    const indicadores = Array.isArray(g) ? g : Array.isArray(g.indicadores) ? g.indicadores : null
    const meta = {
      total_indicadores: indicadores ? indicadores.length : 0,
      faixa_aceita: '7-8',
      nomes_dos_indicadores: [],
    }
    if (indicadores) {
      const nomes = []
      for (let i = 0; i < indicadores.length; i++) {
        const it = indicadores[i]
        nomes.push(
          ehObjeto(it) && it.nome
            ? String(it.nome)
            : ehObjeto(it) && it.indicador
              ? String(it.indicador)
              : ehObjeto(it) && it.titulo
                ? String(it.titulo)
                : 'indicador ' + (i + 1),
        )
      }
      meta.nomes_dos_indicadores = nomes
    }
    return { norm: g, meta: meta }
  }

  function criarPacoteNormalizado(pacote) {
    const raiz = ehObjeto(pacote) ? pacote : null
    const af = raiz && ehObjeto(raiz.artefatos_financeiros) ? raiz.artefatos_financeiros : null
    const pep = raiz && ehObjeto(raiz.projetos_e_planos) ? raiz.projetos_e_planos : null

    function pegar(v) {
      return v === undefined ? null : v
    }

    // DRE: array cru → { linhas: [...] }; objeto com .linhas → mantém;
    // objeto sem .linhas → { linhas: [] } (presente mas sem linhas).
    function wrapDre(v) {
      if (v === undefined) return null
      if (Array.isArray(v)) return { linhas: v }
      if (ehObjeto(v)) {
        if (Array.isArray(v.linhas)) return v
        return { linhas: [] }
      }
      return v
    }

    const erecNorm = normalizarErec(af ? af.erec_a9 : undefined)
    const gabNorm = normalizarGabarito(af ? af.gabarito_a8 : undefined)

    return {
      original: pacote,
      norm: {
        fases: pegar(raiz ? raiz.conteudo_fases : undefined),
        dre: wrapDre(af ? af.dre_15_linhas : undefined),
        erec: erecNorm.norm,
        erec_meta: erecNorm.meta,
        gabarito_auditoria: gabNorm.norm,
        gabarito_meta: gabNorm.meta,
        nao_trafega: pegar(raiz ? raiz.nao_trafega : undefined),
        projetos: pegar(pep ? pep.projetos : undefined),
        planos_acao: pegar(pep ? pep.planos_acao : undefined),
        okrs: pegar(pep ? pep.okrs : undefined),
        matriz_hoshin: pegar(pep ? pep.matriz_hoshin : undefined),
        rituais: pegar(pep ? pep.rituais_desdobramento : undefined),
        // E2-I: objetivos_estrategicos vive DENTRO de projetos_e_planos no
        // JSON real da Aurora; fallback para a raiz (V1) por compatibilidade.
        objetivos_estrategicos:
          pegar(pep ? pep.objetivos_estrategicos : undefined) ||
          pegar(raiz ? raiz.objetivos_estrategicos : undefined) ||
          [],
      },
    }
  }

  // Contagens encontradas (informativas) para o resumo da resposta
  function contagensNorm(norm) {
    let etapas = 0
    if (Array.isArray(norm.planos_acao)) {
      for (let i = 0; i < norm.planos_acao.length; i++) {
        const p = norm.planos_acao[i]
        if (p && Array.isArray(p.etapas)) etapas += p.etapas.length
      }
    }
    return {
      fases: ehObjeto(norm.fases) ? Object.keys(norm.fases).length : 0,
      projetos: Array.isArray(norm.projetos) ? norm.projetos.length : 0,
      planos_acao: Array.isArray(norm.planos_acao) ? norm.planos_acao.length : 0,
      etapas: etapas,
      okrs: Array.isArray(norm.okrs) ? norm.okrs.length : 0,
      hoshin: Array.isArray(norm.matriz_hoshin)
        ? norm.matriz_hoshin.length
        : ehObjeto(norm.matriz_hoshin)
          ? Object.keys(norm.matriz_hoshin).length
          : 0,
      rituais: Array.isArray(norm.rituais) ? norm.rituais.length : 0,
    }
  }

  // ------------------- Regras (E2-F — leitura do pacote NORMALIZADO) ------

  // R1 — schema_versao + dossie_id (estrutural, bloqueante; roda em A, B e AB)
  function validarR1(pacote, erros) {
    const sv = typeof pacote.schema_versao === 'string' ? pacote.schema_versao.trim() : ''
    if (!sv) {
      erros.push(
        erro(
          CODIGOS.SCHEMA,
          'schema_versao',
          null,
          'string iniciada por "2." (ex.: 2.0)',
          'Campo obrigatório ausente: schema_versao.',
        ),
      )
    } else if (!/^2\./.test(sv)) {
      erros.push(
        erro(
          CODIGOS.SCHEMA,
          'schema_versao',
          sv,
          'string iniciada por "2." (ex.: 2.0)',
          'schema_versao fora do padrão do Pacote V2.0.',
        ),
      )
    }
    const did = typeof pacote.dossie_id === 'string' ? pacote.dossie_id.trim() : ''
    if (!did) {
      erros.push(
        erro(
          CODIGOS.SCHEMA,
          'dossie_id',
          null,
          'string não vazia',
          'Campo obrigatório ausente: dossie_id.',
        ),
      )
    }
  }

  // R2 — conteudo_fases: objeto com P1..P13, status ∈ {completo,parcial,bloqueado}
  function validarR2(norm, erros) {
    const fases = norm.fases
    if (!ehObjeto(fases)) {
      erros.push(
        erro(
          CODIGOS.FASES,
          'conteudo_fases',
          descriptorDe(fases),
          'objeto com fases P1..P13',
          'Bloco "conteudo_fases" ausente ou inválido (esperado objeto com P1..P13).',
        ),
      )
      return
    }
    const faltando = []
    for (let i = 1; i <= 13; i++) {
      if (!ehObjeto(fases['P' + i])) faltando.push('P' + i)
    }
    if (faltando.length > 0) {
      erros.push(
        erro(
          CODIGOS.FASES,
          'conteudo_fases',
          'faltando: ' + faltando.join(', '),
          '13 fases P1..P13, cada uma objeto',
          'Bloco "conteudo_fases" incompleto: fases ausentes ou não-objeto.',
        ),
      )
    }
    const statusInvalidos = []
    const chaves = Object.keys(fases)
    for (let i = 0; i < chaves.length; i++) {
      const f = fases[chaves[i]]
      if (!ehObjeto(f)) continue
      const st = typeof f.status === 'string' ? f.status.trim().toLowerCase() : ''
      if (st !== 'completo' && st !== 'parcial' && st !== 'bloqueado') {
        statusInvalidos.push(chaves[i] + '="' + st + '"')
      }
    }
    if (statusInvalidos.length > 0) {
      erros.push(
        erro(
          CODIGOS.FASES,
          'conteudo_fases',
          statusInvalidos.join(', '),
          'status de cada fase ∈ {completo, parcial, bloqueado}',
          'Fases com status ausente ou fora dos valores canônicos.',
        ),
      )
    }
  }

  // R3 — DRE (mantém E2-C): 15–18 linhas de conta com "fonte" em cada
  function validarR3(norm, erros, avisos) {
    const dre = norm.dre
    if (!ehObjeto(dre)) {
      erros.push(
        erro(
          CODIGOS.DRE,
          'artefatos_financeiros.dre_15_linhas',
          descriptorDe(dre),
          'objeto com array "linhas" (15 a 18 linhas de conta)',
          'Bloco DRE (dre_15_linhas) ausente ou inválido.',
        ),
      )
      return
    }
    const linhas = Array.isArray(dre.linhas) ? dre.linhas : []
    const linhasConta = []
    const linhasIgnoradas = []
    for (let i = 0; i < linhas.length; i++) {
      const l = linhas[i]
      if (!ehObjeto(l)) continue
      const rotulo = String(l.linha || l.rotulo || l.conta || l.nome || '').trim()
      if (!rotulo) continue
      const ehSubtotal =
        /^(=|\(-\)|\(\+\)|\(\+\/-\)|subtotal|total|demonstração)/i.test(rotulo) ||
        /^receita\s+bruta$|^receita\s+l[íi]quida$|^margem\s+bruta$|^margem\s+de\s+contribui[çc][ãa]o$|^ebitda$|^ebit\b|^lucro\s+l[íi]quido$|^ebt\b/i.test(
          rotulo,
        )
      if (ehSubtotal) {
        linhasIgnoradas.push(rotulo)
        continue
      }
      linhasConta.push(l)
    }
    const qtdConta = linhasConta.length
    if (qtdConta < 15 || qtdConta > 18) {
      erros.push(
        erro(
          CODIGOS.DRE,
          'artefatos_financeiros.dre_15_linhas',
          qtdConta,
          '15 a 18 linhas de conta (ignorando subtotais e cabeçalhos)',
          'DRE fora da faixa aceitável de LINHAS DE CONTA.',
          { ignoradas: linhasIgnoradas.length },
        ),
      )
    } else if (qtdConta !== 15) {
      avisos.push(
        aviso(
          CODIGOS.AVISO_DRE,
          'artefatos_financeiros.dre_15_linhas',
          qtdConta,
          15,
          'DRE com ' +
            qtdConta +
            ' linhas de conta (faixa 15–18 aceita com aviso; padrão canônico = 15).',
        ),
      )
    }
    const semFonte = []
    for (let i = 0; i < linhasConta.length; i++) {
      const f = linhasConta[i].fonte
      const temFonte = typeof f === 'string' ? f.trim().length > 0 : !!f
      if (!temFonte) {
        semFonte.push(linhasConta[i].linha || linhasConta[i].rotulo || 'linha ' + (i + 1))
      }
    }
    if (semFonte.length > 0) {
      erros.push(
        erro(
          CODIGOS.DRE,
          'artefatos_financeiros.dre_15_linhas',
          semFonte.length + ' linha(s) sem fonte',
          'todas as linhas de conta com "fonte"',
          'Linhas de conta da DRE sem o campo obrigatório "fonte".',
          { linhas: semFonte },
        ),
      )
    }
  }

  // R4 — EREC A9: normalizado (4 seções canônicas); contagem INFORMATIVA.
  // E2-G: norm.erec já vem da fonte .secoes (case-insensitive) com as 4
  // chaves minúsculas; faltando APÓS normalização é o único bloqueio de
  // estrutura. R4 só falha também se as 4 presentes estiverem VAZIAS.
  function validarR4(norm, erros, avisos) {
    const erec = norm.erec
    if (!ehObjeto(erec)) {
      erros.push(
        erro(
          CODIGOS.EREC,
          'artefatos_financeiros.erec_a9',
          descriptorDe(erec),
          'objeto com 4 seções canônicas (Eliminar, Reduzir, Elevar, Criar) [fonte .secoes aceita]',
          'Bloco EREC (erec_a9) ausente ou inválido.',
        ),
      )
      return
    }
    const meta = norm.erec_meta || { secoes_encontradas: [], itens_por_secao: {}, total_itens: 0 }
    const secoes = ['eliminar', 'reduzir', 'elevar', 'criar']
    const faltando = []
    const todasVazias = []
    for (let i = 0; i < secoes.length; i++) {
      const s = secoes[i]
      const v = erec[s]
      if (v === undefined || v === null) {
        faltando.push(s)
        continue
      }
      const n = Array.isArray(v) ? v.length : ehObjeto(v) ? Object.keys(v).length : 0
      if (n === 0) todasVazias.push(s)
    }
    if (faltando.length > 0) {
      erros.push(
        erro(
          CODIGOS.EREC,
          'artefatos_financeiros.erec_a9',
          'faltando seções após normalização: ' + faltando.join(', '),
          '4 seções canônicas (Eliminar, Reduzir, Elevar, Criar) em .secoes (case-insensitive)',
          'Bloco EREC sem as 4 seções canônicas.',
          {
            secoes_encontradas: meta.secoes_encontradas,
            itens_por_secao: JSON.stringify(meta.itens_por_secao),
            total_itens: meta.total_itens,
          },
        ),
      )
    } else if (todasVazias.length === 4) {
      erros.push(
        erro(
          CODIGOS.EREC,
          'artefatos_financeiros.erec_a9',
          'as 4 seções presentes mas todas vazias',
          'pelo menos um item em alguma seção do EREC',
          'Bloco EREC com as 4 seções canônicas todas vazias.',
          {
            secoes_encontradas: meta.secoes_encontradas,
            itens_por_secao: JSON.stringify(meta.itens_por_secao),
            total_itens: meta.total_itens,
          },
        ),
      )
    }
    // Contagem de itens é INFORMATIVA (Aurora = 20: 4+5+5+6) — divergência
    // da referência NÃO é falha (definido na E2-F).
    avisos.push(
      aviso(
        CODIGOS.EREC,
        'artefatos_financeiros.erec_a9',
        meta.total_itens + ' itens (' + meta.secoes_encontradas.join(' · ') + ')',
        'contagem informativa (referência Aurora = 20 itens: 4+5+5+6)',
        'Contagem de itens do EREC (informativa, não bloqueia).',
        { itens_por_secao: JSON.stringify(meta.itens_por_secao) },
      ),
    )
  }

  // R5 — gabarito A8: aceita 7 OU 8 indicadores (declara total_indicadores).
  // E2-G: norm.gabarito_meta.total_indicadores conta o ARRAY .indicadores
  // (não as chaves do objeto pai: titulo/indicadores/total_indicadores/
  // veredito = 4 era o erro antigo). Falha só se ausente, vazio ou fora
  // da faixa 7–8. Dentro da faixa → sem aviso.
  function validarR5(norm, erros) {
    const g = norm.gabarito_auditoria
    const meta = norm.gabarito_meta
    const total = meta && meta.total_indicadores !== undefined ? meta.total_indicadores : 0
    if (!ehObjeto(g) && !Array.isArray(g)) {
      erros.push(
        erro(
          CODIGOS.GABARITO,
          'artefatos_financeiros.gabarito_a8',
          descriptorDe(g),
          'objeto com array ".indicadores" (ou array direto) com 7 ou 8 indicadores',
          'Bloco gabarito_a8 (gabarito de auditoria) ausente ou inválido.',
          { total_indicadores: 0, faixa_aceita: '7-8' },
        ),
      )
      return
    }
    if (!meta || (!Array.isArray(g) && !(ehObjeto(g) && Array.isArray(g.indicadores)))) {
      // estrutura sem array de indicadores identificável
      erros.push(
        erro(
          CODIGOS.GABARITO,
          'artefatos_financeiros.gabarito_a8',
          typeof g,
          'array ".indicadores" presente e não vazio (ou array direto)',
          'Gabarito de auditoria (gabarito_a8) sem array ".indicadores" identificável.',
          { total_indicadores: total, faixa_aceita: '7-8' },
        ),
      )
      return
    }
    if (total < 1) {
      erros.push(
        erro(
          CODIGOS.GABARITO,
          'artefatos_financeiros.gabarito_a8',
          0,
          '7 ou 8 indicadores',
          'Gabarito de auditoria (gabarito_a8) com array ".indicadores" vazio.',
          { total_indicadores: 0, faixa_aceita: '7-8', nomes_dos_indicadores: [] },
        ),
      )
      return
    }
    if (total !== 7 && total !== 8) {
      erros.push(
        erro(
          CODIGOS.GABARITO,
          'artefatos_financeiros.gabarito_a8',
          total,
          '7 ou 8 indicadores (faixa aceita: 7-8)',
          'Gabarito de auditoria (gabarito_a8) com quantidade de indicadores inválida.',
          {
            total_indicadores: total,
            faixa_aceita: '7-8',
            nomes_dos_indicadores: meta.nomes_dos_indicadores,
          },
        ),
      )
    }
  }

  // R6 — nao_trafega: 4 booleanos = true (só Parte A)
  function validarR6(norm, erros) {
    const nt = norm.nao_trafega
    if (!ehObjeto(nt)) {
      erros.push(
        erro(
          CODIGOS.NAOTRAFEGA,
          'nao_trafega',
          descriptorDe(nt),
          'objeto com 4 booleanos true (prompts_sintese, regras_orquestracao, curadoria_base, raciocinio_interno)',
          'Bloco "nao_trafega" ausente ou inválido.',
        ),
      )
      return
    }
    const chaves = [
      'prompts_sintese',
      'regras_orquestracao',
      'curadoria_base',
      'raciocinio_interno',
    ]
    const falsos = []
    for (let i = 0; i < chaves.length; i++) {
      const v = nt[chaves[i]]
      if (v !== true) falsos.push(chaves[i] + '=' + (v === undefined ? 'ausente' : String(v)))
    }
    if (falsos.length > 0) {
      erros.push(
        erro(
          CODIGOS.NAOTRAFEGA,
          'nao_trafega',
          falsos.join(', '),
          'os 4 booleanos = true',
          'Bloco "nao_trafega" com sinalizações falsas ou ausentes.',
        ),
      )
    }
  }

  // R7 — projetos: array é ESTRUTURAL (bloqueante); contagem INFORMATIVA
  function validarR7(norm, erros, avisos) {
    const prj = norm.projetos
    if (!Array.isArray(prj)) {
      erros.push(
        erro(
          CODIGOS.PRJ,
          'projetos_e_planos.projetos',
          descriptorDe(prj),
          'array de projetos',
          'Bloco "projetos" ausente ou não é array.',
        ),
      )
      return
    }
    for (let i = 0; i < prj.length; i++) {
      const p = prj[i]
      if (!ehObjeto(p)) {
        erros.push(
          erro(
            CODIGOS.PRJ,
            'projetos_e_planos.projetos[' + i + ']',
            typeof p,
            'objeto com projeto_id e projeto_nome',
            'Projeto no índice ' + i + ' não é objeto.',
          ),
        )
        continue
      }
      const faltandoCampos = []
      if (!p.projeto_id) faltandoCampos.push('projeto_id')
      if (!p.projeto_nome) faltandoCampos.push('projeto_nome')
      if (faltandoCampos.length > 0) {
        erros.push(
          erro(
            CODIGOS.PRJ,
            'projetos_e_planos.projetos[' + i + ']',
            'faltando: ' + faltandoCampos.join(', '),
            'projeto_id + projeto_nome',
            'Projeto no índice ' + i + ' sem campos obrigatórios.',
          ),
        )
      }
    }
    if (prj.length !== REFERENCIA_CONTAGENS.projetos) {
      avisos.push(
        aviso(
          CODIGOS.PRJ,
          'projetos_e_planos.projetos',
          prj.length,
          REFERENCIA_CONTAGENS.projetos + ' (referência Aurora — informativo)',
          'Quantidade de projetos (contagem informativa, não bloqueia).',
        ),
      )
    }
  }

  // R8 — planos_acao: array é ESTRUTURAL (bloqueante); contagem INFORMATIVA.
  // E2-I: aceita pac_id OU plano_id (JSON real da Aurora usa plano_id).
  function validarR8(norm, erros, avisos) {
    const pac = norm.planos_acao
    if (!Array.isArray(pac)) {
      erros.push(
        erro(
          CODIGOS.PAC,
          'projetos_e_planos.planos_acao',
          descriptorDe(pac),
          'array de planos de ação',
          'Bloco "planos_acao" ausente ou não é array.',
        ),
      )
      return
    }
    for (let i = 0; i < pac.length; i++) {
      const p = pac[i]
      const idPlano = ehObjeto(p) ? p.pac_id || p.plano_id || null : null
      if (!idPlano) {
        erros.push(
          erro(
            CODIGOS.PAC,
            'projetos_e_planos.planos_acao[' + i + ']',
            ehObjeto(p) ? 'faltando: pac_id ou plano_id' : typeof p,
            'objeto com pac_id ou plano_id',
            'Plano de ação no índice ' + i + ' sem pac_id/plano_id ou não é objeto.',
            { nome_campo_procurado: 'pac_id ou plano_id', encontrado: 'ausente' },
          ),
        )
      }
    }
    if (pac.length !== REFERENCIA_CONTAGENS.planos_acao) {
      avisos.push(
        aviso(
          CODIGOS.PAC,
          'projetos_e_planos.planos_acao',
          pac.length,
          REFERENCIA_CONTAGENS.planos_acao + ' (referência Aurora — informativo)',
          'Quantidade de planos de ação (contagem informativa, não bloqueia).',
        ),
      )
    }
  }

  // R9 — soma de etapas: INFORMATIVA (reporta o total, não bloqueia)
  function validarR9(norm, avisos) {
    const pac = norm.planos_acao
    let totalEtapas = 0
    if (Array.isArray(pac)) {
      for (let i = 0; i < pac.length; i++) {
        const p = pac[i]
        if (p && Array.isArray(p.etapas)) totalEtapas += p.etapas.length
      }
    }
    if (totalEtapas !== REFERENCIA_CONTAGENS.etapas) {
      avisos.push(
        aviso(
          CODIGOS.ETAPAS,
          'projetos_e_planos.planos_acao[].etapas',
          totalEtapas,
          REFERENCIA_CONTAGENS.etapas + ' (referência Aurora — informativo)',
          'Total de etapas (soma dos planos de ação) — contagem informativa, não bloqueia.',
        ),
      )
    }
  }

  // R10 — 5W2H de cada etapa: ESTRUTURAL (bloqueante). Aceita chaves em PT
  // (o_que, por_que, onde, quem, quando, como, quanto) e o placeholder
  // "[REQUER VERIFICAÇÃO..." no campo quanto.
  function validarR10(norm, erros) {
    const pac = norm.planos_acao
    if (!Array.isArray(pac)) return
    const dimensoesPT = {
      o_que: 'what',
      por_que: 'why',
      onde: 'where',
      quem: 'who',
      quando: 'when',
      como: 'how',
      quanto: 'how_much',
    }
    const nomes = Object.keys(dimensoesPT)
    for (let i = 0; i < pac.length; i++) {
      const p = pac[i]
      const etapas = p && Array.isArray(p.etapas) ? p.etapas : []
      for (let j = 0; j < etapas.length; j++) {
        const et = etapas[j]
        if (!ehObjeto(et)) {
          erros.push(
            erro(
              CODIGOS.W2H,
              'projetos_e_planos.planos_acao[' + i + '].etapas[' + j + ']',
              typeof et,
              'objeto com 5W2H',
              'Etapa ' + j + ' do plano ' + i + ' não é objeto (5W2H inexistente).',
            ),
          )
          continue
        }
        const faltando = []
        for (let k = 0; k < nomes.length; k++) {
          const pt = nomes[k]
          let v = et[pt]
          if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
            v = et[dimensoesPT[pt]]
          }
          if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
            faltando.push(pt)
          }
        }
        if (faltando.length > 0) {
          erros.push(
            erro(
              CODIGOS.W2H,
              'projetos_e_planos.planos_acao[' + i + '].etapas[' + j + ']',
              'faltando: ' + faltando.join(', '),
              '7 dimensões 5W2H (o_que, por_que, onde, quem, quando, como, quanto)',
              'Etapa ' + j + ' do plano ' + i + ' com 5W2H incompleto.',
            ),
          )
        }
      }
    }
  }

  // R11 — FKs: objetivo_estrategico_id (projetos), projeto_id (planos, okrs)
  function validarR11(norm, pacote, erros) {
    const prj = Array.isArray(norm.projetos) ? norm.projetos : []
    const pac = Array.isArray(norm.planos_acao) ? norm.planos_acao : []
    const okrs = Array.isArray(norm.okrs) ? norm.okrs : []

    const idsProjetos = {}
    for (let i = 0; i < prj.length; i++) {
      const p = prj[i]
      if (ehObjeto(p) && p.projeto_id) idsProjetos[String(p.projeto_id)] = true
    }
    // E2-I: fonte = norm.objetivos_estrategicos (adaptador: pep ou raiz);
    // o item pode trazer objetivo_estrategico_id ou objetivo_id.
    const idsObjetivos = {}
    let temListaObjetivos = false
    const objetivos = norm.objetivos_estrategicos
    if (Array.isArray(objetivos) && objetivos.length > 0) {
      temListaObjetivos = true
      for (let i = 0; i < objetivos.length; i++) {
        const o = objetivos[i]
        const idObj = ehObjeto(o) ? o.objetivo_estrategico_id || o.objetivo_id : null
        if (idObj) idsObjetivos[String(idObj)] = true
      }
    }

    for (let i = 0; i < prj.length; i++) {
      const p = prj[i]
      if (!ehObjeto(p)) continue
      const fk = p.objetivo_estrategico_id
      if (fk === undefined || fk === null || String(fk).trim() === '') {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.projetos[' + i + '].objetivo_estrategico_id',
            null,
            'id de objetivo estratégico',
            'Projeto ' + i + ' sem objetivo_estrategico_id (FK).',
          ),
        )
        continue
      }
      if (temListaObjetivos && !idsObjetivos[String(fk)]) {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.projetos[' + i + '].objetivo_estrategico_id',
            String(fk),
            'id presente em objetivos_estrategicos',
            'FK objetivo_estrategico_id não encontrada na lista de objetivos.',
          ),
        )
      }
    }
    for (let i = 0; i < pac.length; i++) {
      const p = pac[i]
      if (!ehObjeto(p)) continue
      const fk = p.projeto_id
      if (fk === undefined || fk === null || String(fk).trim() === '') {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.planos_acao[' + i + '].projeto_id',
            null,
            'projeto_id existente',
            'Plano de ação ' + i + ' sem projeto_id (FK).',
          ),
        )
        continue
      }
      if (!idsProjetos[String(fk)]) {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.planos_acao[' + i + '].projeto_id',
            String(fk),
            'projeto_id existente em projetos_e_planos.projetos',
            'FK projeto_id do plano de ação não encontrada na lista de projetos.',
          ),
        )
      }
    }
    for (let i = 0; i < okrs.length; i++) {
      const o = okrs[i]
      if (!ehObjeto(o)) continue
      const fk = o.projeto_id
      if (fk === undefined || fk === null || String(fk).trim() === '') {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.okrs[' + i + '].projeto_id',
            null,
            'projeto_id existente',
            'OKR ' + i + ' sem projeto_id (FK).',
          ),
        )
        continue
      }
      if (!idsProjetos[String(fk)]) {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.okrs[' + i + '].projeto_id',
            String(fk),
            'projeto_id existente em projetos_e_planos.projetos',
            'FK projeto_id do OKR não encontrada na lista de projetos.',
          ),
        )
      }
    }
  }

  // Bônus — okrs/hoshin/rituais: contagens INFORMATIVAS (não bloqueiam)
  function validarBonus(norm, avisos) {
    const nOkrs = Array.isArray(norm.okrs) ? norm.okrs.length : null
    if (nOkrs !== REFERENCIA_CONTAGENS.okrs) {
      avisos.push(
        aviso(
          CODIGOS.DESDOBRAMENTO,
          'projetos_e_planos.okrs',
          nOkrs,
          REFERENCIA_CONTAGENS.okrs + ' (referência Aurora — informativo)',
          'Quantidade de OKRs (contagem informativa, não bloqueia).',
        ),
      )
    }
    // E2-I: matriz_hoshin pode vir como ARRAY (JSON real da Aurora, 7 itens)
    // ou objeto; contagem + tipo sempre INFORMATIVOS (não bloqueia).
    const hoshinTipo = Array.isArray(norm.matriz_hoshin)
      ? 'array'
      : ehObjeto(norm.matriz_hoshin)
        ? 'objeto'
        : 'ausente'
    const hoshinValor = Array.isArray(norm.matriz_hoshin)
      ? norm.matriz_hoshin.length
      : ehObjeto(norm.matriz_hoshin)
        ? Object.keys(norm.matriz_hoshin).length
        : null
    avisos.push(
      aviso(
        CODIGOS.DESDOBRAMENTO,
        'projetos_e_planos.matriz_hoshin',
        hoshinValor !== null ? hoshinValor + ' itens · tipo_detectado: ' + hoshinTipo : 'ausente',
        REFERENCIA_CONTAGENS.hoshin + ' objetivos (referência Aurora — informativo)',
        'Objetivos da Matriz Hoshin (contagem informativa, não bloqueia).',
        { tipo_detectado: hoshinTipo, itens_encontrados: hoshinValor },
      ),
    )
    const rituais = Array.isArray(norm.rituais) ? norm.rituais.length : null
    if (rituais !== REFERENCIA_CONTAGENS.rituais) {
      avisos.push(
        aviso(
          CODIGOS.DESDOBRAMENTO,
          'projetos_e_planos.rituais_desdobramento',
          rituais,
          REFERENCIA_CONTAGENS.rituais + ' (referência Aurora — informativo)',
          'Quantidade de rituais de desdobramento (contagem informativa, não bloqueia).',
        ),
      )
    }
  }

  // ---------- Composições por partição (tabela PARTITION_TABLE, topo) -----

  function validarParteA(pacote) {
    const erros = []
    const avisos = []
    if (!ehObjeto(pacote)) {
      erros.push(
        erro(
          CODIGOS.SCHEMA,
          'pacote',
          null,
          'objeto JSON',
          'Pacote ausente ou não é um objeto JSON válido.',
        ),
      )
      return { ok: false, erros: erros, avisos: avisos, contagens: null }
    }
    const norm = criarPacoteNormalizado(pacote).norm
    validarR1(pacote, erros) // PARTE A valida: R1
    validarR2(norm, erros) // R2 (conteudo_fases P1..P13)
    validarR3(norm, erros, avisos) // R3 (DRE 15 linhas)
    validarR4(norm, erros, avisos) // R4 (EREC A9, 4 seções)
    validarR5(norm, erros) // R5 (gabarito A8, 7 ou 8)
    validarR6(norm, erros) // R6 (nao_trafega, 4 true)
    return { ok: erros.length === 0, erros: erros, avisos: avisos, contagens: contagensNorm(norm) }
  }

  function validarParteB(pacote) {
    const erros = []
    const avisos = []
    if (!ehObjeto(pacote)) {
      erros.push(
        erro(
          CODIGOS.SCHEMA,
          'pacote',
          null,
          'objeto JSON',
          'Pacote ausente ou não é um objeto JSON válido.',
        ),
      )
      return { ok: false, erros: erros, avisos: avisos, contagens: null }
    }
    const norm = criarPacoteNormalizado(pacote).norm
    validarR1(pacote, erros) // PARTE B valida: R1
    validarR7(norm, erros, avisos) // R7 (projetos — estrutura bloqueante, contagem informativa)
    validarR8(norm, erros, avisos) // R8 (planos_acao — idem)
    validarR9(norm, avisos) // R9 (etapas — informativo)
    validarR10(norm, erros) // R10 (5W2H — bloqueante)
    validarR11(norm, pacote, erros) // R11 (FKs — bloqueante)
    validarBonus(norm, avisos) // bônus (okrs/hoshin/rituais — informativos)
    return { ok: erros.length === 0, erros: erros, avisos: avisos, contagens: contagensNorm(norm) }
  }

  // ---------- ETAPA E2-E: DETECÇÃO DE PARTE EM 4 NÍVEIS (INTACTA) ----------

  function statusBlocoObjeto(v) {
    if (v === null) return 'null'
    if (v === undefined) return 'ausente'
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0)
      return 'presente_não_vazio'
    if (typeof v === 'object') return 'presente_vazio'
    return 'presente'
  }

  function statusBlocoSimples(v) {
    if (v === null) return 'null'
    if (v === undefined) return 'ausente'
    return 'presente'
  }

  function temConteudo(v) {
    return !!v && typeof v === 'object' && Object.keys(v).length > 0
  }

  function analisarDeteccao(pacote) {
    const out = {
      parte: null,
      metodo: null,
      campo_parte: null,
      tem_fases: false,
      tem_planos: false,
    }
    if (!ehObjeto(pacote)) return out
    out.campo_parte =
      typeof pacote.parte === 'string' && pacote.parte.trim() ? pacote.parte.trim() : null
    out.tem_fases = temConteudo(pacote.conteudo_fases)
    out.tem_planos = temConteudo(pacote.projetos_e_planos)

    // NÍVEL 1 — campo "parte" explícito (tem prioridade sobre blocos)
    if (out.campo_parte) {
      if (out.campo_parte === 'A' || out.campo_parte === 'B' || out.campo_parte === 'AB') {
        out.parte = out.campo_parte
        out.metodo = 'campo_parte'
      } else {
        out.parte = null
        out.metodo = null
      }
      return out
    }

    // NÍVEL 2 — blocos de conteúdo ("projetos_e_planos": null conta como AUSENTE)
    if (out.tem_fases && !out.tem_planos) {
      out.parte = 'A'
      out.metodo = 'blocos_conteudo'
      return out
    }
    if (!out.tem_fases && out.tem_planos) {
      out.parte = 'B'
      out.metodo = 'blocos_conteudo'
      return out
    }
    if (out.tem_fases && out.tem_planos) {
      out.parte = 'AB'
      out.metodo = 'blocos_conteudo'
      return out
    }

    // NÍVEL 3 — chaves auxiliares (fallback)
    const auxA =
      temConteudo(pacote.artefatos_financeiros) ||
      temConteudo(pacote.fases) ||
      temConteudo(pacote.dre)
    const auxB =
      temConteudo(pacote.objetivos_estrategicos) ||
      temConteudo(pacote.projetos) ||
      temConteudo(pacote.planos_acao) ||
      temConteudo(pacote.okrs)
    if (auxA && !auxB) {
      out.parte = 'A'
      out.metodo = 'chaves_auxiliares'
      return out
    }
    if (auxB && !auxA) {
      out.parte = 'B'
      out.metodo = 'chaves_auxiliares'
      return out
    }
    if (auxA && auxB) {
      out.parte = 'AB'
      out.metodo = 'chaves_auxiliares'
      return out
    }

    // NÍVEL 4 — nada determinável → 415 (tratado pelo chamador)
    return out
  }

  // BLOCO 2 — campo "parte" declara uma coisa, blocos dizem outra → 416
  function mensagemIncoerencia(parte, deteccao) {
    if (deteccao.metodo !== 'campo_parte') return null
    if (parte === 'A' && !deteccao.tem_fases)
      return "Campo 'parte' indica A, mas 'conteudo_fases' não foi encontrado."
    if (parte === 'B' && !deteccao.tem_planos)
      return "Campo 'parte' indica B, mas 'projetos_e_planos' não está presente."
    return null
  }

  // --------------------------- Corpo da rota ----------------------------

  try {
    // 1. Autenticação e autorização (E0: admin OU consultor)
    const info = e.requestInfo ? e.requestInfo() : {}
    const auth = info.auth || null
    const papel = auth && typeof auth.getString === 'function' ? auth.getString('role') : null
    if (!auth || (papel !== 'admin' && papel !== 'consultor')) {
      return e.json(403, {
        ok: false,
        codigo: 'PACOTE_V2_SEM_PERMISSAO_403',
        mensagem: 'Acesso restrito a admin ou consultor.',
      })
    }

    // 2. Corpo — a tela envia { texto, lead_id }: extrai o JSON embutido
    const body = extrairJsonCorpo()
    if (!ehObjeto(body)) {
      return e.json(400, {
        ok: false,
        codigo: CODIGOS.JSON_INVALIDO,
        mensagem: 'Corpo da requisição ausente, inválido ou não é um objeto JSON.',
      })
    }

    let pacote = ehObjeto(body.pacote) ? body.pacote : null
    if (!pacote && typeof body.texto === 'string' && body.texto.trim()) {
      pacote = extrairJsonDeTexto(body.texto)
    }
    if (!pacote) pacote = body
    if (!ehObjeto(pacote)) {
      return e.json(400, {
        ok: false,
        codigo: CODIGOS.JSON_INVALIDO,
        mensagem: 'Não foi possível extrair um objeto JSON do conteúdo enviado.',
      })
    }

    // ETAPA E2-E — detecção em 4 níveis (INTACTA); null → 415, validação não roda
    const parteSolicitada =
      typeof body.parte === 'string' && body.parte.trim() ? body.parte.trim() : null
    const deteccao = analisarDeteccao(pacote)
    let parte = deteccao.parte
    let metodo = deteccao.metodo
    if (parteSolicitada) {
      if (parteSolicitada === 'A' || parteSolicitada === 'B' || parteSolicitada === 'AB') {
        parte = parteSolicitada
        metodo = 'campo_parte'
      } else {
        parte = null
        deteccao.valor_parte_invalido = parteSolicitada
      }
    }
    if (!parte) {
      // BLOCO 3 — 415 com diagnóstico completo
      return e.json(415, {
        ok: false,
        codigo: CODIGOS.PARTE_INDETERMINADA,
        mensagem: 'Não foi possível determinar a parte do pacote',
        chaves_encontradas: Object.keys(pacote),
        campo_parte: deteccao.valor_parte_invalido || deteccao.campo_parte || null,
        conteudo_fases: statusBlocoObjeto(pacote.conteudo_fases),
        projetos_e_planos: statusBlocoObjeto(pacote.projetos_e_planos),
        artefatos_financeiros: statusBlocoSimples(pacote.artefatos_financeiros),
      })
    }
    // BLOCO 2 — parte declarada mas bloco correspondente ausente → 416
    const msgIncoerente = mensagemIncoerencia(parte, deteccao)
    if (msgIncoerente) {
      return e.json(416, {
        ok: false,
        codigo: CODIGOS.PARTE_INCOERENTE,
        mensagem: msgIncoerente,
        chaves_encontradas: Object.keys(pacote),
        campo_parte: deteccao.campo_parte || parteSolicitada || null,
        parte_detectada: parte,
      })
    }

    // 3. Validação COM PARTIÇÃO (E2-F): só as regras da parte detectada
    const resultadoA = regraDefensiva('validarParteA', function () {
      return validarParteA(pacote)
    })
    const resultadoB = regraDefensiva('validarParteB', function () {
      return validarParteB(pacote)
    })

    const erros = []
    const avisos = []
    const blocos = []
    let contagens = null
    if (parte === 'A' || parte === 'AB') {
      for (let i = 0; i < (resultadoA.erros || []).length; i++) erros.push(resultadoA.erros[i])
      for (let i = 0; i < (resultadoA.avisos || []).length; i++) avisos.push(resultadoA.avisos[i])
      blocos.push({
        bloco: 'Parte A (R1–R6: fases P1..P13, DRE, EREC A9, gabarito A8, não-tráfega)',
        status: resultadoA.ok ? 'ok' : 'erro',
        erros: resultadoA.erros,
        avisos: resultadoA.avisos,
      })
      if (resultadoA.contagens) contagens = resultadoA.contagens
    }
    if (parte === 'B' || parte === 'AB') {
      for (let i = 0; i < (resultadoB.erros || []).length; i++) erros.push(resultadoB.erros[i])
      for (let i = 0; i < (resultadoB.avisos || []).length; i++) avisos.push(resultadoB.avisos[i])
      blocos.push({
        bloco:
          'Parte B (R1, R7–R11 + bônus: projetos, planos de ação, etapas/5W2H, FKs, okrs/hoshin/rituais)',
        status: resultadoB.ok ? 'ok' : 'erro',
        erros: resultadoB.erros,
        avisos: resultadoB.avisos,
      })
      if (resultadoB.contagens) contagens = resultadoB.contagens
    }

    return e.json(200, {
      ok: true,
      valido: erros.length === 0,
      parte: parte,
      parte_detectada: parte,
      metodo_deteccao: metodo || null,
      regras_aplicadas: PARTITION_TABLE[parte] || [],
      dossie_id: typeof pacote.dossie_id === 'string' ? pacote.dossie_id : '',
      contagens: contagens,
      blocos: blocos,
      erros: erros,
      avisos: avisos,
      dry_run: true,
      motivo: 'Validação somente leitura (não persiste).',
    })
  } catch (err) {
    return responder500(err, 'exceção não tratada')
  }
})

// ============================================================================
// ETAPA E2-E — SELFTEST (SÓ ADMIN; consultor NÃO; NÃO persiste nada)
// Executa 4 casos com estruturas mínimas mockadas e retorna SIM/NÃO por caso.
// ============================================================================
routerAdd('POST', '/backend/v1/pacote-v2/selftest', (e) => {
  try {
    const info = e.requestInfo ? e.requestInfo() : {}
    const auth = info.auth || null
    const papel = auth && typeof auth.getString === 'function' ? auth.getString('role') : null
    if (!auth || papel !== 'admin') {
      return e.json(403, {
        ok: false,
        codigo: 'PACOTE_V2_SEM_PERMISSAO_403',
        mensagem: 'Selftest restrito a admin (consultor não tem acesso).',
      })
    }

    // Detecção em 4 níveis — cópia inline idêntica às rotas acima (INTACTA)
    function ehObjeto(v) {
      return !!v && typeof v === 'object' && !Array.isArray(v)
    }
    function temConteudo(v) {
      return !!v && typeof v === 'object' && Object.keys(v).length > 0
    }
    function analisarDeteccao(pacote) {
      const out = { parte: null, metodo: null, tem_fases: false, tem_planos: false }
      if (!ehObjeto(pacote)) return out
      out.tem_fases = temConteudo(pacote.conteudo_fases)
      out.tem_planos = temConteudo(pacote.projetos_e_planos)
      const campoParte =
        typeof pacote.parte === 'string' && pacote.parte.trim() ? pacote.parte.trim() : null
      if (campoParte) {
        if (campoParte === 'A' || campoParte === 'B' || campoParte === 'AB') {
          out.parte = campoParte
          out.metodo = 'campo_parte'
        }
        return out
      }
      if (out.tem_fases && !out.tem_planos) {
        out.parte = 'A'
        out.metodo = 'blocos_conteudo'
        return out
      }
      if (!out.tem_fases && out.tem_planos) {
        out.parte = 'B'
        out.metodo = 'blocos_conteudo'
        return out
      }
      if (out.tem_fases && out.tem_planos) {
        out.parte = 'AB'
        out.metodo = 'blocos_conteudo'
        return out
      }
      const auxA =
        temConteudo(pacote.artefatos_financeiros) ||
        temConteudo(pacote.fases) ||
        temConteudo(pacote.dre)
      const auxB =
        temConteudo(pacote.objetivos_estrategicos) ||
        temConteudo(pacote.projetos) ||
        temConteudo(pacote.planos_acao) ||
        temConteudo(pacote.okrs)
      if (auxA && !auxB) {
        out.parte = 'A'
        out.metodo = 'chaves_auxiliares'
        return out
      }
      if (auxB && !auxA) {
        out.parte = 'B'
        out.metodo = 'chaves_auxiliares'
        return out
      }
      if (auxA && auxB) {
        out.parte = 'AB'
        out.metodo = 'chaves_auxiliares'
        return out
      }
      return out
    }

    const casos = [
      {
        id: 'T1',
        descricao: 'conteudo_fases presente, sem campo "parte" → detectar A',
        entrada: { schema_versao: '2.0', conteudo_fases: { P1: { status: 'completo' } } },
        esperado: 'A',
      },
      {
        id: 'T2',
        descricao: 'campo "parte"="B" com projetos_e_planos → detectar B',
        entrada: {
          schema_versao: '2.0',
          parte: 'B',
          projetos_e_planos: { projetos: [{ projeto_id: 'PRJ-01', projeto_nome: 'Mock' }] },
        },
        esperado: 'B',
      },
      {
        id: 'T3',
        descricao: 'conteudo_fases presente com projetos_e_planos null → detectar A (caso Aurora)',
        entrada: {
          schema_versao: '2.0',
          conteudo_fases: { P1: { status: 'completo' }, P7: { status: 'parcial' } },
          projetos_e_planos: null,
        },
        esperado: 'A',
      },
      {
        id: 'T4',
        descricao: 'nenhum bloco reconhecível → 415',
        entrada: { schema_versao: '2.0' },
        esperado: '415',
      },
    ]

    const resultados = []
    let passaram = 0
    for (let i = 0; i < casos.length; i++) {
      const c = casos[i]
      const det = analisarDeteccao(c.entrada)
      const detectado = det.parte ? det.parte : '415'
      const passou = detectado === c.esperado
      if (passou) passaram++
      resultados.push({
        caso: c.id,
        descricao: c.descricao,
        esperado: c.esperado,
        detectado: detectado,
        metodo: det.parte ? det.metodo : null,
        resultado: passou ? 'SIM' : 'NÃO',
      })
    }

    return e.json(200, {
      ok: true,
      total: casos.length,
      passaram: passaram,
      falharam: casos.length - passaram,
      resumo: passaram + '/' + casos.length,
      casos: resultados,
      persistiu_dados: false,
    })
  } catch (err) {
    const mensagem = err && err.message ? String(err.message) : String(err)
    try {
      console.error('[pacote_v2/selftest] ' + mensagem)
      if (err && err.stack) console.error('[pacote_v2/selftest] stack: ' + String(err.stack))
    } catch (_) {}
    return e.json(500, {
      ok: false,
      codigo: 'PACOTE_V2_ERRO_INTERNO_500',
      mensagem: mensagem,
    })
  }
})

routerAdd('POST', '/backend/v1/pacote-v2/ingestar', (e) => {
  // --------------------- Constantes locais do callback ---------------------
  // TABELA DE PARTIÇÃO DE REGRAS POR PARTE (E2-F 2.2 — declarada em código)
  const PARTITION_TABLE = {
    A: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'],
    B: ['R1', 'R7', 'R8', 'R9', 'R10', 'R11', 'BONUS'],
    AB: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'BONUS'],
  }
  const CODIGOS = {
    JSON_INVALIDO: 'PACOTE_V2_JSON_INVALIDO_401',
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
    PARTE_INDETERMINADA: 'PACOTE_V2_PARTE_INDETERMINADA_415',
    PARTE_INCOERENTE: 'PACOTE_V2_PARTE_INCOERENTE_416',
    AVISO_DRE: 'PACOTE_V2_DRE_AVISO_404A',
  }
  const CODIGO_INTERNO = 'PACOTE_V2_ERRO_INTERNO_500'
  const REFERENCIA_CONTAGENS = {
    projetos: 6,
    planos_acao: 12,
    etapas: 116,
    okrs: 7,
    hoshin: 7,
    rituais: 5,
  }

  // --------------------- Helpers locais (defensivos) ----------------------

  function ehObjeto(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v)
  }

  function responder500(err, contexto) {
    const mensagem = err && err.message ? String(err.message) : String(err)
    try {
      console.error('[pacote_v2/ingestar] ' + contexto + ': ' + mensagem)
      if (err && err.stack) {
        console.error('[pacote_v2/ingestar] stack: ' + String(err.stack))
      }
    } catch (_) {}
    return e.json(500, {
      ok: false,
      codigo: CODIGO_INTERNO,
      mensagem: mensagem,
    })
  }

  function extrairJsonCorpo() {
    try {
      const info = e.requestInfo ? e.requestInfo() : {}
      const raw = (info && info.body) || {}
      if (typeof raw === 'string') {
        return JSON.parse(raw)
      }
      return raw
    } catch (_) {
      return null
    }
  }

  // Extrai o primeiro objeto JSON embutido em texto (com ou sem texto ao redor)
  function extrairJsonDeTexto(texto) {
    const trimmed = (texto || '').trim()
    if (!trimmed) return null
    try {
      return JSON.parse(trimmed)
    } catch (_) {
      // continua: procura objeto embutido balanceado
    }
    const start = trimmed.indexOf('{')
    if (start === -1) return null
    let depth = 0
    let inString = false
    let escaped = false
    for (let i = start; i < trimmed.length; i++) {
      const ch = trimmed.charAt(i)
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === '"') inString = !inString
      if (inString) continue
      if (ch === '{') depth++
      if (ch === '}') {
        depth--
        if (depth === 0) {
          const candidate = trimmed.slice(start, i + 1)
          try {
            return JSON.parse(candidate)
          } catch (_) {
            // continua procurando outro início
          }
        }
      }
    }
    return null
  }

  // ---------------- E2-F — formatadores de erro/aviso (modo auditoria) ----

  function descriptorDe(v) {
    if (v === undefined || v === null) return null
    if (Array.isArray(v)) return 'array (' + v.length + ' itens)'
    if (typeof v === 'object') return 'objeto (' + Object.keys(v).length + ' chaves)'
    return String(v)
  }

  function erro(codigo, componente, encontrado, esperado, mensagem, extra) {
    const item = {
      codigo: codigo,
      mensagem: mensagem,
      componente_validado: componente,
      status_regra: 'bloqueante',
    }
    item.detalhe = { encontrado: encontrado === undefined ? null : encontrado, esperado: esperado }
    if (extra) {
      for (const k in extra) item.detalhe[k] = extra[k]
    }
    return item
  }

  function aviso(codigo, componente, encontrado, esperado, mensagem, extra) {
    const item = erro(codigo, componente, encontrado, esperado, mensagem, extra)
    item.status_regra = 'informativa'
    return item
  }

  function regraDefensiva(nomeRegra, fn) {
    try {
      return fn()
    } catch (err) {
      return {
        ok: false,
        erros: [
          {
            codigo: CODIGO_INTERNO,
            mensagem:
              'Regra ' +
              nomeRegra +
              ' falhou inesperadamente: ' +
              String(err && err.message ? err.message : err),
            componente_validado: nomeRegra,
            status_regra: 'bloqueante',
            detalhe: { encontrado: null, esperado: null },
          },
        ],
        avisos: [],
        contagens: null,
      }
    }
  }

  // ---------------- E2-F/E2-G — ADAPTADOR DE CAMPOS (V2.0 → normalizado) --
  // Função PURA: não muta nem clona o pacote original (só lê caminhos).
  // E2-G: normaliza EREC (fonte .secoes, case-insensitive) e GABARITO
  // (conta o array .indicadores, não as chaves do objeto pai) —
  // mesmas funções da rota /validar, cópia inline idêntica (padrão E2-F).
  function normalizarErec(erec) {
    if (!ehObjeto(erec)) return { norm: null, meta: null }
    const fonte = ehObjeto(erec.secoes) ? erec.secoes : erec
    const mapa = {}
    const chaves = Object.keys(fonte)
    for (let i = 0; i < chaves.length; i++) {
      mapa[String(chaves[i]).trim().toLowerCase()] = fonte[chaves[i]]
    }
    const secoes = ['eliminar', 'reduzir', 'elevar', 'criar']
    const secoesEncontradas = []
    const itensPorSecao = {}
    const norm = {}
    let totalItens = 0
    for (let i = 0; i < secoes.length; i++) {
      const s = secoes[i]
      const v = mapa[s]
      if (v === undefined) continue
      secoesEncontradas.push(s)
      const itens = Array.isArray(v) ? v : ehObjeto(v) ? Object.keys(v).length : []
      const n = Array.isArray(itens) ? itens.length : itens
      itensPorSecao[s] = n
      totalItens += n
      norm[s] = Array.isArray(v) ? v : ehObjeto(v) ? v : []
    }
    return {
      norm: norm,
      meta: {
        secoes_encontradas: secoesEncontradas,
        itens_por_secao: itensPorSecao,
        total_itens: totalItens,
      },
    }
  }

  function normalizarGabarito(g) {
    if (!ehObjeto(g) && !Array.isArray(g)) return { norm: null, meta: null }
    const indicadores = Array.isArray(g) ? g : Array.isArray(g.indicadores) ? g.indicadores : null
    const meta = {
      total_indicadores: indicadores ? indicadores.length : 0,
      faixa_aceita: '7-8',
      nomes_dos_indicadores: [],
    }
    if (indicadores) {
      const nomes = []
      for (let i = 0; i < indicadores.length; i++) {
        const it = indicadores[i]
        nomes.push(
          ehObjeto(it) && it.nome
            ? String(it.nome)
            : ehObjeto(it) && it.indicador
              ? String(it.indicador)
              : ehObjeto(it) && it.titulo
                ? String(it.titulo)
                : 'indicador ' + (i + 1),
        )
      }
      meta.nomes_dos_indicadores = nomes
    }
    return { norm: g, meta: meta }
  }

  function criarPacoteNormalizado(pacote) {
    const raiz = ehObjeto(pacote) ? pacote : null
    const af = raiz && ehObjeto(raiz.artefatos_financeiros) ? raiz.artefatos_financeiros : null
    const pep = raiz && ehObjeto(raiz.projetos_e_planos) ? raiz.projetos_e_planos : null

    function pegar(v) {
      return v === undefined ? null : v
    }

    function wrapDre(v) {
      if (v === undefined) return null
      if (Array.isArray(v)) return { linhas: v }
      if (ehObjeto(v)) {
        if (Array.isArray(v.linhas)) return v
        return { linhas: [] }
      }
      return v
    }

    const erecNorm = normalizarErec(af ? af.erec_a9 : undefined)
    const gabNorm = normalizarGabarito(af ? af.gabarito_a8 : undefined)

    return {
      original: pacote,
      norm: {
        fases: pegar(raiz ? raiz.conteudo_fases : undefined),
        dre: wrapDre(af ? af.dre_15_linhas : undefined),
        erec: erecNorm.norm,
        erec_meta: erecNorm.meta,
        gabarito_auditoria: gabNorm.norm,
        gabarito_meta: gabNorm.meta,
        nao_trafega: pegar(raiz ? raiz.nao_trafega : undefined),
        projetos: pegar(pep ? pep.projetos : undefined),
        planos_acao: pegar(pep ? pep.planos_acao : undefined),
        okrs: pegar(pep ? pep.okrs : undefined),
        matriz_hoshin: pegar(pep ? pep.matriz_hoshin : undefined),
        rituais: pegar(pep ? pep.rituais_desdobramento : undefined),
        // E2-I: objetivos_estrategicos vive DENTRO de projetos_e_planos no
        // JSON real da Aurora; fallback para a raiz (V1) por compatibilidade.
        objetivos_estrategicos:
          pegar(pep ? pep.objetivos_estrategicos : undefined) ||
          pegar(raiz ? raiz.objetivos_estrategicos : undefined) ||
          [],
      },
    }
  }

  function contagensNorm(norm) {
    let etapas = 0
    if (Array.isArray(norm.planos_acao)) {
      for (let i = 0; i < norm.planos_acao.length; i++) {
        const p = norm.planos_acao[i]
        if (p && Array.isArray(p.etapas)) etapas += p.etapas.length
      }
    }
    return {
      fases: ehObjeto(norm.fases) ? Object.keys(norm.fases).length : 0,
      projetos: Array.isArray(norm.projetos) ? norm.projetos.length : 0,
      planos_acao: Array.isArray(norm.planos_acao) ? norm.planos_acao.length : 0,
      etapas: etapas,
      okrs: Array.isArray(norm.okrs) ? norm.okrs.length : 0,
      hoshin: Array.isArray(norm.matriz_hoshin)
        ? norm.matriz_hoshin.length
        : ehObjeto(norm.matriz_hoshin)
          ? Object.keys(norm.matriz_hoshin).length
          : 0,
      rituais: Array.isArray(norm.rituais) ? norm.rituais.length : 0,
    }
  }

  // ------------------- Regras (E2-F — leitura do pacote NORMALIZADO) ------

  function validarR1(pacote, erros) {
    const sv = typeof pacote.schema_versao === 'string' ? pacote.schema_versao.trim() : ''
    if (!sv) {
      erros.push(
        erro(
          CODIGOS.SCHEMA,
          'schema_versao',
          null,
          'string iniciada por "2." (ex.: 2.0)',
          'Campo obrigatório ausente: schema_versao.',
        ),
      )
    } else if (!/^2\./.test(sv)) {
      erros.push(
        erro(
          CODIGOS.SCHEMA,
          'schema_versao',
          sv,
          'string iniciada por "2." (ex.: 2.0)',
          'schema_versao fora do padrão do Pacote V2.0.',
        ),
      )
    }
    const did = typeof pacote.dossie_id === 'string' ? pacote.dossie_id.trim() : ''
    if (!did) {
      erros.push(
        erro(
          CODIGOS.SCHEMA,
          'dossie_id',
          null,
          'string não vazia',
          'Campo obrigatório ausente: dossie_id.',
        ),
      )
    }
  }

  function validarR7(norm, erros, avisos) {
    const prj = norm.projetos
    if (!Array.isArray(prj)) {
      erros.push(
        erro(
          CODIGOS.PRJ,
          'projetos_e_planos.projetos',
          descriptorDe(prj),
          'array de projetos',
          'Bloco "projetos" ausente ou não é array.',
        ),
      )
      return
    }
    for (let i = 0; i < prj.length; i++) {
      const p = prj[i]
      if (!ehObjeto(p)) {
        erros.push(
          erro(
            CODIGOS.PRJ,
            'projetos_e_planos.projetos[' + i + ']',
            typeof p,
            'objeto com projeto_id e projeto_nome',
            'Projeto no índice ' + i + ' não é objeto.',
          ),
        )
        continue
      }
      const faltandoCampos = []
      if (!p.projeto_id) faltandoCampos.push('projeto_id')
      if (!p.projeto_nome) faltandoCampos.push('projeto_nome')
      if (faltandoCampos.length > 0) {
        erros.push(
          erro(
            CODIGOS.PRJ,
            'projetos_e_planos.projetos[' + i + ']',
            'faltando: ' + faltandoCampos.join(', '),
            'projeto_id + projeto_nome',
            'Projeto no índice ' + i + ' sem campos obrigatórios.',
          ),
        )
      }
    }
    if (prj.length !== REFERENCIA_CONTAGENS.projetos) {
      avisos.push(
        aviso(
          CODIGOS.PRJ,
          'projetos_e_planos.projetos',
          prj.length,
          REFERENCIA_CONTAGENS.projetos + ' (referência Aurora — informativo)',
          'Quantidade de projetos (contagem informativa, não bloqueia).',
        ),
      )
    }
  }

  function validarR8(norm, erros, avisos) {
    const pac = norm.planos_acao
    if (!Array.isArray(pac)) {
      erros.push(
        erro(
          CODIGOS.PAC,
          'projetos_e_planos.planos_acao',
          descriptorDe(pac),
          'array de planos de ação',
          'Bloco "planos_acao" ausente ou não é array.',
        ),
      )
      return
    }
    for (let i = 0; i < pac.length; i++) {
      const p = pac[i]
      const idPlano = ehObjeto(p) ? p.pac_id || p.plano_id || null : null
      if (!idPlano) {
        erros.push(
          erro(
            CODIGOS.PAC,
            'projetos_e_planos.planos_acao[' + i + ']',
            ehObjeto(p) ? 'faltando: pac_id ou plano_id' : typeof p,
            'objeto com pac_id ou plano_id',
            'Plano de ação no índice ' + i + ' sem pac_id/plano_id ou não é objeto.',
            { nome_campo_procurado: 'pac_id ou plano_id', encontrado: 'ausente' },
          ),
        )
      }
    }
    if (pac.length !== REFERENCIA_CONTAGENS.planos_acao) {
      avisos.push(
        aviso(
          CODIGOS.PAC,
          'projetos_e_planos.planos_acao',
          pac.length,
          REFERENCIA_CONTAGENS.planos_acao + ' (referência Aurora — informativo)',
          'Quantidade de planos de ação (contagem informativa, não bloqueia).',
        ),
      )
    }
  }

  function validarR9(norm, avisos) {
    const pac = norm.planos_acao
    let totalEtapas = 0
    if (Array.isArray(pac)) {
      for (let i = 0; i < pac.length; i++) {
        const p = pac[i]
        if (p && Array.isArray(p.etapas)) totalEtapas += p.etapas.length
      }
    }
    if (totalEtapas !== REFERENCIA_CONTAGENS.etapas) {
      avisos.push(
        aviso(
          CODIGOS.ETAPAS,
          'projetos_e_planos.planos_acao[].etapas',
          totalEtapas,
          REFERENCIA_CONTAGENS.etapas + ' (referência Aurora — informativo)',
          'Total de etapas (soma dos planos de ação) — contagem informativa, não bloqueia.',
        ),
      )
    }
    return totalEtapas
  }

  function validarR10(norm, erros) {
    const pac = norm.planos_acao
    if (!Array.isArray(pac)) return
    const dimensoesPT = {
      o_que: 'what',
      por_que: 'why',
      onde: 'where',
      quem: 'who',
      quando: 'when',
      como: 'how',
      quanto: 'how_much',
    }
    const nomes = Object.keys(dimensoesPT)
    for (let i = 0; i < pac.length; i++) {
      const p = pac[i]
      const etapas = p && Array.isArray(p.etapas) ? p.etapas : []
      for (let j = 0; j < etapas.length; j++) {
        const et = etapas[j]
        if (!ehObjeto(et)) {
          erros.push(
            erro(
              CODIGOS.W2H,
              'projetos_e_planos.planos_acao[' + i + '].etapas[' + j + ']',
              typeof et,
              'objeto com 5W2H',
              'Etapa ' + j + ' do plano ' + i + ' não é objeto (5W2H inexistente).',
            ),
          )
          continue
        }
        const faltando = []
        for (let k = 0; k < nomes.length; k++) {
          const pt = nomes[k]
          let v = et[pt]
          if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
            v = et[dimensoesPT[pt]]
          }
          if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
            faltando.push(pt)
          }
        }
        if (faltando.length > 0) {
          erros.push(
            erro(
              CODIGOS.W2H,
              'projetos_e_planos.planos_acao[' + i + '].etapas[' + j + ']',
              'faltando: ' + faltando.join(', '),
              '7 dimensões 5W2H (o_que, por_que, onde, quem, quando, como, quanto)',
              'Etapa ' + j + ' do plano ' + i + ' com 5W2H incompleto.',
            ),
          )
        }
      }
    }
  }

  // E2-I: fonte = norm.objetivos_estrategicos (adaptador: pep ou raiz);
  // o item pode trazer objetivo_estrategico_id ou objetivo_id
  // (cópias /validar e /ingestar sincronizadas).
  function validarR11(norm, pacote, erros) {
    const prj = Array.isArray(norm.projetos) ? norm.projetos : []
    const pac = Array.isArray(norm.planos_acao) ? norm.planos_acao : []
    const okrs = Array.isArray(norm.okrs) ? norm.okrs : []

    const idsProjetos = {}
    for (let i = 0; i < prj.length; i++) {
      const p = prj[i]
      if (ehObjeto(p) && p.projeto_id) idsProjetos[String(p.projeto_id)] = true
    }
    const idsObjetivos = {}
    let temListaObjetivos = false
    const objetivos = norm.objetivos_estrategicos
    if (Array.isArray(objetivos) && objetivos.length > 0) {
      temListaObjetivos = true
      for (let i = 0; i < objetivos.length; i++) {
        const o = objetivos[i]
        // E2-I: alinhado à cópia /validar — o item pode trazer
        // objetivo_estrategico_id OU objetivo_id (JSON real da Aurora).
        const idObj = ehObjeto(o) ? o.objetivo_estrategico_id || o.objetivo_id : null
        if (idObj) idsObjetivos[String(idObj)] = true
      }
    }

    for (let i = 0; i < prj.length; i++) {
      const p = prj[i]
      if (!ehObjeto(p)) continue
      const fk = p.objetivo_estrategico_id
      if (fk === undefined || fk === null || String(fk).trim() === '') {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.projetos[' + i + '].objetivo_estrategico_id',
            null,
            'id de objetivo estratégico',
            'Projeto ' + i + ' sem objetivo_estrategico_id (FK).',
          ),
        )
        continue
      }
      if (temListaObjetivos && !idsObjetivos[String(fk)]) {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.projetos[' + i + '].objetivo_estrategico_id',
            String(fk),
            'id presente em objetivos_estrategicos',
            'FK objetivo_estrategico_id não encontrada na lista de objetivos.',
          ),
        )
      }
    }
    for (let i = 0; i < pac.length; i++) {
      const p = pac[i]
      if (!ehObjeto(p)) continue
      const fk = p.projeto_id
      if (fk === undefined || fk === null || String(fk).trim() === '') {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.planos_acao[' + i + '].projeto_id',
            null,
            'projeto_id existente',
            'Plano de ação ' + i + ' sem projeto_id (FK).',
          ),
        )
        continue
      }
      if (!idsProjetos[String(fk)]) {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.planos_acao[' + i + '].projeto_id',
            String(fk),
            'projeto_id existente em projetos_e_planos.projetos',
            'FK projeto_id do plano de ação não encontrada na lista de projetos.',
          ),
        )
      }
    }
    for (let i = 0; i < okrs.length; i++) {
      const o = okrs[i]
      if (!ehObjeto(o)) continue
      const fk = o.projeto_id
      if (fk === undefined || fk === null || String(fk).trim() === '') {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.okrs[' + i + '].projeto_id',
            null,
            'projeto_id existente',
            'OKR ' + i + ' sem projeto_id (FK).',
          ),
        )
        continue
      }
      if (!idsProjetos[String(fk)]) {
        erros.push(
          erro(
            CODIGOS.FK,
            'projetos_e_planos.okrs[' + i + '].projeto_id',
            String(fk),
            'projeto_id existente em projetos_e_planos.projetos',
            'FK projeto_id do OKR não encontrada na lista de projetos.',
          ),
        )
      }
    }
  }

  // E2-I: matriz_hoshin pode vir como ARRAY (JSON real da Aurora, 7 itens)
  // ou objeto; contagem + tipo sempre INFORMATIVOS (não bloqueia).
  function validarBonus(norm, avisos) {
    const nOkrs = Array.isArray(norm.okrs) ? norm.okrs.length : null
    if (nOkrs !== REFERENCIA_CONTAGENS.okrs) {
      avisos.push(
        aviso(
          CODIGOS.DESDOBRAMENTO,
          'projetos_e_planos.okrs',
          nOkrs,
          REFERENCIA_CONTAGENS.okrs + ' (referência Aurora — informativo)',
          'Quantidade de OKRs (contagem informativa, não bloqueia).',
        ),
      )
    }
    const hoshinTipo = Array.isArray(norm.matriz_hoshin)
      ? 'array'
      : ehObjeto(norm.matriz_hoshin)
        ? 'objeto'
        : 'ausente'
    const hoshinValor = Array.isArray(norm.matriz_hoshin)
      ? norm.matriz_hoshin.length
      : ehObjeto(norm.matriz_hoshin)
        ? Object.keys(norm.matriz_hoshin).length
        : null
    avisos.push(
      aviso(
        CODIGOS.DESDOBRAMENTO,
        'projetos_e_planos.matriz_hoshin',
        hoshinValor !== null ? hoshinValor + ' itens · tipo_detectado: ' + hoshinTipo : 'ausente',
        REFERENCIA_CONTAGENS.hoshin + ' objetivos (referência Aurora — informativo)',
        'Objetivos da Matriz Hoshin (contagem informativa, não bloqueia).',
        { tipo_detectado: hoshinTipo, itens_encontrados: hoshinValor },
      ),
    )
    const rituais = Array.isArray(norm.rituais) ? norm.rituais.length : null
    if (rituais !== REFERENCIA_CONTAGENS.rituais) {
      avisos.push(
        aviso(
          CODIGOS.DESDOBRAMENTO,
          'projetos_e_planos.rituais_desdobramento',
          rituais,
          REFERENCIA_CONTAGENS.rituais + ' (referência Aurora — informativo)',
          'Quantidade de rituais de desdobramento (contagem informativa, não bloqueia).',
        ),
      )
    }
  }

  // Revalidação compacta ANTES de persistir (mesma partição da rota /validar)
  function validarParteAIng(p) {
    const erros = []
    const avisos = []
    if (!ehObjeto(p)) {
      erros.push(
        erro(
          CODIGOS.SCHEMA,
          'pacote',
          null,
          'objeto JSON',
          'Pacote ausente ou não é um objeto JSON válido.',
        ),
      )
      return { ok: false, erros: erros, avisos: avisos, contagens: null }
    }
    const norm = criarPacoteNormalizado(p).norm
    validarR1(p, erros)
    validarR2AIng(norm, erros)
    validarR3(norm, erros, avisos)
    validarR4(norm, erros, avisos)
    validarR5(norm, erros)
    validarR6(norm, erros)
    return { ok: erros.length === 0, erros: erros, avisos: avisos, contagens: contagensNorm(norm) }
  }

  // R2 (ingestar) — conteudo_fases P1..P13
  function validarR2AIng(norm, erros) {
    const fases = norm.fases
    if (!ehObjeto(fases)) {
      erros.push(
        erro(
          CODIGOS.FASES,
          'conteudo_fases',
          descriptorDe(fases),
          'objeto com fases P1..P13',
          'Bloco "conteudo_fases" ausente ou inválido (esperado objeto com P1..P13).',
        ),
      )
      return
    }
    const faltando = []
    for (let i = 1; i <= 13; i++) {
      if (!ehObjeto(fases['P' + i])) faltando.push('P' + i)
    }
    if (faltando.length > 0) {
      erros.push(
        erro(
          CODIGOS.FASES,
          'conteudo_fases',
          'faltando: ' + faltando.join(', '),
          '13 fases P1..P13, cada uma objeto',
          'Bloco "conteudo_fases" incompleto: fases ausentes ou não-objeto.',
        ),
      )
    }
    const statusInvalidos = []
    const chaves = Object.keys(fases)
    for (let i = 0; i < chaves.length; i++) {
      const f = fases[chaves[i]]
      if (!ehObjeto(f)) continue
      const st = typeof f.status === 'string' ? f.status.trim().toLowerCase() : ''
      if (st !== 'completo' && st !== 'parcial' && st !== 'bloqueado') {
        statusInvalidos.push(chaves[i] + '="' + st + '"')
      }
    }
    if (statusInvalidos.length > 0) {
      erros.push(
        erro(
          CODIGOS.FASES,
          'conteudo_fases',
          statusInvalidos.join(', '),
          'status de cada fase ∈ {completo, parcial, bloqueado}',
          'Fases com status ausente ou fora dos valores canônicos.',
        ),
      )
    }
  }

  // R3 — DRE (mantém E2-C): 15–18 linhas de conta com "fonte" em cada
  function validarR3(norm, erros, avisos) {
    const dre = norm.dre
    if (!ehObjeto(dre)) {
      erros.push(
        erro(
          CODIGOS.DRE,
          'artefatos_financeiros.dre_15_linhas',
          descriptorDe(dre),
          'objeto com array "linhas" (15 a 18 linhas de conta)',
          'Bloco DRE (dre_15_linhas) ausente ou inválido.',
        ),
      )
      return
    }
    const linhas = Array.isArray(dre.linhas) ? dre.linhas : []
    const linhasConta = []
    const linhasIgnoradas = []
    for (let i = 0; i < linhas.length; i++) {
      const l = linhas[i]
      if (!ehObjeto(l)) continue
      const rotulo = String(l.linha || l.rotulo || l.conta || l.nome || '').trim()
      if (!rotulo) continue
      const ehSubtotal =
        /^(=|\(-\)|\(\+\)|\(\+\/-\)|subtotal|total|demonstração)/i.test(rotulo) ||
        /^receita\s+bruta$|^receita\s+l[íi]quida$|^margem\s+bruta$|^margem\s+de\s+contribui[çc][ãa]o$|^ebitda$|^ebit\b|^lucro\s+l[íi]quido$|^ebt\b/i.test(
          rotulo,
        )
      if (ehSubtotal) {
        linhasIgnoradas.push(rotulo)
        continue
      }
      linhasConta.push(l)
    }
    const qtdConta = linhasConta.length
    if (qtdConta < 15 || qtdConta > 18) {
      erros.push(
        erro(
          CODIGOS.DRE,
          'artefatos_financeiros.dre_15_linhas',
          qtdConta,
          '15 a 18 linhas de conta (ignorando subtotais e cabeçalhos)',
          'DRE fora da faixa aceitável de LINHAS DE CONTA.',
          { ignoradas: linhasIgnoradas.length },
        ),
      )
    } else if (qtdConta !== 15) {
      avisos.push(
        aviso(
          CODIGOS.AVISO_DRE,
          'artefatos_financeiros.dre_15_linhas',
          qtdConta,
          15,
          'DRE com ' +
            qtdConta +
            ' linhas de conta (faixa 15–18 aceita com aviso; padrão canônico = 15).',
        ),
      )
    }
    const semFonte = []
    for (let i = 0; i < linhasConta.length; i++) {
      const f = linhasConta[i].fonte
      const temFonte = typeof f === 'string' ? f.trim().length > 0 : !!f
      if (!temFonte) {
        semFonte.push(linhasConta[i].linha || linhasConta[i].rotulo || 'linha ' + (i + 1))
      }
    }
    if (semFonte.length > 0) {
      erros.push(
        erro(
          CODIGOS.DRE,
          'artefatos_financeiros.dre_15_linhas',
          semFonte.length + ' linha(s) sem fonte',
          'todas as linhas de conta com "fonte"',
          'Linhas de conta da DRE sem o campo obrigatório "fonte".',
          { linhas: semFonte },
        ),
      )
    }
  }

  // R4 — EREC A9: normalizado (4 seções canônicas); contagem INFORMATIVA.
  // E2-G: norm.erec já vem da fonte .secoes (case-insensitive) com as 4
  // chaves minúsculas; faltando APÓS normalização é o único bloqueio de
  // estrutura. R4 só falha também se as 4 presentes estiverem VAZIAS.
  function validarR4(norm, erros, avisos) {
    const erec = norm.erec
    if (!ehObjeto(erec)) {
      erros.push(
        erro(
          CODIGOS.EREC,
          'artefatos_financeiros.erec_a9',
          descriptorDe(erec),
          'objeto com 4 seções canônicas (Eliminar, Reduzir, Elevar, Criar) [fonte .secoes aceita]',
          'Bloco EREC (erec_a9) ausente ou inválido.',
        ),
      )
      return
    }
    const meta = norm.erec_meta || { secoes_encontradas: [], itens_por_secao: {}, total_itens: 0 }
    const secoes = ['eliminar', 'reduzir', 'elevar', 'criar']
    const faltando = []
    const todasVazias = []
    for (let i = 0; i < secoes.length; i++) {
      const s = secoes[i]
      const v = erec[s]
      if (v === undefined || v === null) {
        faltando.push(s)
        continue
      }
      const n = Array.isArray(v) ? v.length : ehObjeto(v) ? Object.keys(v).length : 0
      if (n === 0) todasVazias.push(s)
    }
    if (faltando.length > 0) {
      erros.push(
        erro(
          CODIGOS.EREC,
          'artefatos_financeiros.erec_a9',
          'faltando seções após normalização: ' + faltando.join(', '),
          '4 seções canônicas (Eliminar, Reduzir, Elevar, Criar) em .secoes (case-insensitive)',
          'Bloco EREC sem as 4 seções canônicas.',
          {
            secoes_encontradas: meta.secoes_encontradas,
            itens_por_secao: JSON.stringify(meta.itens_por_secao),
            total_itens: meta.total_itens,
          },
        ),
      )
    } else if (todasVazias.length === 4) {
      erros.push(
        erro(
          CODIGOS.EREC,
          'artefatos_financeiros.erec_a9',
          'as 4 seções presentes mas todas vazias',
          'pelo menos um item em alguma seção do EREC',
          'Bloco EREC com as 4 seções canônicas todas vazias.',
          {
            secoes_encontradas: meta.secoes_encontradas,
            itens_por_secao: JSON.stringify(meta.itens_por_secao),
            total_itens: meta.total_itens,
          },
        ),
      )
    }
    // Contagem de itens é INFORMATIVA (Aurora = 20: 4+5+5+6) — divergência
    // da referência NÃO é falha (definido na E2-F).
    avisos.push(
      aviso(
        CODIGOS.EREC,
        'artefatos_financeiros.erec_a9',
        meta.total_itens + ' itens (' + meta.secoes_encontradas.join(' · ') + ')',
        'contagem informativa (referência Aurora = 20 itens: 4+5+5+6)',
        'Contagem de itens do EREC A9 (informativa, não bloqueia).',
        { itens_por_secao: JSON.stringify(meta.itens_por_secao) },
      ),
    )
  }

  // R5 — gabarito A8: aceita 7 OU 8 indicadores (declara total_indicadores).
  // E2-G: norm.gabarito_meta.total_indicadores conta o ARRAY .indicadores
  // (não as chaves do objeto pai: titulo/indicadores/total_indicadores/
  // veredito = 4 era o erro antigo). Falha só se ausente, vazio ou fora
  // da faixa 7–8. Dentro da faixa → sem aviso.
  function validarR5(norm, erros) {
    const g = norm.gabarito_auditoria
    const meta = norm.gabarito_meta
    const total = meta && meta.total_indicadores !== undefined ? meta.total_indicadores : 0
    if (!ehObjeto(g) && !Array.isArray(g)) {
      erros.push(
        erro(
          CODIGOS.GABARITO,
          'artefatos_financeiros.gabarito_a8',
          descriptorDe(g),
          'objeto com array ".indicadores" (ou array direto) com 7 ou 8 indicadores',
          'Bloco gabarito_a8 (gabarito de auditoria) ausente ou inválido.',
          { total_indicadores: 0, faixa_aceita: '7-8' },
        ),
      )
      return
    }
    if (!meta || (!Array.isArray(g) && !(ehObjeto(g) && Array.isArray(g.indicadores)))) {
      // estrutura sem array de indicadores identificável
      erros.push(
        erro(
          CODIGOS.GABARITO,
          'artefatos_financeiros.gabarito_a8',
          typeof g,
          'array ".indicadores" presente e não vazio (ou array direto)',
          'Gabarito de auditoria (gabarito_a8) sem array ".indicadores" identificável.',
          { total_indicadores: total, faixa_aceita: '7-8' },
        ),
      )
      return
    }
    if (total < 1) {
      erros.push(
        erro(
          CODIGOS.GABARITO,
          'artefatos_financeiros.gabarito_a8',
          0,
          '7 ou 8 indicadores',
          'Gabarito de auditoria (gabarito_a8) com array ".indicadores" vazio.',
          { total_indicadores: 0, faixa_aceita: '7-8', nomes_dos_indicadores: [] },
        ),
      )
      return
    }
    if (total !== 7 && total !== 8) {
      erros.push(
        erro(
          CODIGOS.GABARITO,
          'artefatos_financeiros.gabarito_a8',
          total,
          '7 ou 8 indicadores (faixa aceita: 7-8)',
          'Gabarito de auditoria (gabarito_a8) com quantidade de indicadores inválida.',
          {
            total_indicadores: total,
            faixa_aceita: '7-8',
            nomes_dos_indicadores: meta.nomes_dos_indicadores,
          },
        ),
      )
    }
  }

  // R6 — nao_trafega: 4 booleanos = true (só Parte A)
  function validarR6(norm, erros) {
    const nt = norm.nao_trafega
    if (!ehObjeto(nt)) {
      erros.push(
        erro(
          CODIGOS.NAOTRAFEGA,
          'nao_trafega',
          descriptorDe(nt),
          'objeto com 4 booleanos true (prompts_sintese, regras_orquestracao, curadoria_base, raciocinio_interno)',
          'Bloco "nao_trafega" ausente ou inválido.',
        ),
      )
      return
    }
    const chaves = [
      'prompts_sintese',
      'regras_orquestracao',
      'curadoria_base',
      'raciocinio_interno',
    ]
    const falsos = []
    for (let i = 0; i < chaves.length; i++) {
      const v = nt[chaves[i]]
      if (v !== true) falsos.push(chaves[i] + '=' + (v === undefined ? 'ausente' : String(v)))
    }
    if (falsos.length > 0) {
      erros.push(
        erro(
          CODIGOS.NAOTRAFEGA,
          'nao_trafega',
          falsos.join(', '),
          'os 4 booleanos = true',
          'Bloco "nao_trafega" com sinalizações falsas ou ausentes.',
        ),
      )
    }
  }

  function validarParteBIng(p) {
    const erros = []
    const avisos = []
    if (!ehObjeto(p)) {
      erros.push(
        erro(
          CODIGOS.SCHEMA,
          'pacote',
          null,
          'objeto JSON',
          'Pacote ausente ou não é um objeto JSON válido.',
        ),
      )
      return { ok: false, erros: erros, avisos: avisos, contagens: null }
    }
    const norm = criarPacoteNormalizado(p).norm
    validarR1(p, erros)
    validarR7(norm, erros, avisos)
    validarR8(norm, erros, avisos)
    validarR9(norm, avisos)
    validarR10(norm, erros)
    validarR11(norm, p, erros)
    validarBonus(norm, avisos)
    return { ok: erros.length === 0, erros: erros, avisos: avisos, contagens: contagensNorm(norm) }
  }

  // ---------- ETAPA E2-E: DETECÇÃO DE PARTE EM 4 NÍVEIS (cópia inline) ----
  function statusBlocoObjeto(v) {
    if (v === null) return 'null'
    if (v === undefined) return 'ausente'
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0)
      return 'presente_não_vazio'
    if (typeof v === 'object') return 'presente_vazio'
    return 'presente'
  }

  function statusBlocoSimples(v) {
    if (v === null) return 'null'
    if (v === undefined) return 'ausente'
    return 'presente'
  }

  function temConteudo(v) {
    return !!v && typeof v === 'object' && Object.keys(v).length > 0
  }

  function analisarDeteccao(pacote) {
    const out = {
      parte: null,
      metodo: null,
      campo_parte: null,
      tem_fases: false,
      tem_planos: false,
    }
    if (!ehObjeto(pacote)) return out
    out.campo_parte =
      typeof pacote.parte === 'string' && pacote.parte.trim() ? pacote.parte.trim() : null
    out.tem_fases = temConteudo(pacote.conteudo_fases)
    out.tem_planos = temConteudo(pacote.projetos_e_planos)

    // NÍVEL 1 — campo "parte" explícito (prioridade sobre blocos)
    if (out.campo_parte) {
      if (out.campo_parte === 'A' || out.campo_parte === 'B' || out.campo_parte === 'AB') {
        out.parte = out.campo_parte
        out.metodo = 'campo_parte'
      } else {
        out.parte = null
        out.metodo = null
      }
      return out
    }

    // NÍVEL 2 — blocos de conteúdo (null de projetos_e_planos = ausente)
    if (out.tem_fases && !out.tem_planos) {
      out.parte = 'A'
      out.metodo = 'blocos_conteudo'
      return out
    }
    if (!out.tem_fases && out.tem_planos) {
      out.parte = 'B'
      out.metodo = 'blocos_conteudo'
      return out
    }
    if (out.tem_fases && out.tem_planos) {
      out.parte = 'AB'
      out.metodo = 'blocos_conteudo'
      return out
    }

    // NÍVEL 3 — chaves auxiliares
    const auxA =
      temConteudo(pacote.artefatos_financeiros) ||
      temConteudo(pacote.fases) ||
      temConteudo(pacote.dre)
    const auxB =
      temConteudo(pacote.objetivos_estrategicos) ||
      temConteudo(pacote.projetos) ||
      temConteudo(pacote.planos_acao) ||
      temConteudo(pacote.okrs)
    if (auxA && !auxB) {
      out.parte = 'A'
      out.metodo = 'chaves_auxiliares'
      return out
    }
    if (auxB && !auxA) {
      out.parte = 'B'
      out.metodo = 'chaves_auxiliares'
      return out
    }
    if (auxA && auxB) {
      out.parte = 'AB'
      out.metodo = 'chaves_auxiliares'
      return out
    }

    // NÍVEL 4 — nada determinável → 415
    return out
  }

  // BLOCO 2 — parte declarada mas bloco correspondente ausente → 416
  function mensagemIncoerencia(parte, deteccao) {
    if (deteccao.metodo !== 'campo_parte') return null
    if (parte === 'A' && !deteccao.tem_fases)
      return "Campo 'parte' indica A, mas 'conteudo_fases' não foi encontrado."
    if (parte === 'B' && !deteccao.tem_planos)
      return "Campo 'parte' indica B, mas 'projetos_e_planos' não está presente."
    return null
  }

  // --------------------------- Corpo da rota ----------------------------

  try {
    // 1. Autenticação e autorização (E0: admin OU consultor)
    const info = e.requestInfo ? e.requestInfo() : {}
    const auth = info.auth || null
    const papel = auth && typeof auth.getString === 'function' ? auth.getString('role') : null
    if (!auth || (papel !== 'admin' && papel !== 'consultor')) {
      return e.json(403, {
        ok: false,
        codigo: 'PACOTE_V2_SEM_PERMISSAO_403',
        mensagem: 'Acesso restrito a admin ou consultor.',
      })
    }

    // 2. Corpo — a tela envia { texto, lead_id }: extrai o JSON embutido
    const body = extrairJsonCorpo()
    if (!ehObjeto(body)) {
      return e.json(400, {
        ok: false,
        codigo: CODIGOS.JSON_INVALIDO,
        mensagem: 'Corpo da requisição ausente, inválido ou não é um objeto JSON.',
      })
    }

    let pacote = ehObjeto(body.pacote) ? body.pacote : null
    if (!pacote && typeof body.texto === 'string' && body.texto.trim()) {
      pacote = extrairJsonDeTexto(body.texto)
    }
    if (!pacote) pacote = body
    if (!ehObjeto(pacote)) {
      return e.json(400, {
        ok: false,
        codigo: CODIGOS.JSON_INVALIDO,
        mensagem: 'Não foi possível extrair um objeto JSON do conteúdo enviado.',
      })
    }

    // ETAPA E2-E — detecção em 4 níveis (INTACTA); null → 415
    const parteSolicitada =
      typeof body.parte === 'string' && body.parte.trim() ? body.parte.trim() : null
    const deteccao = analisarDeteccao(pacote)
    let parte = deteccao.parte
    if (parteSolicitada) {
      if (parteSolicitada === 'A' || parteSolicitada === 'B' || parteSolicitada === 'AB') {
        parte = parteSolicitada
      } else {
        parte = null
        deteccao.valor_parte_invalido = parteSolicitada
      }
    }
    if (!parte) {
      return e.json(415, {
        ok: false,
        codigo: CODIGOS.PARTE_INDETERMINADA,
        mensagem: 'Não foi possível determinar a parte do pacote',
        chaves_encontradas: Object.keys(pacote),
        campo_parte: deteccao.valor_parte_invalido || deteccao.campo_parte || null,
        conteudo_fases: statusBlocoObjeto(pacote.conteudo_fases),
        projetos_e_planos: statusBlocoObjeto(pacote.projetos_e_planos),
        artefatos_financeiros: statusBlocoSimples(pacote.artefatos_financeiros),
      })
    }
    const msgIncoerente = mensagemIncoerencia(parte, deteccao)
    if (msgIncoerente) {
      return e.json(416, {
        ok: false,
        codigo: CODIGOS.PARTE_INCOERENTE,
        mensagem: msgIncoerente,
        chaves_encontradas: Object.keys(pacote),
        campo_parte: deteccao.campo_parte || parteSolicitada || null,
        parte_detectada: parte,
      })
    }

    const dossieId = typeof pacote.dossie_id === 'string' ? pacote.dossie_id : ''
    if (!dossieId) {
      return e.json(400, {
        ok: false,
        codigo: CODIGOS.SCHEMA,
        mensagem: 'Campo obrigatório ausente: dossie_id.',
      })
    }

    // 3. Revalida inline com PARTIÇÃO (E2-F) ANTES de persistir
    const resultadoA = regraDefensiva('validarParteA', function () {
      return validarParteAIng(pacote)
    })
    const resultadoB = regraDefensiva('validarParteB', function () {
      return validarParteBIng(pacote)
    })

    const erros = []
    const avisos = []
    const blocos = []
    let contagens = null
    if (parte === 'A' || parte === 'AB') {
      for (let i = 0; i < (resultadoA.erros || []).length; i++) erros.push(resultadoA.erros[i])
      for (let i = 0; i < (resultadoA.avisos || []).length; i++) avisos.push(resultadoA.avisos[i])
      blocos.push({
        bloco: 'Parte A',
        status: resultadoA.ok ? 'ok' : 'erro',
        erros: resultadoA.erros,
        avisos: resultadoA.avisos,
      })
      if (resultadoA.contagens) contagens = resultadoA.contagens
    }
    if (parte === 'B' || parte === 'AB') {
      for (let i = 0; i < (resultadoB.erros || []).length; i++) erros.push(resultadoB.erros[i])
      for (let i = 0; i < (resultadoB.avisos || []).length; i++) avisos.push(resultadoB.avisos[i])
      blocos.push({
        bloco: 'Parte B',
        status: resultadoB.ok ? 'ok' : 'erro',
        erros: resultadoB.erros,
        avisos: resultadoB.avisos,
      })
      if (resultadoB.contagens) contagens = resultadoB.contagens
    }

    if (erros.length > 0) {
      return e.json(422, {
        ok: false,
        valido: false,
        parte: parte,
        regras_aplicadas: PARTITION_TABLE[parte] || [],
        dossie_id: dossieId,
        blocos: blocos,
        erros: erros,
        avisos: avisos,
        motivo: 'Ingestão bloqueada: validação reprovada.',
      })
    }

    // 4. Persistência (registro NOVO por ingestão — histórico da E2-B)
    //    O payload gravado é o pacote ORIGINAL (o adaptador nunca o altera).
    const colPacotes = $app.findCollectionByNameOrId('pacotes_v2')
    const recPacote = new Record(colPacotes)
    recPacote.set('dossie_id', dossieId)
    recPacote.set('schema_versao', '2.0')
    recPacote.set('parte', parte)
    recPacote.set('payload', pacote)
    recPacote.set('status_validacao', 'valido')
    recPacote.set('erros_validacao', [])
    recPacote.set('importado_em', new Date().toISOString())
    recPacote.set('importado_por', auth.id)
    $app.save(recPacote)

    // 5. Contadores de propagação — lidos do pacote NORMALIZADO (E2-F corrige
    //    a leitura antiga, que procurava okrs/hoshin/rituais na raiz V1)
    const normInfo = criarPacoteNormalizado(pacote).norm
    const prj = Array.isArray(normInfo.projetos) ? normInfo.projetos.length : 0
    const pac = Array.isArray(normInfo.planos_acao) ? normInfo.planos_acao.length : 0
    let etapas = 0
    if (Array.isArray(normInfo.planos_acao)) {
      for (let i = 0; i < normInfo.planos_acao.length; i++) {
        const p = normInfo.planos_acao[i]
        if (p && Array.isArray(p.etapas)) etapas += p.etapas.length
      }
    }
    const okrs = Array.isArray(normInfo.okrs) ? normInfo.okrs.length : 0
    const hoshin = Array.isArray(normInfo.matriz_hoshin)
      ? normInfo.matriz_hoshin.length
      : ehObjeto(normInfo.matriz_hoshin)
        ? Object.keys(normInfo.matriz_hoshin).length
        : 0
    const rituais = Array.isArray(normInfo.rituais) ? normInfo.rituais.length : 0

    return e.json(200, {
      ok: true,
      valido: true,
      parte: parte,
      regras_aplicadas: PARTITION_TABLE[parte] || [],
      prj: prj,
      pac: pac,
      etapas: etapas,
      okrs: okrs,
      hoshin: hoshin,
      rituais: rituais,
      contagens: contagens,
      pacote_id: recPacote.id,
      dossie_id: dossieId,
      blocos: [
        { bloco: 'Parte A', status: 'ok', erros: [], avisos: resultadoA.avisos },
        { bloco: 'Parte B', status: 'ok', erros: [], avisos: resultadoB.avisos },
      ],
      motivo: 'Ingestão concluída.',
    })
  } catch (err) {
    return responder500(err, 'exceção não tratada')
  }
})
