//
// E2-L / E2-O — SMTP Resend + appUrl de PRODUÇÃO
//
// Aplica, no boot do PocketBase, as mailer settings apontando para o SMTP da
// Resend e fixa settings.meta.appUrl na URL de PRODUÇÃO do app
// (decisão do titular, rodada E2-O — sem barra final). O preview
// (--preview.goskip.app) muda a cada rodada e NÃO serve de base para os
// links dos e-mails. A chave NUNCA vive em código: é lida do secret do
// backend ($os.getenv / $secrets.get, nome: RESEND_API_KEY).
//
// Idempotência de appUrl: aplicado a cada boot (o valor real sobrescreve
// qualquer placeholder vazio ou localhost). O registro
// integracoes_site[chave=mailer_smtp] (migration 0106) guarda a configuração
// para auditoria/idempotência (sem valor de chave).
//
// Vedação respeitada: nenhum arquivo de aplicação é tocado; hooks de
// validação (pacote_v2.js) intocados; domínio vetormaster.com.br NÃO é
// configurado aqui (Fase 2).
//
var E2O_APP_URL = 'https://saas-pme-estrategico-10019.goskip.app'

onBootstrap((e) => {
  var appUrlAplicado = ''
  try {
    var RESEND_HOST = 'smtp.resend.com'
    var RESEND_PORT = 465
    var RESEND_USER = 'resend'
    var RESEND_FROM = 'onboarding@resend.dev'
    var RESEND_FROM_NAME = 'Adapta ONE'

    var apiKey = $os.getenv('RESEND_API_KEY') || ''
    if (!apiKey && $secrets.has('RESEND_API_KEY')) {
      apiKey = $secrets.get('RESEND_API_KEY') || ''
    }
    if (!apiKey) {
      console.log(
        '[E2L_SMTP] secret RESEND_API_KEY ausente — mailer Resend não aplicado neste boot',
      )
      return e.next()
    }

    var settings = $app.settings()
    var smtp = settings.meta.smtp
    smtp.enabled = true
    smtp.host = RESEND_HOST
    smtp.port = RESEND_PORT
    smtp.username = RESEND_USER
    smtp.password = apiKey
    smtp.tls = true
    smtp.authMethod = 'PLAIN'
    smtp.localName = ''
    settings.meta.senderAddress = RESEND_FROM
    settings.meta.senderName = RESEND_FROM_NAME
    // E2-O: appUrl real de produção, sempre aplicado (sem barra final).
    // Substitui o placeholder localhost:5173 da Fase 1.
    settings.meta.appUrl = E2O_APP_URL
    appUrlAplicado = settings.meta.appUrl
    $app.save(settings)
    console.log(
      '[E2L_SMTP/E2O] mailer aplicado: host=' +
        RESEND_HOST +
        ' port=' +
        RESEND_PORT +
        ' tls=true authMethod=PLAIN from=' +
        RESEND_FROM +
        ' fromName=' +
        RESEND_FROM_NAME +
        ' appUrl=' +
        appUrlAplicado,
    )
  } catch (err) {
    console.log(
      '[E2L_SMTP/E2O] falha ao aplicar settings de e-mail: ' +
        (err && err.message ? err.message : String(err)),
    )
    try {
      var logCol = $app.findCollectionByNameOrId('logs_auditoria')
      var rec = new Record(logCol)
      rec.set('user', '56r96tnoumhph2z')
      rec.set('action', 'E2L Bootstrap SMTP')
      rec.set('resource', 'settings')
      rec.set('details', 'ERRO: ' + (err && err.message ? err.message : String(err)))
      $app.save(rec)
    } catch (_) {}
  }
  return e.next()
})
