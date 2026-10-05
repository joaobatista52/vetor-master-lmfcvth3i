migrate(
  (app) => {
    // 0060: Assegurar status 'teste' para os dois leads de teste
    try {
      const leadFasd = app.findFirstRecordByData('leads', 'site_lead_id', 'uhvf600n9we2u6k')
      leadFasd.set('status', 'teste')
      app.save(leadFasd)
    } catch (_) {
      try {
        const leadFasdProto = app.findFirstRecordByData('leads', 'protocolo', '#VM-uhvf600n9we2u6k')
        leadFasdProto.set('status', 'teste')
        app.save(leadFasdProto)
      } catch (_) {}
    }

    try {
      const leadL = app.findFirstRecordByData('leads', 'site_lead_id', 'npunsti6w4gnok9')
      leadL.set('status', 'teste')
      app.save(leadL)
    } catch (_) {
      try {
        const leadLProto = app.findFirstRecordByData('leads', 'protocolo', '#VM-npunsti6w4gnok9')
        leadLProto.set('status', 'teste')
        app.save(leadLProto)
      } catch (_) {}
    }
  },
  (app) => {
    try {
      const leadFasd = app.findFirstRecordByData('leads', 'site_lead_id', 'uhvf600n9we2u6k')
      leadFasd.set('status', 'novo')
      app.save(leadFasd)
    } catch (_) {}

    try {
      const leadL = app.findFirstRecordByData('leads', 'site_lead_id', 'npunsti6w4gnok9')
      leadL.set('status', 'novo')
      app.save(leadL)
    } catch (_) {}
  },
)
