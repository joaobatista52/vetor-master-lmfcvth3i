/// <reference path="../pb_data/types.d.ts" />
// E3-A-2-FIX-C: usuário de serviço para as chamadas IA de backend da Etapa 5
// (motor determinístico + Etapa 5 IA do pacote FORMATO 1). O guia de agentes
// exige user_id REAL da collection users em toda chamada $ai.agent().chat.
// Idempotente: nada faz se o e-mail já existir.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    // JSVM: findAuthRecordByEmail LANÇA "sql: no rows in result set" quando
    // o registro não existe (não devolve null) — por isso a v1 da 0116 falhava.
    // Busca por e-mail via recordQuery, que devolve null sem lançar.
    let svc = null
    try {
      svc = app
        .recordQuery('users')
        .andWhere($dbx.exp('email', '=', 'svc-pipeline@vetormaster.com.br'))
        .build()
        .one()
    } catch (_) {
      svc = null
    }
    if (!svc) {
      svc = new Record(users)
      svc.setEmail('svc-pipeline@vetormaster.com.br')
      svc.setPassword($security.randomString(32))
      svc.setVerified(true)
      svc.set('name', 'Serviço Pipeline (E3-A-2)')
      svc.set('role', 'user')
      app.save(svc)
    }
  },
  (app) => {
    // down: remove o usuário de serviço se existir
    try {
      const svc = app
        .recordQuery('users')
        .andWhere($dbx.exp('email', '=', 'svc-pipeline@vetormaster.com.br'))
        .build()
        .one()
      if (svc) app.delete(svc)
    } catch (_) {}
  },
)
