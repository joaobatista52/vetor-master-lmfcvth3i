// Base de Conhecimento V6.5 — Questionários Consolidados (10 setores)
// Fonte: "Questionários_Consolidados_10_Setores_V6.5_04ago26"
//
// Estrutura completa do questionário, na ordem de exibição:
//   Seção 1 — Perfil da Empresa e Contexto
//   Pilar 1 — Prisão do Fundador
//   Pilar 2 — Ineficiência Invisível
//   Pilar 3 — Abismo Estratégia vs. Execução
//   Seção 5 — Hackman (6 perguntas, iguais para todos os setores)
//   Seção 6 — Buffett (6 perguntas, iguais para todos os setores)
//   Seção 6.6 — Runway 12 meses (somente Tecnologia/Startups)
//   Seção 7 — Expectativas e Ambição (5 perguntas, iguais para todos)
//   Seção 8 — Inovação e Tecnologia (7 perguntas, versão setorial fiel)
//   Seção 9 — Próximos Passos (MaaS/Híbrido/CaaS)
//
// Os 3 Pilares são extraídos fielmente do PDF "Contexto Estratégico Global
// 10 Setores V6.5" (04ago26). As Seções 1, 5, 6, 6.6, 7, 8 e 9 são extraídas
// do PDF "Questionários Consolidados 10 Setores V6.5" (04ago26).

export interface PerguntaSetor {
  pilar: 1 | 2 | 3
  texto: string
}

export type TipoInput = 'escala' | 'texto' | 'numero' | 'textarea' | 'select'

export interface PerguntaSecao {
  texto: string
  tipo?: TipoInput // default 'escala'
  opcoes?: string[]
  placeholder?: string
}

export interface SecaoQuestionario {
  id: string
  titulo: string
  descricao?: string
  perguntas: PerguntaSecao[]
}

export interface Setor {
  id: string
  nome: string
  slug: string
  segmentos: string[]
  microEpifanias: string[]
  perguntas: PerguntaSetor[] // 3 Pilares (Seções P1/P2/P3)
  secaoPerfil: PerguntaSecao[] // Seção 1
  secaoInovacao: PerguntaSecao[] // Seção 8 (setorial)
  secaoRunway?: PerguntaSecao[] // Seção 6.6 (somente Tecnologia)
}

export const nomePilares = {
  1: 'Prisão do Fundador',
  2: 'Ineficiência Invisível',
  3: 'Abismo Estratégia vs. Execução',
} as const

// --- Opções reutilizadas ---

export const escalaOpcoes = [
  'Sim, totalmente.',
  'Parcialmente, com ressalvas.',
  'Raramente / com dificuldade.',
  'Não / não sei informar.',
] as const

export const faturamentoAnualOptions = [
  'Até R$ 600 mil/ano',
  'R$ 600 mil - R$ 2,4 mi/ano',
  'R$ 2,4 mi - R$ 6 mi/ano',
  'R$ 6 mi - R$ 12 mi/ano',
  'Acima de R$ 12 mi/ano',
]

export const funcionariosOptions = [
  '1 a 5 colaboradores',
  '6 a 20 colaboradores',
  '21 a 50 colaboradores',
  '51 a 100 colaboradores',
  'Acima de 100 colaboradores',
]

export const porteOptions = ['MEI', 'ME', 'EPP', 'Média', 'Grande']

export const regimeTributarioOptions = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real']

export const tempoMercadoOptions = [
  'Menos de 2 anos',
  '2 a 5 anos',
  '5 a 10 anos',
  'Mais de 10 anos',
]

export const formaJuridicaOptions = ['MEI', 'Empresário Individual', 'LTDA', 'S.A.']

export const prazoOptions = ['3 meses', '6 meses', '12 meses', '24 meses']

export const escadaValorOptions = [
  'MaaS (Management as a Service) — assinatura mensal',
  'Híbrido — consultoria pontual + licenciamento da plataforma',
  'CaaS (Consulting as a Service) — projeto complexo com Success Fee',
]

// ============================================================
// Seções compartilhadas (idênticas para todos os 10 setores)
// ============================================================

