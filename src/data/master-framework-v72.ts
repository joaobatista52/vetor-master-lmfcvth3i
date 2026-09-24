// Base de Conhecimento V7.2 — Master Framework Consolidado V2.4
// Fonte: master-framework-v24.txt (18set26)
// 8 Áreas + 6 Apêndices A-F (Buffett, Hackman, Canvas parametrizável, EREC Matrix 12 setores, Curva de Valor 12 setores, Foresight)

export interface AreaFramework {
  numero: number
  titulo: string
  fase: string
  objetivo: string
  ferramentas: string[]
  output: string
  regrasOuro: string[]
}

export const areasFrameworkV72: AreaFramework[] = [
  {
    numero: 1,
    titulo: 'Estratégia & Visão Competitiva',
    fase: 'Fase 1 — Diagnóstico Profundo + Fase 3 — Estratégia e Diferenciação',
    objetivo:
      'Mapear o mercado com precisão cirúrgica e definir um posicionamento disruptivo para capturar valor exponencial.',
    ferramentas: [
      'Business Model Canvas (As Is) — 9 blocos para identificar vazamentos de valor',
      '5 Forças de Porter (rivalidade, novos entrantes, fornecedores, clientes, substitutos)',
      'Canvas To Be (Inovação de Valor)',
      'Estratégia do Oceano Azul — Matriz EREC/ERRC e Curva de Valor para 12 setores',
    ],
    output:
      'Diagnóstico Crítico (vazamentos de valor), Mapa de Oportunidades, Novo Modelo (Canvas To Be) e Plano de Ação Imediato (Quick Wins).',
    regrasOuro: [
      'Clean Text: voz direta, assertiva e sem adjetivação desnecessária.',
      'Stress Test: ROI projetado > 30% a.a. e margem de segurança > 50%.',
      'Proibição absoluta de citação acadêmica no corpo do texto.',
    ],
  },
  {
    numero: 2,
    titulo: 'Execução e Qualidade Operacional',
    fase: 'Fase 5 — Execução e Roadmap (Regra Camaleão)',
    objetivo: 'Garantir a implementação da estratégia com excelência operacional e agilidade.',
    ferramentas: [
      'Regra Camaleão: Agile para incerteza/inovação; Waterfall/Lean para estabilidade/escala',
      'Hoshin Kanri — desdobramento vertical da estratégia em todos os níveis',
      'OKRs (Objectives and Key Results) trimestrais',
      'Rituais de Gestão: Daily (15min), Weekly (1h), Monthly Deep Dive (2-4h)',
    ],
    output:
      'Diagnóstico de Maturidade (perfil Camaleão), Matriz de OKRs Estratégicos, Calendário de Rituais e Plano de Incentivos/Meritocracia.',
    regrasOuro: [
      'Adaptar cadência à maturidade organizacional.',
      'OKRs alinhados verticalmente via Hoshin Kanri.',
    ],
  },
  {
    numero: 3,
    titulo: 'Liderança e Governança Corporativa',
    fase: 'Fase 7 — Governança e Liderança (Atualizada V2.4)',
    objetivo:
      'Estruturar liderança de alta performance, planos de sucessão e governança corporativa sólida para PMEs.',
    ferramentas: [
      'Identificação de Perfis (Tiers A/B/C)',
      'Cultura de Meritocracia e Accountability',
      'Conselho Consultivo (Etapa 1: até 5 membros, orientação ao fundador)',
      'Conselho de Administração (Etapa 2: 7 membros, mín. 50% independentes, comitês formais)',
      'Plano de Sucessão: top 10 posições, até 3 candidatos por vaga, Readiness Score',
      'Compliance e ESG com tolerância zero a desvios',
    ],
    output:
      'Diagnóstico de Liderança, Desenho de Governança em 2 Etapas, Plano de Sucessão Top 10 e Código de Conduta.',
    regrasOuro: [
      'Tolerância zero a desvios éticos ou financeiros.',
      'Readiness Score objetivo (prontidão imediata, 1-2 anos, 3-5 anos).',
    ],
  },
  {
    numero: 4,
    titulo: 'Inovação e Tecnologia (Moat)',
    fase: 'Fase 8 — Inovação e Tecnologia',
    objetivo: 'Transformar tecnologia em vantagem competitiva absoluta e fortalecimento do Moat.',
    ferramentas: [
      'Auditoria de Legados e migração Cloud otimizada',
      'BI e Cultura Data-Driven: Dashboards em tempo real',
      'IA Generativa e RAG (preservação do conhecimento institucional proprietário)',
      'Automação de Processos Cognitivos e fluxos críticos',
    ],
    output:
      'Diagnóstico de Maturidade Digital, Roadmap de Transformação Digital, Plano de IA/Automação e Análise de ROI no Moat.',
    regrasOuro: [
      'Stress Test: toda tecnologia deve ampliar o Moat ou reduzir custo marginal em > 50%.',
      'Regra Camaleão adaptada à maturidade técnica do cliente.',
    ],
  },
  {
    numero: 5,
    titulo: 'Marketing e Vendas Previsíveis',
    fase: 'Fase 5 — Execução (Máquina de Vendas)',
    objetivo: 'Construção de uma Máquina de Vendas Previsível e Escalável.',
    ferramentas: [
      'ICP (Ideal Customer Profile): 80% da receita saudável com taxa de conversão superior',
      'Pirâmide de Chet Holmes: foco estruturado em educar o mercado',
      'Operação SDR/CRM: metas diárias, funil visual de 5 estágios e SLAs rígidos',
      'Eficiência de Aquisição: LTV/CAC > 4:1 com Payback < 12 meses',
      'Upsell Estruturado: expansão contínua com meta de 30% de taxa de upsell anual',
    ],
    output: 'Receita previsível, pipeline qualificado e expansão perene de base.',
    regrasOuro: ['LTV/CAC superior a 4:1.', 'Upsell anual estruturado de 30%.'],
  },
  {
    numero: 6,
    titulo: 'Finanças, Economia e Engenharia de Valor',
    fase: 'Fase 6 — Validação Financeira e Alocação (Motor Determinístico V2.4)',
    objetivo: 'Engenharia Financeira, Proteção de Capital e Criação de Valor Intrínseco.',
    ferramentas: [
      'Motor Determinístico: DRE Projetada, Fluxo de Caixa Livre e Valuation FCD em 3 fases',
      'DRE Institucional Trading / Comércio Internacional (15 linhas obrigatórias)',
      'WACC Determinístico: Selic (13,75%) + Risco Brasil (4,50%) + Estágio (Pré-Seed 22,75%, Seed 21,75%, Série A 20,75%)',
      'OBZ (Orçamento Base Zero) e Lente de Buffett',
      'Stress test sem incentivos transitórios estaduais (preparação CBS/IBS)',
    ],
    output:
      'Capital protegido, ROIC médio superior, valuation determinístico e margem de segurança.',
    regrasOuro: [
      'Proibido projetar incentivos fiscais temporários como diferencial permanente.',
      'Margem de segurança consolidada superior a 50%.',
    ],
  },
  {
    numero: 7,
    titulo: 'Gestão de Riscos e Compliance',
    fase: 'Fase 7 — Governança (Blindagem)',
    objetivo: 'Blindagem do Moat e Perenidade do Negócio.',
    ferramentas: [
      'Matriz de Calor: Probabilidade × Impacto (mitigação de riscos vermelhos em 90 dias)',
      'Compliance Contratual: auditoria de 100% dos contratos ativos, LGPD e NDAs',
      'Protocolos de Sucessão e Acordo de Sócios',
    ],
    output: 'Moat blindado, zero incidentes materiais e mitigação antecipada de passivos.',
    regrasOuro: ['Tolerância zero a desvios éticos ou fraudes financeiras.'],
  },
  {
    numero: 8,
    titulo: 'Foresight Estratégico',
    fase: 'Fase 2 — Foresight Estratégico',
    objetivo:
      'Antecipar disrupções e transformar volatilidade em vantagem competitiva antecipatória.',
    ferramentas: [
      'Análise STEEP/PESTEL (Social, Tecnológico, Econômico, Ecológico, Político)',
      'Cone dos Futuros: Prováveis, Plausíveis, Possíveis, Preferível',
      'Roda de Futuros: impactos de 1º, 2º e 3º nível',
      'Planejamento de Cenários 2x2 e Backcasting do futuro preferível até amanhã',
      'SWOT Dinâmica e OKRs Flexíveis',
    ],
    output:
      'Cenários futuros contrastantes, indicadores de alarme antecipados e roadmap resiliente.',
    regrasOuro: ['Foresight alimenta o Planejamento via SWOT dinâmica e gatilhos acionáveis.'],
  },
]

