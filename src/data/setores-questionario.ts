// Base de Conhecimento V7.2 — Questionários Consolidados (12 setores)
// Fonte de Verdade: "Questionários Consolidados 12 Setores V7.2" (30 de setembro de 2026, 45 págs.)
//
// Transcrição integral, caractere a caractere, dos 12 questionários setoriais.
// Regra Capital: nenhuma pergunta inventada, nenhuma forma de resposta alterada,
// nenhuma palavra "(OPCIONAL)" ou menção a "obrigatório/opcional" sobre documentos.

export interface PerguntaSetor {
  pilar: 1 | 2 | 3
  numero: string // Ex: "2.1", "3.4"
  texto: string
  tipoResposta: 'dissertativo' | 'sim_nao_parcialmente' | 'sim_nao'
  opcoes?: string[]
}

export type TipoFormaResposta =
  | 'dissertativo' // Linha com underline "_________________________" -> input de texto
  | 'radio' // Alternativas com radio: Sim/Não, Alto/Médio/Baixo, Simples/Lucro Presumido/Lucro Real, etc.
  | 'maturidade' // 1 / 2 / 3 (com rótulos para Saúde e Trading, ou puramente 1/2/3 nos demais)
  | 'checkbox' // Múltipla seleção (ex: Documentação Adicional)
  | 'informativo' // 9.1 Frase fixa informativa sem resposta
  | 'trading_condicional_1_9' // Trading 1.9 Sim/Não + política condicional
  | 'trading_condicional_1_13' // Trading 1.13 Sim/Não + subpergunta condicional

export interface PerguntaItemLiteral {
  numero: string // Ex: "1.1", "2.1", "9.2"
  enunciado: string // Texto literal do PDF
  tipoForma: TipoFormaResposta
  opcoes?: string[] // Para radio, maturidade ou checkbox
  subpergunta?: {
    condicao: string // Valor que ativa a subpergunta (ex: "Sim" ou "Não")
    enunciado: string
    tipoForma: TipoFormaResposta
    opcoes?: string[]
  }
}

export interface SecaoQuestionarioLiteral {
  id: string
  numero: number // 1 a 9
  titulo: string // Ex: "SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO"
  perguntas: PerguntaItemLiteral[]
}

export interface IdentificacaoLiteral {
  razaoSocialLabel: string
  cnpjLabel: string
  dataLabel: string
  segmentoLabel: string
  segmentos: string[] // Opções literais do PDF
  incluiOutro: boolean
  modalidadeTrading?: string[] // Exclusivo de Trading
  respondenteLabel: string
  cargoLabel: string
}

export interface QuestionarioSetorLiteral {
  id: string
  numeroSetor: number // 1 a 12
  tituloSetor: string // Ex: "QUESTIONÁRIO 1 — SETOR SAÚDE"
  nome: string // Ex: "Saúde"
  slug: string
  notaImportante?: string // Presente no Trading: "Nota Importante: O setor Comércio Internacional – Trading Company não segue o template numérico padrão dos demais setores."
  identificacao: IdentificacaoLiteral
  secoes: SecaoQuestionarioLiteral[]
  documentacaoAdicional: string[] // Lista literal de checkboxes (SEM a palavra "(OPCIONAL)")
  microEpifanias: string[]
  // Propriedades retrocompatíveis para dashboards e landing pages:
  segmentos: string[]
  perguntas: PerguntaSetor[]
  secaoPerfil: PerguntaItemLiteral[]
  secaoBuffett?: PerguntaItemLiteral[]
  secaoInovacao: PerguntaItemLiteral[]
  secaoProximosPassos?: PerguntaItemLiteral[]
  secaoIdentificacao?: any[]
}

// ============================================================
// Opções Literais Compartilhadas (Fieis ao PDF)
// ============================================================

export const simNaoParcialmenteOpcoes = ['Sim', 'Não', 'Parcialmente'] as const
export const simNaoOpcoes = ['Sim', 'Não'] as const
export const altoMedioBaixoOpcoes = ['Alto', 'Médio', 'Baixo'] as const
export const maturidadeDigitalRotuladaOpcoes = [
  '1 — Básico',
  '2 — Intermediário',
  '3 — Avançado',
] as const
export const maturidadeDigitalNumericaOpcoes = ['1', '2', '3'] as const
export const formatoInteresseOpcoes = ['MaaS', 'Híbrido', 'CaaS', 'Ainda não sei'] as const

export const estruturaPropriedadePadrao = ['Familiar', 'Sócios', 'Investidores', 'Outro'] as const
export const regimeTributarioPadrao = ['Simples', 'Lucro Presumido', 'Lucro Real'] as const

export const documentacaoAdicionalPadrao = [
  'Balanço Patrimonial',
  'DRE',
  'Organograma',
  'Relatórios de Vendas',
]

export const documentacaoAdicionalTrading = [
  'Balanço Patrimonial',
  'DRE',
  'Organograma',
  'Relatórios de Vendas',
  'Contratos de Câmbio',
  'Planilha de Landed Cost',
]

// Retrocompatibilidade para telas legadas
export const secaoHackman: PerguntaItemLiteral[] = buildSecao5Hackman().perguntas
export const secaoBuffett: PerguntaItemLiteral[] = buildSecao6BuffettPadrao().perguntas
export const secaoExpectativas: PerguntaItemLiteral[] = buildSecao7Expectativas().perguntas
export const secaoProximosPassos: PerguntaItemLiteral[] = buildSecao9ProximosPassos().perguntas
export type PerguntaSecao = PerguntaItemLiteral
export const escalaOpcoes = [
  'Sim, totalmente.',
  'Parcialmente, com ressalvas.',
  'Raramente / com dificuldade.',
  'Não / não sei informar.',
] as const

// ============================================================
// Seções 5 e 7 Literais (Comuns a praticamente todos os setores)
// ============================================================

function buildSecao5Hackman(): SecaoQuestionarioLiteral {
  return {
    id: 'secao-5',
    numero: 5,
    titulo: 'SEÇÃO 5 — CAPACIDADE E DESIGN ORGANIZACIONAL (HACKMAN)',
    perguntas: [
      {
        numero: '5.1',
        enunciado: 'Existe um time real, com limites claros e interdependência definida?',
        tipoForma: 'radio',
        opcoes: [...simNaoParcialmenteOpcoes],
      },
      {
        numero: '5.2',
        enunciado: 'A direção da empresa está clara e convincente para todos?',
        tipoForma: 'radio',
        opcoes: [...simNaoParcialmenteOpcoes],
      },
      {
        numero: '5.3',
        enunciado: 'As tarefas e normas facilitam a execução do trabalho?',
        tipoForma: 'radio',
        opcoes: [...simNaoParcialmenteOpcoes],
      },
      {
        numero: '5.4',
        enunciado: 'A equipe dispõe de recursos e recompensas adequados?',
        tipoForma: 'radio',
        opcoes: [...simNaoParcialmenteOpcoes],
      },
      {
        numero: '5.5',
        enunciado: 'Existe coaching ou feedback contínuo para as lideranças?',
        tipoForma: 'radio',
        opcoes: [...simNaoParcialmenteOpcoes],
      },
      {
        numero: '5.6',
        enunciado: 'Quantos dos seus líderes são considerados de alta performance?',
        tipoForma: 'dissertativo',
      },
    ],
  }
}

function buildSecao6BuffettPadrao(): SecaoQuestionarioLiteral {
  return {
    id: 'secao-6',
    numero: 6,
    titulo: 'SEÇÃO 6 — SAÚDE ECONÔMICO-FINANCEIRA (BUFFETT)',
    perguntas: [
      {
        numero: '6.1',
        enunciado: 'Qual a margem EBITDA atual aproximada?',
        tipoForma: 'dissertativo',
      },
      {
        numero: '6.2',
        enunciado: 'Qual o nível de endividamento atual (Dívida Líquida / EBITDA)?',
        tipoForma: 'dissertativo',
      },
      {
        numero: '6.3',
        enunciado: 'Qual o prazo médio de recebimento da carteira?',
        tipoForma: 'dissertativo',
      },
      {
        numero: '6.4',
        enunciado: 'Qual o índice de inadimplência da carteira de clientes?',
        tipoForma: 'dissertativo',
      },
      {
        numero: '6.5',
        enunciado: 'A empresa fecha DRE gerencial mensal até o 10º dia útil?',
        tipoForma: 'radio',
        opcoes: [...simNaoParcialmenteOpcoes],
      },
      {
        numero: '6.6',
        enunciado: 'Possui reserva de capital de giro para 3 meses de operação?',
        tipoForma: 'radio',
        opcoes: [...simNaoParcialmenteOpcoes],
      },
    ],
  }
}

