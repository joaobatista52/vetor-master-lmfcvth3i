migrate(
  (app) => {
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'joao.batista@qgassist.com.br')
    } catch (_) {
      var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var userRecord = new Record(usersCol)
      userRecord.setEmail('joao.batista@qgassist.com.br')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Admin')
      userRecord.set('role', 'admin')
      app.save(userRecord)
    }

    var fwCol = app.findCollectionByNameOrId('frameworks')
    var existingFw = 0
    try {
      existingFw = app.countRecords('frameworks')
    } catch (_) {}

    if (existingFw === 0) {
      var areas = [
        {
          n: 1,
          t: 'Estratégia & Visão Competitiva',
          c: 'Foco em definição de direção, posicionamento de mercado e diferenciação competitiva para superar a prisão do fundador.',
          r: 'Clean Text: mantenha a visão estratégica em uma página. Stress Test: questione se a estratégia sobrevive a 3 cenários adversos.',
        },
        {
          n: 2,
          t: 'Finanças & Gestão de Resultados',
          c: 'Controle financeiro, fluxo de caixa, margens e indicadores de rentabilidade para sustentar o crescimento.',
          r: 'Clean Text: dashboard financeiro com no máximo 7 indicadores. Stress Test: simule 90 dias sem receita.',
        },
        {
          n: 3,
          t: 'Operações & Eficiência de Processos',
          c: 'Otimização de processos, produtividade e eliminação de gargalos que travam a escalabilidade.',
          r: 'Clean Text: mapeie o fluxo de valor em uma página. Stress Test: identifique o impacto de 20% de aumento de demanda.',
        },
        {
          n: 4,
          t: 'Pessoas & Liderança',
          c: 'Gestão de talentos, cultura organizacional e desenvolvimento de lideranças para delegar com confiança.',
          r: 'Clean Text: defina a cultura em 5 princípios. Stress Test: avalie o que acontece se 2 líderes-chave saírem.',
        },
        {
          n: 5,
          t: 'Vendas & Crescimento',
          c: 'Estratégia comercial, funil de vendas, captação e retenção de clientes de forma previsível.',
          r: 'Clean Text: documente o funil de vendas em uma página. Stress Test: simule a perda do maior cliente.',
        },
        {
          n: 6,
          t: 'Tecnologia & Inovação',
          c: 'Transformação digital, automação e adoção de tecnologias estratégicas para ganho de eficiência.',
          r: 'Clean Text: priorize iniciativas por impacto x esforço. Stress Test: avalie o risco de 48h de indisponibilidade tecnológica.',
        },
        {
          n: 7,
          t: 'Governança & Compliance',
          c: 'Estrutura societária, conformidade legal e gestão de riscos para proteger o patrimônio.',
          r: 'Clean Text: mantenha um mapa de riscos em uma página. Stress Test: simule uma auditoria regulatória.',
        },
      ]
      for (var i = 0; i < areas.length; i++) {
        var r = new Record(fwCol)
        r.set('area_numero', areas[i].n)
        r.set('titulo', areas[i].t)
        r.set('conteudo', areas[i].c)
        r.set('regras_ouro', areas[i].r)
        app.save(r)
      }
    }

    var livrosCol = app.findCollectionByNameOrId('livros')
    var existingBooks = 0
    try {
      existingBooks = app.countRecords('livros')
    } catch (_) {}

    if (existingBooks === 0) {
      var books = [
        {
          titulo: 'A Primazia do Começo',
          autor: 'Simon Sinek',
          categoria: 'Liderança',
          resumo:
            'Por que algumas organizações inovam mais, confiam mais e são bem-sucedidas. Tudo começa com o porquê.',
        },
        {
          titulo: 'Pai Rico, Pai Pobre',
          autor: 'Robert Kiyosaki',
          categoria: 'Finanças',
          resumo:
            'O que os ricos ensinam a seus filhos sobre dinheiro e que a classe média e pobre não ensinam.',
        },
        {
          titulo: 'As 5 Disfunções de uma Equipe',
          autor: 'Patrick Lencioni',
          categoria: 'Gestão',
          resumo:
            'Um guia sobre os vícios que enfraquecem equipes e como superá-los para construir confiança.',
        },
      ]
      for (var j = 0; j < books.length; j++) {
        var br = new Record(livrosCol)
        br.set('titulo', books[j].titulo)
        br.set('autor', books[j].autor)
        br.set('categoria', books[j].categoria)
        br.set('resumo', books[j].resumo)
        app.save(br)
      }
    }
  },
  (app) => {
    try {
      app.db().newQuery('DELETE FROM frameworks WHERE 1=1').execute()
    } catch (_) {}
    try {
      app.db().newQuery('DELETE FROM livros WHERE 1=1').execute()
    } catch (_) {}
  },
)
