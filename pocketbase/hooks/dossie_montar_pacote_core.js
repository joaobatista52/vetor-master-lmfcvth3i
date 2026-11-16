/// <reference path="../pb_data/types.d.ts" />

/**
 * E3-A-2-CLOSE-3 — MÓDULO CORE das Etapas 4+5 (montagem do Pacote V2.0).
 *
 * Cópia VERBATIM do núcleo que reside DENTRO do callback do POST
 * /backend/v1/dossie/montar-pacote (dossie_formato1.js, Bloqueio 1 — escopo
 * JSVM), extraída para módulo CommonJS (padrão dossie_versoes_helper.js) para
 * permitir execução DIRETA NO HOOK pelo gatilho cron da E3-A-2-CLOSE-3, sem
 * chamada HTTP interna (que morria com "context canceled" aos ~44s de timeout).
 *
 * A rota POST NÃO foi alterada — mantém sua cópia inline (padrão E2-A de cópias
 * paralelas, já declarado no projeto). Nenhum comportamento, contagem, helper,
 * ID determinístico ou validação foi modificado aqui; única adição: detalhe de
 * duração/status por chamada de IA (custoIa.detalhe_chamadas) para evidência.
 *
 * Tabelas/collections: SOMENTE LEITURA (corte E3-A-1 contínuo) — nada grava.
 */

