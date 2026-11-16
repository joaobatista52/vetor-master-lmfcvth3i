/// <reference path="../pb_data/types.d.ts" />
// E3-A-2-CLOSE-2: apaga o marcador de re-exercício da rodada anterior
// (logs_auditoria action='E3A2_CLOSE_TESTE5' — id qwp7plka1u0ptbn), para que o
// gatilho e3a2close_gatilho_temp2 re-exercite o POST /dossie/montar-pacote uma
// única vez. Remove também leads-resíduo de exercício (status='teste',
// origem_tipo='exercicio') caso tenham sobrado de execução interrompida.
// Idempotente: nada faz se o marcador não existir.
//
// NOTA (CLOSE-2): o marcador ANTIGO também é apagado pelo próprio gatilho em
// runtime (ele distingue o marcador antigo, sem a tag "close2", do marcador
// desta rodada) — porque a migration corre só no boot do ambiente de deploy.
migrate(
  (app) => {
    // 1) Marcador de evidência do teste anterior (bloqueia o re-exercício)
    try {
      const marcador = app
        .recordQuery('logs_auditoria')
        .andWhere($dbx.exp('action', '=', 'E3A2_CLOSE_TESTE5'))
        .build()
        .all()
      for (let i = 0; i < marcador.length; i++) app.delete(marcador[i])
    } catch (_) {}

    // 2) Resíduos: leads efêmeras de exercício não removidas na mesma chamada
    try {
      const residuos = app
        .recordQuery('leads')
        .andWhere($dbx.exp('status', '=', 'teste'))
        .andWhere($dbx.exp('origem_tipo', '=', 'exercicio'))
        .build()
        .all()
      for (let i = 0; i < residuos.length; i++) app.delete(residuos[i])
    } catch (_) {}
  },
  (app) => {
    // down: nada a restaurar (o marcador é regravado pelo próprio exercício)
  },
)
