// Base Canônica dos 12 Setores — Vetor Master V1.3 & V7.2
// Fonte: Documento de Alinhamento Visual V1.3 (24/09/2026) e Questionários Consolidados 12 Setores V7.2
//
// Sequência Canônica Oficial:
// 01 Saúde
// 02 Varejo
// 03 Serviços Profissionais (destaque Saúde / Varejo / Serviços)
// 04 Comércio Internacional – Trading
// 05 Facilities e Serviços Terceirizados
// 06 Indústria
// 07 Tech / Startups
// 08 Construção Civil
// 09 Logística / Transporte
// 10 Educação
// 11 Agronegócio
// 12 Academias de Ginástica

export interface SetorCanonicoInfo {
  numero: string // '01'..'12'
  id: string
  nome: string
  slug: string
  destaque?: boolean
  segmentos: string[]
  microEpifanias: string[]
  // Card text do site (fechado = síntese rápida da dor; aberto = detalhe da intervenção determinística)
  textoFechado: string
  textoAberto: string
  metricaChave: string
}

export const SETORES_CANONICOS_12: SetorCanonicoInfo[] = [
  {
    numero: '01',
    id: 'saude',
    nome: 'Saúde',
    slug: 'saude',
    destaque: true,
    segmentos: ['Hospitalar', 'Clínica', 'Odontológica', 'Laboratório', 'Home Care'],
    microEpifanias: [
      'Glosa hospitalar invisível',
      'Ociosidade de leitos e salas cirúrgicas',
      'Retrabalho crônico em faturamento/guias de convênio',
      'Descasamento entre prontuário médico e conta',
    ],
    textoFechado:
      'Glosas silenciosas de operadoras, ociosidade de centros cirúrgicos e dependência do fundador na governança técnica e clínica.',
    textoAberto:
      'Auditoria de faturamento e regras de convênio em 72h. Parametrização de protocolos assistenciais autônomos, estancamento de glosas (redução média histórica de até 70%) e desoneração do diretor clínico da rotina operacional de compras e escalas.',
    metricaChave: 'Até -70% em glosas e +40% na ocupação de centros cirúrgicos',
  },
  {
    numero: '02',
    id: 'varejo',
    nome: 'Varejo',
    slug: 'varejo',
    destaque: true,
    segmentos: ['Lojas Físicas', 'E-commerce', 'Distribuição', 'Alimentação', 'Moda'],
    microEpifanias: [
      'Ruptura de estoque nos top produtos',
      'Vendas perdidas no balcão por falta de produto',
      'Quebras, furtos e perdas não auditadas',
      'Margem negativa por categoria de produto',
    ],
    textoFechado:
      'Ruptura de gôndola nos itens de alto giro, capital de giro asfixiado em estoque obsoleto e fundadores reféns de precificação manual e descontos de balcão.',
    textoAberto:
      'Matriz de giro e cobertura de estoque com alertas preditivos. Autonomia comercial para equipes de loja através de limites parametrizados de margem de contribuição, eliminando aprovações manuais do fundador e estancando sangrias de frete expresso.',
    metricaChave: 'Estancamento de ruptura e +3,8 p.p. na margem de contribuição',
  },
  {
    numero: '03',
    id: 'servicos',
    nome: 'Serviços Profissionais',
    slug: 'servicos-profissionais',
    destaque: true,
    segmentos: ['Consultoria', 'Advocacia', 'Contabilidade', 'Arquitetura', 'Agência', 'TI'],
    microEpifanias: [
      'Horas trabalhadas e não cobradas (leakage)',
      'Taxa de utilização real abaixo de 60%',
      'Contratos há mais de 12 meses sem revisão',
      'Custo de oportunidade do sócio como executor',
    ],
    textoFechado:
      'Vazamento silencioso de honorários, taxa real de faturabilidade diluída e fundadores soterrados na revisão técnica de propostas e entregas.',
    textoAberto:
      'Padronização de esteiras de entrega com SLAs objetivos e matriz de precificação por complexidade. Descentralização de fechamento comercial para sócios juniores e automatização de cobrança de horas extras e aditivos contratuais.',
    metricaChave: 'Autonomia comercial sem o sócio e +35% em aproveitamento de faturabilidade',
  },
  {
    numero: '04',
    id: 'trading',
    nome: 'Comércio Internacional – Trading',
    slug: 'comercio-internacional-trading',
    segmentos: [
      'Importação por Conta e Ordem',
      'Importação por Encomenda',
      'Trading Própria',
      'Exportação de Commodities',
      'Distribuição de Importados',
    ],
    microEpifanias: [
      'Descasamento de hedge cambial não protegido',
      'Custos ocultos no Landed Cost por SKU/contêiner',
      'Sobrestadia de contêineres (demurrage explosivo)',
      'Exposição ao fim de incentivos estaduais (Reforma Tributária CBS/IBS)',
    ],
    textoFechado:
      'Exposição cambial sem hedge, demurrage imprevisto, confusão fiscal entre Conta & Ordem e Encomenda e alta dependência dos incentivos de ICMS.',
    textoAberto:
      'Estruturação de DRE de 15 linhas para Trading com segregação de receita de fee e mercadorias. Automação de Landed Cost preditivo, governança de limites para travas cambiais e stress test econômico para a transição CBS/IBS da Reforma Tributária.',
    metricaChave: 'Caso real: 15x crescimento em 5 anos e ~US$ 800M/ano movimentados',
  },
  {
    numero: '05',
    id: 'facilities',
    nome: 'Facilities e Serviços Terceirizados',
    slug: 'facilities-servicos-terceirizados',
    segmentos: [
      'Limpeza e Conservação',
      'Segurança Patrimonial',
      'Manutenção Predial e Industrial',
      'Portaria e Recepção',
      'Gestão Integrada de Facilities (IFM)',
    ],
    microEpifanias: [
      'Margem negativa oculta por horas extras e absenteísmo',
      'Passivo trabalhista invisível de escalas e intervalos',
      'Multas e glosas por quebra de SLA contratual',
      'Custo invisível do turnover na base operacional',
    ],
    textoFechado:
      'Margens esmagadas por horas extras, rotatividade de colaboradores na base, multas contratuais por postos desguarnecidos e supervisão desarticulada.',
    textoAberto:
      'Turnaround de precificação e controle de escalas em tempo real. Repactuação de aditivos de repasse salarial e implantação de governança operacional de campo, eliminando o socorro de emergência do fundador a clientes insatisfeitos.',
    metricaChave: 'Caso real: +100% de faturamento em 2 anos com expansão de filiais',
  },
  {
    numero: '06',
    id: 'industria',
    nome: 'Indústria',
    slug: 'industria',
    segmentos: ['Manufatura', 'Metalurgia', 'Alimentos', 'Químico', 'Têxtil', 'Plástico'],
    microEpifanias: [
      'Índice real de refugo na linha de produção',
      'Paradas não programadas e custo/hora de ociosidade',
      'Giro de insumos e matérias-primas críticas',
      'Equipe comercial vendendo itens com margem negativa',
    ],
    textoFechado:
      'Apagamento diário de incêndios no chão de fábrica, ociosidade de maquinário pesado e desconhecimento da margem de contribuição efetiva de cada ordem.',
    textoAberto:
      'Racionalização de PCP, alinhamento determinístico entre Comercial e Produção via S&OP e descentralização da compra de matérias-primas por limites pré-aprovados. Foco em OEE e estancamento de refugo.',
    metricaChave: 'Redução drástica de paradas de linha e alinhamento S&OP',
  },
  {
    numero: '07',
    id: 'tecnologia',
    nome: 'Tech / Startups',
    slug: 'tecnologia-startups',
    segmentos: ['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'Marketplace'],
    microEpifanias: [
      'Churn invisível corroendo o crescimento do MRR',
      'Payback estendido e CAC mascarado por canal',
      'Débito técnico consumindo mais de 30% da engenharia',
      'Concentração perigosa de receita nos 10 maiores clientes',
    ],
    textoFechado:
      'Fundador-dependência no roadmap de produto e vendas enterprise, runway ameaçado por ineficiência de aquisição e retenção abaixo da meta.',
    textoAberto:
      'Desdobramento de OKRs de produto e CS (Net Revenue Retention), governança de deploys e comitê executivo de precificação. Blindagem de runway e preparação para rodadas de capital com valuation determinístico e WACC ancorado.',
    metricaChave: 'LTV/CAC > 4:1 com Payback acelerado para menos de 12 meses',
  },
  {
    numero: '08',
    id: 'construcao',
    nome: 'Construção Civil',
    slug: 'construcao-civil',
    segmentos: ['Edificações', 'Incorporação', 'Infraestrutura', 'Reformas'],
    microEpifanias: [
      'Desperdício crônico de materiais nos canteiros',
      'Dias perdidos por retrabalho e revisões de projeto',
      'Aditivos e serviços extras executados sem cobrança',
      'Divergência sistemática entre custo orçado e realizado',
    ],
    textoFechado:
      'Engenheiros sem autonomia financeira, compras de suprimentos atrasando cronogramas críticos e orçamentos estourados na fase final da obra.',
    textoAberto:
      'Padronização de medições e Curva S em tempo real. Governança de aditivos contratuais cobrados rigorosamente e compras antecipadas com limites de alçada, blindando o fluxo de caixa do incorporador e construtor.',
    metricaChave: 'Auditoria de aditivos e alinhamento rigoroso entre orçado vs. realizado',
  },
  {
    numero: '09',
    id: 'transporte',
    nome: 'Logística / Transporte',
    slug: 'transporte-logistica',
    segmentos: ['Cargas', 'Passageiros', 'Distribuição', 'Armazenagem'],
    microEpifanias: [
      'Quilômetros rodados vazios (frete de retorno zero)',
      'Ociosidade da frota de veículos disponíveis',
      'Custo real por km rodado acima da média regional',
      'Manutenções corretivas devorando o orçamento das preventivas',
    ],
    textoFechado:
      'Quilômetros rodados vazios, custos descontrolados de diesel e pneus, falhas de visibilidade de estoque e fundador negociando frete caso a caso.',
    textoAberto:
      'Roteirização inteligente, precificação dinâmica por faixa de rota com landed cost de transporte e implantação de governança operacional de armazém (WMS), eliminando atrasos e sobretaxas contratuais.',
    metricaChave: 'Caso real: WMS implantado e +40% na eficiência de armazenagem',
  },
  {
    numero: '10',
    id: 'educacao',
    nome: 'Educação',
    slug: 'educacao',
    segmentos: ['Básica', 'Superior', 'Técnico', 'Idiomas', 'Edtech'],
    microEpifanias: [
      'Evasão de alunos silenciosa durante o semestre',
      'Vagas ociosas em turmas mantidas com custo fixo pleno',
      'Inadimplência de mensalidades sem régua de cobrança',
      'Rotatividade docente afetando a reputação pedagógica',
    ],
    textoFechado:
      'Evasão silenciosa, salas com turmas abaixo do ponto de equilíbrio, inadimplência e fundador envolvido em concessão de bolsas e descontos.',
    textoAberto:
      'Régua preditiva de retenção de alunos por turma, reestruturação da grade de alocação de docentes por margem de contribuição e automatização da esteira de matrículas e cobrança recorrente sem atritos.',
    metricaChave: 'Redução de evasão e aumento do ticket médio sem perda de matrículas',
  },
  {
    numero: '11',
    id: 'agronegocio',
    nome: 'Agronegócio',
    slug: 'agronegocio',
    segmentos: ['Grãos', 'Pecuária', 'Cana', 'Café', 'Fruticultura'],
    microEpifanias: [
      'Perda de colheita por ineficiência de maquinário',
      'Insumos aplicados sem critério de taxa variável',
      'Janelas críticas perdidas por falha de logística de escoamento',
      'Decisões de comercialização de safra centralizadas no patriarca',
    ],
    textoFechado:
      'Janelas de plantio e colheita travadas aguardando a palavra do produtor, maquinário ocioso e comercialização de commodities sem travas de margem.',
    textoAberto:
      'Comitê de planejamento de safra com indicadores padronizados de custo por hectare. Delegação com alçada para gerentes de fazenda e governança familiar para sucessão e perenidade patrimonial.',
    metricaChave: 'Alocação eficiente de insumos e proteção de margem por talhão',
  },
  {
    numero: '12',
    id: 'academias',
    nome: 'Academias de Ginástica',
    slug: 'academias-de-ginastica',
    segmentos: ['Musculação', 'Estúdio', 'CrossFit', 'Pilates', 'Natação'],
    microEpifanias: [
      'Evasão crônica nos primeiros 90 dias do aluno',
      'Horários de vale ociosos sustentando custos fixos',
      'Planos promocionais congelados ou sem margem',
      'Fundador atuando como coordenador de recepção e manutenção',
    ],
    textoFechado:
      'Alta taxa de cancelamento (churn) no 3º mês, baixa ocupação fora dos picos e fundador imerso em atritos de recepção e manutenção de esteiras.',
    textoAberto:
      'Estratégias de retenção precoce com onboarding automatizado, monetização inteligente de horários ociosos com passes flexíveis e profissionalização da gestão de equipe comercial e técnica.',
    metricaChave: 'Aumento do LTV do aluno e otimização da capacidade instalada',
  },
]