function buildSecao7Expectativas(): SecaoQuestionarioLiteral {
  return {
    id: 'secao-7',
    numero: 7,
    titulo: 'SEÇÃO 7 — EXPECTATIVAS E AMBIÇÃO',
    perguntas: [
      {
        numero: '7.1',
        enunciado: 'O que o levou a buscar este diagnóstico?',
        tipoForma: 'dissertativo',
      },
      {
        numero: '7.2',
        enunciado: 'Qual o principal problema a resolver nos próximos 12 meses?',
        tipoForma: 'dissertativo',
      },
      {
        numero: '7.3',
        enunciado: 'Qual o horizonte de transformação desejado para a empresa?',
        tipoForma: 'dissertativo',
      },
      {
        numero: '7.4',
        enunciado: 'Nível de disposição para mudanças:',
        tipoForma: 'radio',
        opcoes: [...altoMedioBaixoOpcoes],
      },
      {
        numero: '7.5',
        enunciado: 'Já contratou consultoria ou mentoria anteriormente? Qual o resultado?',
        tipoForma: 'dissertativo',
      },
    ],
  }
}

function buildSecao9ProximosPassos(): SecaoQuestionarioLiteral {
  return {
    id: 'secao-9',
    numero: 9,
    titulo: 'SEÇÃO 9 — PRÓXIMOS PASSOS',
    perguntas: [
      {
        numero: '9.1',
        enunciado: 'Você receberá um Diagnóstico Executivo com recomendações prioritárias.',
        tipoForma: 'informativo',
      },
      {
        numero: '9.2',
        enunciado: 'Autoriza sessão de devolutiva de 45 min?',
        tipoForma: 'radio',
        opcoes: [...simNaoOpcoes],
      },
      {
        numero: '9.3',
        enunciado: 'Formato de interesse:',
        tipoForma: 'radio',
        opcoes: [...formatoInteresseOpcoes],
      },
      {
        numero: '9.4',
        enunciado: 'Responsável pelos documentos:',
        tipoForma: 'dissertativo',
      },
    ],
  }
}

// ============================================================
// CONSTRUÇÃO LITERAL DOS 12 QUESTIONÁRIOS DO PDF
// ============================================================

