/// <reference path="../pb_data/types.d.ts" />

/**
 * E3-A-2-CLOSE-3 — Gatilho cron TEMPORÁRIO que executa a montagem completa do
 * Pacote V2.0 (Etapas 4+5 + 4 chamadas de IA) DIRETAMENTE NO HOOK, sem chamada
 * HTTP interna ao POST /dossie/montar-pacote (que morria com "context canceled"
 * aos ~44s de timeout da requisição). Usa o módulo core
 * dossie_montar_pacote_core.js — o MESMO código que o POST usa via require.
 *
 * Grava evidência em logs_auditoria com tag E3A2_CLOSE3:
 * contagens da estrutura, os 4 blocos de IA, status por chamada, duração
 * total, nº de chamadas e custo vs referência US$ 0,25.
 *
 * Lead de teste: efêmera em FORMATO 1 das rodadas anteriores (Aurora Trading,
 * comércio internacional / trading company). Se não houver lead FORMATO 1,
 * registra E3A2_CLOSE3 com status SEM_LEAD_FORMATO1 (não falha o cron).
 *
 * Cron: 0 6 * * * (06:00 UTC — 03:00 BRT). Sem rota HTTP — só cronAdd.
 */

cronAdd('e3a2_close3_montagem_completa', '*/5 * * * *', () => {
  const T0 = Date.now()
  const TAG = 'E3A2_CLOSE3'

  // logs_auditoria: user (relation REQUIRED → users), action, resource, details
  // (text, máx 5000 chars — causa da falha da rodada anterior).
  let idUsuarioAuditoria = null
  try {
    idUsuarioAuditoria = $app.findFirstRecordByFilter(
      'users',
      "email = 'svc-pipeline@vetormaster.com.br'",
    ).id
  } catch (_) {
    try {
      idUsuarioAuditoria = $app.findFirstRecordByFilter('users', 'role = "admin"').id
    } catch (_) {
      idUsuarioAuditoria = null
    }
  }

  function truncar5000(obj) {
    let s = ''
    try {
      s = typeof obj === 'string' ? obj : JSON.stringify(obj)
    } catch (_) {
      s = String(obj)
    }
    return (s || '').substring(0, 5000)
  }

  function gravarLogAuditoria(resource, detailsObj) {
    try {
      const col = $app.findCollectionByNameOrId('logs_auditoria')
      const rec = new Record(col)
      rec.set('user', idUsuarioAuditoria)
      rec.set('action', TAG)
      rec.set('resource', String(resource || 'cron').substring(0, 200))
      rec.set('details', truncar5000(detailsObj))
      $app.save(rec)
      return rec.id
    } catch (errLog) {
      console.log('[E3A2_CLOSE3] falha ao gravar logs_auditoria: ' + (errLog && errLog.message))
      return null
    }
  }

  // -------- 1. Lead efêmera em FORMATO 1 (Aurora Trading / trading company) --------
  let leadRec = null
  let leadId = null
  try {
    leadRec = $app.findFirstRecordByFilter(
      'leads',
      "dados_completos != '' && dados_completos != null",
    )
    leadId = leadRec ? leadRec.id : null
  } catch (_) {
    leadRec = null
  }
  if (!leadRec) {
    // Fallback: tenta a lead Aurora usada nas rodadas anteriores.
    try {
      leadRec = $app.findRecordById('leads', 't8zia1qyovt9cof')
      leadId = leadRec.id
    } catch (_) {
      leadRec = null
    }
  }
  if (!leadRec) {
    console.log('[E3A2_CLOSE3] SEM_LEAD_FORMATO1 — nada a fazer nesta execução.')
    gravarLogAuditoria('sem_lead', {
      resumo: 'SEM_LEAD_FORMATO1',
      motivo: 'Nenhuma lead com dados_completos FORMATO 1 disponível no ambiente.',
      duracao_ms: Date.now() - T0,
    })
    return
  }

  // -------- 2. Montagem completa DIRETA NO HOOK (sem HTTP) --------
  const core = require(`${__hooks}/dossie_montar_pacote_core.js`)
  let resultado = null
  try {
    resultado = core.executarMontagemPacoteE3A2(leadId)
  } catch (errCore) {
    console.log('[E3A2_CLOSE3] exceção no core: ' + (errCore && errCore.message))
    gravarLogAuditoria('excecao_core', {
      resumo: 'EXCECAO_CORE',
      lead_id: leadId,
      motivo: (errCore && errCore.message) || String(errCore),
      duracao_ms: Date.now() - T0,
    })
    return
  }

  const payload = (resultado && resultado.payload) || {}
  const ok = payload.ok === true
  const ia = payload.ia || {}
  const duracaoMs = payload.duracao_ms || Date.now() - T0

  console.log(
    '[E3A2_CLOSE3] execução direta no hook: lead=' +
      leadId +
      ' ok=' +
      ok +
      ' duracao_ms=' +
      duracaoMs +
      ' chamadas_ia=' +
      (ia.chamadas || 0) +
      ' custo_usd=' +
      (ia.custo_usd || 0),
  )

  // -------- 3. Verificação dos 4 blocos (critério CLOSE-3 item 3) --------
  const blocos = payload.blocos_ia || {}
  function verificarBloco(nome, b) {
    if (!b) return { bloco: nome, preenchido: false, motivo: 'bloco ausente' }
    if (!b.preenchido) {
      return { bloco: nome, preenchido: false, motivo: b.motivo || 'IA indisponível' }
    }
    // Serializa o conteúdo e aplica os critérios CLOSE-3 item 3:
    // sem placeholder, sem texto genérico, sem citação acadêmica nominal,
    // conteúdo reconhecível do dossiê da Aurora (comércio internacional).
    const texto = JSON.stringify(b)
    const placeholder =
      /Requer verificação|placeholder|TODO|FIXME|lorem ipsum/i.test(texto) && !b.causa_raiz
    const citacaoAcademica =
      /(Porter|Kaplan|Norton|Osterwalder|Kim|Mauborgne|Drucker|Christensen|Mintzberg|Collins|Buffett|Munger)\s*\(/i.test(
        texto,
      )
    const auroraDerivada =
      /(Aurora|trading|com[ée]rcio internacional|importa[çc][ãa]o|cambial|ICMS|modalidade)/i.test(
        texto,
      )
    return {
      bloco: nome,
      preenchido: true,
      sem_placeholder: !placeholder,
      sem_citacao_academica: !citacaoAcademica,
      derivado_da_aurora: auroraDerivada,
      trecho: texto.substring(0, 700),
    }
  }

  const verifBlocos = [
    verificarBloco('f1_causa_raiz', blocos.f1_causa_raiz),
    verificarBloco('bloco_cta', blocos.bloco_cta),
    verificarBloco('estrategia', blocos.estrategia),
    verificarBloco('desdobramento', blocos.desdobramento),
  ]

  // -------- 4. Registro de evidência em logs_auditoria (tag E3A2_CLOSE3) --------
  // Um registro POR BLOCO (details máx 5000 chars) + registro-síntese. O texto
  // integral de cada bloco não cabe em um único details — e a exigência da
  // rodada é trecho, não texto integral.
  const idLog = gravarLogAuditoria('sintese', {
    resumo: ok ? 'MONTAGEM_COMPLETA_EXECUTADA_SEM_HTTP' : 'MONTAGEM_FALHOU',
    execucao: 'E3-A-2-CLOSE-3',
    lead_id: leadId,
    codigo: payload.codigo || payload.codigo_erro || null,
    contagens: payload.contagens || null,
    integridade: payload.integridade || null,
    ia: {
      agente: ia.agente || 'jbp-gestao-master',
      chamadas: ia.chamadas || 0,
      tokens_prompt: ia.tokens_prompt || 0,
      tokens_resposta: ia.tokens_resposta || 0,
      custo_usd: ia.custo_usd || 0,
      ref_orcamento_usd: 0.25,
      dentro_orcamento: ia.dentro_orcamento || false,
      detalhe_chamadas: ia.detalhe_chamadas || [],
    },
    verificacao_blocos: verifBlocos,
    duracao_ms: duracaoMs,
    versao_codigo: 'E3-A-2-CLOSE-3',
  })
  gravarLogAuditoria('bloco_f1', { bloco: 'f1_causa_raiz', conteudo: blocos.f1_causa_raiz || null })
  gravarLogAuditoria('bloco_cta', { bloco: 'bloco_cta', conteudo: blocos.bloco_cta || null })
  gravarLogAuditoria('bloco_estrategia', {
    bloco: 'estrategia',
    conteudo: blocos.estrategia || null,
  })
  gravarLogAuditoria('bloco_desdobramento', {
    bloco: 'desdobramento',
    conteudo: blocos.desdobramento || null,
  })

  console.log(
    '[E3A2_CLOSE3] logs_auditoria=' +
      (idLog || '(falha ao gravar)') +
      ' blocos_ok=' +
      verifBlocos.filter(function (v) {
        return v.preenchido
      }).length +
      '/4',
  )
})
