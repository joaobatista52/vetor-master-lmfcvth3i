//
// E2-T — HOOK TEMPORÁRIO DE TESTE do fluxo de recuperação de senha.
// Dispara UM e-mail de reset para um e-mail fixo (guarda em memória impede repetição).
// NÃO altera senha, NÃO altera verified, NÃO cria/deleta usuário.
// Será removido após o teste.
//
cronAdd('e2t_teste_reset_once', '* * * * *', () => {
  try {
    if ($app.store().get('e2t_reset_enviado')) return
    $app.store().set('e2t_reset_enviado', true)
    const EMAIL_ALVO = 'joao.batista@vetormaster.com.br'
    const registro = $app.findAuthRecordByEmail('users', EMAIL_ALVO)
    $mails.sendRecordPasswordReset($app, registro)
    console.log('[E2T] envio de reset disparado sem exceção')
  } catch (err) {
    console.log('[E2T] erro: ' + (err && err.message ? err.message : String(err)))
  }
})
