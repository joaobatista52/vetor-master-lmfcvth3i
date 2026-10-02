// Base Canônica dos 12 Setores — Vetor Master V1.3 & V7.2
// Fonte: Site Oficial de Produção (https://site-institucional-vetor-master-165d3.goskip.app) e Questionários Consolidados 12 Setores V7.2
//
// Sequência Canônica Oficial:
// 01 Saúde
// 02 Varejo
// 03 Serviços Profissionais
// 04 Comércio Internacional - Trading Company
// 05 Facilities
// 06 Indústria
// 07 Tech/Startups
// 08 Construção Civil
// 09 Logística/Transporte
// 10 Educação
// 11 Agronegócio
// 12 Academias de Ginástica

export interface SetorCanonicoInfo {
  numero: string // '01'..'12'
  id: string
  nome: string
  slug: string
  destaque?: boolean
  subsegmentosLinha: string
  segmentos: string[]
  linhaSla: string
  descricaoIntro: string
  gargaloCritico: string
  alavancaDeterministica: string
  blocoDestravarTitulo: string
  blocoDestravarTexto: string
  botaoDestravarTexto: string
  questionarioPath: string
  // Retrocompatibilidade
  microEpifanias: string[]
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
    subsegmentosLinha: 'Hospitalar, Clínica, Odontológica, Laboratório e Home Care.',
    segmentos: ['Hospitalar', 'Clínica', 'Odontológica', 'Laboratório', 'Home Care'],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Hospitalar, Clínica, Odontológica, Laboratório e Home Care. Operação assistencial com gestão concentrada no fundador e margens pressionadas por convênios.',
    gargaloCritico:
      'Glosa hospitalar invisível · baixa taxa de ocupação de leitos e/ou consultórios · retrabalho de faturamento · descasamento entre prontuário e conta.',
    alavancaDeterministica:
      'Diagnóstico Estratégico que quantifica a glosa e o retrabalho, prioriza as micro-epifanias e aponta o caminho para recuperar margem — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Saúde?',
    blocoDestravarTexto:
      'A VETOR MASTER destrava a sua operação de saúde partindo do que o fundador não consegue enxergar sozinho: a glosa invisível e o retrabalho de faturamento. O Diagnóstico Estratégico quantifica o descasamento entre prontuário e conta e a baixa ocupação de leitos e consultórios, prioriza as micro-epifanias de maior impacto e devolve ao dono um caminho claro para recuperar margem — sem depender de mais horas de trabalho.',
    botaoDestravarTexto: 'Diagnóstico para Saúde',
    questionarioPath: '/questionario/saude',
    microEpifanias: [
      'Glosa hospitalar invisível',
      'Baixa taxa de ocupação de leitos e/ou consultórios',
      'Retrabalho de faturamento',
      'Descasamento entre prontuário e conta',
    ],
    textoFechado:
      'Hospitalar, Clínica, Odontológica, Laboratório e Home Care. Operação assistencial com gestão concentrada no fundador e margens pressionadas por convênios.',
    textoAberto:
      'Diagnóstico Estratégico que quantifica a glosa e o retrabalho, prioriza as micro-epifanias e aponta o caminho para recuperar margem — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '02',
    id: 'varejo',
    nome: 'Varejo',
    slug: 'varejo',
    subsegmentosLinha: 'Lojas Físicas, E-commerce, Distribuição, Alimentação e Moda.',
    segmentos: ['Lojas Físicas', 'E-commerce', 'Distribuição', 'Alimentação', 'Moda'],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Lojas Físicas, E-commerce, Distribuição, Alimentação e Moda. Operação de alto giro com capital preso em estoque, ruptura de itens críticos e margens corroídas.',
    gargaloCritico:
      'Ruptura de estoque na curva A · capital de giro asfixiado em obsoletos · perdas, furtos e quebras não auditadas · margem negativa por categoria.',
    alavancaDeterministica:
      'Diagnóstico Estratégico com matriz preditiva de cobertura de estoque, parâmetros determinísticos de desconto no PDV e estancamento de sangrias operacionais — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Varejo?',
    blocoDestravarTexto:
      'A VETOR MASTER destrava a sua operação de varejo atacando os vazamentos silenciosos de margem: a ruptura dos itens de maior giro e o caixa imobilizado em estoque sem saída. O Diagnóstico Estratégico mapeia o descompasso entre compras e vendas, devolvendo clareza e previsibilidade de caixa ao fundador.',
    botaoDestravarTexto: 'Diagnóstico para Varejo',
    questionarioPath: '/questionario/varejo',
    microEpifanias: [
      'Ruptura de estoque nos top produtos',
      'Vendas perdidas no balcão por falta de produto',
      'Quebras, furtos e perdas não auditadas',
      'Margem negativa por categoria de produto',
    ],
    textoFechado:
      'Lojas Físicas, E-commerce, Distribuição, Alimentação e Moda. Operação de alto giro com capital preso em estoque, ruptura de itens críticos e margens corroídas.',
    textoAberto:
      'Diagnóstico Estratégico com matriz preditiva de cobertura de estoque, parâmetros determinísticos de desconto no PDV e estancamento de sangrias operacionais — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '03',
    id: 'servicos',
    nome: 'Serviços Profissionais',
    slug: 'servicos-profissionais',
    subsegmentosLinha: 'Consultoria, Advocacia, Contabilidade, Arquitetura, Agência e TI.',
    segmentos: ['Consultoria', 'Advocacia', 'Contabilidade', 'Arquitetura', 'Agência', 'TI'],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Consultoria, Advocacia, Contabilidade, Arquitetura, Agência e TI. Modelo baseado em faturabilidade técnica onde o sócio atua como principal executor e gargalo.',
    gargaloCritico:
      'Horas trabalhadas e não faturadas (leakage) · taxa de utilização real abaixo do ponto de equilíbrio · contratos sem reajuste · dependência do sócio para fechar e entregar.',
    alavancaDeterministica:
      'Diagnóstico Estratégico de faturabilidade real por contrato, esteira padronizada de entregas com SLAs rígidos e precificação determinística baseada em valor — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Serviços Profissionais?',
    blocoDestravarTexto:
      'A VETOR MASTER liberta o sócio da prisão técnica operacional, eliminando o vazamento de honorários não faturados e repactuando contratos defasados. O Diagnóstico Estratégico estrutura a esteira comercial e a autonomia de entrega da equipe.',
    botaoDestravarTexto: 'Diagnóstico para Serviços Profissionais',
    questionarioPath: '/questionario/servicos-profissionais',
    microEpifanias: [
      'Horas trabalhadas e não cobradas (leakage)',
      'Taxa de utilização real abaixo de 60%',
      'Contratos há mais de 12 meses sem revisão',
      'Custo de oportunidade do sócio como executor',
    ],
    textoFechado:
      'Consultoria, Advocacia, Contabilidade, Arquitetura, Agência e TI. Modelo baseado em faturabilidade técnica onde o sócio atua como principal executor e gargalo.',
    textoAberto:
      'Diagnóstico Estratégico de faturabilidade real por contrato, esteira padronizada de entregas com SLAs rígidos e precificação determinística baseada em valor — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '04',
    id: 'trading',
    nome: 'Comércio Internacional - Trading Company',
    slug: 'comercio-internacional',
    subsegmentosLinha:
      'Importação, Exportação, Trading, Logística, Planejamento Tributário/Fiscal, Câmbio e Trade Finance.',
    segmentos: [
      'Importação',
      'Exportação',
      'Trading',
      'Logística',
      'Planejamento Tributário/Fiscal',
      'Câmbio',
      'Trade Finance',
    ],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Importação, Exportação, Trading, Logística, Planejamento Tributário/Fiscal, Câmbio e Trade Finance. Operação global sujeita a volatilidade cambial, compliance alfandegário e risco de transição tributária.',
    gargaloCritico:
      'Descasamento de hedge cambial · custos ocultos no Landed Cost por SKU/contêiner · demurrage portuário explosivo · exposição da margem ao fim dos incentivos estaduais (CBS/IBS).',
    alavancaDeterministica:
      'Diagnóstico Estratégico com DRE estruturada em 15 linhas para Trading, automação preditiva de Landed Cost e governança de travas cambiais — com devolutiva de 45 min.',
    blocoDestravarTitulo:
      'Pronto para destravar o setor de Comércio Internacional - Trading Company?',
    blocoDestravarTexto:
      'A VETOR MASTER protege as margens e a liquidez da sua trading contra custos ocultos portuários e volatilidade cambial. O Diagnóstico Estratégico quantifica a rentabilidade líquida por modalidade (Encomenda vs. Conta e Ordem) e prepara a governança para a transição CBS/IBS.',
    botaoDestravarTexto: 'Diagnóstico para Comércio Internacional - Trading Company',
    questionarioPath: '/questionario/comercio-internacional',
    microEpifanias: [
      'Descasamento de hedge cambial não protegido',
      'Custos ocultos no Landed Cost por SKU/contêiner',
      'Sobrestadia de contêineres (demurrage explosivo)',
      'Exposição ao fim de incentivos estaduais (Reforma Tributária CBS/IBS)',
    ],
    textoFechado:
      'Importação, Exportação, Trading, Logística, Planejamento Tributário/Fiscal, Câmbio e Trade Finance. Operação global sujeita a volatilidade cambial, compliance alfandegário e risco de transição tributária.',
    textoAberto:
      'Diagnóstico Estratégico com DRE estruturada em 15 linhas para Trading, automação preditiva de Landed Cost e governança de travas cambiais — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '05',
    id: 'facilities',
    nome: 'Facilities',
    slug: 'facilities',
    subsegmentosLinha:
      'Facilities Management, Limpeza e Conservação, Segurança Patrimonial, Manutenção Predial, Portaria/Recepção e Serviços Terceirizados.',
    segmentos: [
      'Facilities Management',
      'Limpeza e Conservação',
      'Segurança Patrimonial',
      'Manutenção Predial',
      'Portaria/Recepção',
      'Serviços Terceirizados',
    ],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Facilities Management, Limpeza e Conservação, Segurança Patrimonial, Manutenção Predial, Portaria/Recepção e Serviços Terceirizados. Gestão intensiva de mão de obra com alta pressão de escala e passivos trabalhistas.',
    gargaloCritico:
      'Margem negativa oculta por horas extras e absenteísmo · passivo trabalhista invisível de escalas · multas e glosas por quebra de SLA contratual · turnover crônico da base.',
    alavancaDeterministica:
      'Diagnóstico Estratégico com controle de rentabilidade líquida por contrato, auditoria trabalhista preventiva e esteira automatizada de cobertura de postos — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Facilities?',
    blocoDestravarTexto:
      'A VETOR MASTER estanca os sangramentos operacionais de contratos deficitários e custos descontrolados de horas extras em facilities. O Diagnóstico Estratégico mapeia o custo real homem/hora, repactua aditivos e blinda a operação contra contingências trabalhistas.',
    botaoDestravarTexto: 'Diagnóstico para Facilities',
    questionarioPath: '/questionario/facilities',
    microEpifanias: [
      'Margem negativa oculta por horas extras e absenteísmo',
      'Passivo trabalhista invisível de escalas e intervalos',
      'Multas e glosas por quebra de SLA contratual',
      'Custo invisível do turnover na base operacional',
    ],
    textoFechado:
      'Facilities Management, Limpeza e Conservação, Segurança Patrimonial, Manutenção Predial, Portaria/Recepção e Serviços Terceirizados. Gestão intensiva de mão de obra com alta pressão de escala e passivos trabalhistas.',
    textoAberto:
      'Diagnóstico Estratégico com controle de rentabilidade líquida por contrato, auditoria trabalhista preventiva e esteira automatizada de cobertura de postos — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '06',
    id: 'industria',
    nome: 'Indústria',
    slug: 'industria',
    subsegmentosLinha: 'Manufatura, Metalurgia, Alimentos, Químico, Têxtil e Plástico.',
    segmentos: ['Manufatura', 'Metalurgia', 'Alimentos', 'Químico', 'Têxtil', 'Plástico'],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Manufatura, Metalurgia, Alimentos, Químico, Têxtil e Plástico. Produção fabril com desafios contínuos de eficiência operacional, ociosidade de máquinas e controle de custos.',
    gargaloCritico:
      'Refugo oculto na linha de produção · paradas não programadas de maquinário crítico · giro lento de matérias-primas · pedidos vendidos sem conhecimento da margem de contribuição efetiva.',
    alavancaDeterministica:
      'Diagnóstico Estratégico de PCP integrado ao Comercial via S&OP, alçadas descentralizadas para compras de matérias-primas e foco em OEE e estancamento de refugo — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Indústria?',
    blocoDestravarTexto:
      'A VETOR MASTER conecta o chão de fábrica à diretoria financeira, eliminando paradas não programadas e alinhando produção e vendas. O Diagnóstico Estratégico aponta o custo real de cada ordem fabril e destrava capacidade ociosa sem necessidade de novos investimentos de capital.',
    botaoDestravarTexto: 'Diagnóstico para Indústria',
    questionarioPath: '/questionario/industria',
    microEpifanias: [
      'Índice real de refugo na linha de produção',
      'Paradas não programadas e custo/hora de ociosidade',
      'Giro de insumos e matérias-primas críticas',
      'Equipe comercial vendendo itens com margem negativa',
    ],
    textoFechado:
      'Manufatura, Metalurgia, Alimentos, Químico, Têxtil e Plástico. Produção fabril com desafios contínuos de eficiência operacional, ociosidade de máquinas e controle de custos.',
    textoAberto:
      'Diagnóstico Estratégico de PCP integrado ao Comercial via S&OP, alçadas descentralizadas para compras de matérias-primas e foco em OEE e estancamento de refugo — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '07',
    id: 'tecnologia',
    nome: 'Tech/Startups',
    slug: 'tech-startups',
    subsegmentosLinha: 'SaaS, Fintech, Healthtech, Edtech e Marketplace.',
    segmentos: ['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'Marketplace'],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'SaaS, Fintech, Healthtech, Edtech e Marketplace. Negócios de tecnologia e escala rápida com desafios em unit economics, retenção de clientes e governança de produto.',
    gargaloCritico:
      'Churn invisível corroendo o MRR · payback estendido com CAC mascarado por canal · débito técnico consumindo engenharia · concentração de receita nos maiores clientes.',
    alavancaDeterministica:
      'Diagnóstico Estratégico com unit economics determinísticos (LTV/CAC e NRR), governança ágil de deploys e blindagem de runway para rodadas de capital — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Tech/Startups?',
    blocoDestravarTexto:
      'A VETOR MASTER traz o rigor analítico de conselho consultivo para empresas de tecnologia em crescimento. O Diagnóstico Estratégico desmascara os custos reais de aquisição e retenção, acelerando o retorno sobre o investimento de capital e blindando a operação.',
    botaoDestravarTexto: 'Diagnóstico para Tech/Startups',
    questionarioPath: '/questionario/tecnologia',
    microEpifanias: [
      'Churn invisível corroendo o crescimento do MRR',
      'Payback estendido e CAC mascarado por canal',
      'Débito técnico consumindo mais de 30% da engenharia',
      'Concentração perigosa de receita nos 10 maiores clientes',
    ],
    textoFechado:
      'SaaS, Fintech, Healthtech, Edtech e Marketplace. Negócios de tecnologia e escala rápida com desafios em unit economics, retenção de clientes e governança de produto.',
    textoAberto:
      'Diagnóstico Estratégico com unit economics determinísticos (LTV/CAC e NRR), governança ágil de deploys e blindagem de runway para rodadas de capital — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '08',
    id: 'construcao',
    nome: 'Construção Civil',
    slug: 'construcao-civil',
    subsegmentosLinha: 'Edificações, Incorporação, Infraestrutura e Reformas.',
    segmentos: ['Edificações', 'Incorporação', 'Infraestrutura', 'Reformas'],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Edificações, Incorporação, Infraestrutura e Reformas. Gestão de projetos de longo prazo com alta sensibilidade a cronogramas físicos e orçamentos de suprimentos.',
    gargaloCritico:
      'Desperdício crônico de insumos nos canteiros · dias perdidos por retrabalho e revisões de projeto · aditivos executados sem faturamento · estouro sistemático do orçado vs. realizado.',
    alavancaDeterministica:
      'Diagnóstico Estratégico com padronização de Curva S física e financeira em tempo real, governança de aditivos contratuais e compras antecipadas com alçadas — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Construção Civil?',
    blocoDestravarTexto:
      'A VETOR MASTER blinda a rentabilidade dos canteiros de obra contra estouros orçamentários e retrabalhos recorrentes. O Diagnóstico Estratégico audita a cobrança integral de aditivos e descentraliza o suprimento com limites rígidos de alçada.',
    botaoDestravarTexto: 'Diagnóstico para Construção Civil',
    questionarioPath: '/questionario/construcao',
    microEpifanias: [
      'Desperdício crônico de materiais nos canteiros',
      'Dias perdidos por retrabalho e revisões de projeto',
      'Aditivos e serviços extras executados sem cobrança',
      'Divergência sistemática entre custo orçado e realizado',
    ],
    textoFechado:
      'Edificações, Incorporação, Infraestrutura e Reformas. Gestão de projetos de longo prazo com alta sensibilidade a cronogramas físicos e orçamentos de suprimentos.',
    textoAberto:
      'Diagnóstico Estratégico com padronização de Curva S física e financeira em tempo real, governança de aditivos contratuais e compras antecipadas com alçadas — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '09',
    id: 'transporte',
    nome: 'Logística/Transporte',
    slug: 'transporte-logistica',
    subsegmentosLinha: 'Cargas, Passageiros, Distribuição e Armazenagem.',
    segmentos: ['Cargas', 'Passageiros', 'Distribuição', 'Armazenagem'],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Cargas, Passageiros, Distribuição e Armazenagem. Operações logísticas com forte impacto de custos de combustível, manutenção e eficiência de malha viária.',
    gargaloCritico:
      'Quilômetros rodados vazios (frete de retorno zero) · ociosidade de veículos da frota · manutenção corretiva consumindo preventivas · falta de visibilidade em tempo real do armazém.',
    alavancaDeterministica:
      'Diagnóstico Estratégico de roteirização e landed cost de transporte, precificação dinâmica por rota e governança operacional de armazém (WMS) — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Logística/Transporte?',
    blocoDestravarTexto:
      'A VETOR MASTER elimina as viagens improdutivas e os custos imprevistos de manutenção corretiva na sua frota. O Diagnóstico Estratégico reestrutura a precificação de rotas e implanta governança operacional no armazém e na estrada.',
    botaoDestravarTexto: 'Diagnóstico para Logística/Transporte',
    questionarioPath: '/questionario/transporte',
    microEpifanias: [
      'Quilômetros rodados vazios (frete de retorno zero)',
      'Ociosidade da frota de veículos disponíveis',
      'Custo real por km rodado acima da média regional',
      'Manutenções corretivas devorando o orçamento das preventivas',
    ],
    textoFechado:
      'Cargas, Passageiros, Distribuição e Armazenagem. Operações logísticas com forte impacto de custos de combustível, manutenção e eficiência de malha viária.',
    textoAberto:
      'Diagnóstico Estratégico de roteirização e landed cost de transporte, precificação dinâmica por rota e governança operacional de armazém (WMS) — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '10',
    id: 'educacao',
    nome: 'Educação',
    slug: 'educacao',
    subsegmentosLinha: 'Básica, Superior, Técnico, Idiomas e Edtech.',
    segmentos: ['Básica', 'Superior', 'Técnico', 'Idiomas', 'Edtech'],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Básica, Superior, Técnico, Idiomas e Edtech. Instituições de ensino com desafios de retenção de alunos, inadimplência e sazonalidade de matrículas.',
    gargaloCritico:
      'Evasão silenciosa de alunos durante o semestre · vagas ociosas em turmas com custo fixo pleno · inadimplência sem régua automatizada · concessão descontrolada de bolsas e descontos.',
    alavancaDeterministica:
      'Diagnóstico Estratégico com régua preditiva de retenção de alunos, alocação de docentes por margem de contribuição e automatização da esteira de matrículas — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Educação?',
    blocoDestravarTexto:
      'A VETOR MASTER combate a evasão precoce e a inadimplência que drenam o caixa das instituições de ensino. O Diagnóstico Estratégico equilibra a relação entre custo de corpo docente e receita por turma, protegendo a perenidade da instituição.',
    botaoDestravarTexto: 'Diagnóstico para Educação',
    questionarioPath: '/questionario/educacao',
    microEpifanias: [
      'Evasão de alunos silenciosa durante o semestre',
      'Vagas ociosas em turmas mantidas com custo fixo pleno',
      'Inadimplência de mensalidades sem régua de cobrança',
      'Rotatividade docente afetando a reputação pedagógica',
    ],
    textoFechado:
      'Básica, Superior, Técnico, Idiomas e Edtech. Instituições de ensino com desafios de retenção de alunos, inadimplência e sazonalidade de matrículas.',
    textoAberto:
      'Diagnóstico Estratégico com régua preditiva de retenção de alunos, alocação de docentes por margem de contribuição e automatização da esteira de matrículas — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '11',
    id: 'agronegocio',
    nome: 'Agronegócio',
    slug: 'agronegocio',
    subsegmentosLinha: 'Grãos, Pecuária, Cana, Café e Fruticultura.',
    segmentos: ['Grãos', 'Pecuária', 'Cana', 'Café', 'Fruticultura'],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Grãos, Pecuária, Cana, Café e Fruticultura. Operações agropecuárias sujeitas a ciclos climáticos, precificação de commodities e gestão patrimonial familiar.',
    gargaloCritico:
      'Perdas na colheita por ineficiência de maquinário · aplicação de insumos sem critério de taxa variável · janelas críticas perdidas na colheita · comercialização sem proteção de travas de margem.',
    alavancaDeterministica:
      'Diagnóstico Estratégico com indicadores de custo por hectare por talhão, comitê de comercialização de safra e governança para sucessão e perenidade — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Agronegócio?',
    blocoDestravarTexto:
      'A VETOR MASTER traz governança corporativa e rigor financeiro para a gestão da fazenda. O Diagnóstico Estratégico mapeia os custos por hectare, otimiza o uso de máquinas e estrutura a autonomia operacional da liderança de campo.',
    botaoDestravarTexto: 'Diagnóstico para Agronegócio',
    questionarioPath: '/questionario/agronegocio',
    microEpifanias: [
      'Perda de colheita por ineficiência de maquinário',
      'Insumos aplicados sem critério de taxa variável',
      'Janelas críticas perdidas por falha de logística de escoamento',
      'Decisões de comercialização de safra centralizadas no patriarca',
    ],
    textoFechado:
      'Grãos, Pecuária, Cana, Café e Fruticultura. Operações agropecuárias sujeitas a ciclos climáticos, precificação de commodities e gestão patrimonial familiar.',
    textoAberto:
      'Diagnóstico Estratégico com indicadores de custo por hectare por talhão, comitê de comercialização de safra e governança para sucessão e perenidade — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
  {
    numero: '12',
    id: 'academias',
    nome: 'Academias de Ginástica',
    slug: 'academias-de-ginastica',
    subsegmentosLinha: 'Musculação, Estúdio, CrossFit, Pilates e Natação.',
    segmentos: ['Musculação', 'Estúdio', 'CrossFit', 'Pilates', 'Natação'],
    linhaSla: 'Diagnóstico em 72h · Devolutiva de 45 min',
    descricaoIntro:
      'Musculação, Estúdio, CrossFit, Pilates e Natação. Negócios de fitness e bem-estar com dependência de recorrência, ocupação de horários e retenção de alunos.',
    gargaloCritico:
      'Cancelamento precoce de alunos no 3º mês (churn) · capacidade ociosa em horários de vale mantendo custos fixos · planos promocionais sem margem · fundador imerso em atritos operacionais.',
    alavancaDeterministica:
      'Diagnóstico Estratégico com onboarding automatizado de retenção precoce, monetização dinâmica de horários ociosos e profissionalização da esteira de vendas — com devolutiva de 45 min.',
    blocoDestravarTitulo: 'Pronto para destravar o setor de Academias de Ginástica?',
    blocoDestravarTexto:
      'A VETOR MASTER rompe o ciclo vicioso de cancelamentos rápidos e horários ociosos nas academias. O Diagnóstico Estratégico eleva o LTV do aluno, otimiza a ocupação dos espaços e devolve o tempo do gestor para o crescimento do negócio.',
    botaoDestravarTexto: 'Diagnóstico para Academias de Ginástica',
    questionarioPath: '/questionario/academias',
    microEpifanias: [
      'Evasão crônica nos primeiros 90 dias do aluno',
      'Horários de vale ociosos sustentando custos fixos',
      'Planos promocionais congelados ou sem margem',
      'Fundador atuando como coordenador de recepção e manutenção',
    ],
    textoFechado:
      'Musculação, Estúdio, CrossFit, Pilates e Natação. Negócios de fitness e bem-estar com dependência de recorrência, ocupação de horários e retenção de alunos.',
    textoAberto:
      'Diagnóstico Estratégico com onboarding automatizado de retenção precoce, monetização dinâmica de horários ociosos e profissionalização da esteira de vendas — com devolutiva de 45 min.',
    metricaChave: 'Diagnóstico em 72h · Devolutiva de 45 min',
  },
]
