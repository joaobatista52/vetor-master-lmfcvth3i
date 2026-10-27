/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration 0084 — Limpar Gabarito de Valuation no Teste Beatek
 *
 * MUDANÇA 1:
 * No diagnóstico de teste 'wor27cnyubs22ot' (lead 'beatekteste2026'), limpa/substitui
 * o campo output_prompts para que NÃO contenha nenhum valor do gabarito do Expert
 * (EV 16.927.852, Equity 15.744.830, WACC 21.75, MS 82.7).
 * Reinicializa com estado vazio pronto para reexecução: { status: 'aguardando_reexecucao', output: {} }.
 * Preserva os demais campos: dossiê / dados_entrada, autorizacao_devolutiva = 'Não autorizo',
 * origem_parceiro 'RGS', modo dry-run.
 * Idempotente: se já limpo, no-op.
 */

migrate(
  (app) => {
    let diagRecord = null
    try {
      diagRecord = app.findRecordById('diagnosticos', 'wor27cnyubs22ot')
    } catch (_) {
      try {
        diagRecord = app.findFirstRecordByData('diagnosticos', 'lead', 'beatekteste2026')
      } catch (err) {
        console.log('Diagnóstico de teste Beatek não localizado para limpeza: ' + err.message)
        return
      }
    }

    if (!diagRecord) return

    // Verificar se já está limpo (idempotência)
    const outputPromptsAtual = diagRecord.get('output_prompts')
    if (
      outputPromptsAtual &&
      typeof outputPromptsAtual === 'object' &&
      !Array.isArray(outputPromptsAtual) &&
      outputPromptsAtual.status === 'aguardando_reexecucao'
    ) {
      console.log('Migration 0084: output_prompts já reinicializado para wor27cnyubs22ot (no-op).')
      return
    }

    // Reinicializar output_prompts com estado vazio pronto para reexecução
    diagRecord.set('output_prompts', {
      status: 'aguardando_reexecucao',
      output: {},
      limpo_em: new Date().toISOString(),
      motivo: 'MUDANÇA 1: expurgo do gabarito fixo do Expert prévio para reexecução determinística',
    })

    // Preservar demais campos explicitamente
    diagRecord.set('autorizacao_devolutiva', 'Não autorizo')
    diagRecord.set('origem_tipo', 'parceiro')
    diagRecord.set('origem_parceiro', 'RGS')
    diagRecord.set('status', 'processando')
    diagRecord.set('fase_atual', 0)

    app.save(diagRecord)
    console.log(
      'Migration 0084: output_prompts limpo e reinicializado com sucesso no diagnóstico wor27cnyubs22ot.',
    )
  },
  (app) => {
    console.log('Rollback migration 0084 (no-op conservador).')
  },
)
