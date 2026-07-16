migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    usersCol.verification = true

    usersCol.verificationTemplate = {
      subject: 'Bem-vindo ao Vetor Master! Confirme seu e-mail',
      body:
        '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:Inter,Arial,sans-serif;background:#F8FAFC;">' +
        '<div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">' +
        '<div style="background:#1E293B;padding:28px 32px;text-align:center;">' +
        '<h1 style="color:#F8FAFC;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Vetor Master</h1>' +
        '<p style="color:#94A3B8;margin:4px 0 0;font-size:13px;">Estratégia que liberta o fundador</p>' +
        '</div>' +
        '<div style="padding:32px;">' +
        '<h2 style="color:#1E293B;margin:0 0 16px;font-size:20px;font-weight:600;">Bem-vindo ao Vetor Master!</h2>' +
        '<p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px;">Olá! Estamos muito felizes em ter você conosco. Sua jornada para superar a "prisão do fundador" começa agora.</p>' +
        '<p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">Para ativar sua conta e acessar todos os recursos da plataforma, confirme seu endereço de e-mail:</p>' +
        '<div style="text-align:center;margin:32px 0;">' +
        '<a href="{{APP_URL}}/_/#/auth/confirm-verification/{{TOKEN}}" style="background:#3B82F6;color:#F8FAFC;padding:14px 32px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;display:inline-block;">Confirmar Meu E-mail</a>' +
        '</div>' +
        '<p style="color:#94A3B8;font-size:13px;line-height:1.5;margin:24px 0 0;">Se você não criou uma conta, pode ignorar este e-mail com segurança.</p>' +
        '</div>' +
        '<div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;">' +
        '<p style="color:#94A3B8;font-size:12px;margin:0;">© 2026 Vetor Master. Todos os direitos reservados.</p>' +
        '</div>' +
        '</div>' +
        '</body></html>',
    }

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

    usersCol.confirmEmailChangeTemplate = {
      subject: 'Confirme a alteração de e-mail - Vetor Master',
      body:
        '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:Inter,Arial,sans-serif;background:#F8FAFC;">' +
        '<div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">' +
        '<div style="background:#1E293B;padding:28px 32px;text-align:center;">' +
        '<h1 style="color:#F8FAFC;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Vetor Master</h1>' +
        '</div>' +
        '<div style="padding:32px;">' +
        '<h2 style="color:#1E293B;margin:0 0 16px;font-size:20px;font-weight:600;">Confirme a alteração de e-mail</h2>' +
        '<p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">Você solicitou a alteração do e-mail associado à sua conta no Vetor Master. Confirme a alteração clicando no botão abaixo:</p>' +
        '<div style="text-align:center;margin:32px 0;">' +
        '<a href="{{APP_URL}}/_/#/auth/confirm-email-change/{{TOKEN}}" style="background:#3B82F6;color:#F8FAFC;padding:14px 32px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;display:inline-block;">Confirmar Alteração</a>' +
        '</div>' +
        '<p style="color:#94A3B8;font-size:13px;line-height:1.5;margin:24px 0 0;">Se você não solicitou esta alteração, ignore este e-mail.</p>' +
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
    usersCol.verification = false
    app.save(usersCol)
  },
)
