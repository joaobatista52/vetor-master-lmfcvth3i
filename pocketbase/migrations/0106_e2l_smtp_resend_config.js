// 0106 — E2-L FASE 1: configuração SMTP via Resend (remetente de teste).
//
// Método (reportado na rodada): o JSVM do PocketBase não expõe
// $app.settings() em migrations — a aplicação efetiva das mailer settings
// é feita pelo hook onBootstrap pocketbase/hooks/e2l_smtp_resend.js, que
// lê a chave do secret RESEND_API_KEY (nunca de arquivo do repositório).
// Esta migration grava de forma durável a configuração do mailer no
// registro integracoes_site[chave=mailer_smtp] (collection criada na 0054),
// para auditoria e idempotência entre boots/copias do projeto.
//
// Remetente de teste: onboarding@resend.dev (limitação da Fase 1).
// O domínio vetormaster.com.br NÃO é configurado aqui (Fase 2).
//
// Vedação: nenhuma collection de negócio, hook de validação ou código de
// aplicação é alterado. A chave da Resend NUNCA é persistida em código —
// o registro de auditoria guarda apenas a referência ao nome do secret.

migrate(
  (app) => {
    const MAILER_DESCRICAO =
      'E2-L Fase 1 — SMTP Resend (remetente de teste onboarding@resend.dev); senha via secret RESEND_API_KEY, nunca gravada aqui'

    let rec = null
    try {
      rec = app.findFirstRecordByData('integracoes_site', 'chave', 'mailer_smtp')
    } catch (_) {
      rec = null
    }
    if (!rec) {
      rec = new Record(app.findCollectionByNameOrId('integracoes_site'))
      rec.set('chave', 'mailer_smtp')
      rec.set('site_backend_url', 'smtp.resend.com')
      rec.set('site_sync_email', 'resend:onboarding@resend.dev')
      rec.set('site_sync_password', '(secret RESEND_API_KEY — valor NUNCA gravado no banco)')
    }
    rec.set('descricao', MAILER_DESCRICAO)
    rec.set('ativo', true)
    app.save(rec)
  },
  (app) => {
    try {
      const rec = app.findFirstRecordByData('integracoes_site', 'chave', 'mailer_smtp')
      app.delete(rec)
    } catch (_) {
      // nada a reverter
    }
  },
)
