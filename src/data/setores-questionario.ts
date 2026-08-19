// Base de Conhecimento V6.5 — Questionários Consolidados (10 setores)
// Fonte: "Questionários_Consolidados_10_Setores_V6.5_19ago26"
//
// Estrutura completa do questionário, na ordem de exibição:
//   Identificação da Empresa (6 campos, setorial apenas no Segmento)
//   Seção 1 — Perfil da Empresa e Contexto (setorial: específica para os
//             10 setores, extraída palavra por palavra do PDF)
//   Pilar 1 — Prisão do Fundador
//   Pilar 2 — Ineficiência Invisível
//   Pilar 3 — Abismo Estratégia vs. Execução
//   Seção 5 — Hackman (6 perguntas, iguais para todos os setores)
//   Seção 6 — Buffett (6 perguntas; versão específica para Tecnologia/Startups,
//             onde 6.6 = "reserva de capital (runway) para 12 meses")
//   Seção 7 — Expectativas e Ambição (5 perguntas, iguais para todos)
//   Seção 8 — Inovação e Tecnologia (7 perguntas, versão setorial fiel)
//   Seção 9 — Próximos Passos (4 campos + Documentação Adicional opcional)
//
// Os 3 Pilares são extraídos fielmente do PDF "Contexto Estratégico Global
// 10 Setores V6.5". As Seções 1, 5, 6, 7, 8 e 9 e a Identificação da Empresa
// são extraídas do PDF "Questionários Consolidados 10 Setores V6.5" (19ago26).

export interface PerguntaSetor {
  pilar: 1 | 2 | 3
  texto: string
}

export type TipoInput =
  | 'escala'
  | 'texto'
  | 'numero'
  | 'textarea'
  | 'select'
  | 'display'
  | 'checkbox'

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
  secaoIdentificacao: PerguntaSecao[] // Identificação da Empresa (início)
  secaoPerfil: PerguntaSecao[] // Seção 1 (setorial)
  secaoBuffett?: PerguntaSecao[] // Seção 6 (override; default = secaoBuffett)
  secaoInovacao: PerguntaSecao[] // Seção 8 (setorial)
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

// Opções fiéis ao PDF V6.5 (Questionários Consolidados)
export const simNaoParcialmenteOpcoes = ['Sim', 'Não', 'Parcialmente']
export const simNaoOpcoes = ['Sim', 'Não']
export const disposicaoOpcoes = ['Alto', 'Médio', 'Baixo']
export const formatoInteresseOpcoes = ['MaaS', 'Híbrido', 'CaaS', 'Ainda não sei']
export const maturidadeDigitalOpcoesSaude = ['1 — Básico', '2 — Intermediário', '3 — Avançado']
export const maturidadeDigitalOpcoes = ['1', '2', '3']

// Variantes de regime tributário usadas no PDF por setor
const regimeTributarioSimplesOptions = ['Simples', 'Lucro Presumido', 'Lucro Real']
const regimeTributarioNacionalOptions = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real']
const propriedadePadraoOpcoes = ['Familiar', 'Sócios', 'Investidores', 'Outro']
const propriedadeTecOpcoes = ['Founder-led', 'Cofundadores', 'Investidores', 'Grupo']
const estagioTecOpcoes = ['Pré-seed', 'Seed', 'Série A', 'Série B+', 'Scale-up']
const documentacaoAdicionalOpcoes = [
  'Balanço Patrimonial',
  'DRE',
  'Organograma',
  'Relatórios de Vendas',
]

// ============================================================
// Identificação da Empresa (comum a todos os 10 setores; só o
// Segmento varia conforme o setor)
// ============================================================

export function buildSecaoIdentificacao(segmentos: string[]): PerguntaSecao[] {
  return [
    { texto: 'Razão Social:', tipo: 'texto' },
    { texto: 'CNPJ:', tipo: 'texto' },
    { texto: 'Data:', tipo: 'texto', placeholder: '//______' },
    { texto: 'Segmento:', tipo: 'select', opcoes: [...segmentos, 'Outro'] },
    { texto: 'Respondente:', tipo: 'texto' },
    { texto: 'Cargo:', tipo: 'texto' },
  ]
}

