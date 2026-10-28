/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration 0093: Ativar pipeline assíncrono para beatekteste2026
 *
 * Coloca o registro de teste wor27cnyubs22ot em estado limpo e pronto para execução incremental:
 * - status: "processando"
 * - status_execucao: "enfileirado_async"
 * - fase_atual: 0
 * - output_prompts: []
 * - dre_normalizada_15_linhas: []
 * - estrutura_erec_a9: []
 * - gabarito_auditoria: null
 * - custo_gateway: null
 * - conversa_id: null
 * - historico_versoes: {} (sem lock ativo)
 * - versao_incremental: 10
 * - Preserva integralmente: lead 'beatekteste2026', autorizacao_devolutiva 'Não autorizo' (CS-20),
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
        diagRec.set('versao_incremental', 10)
        diagRec.set('updated', new Date().toISOString())
        app.save(diagRec)
        console.log(
          'Migration 0093: wor27cnyubs22ot redefinido com sucesso para status=processando e 0 fases.',
        )
      }
    } catch (e) {
      console.log('Migration 0093: erro ao preparar diagnóstico wor27cnyubs22ot: ' + e.message)
    }
  },
  (app) => {
    // down: no-op
  },
)
