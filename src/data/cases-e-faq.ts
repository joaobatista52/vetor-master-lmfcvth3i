// Cases Reais e Faixa de Autoridade — Vetor Master V1.3
// Fonte: Seção 8.4 do Documento de Alinhamento Visual V1.3 (24/09/2026)

export interface CaseReal {
  empresa: string
  setor: string
  dor: string
  intervencao: string
  resultado: string
  destaque?: string
}

export const CASES_REAIS_OFICIAIS: CaseReal[] = [
  {
    empresa: 'Sab Company',
    setor: 'Comércio Internacional / Trading',
    dor: 'Dependência estrutural do fundador e escala limitada de operações',
    intervencao:
      'C-Level as a Service + estruturação fiscal/M&A, Governança Corporativa e limites de alçada',
    resultado:
      '15x crescimento em 5 anos; ~US$ 800M/ano; GPTW Top 150 Brasil; entre as 10 maiores tradings do país; Escola de Negócios própria',
    destaque: '15x crescimento em 5 anos · ~US$ 800M/ano',
  },
  {
    empresa: 'DGT',
    setor: 'Logística',
    dor: 'Sem visibilidade de estoque/armazém e sobrecustos operacionais',
    intervencao: 'Projeto WMS + governança operacional e SLA de atendimento',
    resultado:
      'WMS implantado; rastreabilidade de ponta a ponta; +40% de eficiência operacional no armazém',
    destaque: '+40% de eficiência de armazém com WMS',
  },
  {
    empresa: 'OtorrinoDF',
    setor: 'TI / Saúde',
    dor: 'Escala e governança clínica frágeis para plano de expansão',
    intervencao:
      'M&A / Hospital Dia + estruturação estratégica e operacional com protocolos autônomos',
    resultado:
      '-70% nas glosas de convênios; +40% na taxa de ocupação; expansão via Hospital Dia; ampliação e consolidação via M&A',
    destaque: '-70% em glosas · +40% taxa de ocupação',
  },
  {
    empresa: 'APC',
    setor: 'Facilities',
    dor: 'Margem apertada em contratos e gestão descentralizada precária',
    intervencao:
      'Turnaround operacional + readequação de precificação, compliance de escalas e Governança',
    resultado:
      '+100% de faturamento em 2 anos; abertura de filiais regionais e conquista de novos mercados corporativos',
    destaque: '+100% de faturamento em 2 anos',
  },
]

export interface FaixaAutoridadeItem {
  nome: string
  credencial: string
}

export const FAIXA_AUTORIDADE_OFICIAL: FaixaAutoridadeItem[] = [
  {
    nome: 'Sainte Marie',
    credencial: '+35% de receitas via Planejamento Estratégico/BSC e Governança',
  },
  {
    nome: 'Gocil',
    credencial: 'Inovação e Tecnologia; OKRs + Oceano Azul',
  },
  {
    nome: 'Mannesmann / Acesita / Coimex',
    credencial: 'Governança e Sucessão Familiar; 12x receita em 8 anos',
  },
  {
    nome: 'Huawei',
    credencial: 'Planejamento tributário/fiscal em importações e logística internacional',
  },
]

export interface FAQItem {
  pergunta: string
  resposta: string
  categoria?: string
}

export const FAQ_OFICIAL_V13: FAQItem[] = [
  {
    pergunta: 'O que é o modelo C-Level as a Service & Mentorship as a Software?',
    resposta:
      'É a união entre a sabedoria executiva de mais de 40 anos de liderança e algoritmos determinísticos proprietários. Sua empresa recebe a profundidade analítica de um comitê C-Level com velocidade tecnológica e custo de SaaS, sem depender de honorários de consultorias tradicionais.',
    categoria: 'Modelo',
  },
  {
    pergunta: 'Por que o Vetor Master é estritamente determinístico e sem alucinação?',
    resposta:
      'Diferente de IAs generativas abertas que inventam respostas plausíveis, nosso motor opera sobre uma State Machine de 8 fases com limiares matemáticos estritos (Lente de Buffett, Hackman, Matriz ERRC e 138 obras catalogadas). Cada número, diagnóstico e plano deriva de dados reais inseridos pela sua organização.',
    categoria: 'Tecnologia',
  },
  {
    pergunta: 'Qual é o SLA para entrega do diagnóstico após o preenchimento?',
    resposta:
      'O primeiro diagnóstico estrutural gratuito e o Heat Map de 8 áreas são gerados em até 72 horas úteis, com leitura profunda dos 3 pilares fundamentais da empresa.',
    categoria: 'Entrega',
  },
  {
    pergunta: 'Como funciona o diagnóstico gratuito da Camada de Conversão?',
    resposta:
      'O diagnóstico é 100% gratuito e não exige cartão de crédito. Você preenche a identificação do lead, seleciona seu setor dentre os 12 disponíveis e responde ao questionário específico. A plataforma entrega o Heat Map das 8 áreas e a Devolutiva Executiva com as causas-raiz identificadas.',
    categoria: 'Diagnóstico',
  },
  {
    pergunta: 'Qual a diferença entre o SaaS Puro, MaaS Híbrido e Bespoke CaaS?',
    resposta:
      'O SaaS Puro (R$ 1.190,00/mês) oferece autosserviço completo com Consultor Digital e planos executáveis simplificados. O MaaS Híbrido (R$ 3.290,00/mês) adiciona 2 reuniões virtuais de 90 min com consultores executivos e profundidade metodológica. O Bespoke CaaS (R$ 15.750,00/mês) é voltado a M&A, turnaround e sucessão, incluindo 12h/mês de imersão presencial.',
    categoria: 'Planos',
  },
  {
    pergunta: 'Posso migrar de plano ou contratar reuniões extras conforme a necessidade?',
    resposta:
      'Sim. Clientes do MaaS Híbrido podem contratar reuniões virtuais extras de 90 min por R$ 890,00 cada, e o Bespoke CaaS permite horas adicionais a R$ 790,00/hora. Não há fidelidade leonina; você escala a mentoria no ritmo do seu crescimento.',
    categoria: 'Planos',
  },
  {
    pergunta: 'Os 12 setores já possuem questionários e micro-epifanias calibradas?',
    resposta:
      'Sim. Cobrimos Saúde, Varejo, Serviços Profissionais, Comércio Internacional / Trading, Facilities, Indústria, Tech/Startups, Construção Civil, Logística/Transporte, Educação, Agronegócio e Academias. Cada setor possui perguntas específicas sobre as dores ocultas de seu segmento.',
    categoria: 'Setores',
  },
]
