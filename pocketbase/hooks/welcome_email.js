onRecordAfterCreateSuccess((e) => {
  try {
    const userId = e.record.id
    const email = e.record.getString('email')

    if (!email) return e.next()

    try {
      const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
      const record = new Record(logsCol)
      record.set('user', userId)
      record.set('action', 'Welcome Email')
      record.set('resource', 'users')
      record.set('details', 'E-mail de boas-vindas enviado para ' + email)
      $app.save(record)
    } catch (logErr) {
      $app.logger().error('welcome email audit log failed', 'error', logErr.message)
    }

    if (!e.record.getBool('verified')) {
      const baseUrl = $os.getenv('VITE_POCKETBASE_URL') || ''
      if (baseUrl) {
        try {
          var res = $http.send({
            url: baseUrl + '/api/collections/users/request-verification',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email }),
            timeout: 15,
          })
          if (res.statusCode >= 400) {
            $app
              .logger()
              .warn(
                'welcome email request returned non-200',
                'status',
                res.statusCode,
                'email',
                email,
              )
          } else {
            $app.logger().info('welcome email triggered via hook', 'email', email)
          }
        } catch (sendErr) {
          $app
            .logger()
            .warn(
              'welcome email send skipped (verification may have been auto-sent)',
              'error',
              sendErr.message,
              'email',
              email,
            )
        }
      }
    }
  } catch (err) {
    $app.logger().error('welcome email hook error', 'error', err.message)
  }
  return e.next()
}, 'users')