export interface FaseStateMachine {
  numero: number
  titulo: string
  lentes: string[]
  foco: string
  output: string
}

export const fasesStateMachineV72: FaseStateMachine[] = [
  {
    numero: 1,
    titulo: 'Diagnóstico Profundo',
    lentes: ['Micro-epifanias', '5 Forças', 'Canvas As Is'],
    foco: 'Identificar a Causa Raiz e gerar micro-epifanias que libertem o fundador da operação.',
    output: 'Diagnóstico Crítico com vazamentos de valor quantificados por setor.',
  },
  {
    numero: 2,
    titulo: 'Foresight Estratégico',
    lentes: ['Prospectiva STEEP', 'Cone dos Futuros', 'Cenários 2x2'],
    foco: 'Mapear múltiplos futuros plausíveis e incertezas críticas antes de fixar a estratégia.',
    output: 'Cenários prospectivos, SWOT dinâmica e sinais de alerta precoce.',
  },
  {
    numero: 3,
    titulo: 'Estratégia e Diferenciação',
    lentes: ['Oceano Azul', 'Matriz EREC 12 Setores', 'Canvas To Be'],
    foco: 'Definir tese de diferenciação sustentável e capturar oceano azul setorial.',
    output: 'Novo modelo de negócio inovador com curva de valor superior.',
  },
  {
    numero: 4,
    titulo: 'Capacidade e Design Organizacional',
    lentes: ['Lente de Hackman (5 Condições)', 'Mapeamento de Tiers A/B/C'],
    foco: 'Validar se a equipe real e a estrutura facilitadora suportam a ambição executiva.',
    output: 'Diagnóstico de maturidade organizacional, índice de autonomia e PDI.',
  },
  {
    numero: 5,
    titulo: 'Execução e Roadmap',
    lentes: ['Regra Camaleão', '5W2H', 'OKRs Hoshin Kanri'],
    foco: 'Ritmo de execução disciplinado com cadência de rituais e planos acionáveis.',
    output: 'Roadmap faseado (Curto, Médio, Longo prazo) com metas trimestrais.',
  },
  {
    numero: 6,
    titulo: 'Validação Financeira e Alocação',
    lentes: ['Lente de Buffett', 'Motor Determinístico V2.4', 'Valuation FCD'],
    foco: 'Stress Test econômico, cálculo de WACC por estágio e margem de segurança > 50%.',
    output: 'Valuation determinístico, sensibilidade de cenários e fluxo de caixa livre.',
  },
  {
    numero: 7,
    titulo: 'Governança e Liderança',
    lentes: ['Governança PME em 2 Etapas', 'Sucessão Top 10', 'Compliance'],
    foco: 'Estruturação de Conselho (Consultivo → Administração) e prontidão sucessória.',
    output: 'Código de Conduta, rituais de conselho e protocolo de sucessão.',
  },
  {
    numero: 8,
    titulo: 'Inovação e Tecnologia',
    lentes: ['Transformação Digital', 'IA & RAG', 'Construção de Moat'],
    foco: 'Converter tecnologia em barreira de entrada intransponível e escala perene.',
    output: 'Roadmap de inteligência artificial, automação cognitiva e proteção de margem.',
  },
]

export const escadaDeValorV72 = [
  {
    nivel: 'SaaS Puro',
    nome: 'SaaS Puro',
    preco: 'R$ 1.190,00/mês',
    adicionais: '—',
    descricao:
      'Consultor digital em autosserviço total; tarefas executáveis simplificadas e diagnósticos contínuos.',
  },
  {
    nivel: 'MaaS Híbrido',
    nome: 'MaaS Híbrido',
    preco: 'R$ 3.290,00/mês',
    adicionais: '+ R$ 890,00/reunião extra (90 min)',
    descricao:
      'Tudo do SaaS + profundidade metodológica + 2 reuniões virtuais de 90 min/mês com Consultor Executivo.',
  },
  {
    nivel: 'Bespoke CaaS',
    nome: 'Bespoke CaaS',
    preco: 'R$ 15.750,00/mês',
    adicionais: '+ R$ 790,00/hora adicional',
    descricao:
      'Tudo do MaaS + 12 h/mês presenciais com Consultor Executivo para turnaround, sucessão ou M&A.',
  },
]
