// 0107 — E2-L: template de e-mail de REDEFINIÇÃO DE SENHA apontando para o app.
//
// Config de mailer (não é código de aplicação). O template anterior (0011)
// montava o link com {{APP_URL}}/_/#/auth/confirm-password-reset/{{TOKEN}}
// (rota do painel admin do PB). O app do usuário usa a rota pública
// /redefinir-senha?token=... (E2-H v2) — o link agora aponta para ela.
// {{APP_URL}} é resolvido pelo PocketBase com settings.meta.appUrl.
// Idempotente; reversão restaura o template da 0011.
migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.resetPasswordTemplate = {
      subject: 'Redefinição de Senha - Vetor Master',
      body:
        '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:Inter,Arial,sans-serif;background:#F8FAFC;">' +
        '<div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">' +
        '<div style="background:#1E293B;padding:28px 32px;text-align:center;">' +
        '<h1 style="color:#F8FAFC;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Vetor Master</h1>' +
        '<p style="color:#94A3B8;margin:4px 0 0;font-size:13px;">Estratégia que liberta o fundador</p>' +
        '</div>' +
        '<div style="padding:32px;">' +
        '<h2 style="color:#1E293B;margin:0 0 16px;font-size:20px;font-weight:600;">Redefinição de Senha</h2>' +
        '<p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">Recebemos uma solicitação para redefinir a senha da sua conta no Vetor Master. Clique no botão abaixo para criar uma nova senha:</p>' +
        '<div style="text-align:center;margin:32px 0;">' +
        '<a href="{{APP_URL}}/redefinir-senha?token={{TOKEN}}" style="background:#10B981;color:#F8FAFC;padding:14px 32px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;display:inline-block;">Redefinir Minha Senha</a>' +
        '</div>' +
        '<p style="color:#94A3B8;font-size:13px;line-height:1.5;margin:24px 0 0;">Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.</p>' +
        '</div>' +
        '<div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;">' +
        '<p style="color:#94A3B8;font-size:12px;margin:0;">© 2026 Vetor Master. Todos os direitos reservados.</p>' +
        '</div>' +
        '</div>' +
        '</body></html>',
    }
    app.save(usersCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.resetPasswordTemplate = {
      subject: 'Redefinição de Senha - Vetor Master',
      body:
        '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:Inter,Arial,sans-serif;background:#F8FAFC;">' +
        '<div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">' +
        '<div style="background:#1E293B;padding:28px 32px;text-align:center;">' +
        '<h1 style="color:#F8FAFC;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Vetor Master</h1>' +
        '</div>' +
        '<div style="padding:32px;">' +
        '<h2 style="color:#1E293B;margin:0 0 16px;font-size:20px;font-weight:600;">Redefinição de Senha</h2>' +
        '<p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">Recebemos uma solicitação para redefinir a senha da sua conta no Vetor Master. Clique no botão abaixo para criar uma nova senha:</p>' +
        '<div style="text-align:center;margin:32px 0;">' +
        '<a href="{{APP_URL}}/_/#/auth/confirm-password-reset/{{TOKEN}}" style="background:#10B981;color:#F8FAFC;padding:14px 32px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;display:inline-block;">Redefinir Minha Senha</a>' +
        '</div>' +
        '<p style="color:#94A3B8;font-size:13px;line-height:1.5;margin:24px 0 0;">Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.</p>' +
        '</div>' +
        '<div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;">' +
        '<p style="color:#94A3B8;font-size:12px;margin:0;">© 2026 Vetor Master. Todos os direitos reservados.</p>' +
        '</div>' +
        '</div>' +
        '</body></html>',
    }
    app.save(usersCol)
  },
)
