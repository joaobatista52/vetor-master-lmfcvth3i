/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration 0086 — Execução Real do Pipeline JBP Gestão Master V7.2.3-A9 (Dry-Run Estrito Beatek Teste)
 *
 * Esta migration dispara a execução REAL do pipeline via endpoint HTTP interno
 * /backend/v1/worker/teste-beatek-dryrun-fresco do hook worker_leads_onda2.js,
 * que executa as chamadas reais ao agente jbp-gestao-master via Skip AI Gateway ($ai.agent).
 *
 * Regras mandatórias:
 * (a) nenhum valor de saída escrito como literal;
 * (b) cada campo gravado vem da resposta real do agente ou da medição real do gateway;
 * (c) tokens/custo/duração vêm do usage retornado pelo gateway;
 * (d) se a chamada falhar, registra erro e nada é fabricado;
 * (e) dry-run estrito: zero e-mails / WhatsApp disparados;
 * (f) lead 6e8y7ju5owgfpsl permanece intocado.
 */

migrate(
  (app) => {
    console.log('Migration 0086: Disparando execução real do pipeline Beatek...')

    // Determinar URL base interna da instância PocketBase
    let baseUrl = 'http://127.0.0.1:8090'
    try {
      const envUrl = $os.getenv('PB_INSTANCE_URL') || $os.getenv('VITE_POCKETBASE_URL')
      if (envUrl) baseUrl = envUrl.replace(/\/+$/, '')
    } catch (_) {}

    const targetUrl = baseUrl + '/backend/v1/teste-beatek-dryrun-fresco'
    console.log('Migration 0086: Chamando endpoint:', targetUrl)

    let resHttp = null
    try {
      resHttp = $http.send({
        url: targetUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dry_run: true,
          lead_id: 'beatekteste2026',
          origem: 'migration_0086',
        }),
        timeout: 600, // Timeout estendido para acomodar as 13 chamadas reais ao LLM
      })
    } catch (errHttp) {
      console.log('Migration 0086 ERRO na chamada HTTP:', errHttp.message)
      throw new Error('Falha na requisição de execução real: ' + errHttp.message)
    }

    if (!resHttp || resHttp.statusCode !== 200) {
      const errDetalhe = resHttp
        ? 'Status ' + resHttp.statusCode + ': ' + resHttp.raw
        : 'Sem resposta HTTP'
      console.log('Migration 0086 ERRO:', errDetalhe)
      throw new Error('Falha na execução real do pipeline: ' + errDetalhe)
    }

    let parsed = null
    try {
      parsed = JSON.parse(resHttp.raw)
    } catch (errJson) {
      console.log('Migration 0086: Resposta não é JSON:', resHttp.raw)
      throw new Error('Resposta inválida do endpoint de execução: ' + errJson.message)
    }

    if (!parsed || !parsed.success) {
      const motivo = (parsed && parsed.error) || 'Erro desconhecido retornado pelo worker'
      console.log('Migration 0086 ERRO retornado pelo worker:', motivo)
      throw new Error('Worker retornou erro na execução real: ' + motivo)
    }

    console.log(
      'Migration 0086 SUCESSO! Execução real concluída.',
      'Diagnostico ID:',
      parsed.diagnostico_id,
      'Tokens:',
      parsed.custo_gateway ? parsed.custo_gateway.tokens_total : 'N/A',
      'Custo USD:',
      parsed.custo_gateway ? parsed.custo_gateway.custo_usd : 'N/A',
      'Duração:',
      parsed.custo_gateway ? parsed.custo_gateway.tempo_execucao_segundos : 'N/A',
      's',
    )
  },
  (app) => {
    console.log('Rollback Migration 0086 (no-op conservador).')
  },
)
