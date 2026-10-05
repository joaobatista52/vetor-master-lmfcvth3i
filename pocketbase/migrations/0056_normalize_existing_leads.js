migrate(
  (app) => {
    // Atualizar os registros de leads existentes com os dados do objeto cadastro que estavam dentro de dados_completos
    const leads = app.findRecordsByFilter('leads', '', '-created', 100, 0)
    for (let i = 0; i < leads.length; i++) {
      const rec = leads[i]
      const dados = rec.get('dados_completos')
      if (dados && dados.cadastro) {
        const cad = dados.cadastro
        if (!rec.getString('nome_completo'))
          rec.set('nome_completo', cad.nomeCompleto || cad.nome || '')
        if (!rec.getString('razao_social'))
          rec.set('razao_social', cad.empresa || cad.razaoSocial || cad.razao_social || '')
        if (!rec.getString('cnpj')) rec.set('cnpj', cad.cnpj || '')
        if (!rec.getString('cargo')) rec.set('cargo', cad.cargo || '')
        if (!rec.getString('email')) rec.set('email', cad.email || cad.emailCorporativo || '')
        if (!rec.getString('whatsapp')) rec.set('whatsapp', cad.whatsapp || cad.telefone || '')
        if (!rec.getString('faturamento_mensal'))
          rec.set('faturamento_mensal', cad.faturamento || '')
        if (!rec.getString('responsavel_envio'))
          rec.set('responsavel_envio', cad.nomeCompleto || '')
        app.save(rec)
      }
    }
  },
  (app) => {},
)
