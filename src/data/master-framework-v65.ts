// Base de Conhecimento V6.5 — Master Framework Consolidado V2.0
// Fonte: masterframework-consolidadov2.0 (05ago26)
// 8 Áreas + 6 Apêndices (Buffett, Hackman, Canvas parametrizável, EREC Matrix, Curva de Valor, Foresight)

export interface AreaFramework {
  numero: number
  titulo: string
  fase: string
  objetivo: string
  ferramentas: string[]
  output: string
  regrasOuro: string[]
}

export const areasFrameworkV65: AreaFramework[] = [
  {
    numero: 1,
    titulo: 'Estratégia',
    fase: 'Fase 1 — Diagnóstico Profundo + Fase 3 — Estratégia e Diferenciação',
    objetivo:
      'Mapear o mercado com precisão cirúrgica e definir um posicionamento disruptivo para capturar valor exponencial.',
    ferramentas: [
      'Business Model Canvas (As Is) — 9 blocos para identificar vazamentos de valor',
      '5 Forças (rivalidade, novos entrantes, fornecedores, clientes, substitutos)',
      'Canvas To Be (Inovação de Valor)',
      'Estratégia do Oceano Azul — Matriz ERRC e Curva de Valor',
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
    titulo: 'Execução e Qualidade',
    fase: 'Fase 5 — Execução e Roadmap (Regra Camaleão)',
    objetivo: 'Garantir a implementação da estratégia com excelência operacional e agilidade.',
    ferramentas: [
      'Regra Camaleão: Agile para incerteza/inovação; Waterfall/Lean para estabilidade/escala',
      'Hoshin Kanri — desdobramento vertical da estratégia',
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
    titulo: 'Liderança e Governança',
    fase: 'Fase 7 — Governança e Liderança',
    objetivo:
      'Estruturar liderança de alta performance, planos de sucessão e governança corporativa sólida.',
    ferramentas: [
      'Identificação de Perfis (Tiers A/B/C)',
      'Cultura de Meritocracia e Accountability',
      'Conselho Consultivo (5-7 membros) e Conselho de Administração (7-9, mín. 50% independentes)',
      'Plano de Sucessão: top 10 posições, 3 candidatos por vaga, readiness score',
      'Compliance e ESG',
    ],
    output:
      'Diagnóstico de Liderança, Desenho da Estrutura de Governança, Plano de Sucessão/Transição e Código de Conduta e Rituais de Conselho.',
    regrasOuro: [
      'Tolerância zero a desvios éticos ou financeiros.',
      'Shadow leadership trimestral para sucessores.',
    ],
  },
  {
    numero: 4,
    titulo: 'Inovação e Tecnologia',
    fase: 'Fase 8 — Inovação e Tecnologia',
    objetivo: 'Transformar tecnologia em vantagem competitiva absoluta (Moat).',
    ferramentas: [
      'Auditoria de Legados e migração Cloud',
      'Cultura Data-Driven: BI e Dashboards em tempo real',
      'IA Generativa e RAG (preservação do conhecimento institucional)',
      'Automação de Processos Cognitivos',
    ],
    output:
      'Diagnóstico de Maturidade Tecnológica, Roadmap de Transformação Digital, Plano de IA/Automação e Análise de ROI e Impacto no Moat.',
    regrasOuro: [
      'Stress Test: toda tecnologia deve ampliar o Moat ou reduzir custo marginal em > 50%.',
      'Regra Camaleão: adaptar tecnologia ao nível de maturidade do cliente.',
    ],
  },
  {
    numero: 5,
    titulo: 'Marketing e Vendas',
    fase: 'Fase 5 — Execução (máquina de vendas)',
    objetivo: 'Construção de uma Máquina de Vendas Previsível.',
    ferramentas: [
      'ICP (Ideal Customer Profile): 80% da receita com win-rate > 70%',
      'Pirâmide de Chet Holmes: 60% dos esforços no topo do funil',
      'SDR/CRM: 100 contatos/dia por SDR; pipeline 5 estágios',
      'LTV/CAC > 4:1; upsell estruturado (M1 Onboarding, M3 Expansão, M6 Premium)',
    ],
    output: 'Receita previsível com variação mensal inferior a 10%.',
    regrasOuro: ['Upsell rate anual meta 30%.', 'Otimização constante via inbound e upsell.'],
  },
  {
    numero: 6,
    titulo: 'Finanças e Economia',
    fase: 'Fase 6 — Validação Financeira e Alocação (Motor Determinístico)',
    objetivo: 'Engenharia Financeira e Proteção de Capital.',
    ferramentas: [
      'Motor Determinístico: DRE Projetada, Fluxo de Caixa, Valuation FCD + Gordon (desaceleração linear)',
      'WACC = Selic + Risco Brasil + Risco Startup (fixo 13,75% em 2026)',
      'OBZ (Orçamento Base Zero): corte de 20% a.a. em custos que não impactam EBITDA',
      'Alocação de Capital: projetos aprovados apenas com IRR > WACC + 10%',
    ],
    output: 'Capital protegido, ROIC médio 18%+, valuation 3x superior em 24 meses.',
    regrasOuro: [
      'Valuation DCF com atualização trimestral obrigatória.',
      'OPEX é SEMPRE SG&A + P&D/R&D + Outros Custos Diretos.',
    ],
  },
  {
    numero: 7,
    titulo: 'Gestão de Riscos e Compliance',
    fase: 'Fase 7 — Governança (blindagem)',
    objetivo: 'Blindagem do Moat e Perenidade.',
    ferramentas: [
      'Matriz de Calor: Probabilidade × Impacto; mitigação de riscos vermelhos em 90 dias',
      'Compliance Jurídico: auditoria de 100% dos contratos/ano; LGPD, NDAs, cláusulas penais',
      'Sucessão: 2 sucessores internos por posição do Top 10; shadow leadership trimestral',
    ],
    output: 'Moat blindado, zero incidentes materiais, perenidade projetada para 10+ anos.',
    regrasOuro: ['Tolerância zero a desvios éticos ou financeiros.'],
  },
  {
    numero: 8,
    titulo: 'Foresight Estratégico',
    fase: 'Fase 2 — Foresight Estratégico',
    objetivo:
      'Preparar a organização para lidar com volatilidade e incerteza, criando vantagem antecipatória.',
    ferramentas: [
      'Análise STEEP/PESTEL (Social, Tecnológico, Econômico, Ecológico, Político)',
      'Cone dos Futuros: Prováveis, Plausíveis, Possíveis, Preferível',
      'Roda de Futuros: impactos de 1º, 2º e 3º nível',
      'Planejamento de Cenários 2x2 (duas maiores incertezas críticas)',
      'Backcasting: do Futuro Preferível recuando até a primeira tarefa de amanhã',
      'Early Warning Signals e OKRs Flexíveis',
    ],
    output:
      '2-4 cenários futuros contrastantes, SWOT dinâmica alimentada pelos cenários, indicadores de alarme antecipados.',
    regrasOuro: [
      'Integração: Foresight alimenta o Planejamento Estratégico via SWOT dinâmica e OKRs flexíveis.',
      'OKRs calibrados pelos cenários de Foresight.',
    ],
  },
]

// --- Apêndices ---

export const appendicesV65 = [
  {
    codigo: 'A',
    titulo: 'Lente de Buffett Aplicada',
    prioridade: 3,
    descricao:
      'Checklist Operacional de Decisão para a Fase 6. Transforma thresholds do Motor Determinístico em ações concretas.',
    thresholds: [
      { indicador: 'Margem EBITDA', saudavel: '>30%', alerta: '20-30%', critico: '<20%' },
      {
        indicador: 'ROIC vs WACC',
        saudavel: '> WACC +5%',
        alerta: 'WACC a +5%',
        critico: '< WACC',
      },
      {
        indicador: 'Dívida Líquida / EBITDA',
        saudavel: '<2,0x',
        alerta: '2,0-3,0x',
        critico: '>3,0x',
      },
      { indicador: 'Margem de Segurança', saudavel: '>50%', alerta: '30-50%', critico: '<30%' },
      { indicador: 'LTV / CAC', saudavel: '>4:1', alerta: '3:1 a 4:1', critico: '<3:1' },
      {
        indicador: 'Geração de Caixa Livre',
        saudavel: 'FCF > 0 em Y2',
        alerta: 'FCF > 0 em Y3',
        critico: 'FCF negativo em Y3+',
      },
      { indicador: 'ROE', saudavel: '>20%', alerta: '12-20%', critico: '<12%' },
    ],
    stressTest: [
      'Gera retorno superior a WACC + 5%?',
      'Amplia ou protege o Moat?',
      'Mantém Margem de Segurança consolidada acima de 50%?',
    ],
  },
  {
    codigo: 'B',
    titulo: 'Lente de Hackman Detalhada',
    prioridade: 4,
    descricao:
      '5 condições de Hackman como ferramentas operacionais para a Fase 4 (Capacidade e Design Organizacional).',
    condicoes: [
      { condicao: 'Time Real', kpi: 'Índice de Interdependência', meta: '>70% colaboração' },
      { condicao: 'Direção Convincente', kpi: 'Clareza de Direção', meta: '>80% alinhamento' },
      { condicao: 'Estrutura Facilitadora', kpi: 'Tempo de Decisão', meta: '<30 dias' },
      { condicao: 'Contexto de Suporte', kpi: 'Índice de Recursos', meta: '>75% satisfação' },
      {
        condicao: 'Coaching Especializado',
        kpi: 'Frequência de Feedback',
        meta: '≥1 sessão 1:1/mês',
      },
    ],
    tiers: [
      { tier: 'A', perfil: 'Alta Performance — liderança e visão estratégica' },
      { tier: 'B', perfil: 'Potencial — execução, desenvolver via coaching/PDI' },
      { tier: 'C', perfil: 'Gap — desenvolvimento intensivo ou reposição em 90 dias' },
    ],
  },
  {
    codigo: 'C',
    titulo: 'Canvas Parametrizável por Porte',
    prioridade: 5,
    descricao:
      'Variações do Business Model Canvas para PME, Média e Grande empresa, aplicáveis nas Fases 1 (As Is) e 3 (To Be).',
    portes: [
      {
        porte: 'PME',
        faturamento: 'até R$ 5 mi/ano',
        vazamentoDominante: 'Prisão do Fundador',
        lentePrioritaria: 'Fase 1 Micro-epifanias',
      },
      {
        porte: 'Média',
        faturamento: 'R$ 5 a R$ 50 mi/ano',
        vazamentoDominante: 'Ineficiência Invisível',
        lentePrioritaria: 'Fase 1 + Fase 6 Buffett',
      },
      {
        porte: 'Grande',
        faturamento: 'acima de R$ 50 mi/ano',
        vazamentoDominante: 'Abismo Estratégia vs. Execução',
        lentePrioritaria: 'Fase 4 Hackman + Fase 7',
      },
    ],
  },
  {
    codigo: 'D',
    titulo: 'EREC Matrix Expandida (10 setores)',
    prioridade: 6,
    descricao:
      'Matriz ERRC (Eliminar, Reduzir, Elevar, Criar) aplicada por setor — ferramenta central da Fase 3 (Oceano Azul).',
    setores: [
      {
        setor: 'Saúde',
        eliminar: 'Burocracia manual, glosas não auditadas',
        reduzir: 'Tempo de espera, custo de insumos',
        elevar: 'Taxa de ocupação, precisão de faturamento',
        criar: 'Telemedicina, gestão preditiva',
      },
      {
        setor: 'Serviços',
        eliminar: 'Horas não cobradas, reuniões inúteis',
        reduzir: 'Tarefas adm, dependência do sócio',
        elevar: 'Margem por cliente, padronização',
        criar: 'Precificação por valor, automação',
      },
      {
        setor: 'Indústria',
        eliminar: 'Refugo, paradas não programadas',
        reduzir: 'Giro de estoque lento, ociosidade',
        elevar: 'OEE, previsibilidade de entrega',
        criar: 'Manutenção preditiva, IoT',
      },
      {
        setor: 'Varejo',
        eliminar: 'Ruptura de estoque, quebra/perda',
        reduzir: 'Devoluções, estoque parado',
        elevar: 'Ticket médio, giro de estoque',
        criar: 'Precificação dinâmica, CRM fidelidade',
      },
      {
        setor: 'Agro',
        eliminar: 'Perda na colheita, ociosidade frota',
        reduzir: 'Custo por hectare, desperdício',
        elevar: 'Produtividade por talhão, margem',
        criar: 'Agricultura de precisão, rastreio',
      },
      {
        setor: 'Tech',
        eliminar: 'Débito técnico, churn descontrolado',
        reduzir: 'CAC, tempo de onboarding',
        elevar: 'NRR, LTV/CAC, ativação',
        criar: 'IA Generativa no produto, RAG',
      },
      {
        setor: 'Construção',
        eliminar: 'Desperdício de materiais, retrabalho',
        reduzir: 'Horas ociosas, atraso cronograma',
        elevar: 'Margem por obra, precisão orçado',
        criar: 'BIM, dashboards em tempo real',
      },
      {
        setor: 'Logística',
        eliminar: 'Km vazios, manutenção corretiva',
        reduzir: 'Custo por km, avarias/perdas',
        elevar: 'Entregas no prazo, uso da frota',
        criar: 'Roteirização por IA, telemetria',
      },
      {
        setor: 'Educação',
        eliminar: 'Evasão, vagas ociosas',
        reduzir: 'Inadimplência, custo aquisição',
        elevar: 'Retenção por turma, margem curso',
        criar: 'IA para ensino personalizado',
      },
      {
        setor: 'Academias',
        eliminar: 'Churn, capacidade ociosa',
        reduzir: 'Inadimplência, CAC por aluno',
        elevar: 'Retenção, ocupação de pico',
        criar: 'App próprio, IA para treinos',
      },
    ],
  },
  {
    codigo: 'E',
    titulo: 'Curva de Valor Competitiva',
    prioridade: 7,
    descricao:
      'Posicionamento do JBP Gestão Master entre Big Four (caras e lentas) e IAs Genéricas (rápidas, mas superficiais).',
    fatoresCompetitivos: [
      'Precisão do Diagnóstico',
      'Velocidade de Entrega',
      'Custo do Serviço',
      'Profundidade Estratégica',
      'Personalização por Setor',
      'Acompanhamento Contínuo (MaaS)',
      'Previsibilidade de Resultados',
    ],
  },
  {
    codigo: 'F',
    titulo: 'Foresight Estratégico',
    prioridade: 8,
    descricao:
      'Ferramentas de prospectiva: STEEP/PESTEL, Cone dos Futuros, Roda de Futuros, Cenários 2x2, Backcasting.',
    fluxoIntegracao:
      '[FORESIGHT] STEEP/PESTEL → Cone dos Futuros → Cenários (2x2) → Backcasting → [PLANEJAMENTO] SWOT Dinâmica → OKRs Flexíveis → Roadmap com Gatilhos',
  },
]

// --- 8 Fases da State Machine Unificada ---

export interface FaseStateMachine {
  numero: number
  titulo: string
  lentes: string[]
  foco: string
  output: string
}

export const fasesStateMachineV65: FaseStateMachine[] = [
  {
    numero: 1,
    titulo: 'Diagnóstico Profundo',
    lentes: ['Micro-epifanias', '5 Forças', 'Canvas As Is'],
    foco: 'Identificar a Causa Raiz e gerar Micro-epifanias que elevem a consciência do cliente.',
    output: 'Diagnóstico Crítico com vazamentos de valor quantificados.',
  },
  {
    numero: 2,
    titulo: 'Foresight Estratégico',
    lentes: ['Prospectiva'],
    foco: 'Mapear múltiplos futuros plausíveis antes de definir a estratégia.',
    output: '2-4 cenários futuros, SWOT dinâmica, early warning signals.',
  },
  {
    numero: 3,
    titulo: 'Estratégia e Diferenciação',
    lentes: ['Oceano Azul', 'Canvas To Be', 'OKRs'],
    foco: 'Definir a Tese de Mudança e metas claras de valor.',
    output: 'Novo modelo de negócio com posicionamento disruptivo e metas trimestrais.',
  },
  {
    numero: 4,
    titulo: 'Capacidade e Design Organizacional',
    lentes: ['Hackman'],
    foco: 'Validar se a Equipe Real e a Estrutura Facilitadora suportam a estratégia.',
    output: 'Diagnóstico de maturidade do time + plano de gaps.',
  },
  {
    numero: 5,
    titulo: 'Execução e Roadmap',
    lentes: ['Regra Camaleão'],
    foco: 'Definir o ritmo de execução conforme a maturidade organizacional.',
    output: 'Roadmap faseado (Curto, Médio, Longo prazo) + matriz de OKRs.',
  },
  {
    numero: 6,
    titulo: 'Validação Financeira e Alocação',
    lentes: ['Buffett', 'Motor Determinístico'],
    foco: 'Stress Test do plano, garantindo a Margem de Segurança.',
    output: 'Equity Value, Análise de Sensibilidade (3 cenários), Margem de Segurança.',
  },
  {
    numero: 7,
    titulo: 'Governança e Liderança',
    lentes: ['Governança'],
    foco: 'Estruturar liderança de alta performance, sucessão e governança corporativa.',
    output: 'Código de Conduta, Rituais de Conselho, Plano de Sucessão top 10.',
  },
  {
    numero: 8,
    titulo: 'Inovação e Tecnologia',
    lentes: ['Transformação Digital'],
    foco: 'Transformar tecnologia em vantagem competitiva e barreira de entrada.',
    output: 'Roadmap de Transformação Digital, ROI por iniciativa, impacto no Moat.',
  },
]

// --- Motor Determinístico de Cálculo Financeiro ---

export const motorDeterministicoV65 = {
  wacc: {
    formula: 'WACC = Selic (RF) + Prêmio Risco Brasil + Prêmio Risco Startup',
    selic2026: '13,75% a.a.',
    premioRiscoStartup: { preSeed: '4,50%', seed: '3,50%', serieA: '2,50%' },
  },
  dre: [
    'Receita Bruta = Base Y1 × (1 + g)',
    'Deduções = Receita Bruta × % Deduções',
    'Receita Líquida = Receita Bruta - Deduções',
    'CPV = Receita Líquida × % CPV',
    'Margem Bruta = Receita Líquida - CPV',
    'Custos Variáveis = Receita Líquida × % (cartão + comissões)',
    'Margem de Contribuição = Margem Bruta - Custos Variáveis',
    'OPEX Total = SG&A + P&D/R&D + Outros Custos Diretos',
    'EBITDA = Margem de Contribuição - OPEX Total',
    'EBIT = EBITDA - D&A',
    'EBT = EBIT ± Resultado Financeiro Líquido',
    'Lucro Líquido = EBT - IR/CSLL',
  ],
  fluxoCaixa: 'EBITDA → IR/CSLL → CAPEX → Δ Capital de Giro → FCF',
  valuation: {
    faseExplicita: 'Y1-Y5: PV(FCF_n) = FCF_n / (1 + WACC)^n',
    faseTransicao: 'Y6-Y9: g decrescente linearmente até 5%',
    perpetuidade: 'Y10+: Terminal Value = FCF_Y10 × (1 + g_perp) / (WACC - g_perp)',
    margemSeguranca: 'Margem de Segurança = (Equity Value - Valuation Cap) / Equity Value',
  },
}

// --- Escada de Valor ---

export const escadaDeValor = [
  {
    nivel: 'MaaS',
    nome: 'Management as a Service',
    descricao: 'Assinatura mensal para diagnóstico e monitoramento contínuo de KPIs.',
  },
  {
    nivel: 'Híbrido',
    nome: 'Híbrido',
    descricao:
      'Consultoria estratégica pontual combinada com licenciamento da plataforma de gestão.',
  },
  {
    nivel: 'CaaS',
    nome: 'Consulting as a Service',
    descricao: 'Projetos de alta complexidade (M&A, Turnaround, Reestruturação) com Success Fee.',
  },
]
