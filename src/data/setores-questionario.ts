// Base de Conhecimento V6.5 — Contexto Estratégico Global (10 setores)
// Fonte: Contexto_Estratégico_Global_10_setores_V 6.5 (04ago26)
// Questionário Estrutural dos 3 Pilares, parametrizável por setor.

export interface PerguntaSetor {
  pilar: 1 | 2 | 3
  texto: string
}

export interface Setor {
  id: string
  nome: string
  slug: string
  segmentos: string[]
  microEpifanias: string[]
  perguntas: PerguntaSetor[]
}

export const nomePilares = {
  1: 'Prisão do Fundador',
  2: 'Ineficiência Invisível',
  3: 'Abismo Estratégia vs. Execução',
} as const

export const setores: Setor[] = [
  {
    id: 'saude',
    nome: 'Saúde',
    slug: 'saude',
    segmentos: ['Hospitalar', 'Clínica', 'Odontológica', 'Laboratório', 'Home Care'],
    microEpifanias: [
      'Glosa hospitalar invisível',
      'Ociosidade de leitos',
      'Retrabalho de faturamento',
      'Descasamento entre prontuário e conta',
    ],
    perguntas: [
      {
        pilar: 1,
        texto:
          'Quantas cirurgias ou procedimentos são cancelados por mês por falta de decisão da equipe?',
      },
      {
        pilar: 1,
        texto: 'Qual o percentual de decisões de internação que dependem da sua validação pessoal?',
      },
      {
        pilar: 1,
        texto: 'Sua equipe clínica tem autonomia para protocolos de urgência sem te consultar?',
      },
      {
        pilar: 1,
        texto:
          'Se você se ausentar por 30 dias, a operação assistencial mantém o padrão de qualidade?',
      },
      {
        pilar: 1,
        texto: 'Quantas decisões de compra de insumos de alto custo passam por você pessoalmente?',
      },
      {
        pilar: 1,
        texto: 'Existe um diretor técnico com autonomia formal para decidir sem consultá-lo?',
      },
      { pilar: 2, texto: 'Qual o índice de glosa das contas hospitalares no último trimestre?' },
      {
        pilar: 2,
        texto: 'Quanto tempo a equipe perde com retrabalho de faturamento ou guias de convênio?',
      },
      {
        pilar: 2,
        texto: 'Quantas horas administrativas são gastas por profissionais de saúde semanalmente?',
      },
      {
        pilar: 2,
        texto: 'Quantos contratos com operadoras estão há mais de 12 meses sem revisão de tabela?',
      },
      {
        pilar: 2,
        texto: 'Qual o valor total da inadimplência atual e quem são os 10 maiores devedores?',
      },
      { pilar: 2, texto: 'Qual a taxa de ocupação média de leitos ou salas de atendimento?' },
      {
        pilar: 2,
        texto:
          'Qual o volume de procedimentos realizados que não foram faturados por erro de registro?',
      },
      {
        pilar: 3,
        texto:
          'Qual o prazo médio entre uma decisão da diretoria e a implementação na ponta clínica?',
      },
      { pilar: 3, texto: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?' },
      {
        pilar: 3,
        texto: 'Sua equipe comercial/faturamento sabe o lucro real por procedimento ou convênio?',
      },
      {
        pilar: 3,
        texto:
          'Quantas reuniões de alinhamento entre corpo clínico e administrativo ocorrem por mês?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
      { pilar: 3, texto: 'A equipe sabe exatamente o custo real de cada procedimento realizado?' },
    ],
  },
  {
    id: 'servicos',
    nome: 'Serviços Profissionais',
    slug: 'servicos-profissionais',
    segmentos: ['Consultoria', 'Advocacia', 'Contabilidade', 'Arquitetura', 'Agência', 'TI'],
    microEpifanias: [
      'Horas não cobradas',
      'Taxa de utilização',
      'Contratos sem revisão de preço',
      'Custo de oportunidade do sócio',
    ],
    perguntas: [
      {
        pilar: 1,
        texto: 'Qual % do faturamento depende de você estar pessoalmente na negociação ou entrega?',
      },
      {
        pilar: 1,
        texto: 'Quantos contratos estão parados aguardando sua assinatura ou aprovação?',
      },
      { pilar: 1, texto: 'Sua equipe consegue fechar um negócio de valor médio sem te envolver?' },
      { pilar: 1, texto: 'Se você tirar 60 dias de férias, a receita da empresa cai quanto?' },
      {
        pilar: 1,
        texto: 'Quantas entregas ou propostas dependem da sua revisão final pessoal por semana?',
      },
      {
        pilar: 1,
        texto: 'Existe um sócio/gerente com autonomia formal para decidir sem consultá-lo?',
      },
      {
        pilar: 2,
        texto: 'Quantas horas são perdidas com retrabalho por falta de briefing padronizado?',
      },
      {
        pilar: 2,
        texto: 'Qual o percentual de horas trabalhadas e não cobradas (vazamento de honorários)?',
      },
      {
        pilar: 2,
        texto:
          'Quanto tempo a equipe gasta com tarefas administrativas que poderiam ser automatizadas?',
      },
      { pilar: 2, texto: 'Quantos contratos são renovados sem revisão de preço ou escopo?' },
      { pilar: 2, texto: 'Qual o valor da inadimplência e quem são os 10 maiores devedores?' },
      {
        pilar: 2,
        texto: 'Qual a taxa de utilização real (horas faturáveis / horas disponíveis) da equipe?',
      },
      {
        pilar: 2,
        texto: 'Quantas propostas enviadas no último trimestre não foram convertidas e por quê?',
      },
      { pilar: 3, texto: 'Qual o prazo médio entre decisão estratégica e implementação na ponta?' },
      { pilar: 3, texto: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?' },
      { pilar: 3, texto: 'Sua equipe comercial sabe o lucro líquido por cliente que ela vende?' },
      {
        pilar: 3,
        texto:
          'Quantas horas de reunião a equipe gasta discutindo o que já deveria ter sido feito?',
      },
      {
        pilar: 3,
        texto: 'A equipe sabe qual a meta de receita por consultor e como ela é calculada?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
    ],
  },
  {
    id: 'industria',
    nome: 'Indústria',
    slug: 'industria',
    segmentos: ['Manufatura', 'Metalurgia', 'Alimentos', 'Químico', 'Têxtil', 'Plástico'],
    microEpifanias: [
      'Refugo',
      'Paradas não programadas',
      'Ociosidade de máquinas',
      'Giro de estoque',
      'Custo real da OP',
    ],
    perguntas: [
      { pilar: 1, texto: 'Quantos dias por mês você passa apagando incêndio no chão de fábrica?' },
      {
        pilar: 1,
        texto: 'Qual o percentual das decisões de compra de matéria-prima que passam por você?',
      },
      {
        pilar: 1,
        texto:
          'Sua equipe de produção tem autonomia para parar uma linha com problema sem te consultar?',
      },
      {
        pilar: 1,
        texto: 'Quantos fornecedores foram escolhidos pessoalmente por você sem critério formal?',
      },
      {
        pilar: 1,
        texto: 'Quantas decisões de investimento em máquinas dependem exclusivamente de você?',
      },
      {
        pilar: 1,
        texto: 'Existe um gerente industrial com autonomia formal para decidir sem consultá-lo?',
      },
      { pilar: 2, texto: 'Qual o percentual de refugo na linha de produção e o valor em reais?' },
      { pilar: 2, texto: 'Quantas horas de parada não programada ocorreram e qual o custo/hora?' },
      { pilar: 2, texto: 'Qual o giro de estoque dos seus 10 principais insumos?' },
      {
        pilar: 2,
        texto: 'Quantos pedidos foram perdidos por atraso na entrega no último trimestre?',
      },
      {
        pilar: 2,
        texto: 'Sua equipe comercial sabe a margem de contribuição de cada produto que vende?',
      },
      { pilar: 2, texto: 'Qual o índice de ociosidade das suas máquinas mais caras?' },
      {
        pilar: 2,
        texto: 'Qual o percentual de retrabalho ou devolução por defeito de fabricação?',
      },
      {
        pilar: 3,
        texto: 'Qual o prazo médio entre decisão estratégica e implementação na fábrica?',
      },
      { pilar: 3, texto: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?' },
      {
        pilar: 3,
        texto: 'Sua equipe de produção conhece a margem de contribuição do que fabrica?',
      },
      {
        pilar: 3,
        texto: 'Quantas reuniões de alinhamento entre comercial e produção ocorrem por mês?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
      {
        pilar: 3,
        texto: 'Sua equipe de PCP sabe exatamente o custo real de cada ordem de produção?',
      },
    ],
  },
  {
    id: 'varejo',
    nome: 'Varejo',
    slug: 'varejo',
    segmentos: ['Lojas Físicas', 'E-commerce', 'Distribuição', 'Alimentação', 'Moda'],
    microEpifanias: [
      'Ruptura de estoque',
      'Vendas perdidas',
      'Quebra/perda',
      'Ticket médio',
      'Margem por categoria',
    ],
    perguntas: [
      { pilar: 1, texto: 'Sua loja consegue operar 30 dias sem sua presença física?' },
      {
        pilar: 1,
        texto: 'Quantas decisões de precificação e desconto a equipe toma sem te consultar?',
      },
      {
        pilar: 1,
        texto: 'Quanto tempo leva para contratar um vendedor se você não aprovar pessoalmente?',
      },
      {
        pilar: 1,
        texto: 'Qual o valor de mercadoria parada porque você não decidiu o que fazer com ela?',
      },
      {
        pilar: 1,
        texto: 'Quantas decisões de compra de novos produtos passam por você mensalmente?',
      },
      {
        pilar: 1,
        texto: 'Existe um gerente de loja com autonomia formal para decidir sem consultá-lo?',
      },
      {
        pilar: 2,
        texto: 'Qual o índice de ruptura de estoque dos seus 10 produtos mais vendidos?',
      },
      { pilar: 2, texto: 'Quantas vendas foram perdidas por falta de produto na prateleira?' },
      { pilar: 2, texto: 'Qual o percentual de devoluções e qual o motivo principal?' },
      {
        pilar: 2,
        texto: 'Quanto gasta por mês com frete expresso por falha no planejamento de compras?',
      },
      { pilar: 2, texto: 'Sua equipe sabe o ticket médio por vendedor e como melhorá-lo?' },
      { pilar: 2, texto: 'Qual o índice de quebra/perda (furtos, vencimentos, danos) em reais?' },
      { pilar: 2, texto: 'Qual o giro de estoque geral e por categoria de produto?' },
      { pilar: 3, texto: 'Qual o prazo médio entre decisão estratégica e implementação na loja?' },
      { pilar: 3, texto: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?' },
      { pilar: 3, texto: 'Sua equipe de loja sabe a meta de margem por categoria de produto?' },
      {
        pilar: 3,
        texto: 'Quantas decisões da última reunião comercial foram efetivamente implementadas?',
      },
      {
        pilar: 3,
        texto: 'Existe um comitê de gestão periódico entre lojas, compras e financeiro?',
      },
      { pilar: 3, texto: 'A equipe sabe o lucro líquido por cliente, canal e produto vendido?' },
    ],
  },
  {
    id: 'agronegocio',
    nome: 'Agronegócio',
    slug: 'agronegocio',
    segmentos: ['Grãos', 'Pecuária', 'Cana', 'Café', 'Fruticultura'],
    microEpifanias: [
      'Perda na colheita',
      'Custo por hectare',
      'Ociosidade da frota',
      'Janelas perdidas',
      'Quebra técnica',
    ],
    perguntas: [
      {
        pilar: 1,
        texto: 'Quantas decisões de plantio, colheita ou venda dependem exclusivamente de você?',
      },
      {
        pilar: 1,
        texto: 'Seu gerente de fazenda tem autonomia para contratar safristas sem sua aprovação?',
      },
      {
        pilar: 1,
        texto: 'Quanto tempo você gasta resolvendo problemas operacionais de baixo valor?',
      },
      {
        pilar: 1,
        texto: 'Quantas negociações de venda da safra passam por você pessoalmente por ano?',
      },
      {
        pilar: 1,
        texto: 'Em janelas críticas, quantas decisões ficam travadas aguardando sua palavra?',
      },
      {
        pilar: 1,
        texto: 'Existe um gerente de fazenda com autonomia formal para decidir sem consultá-lo?',
      },
      { pilar: 2, texto: 'Qual o % de perda na colheita por ineficiência e o valor em reais?' },
      {
        pilar: 2,
        texto: 'Quanto gasta por safra com insumos aplicados sem critério de taxa variável?',
      },
      { pilar: 2, texto: 'Qual o custo real por hectare das suas operações mecanizadas?' },
      {
        pilar: 2,
        texto: 'Quantos dias de janela foram perdidos por falha no planejamento logístico?',
      },
      { pilar: 2, texto: 'Qual o índice de ociosidade da sua frota de tratores e colheitadeiras?' },
      { pilar: 2, texto: 'Qual o % de quebra técnica (mortalidade ou pragas) na produção?' },
      { pilar: 2, texto: 'Qual o seu custo por hectare/cabeça comparado à referência regional?' },
      { pilar: 3, texto: 'Qual o prazo médio entre decisão estratégica e implementação no campo?' },
      { pilar: 3, texto: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?' },
      { pilar: 3, texto: 'Sua equipe de campo sabe a meta de produtividade por talhão?' },
      { pilar: 3, texto: 'Quantas decisões do planejamento safra foram efetivamente executadas?' },
      {
        pilar: 3,
        texto: 'Existe um comitê de gestão periódico entre produção, comercial e financeiro?',
      },
      { pilar: 3, texto: 'A equipe comercial sabe o custo de produção e a margem por produto?' },
    ],
  },
  {
    id: 'tecnologia',
    nome: 'Tecnologia/Startups',
    slug: 'tecnologia-startups',
    segmentos: ['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'Marketplace'],
    microEpifanias: [
      'Churn',
      'CAC/LTV',
      'Débito técnico',
      'Risco de concentração de receita',
      'Runway',
    ],
    perguntas: [
      {
        pilar: 1,
        texto: 'Qual % das decisões de produto e roadmap dependem exclusivamente de você?',
      },
      {
        pilar: 1,
        texto: 'Quantas vendas enterprise dependem da sua presença pessoal na negociação?',
      },
      { pilar: 1, texto: 'Sua equipe de engenharia consegue fazer deploy sem sua aprovação?' },
      { pilar: 1, texto: 'Se você ficar 30 dias sem acesso, o que para de funcionar na empresa?' },
      {
        pilar: 1,
        texto: 'Quantas decisões de contratação e precificação passam por você mensalmente?',
      },
      { pilar: 1, texto: 'Existe um COO/CTO com autonomia formal para decidir sem consultá-lo?' },
      {
        pilar: 2,
        texto: 'Qual o churn mensal e quanto isso representa em receita perdida por ano?',
      },
      { pilar: 2, texto: 'Qual o CAC/payback e o LTV por canal de aquisição?' },
      {
        pilar: 2,
        texto: 'Quantas horas de engenharia são perdidas com débito técnico ou retrabalho?',
      },
      { pilar: 2, texto: 'Qual o tempo de resposta do suporte e quantos clientes estão em risco?' },
      { pilar: 2, texto: 'Qual o % da receita concentrado nos 10 maiores clientes?' },
      { pilar: 2, texto: 'Quantos leads foram perdidos por atraso na resposta ou onboarding?' },
      { pilar: 2, texto: 'Qual o índice de ativação e adoção efetiva da plataforma?' },
      { pilar: 3, texto: 'Qual o prazo médio entre decisão estratégica e implementação?' },
      { pilar: 3, texto: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?' },
      { pilar: 3, texto: 'Sua equipe comercial sabe o LTV/CAC e margem por cliente?' },
      {
        pilar: 3,
        texto: 'Quantas reuniões entre produto, engenharia e comercial ocorrem por mês?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
      { pilar: 3, texto: 'A equipe de CS sabe o NRR e a meta de expansão por cliente?' },
    ],
  },
  {
    id: 'construcao',
    nome: 'Construção Civil',
    slug: 'construcao-civil',
    segmentos: ['Edificações', 'Incorporação', 'Infraestrutura', 'Reformas'],
    microEpifanias: [
      'Desperdício de materiais',
      'Retrabalho',
      'Aditivos não cobrados',
      'Orçado vs. realizado',
    ],
    perguntas: [
      {
        pilar: 1,
        texto: 'Quantas decisões de obra (compras, cronograma) dependem de você por semana?',
      },
      {
        pilar: 1,
        texto: 'Quantas horas por semana você resolve problemas que o engenheiro deveria resolver?',
      },
      { pilar: 1, texto: 'Sua equipe de obra libera pagamentos ou aditivos sem te consultar?' },
      {
        pilar: 1,
        texto: 'Se você tirar 30 dias de férias, quantos cronogramas atrasam por falta de decisão?',
      },
      { pilar: 1, texto: 'Quantos orçamentos e negociações passam por você pessoalmente?' },
      {
        pilar: 1,
        texto: 'Existe um diretor técnico com autonomia formal para decidir sem consultá-lo?',
      },
      { pilar: 2, texto: 'Qual o % de perda de materiais nos canteiros e o valor em reais?' },
      {
        pilar: 2,
        texto: 'Quantos dias de cronograma foram perdidos por retrabalho no último trimestre?',
      },
      {
        pilar: 2,
        texto: 'Qual o índice de horas ociosas da mão de obra (espera por material/decisão)?',
      },
      { pilar: 2, texto: 'Qual o % de aditivos e serviços extras realizados e não cobrados?' },
      { pilar: 2, texto: 'Sua equipe comercial sabe a margem de contribuição de cada obra?' },
      { pilar: 2, texto: 'Qual a diferença média entre o orçado e o realizado nas obras atuais?' },
      {
        pilar: 2,
        texto: 'Qual o giro de estoque de materiais e o capital imobilizado em almoxarifado?',
      },
      {
        pilar: 3,
        texto: 'Qual o prazo médio entre decisão estratégica e implementação no canteiro?',
      },
      { pilar: 3, texto: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?' },
      {
        pilar: 3,
        texto: 'A engenharia sabe o custo orçado vs. realizado por serviço de cada obra?',
      },
      {
        pilar: 3,
        texto: 'Quantas reuniões entre comercial, engenharia e financial ocorrem por mês?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
      { pilar: 3, texto: 'Sua equipe de planejamento sabe o custo real de cada etapa da obra?' },
    ],
  },
  {
    id: 'transporte',
    nome: 'Transporte/Logística',
    slug: 'transporte-logistica',
    segmentos: ['Cargas', 'Passageiros', 'Distribuição', 'Armazenagem'],
    microEpifanias: ['Km vazios', 'Ociosidade da frota', 'Custo por km', 'Manutenção corretiva'],
    perguntas: [
      {
        pilar: 1,
        texto: 'Quantas decisões de rota, frete ou manutenção dependem de você por semana?',
      },
      {
        pilar: 1,
        texto: 'Quantas negociações com grandes embarcadores passam por você pessoalmente?',
      },
      {
        pilar: 1,
        texto: 'Sua equipe consegue redirecionar uma carga ou resolver avaria sem te consultar?',
      },
      {
        pilar: 1,
        texto: 'Se você tirar 30 dias de férias, quantas operações param por falta de decisão?',
      },
      { pilar: 1, texto: 'Quantas decisões de contratação e compra de veículos passam por você?' },
      {
        pilar: 1,
        texto: 'Existe um gerente de operações com autonomia formal para decidir sem consultá-lo?',
      },
      { pilar: 2, texto: 'Qual o % de km rodados vazios e o custo mensal disso?' },
      {
        pilar: 2,
        texto: 'Qual o índice de ociosidade da frota (veículos parados vs. disponíveis)?',
      },
      { pilar: 2, texto: 'Qual o custo real por km rodado (combustível, pneus, manutenção)?' },
      { pilar: 2, texto: 'Quantas entregas atrasaram e qual o custo de multas contratuais?' },
      { pilar: 2, texto: 'Qual o índice de avarias, roubos ou perdas de carga em reais/ano?' },
      { pilar: 2, texto: 'Qual o consumo médio de combustível vs. referência do fabricante?' },
      { pilar: 2, texto: 'Quantas manutenções corretivas ocorreram vs. preventivas planejadas?' },
      { pilar: 3, texto: 'Qual o prazo médio entre decisão estratégica e implementação na ponta?' },
      { pilar: 3, texto: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?' },
      { pilar: 3, texto: 'A equipe sabe o custo e margem por rota, cliente e tipo de carga?' },
      {
        pilar: 3,
        texto: 'Quantas reuniões entre comercial, operação e manutenção ocorrem por mês?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
      {
        pilar: 3,
        texto: 'O comercial sabe o custo real de cada rota antes de precificar o frete?',
      },
    ],
  },
  {
    id: 'educacao',
    nome: 'Educação',
    slug: 'educacao',
    segmentos: ['Básica', 'Superior', 'Técnico', 'Idiomas', 'Edtech'],
    microEpifanias: ['Evasão', 'Inadimplência', 'Vagas ociosas', 'Rotatividade docente'],
    perguntas: [
      {
        pilar: 1,
        texto: 'Quantas decisões pedagógicas (currículo, professores) dependem de você?',
      },
      {
        pilar: 1,
        texto: 'Quantas matrículas e negociações de desconto passam por você mensalmente?',
      },
      { pilar: 1, texto: 'Sua coordenação resolve problemas de alunos/pais sem te consultar?' },
      {
        pilar: 1,
        texto: 'Se você tirar 30 dias de férias, o que para de funcionar na instituição?',
      },
      { pilar: 1, texto: 'Quantas decisões de expansão e infraestrutura dependem só de você?' },
      {
        pilar: 1,
        texto: 'Existe um diretor executivo com autonomia formal para decidir sem consultá-lo?',
      },
      { pilar: 2, texto: 'Qual o índice de evasão escolar e a receita perdida com isso?' },
      { pilar: 2, texto: 'Qual o índice de inadimplência e o prazo médio de recebimento?' },
      { pilar: 2, texto: 'Qual o % de vagas ociosas por turma e por unidade?' },
      { pilar: 2, texto: 'Alunos captados vs. perdidos e o custo de aquisição (CAC)?' },
      { pilar: 2, texto: 'Taxa de rotatividade de professores e custo de substituição?' },
      { pilar: 2, texto: 'A equipe sabe o custo por aluno e a margem por curso/turma?' },
      { pilar: 2, texto: 'Qual o reajuste real das mensalidades vs. inflação nos últimos 3 anos?' },
      {
        pilar: 3,
        texto: 'Qual o prazo médio entre decisão estratégica e implementação na sala de aula?',
      },
      { pilar: 3, texto: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?' },
      { pilar: 3, texto: 'A equipe pedagógica sabe a meta de retenção por turma?' },
      {
        pilar: 3,
        texto: 'Quantas reuniões entre pedagógico, comercial e financial ocorrem por mês?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
      { pilar: 3, texto: 'O comercial sabe a margem de contribuição por curso, turno e unidade?' },
    ],
  },
  {
    id: 'academias',
    nome: 'Academias de Ginástica',
    slug: 'academias-de-ginastica',
    segmentos: ['Musculação', 'Estúdio', 'CrossFit', 'Pilates', 'Natação'],
    microEpifanias: ['Evasão', 'Capacidade ociosa', 'Ocupação por horário', 'CAC por aluno'],
    perguntas: [
      {
        pilar: 1,
        texto: 'Quantas matrículas e negociações de desconto dependem de você mensalmente?',
      },
      { pilar: 1, texto: 'Sua recepção resolve problemas de alunos sem te consultar?' },
      { pilar: 1, texto: 'Quantos dias por semana você precisa estar presencialmente na unidade?' },
      { pilar: 1, texto: 'Se você tirar 30 dias de férias, o que para de funcionar na operação?' },
      {
        pilar: 1,
        texto: 'Quantas decisões de contratação e compra de equipamentos passam por você?',
      },
      {
        pilar: 1,
        texto: 'Existe um gerente de unidade com autonomia formal para decidir sem consultá-lo?',
      },
      { pilar: 2, texto: 'Qual o índice de evasão (churn) e a receita perdida com isso?' },
      { pilar: 2, texto: 'Qual o índice de inadimplência e o prazo médio de recebimento?' },
      { pilar: 2, texto: 'Qual o % de capacidade ociosa por horário e por unidade?' },
      { pilar: 2, texto: 'Alunos captados vs. perdidos e o custo de aquisição (CAC)?' },
      { pilar: 2, texto: 'Qual o índice de ocupação dos horários de pico vs. baixa?' },
      { pilar: 2, texto: 'A equipe sabe a margem por plano, modalidade e aluno?' },
      { pilar: 2, texto: 'Qual o % de alunos em planos com desconto ou congelados sem margem?' },
      {
        pilar: 3,
        texto: 'Qual o prazo médio entre decisão estratégica e implementação na recepção?',
      },
      { pilar: 3, texto: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?' },
      { pilar: 3, texto: 'Os instrutores sabem a meta de retenção por turma?' },
      {
        pilar: 3,
        texto: 'Quantas reuniões entre comercial, operação e financial ocorrem por mês?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
      { pilar: 3, texto: 'O comercial sabe a margem de contribuição por plano e unidade?' },
    ],
  },
]

export function getSetorById(id: string): Setor | undefined {
  return setores.find((s) => s.id === id)
}

export function getPerguntasPorPilar(setor: Setor, pilar: 1 | 2 | 3): PerguntaSetor[] {
  return setor.perguntas.filter((p) => p.pilar === pilar)
}