// ============================================================
// Seção 1 — Perfil da Empresa e Contexto (setorial, 10 versões)
// Extraída palavra por palavra do PDF V6.5 (19ago26).
// ============================================================

// Perfil específico — Saúde (8 campos)
const secaoPerfilSaude: PerguntaSecao[] = [
  { texto: 'Qual o faturamento anual aproximado da empresa?', tipo: 'texto' },
  { texto: 'Quantas unidades/sedes a empresa possui?', tipo: 'numero' },
  { texto: 'Quantos colaboradores ao todo?', tipo: 'numero' },
  {
    texto: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
    tipo: 'texto',
  },
  { texto: 'Estrutura de propriedade:', tipo: 'select', opcoes: propriedadePadraoOpcoes },
  { texto: 'Regime tributário:', tipo: 'select', opcoes: regimeTributarioSimplesOptions },
  { texto: 'Principais fontes de receita (Convênios, Particular, SUS, etc.)?', tipo: 'texto' },
  { texto: 'Possui certificações (ONA, ISO, etc.)?', tipo: 'texto' },
]

// Perfil específico — Serviços Profissionais (8 campos)
const secaoPerfilServicos: PerguntaSecao[] = [
  { texto: 'Qual o faturamento anual aproximado da empresa?', tipo: 'texto' },
  { texto: 'Quantas unidades/sedes a empresa possui?', tipo: 'numero' },
  { texto: 'Quantos colaboradores ao todo?', tipo: 'numero' },
  {
    texto: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
    tipo: 'texto',
  },
  { texto: 'Estrutura de propriedade:', tipo: 'select', opcoes: propriedadePadraoOpcoes },
  { texto: 'Regime tributário:', tipo: 'select', opcoes: regimeTributarioSimplesOptions },
  {
    texto: 'Principais fontes de receita (projetos, contratos recorrentes, honorários, etc.)?',
    tipo: 'texto',
  },
  { texto: 'Possui certificações ou reconhecimentos de mercado?', tipo: 'texto' },
]

// Perfil específico — Indústria (8 campos)
const secaoPerfilIndustria: PerguntaSecao[] = [
  { texto: 'Qual o faturamento anual aproximado da empresa?', tipo: 'texto' },
  { texto: 'Quantas unidades/sedes (plantas) a empresa possui?', tipo: 'numero' },
  { texto: 'Quantos colaboradores ao todo?', tipo: 'numero' },
  {
    texto: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
    tipo: 'texto',
  },
  { texto: 'Estrutura de propriedade:', tipo: 'select', opcoes: propriedadePadraoOpcoes },
  { texto: 'Regime tributário:', tipo: 'select', opcoes: regimeTributarioSimplesOptions },
  {
    texto: 'Principais fontes de receita (B2B, B2C, distribuição, exportação, etc.)?',
    tipo: 'texto',
  },
  { texto: 'Possui certificações (ISO, etc.)?', tipo: 'texto' },
]

// Perfil específico — Varejo (8 campos)
const secaoPerfilVarejo: PerguntaSecao[] = [
  { texto: 'Qual o faturamento anual aproximado da empresa?', tipo: 'texto' },
  { texto: 'Quantas unidades/lojas a empresa possui?', tipo: 'numero' },
  { texto: 'Quantos colaboradores ao todo?', tipo: 'numero' },
  {
    texto: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
    tipo: 'texto',
  },
  { texto: 'Estrutura de propriedade:', tipo: 'select', opcoes: propriedadePadraoOpcoes },
  { texto: 'Regime tributário:', tipo: 'select', opcoes: regimeTributarioSimplesOptions },
  {
    texto: 'Principais fontes de receita (loja física, e-commerce, marketplaces, etc.)?',
    tipo: 'texto',
  },
  { texto: 'Possui certificações ou reconhecimentos de mercado?', tipo: 'texto' },
]

