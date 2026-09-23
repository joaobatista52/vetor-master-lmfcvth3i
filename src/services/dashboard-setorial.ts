// Definições setoriais determinísticas para a tela de Dashboard (Vetor Master V7.2)
// Alinhado ao Contexto Estratégico Global 12 Setores e Questionários Consolidados V7.2

export type StatusIndicador = 'saudavel' | 'atencao' | 'critico'

export interface IndicadorSetorial {
  id: string
  label: string
  valor: string
  meta?: string
  status: StatusIndicador
  tendencia?: 'up' | 'down' | 'stable'
  descricao: string
  autoDeclarado: boolean
}

export interface GargaloImpacto {
  titulo: string
  pilar:
    | 'Pilar 1 — Prisão do Fundador'
    | 'Pilar 2 — Ineficiência Invisível'
    | 'Pilar 3 — Abismo Estratégia vs. Execução'
  severidade: 'critico' | 'atencao' | 'moderado'
  impactoEstimado: string
  acaoRecomendada: string
}

export interface SetorDashboardConfig {
  slug: string
  nome: string
  indicadoresPadrao: IndicadorSetorial[]
  microEpifanias: string[]
  gargalosTipicos: GargaloImpacto[]
}

export const SETORES_DASHBOARD_CONFIG: Record<string, SetorDashboardConfig> = {
  saude: {
    slug: 'saude',
    nome: 'Saúde',
    microEpifanias: [
      'Glosa hospitalar invisível',
      'Ociosidade de leitos',
      'Retrabalho de faturamento',
      'Descasamento entre prontuário e conta',
    ],
    indicadoresPadrao: [
      {
        id: 'glosa',
        label: 'Índice de Glosa Hospitalar',
        valor: '8.4%',
        meta: '< 3.0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Glosas iniciais de convênios sem auditoria preventiva de prontuário.',
        autoDeclarado: true,
      },
      {
        id: 'ocupacao',
        label: 'Taxa de Ocupação Operacional',
        valor: '62%',
        meta: '> 78%',
        status: 'atencao',
        tendencia: 'down',
        descricao: 'Leitos/salas ativas com ociosidade em turnos vespertinos.',
        autoDeclarado: true,
      },
      {
        id: 'inadimplencia',
        label: 'Inadimplência / Prazo Médio (PMR)',
        valor: '11.8%',
        meta: '< 4.5%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Descasamento de fluxo e retenções de repasse das operadoras.',
        autoDeclarado: true,
      },
      {
        id: 'retrabalho_fat',
        label: 'Retrabalho de Faturamento',
        valor: '18h / sem',
        meta: '< 4h / sem',
        status: 'atencao',
        tendencia: 'stable',
        descricao: 'Horas gastas corrigindo guias de autorização rejeitadas.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Descasamento entre Prontuário e Faturamento',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Até R$ 180k/mês em caixa retido por glosas evitáveis',
        acaoRecomendada: 'Implantar checklist de auditoria pré-envio e conferência diária de SADT.',
      },
      {
        titulo: 'Decisões Clínicas e Compras Centralizadas no Fundador',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'atencao',
        impactoEstimado: '32h semanais do diretor clínico gastas em rotinas administrativas',
        acaoRecomendada: 'Nomear comitê técnico com alçada formal de até R$ 25k sem aval prévio.',
      },
      {
        titulo: 'Desconhecimento da Margem por Procedimento / Convênio',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'atencao',
        impactoEstimado: 'Procedimentos de alta complexidade rodando com margem negativa',
        acaoRecomendada: 'Cálculo de custo direto e repactuação de tabela nos 3 maiores convênios.',
      },
    ],
  },
  varejo: {
    slug: 'varejo',
    nome: 'Varejo',
    microEpifanias: [
      'Ruptura de estoque',
      'Vendas perdidas',
      'Quebra/perda',
      'Ticket médio',
      'Margem por categoria',
    ],
    indicadoresPadrao: [
      {
        id: 'ruptura',
        label: 'Ruptura de Estoque (Curva A)',
        valor: '14.2%',
        meta: '< 3.0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Produtos de alto giro com gôndola desabastecida nas filiais.',
        autoDeclarado: true,
      },
      {
        id: 'giro',
        label: 'Giro de Estoque Anual',
        valor: '3.1x',
        meta: '> 6.0x',
        status: 'atencao',
        tendencia: 'down',
        descricao: 'Capital de giro imobilizado em itens de baixo giro (Curva C).',
        autoDeclarado: true,
      },
      {
        id: 'inadimplencia',
        label: 'Inadimplência de Crediário / Cartão',
        valor: '7.8%',
        meta: '< 3.5%',
        status: 'atencao',
        tendencia: 'up',
        descricao: 'Perdas em cobranças próprias e atrasos acima de 60 dias.',
        autoDeclarado: true,
      },
      {
        id: 'quebra_perda',
        label: 'Índice de Quebra e Perda',
        valor: '2.4%',
        meta: '< 0.8%',
        status: 'critico',
        tendencia: 'stable',
        descricao: 'Vencimentos, avarias no transporte e perdas não rastreadas.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Ruptura Invisível nos 10 Produtos Mais Vendidos',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Estimativa de 12% a 18% em vendas perdidas por falta de produto',
        acaoRecomendada: 'Parametrizar ponto de pedido automático com antecedência do lead time.',
      },
      {
        titulo: 'Centralização de Compras e Precificação no Sócio',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'critico',
        impactoEstimado: 'Lojas operam travadas sem aprovação manual do dono',
        acaoRecomendada: 'Definir faixas de margem e matriz de autonomia para gerentes de loja.',
      },
      {
        titulo: 'Desconhecimento da Margem Real por Categoria',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'atencao',
        impactoEstimado: 'Promoções agressivas queimando caixa em itens já deficitários',
        acaoRecomendada:
          'Implantar DRE por categoria com corte imediato de SKUs com margem negativa.',
      },
    ],
  },
  industria: {
    slug: 'industria',
    nome: 'Indústria',
    microEpifanias: [
      'Refugo',
      'Paradas não programadas',
      'Ociosidade de máquinas',
      'Giro de estoque',
      'Custo real da OP',
    ],
    indicadoresPadrao: [
      {
        id: 'refugo',
        label: 'Índice de Refugo Fabril',
        valor: '5.2%',
        meta: '< 1.5%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Matéria-prima descartada por defeito de ajuste de máquina.',
        autoDeclarado: true,
      },
      {
        id: 'paradas',
        label: 'Horas de Parada Não Programada',
        valor: '38h / mês',
        meta: '< 8h / mês',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Manutenções corretivas emergenciais no chão de fábrica.',
        autoDeclarado: true,
      },
      {
        id: 'oee',
        label: 'OEE (Eficiência Global do Equipamento)',
        valor: '61%',
        meta: '> 82%',
        status: 'atencao',
        tendencia: 'stable',
        descricao: 'Disponibilidade e rendimento aquém da capacidade nominal instalada.',
        autoDeclarado: true,
      },
      {
        id: 'giro_insumos',
        label: 'Giro de Estoque de Insumos Críticos',
        valor: '42 dias',
        meta: '< 25 dias',
        status: 'atencao',
        tendencia: 'down',
        descricao: 'Excesso de capital imobilizado em matérias-primas de baixa rotatividade.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Custo Real da Ordem de Produção Oculto',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Prejuízo mascarado em 22% dos itens produzidos sob encomenda',
        acaoRecomendada:
          'Implantar apontamento eletrônico de chão de fábrica com rateio de energia e mão de obra.',
      },
      {
        titulo: 'Fundador Apagando Incêndio no Chão de Fábrica',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'critico',
        impactoEstimado: 'Mais de 15 dias do mês gastos em conflitos operacionais',
        acaoRecomendada:
          'Contratar/promover gerente de produção com autonomia para paradas e manutenções.',
      },
      {
        titulo: 'Desalinhamento entre Comercial e PCP',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'atencao',
        impactoEstimado: 'Prazos estourados e multas por atraso de entrega em clientes-chave',
        acaoRecomendada:
          'Ritual semanal S&OP (Sales and Operations Planning) com metas de lead time.',
      },
    ],
  },
  'servicos-profissionais': {
    slug: 'servicos-profissionais',
    nome: 'Serviços Profissionais',
    microEpifanias: [
      'Horas não cobradas',
      'Taxa de utilização',
      'Contratos sem revisão de preço',
      'Custo de oportunidade do sócio',
    ],
    indicadoresPadrao: [
      {
        id: 'utilizacao',
        label: 'Taxa de Utilização da Equipe',
        valor: '54%',
        meta: '> 75%',
        status: 'critico',
        tendencia: 'down',
        descricao: 'Horas faturáveis vs. horas totais pagas à equipe técnica.',
        autoDeclarado: true,
      },
      {
        id: 'horas_nao_cobradas',
        label: 'Horas Trabalhadas Não Faturadas',
        valor: '23%',
        meta: '< 5%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Escopo ampliado (scope creep) sem emissão de aditivos comerciais.',
        autoDeclarado: true,
      },
      {
        id: 'inadimplencia',
        label: 'Inadimplência da Carteira',
        valor: '6.4%',
        meta: '< 3.0%',
        status: 'atencao',
        tendencia: 'stable',
        descricao: 'Mensalidades e honorários pendentes acima de 30 dias.',
        autoDeclarado: true,
      },
      {
        id: 'contratos_sem_reajuste',
        label: 'Contratos sem Reajuste (> 12m)',
        valor: '41%',
        meta: '< 5%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Clientes recorrentes corroendo margem com inflação acumulada.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Custo de Oportunidade do Sócio na Operação',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'critico',
        impactoEstimado: 'Mais de 60% da receita depende da entrega pessoal do fundador',
        acaoRecomendada:
          'Desenhar matriz de delegação e promover líderes técnicos para assumir projetos.',
      },
      {
        titulo: 'Vazamento Contínuo de Horas por Falha de Briefing',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Perda anual estimada em 18% do faturamento em trabalho não remunerado',
        acaoRecomendada:
          'Implantar checklist obrigatório de kick-off e política rígida de aditivos.',
      },
      {
        titulo: 'Precificação Baseada em Esforço e Não em Valor',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'atencao',
        impactoEstimado: 'Margem comprimida frente a aumentos salariais da equipe',
        acaoRecomendada:
          'Migrar contratos para modelo baseado em entregas estratégicas (Value Pricing).',
      },
    ],
  },
  'tecnologia-startups': {
    slug: 'tecnologia-startups',
    nome: 'Tecnologia / Startups',
    microEpifanias: [
      'Churn',
      'CAC/LTV',
      'Débito técnico',
      'Risco de concentração de receita',
      'Runway',
    ],
    indicadoresPadrao: [
      {
        id: 'churn',
        label: 'Churn Mensal (Revenue Churn)',
        valor: '3.8%',
        meta: '< 1.2%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Cancelamento silencioso de contas e evasão líquida de receita.',
        autoDeclarado: true,
      },
      {
        id: 'ltv_cac',
        label: 'Relação LTV / CAC',
        valor: '2.4x',
        meta: '> 4.0x',
        status: 'atencao',
        tendencia: 'down',
        descricao: 'Eficiência de aquisição comprimida pelo custo elevado de mídia e vendas.',
        autoDeclarado: true,
      },
      {
        id: 'debito_tecnico',
        label: 'Horas Dedicadas a Débito Técnico',
        valor: '34%',
        meta: '< 15%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Equipe de engenharia apagando bugs em vez de entregar novos produtos.',
        autoDeclarado: true,
      },
      {
        id: 'runway',
        label: 'Runway de Caixa Estimado',
        valor: '8 meses',
        meta: '> 18 meses',
        status: 'atencao',
        tendencia: 'down',
        descricao: 'Necessidade de aceleração do breakeven operacional.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Vendas Enterprise Dependentes do Founder',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'critico',
        impactoEstimado: 'Gargalo no pipeline comercial enterprise sem o CEO',
        acaoRecomendada: 'Estruturar playbook de vendas B2B e contratar Account Executive sênior.',
      },
      {
        titulo: 'Concentração de Receita nos 5 Maiores Clientes',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Perda potencial de até 48% da receita com saída de um cliente',
        acaoRecomendada: 'Diversificação ativa da base com foco no segmento mid-market.',
      },
      {
        titulo: 'Falta de Alinhamento entre Produto e Métricas de NRR',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'atencao',
        impactoEstimado: 'Foco exclusivo em novos clientes enquanto a base existente encolhe',
        acaoRecomendada:
          'Criar time de Customer Success com metas atreladas a upsell e retenção líquida.',
      },
    ],
  },
  'facilities-servicos-terceirizados': {
    slug: 'facilities-servicos-terceirizados',
    nome: 'Facilities e Serviços Terceirizados',
    microEpifanias: [
      'Margem negativa oculta por contrato',
      'Passivo trabalhista invisível de escalas',
      'Multas e glosas por quebra de SLA',
      'Custo oculto do turnover',
    ],
    indicadoresPadrao: [
      {
        id: 'glosa_sla',
        label: 'Glosas Contratuais por SLA',
        valor: '4.6%',
        meta: '< 0.5%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Penalidades aplicadas por clientes por atrasos ou postos descobertos.',
        autoDeclarado: true,
      },
      {
        id: 'horas_extras',
        label: 'Horas Extras por Faltas / Escalas',
        valor: '14.2%',
        meta: '< 3.0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Custo excessivo para cobrir absenteísmo de última hora.',
        autoDeclarado: true,
      },
      {
        id: 'turnover',
        label: 'Turnover Mensal da Base Operacional',
        valor: '8.1%',
        meta: '< 3.0%',
        status: 'critico',
        tendencia: 'stable',
        descricao: 'Custo oculto em uniformes, exames, recrutamento e treinamento.',
        autoDeclarado: true,
      },
      {
        id: 'margem_contrato',
        label: 'Contratos com Margem Negativa',
        valor: '19%',
        meta: '0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Postos que consomem mais custo de cobertura do que a receita faturada.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Glosas Contratuais por Postos Descobertos',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Perda de R$ 95k/mês em multas e retenções de faturamento',
        acaoRecomendada:
          'Implantar ponto biométrico geolocalizado com alerta automático de falta em 15 minutos.',
      },
      {
        titulo: 'Fundador Resolvendo Conflitos Diários em Clientes',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'atencao',
        impactoEstimado: '20h semanais do diretor em reuniões de contenção de crise',
        acaoRecomendada:
          'Definir encarregados seniores volantes com alçada de resolução no cliente.',
      },
      {
        titulo: 'Contratos Sem Repasse de Dissídio e Benefícios',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'critico',
        impactoEstimado: 'Erosão contínua da margem bruta nos contratos plurianuais',
        acaoRecomendada:
          'Auditoria de 100% dos contratos e envio imediato de pleito de reequilíbrio econômico.',
      },
    ],
  },
  agronegocio: {
    slug: 'agronegocio',
    nome: 'Agronegócio',
    microEpifanias: [
      'Perda na colheita',
      'Custo por hectare',
      'Ociosidade da frota',
      'Janelas perdidas',
    ],
    indicadoresPadrao: [
      {
        id: 'perda_colheita',
        label: 'Perda na Colheita',
        valor: '4.8%',
        meta: '< 1.5%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Perdas em recolhimento mecânico e descalibração de maquinário.',
        autoDeclarado: true,
      },
      {
        id: 'custo_hectare',
        label: 'Desvio no Custo por Hectare',
        valor: '+16%',
        meta: '< 5%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Custos operacionais e defensivos acima do orçamento planejado da safra.',
        autoDeclarado: true,
      },
      {
        id: 'ociosidade_frota',
        label: 'Ociosidade de Tratores/Maquinário',
        valor: '28%',
        meta: '< 12%',
        status: 'atencao',
        tendencia: 'stable',
        descricao: 'Equipamentos parados por falha de planejamento logístico.',
        autoDeclarado: true,
      },
      {
        id: 'janelas_perdidas',
        label: 'Janelas Críticas Perdidas',
        valor: '4 dias / safra',
        meta: '0 dias',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Atrasos no plantio/pulverização por dependência de decisões centralizadas.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Decisões Críticas de Safra Centralizadas no Proprietário',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'critico',
        impactoEstimado: 'Janelas climáticas perdidas aguardando aprovação do dono',
        acaoRecomendada:
          'Delegar protocolo técnico de plantio com metas claras para o gerente agrônomo.',
      },
      {
        titulo: 'Insumos Aplicados Sem Taxa Variável ou Telemetria',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'atencao',
        impactoEstimado: 'Desperdício de até R$ 220/hectare em fertilizantes e defensivos',
        acaoRecomendada: 'Mapeamento de fertilidade por zonas de manejo com aplicação orientada.',
      },
      {
        titulo: 'Desconhecimento do Ponto de Equilíbrio na Venda da Safra',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'critico',
        impactoEstimado: 'Venda antecipada em momentos desfavoráveis por aperto de caixa',
        acaoRecomendada:
          'Construir política formal de hedge com travas escalonadas de preço e margem.',
      },
    ],
  },
  'construcao-civil': {
    slug: 'construcao-civil',
    nome: 'Construção Civil',
    microEpifanias: [
      'Desperdício de materiais',
      'Retrabalho',
      'Aditivos não cobrados',
      'Orçado vs. realizado',
    ],
    indicadoresPadrao: [
      {
        id: 'orcado_realizado',
        label: 'Desvio Orçado vs. Realizado',
        valor: '+14.8%',
        meta: '< 3.0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Estouro de custo em etapas estruturais e acabamentos.',
        autoDeclarado: true,
      },
      {
        id: 'desperdicio',
        label: 'Desperdício Físico de Materiais',
        valor: '9.2%',
        meta: '< 3.0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Perdas em canteiro por armazenamento precário e quebras.',
        autoDeclarado: true,
      },
      {
        id: 'aditivos_nao_cobrados',
        label: 'Aditivos Executados Não Faturados',
        valor: '18%',
        meta: '0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Modificações exigidas pelo cliente executadas sem aditivo formal.',
        autoDeclarado: true,
      },
      {
        id: 'horas_ociosas',
        label: 'Horas Ociosas no Canteiro',
        valor: '16%',
        meta: '< 5%',
        status: 'atencao',
        tendencia: 'stable',
        descricao: 'Mão de obra parada aguardando chegada de material ou liberação técnica.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Estouro Sistemático de Orçamento vs. Realizado',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Erosão total da margem de lucro prevista nos empreendimentos',
        acaoRecomendada:
          'Curva S semanal comparativa com bloqueio de compras acima do teto da etapa.',
      },
      {
        titulo: 'Dono Resolvendo Problemas Técnicos do Engenheiro Residente',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'critico',
        impactoEstimado: 'Fundador passa 4 dias por semana apagando incêndios em obras',
        acaoRecomendada:
          'Estabelecer cadência de fiscalização técnica quinzenal e cobrar autonomia do residente.',
      },
      {
        titulo: 'Falta de Cobrança de Serviços Extras e Modificações',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'atencao',
        impactoEstimado: 'Prejuízo de centenas de milhares de reais absorvido pela construtora',
        acaoRecomendada:
          'Regra de ouro: nenhuma alteração é iniciada sem ordem de serviço assinada e paga.',
      },
    ],
  },
  'transporte-logistica': {
    slug: 'transporte-logistica',
    nome: 'Transporte / Logística',
    microEpifanias: ['Km vazios', 'Ociosidade da frota', 'Custo por km', 'Manutenção corretiva'],
    indicadoresPadrao: [
      {
        id: 'km_vazios',
        label: 'Índice de Km Rodados Vazios',
        valor: '24%',
        meta: '< 8%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Caminhões retornando sem frete de retorno contratado.',
        autoDeclarado: true,
      },
      {
        id: 'custo_km',
        label: 'Desvio do Custo Real por Km',
        valor: '+12.5%',
        meta: '< 3.0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Diesel, pneus e manutenções acima da referência teórica da rota.',
        autoDeclarado: true,
      },
      {
        id: 'otif',
        label: 'Índice OTIF (On-Time In-Full)',
        valor: '81%',
        meta: '> 95%',
        status: 'atencao',
        tendencia: 'down',
        descricao: 'Entregas com atraso ou avaria gerando multas de embarcadores.',
        autoDeclarado: true,
      },
      {
        id: 'corretiva_preventiva',
        label: 'Manutenção Corretiva vs. Preventiva',
        valor: '48%',
        meta: '< 15%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Veículos quebrando em trânsito com custo até 3x superior à preventiva.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Km Vazios Sangrando a Rentabilidade da Frota',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Até 25% do diesel consumido sem gerar receita de frete',
        acaoRecomendada:
          'Parcerias com marketplaces de carga de retorno e rotas circulares programadas.',
      },
      {
        titulo: 'Decisões Diárias de Frete e Rota Dependentes do Fundador',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'atencao',
        impactoEstimado: 'Fundador sobrecarregado atendendo ligações de motoristas 24/7',
        acaoRecomendada:
          'Central de controle operacional (torre de controle) com torre dedicada e regras claras.',
      },
      {
        titulo: 'Comercial Precificando Frete sem Conhecer Custo da Rota',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'critico',
        impactoEstimado: 'Rotas deficitárias mantidas apenas para movimentar volume de carga',
        acaoRecomendada:
          'Tabela dinâmica de frete balizada por custos reais e margem mínima obrigatória.',
      },
    ],
  },
  educacao: {
    slug: 'educacao',
    nome: 'Educação',
    microEpifanias: ['Evasão', 'Inadimplência', 'Vagas ociosas', 'Rotatividade docente'],
    indicadoresPadrao: [
      {
        id: 'evasao',
        label: 'Índice de Evasão (Churn de Alunos)',
        valor: '18.4%',
        meta: '< 6.0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Alunos trancando matrícula antes da conclusão do ciclo letivo.',
        autoDeclarado: true,
      },
      {
        id: 'inadimplencia',
        label: 'Inadimplência de Mensalidades',
        valor: '12.8%',
        meta: '< 4.0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Mensalidades em aberto com mais de 60 dias de atraso.',
        autoDeclarado: true,
      },
      {
        id: 'vagas_ociosas',
        label: 'Taxa de Vagas Ociosas por Turma',
        valor: '29%',
        meta: '< 10%',
        status: 'atencao',
        tendencia: 'down',
        descricao: 'Salas rodando abaixo do ponto de equilíbrio de custos docentes.',
        autoDeclarado: true,
      },
      {
        id: 'cac_aluno',
        label: 'CAC por Aluno Matriculado',
        valor: 'R$ 1.450',
        meta: '< R$ 750',
        status: 'atencao',
        tendencia: 'up',
        descricao: 'Custo de captação elevado pela dependência de campanhas de última hora.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Evasão Silenciosa Durante o Semestre Letivo',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Perda de receita anual consolidada estimada em 20% do faturamento',
        acaoRecomendada:
          'Criar comitê de retenção com acompanhamento antecipado de frequência e notas.',
      },
      {
        titulo: 'Fundador Centralizando Concessão de Bolsas e Descontos',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'atencao',
        impactoEstimado: 'Meses de matrículas atrasadas pela fila de aprovações do mantenedor',
        acaoRecomendada:
          'Criar política transparente de descontos com alçadas escalonadas pela secretaria.',
      },
      {
        titulo: 'Falta de Integração entre Pedagógico e Financeiro',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'atencao',
        impactoEstimado: 'Cursos abertos com poucos alunos gerando déficit operacional por turma',
        acaoRecomendada:
          'Definir quórum mínimo determinístico para abertura de turmas e remanejamento.',
      },
    ],
  },
  'academias-de-ginastica': {
    slug: 'academias-de-ginastica',
    nome: 'Academias de Ginástica',
    microEpifanias: ['Evasão', 'Capacidade ociosa', 'Ocupação por horário', 'CAC por aluno'],
    indicadoresPadrao: [
      {
        id: 'evasao',
        label: 'Taxa de Evasão Mensal (Churn)',
        valor: '9.8%',
        meta: '< 4.0%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Alunos que desistem após os primeiros 90 dias de matrícula.',
        autoDeclarado: true,
      },
      {
        id: 'ociosidade_horario',
        label: 'Ociosidade em Horários de Vale',
        valor: '68%',
        meta: '< 40%',
        status: 'atencao',
        tendencia: 'stable',
        descricao: 'Unidade vazia entre 10h e 16h consumindo custos fixos.',
        autoDeclarado: true,
      },
      {
        id: 'planos_promocionais',
        label: 'Alunos em Planos com Desconto Elevado',
        valor: '38%',
        meta: '< 15%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Planos congelados ou com tíquete médio que não cobre o custo por aluno.',
        autoDeclarado: true,
      },
      {
        id: 'inadimplencia',
        label: 'Inadimplência de Recorrência',
        valor: '8.4%',
        meta: '< 2.5%',
        status: 'atencao',
        tendencia: 'up',
        descricao: 'Falhas de cobrança de cartão e boletos não compensados.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Desistência em Massa nos Primeiros 90 Dias de Treino',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Necessidade de captar o dobro de alunos apenas para manter a base',
        acaoRecomendada:
          'Implantar jornada obrigatória de onboarding e contato ativo na 2ª e 4ª semana.',
      },
      {
        titulo: 'Presença Física do Fundador Obrigatória na Unidade',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'critico',
        impactoEstimado: 'Impossibilidade de abrir novas filiais sem o sócio presencial',
        acaoRecomendada:
          'Contratar líder de unidade com remuneração atrelada à retenção de alunos.',
      },
      {
        titulo: 'Comercial sem Metas de Ocupação dos Horários Alternativos',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'atencao',
        impactoEstimado: 'Superlotação no pico (18h-21h) e custos ociosos no resto do dia',
        acaoRecomendada:
          'Criar planos exclusivos para horários de vale (Off-Peak) com tíquete atrativo.',
      },
    ],
  },
  'comercio-internacional-trading': {
    slug: 'comercio-internacional-trading',
    nome: 'Comércio Internacional / Trading',
    microEpifanias: [
      'Descasamento de hedge cambial',
      'Custos ocultos de landed cost',
      'Sobrestadia de contêineres (demurrage)',
      'Exposição ao fim de incentivos estaduais',
    ],
    indicadoresPadrao: [
      {
        id: 'demurrage',
        label: 'Custo Anual com Demurrage / Armazenagem',
        valor: 'R$ 380k',
        meta: '< R$ 50k',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Sobrestadia de contêineres por atraso no desembaraço aduaneiro.',
        autoDeclarado: true,
      },
      {
        id: 'descasamento_cambio',
        label: 'Exposição Cambial sem Hedge',
        valor: '35%',
        meta: '< 5%',
        status: 'critico',
        tendencia: 'up',
        descricao: 'Operações fechadas com variação cambial absorvida na margem.',
        autoDeclarado: true,
      },
      {
        id: 'margem_incentivo',
        label: 'Dependência de Incentivo Estadual (ICMS)',
        valor: '62%',
        meta: '< 25%',
        status: 'critico',
        tendencia: 'stable',
        descricao: 'Margem vulnerável à transição da Reforma Tributária (CBS/IBS).',
        autoDeclarado: true,
      },
      {
        id: 'canal_verde',
        label: 'Índice de Canal Verde (Siscomex)',
        valor: '88%',
        meta: '> 96%',
        status: 'atencao',
        tendencia: 'down',
        descricao: 'Parametrizações para canal amarelo/vermelho ampliando lead time.',
        autoDeclarado: true,
      },
    ],
    gargalosTipicos: [
      {
        titulo: 'Despesas Excessivas com Sobrestadia de Contêineres (Demurrage)',
        pilar: 'Pilar 2 — Ineficiência Invisível',
        severidade: 'critico',
        impactoEstimado: 'Prejuízo direto de centenas de milhares de reais sem recuperação',
        acaoRecomendada:
          'Contratação de frete com free time estendido (> 21 dias) e tracking diário.',
      },
      {
        titulo: 'Operações de Câmbio e ACC/ACE Centralizadas no Sócio',
        pilar: 'Pilar 1 — Prisão do Fundador',
        severidade: 'critico',
        impactoEstimado: 'Risco de paralisia de importações e perdas por timing cambial incorreto',
        acaoRecomendada:
          'Definir comitê de tesouraria com regras automáticas de NDF/travamento de taxa.',
      },
      {
        titulo: 'Vulnerabilidade Extrema ao Fim dos Benefícios Fiscais Estaduais',
        pilar: 'Pilar 3 — Abismo Estratégia vs. Execução',
        severidade: 'critico',
        impactoEstimado: 'Perda potencial de até 70% do lucro líquido na Reforma Tributária',
        acaoRecomendada:
          'Migrar proposta de valor para serviços door-to-door e inteligência regulatória.',
      },
    ],
  },
}

