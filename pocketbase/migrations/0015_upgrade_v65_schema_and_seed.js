/// <reference path="../pb_data/types.d.ts" />
// V6.5 Upgrade — atualiza coleções estrategicas e re-semeia dados V6.5.
// - frameworks: area_numero max 7 -> 8 (adicionada Area 8: Foresight)
// - setores: NOVA colecao (10 setores + questionarios dos 3 Pilares)
// - diagnosticos: adiciona campo setor + fase_atual
// - re-seed frameworks (8 areas), livros (138 obras V2.4) e setores (10)
migrate(
  (app) => {
    // --- 1. Atualiza colecao `frameworks`: area_numero max 7 -> 8 ---
    var fwCol = app.findCollectionByNameOrId('frameworks')
    var areaField = fwCol.fields.getByName('area_numero')
    if (areaField) {
      areaField.max = 8
    }
    app.save(fwCol)

    // --- 2. Cria colecao `setores` ---
    try {
      app.findCollectionByNameOrId('setores')
    } catch (_) {
      var setoresCol = new Collection({
        name: 'setores',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
          { name: 'nome', type: 'text', required: true },
          { name: 'slug', type: 'text', required: true },
          { name: 'segmentos', type: 'json' },
          { name: 'micro_epifanias', type: 'json' },
          { name: 'perguntas', type: 'json' },
          { name: 'ordem', type: 'number', onlyInt: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_setores_slug ON setores (slug)'],
      })
      app.save(setoresCol)
    }

    // --- 3. Adiciona campos a `diagnosticos` ---
    var diagCol = app.findCollectionByNameOrId('diagnosticos')
    if (!diagCol.fields.getByName('setor')) {
      diagCol.fields.add(new TextField({ name: 'setor' }))
    }
    if (!diagCol.fields.getByName('fase_atual')) {
      diagCol.fields.add(new NumberField({ name: 'fase_atual', onlyInt: true, min: 1, max: 8 }))
    }
    app.save(diagCol)

    // --- 4. Re-semeia `frameworks` com 8 areas V6.5 ---
    app.db().newQuery('DELETE FROM frameworks WHERE 1=1').execute()
    var areas = [
      {
        n: 1,
        t: 'Estrategia',
        c: 'Mapear o mercado com precisao cirurgica e definir posicionamento disruptivo para capturar valor exponencial. Canvas As Is/To Be, 5 Forcas, Oceano Azul, ERRC.',
        r: 'Clean Text: voz direta e sem adjetivacao. Stress Test: ROI > 30% a.a. e margem de seguranca > 50%. Proibida citacao academica.',
      },
      {
        n: 2,
        t: 'Execucao e Qualidade',
        c: 'Garantir implementacao da estrategia com excelencia operacional. Regra Camaleao (Agile/Waterfall), Hoshin Kanri, OKRs, rituais de gestao.',
        r: 'Adaptar cadencia a maturidade organizacional. OKRs alinhados via Hoshin Kanri.',
      },
      {
        n: 3,
        t: 'Lideranca e Governanca',
        c: 'Estruturar lideranca de alta performance, planos de sucessao e governanca corporativa. Tiers A/B/C, Conselhos, Compliance e ESG.',
        r: 'Tolerancia zero a desvios eticos ou financeiros. Shadow leadership trimestral.',
      },
      {
        n: 4,
        t: 'Inovacao e Tecnologia',
        c: 'Transformar tecnologia em vantagem competitiva absoluta (Moat). Auditoria de legados, Cloud, BI, IA Generativa/RAG, automacao.',
        r: 'Stress Test: toda tecnologia deve ampliar o Moat ou reduzir custo marginal em > 50%.',
      },
      {
        n: 5,
        t: 'Marketing e Vendas',
        c: 'Construcao de uma Maquina de Vendas Previsivel. ICP, Piramide de Chet Holmes, SDR/CRM, LTV/CAC > 4:1, upsell estruturado.',
        r: 'Upsell rate anual meta 30%. Otimizacao constante via inbound e upsell.',
      },
      {
        n: 6,
        t: 'Financas e Economia',
        c: 'Engenharia Financeira e Protecao de Capital. Motor Deterministico: DRE, Fluxo de Caixa, Valuation FCD + Gordon. WACC 13,75%. OBZ.',
        r: 'Valuation DCF com atualizacao trimestral. OPEX e SEMPRE SG&A + P&D/R&D + Outros Diretos.',
      },
      {
        n: 7,
        t: 'Gestao de Riscos e Compliance',
        c: 'Blindagem do Moat e Perenidade. Matriz de Calor, Compliance Juridico (LGPD, NDAs), Sucessao, Tolerancia Zero.',
        r: 'Tolerancia zero a desvios eticos ou financeiros. Mitigacao de riscos vermelhos em 90 dias.',
      },
      {
        n: 8,
        t: 'Foresight Estrategico',
        c: 'Preparar a organizacao para volatilidade e incerteza, criando vantagem antecipatoria. STEEP/PESTEL, Cone dos Futuros, Cenarios 2x2, Backcasting.',
        r: 'Integracao: Foresight alimenta o Planejamento Estrategico via SWOT dinamica e OKRs flexiveis.',
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

    // --- 5. Re-semeia `livros` com Biblioteca V2.4 (138 obras) ---
    app.db().newQuery('DELETE FROM livros WHERE 1=1').execute()
    var livrosCol = app.findCollectionByNameOrId('livros')
    var livros = [
      ['Vantagem Competitiva', 'Michael E. Porter', 1, 'Estrategia Competitiva e Posicionamento'],
      ['Competicao', 'Michael E. Porter', 1, 'Estrategia Competitiva e Posicionamento'],
      ['Estrategia Competitiva', 'Michael E. Porter', 1, 'Estrategia Competitiva e Posicionamento'],
      [
        'Estrategia - A Busca da Vantagem Competitiva',
        'C. K. Prahalad, Gary Hamel, Mintzberg et al.',
        1,
        'Estrategia Competitiva e Posicionamento',
      ],
      [
        'A Arte da Guerra - Edicao Completa',
        'Sun Tzu',
        1,
        'Estrategia Competitiva e Posicionamento',
      ],
      [
        'A Estrategia do Oceano Azul',
        'W. Chan Kim & Renee Mauborgne',
        1,
        'Estrategia Competitiva e Posicionamento',
      ],
      [
        'A Transicao para o Oceano Azul',
        'W. Chan Kim & Renee Mauborgne',
        1,
        'Estrategia Competitiva e Posicionamento',
      ],
      ['A Revolta de Atlas', 'Ayn Rand', 1, 'Estrategia Competitiva e Posicionamento'],
      [
        'Business Model Generation - Inovacao em Modelos de Negocios',
        'Alexander Osterwalder & Yves Pigneur',
        1,
        'Modelos de Negocio e Inovacao de Valor',
      ],
      ['De Zero a Um', 'Peter Thiel', 1, 'Modelos de Negocio e Inovacao de Valor'],
      [
        'A Riqueza na Base da Piramide',
        'C. K. Prahalad',
        1,
        'Modelos de Negocio e Inovacao de Valor',
      ],
      [
        'Transformando Problemas em Oportunidades',
        'Berthold Gunster',
        1,
        'Modelos de Negocio e Inovacao de Valor',
      ],
      [
        'Planejamento Estrategico',
        'Idalberto Chiavenato & Arao Sapiro',
        1,
        'Planejamento Estrategico Classico',
      ],
      [
        'Organizacao Orientada para a Estrategia',
        'Kaplan & Norton',
        1,
        'Planejamento Estrategico Classico',
      ],
      ['Mapas Estrategicos', 'Kaplan & Norton', 1, 'Planejamento Estrategico Classico'],
      ['Alinhamento', 'Kaplan & Norton', 1, 'Planejamento Estrategico Classico'],
      [
        "The Harvard Business Review Entrepreneur's Handbook",
        'HBR Press',
        1,
        'Guias Praticos para Planos de Negocios',
      ],
      [
        'The Ernst & Young Business Plan Guide',
        'Brian R. Ford, Jay M. Bornstein & Patrick T. Pruitt',
        1,
        'Guias Praticos para Planos de Negocios',
      ],
      ['A Estrategia em Acao', 'Kaplan & Norton', 2, 'Metodologia BSC e Gestao de Desempenho'],
      ['A Execucao Premium', 'Kaplan & Norton', 2, 'Metodologia BSC e Gestao de Desempenho'],
      [
        'Balanced Score Card e Hoshin Kanri',
        'Manuel Fernandes Thomaz',
        2,
        'Metodologia BSC e Gestao de Desempenho',
      ],
      [
        'Balanced Scorecard e a Gestao do Capital Intelectual',
        'Jose Francisco Rezende',
        2,
        'Metodologia BSC e Gestao de Desempenho',
      ],
      [
        'Gerenciamento da Rotina do Trabalho do Dia a Dia',
        'Falconi',
        2,
        'Gestao da Rotina, Qualidade e Processos',
      ],
      [
        'Gerenciamento pelas Diretrizes (Hoshin Kanri)',
        'Falconi',
        2,
        'Gestao da Rotina, Qualidade e Processos',
      ],
      ['Estrategia 6 Sigma', 'Peter S. Pande et al.', 2, 'Gestao da Rotina, Qualidade e Processos'],
      ['Scrum', 'Jeff Sutherland', 2, 'Gestao da Rotina, Qualidade e Processos'],
      ['Sprint', 'Jake Knapp', 2, 'Gestao da Rotina, Qualidade e Processos'],
      [
        'Execucao - A Disciplina para Atingir Resultados',
        'Larry Bossidy & Ram Charan',
        2,
        'Disciplina da Execucao',
      ],
      ['Gestao de Alta Performance', 'Andrew S. Grove', 2, 'Disciplina da Execucao'],
      [
        'Know-How - As 8 Competencias que separam os que Fazem',
        'Ram Charan',
        2,
        'Disciplina da Execucao',
      ],
      ['Afinal, o que Realmente Funciona?', 'Ram Charan', 2, 'Disciplina da Execucao'],
      [
        'Corporate Turnaround: How Managers Turn Losers into Winners',
        'Donald B. Bibeault',
        2,
        'Disciplina da Execucao',
      ],
      ['O Monge e o Executivo', 'James Hunter', 3, 'Lideranca Essencial e Servidora'],
      ['De volta ao Mosteiro', 'James Hunter', 3, 'Lideranca Essencial e Servidora'],
      ['Como Se Tornar Um Lider Servidor', 'James Hunter', 3, 'Lideranca Essencial e Servidora'],
      [
        'As 21 Irrefutaveis Leis da Lideranca',
        'John C. Maxwell',
        3,
        'Lideranca Essencial e Servidora',
      ],
      ['O Lider 360', 'John C. Maxwell', 3, 'Lideranca Essencial e Servidora'],
      ['O Lider Criador de Lideres', 'Ram Charan', 3, 'Lideranca Essencial e Servidora'],
      [
        'The Leadership Pipeline',
        'Ram Charan, Stephen Drotter & James Noel',
        3,
        'Lideranca Essencial e Servidora',
      ],
      ['O Jogo da Lideranca', 'Ram Charan & A. G. Lafley', 3, 'Lideranca Essencial e Servidora'],
      ['Liderando com Visao', 'Bonnie Hagemann et al.', 3, 'Lideranca Essencial e Servidora'],
      [
        'Leading Teams: Setting the Stage for Great Performances',
        'J. Richard Hackman',
        3,
        'Gestao de Pessoas, Cultura e Design de Equipes',
      ],
      [
        'Empresas Feitas para Vencer (Good to Great)',
        'Jim Collins',
        3,
        'Gestao de Pessoas, Cultura e Design de Equipes',
      ],
      [
        'Gestao de Pessoas',
        'Idalberto Chiavenato',
        3,
        'Gestao de Pessoas, Cultura e Design de Equipes',
      ],
      [
        'Os Mestres da Administracao',
        'Daniel Goleman',
        3,
        'Gestao de Pessoas, Cultura e Design de Equipes',
      ],
      [
        'O Melhor de Peter Drucker - Fator Humano e Desempenho',
        'Peter Drucker',
        3,
        'Gestao de Pessoas, Cultura e Design de Equipes',
      ],
      ['The Great CEO Within', 'Matt Mochary', 3, 'Gestao de Pessoas, Cultura e Design de Equipes'],
      [
        'Team Topologies',
        'Matthew Skelton e Manuel Pais',
        3,
        'Gestao de Pessoas, Cultura e Design de Equipes',
      ],
      [
        'Governanca Corporativa',
        'Adriana Andrade & Jose Paschoal Rossetti',
        3,
        'Governanca Corporativa e Empresas Familiares',
      ],
      ['Governanca Corporativa', 'Ram Charan', 3, 'Governanca Corporativa e Empresas Familiares'],
      [
        'Governanca Corporativa',
        'Joao Bosco Lodi',
        3,
        'Governanca Corporativa e Empresas Familiares',
      ],
      [
        'A Dimensao da Governanca Corporativa',
        'Herbert Steinberg et al.',
        3,
        'Governanca Corporativa e Empresas Familiares',
      ],
      [
        'Governanca na Empresa Familiar',
        'Renato Bernhoeft e Miguel Gallo',
        3,
        'Governanca Corporativa e Empresas Familiares',
      ],
      [
        'Governanca na Empresa Familiar',
        'Guilherme Dale et al.',
        3,
        'Governanca Corporativa e Empresas Familiares',
      ],
      [
        'Governanca na Empresa Familiar',
        'Werner Bornholdt',
        3,
        'Governanca Corporativa e Empresas Familiares',
      ],
      [
        'Governando a Empresa Familiar',
        'Elismar Alvares et al.',
        3,
        'Governanca Corporativa e Empresas Familiares',
      ],
      [
        'Codigo das Melhores Praticas de Governanca Corporativa',
        'IBGC',
        3,
        'Governanca Corporativa e Empresas Familiares',
      ],
      [
        'Uma Decada de Governanca Corporativa',
        'IBGC',
        3,
        'Governanca Corporativa e Empresas Familiares',
      ],
      [
        'A Profissao do Administrador',
        'Peter Drucker',
        3,
        'Biografias e Pensamento Administrativo',
      ],
      [
        'Drucker - O Homem que Inventou a Administracao',
        'Peter Drucker',
        3,
        'Biografias e Pensamento Administrativo',
      ],
      [
        'O Melhor de Peter Drucker - O Homem, A Administracao, A Sociedade',
        'Exame',
        3,
        'Biografias e Pensamento Administrativo',
      ],
      [
        'Administrando em Tempos de Grandes Mudancas',
        'Peter Drucker',
        3,
        'Biografias e Pensamento Administrativo',
      ],
      ['A Cabeca de Steve Jobs', 'Leander Kahney', 3, 'Biografias e Pensamento Administrativo'],
      ['Sucesso', 'Tom Peters', 3, 'Biografias e Pensamento Administrativo'],
      ['A Startup Enxuta (Lean Startup)', 'Eric Ries', 4, 'Ecossistema Startup e Lean'],
      [
        'Startup - Manual do Empreendedor',
        'Steve Blank & Bob Dorf',
        4,
        'Ecossistema Startup e Lean',
      ],
      ['Do Sonho a Realizacao em 4 Passos', 'Steven Gary Blank', 4, 'Ecossistema Startup e Lean'],
      [
        'Design Thinking - Uma Metodologia Poderosa',
        'Tim Brown',
        4,
        'Design Thinking e Inovacao de Servicos',
      ],
      [
        'Isto e Design Thinking de Servicos',
        'Marc Stickdorn & Jakob Schneider',
        4,
        'Design Thinking e Inovacao de Servicos',
      ],
      ['Liderando a Revolucao', 'Gary Hamel', 4, 'Design Thinking e Inovacao de Servicos'],
      ['O Futuro da Administracao', 'Gary Hamel', 4, 'Design Thinking e Inovacao de Servicos'],
      ['A Empresa na Velocidade do Pensamento', 'Bill Gates', 4, 'Tecnologia e Futuro'],
      ['A Estrada do Futuro', 'Bill Gates', 4, 'Tecnologia e Futuro'],
      ['Competing in the Age of AI', 'Marco Iansiti e Karim R. Lakhani', 4, 'Tecnologia e Futuro'],
      ['Administracao de Marketing', 'Philip Kotler', 5, 'Marketing Estrategico e Branding'],
      [
        'Marketing 4.0 - Do Tradicional ao Digital',
        'Philip Kotler',
        5,
        'Marketing Estrategico e Branding',
      ],
      ['Marketing de A a Z', 'Philip Kotler', 5, 'Marketing Estrategico e Branding'],
      ['O Marketing das Nacoes', 'Philip Kotler', 5, 'Marketing Estrategico e Branding'],
      [
        'Os 10 Pecados Mortais do Marketing',
        'Philip Kotler',
        5,
        'Marketing Estrategico e Branding',
      ],
      ['Vencer no Caos', 'Philip Kotler', 5, 'Marketing Estrategico e Branding'],
      [
        'Marketing de Servicos Profissionais',
        'Philip Kotler et al.',
        5,
        'Marketing Estrategico e Branding',
      ],
      ['Return on Customer', 'Don Peppers & Martha Rogers', 5, 'Marketing Estrategico e Branding'],
      ['Hacking Growth', 'Sean Ellis', 5, 'Growth Hacking e Tracao'],
      ['Growth Hacker Marketing', 'Ryan Holiday', 5, 'Growth Hacking e Tracao'],
      ['Traction', 'Gabriel Weinberg', 5, 'Growth Hacking e Tracao'],
      ['Hooked (Engajado)', 'Nir Eyal', 5, 'Growth Hacking e Tracao'],
      ['Spin Selling', 'Neil Rackham', 5, 'Vendas Consultivas e Negociacao'],
      ['Como Chegar ao Sim', 'Roger Fisher & William Ury', 5, 'Vendas Consultivas e Negociacao'],
      ['A Biblia de Vendas', 'Jeffrey Gitomer', 5, 'Vendas Consultivas e Negociacao'],
      ['A Biblia do Vendedor', 'Stephan Schiffman', 5, 'Vendas Consultivas e Negociacao'],
      ['Os Segredos da Arte de Vender', 'Zig Ziglar', 5, 'Vendas Consultivas e Negociacao'],
      ['Never Split the Difference', 'Chris Voss', 5, 'Vendas Consultivas e Negociacao'],
      ['As Armas da Persuasao', 'Robert Cialdini', 5, 'Copywriting e Persuasao'],
      ['Great Leads', 'Michael Masterson', 5, 'Copywriting e Persuasao'],
      ['Breakthrough Advertising', 'Eugene Schwartz', 5, 'Copywriting e Persuasao'],
      ['My Life in Advertising', 'Claude Hopkins', 5, 'Copywriting e Persuasao'],
      ['Keys to Great Writing', 'Stephen Wilbers', 5, 'Copywriting e Persuasao'],
      [
        'Valuation (McKinsey)',
        'Tim Koller, Marc Goedhart & David Wessels',
        6,
        'Valuation e Criacao de Valor',
      ],
      ['Investment Valuation', 'Aswath Damodaran', 6, 'Valuation e Criacao de Valor'],
      ['The Dark Side of Valuation', 'Aswath Damodaran', 6, 'Valuation e Criacao de Valor'],
      ['Narrative and Numbers', 'Aswath Damodaran', 6, 'Valuation e Criacao de Valor'],
      [
        'Valuation - Guia Fundamental',
        'Ricardo Goulart Serra & Michael Wickert',
        6,
        'Valuation e Criacao de Valor',
      ],
      ['Creating Shareholder Value', 'Alfred Rappaport', 6, 'Valuation e Criacao de Valor'],
      [
        'EVA e Gestao Baseada em Valor',
        "S. David Young & Stephen F. O'Byrne",
        6,
        'Valuation e Criacao de Valor',
      ],
      [
        'Finance for Executives',
        'Gabriel Hawawini & Claude Viallet',
        6,
        'Valuation e Criacao de Valor',
      ],
      ['Financas Corporativas e Valor', 'Alexandre Assaf Neto', 6, 'Valuation e Criacao de Valor'],
      ['Principles of Managerial Finance', 'Lawrence J. Gitman', 6, 'Valuation e Criacao de Valor'],
      ['Crescimento & Lucro', 'Ram Charan', 6, 'Valuation e Criacao de Valor'],
      [
        'Mergers and Acquisitions from A to Z',
        'Andrew J. Sherman',
        6,
        'Valuation e Criacao de Valor',
      ],
      [
        'O Investidor Inteligente',
        'Benjamin Graham',
        6,
        'Filosofia de Investimento e Value Investing',
      ],
      [
        'The Essays of Warren Buffett',
        'Warren Buffett (ed. Lawrence Cunningham)',
        6,
        'Filosofia de Investimento e Value Investing',
      ],
      [
        'Cartas aos Acionistas da Berkshire Hathaway',
        'Warren Buffett',
        6,
        'Filosofia de Investimento e Value Investing',
      ],
      [
        'A Contabilidade Gerencial',
        'Anthony A. Atkinson, Robert S. Kaplan et al.',
        6,
        'Controladoria e Custos',
      ],
      [
        'Management Control Systems',
        'Kenneth Merchant & Wim Van der Stede',
        6,
        'Controladoria e Custos',
      ],
      ['Cost & Effect', 'Robert S. Kaplan & Robin Cooper', 6, 'Controladoria e Custos'],
      ['O Capital', 'Thomas Piketty', 6, 'Economia e Contexto Global'],
      [
        'Economia Internacional e Comercio Exterior',
        'Jayme de Mariz Maia',
        6,
        'Economia e Contexto Global',
      ],
      ['A China Sacode o Mundo', 'James Kynge', 6, 'Economia e Contexto Global'],
      ['Fazendo Negocios com a China', 'Ted Plafker', 6, 'Economia e Contexto Global'],
      [
        'Corporate Finance',
        'Stephen Ross, Randolph Westerfield & Jeffrey Jaffe',
        6,
        'Financas Corporativas Avancadas',
      ],
      [
        'Os 7 Habitos das Pessoas Altamente Eficazes',
        'Stephen R. Covey',
        7,
        'Habitos e Produtividade',
      ],
      ['O 8 Habito', 'Stephen R. Covey', 7, 'Habitos e Produtividade'],
      ['O Poder da Confianca', 'Stephen R. Covey', 7, 'Habitos e Produtividade'],
      ['Essencialismo', 'Greg McKeown', 7, 'Habitos e Produtividade'],
      ['Foco', 'Daniel Goleman', 7, 'Habitos e Produtividade'],
      [
        'Mindset - A nova psicologia do sucesso',
        'Carol S. Dweck',
        7,
        'Psicologia, Mindset e Risco',
      ],
      ['Antifragil', 'Nassim Taleb', 7, 'Psicologia, Mindset e Risco'],
      [
        'The Black Swan (A Logica do Cisne Negro)',
        'Nassim Taleb',
        7,
        'Psicologia, Mindset e Risco',
      ],
      ['Diario de Negocios de Maslow', 'Abraham Maslow', 7, 'Psicologia, Mindset e Risco'],
      ['Principios de Neurociencias', 'Eric Kandel', 7, 'Psicologia, Mindset e Risco'],
      ['A Quinta Disciplina', 'Peter Senge', 7, 'Psicologia, Mindset e Risco'],
      ['Inteligencia Pragmatica', 'Max Peters', 7, 'Psicologia, Mindset e Risco'],
      [
        'Foundations of Futures Studies (Volumes 1 e 2)',
        'Wendell Bell',
        8,
        'Fundamentos do Foresight',
      ],
      ['The Foresight Principle', 'Richard Slaughter', 8, 'Fundamentos do Foresight'],
      ['Futuring: The Exploration of the Future', 'Edward Cornish', 8, 'Fundamentos do Foresight'],
      ['Questioning the Future', 'Sohail Inayatullah', 8, 'Cenarios e Analise Prospectiva'],
      [
        'A Arte da Visao Longa (The Art of the Long View)',
        'Peter Schwartz',
        8,
        'Cenarios e Analise Prospectiva',
      ],
      [
        'A Arte da Guerra - Edicao Completa (Volume Complementar)',
        'Sun Tzu',
        8,
        'Cenarios e Analise Prospectiva',
      ],
    ]
    for (var j = 0; j < livros.length; j++) {
      var br = new Record(livrosCol)
      br.set('titulo', livros[j][0])
      br.set('autor', livros[j][1])
      br.set('categoria', String(livros[j][3]))
      br.set('resumo', '')
      app.save(br)
    }

    // --- 6. Semeia `setores` (10 setores + questionarios dos 3 Pilares) ---
    app.db().newQuery('DELETE FROM setores WHERE 1=1').execute()
    var setCol = app.findCollectionByNameOrId('setores')

    function setorPerguntas(lista) {
      // lista: [[pilar, texto], ...]
      var out = []
      for (var k = 0; k < lista.length; k++) {
        out.push({ pilar: lista[k][0], texto: lista[k][1] })
      }
      return out
    }

    var setoresData = [
      {
        nome: 'Saude',
        slug: 'saude',
        segmentos: ['Hospitalar', 'Clinica', 'Odontologica', 'Laboratorio', 'Home Care'],
        epifanias: [
          'Glosa hospitalar invisivel',
          'Ociosidade de leitos',
          'Retrabalho de faturamento',
          'Descasamento entre prontuario e conta',
        ],
        ordem: 1,
      },
      {
        nome: 'Servicos Profissionais',
        slug: 'servicos-profissionais',
        segmentos: ['Consultoria', 'Advocacia', 'Contabilidade', 'Arquitetura', 'Agencia', 'TI'],
        epifanias: [
          'Horas nao cobradas',
          'Taxa de utilizacao',
          'Contratos sem revisao de preco',
          'Custo de oportunidade do socio',
        ],
        ordem: 2,
      },
      {
        nome: 'Industria',
        slug: 'industria',
        segmentos: ['Manufatura', 'Metalurgia', 'Alimentos', 'Quimico', 'Textil', 'Plastico'],
        epifanias: [
          'Refugo',
          'Paradas nao programadas',
          'Ociosidade de maquinas',
          'Giro de estoque',
          'Custo real da OP',
        ],
        ordem: 3,
      },
      {
        nome: 'Varejo',
        slug: 'varejo',
        segmentos: ['Lojas Fisicas', 'E-commerce', 'Distribuicao', 'Alimentacao', 'Moda'],
        epifanias: [
          'Ruptura de estoque',
          'Vendas perdidas',
          'Quebra/perda',
          'Ticket medio',
          'Margem por categoria',
        ],
        ordem: 4,
      },
      {
        nome: 'Agronegocio',
        slug: 'agronegocio',
        segmentos: ['Graos', 'Pecuaria', 'Cana', 'Cafe', 'Fruticultura'],
        epifanias: [
          'Perda na colheita',
          'Custo por hectare',
          'Ociosidade da frota',
          'Janelas perdidas',
          'Quebra tecnica',
        ],
        ordem: 5,
      },
      {
        nome: 'Tecnologia/Startups',
        slug: 'tecnologia-startups',
        segmentos: ['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'Marketplace'],
        epifanias: [
          'Churn',
          'CAC/LTV',
          'Debito tecnico',
          'Risco de concentracao de receita',
          'Runway',
        ],
        ordem: 6,
      },
      {
        nome: 'Construcao Civil',
        slug: 'construcao-civil',
        segmentos: ['Edificacoes', 'Incorporacao', 'Infraestrutura', 'Reformas'],
        epifanias: [
          'Desperdicio de materiais',
          'Retrabalho',
          'Aditivos nao cobrados',
          'Orcado vs. realizado',
        ],
        ordem: 7,
      },
      {
        nome: 'Transporte/Logistica',
        slug: 'transporte-logistica',
        segmentos: ['Cargas', 'Passageiros', 'Distribuicao', 'Armazenagem'],
        epifanias: ['Km vazios', 'Ociosidade da frota', 'Custo por km', 'Manutencao corretiva'],
        ordem: 8,
      },
      {
        nome: 'Educacao',
        slug: 'educacao',
        segmentos: ['Basica', 'Superior', 'Tecnico', 'Idiomas', 'Edtech'],
        epifanias: ['Evasao', 'Inadimplencia', 'Vagas ociosas', 'Rotatividade docente'],
        ordem: 9,
      },
      {
        nome: 'Academias de Ginastica',
        slug: 'academias-de-ginastica',
        segmentos: ['Musculacao', 'Estudio', 'CrossFit', 'Pilates', 'Natacao'],
        epifanias: ['Evasao', 'Capacidade ociosa', 'Ocupacao por horario', 'CAC por aluno'],
        ordem: 10,
      },
    ]
    for (var s = 0; s < setoresData.length; s++) {
      var sr = new Record(setCol)
      sr.set('nome', setoresData[s].nome)
      sr.set('slug', setoresData[s].slug)
      sr.set('segmentos', setoresData[s].segmentos)
      sr.set('micro_epifanias', setoresData[s].epifanias)
      sr.set('perguntas', [])
      sr.set('ordem', setoresData[s].ordem)
      app.save(sr)
    }
  },
  (app) => {
    // Reverte: remove setores e campos adicionados (dados nao sao restaurados).
    try {
      var diagCol = app.findCollectionByNameOrId('diagnosticos')
      var setorField = diagCol.fields.getByName('setor')
      if (setorField) diagCol.fields.remove(setorField)
      var faseField = diagCol.fields.getByName('fase_atual')
      if (faseField) diagCol.fields.remove(faseField)
      app.save(diagCol)
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('setores'))
    } catch (_) {}
  },
)
