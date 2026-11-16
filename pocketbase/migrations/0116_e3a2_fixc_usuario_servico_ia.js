/// <reference path="../pb_data/types.d.ts" />
// E3-A-2-FIX-C: usuário de serviço para as chamadas IA de backend da Etapa 5
// (motor determinístico + Etapa 5 IA do pacote FORMATO 1). O guia de agentes
// exige user_id REAL da collection users em toda chamada $ai.agent().chat.
// Idempotente: nada faz se o e-mail já existir.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!app.findAuthRecordByEmail('users', 'svc-pipeline@vetormaster.com.br')) {
      const svc = new Record(users)
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
      const svc = app.findAuthRecordByEmail('users', 'svc-pipeline@vetormaster.com.br')
      if (svc) app.delete(svc)
    } catch (_) {}
  },
)