// ------------------------------------------------------------
// 1. SETOR SAÚDE (Páginas 1 a 4)
// ------------------------------------------------------------
const questionario1Saude: QuestionarioSetorLiteral = {
  id: 'saude',
  numeroSetor: 1,
  tituloSetor: 'QUESTIONÁRIO 1 — SETOR SAÚDE',
  nome: 'Saúde',
  slug: 'saude',
  segmentos: ['Hospitalar', 'Clínica', 'Odontológica', 'Laboratório', 'Home Care'],
  microEpifanias: [
    'Glosa hospitalar invisível',
    'Ociosidade de leitos e salas cirúrgicas',
    'Retrabalho crônico em faturamento/guias de convênio',
    'Descasamento entre prontuário médico e conta',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['Hospitalar', 'Clínica', 'Odontológica', 'Laboratório', 'Home Care'],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        {
          numero: '1.1',
          enunciado: 'Qual o faturamento anual aproximado da empresa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.2',
          enunciado: 'Quantas unidades/sedes a empresa possui?',
          tipoForma: 'dissertativo',
        },
        { numero: '1.3', enunciado: 'Quantos colaboradores ao todo?', tipoForma: 'dissertativo' },
        {
          numero: '1.4',
          enunciado: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Estrutura de propriedade:',
          tipoForma: 'radio',
          opcoes: [...estruturaPropriedadePadrao],
        },
        {
          numero: '1.6',
          enunciado: 'Regime tributário:',
          tipoForma: 'radio',
          opcoes: [...regimeTributarioPadrao],
        },
        {
          numero: '1.7',
          enunciado: 'Principais fontes de receita (Convênios, Particular, SUS, etc.)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.8',
          enunciado: 'Possui certificações (ONA, ISO, etc.)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado:
            'Quantas cirurgias ou procedimentos são cancelados por mês por falta de decisão da equipe?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado:
            'Qual o percentual de decisões de internação que dependem da sua validação pessoal?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado:
            'Sua equipe clínica tem autonomia para protocolos de urgência sem te consultar?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado:
            'Se você se ausentar por 30 dias, a operação assistencial mantém o padrão de qualidade?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado:
            'Quantas decisões de compra de insumos de alto custo passam por você pessoalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado: 'Existe um diretor técnico com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Qual o índice de glosa das contas hospitalares no último trimestre?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado:
            'Quanto tempo a equipe perde com retrabalho de faturamento ou guias de convênio?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado:
            'Quantas horas administrativas são gastas por profissionais de saúde semanalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado:
            'Quantos contratos com operadoras estão há mais de 12 meses sem revisão de tabela?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado:
            'Qual o valor total da inadimplência atual e quem são os 10 maiores devedores?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado: 'Qual a taxa de ocupação média de leitos ou salas de atendimento?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado:
            'Qual o volume de procedimentos realizados que não foram faturados por erro de registro?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado:
            'Qual o prazo médio entre uma decisão da diretoria e a implementação na ponta clínica?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado:
            'Sua equipe comercial/faturamento sabe o lucro real por procedimento ou convênio?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado:
            'Quantas reuniões de alinhamento entre corpo clínico e administrativo ocorrem por mês?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico com indicadores padronizados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'A equipe sabe exatamente o custo real de cada procedimento realizado?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    buildSecao6BuffettPadrao(),
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza sistema de gestão de saúde/ERP integrado? Qual?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.2',
          enunciado: 'Seus sistemas operam em nuvem ou servidor local?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.3',
          enunciado: 'Acompanha dashboards de ocupação, glosa e faturamento em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza prontuário eletrônico, IA ou telemedicina na operação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos são automatizados (faturamento, guias, cobrança)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalRotuladaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as maiores barreiras para inovar (Custo, Equipe, Integração)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 2. SETOR SERVIÇOS PROFISSIONAIS (Páginas 4 a 8)
// ------------------------------------------------------------
const questionario2Servicos: QuestionarioSetorLiteral = {
  id: 'servicos',
  numeroSetor: 2,
  tituloSetor: 'QUESTIONÁRIO 2 — SETOR SERVIÇOS PROFISSIONAIS',
  nome: 'Serviços Profissionais',
  slug: 'servicos-profissionais',
  segmentos: ['Consultoria', 'Advocacia', 'Contabilidade', 'Arquitetura', 'Agência', 'TI'],
  microEpifanias: [
    'Horas trabalhadas e não cobradas (leakage)',
    'Taxa de utilização real abaixo de 60%',
    'Contratos há mais de 12 meses sem revisão',
    'Custo de oportunidade do sócio como executor',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['Consultoria', 'Advocacia', 'Contabilidade', 'Arquitetura', 'Agência', 'TI'],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        {
          numero: '1.1',
          enunciado: 'Qual o faturamento anual aproximado da empresa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.2',
          enunciado: 'Quantas unidades/sedes a empresa possui?',
          tipoForma: 'dissertativo',
        },
        { numero: '1.3', enunciado: 'Quantos colaboradores ao todo?', tipoForma: 'dissertativo' },
        {
          numero: '1.4',
          enunciado: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Estrutura de propriedade:',
          tipoForma: 'radio',
          opcoes: [...estruturaPropriedadePadrao],
        },
        {
          numero: '1.6',
          enunciado: 'Regime tributário:',
          tipoForma: 'radio',
          opcoes: [...regimeTributarioPadrao],
        },
        {
          numero: '1.7',
          enunciado:
            'Principais fontes de receita (projetos, contratos recorrentes, honorários, etc.)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.8',
          enunciado: 'Possui certificações ou reconhecimentos de mercado?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado:
            'Qual % do faturamento depende de você estar pessoalmente na negociação ou entrega?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado: 'Quantos contratos estão parados aguardando sua assinatura ou aprovação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado: 'Sua equipe consegue fechar um negócio de valor médio sem te envolver?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado: 'Se você tirar 60 dias de férias, a receita da empresa cai quanto?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado:
            'Quantas entregas ou propostas dependem da sua revisão final pessoal por semana?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado: 'Existe um sócio/gerente com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Quantas horas são perdidas com retrabalho por falta de briefing padronizado?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado:
            'Qual o percentual de horas trabalhadas e não cobradas (vazamento de honorários)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado:
            'Quanto tempo a equipe gasta com tarefas administrativas que poderiam ser automatizadas?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado: 'Quantos contratos são renovados sem revisão de preço ou escopo?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado: 'Qual o valor da inadimplência e quem são os 10 maiores devedores?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado:
            'Qual a taxa de utilização real (horas faturáveis / horas disponíveis) da equipe?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado:
            'Quantas propostas enviadas no último trimestre não foram convertidas e por quê?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado: 'Qual o prazo médio entre decisão estratégica e implementação na ponta?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'Sua equipe comercial sabe o lucro líquido por cliente que ela vende?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado:
            'Quantas horas de reunião a equipe gasta discutindo o que já deveria ter sido feito?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'A equipe sabe qual a meta de receita por consultor e como ela é calculada?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'Existe um comitê de gestão periódico com indicadores padronizados?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    buildSecao6BuffettPadrao(),
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza ERP/CRM integrado (propostas, contratos, financeiro)? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Seus sistemas operam em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado: 'Acompanha dashboards de utilização, receita e pipeline em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza IA para apoio a propostas, contratos ou pesquisa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos administrativos já são automatizados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalNumericaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as maiores barreiras para digitalizar a operação?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 3. SETOR INDÚSTRIA (Páginas 8 a 11)
// ------------------------------------------------------------
const questionario3Industria: QuestionarioSetorLiteral = {
  id: 'industria',
  numeroSetor: 3,
  tituloSetor: 'QUESTIONÁRIO 3 — SETOR INDÚSTRIA',
  nome: 'Indústria',
  slug: 'industria',
  segmentos: ['Manufatura', 'Metalurgia', 'Alimentos', 'Químico', 'Têxtil', 'Plástico'],
  microEpifanias: [
    'Índice real de refugo na linha de produção',
    'Paradas não programadas e custo/hora de ociosidade',
    'Giro de insumos e matérias-primas críticas',
    'Equipe comercial vendendo itens com margem negativa',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['Manufatura', 'Metalurgia', 'Alimentos', 'Químico', 'Têxtil', 'Plástico'],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        {
          numero: '1.1',
          enunciado: 'Qual o faturamento anual aproximado da empresa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.2',
          enunciado: 'Quantas unidades/sedes (plantas) a empresa possui?',
          tipoForma: 'dissertativo',
        },
        { numero: '1.3', enunciado: 'Quantos colaboradores ao todo?', tipoForma: 'dissertativo' },
        {
          numero: '1.4',
          enunciado: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Estrutura de propriedade:',
          tipoForma: 'radio',
          opcoes: [...estruturaPropriedadePadrao],
        },
        {
          numero: '1.6',
          enunciado: 'Regime tributário:',
          tipoForma: 'radio',
          opcoes: [...regimeTributarioPadrao],
        },
        {
          numero: '1.7',
          enunciado: 'Principais fontes de receita (B2B, B2C, distribuição, exportação, etc.)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.8',
          enunciado: 'Possui certificações (ISO, etc.)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado: 'Quantos dias por mês você passa apagando incêndio no chão de fábrica?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado:
            'Qual o percentual das decisões de compra de matéria-prima que passam por você?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado:
            'Sua equipe de produção tem autonomia para parar uma linha com problema sem te consultar?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado:
            'Quantos fornecedores foram escolhidos pessoalmente por você sem critério formal?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado:
            'Quantas decisões de investimento em máquinas dependem exclusivamente de você?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado:
            'Existe um gerente industrial com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Qual o percentual de refugo na linha de produção e o valor em reais?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado: 'Quantas horas de parada não programada ocorreram e qual o custo/hora?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado: 'Qual o giro de estoque dos seus 10 principais insumos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado: 'Quantos pedidos foram perdidos por atraso na entrega no último trimestre?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado:
            'Sua equipe comercial sabe a margem de contribuição de cada produto que vende?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado: 'Qual o índice de ociosidade das suas máquinas mais caras?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado: 'Qual o percentual de retrabalho ou devolução por defeito de fabricação?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado: 'Qual o prazo médio entre decisão estratégica e implementação na fábrica?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'Sua equipe de produção conhece a margem de contribuição do que fabrica?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado: 'Quantas reuniões de alinhamento entre comercial e produção ocorrem por mês?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico com indicadores padronizados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'Sua equipe de PCP sabe exatamente o custo real de cada ordem de produção?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    buildSecao6BuffettPadrao(),
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza ERP integrado (produção, estoque, financeiro, fiscal)? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Seus sistemas operam em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado: 'Acompanha dashboards de OEE, refugo e margem em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza automação, IoT, robótica ou IA na linha de produção?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos já são automatizados (PCP, faturamento, NF-e)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalNumericaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as maiores barreiras para inovar na indústria?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 4. SETOR VAREJO (Páginas 11 a 15)
// ------------------------------------------------------------
const questionario4Varejo: QuestionarioSetorLiteral = {
  id: 'varejo',
  numeroSetor: 4,
  tituloSetor: 'QUESTIONÁRIO 4 — SETOR VAREJO',
  nome: 'Varejo',
  slug: 'varejo',
  segmentos: ['Lojas Físicas', 'E-commerce', 'Distribuição', 'Alimentação', 'Moda'],
  microEpifanias: [
    'Ruptura de estoque nos top produtos',
    'Vendas perdidas no balcão por falta de produto',
    'Quebras, furtos e perdas não auditadas',
    'Margem negativa por categoria de produto',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['Lojas Físicas', 'E-commerce', 'Distribuição', 'Alimentação', 'Moda'],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        {
          numero: '1.1',
          enunciado: 'Qual o faturamento anual aproximado da empresa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.2',
          enunciado: 'Quantas unidades/lojas a empresa possui?',
          tipoForma: 'dissertativo',
        },
        { numero: '1.3', enunciado: 'Quantos colaboradores ao todo?', tipoForma: 'dissertativo' },
        {
          numero: '1.4',
          enunciado: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Estrutura de propriedade:',
          tipoForma: 'radio',
          opcoes: [...estruturaPropriedadePadrao],
        },
        {
          numero: '1.6',
          enunciado: 'Regime tributário:',
          tipoForma: 'radio',
          opcoes: [...regimeTributarioPadrao],
        },
        {
          numero: '1.7',
          enunciado: 'Principais fontes de receita (loja física, e-commerce, marketplaces, etc.)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.8',
          enunciado: 'Possui certificações ou reconhecimentos de mercado?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado: 'Sua loja consegue operar 30 dias sem sua presença física?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado: 'Quantas decisões de precificação e desconto a equipe toma sem te consultar?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado:
            'Quanto tempo leva para contratar um vendedor se você não aprovar pessoalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado:
            'Qual o valor de mercadoria parada por que você não decidiu o que fazer com ela?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado: 'Quantas decisões de compra de novos produtos passam por você mensalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado: 'Existe um gerente de loja com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Qual o índice de ruptura de estoque dos seus 10 produtos mais vendidos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado: 'Quantas vendas foram perdidas por falta de produto na prateleira?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado: 'Qual o percentual de devoluções e qual o motivo principal?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado:
            'Quanto gasta por mês com frete expresso por falha no planejamento de compras?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado: 'Sua equipe sabe o ticket médio por vendedor e como melhorá-lo?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado: 'Qual o índice de quebra/perda (furtos, vencimentos, danos) em reais?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado: 'Qual o giro de estoque geral e por categoria de produto?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado: 'Qual o prazo médio entre decisão estratégica e implementação na loja?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'Sua equipe de loja sabe a meta de margem por categoria de produto?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado:
            'Quantas decisões da última reunião comercial foram efetivamente implementadas?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico entre lojas, compras e financeiro?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'A equipe sabe o lucro líquido por cliente, canal e produto vendido?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    buildSecao6BuffettPadrao(),
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza ERP/PDV integrado (estoque, vendas, financeiro)? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Seus sistemas operam em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado: 'Acompanha dashboards de vendas, ruptura e ticket médio em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza e-commerce, marketplaces ou IA para precificação dinâmica?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos são automatizados (reposição, faturamento, logística)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalNumericaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as maiores barreiras para inovar no varejo?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 5. SETOR AGRONEGÓCIO (Páginas 15 a 18)
// ------------------------------------------------------------
const questionario5Agronegocio: QuestionarioSetorLiteral = {
  id: 'agronegocio',
  numeroSetor: 5,
  tituloSetor: 'QUESTIONÁRIO 5 — SETOR AGRONEGÓCIO',
  nome: 'Agronegócio',
  slug: 'agronegocio',
  segmentos: ['Grãos', 'Pecuária', 'Cana', 'Café', 'Fruticultura'],
  microEpifanias: [
    'Perda de colheita por ineficiência de maquinário',
    'Insumos aplicados sem critério de taxa variável',
    'Janelas críticas perdidas por falha de logística de escoamento',
    'Decisões de comercialização de safra centralizadas no patriarca',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['Grãos', 'Pecuária', 'Cana', 'Café', 'Fruticultura'],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        {
          numero: '1.1',
          enunciado: 'Qual o faturamento anual aproximado da empresa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.2',
          enunciado: 'Quantas unidades/fazendas a empresa possui?',
          tipoForma: 'dissertativo',
        },
        { numero: '1.3', enunciado: 'Quantos colaboradores ao todo?', tipoForma: 'dissertativo' },
        {
          numero: '1.4',
          enunciado: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Estrutura de propriedade:',
          tipoForma: 'radio',
          opcoes: [...estruturaPropriedadePadrao],
        },
        {
          numero: '1.6',
          enunciado: 'Regime tributário:',
          tipoForma: 'radio',
          opcoes: [...regimeTributarioPadrao],
        },
        {
          numero: '1.7',
          enunciado: 'Principais fontes de receita (commodities, pecuária, trading, etc.)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.8',
          enunciado: 'Possui certificações (sustentabilidade, orgânico, etc.)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado:
            'Quantas decisões de plantio, colheita ou venda dependem exclusivamente de você?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado:
            'Seu gerente de fazenda tem autonomia para contratar safristas sem sua aprovação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado: 'Quanto tempo você gasta resolvendo problemas operacionais de baixo valor?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado: 'Quantas negociações de venda da safra passam por você pessoalmente por ano?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado: 'Em janelas críticas, quantas decisões ficam travadas aguardando sua palavra?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado:
            'Existe um gerente de fazenda com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Qual o % de perda na colheita por ineficiência e o valor em reais?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado: 'Quanto gasta por safra com insumos aplicados sem critério de taxa variável?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado: 'Qual o custo real por hectare das suas operações mecanizadas?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado: 'Quantos dias de janela foram perdidos por falha no planejamento logístico?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado: 'Qual o índice de ociosidade da sua frota de tratores e colheitadeiras?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado: 'Qual o % de quebra técnica (mortalidade ou pragas) na produção?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado: 'Qual o seu custo por hectare/cabeça comparado à referência regional?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado: 'Qual o prazo médio entre decisão estratégica e implementação no campo?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'Sua equipe de campo sabe a meta de produtividade por talhão?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado: 'Quantas decisões do planejamento safra foram efetivamente executadas?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico entre produção, comercial e financeiro?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'A equipe comercial sabe o custo de produção e a margem por produto?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    buildSecao6BuffettPadrao(),
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza sistema de gestão agrícola/ERP integrado? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Seus sistemas operam em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado: 'Acompanha dashboards de produtividade, custo/ha e clima em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza agricultura de precisão, IoT, drones ou satélite?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos são automatizados (insumos, rastreabilidade, trading)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalNumericaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as barreiras (incluindo conectividade no campo)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 6. SETOR TECNOLOGIA/STARTUPS (Páginas 18 a 22)
// ------------------------------------------------------------
const questionario6Tecnologia: QuestionarioSetorLiteral = {
  id: 'tecnologia',
  numeroSetor: 6,
  tituloSetor: 'QUESTIONÁRIO 6 — SETOR TECNOLOGIA/STARTUPS',
  nome: 'Tecnologia/Startups',
  slug: 'tecnologia-startups',
  segmentos: ['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'Marketplace'],
  microEpifanias: [
    'Churn invisível corroendo o crescimento do MRR',
    'Payback estendido e CAC mascarado por canal',
    'Débito técnico consumindo mais de 30% da engenharia',
    'Concentração perigosa de receita nos 10 maiores clientes',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'Marketplace'],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        {
          numero: '1.1',
          enunciado: 'Qual a receita anual recorrente (ARR/MRR) aproximada?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.2',
          enunciado: 'Estágio:',
          tipoForma: 'radio',
          opcoes: ['Pré-seed', 'Seed', 'Série A', 'Série B+', 'Scale-up'],
        },
        {
          numero: '1.3',
          enunciado: 'Colaboradores por área (Engenharia, Comercial, Ops)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.4',
          enunciado: 'Crescimento de receita nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Propriedade:',
          tipoForma: 'radio',
          opcoes: ['Founder-led', 'Cofundadores', 'Investidores', 'Grupo'],
        },
        { numero: '1.6', enunciado: 'Regime tributário atual?', tipoForma: 'dissertativo' },
        {
          numero: '1.7',
          enunciado: 'Fontes de receita (MRR, Contratos, Marketplace, Serviços)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.8',
          enunciado: 'Possui métricas definidas (CAC, LTV, Churn, Payback)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado: 'Qual % das decisões de produto e roadmap dependem exclusivamente de você?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado: 'Quantas vendas enterprise dependem da sua presença pessoal na negociação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado: 'Sua equipe de engenharia consegue fazer deploy sem sua aprovação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado: 'Se você ficar 30 dias sem acesso, o que para de funcionar na empresa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado: 'Quantas decisões de contratação e precificação passam por você mensalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado: 'Existe um COO/CTO com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Qual o churn mensal e quanto isso representa em receita perdida por ano?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado: 'Qual o CAC/payback e o LTV por canal de aquisição?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado: 'Quantas horas de engenharia são perdidas com débito técnico ou retrabalho?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado: 'Qual o tempo de resposta do suporte e quantos clientes estão em risco?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado: 'Qual o % da receita concentrado nos 10 maiores clientes?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado: 'Quantos leads foram perdidos por atraso na resposta ou onboarding?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado: 'Qual o índice de ativação e adoção efetiva da plataforma?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado: 'Qual o prazo médio entre decisão estratégica e implementação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'Sua equipe comercial sabe o LTV/CAC e margem por cliente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado: 'Quantas reuniões entre produto, engenharia e comercial ocorrem por mês?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico com indicadores padronizados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'A equipe de CS sabe o NRR e a meta de expansão por cliente?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    {
      id: 'secao-6',
      numero: 6,
      titulo: 'SEÇÃO 6 — SAÚDE ECONÔMICO-FINANCEIRA (BUFFETT)',
      perguntas: [
        {
          numero: '6.1',
          enunciado: 'Qual a margem EBITDA atual aproximada?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.2',
          enunciado: 'Qual o nível de endividamento atual (Dívida Líquida / EBITDA)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.3',
          enunciado: 'Qual o prazo médio de recebimento da carteira?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.4',
          enunciado: 'Qual o índice de inadimplência da carteira de clientes?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.5',
          enunciado: 'A empresa fecha DRE gerencial mensal até o 10º dia útil?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
        {
          numero: '6.6',
          enunciado: 'A empresa possui reserva de capital (runway) para 12 meses de operação?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza ERP/CRM integrado (vendas, financeiro, suporte)? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Sistemas em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado: 'Dashboards de MRR, Churn, CAC e NPS em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza IA generativa, automação ou dados para produto e comercial?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos são automatizados (onboarding, cobrança, suporte)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalNumericaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as maiores barreiras para escalar (incluindo capital)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 7. SETOR CONSTRUÇÃO CIVIL (Páginas 22 a 25)
// ------------------------------------------------------------
const questionario7Construcao: QuestionarioSetorLiteral = {
  id: 'construcao',
  numeroSetor: 7,
  tituloSetor: 'QUESTIONÁRIO 7 — SETOR CONSTRUÇÃO CIVIL',
  nome: 'Construção Civil',
  slug: 'construcao-civil',
  segmentos: ['Edificações', 'Incorporação', 'Infraestrutura', 'Reformas'],
  microEpifanias: [
    'Desperdício crônico de materiais nos canteiros',
    'Dias perdidos por retrabalho e revisões de projeto',
    'Aditivos e serviços extras executados sem cobrança',
    'Divergência sistemática entre custo orçado e realizado',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['Edificações', 'Incorporação', 'Infraestrutura', 'Reformas'],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        {
          numero: '1.1',
          enunciado: 'Qual o faturamento anual aproximado da empresa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.2',
          enunciado: 'Quantas obras/unidades a empresa possui em andamento?',
          tipoForma: 'dissertativo',
        },
        { numero: '1.3', enunciado: 'Quantos colaboradores ao todo?', tipoForma: 'dissertativo' },
        {
          numero: '1.4',
          enunciado: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Estrutura de propriedade:',
          tipoForma: 'radio',
          opcoes: [...estruturaPropriedadePadrao],
        },
        {
          numero: '1.6',
          enunciado: 'Regime tributário:',
          tipoForma: 'radio',
          opcoes: [...regimeTributarioPadrao],
        },
        {
          numero: '1.7',
          enunciado: 'Principais fontes de receita (obras privadas, públicas, incorporação, etc.)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.8',
          enunciado: 'Possui certificações (ISO, PBQP-H, etc.)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado: 'Quantas decisões de obra (compras, cronograma) dependem de você por semana?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado:
            'Quantas horas por semana você resolve problemas que o engenheiro deveria resolver?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado: 'Sua equipe de obra libera pagamentos ou aditivos sem te consultar?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado:
            'Se você tirar 30 dias de férias, quantos cronogramas atrasam por falta de decisão?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado: 'Quantos orçamentos e negociações passam por você pessoalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado: 'Existe um diretor técnico com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Qual o % de perda de materiais nos canteiros e o valor em reais?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado:
            'Quantos dias de cronograma foram perdidos por retrabalho no último trimestre?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado: 'Qual o índice de horas ociosas da mão de obra (espera por material/decisão)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado: 'Qual o % de aditivos e serviços extras realizados e não cobrados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado: 'Sua equipe comercial sabe a margem de contribuição de cada obra?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado: 'Qual a diferença média entre o orçado e o realizado nas obras atuais?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado: 'Qual o giro de estoque de materiais e o capital imobilizado em almoxarifado?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado: 'Qual o prazo médio entre decisão estratégica e implementação no canteiro?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'A engenharia sabe o custo orçado vs. realizado por serviço de cada obra?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado: 'Quantas reuniões entre comercial, engenharia e financeiro ocorrem por mês?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico com indicadores padronizados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'Sua equipe de planejamento sabe o custo real de cada etapa da obra?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    buildSecao6BuffettPadrao(),
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza ERP ou software de gestão de obras? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Sistemas em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado: 'Dashboards de custo orçado vs. realizado e curva S em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza BIM, drones, IoT ou IA para planejamento e canteiro?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos são automatizados (medições, materiais, faturamento)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalNumericaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as maiores barreiras para inovar na construção?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 8. SETOR TRANSPORTE/LOGÍSTICA (Páginas 25 a 28)
// ------------------------------------------------------------
const questionario8Transporte: QuestionarioSetorLiteral = {
  id: 'transporte',
  numeroSetor: 8,
  tituloSetor: 'QUESTIONÁRIO 8 — SETOR TRANSPORTE/LOGÍSTICA',
  nome: 'Transporte/Logística',
  slug: 'transporte-logistica',
  segmentos: ['Cargas', 'Passageiros', 'Distribuição', 'Armazenagem'],
  microEpifanias: [
    'Quilômetros rodados vazios (frete de retorno zero)',
    'Ociosidade da frota de veículos disponíveis',
    'Custo real por km rodado acima da média regional',
    'Manutenções corretivas devorando o orçamento das preventivas',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['Cargas', 'Passageiros', 'Distribuição', 'Armazenagem'],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        {
          numero: '1.1',
          enunciado: 'Qual o faturamento anual aproximado da empresa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.2',
          enunciado: 'Quantas unidades/bases a empresa possui?',
          tipoForma: 'dissertativo',
        },
        { numero: '1.3', enunciado: 'Quantos colaboradores ao todo?', tipoForma: 'dissertativo' },
        {
          numero: '1.4',
          enunciado: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Estrutura de propriedade:',
          tipoForma: 'radio',
          opcoes: [...estruturaPropriedadePadrao],
        },
        {
          numero: '1.6',
          enunciado: 'Regime tributário:',
          tipoForma: 'radio',
          opcoes: [...regimeTributarioPadrao],
        },
        {
          numero: '1.7',
          enunciado: 'Principais fontes de receita (fretes, contratos, distribuição, etc.)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.8',
          enunciado: 'Possui certificações (ISO, ANTT, etc.)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado: 'Quantas decisões de rota, frete ou manutenção dependem de você por semana?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado: 'Quantas negociações com grandes embarcadores passam por você pessoalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado:
            'Sua equipe consegue redirecionar uma carga ou resolver avaria sem te consultar?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado:
            'Se você tirar 30 dias de férias, quantas operações param por falta de decisão?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado: 'Quantas decisões de contratação e compra de veículos passam por você?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado:
            'Existe um gerente de operações com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Qual o % de km rodados vazios e o custo mensal disso?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado: 'Qual o índice de ociosidade da frota (veículos parados vs. disponíveis)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado: 'Qual o custo real por km rodado (combustível, pneus, manutenção, etc)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado: 'Quantas entregas atrasaram e qual o custo de multas contratuais?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado: 'Qual o índice de avarias, roubos ou perdas de carga em reais/ano?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado: 'Qual o consumo médio de combustível vs. referência do fabricante?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado: 'Quantas manutenções corretivas ocorreram vs. preventivas planejadas?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado: 'Qual o prazo médio entre decisão estratégica e implementação na ponta?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'A equipe sabe o custo e margem por rota, cliente e tipo de carga?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado: 'Quantas reuniões entre comercial, operação e manutenção ocorrem por mês?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico com indicadores padronizados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'O comercial sabe o custo real de cada rota antes de precificar o frete?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    buildSecao6BuffettPadrao(),
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza TMS ou ERP integrado (frota, rotas, financeiro)? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Sistemas em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado: 'Dashboards de ociosidade, km vazios e entregas no prazo em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza telemetria, rastreamento ou IA para roteirização?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos são automatizados (CT-e, agendamento, monitoramento)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalNumericaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as maiores barreiras para inovar na logística?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 9. SETOR EDUCAÇÃO (Páginas 29 a 32)
// ------------------------------------------------------------
const questionario9Educacao: QuestionarioSetorLiteral = {
  id: 'educacao',
  numeroSetor: 9,
  tituloSetor: 'QUESTIONÁRIO 9 — SETOR EDUCAÇÃO',
  nome: 'Educação',
  slug: 'educacao',
  segmentos: ['Básica', 'Superior', 'Técnico', 'Idiomas', 'Edtech'],
  microEpifanias: [
    'Evasão de alunos silenciosa durante o semestre',
    'Vagas ociosas em turmas mantidas com custo fixo pleno',
    'Inadimplência de mensalidades sem régua de cobrança',
    'Rotatividade docente afetando a reputação pedagógica',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['Básica', 'Superior', 'Técnico', 'Idiomas', 'Edtech'],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        { numero: '1.1', enunciado: 'Faturamento anual aproximado?', tipoForma: 'dissertativo' },
        {
          numero: '1.2',
          enunciado: 'Unidades (campi, filiais, polos EAD)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.3',
          enunciado: 'Colaboradores (Docentes vs. Adm/Pedagógico)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.4',
          enunciado: 'Alunos matriculados e capacidade instalada?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Tempo de operação e crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        { numero: '1.6', enunciado: 'Estrutura de propriedade?', tipoForma: 'dissertativo' },
        { numero: '1.7', enunciado: 'Regime tributário atual?', tipoForma: 'dissertativo' },
        {
          numero: '1.8',
          enunciado: 'Fontes de receita (Mensalidades, Matrículas, Convênios)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.9',
          enunciado: 'Certificações (MEC, ISO, Internacionais)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado: 'Quantas decisões pedagógicas (currículo, professores) dependem de você?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado: 'Quantas matrículas e negociações de desconto passam por você mensalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado: 'Sua coordenação resolve problemas de alunos/pais sem te consultar?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado: 'Se você tirar 30 dias de férias, o que para de funcionar na instituição?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado: 'Quantas decisões de expansão e infraestrutura dependem só de você?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado:
            'Existe um diretor executivo com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Qual o índice de evasão escolar e a receita perdida com isso?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado: 'Qual o índice de inadimplência e o prazo médio de recebimento?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado: 'Qual o % de vagas ociosas por turma e por unidade?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado: 'Alunos captados vs. perdidos e o custo de aquisição (CAC)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado: 'Taxa de rotatividade de professores e custo de substituição?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado: 'A equipe sabe o custo por aluno e a margem por curso/turma?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado: 'Qual o reajuste real das mensalidades vs. inflação nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado:
            'Qual o prazo médio entre decisão estratégica e implementação na sala de aula?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'A equipe pedagógica sabe a meta de retenção por turma?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado: 'Quantas reuniões entre pedagógico, comercial e financeiro ocorrem por mês?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico com indicadores padronizados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'O comercial sabe a margem de contribuição por curso, turno e unidade?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    buildSecao6BuffettPadrao(),
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza ERP ou software de gestão escolar integrado? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Sistemas em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado: 'Dashboards de evasão, inadimplência e captação em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza EAD, plataformas digitais ou IA para ensino e comunicação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos são automatizados (matrícula, cobrança, comunicação)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalNumericaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as barreiras (incluindo resistência do corpo docente)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 10. SETOR ACADEMIAS DE GINÁSTICA (Páginas 32 a 35)
// ------------------------------------------------------------
const questionario10Academias: QuestionarioSetorLiteral = {
  id: 'academias',
  numeroSetor: 10,
  tituloSetor: 'QUESTIONÁRIO 10 — SETOR ACADEMIAS DE GINÁSTICA',
  nome: 'Academias de Ginástica',
  slug: 'academias-de-ginastica',
  segmentos: ['Musculação', 'Estúdio', 'CrossFit', 'Pilates', 'Natação'],
  microEpifanias: [
    'Evasão crônica nos primeiros 90 dias do aluno',
    'Horários de vale ociosos sustentando custos fixos',
    'Planos promocionais congelados ou sem margem',
    'Fundador atuando como coordenador de recepção e manutenção',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['Musculação', 'Estúdio', 'CrossFit', 'Pilates', 'Natação'],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        { numero: '1.1', enunciado: 'Faturamento anual aproximado?', tipoForma: 'dissertativo' },
        { numero: '1.2', enunciado: 'Unidades (academias/estúdios)?', tipoForma: 'dissertativo' },
        {
          numero: '1.3',
          enunciado: 'Colaboradores (Instrutores vs. Adm/Atendimento)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.4',
          enunciado: 'Alunos ativos e capacidade instalada?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Tempo de operação e crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        { numero: '1.6', enunciado: 'Estrutura de propriedade?', tipoForma: 'dissertativo' },
        { numero: '1.7', enunciado: 'Regime tributário atual?', tipoForma: 'dissertativo' },
        {
          numero: '1.8',
          enunciado: 'Fontes de receita (Mensalidades, Planos, Personal, Loja)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.9',
          enunciado: 'Certificações ou premiações setoriais?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado: 'Quantas matrículas e negociações de desconto dependem de você mensalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado: 'Sua recepção resolve problemas de alunos sem te consultar?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado: 'Quantos dias por semana você precisa estar presencialmente na unidade?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado: 'Se você tirar 30 dias de férias, o que para de funcionar na operação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado: 'Quantas decisões de contratação e compra de equipamentos passam por você?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado:
            'Existe um gerente de unidade com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Qual o índice de evasão (churn) e a receita perdida com isso?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado: 'Qual o índice de inadimplência e o prazo médio de recebimento?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado: 'Qual o % de capacidade ociosa por horário e por unidade?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado: 'Alunos captados vs. perdidos e o custo de aquisição (CAC)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado: 'Qual o índice de ocupação dos horários de pico vs. baixa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado: 'A equipe sabe a margem por plano, modalidade e aluno?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado: 'Qual o % de alunos em planos com desconto ou congelados sem margem?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado: 'Qual o prazo médio entre decisão estratégica e implementação na recepção?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'Os instrutores sabem a meta de retenção por turma?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado: 'Quantas reuniões entre comercial, operação e financeiro ocorrem por mês?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico com indicadores padronizados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'O comercial sabe a margem de contribuição por plano e unidade?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    buildSecao6BuffettPadrao(),
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza sistema de gestão de academia ou ERP integrado? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Sistemas em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado: 'Dashboards de evasão, inadimplência e vendas em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza app próprio, IA ou automação para retenção e treinos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos são automatizados (matrícula online, acesso, cobrança)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalNumericaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as maiores barreiras para inovar na academia?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 11. SETOR COMÉRCIO INTERNACIONAL (TRADING COMPANY) (Páginas 36 a 40)
// ------------------------------------------------------------
const questionario11Trading: QuestionarioSetorLiteral = {
  id: 'trading',
  numeroSetor: 11,
  tituloSetor: 'QUESTIONÁRIO 11 — SETOR COMÉRCIO INTERNACIONAL (TRADING COMPANY)',
  nome: 'Comércio Internacional – Trading',
  slug: 'comercio-internacional-trading',
  notaImportante:
    'Nota Importante: O setor Comércio Internacional – Trading Company não segue o template numérico padrão dos demais setores.',
  segmentos: ['Importação', 'Exportação', 'Trading', 'Despacho Aduaneiro', 'Câmbio'],
  microEpifanias: [
    'Descasamento de hedge cambial não protegido',
    'Custos ocultos no Landed Cost por SKU/contêiner',
    'Sobrestadia de contêineres (demurrage explosivo)',
    'Exposição ao fim de incentivos estaduais (Reforma Tributária CBS/IBS)',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: ['Importação', 'Exportação', 'Trading', 'Despacho Aduaneiro', 'Câmbio'],
    incluiOutro: true,
    modalidadeTrading: ['Importação por Conta e Ordem', 'Importação por Encomenda', 'Ambas'],
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalTrading],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        {
          numero: '1.1',
          enunciado: 'Qual o faturamento anual aproximado da empresa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.2',
          enunciado:
            'Quantas unidades/bases operacionais a empresa possui (portos, armazéns, escritórios)?',
          tipoForma: 'dissertativo',
        },
        { numero: '1.3', enunciado: 'Quantos colaboradores ao todo?', tipoForma: 'dissertativo' },
        {
          numero: '1.4',
          enunciado: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Estrutura de propriedade:',
          tipoForma: 'radio',
          opcoes: [...estruturaPropriedadePadrao],
        },
        {
          numero: '1.6',
          enunciado: 'Regime tributário:',
          tipoForma: 'radio',
          opcoes: [...regimeTributarioPadrao],
        },
        {
          numero: '1.7',
          enunciado:
            'Principais fontes de receita (management fees, margem de revenda, funding, regimes especiais)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.8',
          enunciado: 'Possui certificações (OEA, ISO, RADAR ativo)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.9',
          enunciado: 'A trading repassa parte dos ganhos de incentivo fiscal de ICMS ao cliente?',
          tipoForma: 'trading_condicional_1_9',
          opcoes: [...simNaoOpcoes],
          subpergunta: {
            condicao: 'Sim',
            enunciado:
              'Em caso afirmativo, descreva a política: critérios, percentuais e forma de repasse (ex.: redução do valor da NF de venda na Importação por Encomenda; diferença entre os incentivos e o valor a menor não cobrado do cliente na Importação por Conta e Ordem sem fee).',
            tipoForma: 'dissertativo',
          },
        },
        {
          numero: '1.10',
          enunciado:
            'Nas operações de Importação por Conta e Ordem, a NF de Simples Remessa é registrada como Receita Bruta (contábil ou gerencial)?',
          tipoForma: 'radio',
          opcoes: [...simNaoOpcoes],
        },
        {
          numero: '1.11',
          enunciado:
            'Nas operações de Importação por Conta e Ordem, apenas as NFs de Prestação de Serviços (fee) são registradas como Receita Bruta?',
          tipoForma: 'radio',
          opcoes: [...simNaoOpcoes],
        },
        {
          numero: '1.12',
          enunciado:
            'Nas operações de Importação por Encomenda, a NF de venda é registrada integralmente como Receita Bruta operacional?',
          tipoForma: 'radio',
          opcoes: [...simNaoOpcoes],
        },
        {
          numero: '1.13',
          enunciado:
            'O cliente da trading (adquirente) possui matriz e/ou filial no mesmo estado da trading onde o incentivo fiscal é aplicado (ex.: SC/ES)?',
          tipoForma: 'trading_condicional_1_13',
          opcoes: [...simNaoOpcoes],
          subpergunta: {
            condicao: 'Não',
            enunciado:
              'Em caso negativo, as operações são estruturadas como Importação por Encomenda?',
            tipoForma: 'radio',
            opcoes: [...simNaoOpcoes],
          },
        },
        {
          numero: '1.14',
          enunciado:
            'Qual o Valor Bruto das operações de Importação por Conta e Ordem (conhecido no momento da emissão da NF de Simples Remessa)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado:
            'Qual o percentual do seu faturamento que depende de você estar pessoalmente na negociação de importação/exportação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado:
            'Quantas operações de câmbio ou fechamento de contrato dependem da sua validação pessoal?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado:
            'Sua equipe consegue conduzir um despacho aduaneiro ou negociar com fornecedor estrangeiro sem te envolver?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado:
            'Se você se ausentar por 30 dias, quantas operações de importação/exportação param por falta de decisão?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado:
            'Quantas decisões de crédito, hedge cambial ou escolha de fornecedor passam por você pessoalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado:
            'Existe um gerente de operações com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado:
            'Qual o valor de créditos tributários (PIS/COFINS → CBS/IBS) que sua operação deixa de aproveitar?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado:
            'Qual o percentual da sua receita que ainda depende de benefício fiscal estadual de ICMS (que será extinto até 2033)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado:
            'Qual o valor de capital de giro retido no Fisco por erros de retenção do Split Payment?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado:
            'Sua operação consegue calcular, em tempo real, o regime dual (PIS/COFINS/ICMS legado + CBS/IBS) sem retrabalho?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado:
            'Qual o ciclo médio de caixa das suas operações (compra → desembaraço → venda → recebimento)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado:
            'Quantos dias sua carga fica parada em recintos alfandegados por retrabalho documental ou erro na DUIMP/Invoice/Packing List?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado:
            'Qual o percentual de exposição cambial não protegida (sem hedge) do seu portfólio?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.8',
          enunciado: 'Qual o valor de capital de giro imobilizado em mercadoria em trânsito?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado:
            'Qual o prazo médio entre a decisão estratégica e a execução na operação de comércio exterior?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'Sua equipe comercial sabe a margem real por operação (landed cost completo)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado: 'Quantas reuniões entre comercial, fiscal e logística ocorrem por mês?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico com indicadores padronizados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'A equipe sabe o custo real de cada operação antes de precificar?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    {
      id: 'secao-6',
      numero: 6,
      titulo: 'SEÇÃO 6 — SAÚDE ECONÔMICO-FINANCEIRA (BUFFETT)',
      perguntas: [
        {
          numero: '6.1',
          enunciado: 'Qual a margem EBITDA atual aproximada?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.2',
          enunciado: 'Qual o nível de endividamento atual (Dívida Líquida / EBITDA)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.3',
          enunciado: 'Qual o prazo médio de recebimento da carteira?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.4',
          enunciado: 'Qual o índice de inadimplência da carteira de clientes?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.5',
          enunciado: 'A empresa fecha DRE gerencial mensal até o 10º dia útil?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
        {
          numero: '6.6',
          enunciado: 'Possui reserva de capital de giro para 3 meses de operação?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
        {
          numero: '6.7',
          enunciado:
            'Qual o ciclo de caixa da sua operação (compra → desembaraço → venda → recebimento)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.8',
          enunciado:
            'Qual o percentual de exposição cambial não protegida (sem hedge) do seu portfólio?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.9',
          enunciado:
            'Qual o percentual da sua receita que depende de benefício fiscal estadual de ICMS (risco de descontinuidade até 2033)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '6.10',
          enunciado:
            'Qual a sua capacidade de funding (capital de giro disponível para financiar a nacionalização)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado:
            'Utiliza ERP com motor fiscal dinâmico (dual engine CBS/IBS + PIS/COFINS/ICMS legado)? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Seus sistemas operam em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado:
            'Possui conciliação bancária com APIs de bancos "splitters" (alerta de retenção a maior/menor)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado:
            'Utiliza Control Tower de visibilidade operacional (portos, armazéns, transportadoras, demurrage)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado: 'Quais processos são automatizados (Invoice, Packing List, NCM, DUIMP)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Utiliza IA para inteligência aduaneira e classificação fiscal?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.7',
          enunciado: 'Acompanha dashboards de landed cost e créditos tributários em tempo real?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.8',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalRotuladaOpcoes],
        },
        {
          numero: '8.9',
          enunciado: 'Quais as maiores barreiras para inovar (custo de ERP, equipe, integração)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ------------------------------------------------------------
// 12. SETOR FACILITIES (Páginas 40 a 43)
// ------------------------------------------------------------
const questionario12Facilities: QuestionarioSetorLiteral = {
  id: 'facilities',
  numeroSetor: 12,
  tituloSetor: 'QUESTIONÁRIO 12 — SETOR FACILITIES',
  nome: 'Facilities e Serviços Terceirizados',
  slug: 'facilities-servicos-terceirizados',
  segmentos: [
    'Facilities Management',
    'Limpeza e Conservação',
    'Segurança Patrimonial',
    'Manutenção Predial',
    'Portaria/Recepção',
    'Serviços Terceirizados',
  ],
  microEpifanias: [
    'Margem negativa oculta por horas extras e absenteísmo',
    'Passivo trabalhista invisível de escalas e intervalos',
    'Multas e glosas por quebra de SLA contratual',
    'Custo invisível do turnover na base operacional',
  ],
  identificacao: {
    razaoSocialLabel: 'Razão Social:',
    cnpjLabel: 'CNPJ:',
    dataLabel: 'Data:',
    segmentoLabel: 'Segmento:',
    segmentos: [
      'Facilities Management',
      'Limpeza e Conservação',
      'Segurança Patrimonial',
      'Manutenção Predial',
      'Portaria/Recepção',
      'Serviços Terceirizados',
    ],
    incluiOutro: true,
    respondenteLabel: 'Respondente:',
    cargoLabel: 'Cargo:',
  },
  documentacaoAdicional: [...documentacaoAdicionalPadrao],
  secoes: [
    {
      id: 'secao-1',
      numero: 1,
      titulo: 'SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO',
      perguntas: [
        {
          numero: '1.1',
          enunciado: 'Qual o faturamento anual aproximado da empresa?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.2',
          enunciado: 'Quantas unidades/contratos ativos a empresa possui?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.3',
          enunciado: 'Quantos colaboradores ao todo (incluindo mão de obra alocada)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.4',
          enunciado: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.5',
          enunciado: 'Estrutura de propriedade:',
          tipoForma: 'radio',
          opcoes: [...estruturaPropriedadePadrao],
        },
        {
          numero: '1.6',
          enunciado: 'Regime tributário:',
          tipoForma: 'radio',
          opcoes: [...regimeTributarioPadrao],
        },
        {
          numero: '1.7',
          enunciado:
            'Principais fontes de receita (contratos privados, licitações públicas, aditivos)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '1.8',
          enunciado: 'Possui certificações (ISO, PBQP-H, etc)',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-2',
      numero: 2,
      titulo: 'SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR',
      perguntas: [
        {
          numero: '2.1',
          enunciado:
            'Quantos contratos-chave dependem da sua validação pessoal para renovação ou renegociação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.2',
          enunciado: 'Quantas negociações com grandes contratantes passam por você pessoalmente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.3',
          enunciado:
            'Sua equipe consegue resolver um problema operacional de um cliente sem te consultar?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.4',
          enunciado:
            'Se você se ausentar por 30 dias, quantas operações param por falta de decisão?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.5',
          enunciado:
            'Quantas decisões de contratação de mão de obra ou compra de insumos passam por você??',
          tipoForma: 'dissertativo',
        },
        {
          numero: '2.6',
          enunciado:
            'Existe um gerente de operações com autonomia formal para decidir sem consultá-lo?',
          tipoForma: 'radio',
          opcoes: [...simNaoParcialmenteOpcoes],
        },
      ],
    },
    {
      id: 'secao-3',
      numero: 3,
      titulo: 'SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL',
      perguntas: [
        {
          numero: '3.1',
          enunciado: 'Quantos dos seus contratos são renovados sem revisão de preço ou escopo?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.2',
          enunciado: 'Qual o índice de horas ociosas da mão de obra alocada?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.3',
          enunciado: 'Qual o percentual de retrabalho e o custo disso?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.4',
          enunciado: 'Qual o índice de turnover da mão de obra e o custo de reposição?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.5',
          enunciado: 'Quantos aditivos ou serviços extras foram realizados e não cobrados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.6',
          enunciado: 'Qual a margem real por contrato (custo de mão de obra vs. preço cobrado)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '3.7',
          enunciado: 'Qual o valor de multas ou perdas por descumprimento de SLA contratual?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    {
      id: 'secao-4',
      numero: 4,
      titulo: 'SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO',
      perguntas: [
        {
          numero: '4.1',
          enunciado:
            'Qual o prazo médio entre a decisão estratégica e a implementação na operação?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.2',
          enunciado: 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.3',
          enunciado: 'Sua equipe sabe a margem real por contrato e por cliente?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.4',
          enunciado: 'Quantas reuniões entre comercial, operação e financeiro ocorrem por mês?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.5',
          enunciado: 'Existe um comitê de gestão periódico com indicadores padronizados?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '4.6',
          enunciado: 'A equipe sabe o custo real de cada contrato antes de renegociar?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao5Hackman(),
    buildSecao6BuffettPadrao(),
    buildSecao7Expectativas(),
    {
      id: 'secao-8',
      numero: 8,
      titulo: 'SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA',
      perguntas: [
        {
          numero: '8.1',
          enunciado: 'Utiliza ERP ou sistema de gestão de contratos e escalas? Qual?',
          tipoForma: 'dissertativo',
        },
        { numero: '8.2', enunciado: 'Seus sistemas operam em nuvem?', tipoForma: 'dissertativo' },
        {
          numero: '8.3',
          enunciado: 'Possui BI de margem por contrato e horas ociosas?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.4',
          enunciado: 'Utiliza automação de medições e faturamento?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.5',
          enunciado:
            'Quais processos são automatizados (escalas, medições, faturamento, cobrança)?',
          tipoForma: 'dissertativo',
        },
        {
          numero: '8.6',
          enunciado: 'Nível de maturidade digital:',
          tipoForma: 'maturidade',
          opcoes: [...maturidadeDigitalRotuladaOpcoes],
        },
        {
          numero: '8.7',
          enunciado: 'Quais as maiores barreiras para inovar (custo, equipe, integração)?',
          tipoForma: 'dissertativo',
        },
      ],
    },
    buildSecao9ProximosPassos(),
  ],
  perguntas: [],
  secaoPerfil: [],
  secaoInovacao: [],
}

// ============================================================
// POPULAÇÃO DE CAMPOS RETROCOMPATÍVEIS (perguntas, secaoPerfil, etc.)
// ============================================================

const listaQuestionariosBruta: QuestionarioSetorLiteral[] = [
  questionario1Saude,
  questionario2Servicos,
  questionario3Industria,
  questionario4Varejo,
  questionario5Agronegocio,
  questionario6Tecnologia,
  questionario7Construcao,
  questionario8Transporte,
  questionario9Educacao,
  questionario10Academias,
  questionario11Trading,
  questionario12Facilities,
]

// Popula campos retrocompatíveis para garantir que telas existentes continuem funcionando 100%
listaQuestionariosBruta.forEach((q) => {
  const s1 = q.secoes.find((s) => s.numero === 1)
  const s2 = q.secoes.find((s) => s.numero === 2)
  const s3 = q.secoes.find((s) => s.numero === 3)
  const s4 = q.secoes.find((s) => s.numero === 4)
  const s6 = q.secoes.find((s) => s.numero === 6)
  const s8 = q.secoes.find((s) => s.numero === 8)
  const s9 = q.secoes.find((s) => s.numero === 9)

  q.secaoPerfil = s1?.perguntas || []
  q.secaoBuffett = s6?.perguntas || []
  q.secaoInovacao = s8?.perguntas || []
  q.secaoProximosPassos = s9?.perguntas || []

  const pergs: PerguntaSetor[] = []
  if (s2) {
    s2.perguntas.forEach((p) => {
      pergs.push({
        pilar: 1,
        numero: p.numero,
        texto: p.enunciado,
        tipoResposta: p.tipoForma === 'radio' ? 'sim_nao_parcialmente' : 'dissertativo',
        opcoes: p.opcoes,
      })
    })
  }
  if (s3) {
    s3.perguntas.forEach((p) => {
      pergs.push({
        pilar: 2,
        numero: p.numero,
        texto: p.enunciado,
        tipoResposta: p.tipoForma === 'radio' ? 'sim_nao_parcialmente' : 'dissertativo',
        opcoes: p.opcoes,
      })
    })
  }
  if (s4) {
    s4.perguntas.forEach((p) => {
      pergs.push({
        pilar: 3,
        numero: p.numero,
        texto: p.enunciado,
        tipoResposta: p.tipoForma === 'radio' ? 'sim_nao_parcialmente' : 'dissertativo',
        opcoes: p.opcoes,
      })
    })
  }
  q.perguntas = pergs
})

// Alias Setor = QuestionarioSetorLiteral para manter tipos retrocompatíveis
export type Setor = QuestionarioSetorLiteral
export const setores: Setor[] = listaQuestionariosBruta

// Helpers
export function getSetorById(id: string): Setor | undefined {
  return setores.find((s) => s.id === id)
}

export function getPerguntasPorPilar(setor: Setor, pilar: 1 | 2 | 3): PerguntaSetor[] {
  return setor.perguntas.filter((p) => p.pilar === pilar)
}

// Nomes oficiais dos 3 Pilares
export const nomePilares = {
  1: 'Prisão do Fundador',
  2: 'Ineficiência Invisível',
  3: 'Abismo Estratégia vs. Execução',
} as const

// Sequência Canônica Oficial (01 a 12)
const ordemCanonicasIds: string[] = [
  'saude',
  'varejo',
  'servicos',
  'trading',
  'facilities',
  'industria',
  'tecnologia',
  'construcao',
  'transporte',
  'educacao',
  'agronegocio',
  'academias',
]

export const setoresOrdenadosCanonicos: Setor[] = [...setores].sort((a, b) => {
  const ia = ordemCanonicasIds.indexOf(a.id)
  const ib = ordemCanonicasIds.indexOf(b.id)
  return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
})

// ============================================================
// BLOCO FINAL DE DOCUMENTAÇÃO (Páginas 44 e 45 do PDF)
// ============================================================
// Idêntico para todos os 12 setores, visual igual ao do site,
// sem as palavras "obrigatório" ou "opcional" em badges, banners ou textos.

export interface GrupoAnexoConfig {
  id: string
  titulo: string
  descricao: string
  itensSugeridos?: string
}

export const BLOCO_ABERTURA_DOSSIE_ESTRATEGICO = {
  avisoCaixaAlta:
    'TODAS AS PERGUNTAS DEVEM SER RESPONDIDAS PARA A ELABORAÇÃO COMPLETA DO DOSSIÊ ESTRATÉGICO.',
  paragrafo1:
    'Este documento é a base para o nosso trabalho. Diferente de formulários comuns, este é um Dossiê Estratégico. Quanto mais precisas e transparentes forem suas respostas, mais cirúrgico será o plano de ação gerado pelo nosso sistema de Inteligência Estratégica',
  paragrafo2:
    'Não oferecemos teorias de gaveta. O Dossiê de Planejamento Estratégico é um raio-x cirúrgico da sua operação atual. Baseado nas suas respostas, você receberá um mapa claro apontando os gargalos que estão travando seu crescimento e as alavancas imediatas para proteger seu caixa e otimizar sua gestão.',
} as const

export const BLOCO_DOCUMENTACAO_FINAL = {
  paragrafoAbertura1:
    'Anexe arquivos complementares que auxiliem a análise — relatórios gerenciais, apresentações institucionais e indicadores específicos.',
  paragrafoAbertura2:
    'Estes documentos são fundamentais para a qualidade do seu diagnóstico. Com eles, as análises se apoiam em números reais da sua operação — e o plano de ação resultante ganha precisão muito maior. Sem eles, o diagnóstico permanece válido, porém menos profundo.',
  formatosLimites: {
    titulo: 'Formatos e Limites de Arquivos Aceitos',
    itens: [
      'Formatos aceitos exclusivamente: Word (.doc, .docx), PDF (.pdf) e Excel (.xls, .xlsx).',
      'Imagens bloqueadas: Arquivos JPG, PNG, HEIC e imagens em geral não são aceitos.',
      'Tamanho e quantidade: até 100 MB por arquivo e no máximo 15 arquivos por campo.',
    ],
  },
  avisoRascunho:
    'Atenção: Por motivos de segurança e limite de dados do navegador, os arquivos anexados não são salvos em rascunho local. Caso tenha adicionado anexos em uma sessão anterior e reiniciado o navegador, certifique-se de selecioná-los abaixo.',
  grupos: [
    {
      id: 'financeiros',
      titulo: 'Demonstrativos Econômico-Financeiros (DRE, Balanço Patrimonial, Fluxo de Caixa)',
      descricao:
        'Balanço Patrimonial, DRE gerencial ou contábil detalhada, Balancetes recentes e Fluxo de Caixa. Envie todos dos últimos 3 anos.',
    },
    {
      id: 'gerenciais',
      titulo: 'Relatórios Gerenciais',
      descricao:
        'Fluxo de Caixa Gerencial orçado vs. realizado, Relatórios de Vendas, Custos Operacionais, Margem por linha e Organograma.',
    },
    {
      id: 'sociedade',
      titulo: 'Sociedade e documentos complementares',
      descricao:
        'Itens sugeridos para envio: • Contrato Social/Estatuto (último consolidado) • Acordo de Cotistas/Acionistas; Código de Ética • Contratos de Câmbio • Planilha de Landed Cost; Outros que julgar adequado (PDF, Word ou Excel).',
    },
  ] as GrupoAnexoConfig[],
  casoNaoVaAnexar: {
    titulo: 'CASO NÃO VÁ ANEXAR ARQUIVOS AGORA:',
    opcao1: 'Não possuo estes documentos no momento',
    opcao2: 'Prefiro enviar depois, com a equipe VETOR MASTER',
    nota: 'O preenchimento dessas opções ajuda nossa equipe a preparar a melhor dinâmica para sua Devolutiva. O envio continua 100% liberado mesmo sem selecionar.',
  },
  sigiloLgpd:
    'Seus documentos são tratados com sigilo absoluto, armazenados de forma criptografada, acessados exclusivamente pela equipe responsável pelo seu diagnóstico e utilizados apenas para esta análise — em fiel cumprimento à LGPD. Você pode solicitar a exclusão a qualquer momento.',
} as const
