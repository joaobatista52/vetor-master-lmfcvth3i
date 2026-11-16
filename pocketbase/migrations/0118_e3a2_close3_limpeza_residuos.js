/// <reference path="../pb_data/types.d.ts" />
// E3-A-2-CLOSE-3: limpeza idempotente de resíduos das rodadas anteriores —
// leads efêmeras de exercício (status='teste', origem_tipo='exercicio') e
// logs_auditoria de evidência marcados como temporários (action começando com
// 'E3A2_' e resource começando com 'temp_'). Nada mais. Idempotente.
migrate(
  (app) => {
    // 1) Leads efêmeras de exercício não removidas na mesma chamada
    try {
      const residuos = app
        .recordQuery('leads')
        .andWhere($dbx.exp('status', '=', 'teste'))
        .andWhere($dbx.exp('origem_tipo', '=', 'exercicio'))
        .build()
        .all()
      for (let i = 0; i < residuos.length; i++) app.delete(residuos[i])
    } catch (_) {}

    // 2) Logs de evidência temporários de rodadas anteriores (não os desta
    //    rodada, que usam resource='sintese'/'bloco_*' sem prefixo temp_)
    try {
      const logs = app
        .recordQuery('logs_auditoria')
        .andWhere($dbx.exp('action', 'like', 'E3A2_%'))
        .build()
        .all()
      for (let i = 0; i < logs.length; i++) {
        const resource = String(logs[i].get('resource') || '')
        if (resource.indexOf('temp_') === 0) app.delete(logs[i])
      }
    } catch (_) {}
  },
  (app) => {
    // down: nada a restaurar
  },
)
