/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration 0086 — Gatilho do Pipeline Assíncrono JBP Gestão Master V7.2.3-A9 (Dry-Run Beatek)
 *
 * REGRA DE OURO / AUDITORIA:
 * Migrations do PocketBase rodam dentro de transações de banco com timeout curto e NÃO
 * comportam a execução síncrona de 13 chamadas a modelos em tier reasoning.
 * Portanto, esta migration atua exclusivamente como GATILHO IDEMPOTENTE:
 * 1) Enfileira o registro de teste Beatek (wor27cnyubs22ot) para execução assíncrona;
 * 2) Configura as flags de estado assíncrono e dry-run estrito;
 * 3) A execução real das 13 fases ocorre de forma desvinculada da transação da migration,
 *    via endpoint assíncrono / worker com gravação incremental fase a fase.
 *
 * Vedação absoluta: nenhum valor de saída (tokens, custo, DRE, valuation) é fabricado aqui.
 */

migrate(
  (app) => {
    console.log('Migration 0086: Configurando gatilho do mecanismo assíncrono para Beatek...')

    const leadId = 'beatekteste2026'
    const diagId = 'wor27cnyubs22ot'

    try {
      const diagRec = app.findRecordById('diagnosticos', diagId)
      if (diagRec) {
        diagRec.set('status_execucao', 'enfileirado_async')
        diagRec.set('motor_execucao', 'jbp-gestao-master-assincrono')
        diagRec.set('versao_questionario', 'V7.2')
        diagRec.set('dry_run', true)
        diagRec.set('updated', new Date().toISOString())
        app.save(diagRec)
        console.log(
          'Migration 0086: Diagnóstico wor27cnyubs22ot enfileirado para execução assíncrona.',
        )
      }
    } catch (errDiag) {
      console.log(
        'Migration 0086: Registro de diagnóstico wor27cnyubs22ot não encontrado diretamente:',
        errDiag.message,
      )
    }

    try {
      const logsCol = app.findCollectionByNameOrId('logs_auditoria')
      let adminUser = null
      try {
        adminUser = app.findFirstRecordByData('users', 'role', 'admin')
      } catch (_) {}

      const auditRec = new Record(logsCol)
      if (adminUser) {
        auditRec.set('user', adminUser.id)
      }
      auditRec.set('action', 'Migration 0086 — Gatilho Assíncrono Configurado')
      auditRec.set('resource', 'diagnosticos')
      auditRec.set(
        'details',
        'Migration 0086 convertida em gatilho idempotente sem bloqueio de transação. ' +
          'Pipeline real de 13 fases configurado para execução assíncrona incremental sobre beatekteste2026 (diagnóstico wor27cnyubs22ot). ' +
          'Zero e-mails / WhatsApp disparados (dry-run estrito mantido).',
      )
      app.save(auditRec)
      console.log('Migration 0086: Log de auditoria registrado com sucesso.')
    } catch (errLog) {
      console.log('Migration 0086: Aviso ao registrar log de auditoria:', errLog.message)
    }
  },
  (app) => {
    console.log('Rollback Migration 0086 (no-op idempotente).')
  },
)