// Seção 1 — Perfil da Empresa e Contexto
export const secaoPerfil: PerguntaSecao[] = [
  { texto: 'Qual o porte da empresa?', tipo: 'select', opcoes: porteOptions },
  { texto: 'Qual o faturamento bruto anual?', tipo: 'select', opcoes: faturamentoAnualOptions },
  { texto: 'Quantos colaboradores a empresa possui?', tipo: 'select', opcoes: funcionariosOptions },
  { texto: 'Qual o regime tributário?', tipo: 'select', opcoes: regimeTributarioOptions },
  {
    texto: 'Há quanto tempo a empresa está no mercado?',
    tipo: 'select',
    opcoes: tempoMercadoOptions,
  },
  { texto: 'Qual a forma jurídica da empresa?', tipo: 'select', opcoes: formaJuridicaOptions },
  { texto: 'Quantos sócios a empresa possui?', tipo: 'numero', placeholder: 'Ex: 2' },
]

// Seção 5 — Hackman (6 perguntas)
// Temas: time real, direção convincente, estrutura habilitadora, contexto de
// apoio, coaching especializado (5 condições de Hackman) + competências.
export const secaoHackman: PerguntaSecao[] = [
  {
    texto:
      'A sua equipe é um "time real", com fronteiras claras e membros que se conhecem e dependem uns dos outros para entregar resultados?',
  },
  {
    texto:
      'A equipe tem uma direção convincente — uma meta desafiadora e clara que mobiliza todos na mesma direção?',
  },
  {
    texto:
      'A estrutura da equipe é habilitadora — o design de tarefas permite autonomia e impacto mensurável no resultado?',
  },
  {
    texto:
      'O contexto organizacional oferece apoio — sistemas de recompensa, recursos e reconhecimento adequados ao desempenho?',
  },
  {
    texto:
      'Há coaching especializado disponível — mentoria técnica e feedback contínuo acessíveis à equipe?',
  },
  {
    texto:
      'Os membros da equipe possuem as competências técnicas e interpessoais necessárias para entregar os resultados esperados?',
  },
]

// Seção 6 — Buffett (6 perguntas)
// Temas: EBITDA, endividamento, DRE, margem de segurança, ROIC vs WACC, FCF.
export const secaoBuffett: PerguntaSecao[] = [
  {
    texto: 'Qual a margem EBITDA atual da empresa e como ela se compara aos últimos 3 anos?',
    tipo: 'texto',
    placeholder: 'Ex: 18%, em queda vs. 24% há 3 anos',
  },
  {
    texto: 'Qual o nível de endividamento (Dívida Líquida / EBITDA) da empresa?',
    tipo: 'texto',
    placeholder: 'Ex: 2,5x',
  },
  {
    texto:
      'A empresa possui DRE (Demonstração do Resultado do Exercício) projetada e atualizada mensalmente?',
    tipo: 'texto',
    placeholder: 'Ex: Sim, mensal / Não, apenas no contador',
  },
  {
    texto: 'Qual a margem de segurança atual dos seus principais produtos ou serviços?',
    tipo: 'texto',
    placeholder: 'Ex: 35%',
  },
  {
    texto: 'O ROIC (Retorno sobre o Capital Investido) da empresa supera o WACC?',
    tipo: 'texto',
    placeholder: 'Ex: ROIC 16% vs WACC 13,75%',
  },
  {
    texto: 'A empresa gera fluxo de caixa livre (FCF) positivo de forma recorrente?',
    tipo: 'texto',
    placeholder: 'Ex: Sim, desde 2023',
  },
]

// Seção 6.6 — Runway 12 meses (somente Tecnologia/Startups)
export const secaoRunway: PerguntaSecao[] = [
  {
    texto: 'Qual o runway atual (caixa disponível / burn rate mensal) em meses?',
    tipo: 'numero',
    placeholder: 'Ex: 14',
  },
  {
    texto: 'Qual o burn rate mensal e quanto dele é composto por custos fixos?',
    tipo: 'texto',
    placeholder: 'Ex: R$ 120 mil/mês, 70% fixos',
  },
  {
    texto: 'Há rodada de captação prevista nos próximos 12 meses? Qual o tamanho estimado?',
    tipo: 'texto',
    placeholder: 'Ex: Seed R$ 3 mi em 6 meses',
  },
  {
    texto: 'Qual a meta de receita recorrente (ARR/MRR) para os próximos 12 meses?',
    tipo: 'texto',
    placeholder: 'Ex: MRR R$ 250 mil',
  },
]

