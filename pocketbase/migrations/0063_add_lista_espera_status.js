migrate(
  (app) => {
    // 1. Atualizar lead existente 'Trading - Comércio Internacional Lrda.' ou de Origem 'Lista de Prioridade SaaS'
    // ou sem campo 'respostas' estruturado para status 'lista_espera'
    const leads = app.findRecordsByFilter('leads', '', '-created', 200, 0)
    for (let i = 0; i < leads.length; i++) {
      const rec = leads[i]
      const statusActual = (rec.getString('status') || '').toLowerCase()
      // Não sobrescrever 'teste'
      if (statusActual === 'teste') continue

      const orig = rec.getString('origem') || ''
      const origTipo = rec.getString('origem_tipo') || ''
      const dados = rec.get('dados_completos') || {}
      const dadosOrigem =
        (dados && (dados.origem || (dados.cadastro && dados.cadastro.origem))) || ''
      const respostas = rec.get('respostas') || {}
      const respostasOrigem = (respostas && respostas.origem) || ''

      const isPrioridade =
        orig.toLowerCase().includes('prioridade') ||
        origTipo.toLowerCase().includes('prioridade') ||
        dadosOrigem.toLowerCase().includes('prioridade') ||
        respostasOrigem.toLowerCase().includes('prioridade')

      if (isPrioridade) {
        rec.set('status', 'lista_espera')
        app.save(rec)
      }
    }
  },
  (app) => {
    // Reverter caso necessário
  },
)
