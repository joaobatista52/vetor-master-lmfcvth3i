/// <reference path="../pb_data/types.d.ts" />
// V6.5 — Questionários Consolidados (10 setores)
// Atualiza o campo `perguntas` (JSON) da colecao `setores` com o questionario
// COMPLETO extraido fielmente do PDF "Questionários_Consolidados_10_Setores_
// V6.5_04ago26": Seção 1 (Perfil), 3 Pilares, Seção 5 (Hackman), Seção 6
// (Buffett), Seção 6.6 (Runway — só Tecnologia), Seção 7 (Expectativas),
// Seção 8 (Inovação, setorial), Seção 9 (Próximos Passos).
//
// O campo `perguntas` passa a conter um objeto estruturado com todas as
// seções (compatível com o frontend em src/data/setores-questionario.ts).
migrate(
  (app) => {
    // Adiciona o campo `questionario` (json) à coleção `setores` se ainda
    // não existir, para armazenar o questionário consolidado completo.
    var setCol = app.findCollectionByNameOrId('setores')
    if (!setCol.fields.getByName('questionario')) {
      setCol.fields.add(new JSONField({ name: 'questionario', maxSize: 5242880 }))
      app.save(setCol)
    }

    function findBySlug(slug) {
      try {
        return app.findFirstRecordByData('setores', 'slug', slug)
      } catch (_) {
        return null
      }
    }

    // --- Seções compartilhadas (idênticas para todos os setores) ---

    var escalaOpcoes = [
      'Sim, totalmente.',
      'Parcialmente, com ressalvas.',
      'Raramente / com dificuldade.',
      'Não / não sei informar.',
    ]

    var porteOptions = ['MEI', 'ME', 'EPP', 'Média', 'Grande']
    var faturamentoAnualOptions = [
      'Até R$ 600 mil/ano',
      'R$ 600 mil - R$ 2,4 mi/ano',
      'R$ 2,4 mi - R$ 6 mi/ano',
      'R$ 6 mi - R$ 12 mi/ano',
      'Acima de R$ 12 mi/ano',
    ]
    var funcionariosOptions = [
      '1 a 5 colaboradores',
      '6 a 20 colaboradores',
      '21 a 50 colaboradores',
      '51 a 100 colaboradores',
      'Acima de 100 colaboradores',
    ]
    var regimeTributarioOptions = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real']
    var tempoMercadoOptions = ['Menos de 2 anos', '2 a 5 anos', '5 a 10 anos', 'Mais de 10 anos']
    var formaJuridicaOptions = ['MEI', 'Empresário Individual', 'LTDA', 'S.A.']
    var prazoOptions = ['3 meses', '6 meses', '12 meses', '24 meses']
    var escadaValorOptions = [
      'MaaS (Management as a Service) — assinatura mensal',
      'Híbrido — consultoria pontual + licenciamento da plataforma',
      'CaaS (Consulting as a Service) — projeto complexo com Success Fee',
    ]

    function S(texto, tipo, opcoes, placeholder) {
      var o = { texto: texto }
      if (tipo) o.tipo = tipo
      if (opcoes) o.opcoes = opcoes
      if (placeholder) o.placeholder = placeholder
      return o
    }

    // Seção 1 — Perfil da Empresa e Contexto
    var secaoPerfil = [
      S('Qual o porte da empresa?', 'select', porteOptions, ''),
      S('Qual o faturamento bruto anual?', 'select', faturamentoAnualOptions, ''),
      S('Quantos colaboradores a empresa possui?', 'select', funcionariosOptions, ''),
      S('Qual o regime tributário?', 'select', regimeTributarioOptions, ''),
      S('Há quanto tempo a empresa está no mercado?', 'select', tempoMercadoOptions, ''),
      S('Qual a forma jurídica da empresa?', 'select', formaJuridicaOptions, ''),
      S('Quantos sócios a empresa possui?', 'numero', null, 'Ex: 2'),
    ]

    // Seção 5 — Hackman (6 perguntas)
    var secaoHackman = [
      S(
        'A sua equipe é um "time real", com fronteiras claras e membros que se conhecem e dependem uns dos outros para entregar resultados?',
        'escala',
        escalaOpcoes,
        '',
      ),
      S(
        'A equipe tem uma direção convincente — uma meta desafiadora e clara que mobiliza todos na mesma direção?',
        'escala',
        escalaOpcoes,
        '',
      ),
      S(
        'A estrutura da equipe é habilitadora — o design de tarefas permite autonomia e impacto mensurável no resultado?',
        'escala',
        escalaOpcoes,
        '',
      ),
      S(
        'O contexto organizacional oferece apoio — sistemas de recompensa, recursos e reconhecimento adequados ao desempenho?',
        'escala',
        escalaOpcoes,
        '',
      ),
      S(
        'Há coaching especializado disponível — mentoria técnica e feedback contínuo acessíveis à equipe?',
        'escala',
        escalaOpcoes,
        '',
      ),
      S(
        'Os membros da equipe possuem as competências técnicas e interpessoais necessárias para entregar os resultados esperados?',
        'escala',
        escalaOpcoes,
        '',
      ),
    ]

    // Seção 6 — Buffett (6 perguntas)
    var secaoBuffett = [
      S(
        'Qual a margem EBITDA atual da empresa e como ela se compara aos últimos 3 anos?',
        'texto',
        null,
        'Ex: 18%, em queda vs. 24% há 3 anos',
      ),
      S(
        'Qual o nível de endividamento (Dívida Líquida / EBITDA) da empresa?',
        'texto',
        null,
        'Ex: 2,5x',
      ),
      S(
        'A empresa possui DRE (Demonstração do Resultado do Exercício) projetada e atualizada mensalmente?',
        'texto',
        null,
        'Ex: Sim, mensal / Não, apenas no contador',
      ),
      S(
        'Qual a margem de segurança atual dos seus principais produtos ou serviços?',
        'texto',
        null,
        'Ex: 35%',
      ),
      S(
        'O ROIC (Retorno sobre o Capital Investido) da empresa supera o WACC?',
        'texto',
        null,
        'Ex: ROIC 16% vs WACC 13,75%',
      ),
      S(
        'A empresa gera fluxo de caixa livre (FCF) positivo de forma recorrente?',
        'texto',
        null,
        'Ex: Sim, desde 2023',
      ),
    ]

    // Seção 6.6 — Runway 12 meses (somente Tecnologia/Startups)
    var secaoRunway = [
      S(
        'Qual o runway atual (caixa disponível / burn rate mensal) em meses?',
        'numero',
        null,
        'Ex: 14',
      ),
      S(
        'Qual o burn rate mensal e quanto dele é composto por custos fixos?',
        'texto',
        null,
        'Ex: R$ 120 mil/mês, 70% fixos',
      ),
      S(
        'Há rodada de captação prevista nos próximos 12 meses? Qual o tamanho estimado?',
        'texto',
        null,
        'Ex: Seed R$ 3 mi em 6 meses',
      ),
      S(
        'Qual a meta de receita recorrente (ARR/MRR) para os próximos 12 meses?',
        'texto',
        null,
        'Ex: MRR R$ 250 mil',
      ),
    ]

    // Seção 7 — Expectativas e Ambição (5 perguntas)
    var secaoExpectativas = [
      S(
        'Qual a sua principal meta de crescimento para os próximos 12 meses?',
        'textarea',
        null,
        'Ex: Dobrar o faturamento e abrir 2 novas unidades',
      ),
      S(
        'Em qual horizonte de tempo você espera sair da prisão do fundador?',
        'select',
        prazoOptions,
        '',
      ),
      S(
        'Qual o resultado financeiro que você considera sucesso ao final do processo?',
        'textarea',
        null,
        'Ex: EBITDA de 25% e captação de R$ 5 mi',
      ),
      S(
        'O que acontece com a empresa se nada mudar nos próximos 12 meses?',
        'textarea',
        null,
        'Ex: Perda de competitividade e risco de caixa',
      ),
      S(
        'Qual o nível de comprometimento da sua equipe com essa transformação?',
        'escala',
        escalaOpcoes,
        '',
      ),
    ]

    // Seção 9 — Próximos Passos (MaaS/Híbrido/CaaS)
    var secaoProximosPassos = [
      S(
        'Qual modalidade de engajamento faz mais sentido para o seu momento atual?',
        'select',
        escadaValorOptions,
        '',
      ),
      S(
        'Qual o budget mensal disponível para a transformação?',
        'texto',
        null,
        'Ex: R$ 15 mil/mês',
      ),
      S(
        'Quem serão os responsáveis internos por executar o plano de ação?',
        'texto',
        null,
        'Ex: COO + Diretor Financeiro',
      ),
      S(
        'Há disposição para implementar mudanças estruturais nos próximos 90 dias?',
        'escala',
        escalaOpcoes,
        '',
      ),
    ]

    // --- Seção 8 — Inovação e Tecnologia (versão setorial) ---

    var secaoInovacaoPorSlug = {
      saude: [
        S(
          'O prontuário eletrônico e o sistema de faturamento estão integrados?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza BI/dashboards em tempo real para ocupação de leitos e glosas?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há iniciativas de telemedicina ou atendimento digital implementadas?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Qual o nível de automação dos processos administrativos (agendamento, faturamento, auditoria de glosas)?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza IA para análise preditiva de ocupação ou gestão de riscos clínicos?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S('Os sistemas críticos estão em nuvem (Cloud) ou on-premise?', 'escala', escalaOpcoes, ''),
        S(
          'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?',
          'escala',
          escalaOpcoes,
          '',
        ),
      ],
      'servicos-profissionais': [
        S(
          'A empresa utiliza CRM para gestão de clientes, propostas e contratos?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há controle automatizado de horas faturáveis e taxa de utilização por consultor?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Qual o nível de automação de tarefas administrativas (cobrança, relatórios, onboarding)?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza BI para acompanhar margem por cliente, projeto e consultor?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há iniciativas de produto digital (produtos escaláveis além de horas consultivas)?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S('Os sistemas estão em nuvem (Cloud) e integrados entre si?', 'escala', escalaOpcoes, ''),
        S(
          'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?',
          'escala',
          escalaOpcoes,
          '',
        ),
      ],
      industria: [
        S(
          'Há sistema de gestão integrado (ERP) conectando produção, compras e financeiro?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza BI/dashboards em tempo real para OEE, refugo e paradas?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há automação industrial (IoT, sensores, manutenção preditiva) implementada?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Qual o nível de rastreabilidade de lotes, ordens de produção e matéria-prima?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza IA para previsão de demanda ou otimização de mix de produção?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Os sistemas industriais e administrativos estão integrados e em nuvem?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?',
          'escala',
          escalaOpcoes,
          '',
        ),
      ],
      varejo: [
        S(
          'Há ERP/PDV integrado com e-commerce e gestão de estoque em tempo real?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza BI para ticket médio, margem por categoria e curva ABC?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há automação de reposição de estoque e precificação dinâmica?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S('A empresa utiliza CRM/fidelidade para retenção e upsell?', 'escala', escalaOpcoes, ''),
        S(
          'Há iniciativas de IA para recomendação de produtos ou previsão de demanda?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Os canais (loja, e-commerce, marketplace) estão integrados em omnichannel?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?',
          'escala',
          escalaOpcoes,
          '',
        ),
      ],
      agronegocio: [
        S(
          'Há sistema de gestão integrando fazenda, insumos, financeiro e comercial?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza agricultura de precisão (taxa variável, mapas de produtividade)?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há telemetria e IoT na frota e equipamentos (tratores, colheitadeiras)?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza BI para custo por hectare, margem por talhão e produtividade?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S('Há automação no controle de pragas, irrigação ou manejo?', 'escala', escalaOpcoes, ''),
        S(
          'A empresa utiliza IA/satélite para previsão de safra e gestão de risco climático?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?',
          'escala',
          escalaOpcoes,
          '',
        ),
      ],
      'tecnologia-startups': [
        S(
          'A arquitetura de produto é escalável e o débito técnico está sob controle?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há observabilidade (logs, métricas, tracing) e CI/CD automatizado?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza BI/dashboards para MRR, churn, CAC/LTV e ativação em tempo real?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S('Há IA Generativa/RAG incorporada ao produto ou à operação?', 'escala', escalaOpcoes, ''),
        S(
          'A infraestrutura está em Cloud nativa com custo otimizado (FinOps)?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S('Há automação de onboarding, suporte e retenção (CS)?', 'escala', escalaOpcoes, ''),
        S(
          'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?',
          'escala',
          escalaOpcoes,
          '',
        ),
      ],
      'construcao-civil': [
        S(
          'A empresa utiliza BIM (Building Information Modeling) nos projetos?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S('Há ERP integrando orçamento, compras, cronograma e obra?', 'escala', escalaOpcoes, ''),
        S(
          'A empresa utiliza BI para orçado vs. realizado, aditivos e margem por obra?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há automação de medição, liberação de pagamentos e controle de suprimentos?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza IoT/sensores em canteiro (segurança, equipamentos, qualidade)?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há IA para previsão de prazo, custo e gestão de risco de obra?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?',
          'escala',
          escalaOpcoes,
          '',
        ),
      ],
      'transporte-logistica': [
        S(
          'Há TMS (Transport Management System) integrado a roteirização e telemetria?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza BI para custo por km, ociosidade da frota e margem por rota?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há automação de roteirização, rastreamento e gestão de avarias?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza IoT/telemetria na frota (combustível, manutenção, comportamento)?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há IA para previsão de demanda, otimização de frota e precificação de frete?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S('Os sistemas (TMS, WMS, ERP) estão integrados e em nuvem?', 'escala', escalaOpcoes, ''),
        S(
          'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?',
          'escala',
          escalaOpcoes,
          '',
        ),
      ],
      educacao: [
        S(
          'Há sistema integrado (ERP acadêmico) conectando matrícula, pedagógico e financeiro?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza BI para evasão, inadimplência, ocupação e margem por curso?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há automação de matrícula, cobrança e comunicação com alunos/pais?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza IA para ensino personalizado e previsão de evasão?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há plataformas de EAD/Edtech integradas ao modelo pedagógico?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S('Os sistemas estão em nuvem e integrados entre unidades?', 'escala', escalaOpcoes, ''),
        S(
          'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?',
          'escala',
          escalaOpcoes,
          '',
        ),
      ],
      'academias-de-ginastica': [
        S(
          'Há sistema de gestão integrando matrícula, cobrança, acesso e retenção?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza BI para churn, ocupação por horário, CAC e margem por plano?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há automação de cobrança recorrente, lembretes e reativação de alunos?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'A empresa utiliza app próprio para treinos, agendamento e engajamento?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Há IA para prescrição de treinos personalizados e previsão de evasão?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Os sistemas (acesso, billing, CRM) estão integrados e em nuvem?',
          'escala',
          escalaOpcoes,
          '',
        ),
        S(
          'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?',
          'escala',
          escalaOpcoes,
          '',
        ),
      ],
    }

    var slugs = [
      'saude',
      'servicos-profissionais',
      'industria',
      'varejo',
      'agronegocio',
      'tecnologia-startups',
      'construcao-civil',
      'transporte-logistica',
      'educacao',
      'academias-de-ginastica',
    ]

    for (var i = 0; i < slugs.length; i++) {
      var slug = slugs[i]
      var rec = findBySlug(slug)
      if (!rec) continue

      var secaoInovacao = secaoInovacaoPorSlug[slug] || []

      var questionarioCompleto = {
        versao: '6.5-consolidado',
        secao_1_perfil: secaoPerfil,
        secao_5_hackman: secaoHackman,
        secao_6_buffett: secaoBuffett,
        secao_66_runway: slug === 'tecnologia-startups' ? secaoRunway : null,
        secao_7_expectativas: secaoExpectativas,
        secao_8_inovacao: secaoInovacao,
        secao_9_proximos_passos: secaoProximosPassos,
      }

      // Mantém o campo `perguntas` (3 Pilares) intacto — já populado pelas
      // migrations 0017/0018 — e adiciona um novo campo estruturado
      // `questionario` com todas as seções consolidadas.
      rec.set('questionario', questionarioCompleto)
      app.save(rec)
    }
  },
  (app) => {
    // Reverte: remove o campo `questionario` de todos os setores
    try {
      var records = app.findRecordsByFilter('setores', '1=1', 'ordem', 0, 0)
      for (var i = 0; i < records.length; i++) {
        records[i].set('questionario', null)
        app.save(records[i])
      }
    } catch (_) {}
  },
)
