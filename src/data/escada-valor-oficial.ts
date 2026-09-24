// Escada de Valor Oficial — Vetor Master V1.3 (Seção 8.3 do Documento de Alinhamento)
// Precificação oficial:
// SaaS Puro: R$ 1.190,00/mês
// MaaS Híbrido: R$ 3.290,00/mês (+ R$ 890,00/reunião extra de 90 min)
// Bespoke CaaS: R$ 15.750,00/mês (12 h/mês presenciais) + R$ 790,00/hora adicional

export interface NivelEscadaValor {
  id: string
  nivel: string
  nome: string
  subtitulo: string
  preco: string
  periodo: string
  valorNumerico: number
  incluso: string
  adicionais: string
  itens: string[]
  destaque?: boolean
  badge?: string
  ctaText: string
}

export const ESCADA_DE_VALOR_OFICIAL: NivelEscadaValor[] = [
  {
    id: 'saas-puro',
    nivel: 'Nível 1',
    nome: 'SaaS Puro',
    subtitulo: 'Consultor Digital em Autosserviço Total',
    preco: 'R$ 1.190,00',
    periodo: '/mês',
    valorNumerico: 1190,
    incluso: 'Consultor digital em autosserviço total; tarefas executáveis simplificadas.',
    adicionais: '—',
    destaque: false,
    badge: 'Autosserviço',
    ctaText: 'Iniciar com SaaS Puro',
    itens: [
      'Acesso contínuo ao Consultor Digital V7.2 em autosserviço',
      'Diagnósticos estratégicos determinísticos com SLA 72h',
      'Heat Map de criticalidade nas 8 áreas da empresa',
      'Tarefas executáveis simplificadas e desdobramento 5W2H',
      'Dashboards executivos de indicadores e acompanhamento',
      'Acesso à base curada de micro-lições por setor',
    ],
  },
  {
    id: 'maas-hibrido',
    nivel: 'Nível 2',
    nome: 'MaaS Híbrido',
    subtitulo: 'Software + Direção Consultiva C-Level',
    preco: 'R$ 3.290,00',
    periodo: '/mês',
    valorNumerico: 3290,
    incluso:
      'Tudo do SaaS + profundidade metodológica + 2 reuniões virtuais de 90 min/mês com Consultor Executivo.',
    adicionais: '+ R$ 890,00 / reunião virtual extra de 90 min',
    destaque: true,
    badge: 'Mais Recomendado',
    ctaText: 'Escolher MaaS Híbrido',
    itens: [
      'Tudo incluso no SaaS Puro com profundidade analítica total',
      '2 reuniões virtuais estratégicas de 90 min/mês com Consultor Executivo',
      'Auditoria de vazamentos invisíveis e validação de alavancas de margem',
      'Desdobramento de OKRs corporativos e setoriais (Hoshin Kanri)',
      'Stress test financeiro e validação de cenários de curto e médio prazo',
      'Reunião extra disponível por R$ 890,00 / sessão de 90 min',
    ],
  },
  {
    id: 'bespoke-caas',
    nivel: 'Nível 3',
    nome: 'Bespoke CaaS',
    subtitulo: 'Consulting as a Service Presencial de Alta Complexidade',
    preco: 'R$ 15.750,00',
    periodo: '/mês',
    valorNumerico: 15750,
    incluso: 'Tudo do MaaS + 12 h/mês presenciais com Consultor Executivo Sênior dedicado.',
    adicionais: '+ R$ 790,00 / hora presencial adicional',
    destaque: false,
    badge: 'Enterprise C-Level',
    ctaText: 'Solicitar Bespoke CaaS',
    itens: [
      'Tudo incluso no MaaS Híbrido com governança executiva dedicada',
      '12 horas/mês de intervenção presencial com Consultor Executivo',
      'Estruturação de Conselho Consultivo ou de Administração',
      'Valuation FCD determinístico e preparação para captação ou M&A',
      'Reestruturação societária, plano de sucessão e compliance executivo',
      'Horas adicionais disponíveis por R$ 790,00 / hora',
    ],
  },
]
