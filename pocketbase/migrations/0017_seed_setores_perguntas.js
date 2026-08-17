/// <reference path="../pb_data/types.d.ts" />
// V6.5 — Popula o campo `perguntas` da colecao `setores` com o Questionario
// Estrutural dos 3 Pilares extraido fielmente do PDF "Contexto Estrategico
// Global 10 Setores V6.5" (04ago26). A migration 0015 criou os 10 setores mas
// deixou `perguntas` vazio; esta migration preenche cada registro por slug.
migrate(
  (app) => {
    var setCol = app.findCollectionByNameOrId('setores')

    // Helper: busca registro por slug
    function findBySlug(slug) {
      try {
        return app.findFirstRecordByData('setores', 'slug', slug)
      } catch (_) {
        return null
      }
    }

    // Helper: constroi lista de perguntas no formato [{pilar, texto}, ...]
    function P(pilar, texto) {
      return { pilar: pilar, texto: texto }
    }

    var dados = [
      // 6.1 SAUDE
      {
        slug: 'saude',
        perguntas: [
          P(
            1,
            'Quantas cirurgias ou procedimentos são cancelados por mês por falta de decisão da equipe?',
          ),
          P(
            1,
            'Qual o percentual de decisões de internação que dependem da sua validação pessoal?',
          ),
          P(1, 'Sua equipe clínica tem autonomia para protocolos de urgência sem te consultar?'),
          P(
            1,
            'Se você se ausentar por 30 dias, a operação assistencial mantém o padrão de qualidade?',
          ),
          P(1, 'Quantas decisões de compra de insumos de alto custo passam por você pessoalmente?'),
          P(1, 'Existe um diretor técnico com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o índice de glosa das contas hospitalares no último trimestre?'),
          P(2, 'Quanto tempo a equipe perde com retrabalho de faturamento ou guias de convênio?'),
          P(2, 'Quantas horas administrativas são gastas por profissionais de saúde semanalmente?'),
          P(2, 'Quantos contratos com operadoras estão há mais de 12 meses sem revisão de tabela?'),
          P(2, 'Qual o valor total da inadimplência atual e quem são os 10 maiores devedores?'),
          P(2, 'Qual a taxa de ocupação média de leitos ou salas de atendimento?'),
          P(
            2,
            'Qual o volume de procedimentos realizados que não foram faturados por erro de registro?',
          ),
          P(
            3,
            'Qual o prazo médio entre uma decisão da diretoria e a implementação na ponta clínica?',
          ),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe comercial/faturamento sabe o lucro real por procedimento ou convênio?'),
          P(
            3,
            'Quantas reuniões de alinhamento entre corpo clínico e administrativo ocorrem por mês?',
          ),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'A equipe sabe exatamente o custo real de cada procedimento realizado?'),
        ],
      },
      // 6.2 SERVICOS PROFISSIONAIS
      {
        slug: 'servicos-profissionais',
        perguntas: [
          P(
            1,
            'Qual % do faturamento depende de você estar pessoalmente na negociação ou entrega?',
          ),
          P(1, 'Quantos contratos estão parados aguardando sua assinatura ou aprovação?'),
          P(1, 'Sua equipe consegue fechar um negócio de valor médio sem te envolver?'),
          P(1, 'Se você tirar 60 dias de férias, a receita da empresa cai quanto?'),
          P(1, 'Quantas entregas ou propostas dependem da sua revisão final pessoal por semana?'),
          P(1, 'Existe um sócio/gerente com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Quantas horas são perdidas com retrabalho por falta de briefing padronizado?'),
          P(2, 'Qual o percentual de horas trabalhadas e não cobradas (vazamento de honorários)?'),
          P(
            2,
            'Quanto tempo a equipe gasta com tarefas administrativas que poderiam ser automatizadas?',
          ),
          P(2, 'Quantos contratos são renovados sem revisão de preço ou escopo?'),
          P(2, 'Qual o valor da inadimplência e quem são os 10 maiores devedores?'),
          P(2, 'Qual a taxa de utilização real (horas faturáveis / horas disponíveis) da equipe?'),
          P(2, 'Quantas propostas enviadas no último trimestre não foram convertidas e por quê?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na ponta?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe comercial sabe o lucro líquido por cliente que ela vende?'),
          P(
            3,
            'Quantas horas de reunião a equipe gasta discutindo o que já deveria ter sido feito?',
          ),
          P(3, 'A equipe sabe qual a meta de receita por consultor e como ela é calculada?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
        ],
      },
      // 6.3 INDUSTRIA
      {
        slug: 'industria',
        perguntas: [
          P(1, 'Quantos dias por mês você passa apagando incêndio no chão de fábrica?'),
          P(1, 'Qual o percentual das decisões de compra de matéria-prima que passam por você?'),
          P(
            1,
            'Sua equipe de produção tem autonomia para parar uma linha com problema sem te consultar?',
          ),
          P(1, 'Quantos fornecedores foram escolhidos pessoalmente por você sem critério formal?'),
          P(1, 'Quantas decisões de investimento em máquinas dependem exclusivamente de você?'),
          P(1, 'Existe um gerente industrial com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o percentual de refugo na linha de produção e o valor em reais?'),
          P(2, 'Quantas horas de parada não programada ocorreram e qual o custo/hora?'),
          P(2, 'Qual o giro de estoque dos seus 10 principais insumos?'),
          P(2, 'Quantos pedidos foram perdidos por atraso na entrega no último trimestre?'),
          P(2, 'Sua equipe comercial sabe a margem de contribuição de cada produto que vende?'),
          P(2, 'Qual o índice de ociosidade das suas máquinas mais caras?'),
          P(2, 'Qual o percentual de retrabalho ou devolução por defeito de fabricação?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na fábrica?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe de produção conhece a margem de contribuição do que fabrica?'),
          P(3, 'Quantas reuniões de alinhamento entre comercial e produção ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'Sua equipe de PCP sabe exatamente o custo real de cada ordem de produção?'),
        ],
      },
      // 6.4 VAREJO
      {
        slug: 'varejo',
        perguntas: [
          P(1, 'Sua loja consegue operar 30 dias sem sua presença física?'),
          P(1, 'Quantas decisões de precificação e desconto a equipe toma sem te consultar?'),
          P(1, 'Quanto tempo leva para contratar um vendedor se você não aprovar pessoalmente?'),
          P(1, 'Qual o valor de mercadoria parada porque você não decidiu o que fazer com ela?'),
          P(1, 'Quantas decisões de compra de novos produtos passam por você mensalmente?'),
          P(1, 'Existe um gerente de loja com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o índice de ruptura de estoque dos seus 10 produtos mais vendidos?'),
          P(2, 'Quantas vendas foram perdidas por falta de produto na prateleira?'),
          P(2, 'Qual o percentual de devoluções e qual o motivo principal?'),
          P(2, 'Quanto gasta por mês com frete expresso por falha no planejamento de compras?'),
          P(2, 'Sua equipe sabe o ticket médio por vendedor e como melhorá-lo?'),
          P(2, 'Qual o índice de quebra/perda (furtos, vencimentos, danos) em reais?'),
          P(2, 'Qual o giro de estoque geral e por categoria de produto?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na loja?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe de loja sabe a meta de margem por categoria de produto?'),
          P(3, 'Quantas decisões da última reunião comercial foram efetivamente implementadas?'),
          P(3, 'Existe um comitê de gestão periódico entre lojas, compras e financeiro?'),
          P(3, 'A equipe sabe o lucro líquido por cliente, canal e produto vendido?'),
        ],
      },
      // 6.5 AGRONEGOCIO
      {
        slug: 'agronegocio',
        perguntas: [
          P(1, 'Quantas decisões de plantio, colheita ou venda dependem exclusivamente de você?'),
          P(1, 'Seu gerente de fazenda tem autonomia para contratar safristas sem sua aprovação?'),
          P(1, 'Quanto tempo você gasta resolvendo problemas operacionais de baixo valor?'),
          P(1, 'Quantas negociações de venda da safra passam por você pessoalmente por ano?'),
          P(1, 'Em janelas críticas, quantas decisões ficam travadas aguardando sua palavra?'),
          P(1, 'Existe um gerente de fazenda com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o % de perda na colheita por ineficiência e o valor em reais?'),
          P(2, 'Quanto gasta por safra com insumos aplicados sem critério de taxa variável?'),
          P(2, 'Qual o custo real por hectare das suas operações mecanizadas?'),
          P(2, 'Quantos dias de janela foram perdidos por falha no planejamento logístico?'),
          P(2, 'Qual o índice de ociosidade da sua frota de tratores e colheitadeiras?'),
          P(2, 'Qual o % de quebra técnica (mortalidade ou pragas) na produção?'),
          P(2, 'Qual o seu custo por hectare/cabeça comparado à referência regional?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação no campo?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe de campo sabe a meta de produtividade por talhão?'),
          P(3, 'Quantas decisões do planejamento safra foram efetivamente executadas?'),
          P(3, 'Existe um comitê de gestão periódico entre produção, comercial e financeiro?'),
          P(3, 'A equipe comercial sabe o custo de produção e a margem por produto?'),
        ],
      },
      // 6.6 TECNOLOGIA/STARTUPS
      {
        slug: 'tecnologia-startups',
        perguntas: [
          P(1, 'Qual % das decisões de produto e roadmap dependem exclusivamente de você?'),
          P(1, 'Quantas vendas enterprise dependem da sua presença pessoal na negociação?'),
          P(1, 'Sua equipe de engenharia consegue fazer deploy sem sua aprovação?'),
          P(1, 'Se você ficar 30 dias sem acesso, o que para de funcionar na empresa?'),
          P(1, 'Quantas decisões de contratação e precificação passam por você mensalmente?'),
          P(1, 'Existe um COO/CTO com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o churn mensal e quanto isso representa em receita perdida por ano?'),
          P(2, 'Qual o CAC/payback e o LTV por canal de aquisição?'),
          P(2, 'Quantas horas de engenharia são perdidas com débito técnico ou retrabalho?'),
          P(2, 'Qual o tempo de resposta do suporte e quantos clientes estão em risco?'),
          P(2, 'Qual o % da receita concentrado nos 10 maiores clientes?'),
          P(2, 'Quantos leads foram perdidos por atraso na resposta ou onboarding?'),
          P(2, 'Qual o índice de ativação e adoção efetiva da plataforma?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe comercial sabe o LTV/CAC e margem por cliente?'),
          P(3, 'Quantas reuniões entre produto, engenharia e comercial ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'A equipe de CS sabe o NRR e a meta de expansão por cliente?'),
        ],
      },
      // 6.7 CONSTRUCAO CIVIL
      {
        slug: 'construcao-civil',
        perguntas: [
          P(1, 'Quantas decisões de obra (compras, cronograma) dependem de você por semana?'),
          P(
            1,
            'Quantas horas por semana você resolve problemas que o engenheiro deveria resolver?',
          ),
          P(1, 'Sua equipe de obra libera pagamentos ou aditivos sem te consultar?'),
          P(
            1,
            'Se você tirar 30 dias de férias, quantos cronogramas atrasam por falta de decisão?',
          ),
          P(1, 'Quantos orçamentos e negociações passam por você pessoalmente?'),
          P(1, 'Existe um diretor técnico com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o % de perda de materiais nos canteiros e o valor em reais?'),
          P(2, 'Quantos dias de cronograma foram perdidos por retrabalho no último trimestre?'),
          P(2, 'Qual o índice de horas ociosas da mão de obra (espera por material/decisão)?'),
          P(2, 'Qual o % de aditivos e serviços extras realizados e não cobrados?'),
          P(2, 'Sua equipe comercial sabe a margem de contribuição de cada obra?'),
          P(2, 'Qual a diferença média entre o orçado e o realizado nas obras atuais?'),
          P(2, 'Qual o giro de estoque de materiais e o capital imobilizado em almoxarifado?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação no canteiro?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'A engenharia sabe o custo orçado vs. realizado por serviço de cada obra?'),
          P(3, 'Quantas reuniões entre comercial, engenharia e financeiro ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'Sua equipe de planejamento sabe o custo real de cada etapa da obra?'),
        ],
      },
      // 6.8 TRANSPORTE/LOGISTICA
      {
        slug: 'transporte-logistica',
        perguntas: [
          P(1, 'Quantas decisões de rota, frete ou manutenção dependem de você por semana?'),
          P(1, 'Quantas negociações com grandes embarcadores passam por você pessoalmente?'),
          P(1, 'Sua equipe consegue redirecionar uma carga ou resolver avaria sem te consultar?'),
          P(1, 'Se você tirar 30 dias de férias, quantas operações param por falta de decisão?'),
          P(1, 'Quantas decisões de contratação e compra de veículos passam por você?'),
          P(1, 'Existe um gerente de operações com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o % de km rodados vazios e o custo mensal disso?'),
          P(2, 'Qual o índice de ociosidade da frota (veículos parados vs. disponíveis)?'),
          P(2, 'Qual o custo real por km rodado (combustível, pneus, manutenção)?'),
          P(2, 'Quantas entregas atrasaram e qual o custo de multas contratuais?'),
          P(2, 'Qual o índice de avarias, roubos ou perdas de carga em reais/ano?'),
          P(2, 'Qual o consumo médio de combustível vs. referência do fabricante?'),
          P(2, 'Quantas manutenções corretivas ocorreram vs. preventivas planejadas?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na ponta?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'A equipe sabe o custo e margem por rota, cliente e tipo de carga?'),
          P(3, 'Quantas reuniões entre comercial, operação e manutenção ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'O comercial sabe o custo real de cada rota antes de precificar o frete?'),
        ],
      },
      // 6.9 EDUCACAO
      {
        slug: 'educacao',
        perguntas: [
          P(1, 'Quantas decisões pedagógicas (currículo, professores) dependem de você?'),
          P(1, 'Quantas matrículas e negociações de desconto passam por você mensalmente?'),
          P(1, 'Sua coordenação resolve problemas de alunos/pais sem te consultar?'),
          P(1, 'Se você tirar 30 dias de férias, o que para de funcionar na instituição?'),
          P(1, 'Quantas decisões de expansão e infraestrutura dependem só de você?'),
          P(1, 'Existe um diretor executivo com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o índice de evasão escolar e a receita perdida com isso?'),
          P(2, 'Qual o índice de inadimplência e o prazo médio de recebimento?'),
          P(2, 'Qual o % de vagas ociosas por turma e por unidade?'),
          P(2, 'Alunos captados vs. perdidos e o custo de aquisição (CAC)?'),
          P(2, 'Taxa de rotatividade de professores e custo de substituição?'),
          P(2, 'A equipe sabe o custo por aluno e a margem por curso/turma?'),
          P(2, 'Qual o reajuste real das mensalidades vs. inflação nos últimos 3 anos?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na sala de aula?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'A equipe pedagógica sabe a meta de retenção por turma?'),
          P(3, 'Quantas reuniões entre pedagógico, comercial e financeiro ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'O comercial sabe a margem de contribuição por curso, turno e unidade?'),
        ],
      },
      // 6.10 ACADEMIAS DE GINASTICA
      {
        slug: 'academias-de-ginastica',
        perguntas: [
          P(1, 'Quantas matrículas e negociações de desconto dependem de você mensalmente?'),
          P(1, 'Sua recepção resolve problemas de alunos sem te consultar?'),
          P(1, 'Quantos dias por semana você precisa estar presencialmente na unidade?'),
          P(1, 'Se você tirar 30 dias de férias, o que para de funcionar na operação?'),
          P(1, 'Quantas decisões de contratação e compra de equipamentos passam por você?'),
          P(1, 'Existe um gerente de unidade com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o índice de evasão (churn) e a receita perdida com isso?'),
          P(2, 'Qual o índice de inadimplência e o prazo médio de recebimento?'),
          P(2, 'Qual o % de capacidade ociosa por horário e por unidade?'),
          P(2, 'Alunos captados vs. perdidos e o custo de aquisição (CAC)?'),
          P(2, 'Qual o índice de ocupação dos horários de pico vs. baixa?'),
          P(2, 'A equipe sabe a margem por plano, modalidade e aluno?'),
          P(2, 'Qual o % de alunos em planos com desconto ou congelados sem margem?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na recepção?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Os instrutores sabem a meta de retenção por turma?'),
          P(3, 'Quantas reuniões entre comercial, operação e financeiro ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'O comercial sabe a margem de contribuição por plano e unidade?'),
        ],
      },
    ]

    for (var i = 0; i < dados.length; i++) {
      var rec = findBySlug(dados[i].slug)
      if (!rec) continue
      rec.set('perguntas', dados[i].perguntas)
      app.save(rec)
    }
  },
  (app) => {
    // Reverte: limpa o campo perguntas de todos os setores
    try {
      var records = app.findRecordsByFilter('setores', '1=1', 'ordem', 0, 0)
      for (var i = 0; i < records.length; i++) {
        records[i].set('perguntas', [])
        app.save(records[i])
      }
    } catch (_) {}
  },
)
