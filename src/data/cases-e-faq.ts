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
    setor: 'Comércio Internacional – Trading',
    dor: 'Dependência estrutural e escala limitada',
    intervencao: 'C-Level as a Service + estruturação fiscal/M&A, Governança Corporativa',
    resultado:
      '15x crescimento em 5 anos; ~US$ 800M/ano; GPTW Top 150 Brasil; entre as 10 maiores tradings; Escola de Negócios.',
    destaque: '15x em 5 anos',
  },
  {
    empresa: 'Grupo União Autopeças (Atacarejo União)',
    setor: 'Varejo e Logística (distribuição de autopeças)',
    dor: 'Dificuldades com processos e critérios de registros no ERP, e-commerce, falta de processos/sistemas no armazém',
    intervencao:
      'Reestruturação do ERP, Projeto WMS + Governança Operacional, Mapeamento de Processos (BPMN)',
    resultado: 'WMS implantado, ERP reestruturado, ganho de 30% na eficiência de distribuição',
    destaque: '+30% eficiência de distribuição',
  },
  {
    empresa: 'OtorrinoDF',
    setor: 'Saúde',
    dor: 'Escala e governança para expansão',
    intervencao: 'M&A/Hospital Dia + estruturação estratégica e operacional',
    resultado:
      '−70% nas glosas; +40% taxa de ocupação; expansão via Hospital Dia; ampliação e M&A.',
    destaque: '−70% glosas',
  },
  {
    empresa: 'APC',
    setor: 'Facilities',
    dor: 'Margem apertada e gestão de contratos',
    intervencao: 'Turnaround operacional + precificação e Governança',
    resultado: '+100% de faturamento em 2 anos; abertura de filiais e novos mercados.',
    destaque: '+100% faturamento',
  },
]

export interface FaixaAutoridadeItem {
  nome: string
  credencial: string
}

export const FAIXA_AUTORIDADE_OFICIAL: FaixaAutoridadeItem[] = [
  {
    nome: 'Coimex/Cisa Trading',
    credencial:
      'M&A, Turnaround, Planejamento Estratégico; Governança e Sucessão Familiar; 12x receita em 8 anos',
  },
  {
    nome: 'Sainte Marie Trading',
    credencial: '+35% Receitas via Planejamento Estratégico/BSC e Governança',
  },
  {
    nome: 'Gocil Facilities e Segurança',
    credencial:
      'Inovação e Tecnologia; OKRs + Oceano Azul; Planejamento Estratégico e Inovação de Valor (Venda de SLA e não de homem/hora)',
  },
  {
    nome: 'Huawei do Brasil',
    credencial:
      'Estruturação de operações de importação no Brasil, Planejamento tributário/fiscal em importações, Logística internacional, Interface com escritórios de advocacia',
  },
  {
    nome: 'Mannesmann/Acesita',
    credencial:
      'Planejamento Estratégico, Turnaround, Contabilidade Gerencial e Reestruturação Financeira de Filiais',
  },
  {
    nome: 'Lorenzetti S/A',
    credencial:
      'Implantação de ERP e Gestão Industrial, Planejamento Estratégico, Growth Marketing, Implantação de Processos (BPMN), Sucessão Familiar',
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