// Perfil específico — Agronegócio (8 campos)
const secaoPerfilAgronegocio: PerguntaSecao[] = [
  { texto: 'Qual o faturamento anual aproximado da empresa?', tipo: 'texto' },
  { texto: 'Quantas unidades/fazendas a empresa possui?', tipo: 'numero' },
  { texto: 'Quantos colaboradores ao todo?', tipo: 'numero' },
  {
    texto: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
    tipo: 'texto',
  },
  { texto: 'Estrutura de propriedade:', tipo: 'select', opcoes: propriedadePadraoOpcoes },
  { texto: 'Regime tributário:', tipo: 'select', opcoes: regimeTributarioSimplesOptions },
  {
    texto: 'Principais fontes de receita (commodities, pecuária, trading, etc.)?',
    tipo: 'texto',
  },
  { texto: 'Possui certificações (sustentabilidade, orgânico, etc.)?', tipo: 'texto' },
]

// Perfil específico — Tecnologia/Startups (8 campos)
const secaoPerfilTecnologia: PerguntaSecao[] = [
  { texto: 'Qual a receita anual recorrente (ARR/MRR) aproximada?', tipo: 'texto' },
  { texto: 'Estágio:', tipo: 'select', opcoes: estagioTecOpcoes },
  { texto: 'Colaboradores por área (Engenharia, Comercial, Ops)?', tipo: 'texto' },
  { texto: 'Crescimento de receita nos últimos 3 anos?', tipo: 'texto' },
  { texto: 'Propriedade:', tipo: 'select', opcoes: propriedadeTecOpcoes },
  { texto: 'Regime tributário atual?', tipo: 'select', opcoes: regimeTributarioNacionalOptions },
  { texto: 'Fontes de receita (MRR, Contratos, Marketplace, Serviços)?', tipo: 'texto' },
  {
    texto: 'Possui métricas definidas (CAC, LTV, Churn, Payback)?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
]

// Perfil específico — Construção Civil (8 campos)
const secaoPerfilConstrucao: PerguntaSecao[] = [
  { texto: 'Qual o faturamento anual aproximado da empresa?', tipo: 'texto' },
  { texto: 'Quantas obras/unidades a empresa possui em andamento?', tipo: 'numero' },
  { texto: 'Quantos colaboradores ao todo?', tipo: 'numero' },
  {
    texto: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
    tipo: 'texto',
  },
  { texto: 'Estrutura de propriedade:', tipo: 'select', opcoes: propriedadePadraoOpcoes },
  { texto: 'Regime tributário:', tipo: 'select', opcoes: regimeTributarioSimplesOptions },
  {
    texto: 'Principais fontes de receita (obras privadas, públicas, incorporação, etc.)?',
    tipo: 'texto',
  },
  { texto: 'Possui certificações (ISO, PBQP-H, etc.)?', tipo: 'texto' },
]

// Perfil específico — Transporte/Logística (8 campos)
const secaoPerfilTransporte: PerguntaSecao[] = [
  { texto: 'Qual o faturamento anual aproximado da empresa?', tipo: 'texto' },
  { texto: 'Quantas unidades/bases a empresa possui?', tipo: 'numero' },
  { texto: 'Quantos colaboradores ao todo?', tipo: 'numero' },
  {
    texto: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
    tipo: 'texto',
  },
  { texto: 'Estrutura de propriedade:', tipo: 'select', opcoes: propriedadePadraoOpcoes },
  { texto: 'Regime tributário:', tipo: 'select', opcoes: regimeTributarioSimplesOptions },
  {
    texto: 'Principais fontes de receita (fretes, contratos, distribuição, etc.)?',
    tipo: 'texto',
  },
  { texto: 'Possui certificações (ISO, ANTT, etc.)?', tipo: 'texto' },
]

// Perfil específico — Educação (9 campos)
const secaoPerfilEducacao: PerguntaSecao[] = [
  { texto: 'Faturamento anual aproximado?', tipo: 'texto' },
  { texto: 'Unidades (campi, filiais, polos EAD)?', tipo: 'numero' },
  { texto: 'Colaboradores (Docentes vs. Adm/Pedagógico)?', tipo: 'texto' },
  { texto: 'Alunos matriculados e capacidade instalada?', tipo: 'texto' },
  { texto: 'Tempo de operação e crescimento nos últimos 3 anos?', tipo: 'texto' },
  { texto: 'Estrutura de propriedade?', tipo: 'select', opcoes: propriedadePadraoOpcoes },
  { texto: 'Regime tributário atual?', tipo: 'select', opcoes: regimeTributarioNacionalOptions },
  { texto: 'Fontes de receita (Mensalidades, Matrículas, Convênios)?', tipo: 'texto' },
  { texto: 'Certificações (MEC, ISO, Internacionais)?', tipo: 'texto' },
]

// Perfil específico — Academias de Ginástica (9 campos)
const secaoPerfilAcademias: PerguntaSecao[] = [
  { texto: 'Faturamento anual aproximado?', tipo: 'texto' },
  { texto: 'Unidades (academias/estúdios)?', tipo: 'numero' },
  { texto: 'Colaboradores (Instrutores vs. Adm/Atendimento)?', tipo: 'texto' },
  { texto: 'Alunos ativos e capacidade instalada?', tipo: 'texto' },
  { texto: 'Tempo de operação e crescimento nos últimos 3 anos?', tipo: 'texto' },
  { texto: 'Estrutura de propriedade?', tipo: 'select', opcoes: propriedadePadraoOpcoes },
  { texto: 'Regime tributário atual?', tipo: 'select', opcoes: regimeTributarioNacionalOptions },
  { texto: 'Fontes de receita (Mensalidades, Planos, Personal, Loja)?', tipo: 'texto' },
  { texto: 'Certificações ou premiações setoriais?', tipo: 'texto' },
]

// ============================================================
// Seções compartilhadas (idênticas para todos os 10 setores)
// ============================================================

// Seção 5 — Hackman (6 perguntas) — fiel ao PDF V6.5
export const secaoHackman: PerguntaSecao[] = [
  {
    texto: 'Existe um time real, com limites claros e interdependência definida?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  {
    texto: 'A direção da empresa está clara e convincente para todos?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  {
    texto: 'As tarefas e normas facilitam a execução do trabalho?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  {
    texto: 'A equipe dispõe de recursos e recompensas adequados?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  {
    texto: 'Existe coaching ou feedback contínuo para as lideranças?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  {
    texto: 'Quantos dos seus líderes são considerados de alta performance?',
    tipo: 'texto',
  },
]

// Seção 6 — Buffett (6 perguntas) — fiel ao PDF V6.5
// Versão padrão (9 setores): 6.6 = "reserva de capital de giro para 3 meses"
export const secaoBuffett: PerguntaSecao[] = [
  { texto: 'Qual a margem EBITDA atual aproximada?', tipo: 'texto' },
  { texto: 'Qual o nível de endividamento atual (Dívida Líquida / EBITDA)?', tipo: 'texto' },
  { texto: 'Qual o prazo médio de recebimento da carteira?', tipo: 'texto' },
  { texto: 'Qual o índice de inadimplência da carteira de clientes?', tipo: 'texto' },
  {
    texto: 'A empresa fecha DRE gerencial mensal até o 10º dia útil?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  {
    texto: 'Possui reserva de capital de giro para 3 meses de operação?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
]

// Seção 6 — Buffett — versão Tecnologia/Startups (6 perguntas).
// Fiel ao PDF V6.5: 6.6 = "A empresa possui reserva de capital (runway) para
// 12 meses de operação?" — não há Seção 6.6 separada; a pergunta de runway
// é a 6.6 da própria Seção 6 de Tecnologia.
export const secaoBuffettTecnologia: PerguntaSecao[] = [
  { texto: 'Qual a margem EBITDA atual aproximada?', tipo: 'texto' },
  { texto: 'Qual o nível de endividamento atual (Dívida Líquida / EBITDA)?', tipo: 'texto' },
  { texto: 'Qual o prazo médio de recebimento da carteira?', tipo: 'texto' },
  { texto: 'Qual o índice de inadimplência da carteira de clientes?', tipo: 'texto' },
  {
    texto: 'A empresa fecha DRE gerencial mensal até o 10º dia útil?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  {
    texto: 'A empresa possui reserva de capital (runway) para 12 meses de operação?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
]

// Seção 7 — Expectativas e Ambição (5 perguntas) — fiel ao PDF V6.5
export const secaoExpectativas: PerguntaSecao[] = [
  { texto: 'O que o levou a buscar este diagnóstico?', tipo: 'textarea' },
  { texto: 'Qual o principal problema a resolver nos próximos 12 meses?', tipo: 'textarea' },
  { texto: 'Qual o horizonte de transformação desejado para a empresa?', tipo: 'textarea' },
  { texto: 'Nível de disposição para mudanças:', tipo: 'select', opcoes: disposicaoOpcoes },
  {
    texto: 'Já contratou consultoria ou mentoria anteriormente? Qual o resultado?',
    tipo: 'textarea',
  },
]

// Seção 9 — Próximos Passos (4 campos + Documentação Adicional) — fiel ao PDF V6.5
// 9.1 é puramente informativo (tipo display), não exige resposta.
// Ao final, "Documentação Adicional (Opcional)" como checkboxes (multi-seleção).
export const secaoProximosPassos: PerguntaSecao[] = [
  {
    texto: 'Você receberá um Diagnóstico Executivo com recomendações prioritárias.',
    tipo: 'display',
  },
  { texto: 'Autoriza sessão de devolutiva de 45 min?', tipo: 'select', opcoes: simNaoOpcoes },
  { texto: 'Formato de interesse:', tipo: 'select', opcoes: formatoInteresseOpcoes },
  { texto: 'Responsável pelos documentos:', tipo: 'texto' },
  {
    texto: 'Documentação Adicional (Opcional):',
    tipo: 'checkbox',
    opcoes: documentacaoAdicionalOpcoes,
  },
]

// ============================================================
// Seção 8 — Inovação e Tecnologia (setorial, 7 perguntas cada)
// Extraída fielmente do PDF V6.5 para cada um dos 10 setores.
// ============================================================

const secaoInovacaoSaude: PerguntaSecao[] = [
  { texto: 'Utiliza sistema de gestão de saúde/ERP integrado? Qual?', tipo: 'texto' },
  { texto: 'Seus sistemas operam em nuvem ou servidor local?', tipo: 'texto' },
  {
    texto: 'Acompanha dashboards de ocupação, glosa e faturamento em tempo real?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  { texto: 'Utiliza prontuário eletrônico, IA ou telemedicina na operação?', tipo: 'texto' },
  { texto: 'Quais processos são automatizados (faturamento, guias, cobrança)?', tipo: 'textarea' },
  {
    texto: 'Nível de maturidade digital:',
    tipo: 'select',
    opcoes: maturidadeDigitalOpcoesSaude,
  },
  {
    texto: 'Quais as maiores barreiras para inovar (Custo, Equipe, Integração)?',
    tipo: 'textarea',
  },
]

const secaoInovacaoServicos: PerguntaSecao[] = [
  { texto: 'Utiliza ERP/CRM integrado (propostas, contratos, financeiro)? Qual?', tipo: 'texto' },
  { texto: 'Seus sistemas operam em nuvem?', tipo: 'select', opcoes: simNaoParcialmenteOpcoes },
  {
    texto: 'Acompanha dashboards de utilização, receita e pipeline em tempo real?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  { texto: 'Utiliza IA para apoio a propostas, contratos ou pesquisa?', tipo: 'texto' },
  { texto: 'Quais processos administrativos já são automatizados?', tipo: 'textarea' },
  { texto: 'Nível de maturidade digital:', tipo: 'select', opcoes: maturidadeDigitalOpcoes },
  { texto: 'Quais as maiores barreiras para digitalizar a operação?', tipo: 'textarea' },
]

const secaoInovacaoIndustria: PerguntaSecao[] = [
  { texto: 'Utiliza ERP integrado (produção, estoque, financeiro, fiscal)? Qual?', tipo: 'texto' },
  { texto: 'Seus sistemas operam em nuvem?', tipo: 'select', opcoes: simNaoParcialmenteOpcoes },
  {
    texto: 'Acompanha dashboards de OEE, refugo e margem em tempo real?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  { texto: 'Utiliza automação, IoT, robótica ou IA na linha de produção?', tipo: 'texto' },
  { texto: 'Quais processos já são automatizados (PCP, faturamento, NF-e)?', tipo: 'textarea' },
  { texto: 'Nível de maturidade digital:', tipo: 'select', opcoes: maturidadeDigitalOpcoes },
  { texto: 'Quais as maiores barreiras para inovar na indústria?', tipo: 'textarea' },
]

const secaoInovacaoVarejo: PerguntaSecao[] = [
  { texto: 'Utiliza ERP/PDV integrado (estoque, vendas, financeiro)? Qual?', tipo: 'texto' },
  { texto: 'Seus sistemas operam em nuvem?', tipo: 'select', opcoes: simNaoParcialmenteOpcoes },
  {
    texto: 'Acompanha dashboards de vendas, ruptura e ticket médio em tempo real?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  { texto: 'Utiliza e-commerce, marketplaces ou IA para precificação dinâmica?', tipo: 'texto' },
  {
    texto: 'Quais processos são automatizados (reposição, faturamento, logística)?',
    tipo: 'textarea',
  },
  { texto: 'Nível de maturidade digital:', tipo: 'select', opcoes: maturidadeDigitalOpcoes },
  { texto: 'Quais as maiores barreiras para inovar no varejo?', tipo: 'textarea' },
]

const secaoInovacaoAgronegocio: PerguntaSecao[] = [
  { texto: 'Utiliza sistema de gestão agrícola/ERP integrado? Qual?', tipo: 'texto' },
  { texto: 'Seus sistemas operam em nuvem?', tipo: 'select', opcoes: simNaoParcialmenteOpcoes },
  {
    texto: 'Acompanha dashboards de produtividade, custo/ha e clima em tempo real?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  { texto: 'Utiliza agricultura de precisão, IoT, drones ou satélite?', tipo: 'texto' },
  {
    texto: 'Quais processos são automatizados (insumos, rastreabilidade, trading)?',
    tipo: 'textarea',
  },
  { texto: 'Nível de maturidade digital:', tipo: 'select', opcoes: maturidadeDigitalOpcoes },
  { texto: 'Quais as barreiras (incluindo conectividade no campo)?', tipo: 'textarea' },
]

const secaoInovacaoTecnologia: PerguntaSecao[] = [
  { texto: 'Utiliza ERP/CRM integrado (vendas, financeiro, suporte)? Qual?', tipo: 'texto' },
  { texto: 'Sistemas em nuvem?', tipo: 'select', opcoes: simNaoParcialmenteOpcoes },
  {
    texto: 'Dashboards de MRR, Churn, CAC e NPS em tempo real?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  {
    texto: 'Utiliza IA generativa, automação ou dados para produto e comercial?',
    tipo: 'texto',
  },
  {
    texto: 'Quais processos são automatizados (onboarding, cobrança, suporte)?',
    tipo: 'textarea',
  },
  { texto: 'Nível de maturidade digital:', tipo: 'select', opcoes: maturidadeDigitalOpcoes },
  { texto: 'Quais as maiores barreiras para escalar (incluindo capital)?', tipo: 'textarea' },
]

const secaoInovacaoConstrucao: PerguntaSecao[] = [
  { texto: 'Utiliza ERP ou software de gestão de obras? Qual?', tipo: 'texto' },
  { texto: 'Sistemas em nuvem?', tipo: 'select', opcoes: simNaoParcialmenteOpcoes },
  {
    texto: 'Dashboards de custo orçado vs. realizado e curva S em tempo real?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  { texto: 'Utiliza BIM, drones, IoT ou IA para planejamento e canteiro?', tipo: 'texto' },
  {
    texto: 'Quais processos são automatizados (medições, materiais, faturamento)?',
    tipo: 'textarea',
  },
  { texto: 'Nível de maturidade digital:', tipo: 'select', opcoes: maturidadeDigitalOpcoes },
  { texto: 'Quais as maiores barreiras para inovar na construção?', tipo: 'textarea' },
]

const secaoInovacaoTransporte: PerguntaSecao[] = [
  { texto: 'Utiliza TMS ou ERP integrado (frota, rotas, financeiro)? Qual?', tipo: 'texto' },
  { texto: 'Sistemas em nuvem?', tipo: 'select', opcoes: simNaoParcialmenteOpcoes },
  {
    texto: 'Dashboards de ociosidade, km vazios e entregas no prazo em tempo real?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  { texto: 'Utiliza telemetria, rastreamento ou IA para roteirização?', tipo: 'texto' },
  {
    texto: 'Quais processos são automatizados (CT-e, agendamento, monitoramento)?',
    tipo: 'textarea',
  },
  { texto: 'Nível de maturidade digital:', tipo: 'select', opcoes: maturidadeDigitalOpcoes },
  { texto: 'Quais as maiores barreiras para inovar na logística?', tipo: 'textarea' },
]

const secaoInovacaoEducacao: PerguntaSecao[] = [
  { texto: 'Utiliza ERP ou software de gestão escolar integrado? Qual?', tipo: 'texto' },
  { texto: 'Sistemas em nuvem?', tipo: 'select', opcoes: simNaoParcialmenteOpcoes },
  {
    texto: 'Dashboards de evasão, inadimplência e captação em tempo real?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  {
    texto: 'Utiliza EAD, plataformas digitais ou IA para ensino e comunicação?',
    tipo: 'texto',
  },
  {
    texto: 'Quais processos são automatizados (matrícula, cobrança, comunicação)?',
    tipo: 'textarea',
  },
  { texto: 'Nível de maturidade digital:', tipo: 'select', opcoes: maturidadeDigitalOpcoes },
  { texto: 'Quais as barreiras (incluindo resistência do corpo docente)?', tipo: 'textarea' },
]

const secaoInovacaoAcademias: PerguntaSecao[] = [
  { texto: 'Utiliza sistema de gestão de academia ou ERP integrado? Qual?', tipo: 'texto' },
  { texto: 'Sistemas em nuvem?', tipo: 'select', opcoes: simNaoParcialmenteOpcoes },
  {
    texto: 'Dashboards de evasão, inadimplência e vendas em tempo real?',
    tipo: 'select',
    opcoes: simNaoParcialmenteOpcoes,
  },
  { texto: 'Utiliza app próprio, IA ou automação para retenção e treinos?', tipo: 'texto' },
  {
    texto: 'Quais processos são automatizados (matrícula online, acesso, cobrança)?',
    tipo: 'textarea',
  },
  { texto: 'Nível de maturidade digital:', tipo: 'select', opcoes: maturidadeDigitalOpcoes },
  { texto: 'Quais as maiores barreiras para inovar na academia?', tipo: 'textarea' },
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
    secaoIdentificacao: buildSecaoIdentificacao([
      'Hospitalar',
      'Clínica',
      'Odontológica',
      'Laboratório',
      'Home Care',
    ]),
    secaoPerfil: secaoPerfilSaude,
    secaoInovacao: secaoInovacaoSaude,
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
    secaoIdentificacao: buildSecaoIdentificacao([
      'Consultoria',
      'Advocacia',
      'Contabilidade',
      'Arquitetura',
      'Agência',
      'TI',
    ]),
    secaoPerfil: secaoPerfilServicos,
    secaoInovacao: secaoInovacaoServicos,
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
    secaoIdentificacao: buildSecaoIdentificacao([
      'Manufatura',
      'Metalurgia',
      'Alimentos',
      'Químico',
      'Têxtil',
      'Plástico',
    ]),
    secaoPerfil: secaoPerfilIndustria,
    secaoInovacao: secaoInovacaoIndustria,
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
    secaoIdentificacao: buildSecaoIdentificacao([
      'Lojas Físicas',
      'E-commerce',
      'Distribuição',
      'Alimentação',
      'Moda',
    ]),
    secaoPerfil: secaoPerfilVarejo,
    secaoInovacao: secaoInovacaoVarejo,
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
    secaoIdentificacao: buildSecaoIdentificacao([
      'Grãos',
      'Pecuária',
      'Cana',
      'Café',
      'Fruticultura',
    ]),
    secaoPerfil: secaoPerfilAgronegocio,
    secaoInovacao: secaoInovacaoAgronegocio,
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
    secaoIdentificacao: buildSecaoIdentificacao([
      'SaaS',
      'Fintech',
      'Healthtech',
      'Edtech',
      'Marketplace',
    ]),
    secaoPerfil: secaoPerfilTecnologia,
    secaoBuffett: secaoBuffettTecnologia,
    secaoInovacao: secaoInovacaoTecnologia,
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
    secaoIdentificacao: buildSecaoIdentificacao([
      'Edificações',
      'Incorporação',
      'Infraestrutura',
      'Reformas',
    ]),
    secaoPerfil: secaoPerfilConstrucao,
    secaoInovacao: secaoInovacaoConstrucao,
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
    secaoIdentificacao: buildSecaoIdentificacao([
      'Cargas',
      'Passageiros',
      'Distribuição',
      'Armazenagem',
    ]),
    secaoPerfil: secaoPerfilTransporte,
    secaoInovacao: secaoInovacaoTransporte,
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
    secaoIdentificacao: buildSecaoIdentificacao([
      'Básica',
      'Superior',
      'Técnico',
      'Idiomas',
      'Edtech',
    ]),
    secaoPerfil: secaoPerfilEducacao,
    secaoInovacao: secaoInovacaoEducacao,
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
    secaoIdentificacao: buildSecaoIdentificacao([
      'Musculação',
      'Estúdio',
      'CrossFit',
      'Pilates',
      'Natação',
    ]),
    secaoPerfil: secaoPerfilAcademias,
    secaoInovacao: secaoInovacaoAcademias,
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
// Identificação → Perfil → P1 → P2 → P3 → Hackman → Buffett →
//   Expectativas → Inovação → Próximos Passos
// ============================================================

export type TipoStep =
  | 'identificacao'
  | 'perfil'
  | 'pilar'
  | 'hackman'
  | 'buffett'
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
  identificacao: 'Identificação da Empresa',
  perfil: 'Seção 1 — Perfil da Empresa e Contexto',
  pilar: '', // preenchido dinamicamente
  hackman: 'Seção 5 — Hackman',
  buffett: 'Seção 6 — Buffett',
  expectativas: 'Seção 7 — Expectativas e Ambição',
  inovacao: 'Seção 8 — Inovação e Tecnologia',
  'proximos-passos': 'Seção 9 — Próximos Passos',
}

export function getStepsDoSetor(setor: Setor): StepDescriptor[] {
  const steps: StepDescriptor[] = [
    {
      key: 'identificacao',
      titulo: tituloSecao.identificacao,
      descricao: 'Dados cadastrais da empresa para o diagnóstico.',
      tipo: 'identificacao',
      perguntas: setor.secaoIdentificacao,
    },
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
    perguntas: setor.secaoBuffett ?? secaoBuffett,
  })

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
