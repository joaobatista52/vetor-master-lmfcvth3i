/// <reference path="../pb_data/types.d.ts" />

/**
 * PACOTE V2.0 — ROTAS DE VALIDAÇÃO E INGESTÃO (ADMIN/CONSULTOR)
 * Rota: POST /backend/v1/pacote-v2/validar
 * Rota: POST /backend/v1/pacote-v2/ingestar
 *
 * ETAPA E2-C — CORREÇÃO ESTRUTURAL ("Invalid module"):
 * A E2-A assumia que require() dentro do callback carregaria
 * `pacote_v2_validacao.js` em tempo de requisição. NÃO funciona no JSVM.
 * CORREÇÃO: TODO o validador vive INLINE dentro de CADA callback (a JSVM
 * executa callbacks em pools de VM separados — nada de topo é visível).
 *
 * GARANTIAS E2-C:
 * 1. TODAS as respostas são JSON formatado — inclusive falha interna:
 *    500 { ok:false, codigo:"PACOTE_V2_ERRO_INTERNO_500", mensagem }
 * 2. Nenhuma regra lança throw — qualquer input defensivo devolve
 *    { ok:false, codigo, mensagem } e, em divergência estrutural,
 *    { encontrado, esperado } no detalhe (modo auditoria).
 * 3. R3 (DRE) NOVA REGRA: conta apenas LINHAS DE CONTA (ignora subtotais
 *    e cabeçalhos); aceita 15 a 18 linhas de conta com AVISO (não erro),
 *    exigindo campo "fonte" em cada linha. Reporta encontrado vs esperado.
 */

// ============================================================================
// ROTAS — cada callback é AUTOSSUFICIENTE (zero referências de topo)
// ============================================================================

