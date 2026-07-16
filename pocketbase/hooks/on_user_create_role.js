onRecordCreate((e) => {
  const email = e.record.getString('email')
  if (email === 'joao.batista@qgassist.com.br') {
    e.record.set('role', 'admin')
  } else if (!e.record.getString('role')) {
    e.record.set('role', 'user')
  }
  e.next()
}, 'users')