export function getDashboardConfigDoSetor(slugOuId?: string): SetorDashboardConfig {
  if (!slugOuId) return SETORES_DASHBOARD_CONFIG['saude']
  const limpo = slugOuId.toLowerCase().trim()
  if (SETORES_DASHBOARD_CONFIG[limpo]) {
    return SETORES_DASHBOARD_CONFIG[limpo]
  }
  // Mapeamentos comuns
  if (limpo.includes('saude')) return SETORES_DASHBOARD_CONFIG['saude']
  if (limpo.includes('varejo')) return SETORES_DASHBOARD_CONFIG['varejo']
  if (limpo.includes('industria')) return SETORES_DASHBOARD_CONFIG['industria']
  if (limpo.includes('servico')) return SETORES_DASHBOARD_CONFIG['servicos-profissionais']
  if (limpo.includes('tecnologia') || limpo.includes('startup'))
    return SETORES_DASHBOARD_CONFIG['tecnologia-startups']
  if (limpo.includes('facili')) return SETORES_DASHBOARD_CONFIG['facilities-servicos-terceirizados']
  if (limpo.includes('agro')) return SETORES_DASHBOARD_CONFIG['agronegocio']
  if (limpo.includes('construc')) return SETORES_DASHBOARD_CONFIG['construcao-civil']
  if (limpo.includes('transp') || limpo.includes('logist'))
    return SETORES_DASHBOARD_CONFIG['transporte-logistica']
  if (limpo.includes('educa')) return SETORES_DASHBOARD_CONFIG['educacao']
  if (limpo.includes('academia')) return SETORES_DASHBOARD_CONFIG['academias-de-ginastica']
  if (limpo.includes('trading') || limpo.includes('comercio'))
    return SETORES_DASHBOARD_CONFIG['comercio-internacional-trading']

  return SETORES_DASHBOARD_CONFIG['varejo']
}