function executarMontagemPacoteE3A2(leadId) {
  const T0 = Date.now()

  // ---------- Tabela de contagens por nível (Comando E3-A-2 item 4b — Comando 0 V2.2) ----------
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
    // CORREÇÃO E3-A-2-FIX-B (Tabela 2.1): SaaS Puro = Essencial e
    // MaaS Híbrido = Completo — as duas linhas estavam trocadas.
    // Buffett: Essencial = 4, Completo = 7 ou 8 (mantida a forma [min, max]).
    // DRE: Essencial = 8 a 10 (intervalo), Completo = 15 (valor único).
    'MaaS Híbrido': {
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
    'SaaS Puro': {
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

  // ======================= E3-A-2 · Etapa 5: 5 SLOTS DE CONTEXTO =======================
  // Carrega os 5 Slots de contexto do agente jbp-gestao-master (Seção 11 do
  // System Prompt V7.2 A5–A10). Slot sem conteúdo no ambiente => retorna vazio
  // com marca de ausência; NUNCA bloqueia a execução por slot ausente.
  // Retorno: { identificador, carregou, entradas } por slot (entradas = []).

  function carregarSlotsContextoE3A2(leadRec) {
    function slotVazio(identificador, motivo) {
      return { identificador: identificador, carregou: false, entradas: [], ausencia: motivo }
    }

    // Slot 1 + 4: System Prompt integral do agente nativo (agentes_versoes,
    // última versão do jbp-gestao-master). Slot 1 = Contexto Estratégico Global
    // V7.2; Slot 4 = Histórico Profissional Detalhado JBP (mesma fonte, fatias).
    let slot1 = slotVazio('slot_1_contexto_estrategico_global_v72', 'agentes_versoes indisponível')
    let slot4 = slotVazio('slot_4_historico_profissional_jbp', 'agentes_versoes indisponível')
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
        if (sp.length > 0) {
          slot1 = {
            identificador: 'slot_1_contexto_estrategico_global_v72',
            carregou: true,
            entradas: [sp.substring(0, 3000)],
          }
          slot4 = {
            identificador: 'slot_4_historico_profissional_jbp',
            carregou: sp.length > 3000,
            entradas: sp.length > 3000 ? [sp.substring(3000, 6000)] : [],
            ausencia: sp.length > 3000 ? null : 'system_prompt abaixo de 3000 caracteres',
          }
        }
      }
    } catch (_) {
      // coleção agentes_versoes indisponível no ambiente — slots ficam vazios
    }

    // Slot 2: Master Framework V2.4 (frameworks — áreas 1 a 8)
    let slot2 = slotVazio('slot_2_master_framework_v24', 'frameworks indisponível')
    try {
      const recsFr = $app.findRecordsByFilter('frameworks', '', 'area_numero', 8, 0)
      if (recsFr && recsFr.length > 0) {
        const digFr = []
        for (let i = 0; i < recsFr.length; i++) {
          digFr.push(
            'Área ' +
              recsFr[i].get('area_numero') +
              ' — ' +
              recsFr[i].get('titulo') +
              ': ' +
              String(recsFr[i].get('conteudo') || '').substring(0, 300),
          )
        }
        slot2 = {
          identificador: 'slot_2_master_framework_v24',
          carregou: true,
          entradas: digFr,
        }
      }
    } catch (_) {
      // coleção frameworks indisponível — slot fica vazio
    }

    // Slot 3: Biblioteca Profissional V2.4 (livros)
    let slot3 = slotVazio('slot_3_biblioteca_profissional_v24', 'livros indisponível')
    try {
      const recsLv = $app.findRecordsByFilter('livros', '', '-created', 15, 0)
      if (recsLv && recsLv.length > 0) {
        const digLv = []
        for (let i = 0; i < recsLv.length; i++) {
          digLv.push(
            String(recsLv[i].get('titulo') || '') + ' — ' + String(recsLv[i].get('autor') || ''),
          )
        }
        slot3 = {
          identificador: 'slot_3_biblioteca_profissional_v24',
          carregou: true,
          entradas: digLv,
        }
      }
    } catch (_) {
      // coleção livros indisponível — slot fica vazio
    }

    // Slot 5: Demonstrativos do cliente (anexos do lead — rotativo)
    let slot5 = slotVazio(
      'slot_5_demonstrativos_cliente',
      leadRec ? 'sem anexos no lead' : 'lead não carregado',
    )
    try {
      if (leadRec) {
        const camposAnexo = ['documentacao_adicional', 'certificacoes', 'contrato_social']
        const digAn = []
        for (let i = 0; i < camposAnexo.length; i++) {
          const v = leadRec.get(camposAnexo[i])
          if (v && (typeof v !== 'string' || v.trim())) {
            digAn.push(camposAnexo[i] + '=' + JSON.stringify(v).substring(0, 500))
          }
        }
        if (digAn.length > 0) {
          slot5 = {
            identificador: 'slot_5_demonstrativos_cliente',
            carregou: true,
            entradas: digAn,
          }
        }
      }
    } catch (_) {
      // anexos do lead indisponíveis — slot fica vazio
    }

    const slots = [slot1, slot2, slot3, slot4, slot5]
    return {
      slots: slots,
      total_carregados: slots.filter(function (s) {
        return s.carregou
      }).length,
    }
  }

  // Contexto compacto por fase — comprime os 5 Slots por relevância à fase
  // pedida (identificadorFase, ex.: 'P3'), com teto rígido de caracteres por
  // bloco. NÃO despeja os 5 slots inteiros em cada chamada (teto US$ 0,25).
  // Retorno: texto pronto para concatenar no prompt de IA.

  function construirContextoCompactoE3A2(slotsCarregados, identificadorFase) {
    const TETO_CARACTERES = 2400
    const fase = String(identificadorFase || '')
    const partes = []

    // Peso por slot conforme a fase — fases de causa raiz/estratégia pesam o
    // Slot 1 (Contexto Estratégico Global); desdobramento pesa o Slot 2
    // (Master Framework); auditoria/consolidação pesam mais o Slot 3.
    function peso(f, n) {
      const nT = parseInt(String(n).replace(/[^0-9]/g, ''), 10)
      if (f.indexOf('F1') !== -1 || f.indexOf('P1') !== -1 || f.indexOf('P3') !== -1) {
        return n === 1 ? 1200 : n === 2 ? 600 : n === 4 ? 300 : 100
      }
      if (f.indexOf('P4') !== -1 || f.indexOf('P5') !== -1 || f.indexOf('P6') !== -1) {
        return n === 2 ? 1200 : n === 1 ? 600 : n === 4 ? 300 : 100
      }
      if (f.indexOf('P10') !== -1 || f.indexOf('P12') !== -1 || f.indexOf('P13') !== -1) {
        return n === 3 ? 1200 : n === 1 ? 600 : n === 2 ? 300 : 100
      }
      return n === 1 ? 600 : n === 2 ? 600 : n === 3 ? 300 : n === 4 ? 200 : 100
    }

    if (slotsCarregados && Array.isArray(slotsCarregados.slots)) {
      for (let i = 0; i < slotsCarregados.slots.length; i++) {
        const s = slotsCarregados.slots[i]
        if (!s || !s.carregou) continue
        const teto = peso(fase, i + 1)
        if (teto <= 0) continue
        const dig = (s.entradas || []).join(' | ').substring(0, teto)
        if (dig) {
          partes.push('[' + s.identificador + '] ' + dig)
        }
      }
    }
    const marcadosAusentes = []
    if (slotsCarregados && Array.isArray(slotsCarregados.slots)) {
      for (let i = 0; i < slotsCarregados.slots.length; i++) {
        const s = slotsCarregados.slots[i]
        if (!s || !s.carregou) marcadosAusentes.push(s ? s.identificador : 'slot_' + (i + 1))
      }
    }
    if (marcadosAusentes.length > 0) {
      partes.push('SLOTS AUSENTES (não bloqueiam a execução): ' + marcadosAusentes.join(', '))
    }
    return partes.join('\n').substring(0, TETO_CARACTERES)
  }

  // ------------------------------- corpo do núcleo -------------------------------
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
    return {
      status: 404,
      payload: {
        ok: false,
        codigo_erro: 'LEAD_NAO_ENCONTRADO',
        motivo: 'Lead não encontrado: ' + leadId,
      },
    }
  }

  function recStrE3(nome) {
    try {
      const v = leadRec.get(nome)
      return v === undefined || v === null || typeof v === 'object' ? '' : String(v)
    } catch (_) {
      return ''
    }
  }
  // CORREÇÃO MÍNIMA E3-A-2-FIX-C (divergência declarada): na JSVM, campos JSON
  // lidos via findRecordById().get() chegam como BYTES UTF-8 crus (objeto com
  // length e índices numéricos — provado em runtime na lead Aurora
  // t8zia1qyovt9cof: 3.421 bytes iniciando por 123,34,97,...). O parser
  // anterior só tratava string/objeto e devolvia os bytes brutos, produzindo
  // 422 FORMATO1_AUSENTE em TODO lead real. Decodificação byte→UTF-8→JSON:
  function decodificarJsonBytesE3(v) {
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
      if (v && typeof v === 'object') {
        if (typeof v.length === 'number') {
          // bytes crus: decodifica; se falhar, null (não vaza bytes como objeto)
          const d = decodificarJsonBytesE3(v)
          return d || null
        }
        return v || null
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
    return {
      status: 422,
      payload: {
        ok: false,
        codigo_erro: 'FORMATO1_AUSENTE',
        motivo: 'dados_completos ausente ou inválido (não é objeto).',
      },
    }
  }
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
  const custoIa = {
    chamadas: 0,
    tokens_prompt: 0,
    tokens_resposta: 0,
    custo_usd: 0,
    detalhe_chamadas: [],
  }

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

  // E3-A-2-FIX-C: o guia de agentes exige user_id REAL (id da collection users)
  // em toda chamada $ai.agent().chat — sem ele o gateway responde
  // "user_id and message are required" (causa do teste 5 em v0.0.211).
  // Resolve o id do usuário de serviço criado pela migration 0116
  // (recordQuery, não findAuthRecordByEmail — este lança "no rows").
  let idUsuarioServicoIa = null
  try {
    idUsuarioServicoIa = $app.findFirstRecordByFilter(
      'users',
      "email = 'svc-pipeline@vetormaster.com.br'",
    ).id
  } catch (_) {
    idUsuarioServicoIa = null
  }
  console.log('[E3-A-2][ETAPA5] user_id serviço IA=' + (idUsuarioServicoIa || '(AUSENTE)'))

  function chatIaE3A2(rotulo, pergunta, fase) {
    const tC = Date.now()
    try {
      // Sem user_id REAL a chamada falha no gateway — cai no fallback
      // requer_verificacao, sem inferência (nada de chamar sabendo que falha).
      if (!idUsuarioServicoIa) {
        custoIa.detalhe_chamadas.push({
          rotulo: rotulo,
          ok: false,
          motivo: 'user_id de serviço ausente',
          duracao_ms: Date.now() - tC,
        })
        return null
      }
      if (typeof $ai !== 'undefined' && $ai.agent) {
        // Os 5 Slots viajam em TODA chamada (comando E3-A-2, Etapa 5 — contexto),
        // comprimidos por relevância à fase — NUNCA os 5 inteiros (teto de custo).
        const contextoCompacto = construirContextoCompactoE3A2(slotsContexto, fase || rotulo)
        const msg = (contextoCompacto ? contextoCompacto + '\n\n---\n\n' : '') + pergunta
        const resp = $ai
          .agent('jbp-gestao-master')
          .chat({ user_id: idUsuarioServicoIa, message: msg })
        registrarCustoIa(resp)
        const texto = (resp && resp.content) || ''
        custoIa.detalhe_chamadas.push({
          rotulo: rotulo,
          ok: !!(texto && texto.trim()),
          duracao_ms: Date.now() - tC,
        })
        if (texto && texto.trim()) return texto.trim()
      } else {
        custoIa.detalhe_chamadas.push({
          rotulo: rotulo,
          ok: false,
          motivo: 'gateway $ai indisponível',
          duracao_ms: Date.now() - tC,
        })
      }
      return null
    } catch (errIa) {
      console.log('[E3-A-2][ETAPA5] falha IA (' + rotulo + '): ' + (errIa && errIa.message))
      custoIa.detalhe_chamadas.push({
        rotulo: rotulo,
        ok: false,
        motivo: (errIa && errIa.message) || String(errIa),
        duracao_ms: Date.now() - tC,
      })
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
    'P3',
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
    'P1',
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
    'P4',
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
    'P5',
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
        detalhe_chamadas: custoIa.detalhe_chamadas,
      },
      blocos_ia: blocosIa,
      parte_a: pacote.parte_a,
      parte_b: pacote.parte_b,
      avisos: normalizado.avisos || [],
      duracao_ms: Date.now() - T0,
    },
  }
}

module.exports = { executarMontagemPacoteE3A2: executarMontagemPacoteE3A2 }
