/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration 0092: Reiniciar registro de teste wor27cnyubs22ot para execução limpa do pipeline assíncrono
 *
 * Operação puramente operacional (limpeza de estado e acionamento):
 * - Limpa output_prompts ([]), fase_atual (0), status ("processando"), status_execucao ("enfileirado_async")
 * - Limpa dados residuais de DRE, EREC e custo_gateway da rodada anterior (remover, NUNCA deixar como novos)
 * - Preserva estritamente: lead 'beatekteste2026', autorizacao_devolutiva 'Não autorizo' (CS-20),
 *   origem_parceiro 'RGS', origem_tipo 'parceiro', versao_questionario 'V7.2', dados_entrada (dossiê).
 * - Leads reais 6e8y7ju5owgfpsl e t8zia1qyovt9cof NÃO são tocados.
 */
migrate(
  (app) => {
    try {
      const diagRec = app.findRecordById('diagnosticos', 'wor27cnyubs22ot')
      if (diagRec) {
        diagRec.set('output_prompts', [])
        diagRec.set('fase_atual', 0)
        diagRec.set('status', 'processando')
        diagRec.set('dre_normalizada_15_linhas', [])
        diagRec.set('estrutura_erec_a9', [])
        diagRec.set('gabarito_auditoria', null)
        diagRec.set('custo_gateway', null)
        diagRec.set('conversa_id', null)
        diagRec.set('historico_versoes', {})
        diagRec.set('versao_incremental', 8)
        diagRec.set('updated', new Date().toISOString())
        app.save(diagRec)
      }
    } catch (e) {
      console.log('Migration 0092: aviso ao limpar diagnóstico wor27cnyubs22ot: ' + e.message)
    }
  },
  (app) => {
    // down: no-op
  },
)