// Seção 7 — Expectativas e Ambição (5 perguntas)
export const secaoExpectativas: PerguntaSecao[] = [
  {
    texto: 'Qual a sua principal meta de crescimento para os próximos 12 meses?',
    tipo: 'textarea',
    placeholder: 'Ex: Dobrar o faturamento e abrir 2 novas unidades',
  },
  {
    texto: 'Em qual horizonte de tempo você espera sair da prisão do fundador?',
    tipo: 'select',
    opcoes: prazoOptions,
  },
  {
    texto: 'Qual o resultado financeiro que você considera sucesso ao final do processo?',
    tipo: 'textarea',
    placeholder: 'Ex: EBITDA de 25% e captação de R$ 5 mi',
  },
  {
    texto: 'O que acontece com a empresa se nada mudar nos próximos 12 meses?',
    tipo: 'textarea',
    placeholder: 'Ex: Perda de competitividade e risco de caixa',
  },
  {
    texto: 'Qual o nível de comprometimento da sua equipe com essa transformação?',
    tipo: 'escala',
  },
]

// Seção 9 — Próximos Passos (MaaS/Híbrido/CaaS)
export const secaoProximosPassos: PerguntaSecao[] = [
  {
    texto: 'Qual modalidade de engajamento faz mais sentido para o seu momento atual?',
    tipo: 'select',
    opcoes: escadaValorOptions,
  },
  {
    texto: 'Qual o budget mensal disponível para a transformação?',
    tipo: 'texto',
    placeholder: 'Ex: R$ 15 mil/mês',
  },
  {
    texto: 'Quem serão os responsáveis internos por executar o plano de ação?',
    tipo: 'texto',
    placeholder: 'Ex: COO + Diretor Financeiro',
  },
  {
    texto: 'Há disposição para implementar mudanças estruturais nos próximos 90 dias?',
    tipo: 'escala',
  },
]

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
    secaoPerfil,
    secaoInovacao: [
      { texto: 'O prontuário eletrônico e o sistema de faturamento estão integrados?' },
      { texto: 'A empresa utiliza BI/dashboards em tempo real para ocupação de leitos e glosas?' },
      { texto: 'Há iniciativas de telemedicina ou atendimento digital implementadas?' },
      {
        texto:
          'Qual o nível de automação dos processos administrativos (agendamento, faturamento, auditoria de glosas)?',
      },
      {
        texto:
          'A empresa utiliza IA para análise preditiva de ocupação ou gestão de riscos clínicos?',
      },
      { texto: 'Os sistemas críticos estão em nuvem (Cloud) ou on-premise?' },
      { texto: 'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?' },
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
    secaoPerfil,
    secaoInovacao: [
      { texto: 'A empresa utiliza CRM para gestão de clientes, propostas e contratos?' },
      {
        texto: 'Há controle automatizado de horas faturáveis e taxa de utilização por consultor?',
      },
      {
        texto:
          'Qual o nível de automação de tarefas administrativas (cobrança, relatórios, onboarding)?',
      },
      {
        texto: 'A empresa utiliza BI para acompanhar margem por cliente, projeto e consultor?',
      },
      {
        texto: 'Há iniciativas de produto digital (produtos escaláveis além de horas consultivas)?',
      },
      { texto: 'Os sistemas estão em nuvem (Cloud) e integrados entre si?' },
      { texto: 'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?' },
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
    secaoPerfil,
    secaoInovacao: [
      {
        texto: 'Há sistema de gestão integrado (ERP) conectando produção, compras e financeiro?',
      },
      {
        texto: 'A empresa utiliza BI/dashboards em tempo real para OEE, refugo e paradas?',
      },
      {
        texto: 'Há automação industrial (IoT, sensores, manutenção preditiva) implementada?',
      },
      {
        texto: 'Qual o nível de rastreabilidade de lotes, ordens de produção e matéria-prima?',
      },
      {
        texto: 'A empresa utiliza IA para previsão de demanda ou otimização de mix de produção?',
      },
      {
        texto: 'Os sistemas industriais e administrativos estão integrados e em nuvem?',
      },
      { texto: 'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?' },
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
    secaoPerfil,
    secaoInovacao: [
      {
        texto: 'Há ERP/PDV integrado com e-commerce e gestão de estoque em tempo real?',
      },
      {
        texto: 'A empresa utiliza BI para ticket médio, margem por categoria e curva ABC?',
      },
      { texto: 'Há automação de reposição de estoque e precificação dinâmica?' },
      { texto: 'A empresa utiliza CRM/fidelidade para retenção e upsell?' },
      {
        texto: 'Há iniciativas de IA para recomendação de produtos ou previsão de demanda?',
      },
      {
        texto: 'Os canais (loja, e-commerce, marketplace) estão integrados em omnichannel?',
      },
      { texto: 'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?' },
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
    secaoPerfil,
    secaoInovacao: [
      {
        texto: 'Há sistema de gestão integrando fazenda, insumos, financeiro e comercial?',
      },
      {
        texto: 'A empresa utiliza agricultura de precisão (taxa variável, mapas de produtividade)?',
      },
      { texto: 'Há telemetria e IoT na frota e equipamentos (tratores, colheitadeiras)?' },
      {
        texto: 'A empresa utiliza BI para custo por hectare, margem por talhão e produtividade?',
      },
      { texto: 'Há automação no controle de pragas, irrigação ou manejo?' },
      {
        texto: 'A empresa utiliza IA/satélite para previsão de safra e gestão de risco climático?',
      },
      { texto: 'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?' },
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
    secaoPerfil,
    secaoRunway,
    secaoInovacao: [
      {
        texto: 'A arquitetura de produto é escalável e o débito técnico está sob controle?',
      },
      { texto: 'Há observabilidade (logs, métricas, tracing) e CI/CD automatizado?' },
      {
        texto: 'A empresa utiliza BI/dashboards para MRR, churn, CAC/LTV e ativação em tempo real?',
      },
      { texto: 'Há IA Generativa/RAG incorporada ao produto ou à operação?' },
      { texto: 'A infraestrutura está em Cloud nativa com custo otimizado (FinOps)?' },
      { texto: 'Há automação de onboarding, suporte e retenção (CS)?' },
      { texto: 'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?' },
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
        texto: 'Quantas reuniões entre comercial, engenharia e financeiro ocorrem por mês?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
      { pilar: 3, texto: 'Sua equipe de planejamento sabe o custo real de cada etapa da obra?' },
    ],
    secaoPerfil,
    secaoInovacao: [
      { texto: 'A empresa utiliza BIM (Building Information Modeling) nos projetos?' },
      { texto: 'Há ERP integrando orçamento, compras, cronograma e obra?' },
      {
        texto: 'A empresa utiliza BI para orçado vs. realizado, aditivos e margem por obra?',
      },
      {
        texto: 'Há automação de medição, liberação de pagamentos e controle de suprimentos?',
      },
      {
        texto: 'A empresa utiliza IoT/sensores em canteiro (segurança, equipamentos, qualidade)?',
      },
      { texto: 'Há IA para previsão de prazo, custo e gestão de risco de obra?' },
      { texto: 'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?' },
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
    secaoPerfil,
    secaoInovacao: [
      {
        texto: 'Há TMS (Transport Management System) integrado a roteirização e telemetria?',
      },
      {
        texto: 'A empresa utiliza BI para custo por km, ociosidade da frota e margem por rota?',
      },
      { texto: 'Há automação de roteirização, rastreamento e gestão de avarias?' },
      {
        texto:
          'A empresa utiliza IoT/telemetria na frota (combustível, manutenção, comportamento)?',
      },
      {
        texto: 'Há IA para previsão de demanda, otimização de frota e precificação de frete?',
      },
      { texto: 'Os sistemas (TMS, WMS, ERP) estão integrados e em nuvem?' },
      { texto: 'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?' },
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
        texto: 'Quantas reuniões entre pedagógico, comercial e financeiro ocorrem por mês?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
      { pilar: 3, texto: 'O comercial sabe a margem de contribuição por curso, turno e unidade?' },
    ],
    secaoPerfil,
    secaoInovacao: [
      {
        texto:
          'Há sistema integrado (ERP acadêmico) conectando matrícula, pedagógico e financeiro?',
      },
      {
        texto: 'A empresa utiliza BI para evasão, inadimplência, ocupação e margem por curso?',
      },
      {
        texto: 'Há automação de matrícula, cobrança e comunicação com alunos/pais?',
      },
      {
        texto: 'A empresa utiliza IA para ensino personalizado e previsão de evasão?',
      },
      { texto: 'Há plataformas de EAD/Edtech integradas ao modelo pedagógico?' },
      { texto: 'Os sistemas estão em nuvem e integrados entre unidades?' },
      { texto: 'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?' },
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
        texto: 'Quantas reuniões entre comercial, operação e financeiro ocorrem por mês?',
      },
      { pilar: 3, texto: 'Existe um comitê de gestão periódico com indicadores padronizados?' },
      { pilar: 3, texto: 'O comercial sabe a margem de contribuição por plano e unidade?' },
    ],
    secaoPerfil,
    secaoInovacao: [
      {
        texto: 'Há sistema de gestão integrando matrícula, cobrança, acesso e retenção?',
      },
      {
        texto: 'A empresa utiliza BI para churn, ocupação por horário, CAC e margem por plano?',
      },
      {
        texto: 'Há automação de cobrança recorrente, lembretes e reativação de alunos?',
      },
      { texto: 'A empresa utiliza app próprio para treinos, agendamento e engajamento?' },
      {
        texto: 'Há IA para prescrição de treinos personalizados e previsão de evasão?',
      },
      { texto: 'Os sistemas (acesso, billing, CRM) estão integrados e em nuvem?' },
      { texto: 'Qual o impacto da tecnologia atual no seu fosso competitivo (Moat)?' },
    ],
  },
]

export function getSetorById(id: string): Setor | undefined {
  return setores.find((s) => s.id === id)
}

export function getPerguntasPorPilar(setor: Setor, pilar: 1 | 2 | 3): PerguntaSetor[] {
  return setor.perguntas.filter((p) => p.pilar === pilar)
}

// ============================================================
// Steps dinâmicos do questionário (ordem de exibição)
// ============================================================

export type TipoStep =
  | 'perfil'
  | 'pilar'
  | 'hackman'
  | 'buffett'
  | 'runway'
  | 'expectativas'
  | 'inovacao'
  | 'proximos-passos'

export interface StepDescriptor {
  key: string
  titulo: string
  descricao?: string
  tipo: TipoStep
  pilar?: 1 | 2 | 3
  perguntas: PerguntaSecao[]
}

export const tituloSecao: Record<TipoStep, string> = {
  perfil: 'Seção 1 — Perfil da Empresa e Contexto',
  pilar: '', // preenchido dinamicamente
  hackman: 'Seção 5 — Hackman',
  buffett: 'Seção 6 — Buffett',
  runway: 'Seção 6.6 — Runway 12 meses',
  expectativas: 'Seção 7 — Expectativas e Ambição',
  inovacao: 'Seção 8 — Inovação e Tecnologia',
  'proximos-passos': 'Seção 9 — Próximos Passos',
}

export function getStepsDoSetor(setor: Setor): StepDescriptor[] {
  const steps: StepDescriptor[] = [
    {
      key: 'perfil',
      titulo: tituloSecao.perfil,
      tipo: 'perfil',
      perguntas: setor.secaoPerfil,
    },
  ]

  ;([1, 2, 3] as const).forEach((p) => {
    steps.push({
      key: `pilar-${p}`,
      titulo: `Pilar ${p} — ${nomePilares[p]}`,
      tipo: 'pilar',
      pilar: p,
      perguntas: getPerguntasPorPilar(setor, p).map((q) => ({ texto: q.texto })),
    })
  })

  steps.push({
    key: 'hackman',
    titulo: tituloSecao.hackman,
    descricao: 'Lente de Hackman — 5 condições da eficácia de equipes.',
    tipo: 'hackman',
    perguntas: secaoHackman,
  })

  steps.push({
    key: 'buffett',
    titulo: tituloSecao.buffett,
    descricao: 'Lente de Buffett — saúde financeira e Moat.',
    tipo: 'buffett',
    perguntas: secaoBuffett,
  })

  if (setor.secaoRunway) {
    steps.push({
      key: 'runway',
      titulo: tituloSecao.runway,
      descricao: 'Exclusivo para Tecnologia/Startups.',
      tipo: 'runway',
      perguntas: setor.secaoRunway,
    })
  }

  steps.push({
    key: 'expectativas',
    titulo: tituloSecao.expectativas,
    tipo: 'expectativas',
    perguntas: secaoExpectativas,
  })

  steps.push({
    key: 'inovacao',
    titulo: tituloSecao.inovacao,
    descricao: `Fase 8 — Inovação e Tecnologia aplicada a ${setor.nome}.`,
    tipo: 'inovacao',
    perguntas: setor.secaoInovacao,
  })

  steps.push({
    key: 'proximos-passos',
    titulo: tituloSecao['proximos-passos'],
    descricao: 'Escada de Valor — MaaS / Híbrido / CaaS.',
    tipo: 'proximos-passos',
    perguntas: secaoProximosPassos,
  })

  return steps
}
