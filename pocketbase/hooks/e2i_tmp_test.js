// E2-I — HOOK TEMPORÁRIO DE TESTE (REMOVER AO FINAL — NÃO PODE FICAR NA ÁRVORE)
// Rota admin-only: POST /api/e2i-tmp/validar  { parte: 'A'|'B', pacote: {...} }
// Rota admin-only: GET  /api/e2i-tmp/selftest → T1..T4
routerAdd(
  'POST',
  '/e2i-tmp/validar',
  (e) => {
    const auth = e.auth
    let okAdmin = false
    if (auth && auth.collection().name === 'users') {
      try {
        const papel = String(auth.get('papel') || '').toLowerCase()
        if (papel === 'admin') okAdmin = true
      } catch (err) {
        // campo papel ausente — segue
      }
      if (!okAdmin) {
        try {
          okAdmin = auth.isAdmin() === true
        } catch (err) {
          okAdmin = false
        }
      }
    }
    if (!okAdmin) return e.json(403, { erro: 'sem permissao' })

    const body = e.requestInfo().body || {}
    const parte = String(body.parte || '').toUpperCase()
    if (parte !== 'A' && parte !== 'B') return e.json(400, { erro: 'parte invalida' })
    let pacote = body.pacote
    if (typeof pacote === 'string') {
      try {
        pacote = JSON.parse(pacote)
      } catch (err) {
        return e.json(400, { erro: 'pacote nao e JSON valido' })
      }
    }
    const res = validarPacoteV2(pacote, parte)
    return e.json(200, res)
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/e2i-tmp/selftest',
  (e) => {
    const auth = e.auth
    let okAdmin = false
    if (auth && auth.collection().name === 'users') {
      try {
        const papel = String(auth.get('papel') || '').toLowerCase()
        if (papel === 'admin') okAdmin = true
      } catch (err) {
        // campo papel ausente — segue
      }
      if (!okAdmin) {
        try {
          okAdmin = auth.isAdmin() === true
        } catch (err) {
          okAdmin = false
        }
      }
    }
    if (!okAdmin) return e.json(403, { erro: 'sem permissao' })

    const r = {}
    const ehObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

    // T1 — Parte B Aurora (sintética fiel): plano_id, hoshin array, OE dentro de pep
    const dreB = []
    const contasB = [
      'Receita Bruta',
      'Deducoes',
      'Receita Liquida',
      'CMV',
      'Lucro Bruto',
      'Despesas Operacionais',
      'EBITDA',
      'Depreciacao',
      'EBIT',
      'Resultado Financeiro',
      'LAIR',
      'IR/CSLL',
      'Lucro Liquido',
      'Participacoes',
      'Lucro Liquido Final',
    ]
    for (let i = 0; i < contasB.length; i++) {
      dreB.push({ linha: i + 1, conta: contasB[i], valor: 1000 - i * 17 })
    }
    const parteB = {
      schema_versao: '2.0',
      dossie_id: 'e2i-selftest-b',
      artefatos_financeiros: { dre_15_linhas: dreB },
      projetos_e_planos: {
        objetivos_estrategicos: [1, 2, 3, 4, 5, 6, 7].map(function (n) {
          return { objetivo_id: 'OE' + n, titulo: 'Objetivo ' + n }
        }),
        projetos: [1, 2, 3, 4, 5, 6].map(function (n) {
          return {
            projeto_id: 'PRJ-' + (n < 10 ? '0' + n : n),
            objetivo_estrategico_id: 'OE' + n,
            titulo: 'Projeto ' + n,
          }
        }),
        planos_acao: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (n) {
          return {
            plano_id: 'PAC-' + (n < 10 ? '0' + n : n),
            projeto_id: 'PRJ-0' + (((n - 1) % 6) + 1),
            objetivo_estrategico_id: 'OE' + (((n - 1) % 7) + 1),
            etapas: [
              {
                o_que: 'x',
                por_que: 'x',
                onde: 'x',
                quem: 'x',
                quando: 'x',
                como: 'x',
                quanto: 'x',
              },
            ],
          }
        }),
        okrs: [1, 2, 3, 4, 5, 6, 7].map(function (n) {
          return {
            okr_id: 'OKR-' + n,
            objetivo_estrategico_id: 'OE' + n,
            projeto_id: 'PRJ-0' + (((n - 1) % 6) + 1),
            plano_id: n % 2 === 0 ? 'PAC-0' + n : null,
          }
        }),
        matriz_hoshin: [1, 2, 3, 4, 5, 6, 7].map(function (n) {
          return {
            objetivo_estrategico_id: 'OE' + n,
            area: 'Comercial',
            meta: 'M' + n,
            responsavel: 'R' + n,
            prazo: '2026-12-31',
          }
        }),
        rituais_desdobramento: [1, 2, 3, 4, 5].map(function (n) {
          return {
            ritual_nome: 'Ritual ' + n,
            frequencia: 'semanal',
            objeto: 'OE' + n,
            saida: 'S' + n,
          }
        }),
      },
    }
    const r1 = validarPacoteV2(parteB, 'B')
    r.t1 = { ok: r1.ok, erros: r1.erros, contagens: r1.contagens }

    // T2 — Parte B variante: pac_id + hoshin como OBJETO → deve seguir válido
    const variante = JSON.parse(JSON.stringify(parteB))
    variante.dossie_id = 'e2i-selftest-b2'
    const novosPlanos = []
    for (let i = 0; i < variante.projetos_e_planos.planos_acao.length; i++) {
      const p = variante.projetos_e_planos.planos_acao[i]
      const q = JSON.parse(JSON.stringify(p))
      q.pac_id = 'PAC-V' + i
      delete q.plano_id
      novosPlanos.push(q)
    }
    variante.projetos_e_planos.planos_acao = novosPlanos
    const hoshinObj = {}
    for (let n = 1; n <= 7; n++) hoshinObj['OE' + n] = { meta: 'M' + n }
    variante.projetos_e_planos.matriz_hoshin = hoshinObj
    const r2 = validarPacoteV2(variante, 'B')
    r.t2 = { ok: r2.ok, erros: r2.erros, contagens: r2.contagens }

    // T3 — Parte A sintética equivalente (EREC 4/5/5/6 = 20, gabarito 7)
    const parteA = {
      schema_versao: '2.0',
      dossie_id: 'e2i-selftest-a',
      artefatos_financeiros: {
        erec_a9: {
          secoes: {
            Eliminar: [1, 2, 3, 4].map(function (n) {
              return { item: 'E' + n }
            }),
            Reduzir: [1, 2, 3, 4, 5].map(function (n) {
              return { item: 'R' + n }
            }),
            Elevar: [1, 2, 3, 4, 5].map(function (n) {
              return { item: 'A' + n }
            }),
            Criar: [1, 2, 3, 4, 5, 6].map(function (n) {
              return { item: 'C' + n }
            }),
          },
        },
        gabarito_a8: {
          indicadores: [1, 2, 3, 4, 5, 6, 7].map(function (n) {
            return { nome: 'IND-' + n }
          }),
        },
        dre_15_linhas: dreB,
      },
      conteudo_fases: {},
      nao_trafega: {
        plano_de_contas: true,
        conciliacoes: true,
        folha_pagamento: true,
        contratos: true,
      },
    }
    for (let i = 1; i <= 13; i++) {
      parteA.conteudo_fases['P' + i] = { status: 'completo', resumo: 'Fase ' + i }
    }
    const r3 = validarPacoteV2(parteA, 'A')
    r.t3 = { ok: r3.ok, erros: r3.erros, contagens: r3.contagens }

    // T4 — partição A≠B: Parte B sem planos_acao → R8 bloqueia; a mesma Parte B
    // submetida como 'A' NÃO roda R7/R8 (nenhum erro de projetos/planos).
    const semPlanos = JSON.parse(JSON.stringify(parteB))
    semPlanos.dossie_id = 'e2i-selftest-t4'
    semPlanos.projetos_e_planos.planos_acao = null
    const rbSemPlanos = validarPacoteV2(semPlanos, 'B')
    const raSemPlanos = validarPacoteV2(semPlanos, 'A')
    const erroBEmA = []
    const errosA = raSemPlanos.erros || []
    for (let i = 0; i < errosA.length; i++) {
      const comp = String((errosA[i] && errosA[i].componente_validado) || '')
      if (comp.indexOf('projetos_e_planos') >= 0) erroBEmA.push(comp)
    }
    r.t4 = {
      bloqueiaB_semPlanos: rbSemPlanos.ok === false,
      rodaR7_R8_em_A: erroBEmA.length > 0,
      errosB: rbSemPlanos.erros,
      errosA: errosA,
    }
    r.particao_intacta = rbSemPlanos.ok === false && erroBEmA.length === 0

    return e.json(200, r)
  },
  $apis.requireAuth(),
)