routerAdd('POST', '/backend/v1/pacote-v2/validar', (e) => {
  // --------------------- Constantes locais do callback ---------------------
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

  // --------------------- Validadores (11 regras, inline) ------------------

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
          },
        ],
        avisos: [],
      }
    }
  }

  // R1–R3 + R4–R6 (Parte A): schema, fases, DRE, EREC, gabarito, não-tráfega
  function validarParteA(pacote) {
    const erros = []
    const avisos = []
    if (!ehObjeto(pacote)) {
      erros.push({
        codigo: CODIGOS.SCHEMA,
        mensagem: 'Pacote ausente ou não é um objeto JSON válido.',
      })
      return { ok: false, erros: erros, avisos: avisos }
    }

    // R1 — Schema (metadados mínimos)
    const dossieId = typeof pacote.dossie_id === 'string' ? pacote.dossie_id : ''
    if (!dossieId) {
      erros.push({ codigo: CODIGOS.SCHEMA, mensagem: 'Campo obrigatório ausente: dossie_id.' })
    }

    // R2 — Fases (1..8)
    const fases = ehObjeto(pacote.fases) ? pacote.fases : null
    if (!fases) {
      erros.push({
        codigo: CODIGOS.FASES,
        mensagem: 'Bloco "fases" ausente ou inválido (esperado objeto com chaves 1..8).',
        detalhe: { encontrado: null, esperado: 'objeto com chaves 1..8' },
      })
    } else {
      const chaves = Object.keys(fases)
      if (chaves.length < 8) {
        erros.push({
          codigo: CODIGOS.FASES,
          mensagem:
            'Bloco "fases" incompleto: esperadas 8 fases, encontradas ' + chaves.length + '.',
          detalhe: { encontrado: chaves.length, esperado: 8 },
        })
      }
      for (let i = 1; i <= 8; i++) {
        if (!ehObjeto(fases[String(i)])) {
          erros.push({
            codigo: CODIGOS.FASES,
            mensagem: 'Fase ' + i + ' ausente ou inválida no bloco "fases".',
            detalhe: { encontrado: chaves.join(','), esperado: 'fase ' + i + ' presente' },
          })
        }
      }
    }

    // R3 — DRE (NOVA REGRA E2-C): conta apenas LINHAS DE CONTA (ignora
    // subtotais e cabeçalhos); aceita 15 a 18 com AVISO, exigindo "fonte".
    let dre = pacote.dre
    if (!ehObjeto(dre) && Array.isArray(pacote.dre)) {
      dre = { linhas: pacote.dre }
    }
    if (!ehObjeto(dre)) {
      erros.push({
        codigo: CODIGOS.DRE,
        mensagem: 'Bloco "dre" ausente ou inválido (esperado objeto com array "linhas").',
        detalhe: { encontrado: null, esperado: 'objeto { linhas: [...] }' },
      })
    } else {
      const linhas = Array.isArray(dre.linhas) ? dre.linhas : []
      const linhasConta = []
      const linhasIgnoradas = []
      for (let i = 0; i < linhas.length; i++) {
        const l = linhas[i]
        if (!ehObjeto(l)) {
          continue
        }
        const rotulo = String(l.linha || l.rotulo || l.conta || l.nome || '').trim()
        if (!rotulo) {
          continue
        }
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
      const semFonte = []
      for (let i = 0; i < linhasConta.length; i++) {
        const f = linhasConta[i].fonte
        const temFonte = typeof f === 'string' ? f.trim().length > 0 : !!f
        if (!temFonte) {
          semFonte.push(linhasConta[i].linha || linhasConta[i].rotulo || 'linha ' + (i + 1))
        }
      }
      if (qtdConta < 15 || qtdConta > 18) {
        erros.push({
          codigo: CODIGOS.DRE,
          mensagem:
            'DRE fora da faixa aceitável de LINHAS DE CONTA (15 a 18, ignorando subtotais e cabeçalhos).',
          detalhe: {
            encontrado: qtdConta,
            esperado: '15 a 18 linhas de conta',
            ignoradas: linhasIgnoradas.length,
          },
        })
      } else if (qtdConta !== 15) {
        avisos.push({
          codigo: CODIGOS.AVISO_DRE,
          mensagem:
            'DRE com ' +
            qtdConta +
            ' linhas de conta (faixa 15–18 aceita com aviso; padrão canônico = 15).',
          detalhe: { encontrado: qtdConta, esperado: 15 },
        })
      }
      if (semFonte.length > 0) {
        erros.push({
          codigo: CODIGOS.DRE,
          mensagem: 'Linhas de conta da DRE sem o campo obrigatório "fonte".',
          detalhe: {
            encontrado: semFonte.length + ' sem fonte',
            esperado: 'todas com fonte',
            linhas: semFonte,
          },
        })
      }
    }

    return { ok: erros.length === 0, erros: erros, avisos: avisos }
  }

  // R4–R11 (Parte B): EREC, gabarito, não-tráfega, PRJ, PAC, etapas, 5W2H, OKRs
  function validarParteB(pacote) {
    const erros = []
    const avisos = []
    if (!ehObjeto(pacote)) {
      erros.push({
        codigo: CODIGOS.SCHEMA,
        mensagem: 'Pacote ausente ou não é um objeto JSON válido.',
      })
      return { ok: false, erros: erros, avisos: avisos }
    }

    // R4 — EREC (13 linhas)
    const erec = pacote.erec
    const linhasErec = Array.isArray(erec && erec.linhas)
      ? erec.linhas
      : Array.isArray(erec)
        ? erec
        : null
    if (!linhasErec) {
      erros.push({
        codigo: CODIGOS.EREC,
        mensagem: 'Bloco "erec" ausente ou inválido (esperado array ou objeto { linhas }).',
        detalhe: { encontrado: null, esperado: 13 },
      })
    } else {
      const conta = linhasErec.filter(function (l) {
        return ehObjeto(l)
      }).length
      if (conta !== 13) {
        erros.push({
          codigo: CODIGOS.EREC,
          mensagem: 'Quantidade de linhas do EREC divergente.',
          detalhe: { encontrado: conta, esperado: 13 },
        })
      }
    }

    // R5 — Gabarito de auditoria
    if (!ehObjeto(pacote.gabarito_auditoria)) {
      erros.push({
        codigo: CODIGOS.GABARITO,
        mensagem: 'Bloco "gabarito_auditoria" ausente ou inválido.',
        detalhe: { encontrado: null, esperado: 'objeto com 8 fases' },
      })
    }

    // R6 — Não-tráfega (proibições)
    if (!ehObjeto(pacote.nao_trafega)) {
      erros.push({
        codigo: CODIGOS.NAOTRAFEGA,
        mensagem: 'Bloco "nao_trafega" ausente ou inválido.',
        detalhe: { encontrado: null, esperado: 'objeto de proibições' },
      })
    }

    // R7 — Projetos (PRJ): 6 esperados
    const prj = Array.isArray(pacote.projetos) ? pacote.projetos : null
    if (!prj) {
      erros.push({
        codigo: CODIGOS.PRJ,
        mensagem: 'Bloco "projetos" ausente ou não é array.',
        detalhe: { encontrado: null, esperado: 6 },
      })
    } else {
      if (prj.length !== 6) {
        erros.push({
          codigo: CODIGOS.PRJ,
          mensagem: 'Quantidade de projetos divergente.',
          detalhe: { encontrado: prj.length, esperado: 6 },
        })
      }
      for (let i = 0; i < prj.length; i++) {
        const p = prj[i]
        if (!ehObjeto(p)) {
          erros.push({
            codigo: CODIGOS.PRJ,
            mensagem: 'Projeto no índice ' + i + ' não é objeto.',
            detalhe: { encontrado: typeof p, esperado: 'objeto' },
          })
          continue
        }
        if (!p.projeto_id || !p.projeto_nome) {
          erros.push({
            codigo: CODIGOS.PRJ,
            mensagem: 'Projeto no índice ' + i + ' sem projeto_id ou projeto_nome.',
            detalhe: {
              encontrado: Object.keys(p).join(','),
              esperado: 'projeto_id + projeto_nome',
            },
          })
        }
      }
    }

    // R8 — Planos de ação (PAC): 12 esperados
    const pac = Array.isArray(pacote.planos_acao) ? pacote.planos_acao : null
    if (!pac) {
      erros.push({
        codigo: CODIGOS.PAC,
        mensagem: 'Bloco "planos_acao" ausente ou não é array.',
        detalhe: { encontrado: null, esperado: 12 },
      })
    } else {
      if (pac.length !== 12) {
        erros.push({
          codigo: CODIGOS.PAC,
          mensagem: 'Quantidade de planos de ação divergente.',
          detalhe: { encontrado: pac.length, esperado: 12 },
        })
      }
      for (let i = 0; i < pac.length; i++) {
        const p = pac[i]
        if (!ehObjeto(p) || !p.pac_id) {
          erros.push({
            codigo: CODIGOS.PAC,
            mensagem: 'Plano de ação no índice ' + i + ' sem pac_id ou não é objeto.',
            detalhe: { encontrado: typeof p, esperado: 'objeto com pac_id' },
          })
        }
      }
    }

    // R9 — Etapas (116) e R10 — 5W2H de cada etapa
    let totalEtapas = 0
    if (Array.isArray(pac)) {
      for (let i = 0; i < pac.length; i++) {
        const p = pac[i]
        const etapasDoPac = p && Array.isArray(p.etapas) ? p.etapas : []
        totalEtapas += etapasDoPac.length
        for (let j = 0; j < etapasDoPac.length; j++) {
          const et = etapasDoPac[j]
          if (!ehObjeto(et)) {
            erros.push({
              codigo: CODIGOS.W2H,
              mensagem: 'Etapa ' + j + ' do PAC ' + (i + 1) + ' não é objeto.',
              detalhe: { encontrado: typeof et, esperado: 'objeto com 5W2H' },
            })
            continue
          }
          const chaves5W2H = ['what', 'why', 'who', 'when', 'where', 'how', 'how_much']
          const faltando = chaves5W2H.filter(function (k) {
            const v = et[k]
            return v === undefined || v === null || (typeof v === 'string' && v.trim() === '')
          })
          if (faltando.length > 0) {
            erros.push({
              codigo: CODIGOS.W2H,
              mensagem: 'Etapa ' + j + ' do PAC ' + (i + 1) + ' com 5W2H incompleto.',
              detalhe: {
                encontrado: 'faltando: ' + faltando.join(', '),
                esperado: chaves5W2H.join(', '),
              },
            })
          }
        }
      }
      if (totalEtapas !== 116) {
        erros.push({
          codigo: CODIGOS.ETAPAS,
          mensagem: 'Total de etapas divergente (soma dos planos de ação).',
          detalhe: { encontrado: totalEtapas, esperado: 116 },
        })
      }
    }

    // R11 — OKRs (7) e matriz Hoshin (7 objetivos)
    const okrs = Array.isArray(pacote.okrs) ? pacote.okrs : null
    if (!okrs) {
      erros.push({
        codigo: CODIGOS.DESDOBRAMENTO,
        mensagem: 'Bloco "okrs" ausente ou não é array.',
        detalhe: { encontrado: null, esperado: 7 },
      })
    } else if (okrs.length !== 7) {
      erros.push({
        codigo: CODIGOS.DESDOBRAMENTO,
        mensagem: 'Quantidade de OKRs divergente.',
        detalhe: { encontrado: okrs.length, esperado: 7 },
      })
    }
    const hoshin = ehObjeto(pacote.matriz_hoshin) ? Object.keys(pacote.matriz_hoshin).length : 0
    if (hoshin !== 7) {
      avisos.push({
        codigo: CODIGOS.DESDOBRAMENTO,
        mensagem: 'Matriz Hoshin com quantidade de objetivos divergente (contagem indicativa).',
        detalhe: { encontrado: hoshin, esperado: 7 },
      })
    }

    return { ok: erros.length === 0, erros: erros, avisos: avisos }
  }

  // ---------- ETAPA E2-E: DETECÇÃO DE PARTE EM 4 NÍVEIS ----------
  // Causa-raiz E2-E: Pacote V2.0 usa "conteudo_fases" e "projetos_e_planos"
  // (com valor null na Parte A). O detectarParte antigo olhava chaves
  // inexistentes (dre/fases/projetos/planos_acao/okrs) → 415 na Parte A real.

  // "presente_não_vazio" | "null" | "ausente" (para objetos)
  function statusBlocoObjeto(v) {
    if (v === null) return 'null'
    if (v === undefined) return 'ausente'
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0)
      return 'presente_não_vazio'
    if (typeof v === 'object') return 'presente_vazio'
    return 'presente'
  }

  // "presente" | "null" | "ausente" (para chaves auxiliares)
  function statusBlocoSimples(v) {
    if (v === null) return 'null'
    if (v === undefined) return 'ausente'
    return 'presente'
  }

  // Bloco de conteúdo presente = objeto NÃO-nulo com pelo menos 1 chave
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
        // valor existe mas não é A/B/AB → indeterminado (415 com campo_parte preenchido)
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

    // ETAPA E2-E — detecção em 4 níveis (analisarDeteccao acima)
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

    // 3. Validação (11 regras defensivas, modo auditoria)
    const resultadoA = regraDefensiva('validarParteA', function () {
      return validarParteA(pacote)
    })
    const resultadoB = regraDefensiva('validarParteB', function () {
      return validarParteB(pacote)
    })

    const erros = []
    const avisos = []
    if (parte === 'A' || parte === 'AB') {
      for (let i = 0; i < (resultadoA.erros || []).length; i++) erros.push(resultadoA.erros[i])
      for (let i = 0; i < (resultadoA.avisos || []).length; i++) avisos.push(resultadoA.avisos[i])
    }
    if (parte === 'B' || parte === 'AB') {
      for (let i = 0; i < (resultadoB.erros || []).length; i++) erros.push(resultadoB.erros[i])
      for (let i = 0; i < (resultadoB.avisos || []).length; i++) avisos.push(resultadoB.avisos[i])
    }

    return e.json(200, {
      ok: true,
      valido: erros.length === 0,
      parte: parte,
      parte_detectada: parte,
      metodo_deteccao: metodo || null,
      dossie_id: ehObjeto(pacote) && typeof pacote.dossie_id === 'string' ? pacote.dossie_id : '',
      blocos: [
        {
          bloco: 'Parte A (Fases, DRE, EREC, Gabarito, Não-tráfega)',
          status: resultadoA.ok ? 'ok' : 'erro',
          erros: resultadoA.erros,
          avisos: resultadoA.avisos,
        },
        {
          bloco: 'Parte B (PRJ, PAC, Etapas/5W2H, OKRs)',
          status: resultadoB.ok ? 'ok' : 'erro',
          erros: resultadoB.erros,
          avisos: resultadoB.avisos,
        },
      ],
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

    // Detecção em 4 níveis — cópia inline idêntica às rotas acima
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
        entrada: { schema_versao: '2.0', conteudo_fases: { P1: { status: 'concluida' } } },
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
          conteudo_fases: { P1: { status: 'concluida' }, P7: { status: 'parcial' } },
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
  const CODIGOS = {
    JSON_INVALIDO: 'PACOTE_V2_JSON_INVALIDO_401',
    SCHEMA: 'PACOTE_V2_SCHEMA_INVALIDO_402',
    FASES: 'PACOTE_V2_FASES_INVALIDAS_403',
    DRE: 'PACOTE_V2_DRE_INVALIDA_404',
    PARTE_INDETERMINADA: 'PACOTE_V2_PARTE_INDETERMINADA_415',
    PARTE_INCOERENTE: 'PACOTE_V2_PARTE_INCOERENTE_416',
  }
  const CODIGO_INTERNO = 'PACOTE_V2_ERRO_INTERNO_500'

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
          },
        ],
        avisos: [],
      }
    }
  }

  // Revalidação compacta ANTES de persistir (mesmo critério da rota /validar)
  function validarParteAIng(p) {
    const erros = []
    const avisos = []
    if (!ehObjeto(p)) {
      erros.push({
        codigo: CODIGOS.SCHEMA,
        mensagem: 'Pacote ausente ou não é um objeto JSON válido.',
      })
      return { ok: false, erros: erros, avisos: avisos }
    }
    if (!(typeof p.dossie_id === 'string' && p.dossie_id)) {
      erros.push({ codigo: CODIGOS.SCHEMA, mensagem: 'Campo obrigatório ausente: dossie_id.' })
    }
    const fases = ehObjeto(p.fases) ? p.fases : null
    if (!fases) {
      erros.push({
        codigo: CODIGOS.FASES,
        mensagem: 'Bloco "fases" ausente ou inválido (esperado objeto com chaves 1..8).',
        detalhe: { encontrado: null, esperado: 'objeto com chaves 1..8' },
      })
    } else if (Object.keys(fases).length < 8) {
      erros.push({
        codigo: CODIGOS.FASES,
        mensagem:
          'Bloco "fases" incompleto: esperadas 8 fases, encontradas ' +
          Object.keys(fases).length +
          '.',
        detalhe: { encontrado: Object.keys(fases).length, esperado: 8 },
      })
    }
    let dre = p.dre
    if (!ehObjeto(dre) && Array.isArray(p.dre)) dre = { linhas: p.dre }
    if (!ehObjeto(dre)) {
      erros.push({
        codigo: CODIGOS.DRE,
        mensagem: 'Bloco "dre" ausente ou inválido (esperado objeto com array "linhas").',
        detalhe: { encontrado: null, esperado: 'objeto { linhas: [...] }' },
      })
    } else {
      const linhas = Array.isArray(dre.linhas) ? dre.linhas : []
      const linhasConta = []
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
        if (ehSubtotal) continue
        linhasConta.push(l)
      }
      const qtdConta = linhasConta.length
      if (qtdConta < 15 || qtdConta > 18) {
        erros.push({
          codigo: CODIGOS.DRE,
          mensagem:
            'DRE fora da faixa aceitável de LINHAS DE CONTA (15 a 18, ignorando subtotais e cabeçalhos).',
          detalhe: { encontrado: qtdConta, esperado: '15 a 18 linhas de conta' },
        })
      }
      for (let i = 0; i < linhasConta.length; i++) {
        const f = linhasConta[i].fonte
        const temFonte = typeof f === 'string' ? f.trim().length > 0 : !!f
        if (!temFonte) {
          erros.push({
            codigo: CODIGOS.DRE,
            mensagem: 'Linhas de conta da DRE sem o campo obrigatório "fonte".',
            detalhe: { encontrado: 'linha ' + (i + 1), esperado: 'todas com fonte' },
          })
          break
        }
      }
    }
    return { ok: erros.length === 0, erros: erros, avisos: avisos }
  }

  function validarParteBIng(p) {
    const erros = []
    const avisos = []
    if (!ehObjeto(p)) {
      erros.push({
        codigo: CODIGOS.SCHEMA,
        mensagem: 'Pacote ausente ou não é um objeto JSON válido.',
      })
      return { ok: false, erros: erros, avisos: avisos }
    }
    const prj = Array.isArray(p.projetos) ? p.projetos : null
    if (!prj || prj.length !== 6) {
      erros.push({
        codigo: 'PACOTE_V2_PRJ_INVALIDO_408',
        mensagem: 'Quantidade de projetos divergente.',
        detalhe: { encontrado: prj ? prj.length : null, esperado: 6 },
      })
    }
    const pac = Array.isArray(p.planos_acao) ? p.planos_acao : null
    if (!pac || pac.length !== 12) {
      erros.push({
        codigo: 'PACOTE_V2_PAC_INVALIDO_409',
        mensagem: 'Quantidade de planos de ação divergente.',
        detalhe: { encontrado: pac ? pac.length : null, esperado: 12 },
      })
    }
    let totalEtapas = 0
    if (Array.isArray(pac)) {
      for (let i = 0; i < pac.length; i++) {
        const pa = pac[i]
        totalEtapas += pa && Array.isArray(pa.etapas) ? pa.etapas.length : 0
      }
      if (totalEtapas !== 116) {
        erros.push({
          codigo: 'PACOTE_V2_ETAPAS_INVALIDAS_410',
          mensagem: 'Total de etapas divergente (soma dos planos de ação).',
          detalhe: { encontrado: totalEtapas, esperado: 116 },
        })
      }
    }
    const okrs = Array.isArray(p.okrs) ? p.okrs : null
    if (!okrs || okrs.length !== 7) {
      erros.push({
        codigo: 'PACOTE_V2_DESDOBRAMENTO_INVALIDO_413',
        mensagem: 'Quantidade de OKRs divergente.',
        detalhe: { encontrado: okrs ? okrs.length : null, esperado: 7 },
      })
    }
    return { ok: erros.length === 0, erros: erros, avisos: avisos }
  }

  // ---------- ETAPA E2-E: DETECÇÃO DE PARTE EM 4 NÍVEIS (cópia inline) ----------
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

    // 3. Revalida inline (mesmo critério da rota /validar) ANTES de persistir
    const resultadoA = regraDefensiva('validarParteA', function () {
      return validarParteAIng(pacote)
    })
    const resultadoB = regraDefensiva('validarParteB', function () {
      return validarParteBIng(pacote)
    })

    const erros = []
    const avisos = []
    if (parte === 'A' || parte === 'AB') {
      for (let i = 0; i < (resultadoA.erros || []).length; i++) erros.push(resultadoA.erros[i])
      for (let i = 0; i < (resultadoA.avisos || []).length; i++) avisos.push(resultadoA.avisos[i])
    }
    if (parte === 'B' || parte === 'AB') {
      for (let i = 0; i < (resultadoB.erros || []).length; i++) erros.push(resultadoB.erros[i])
      for (let i = 0; i < (resultadoB.avisos || []).length; i++) avisos.push(resultadoB.avisos[i])
    }

    if (erros.length > 0) {
      return e.json(422, {
        ok: false,
        valido: false,
        parte: parte,
        dossie_id: dossieId,
        blocos: [
          {
            bloco: 'Parte A',
            status: resultadoA.ok ? 'ok' : 'erro',
            erros: resultadoA.erros,
            avisos: resultadoA.avisos,
          },
          {
            bloco: 'Parte B',
            status: resultadoB.ok ? 'ok' : 'erro',
            erros: resultadoB.erros,
            avisos: resultadoB.avisos,
          },
        ],
        erros: erros,
        avisos: avisos,
        motivo: 'Ingestão bloqueada: validação reprovada.',
      })
    }

    // 4. Persistência (registro NOVO por ingestão — histórico da E2-B)
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

    // 5. Contadores de propagação (resumo do que foi processado)
    const prj = Array.isArray(pacote.projetos) ? pacote.projetos.length : 0
    const pac = Array.isArray(pacote.planos_acao) ? pacote.planos_acao.length : 0
    let etapas = 0
    if (Array.isArray(pacote.planos_acao)) {
      for (let i = 0; i < pacote.planos_acao.length; i++) {
        const p = pacote.planos_acao[i]
        if (p && Array.isArray(p.etapas)) etapas += p.etapas.length
      }
    }
    const okrs = Array.isArray(pacote.okrs) ? pacote.okrs.length : 0
    const hoshin = ehObjeto(pacote.matriz_hoshin) ? Object.keys(pacote.matriz_hoshin).length : 0
    const rituais = Array.isArray(pacote.rituais) ? pacote.rituais.length : 0

    return e.json(200, {
      ok: true,
      valido: true,
      parte: parte,
      prj: prj,
      pac: pac,
      etapas: etapas,
      okrs: okrs,
      hoshin: hoshin,
      rituais: rituais,
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
