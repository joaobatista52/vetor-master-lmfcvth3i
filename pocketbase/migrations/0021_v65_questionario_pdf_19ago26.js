/// <reference path="../pb_data/types.d.ts" />
// 0021 — V6.5 (Questionários Consolidados, atualização fiel do PDF 19ago26)
//
// Reescreve o campo `questionario` (JSON) da coleção `setores` com a versão
// fiel ao PDF "Questionários_Consolidados_10_Setores_V6.5_19ago26".
//
// Alterações em relação à migration 0020:
//  - Adiciona bloco "Identificação da Empresa" (Razão Social, CNPJ, Data,
//    Segmento, Respondente, Cargo) no início de todos os 10 setores.
//  - Substitui a Seção 1 (Perfil) genérica por versões específicas para os
//    6 setores que antes usavam perfil genérico (Serviços, Indústria, Varejo,
//    Agronegócio, Construção Civil, Transporte/Logística), palavra por
//    palavra conforme o PDF.
//  - Corrige Tecnologia/Startups: a Seção 6 (Buffett) de Tecnologia passa a
//    ter 6 perguntas, onde 6.6 = "A empresa possui reserva de capital
//    (runway) para 12 meses de operação?". A Seção 6.6 separada (runway) é
//    removida — não existe no PDF.
//  - Adiciona o campo "Documentação Adicional (Opcional)" ao final da Seção
//    9 (Balanço Patrimonial, DRE, Organograma, Relatórios de Vendas) como
//    checkbox multi-seleção.
//  - Versão do questionário marcada como "6.5-consolidado-pdf-19ago26".
migrate(
  (app) => {
    function findBySlug(slug) {
      try {
        return app.findFirstRecordByData('setores', 'slug', slug)
      } catch (_) {
        return null
      }
    }

    function S(texto, tipo, opcoes, placeholder) {
      var o = { texto: texto }
      if (tipo) o.tipo = tipo
      if (opcoes) o.opcoes = opcoes
      if (placeholder) o.placeholder = placeholder
      return o
    }

    // --- Opções reutilizáveis (fiéis ao PDF V6.5) ---
    var SNP = ['Sim', 'Não', 'Parcialmente'] // Sim/Não/Parcialmente
    var SN = ['Sim', 'Não'] // Sim/Não
    var DISP = ['Alto', 'Médio', 'Baixo'] // disposição
    var FORMATO = ['MaaS', 'Híbrido', 'CaaS', 'Ainda não sei']
    var MAT_SAUDE = ['1 — Básico', '2 — Intermediário', '3 — Avançado']
    var MAT = ['1', '2', '3']
    var REG_NAC = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real']
    var REG_SIMP = ['Simples', 'Lucro Presumido', 'Lucro Real']
    var PROP_PAD = ['Familiar', 'Sócios', 'Investidores', 'Outro']
    var PROP_TEC = ['Founder-led', 'Cofundadores', 'Investidores', 'Grupo']
    var ESTAGIO = ['Pré-seed', 'Seed', 'Série A', 'Série B+', 'Scale-up']
    var DOC_ADIC = ['Balanço Patrimonial', 'DRE', 'Organograma', 'Relatórios de Vendas']

    // --- Identificação da Empresa (comum a todos; só o Segmento varia) ---
    function buildIdentificacao(segmentos) {
      return [
        S('Razão Social:', 'texto', null, ''),
        S('CNPJ:', 'texto', null, ''),
        S('Data:', 'texto', null, '//______'),
        S('Segmento:', 'select', segmentos.concat(['Outro']), ''),
        S('Respondente:', 'texto', null, ''),
        S('Cargo:', 'texto', null, ''),
      ]
    }

    // --- Seção 1 — Perfil (setorial, 10 versões) ---

    var perfilSaude = [
      S('Qual o faturamento anual aproximado da empresa?', 'texto', null, ''),
      S('Quantas unidades/sedes a empresa possui?', 'numero', null, ''),
      S('Quantos colaboradores ao todo?', 'numero', null, ''),
      S(
        'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
        'texto',
        null,
        '',
      ),
      S('Estrutura de propriedade:', 'select', PROP_PAD, ''),
      S('Regime tributário:', 'select', REG_SIMP, ''),
      S('Principais fontes de receita (Convênios, Particular, SUS, etc.)?', 'texto', null, ''),
      S('Possui certificações (ONA, ISO, etc.)?', 'texto', null, ''),
    ]

    var perfilServicos = [
      S('Qual o faturamento anual aproximado da empresa?', 'texto', null, ''),
      S('Quantas unidades/sedes a empresa possui?', 'numero', null, ''),
      S('Quantos colaboradores ao todo?', 'numero', null, ''),
      S(
        'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
        'texto',
        null,
        '',
      ),
      S('Estrutura de propriedade:', 'select', PROP_PAD, ''),
      S('Regime tributário:', 'select', REG_SIMP, ''),
      S(
        'Principais fontes de receita (projetos, contratos recorrentes, honorários, etc.)?',
        'texto',
        null,
        '',
      ),
      S('Possui certificações ou reconhecimentos de mercado?', 'texto', null, ''),
    ]

    var perfilIndustria = [
      S('Qual o faturamento anual aproximado da empresa?', 'texto', null, ''),
      S('Quantas unidades/sedes (plantas) a empresa possui?', 'numero', null, ''),
      S('Quantos colaboradores ao todo?', 'numero', null, ''),
      S(
        'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
        'texto',
        null,
        '',
      ),
      S('Estrutura de propriedade:', 'select', PROP_PAD, ''),
      S('Regime tributário:', 'select', REG_SIMP, ''),
      S(
        'Principais fontes de receita (B2B, B2C, distribuição, exportação, etc.)?',
        'texto',
        null,
        '',
      ),
      S('Possui certificações (ISO, etc.)?', 'texto', null, ''),
    ]

    var perfilVarejo = [
      S('Qual o faturamento anual aproximado da empresa?', 'texto', null, ''),
      S('Quantas unidades/lojas a empresa possui?', 'numero', null, ''),
      S('Quantos colaboradores ao todo?', 'numero', null, ''),
      S(
        'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
        'texto',
        null,
        '',
      ),
      S('Estrutura de propriedade:', 'select', PROP_PAD, ''),
      S('Regime tributário:', 'select', REG_SIMP, ''),
      S(
        'Principais fontes de receita (loja física, e-commerce, marketplaces, etc.)?',
        'texto',
        null,
        '',
      ),
      S('Possui certificações ou reconhecimentos de mercado?', 'texto', null, ''),
    ]

    var perfilAgronegocio = [
      S('Qual o faturamento anual aproximado da empresa?', 'texto', null, ''),
      S('Quantas unidades/fazendas a empresa possui?', 'numero', null, ''),
      S('Quantos colaboradores ao todo?', 'numero', null, ''),
      S(
        'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
        'texto',
        null,
        '',
      ),
      S('Estrutura de propriedade:', 'select', PROP_PAD, ''),
      S('Regime tributário:', 'select', REG_SIMP, ''),
      S('Principais fontes de receita (commodities, pecuária, trading, etc.)?', 'texto', null, ''),
      S('Possui certificações (sustentabilidade, orgânico, etc.)?', 'texto', null, ''),
    ]

    var perfilTecnologia = [
      S('Qual a receita anual recorrente (ARR/MRR) aproximada?', 'texto', null, ''),
      S('Estágio:', 'select', ESTAGIO, ''),
      S('Colaboradores por área (Engenharia, Comercial, Ops)?', 'texto', null, ''),
      S('Crescimento de receita nos últimos 3 anos?', 'texto', null, ''),
      S('Propriedade:', 'select', PROP_TEC, ''),
      S('Regime tributário atual?', 'select', REG_NAC, ''),
      S('Fontes de receita (MRR, Contratos, Marketplace, Serviços)?', 'texto', null, ''),
      S('Possui métricas definidas (CAC, LTV, Churn, Payback)?', 'select', SNP, ''),
    ]

    var perfilConstrucao = [
      S('Qual o faturamento anual aproximado da empresa?', 'texto', null, ''),
      S('Quantas obras/unidades a empresa possui em andamento?', 'numero', null, ''),
      S('Quantos colaboradores ao todo?', 'numero', null, ''),
      S(
        'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
        'texto',
        null,
        '',
      ),
      S('Estrutura de propriedade:', 'select', PROP_PAD, ''),
      S('Regime tributário:', 'select', REG_SIMP, ''),
      S(
        'Principais fontes de receita (obras privadas, públicas, incorporação, etc.)?',
        'texto',
        null,
        '',
      ),
      S('Possui certificações (ISO, PBQP-H, etc.)?', 'texto', null, ''),
    ]

    var perfilTransporte = [
      S('Qual o faturamento anual aproximado da empresa?', 'texto', null, ''),
      S('Quantas unidades/bases a empresa possui?', 'numero', null, ''),
      S('Quantos colaboradores ao todo?', 'numero', null, ''),
      S(
        'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
        'texto',
        null,
        '',
      ),
      S('Estrutura de propriedade:', 'select', PROP_PAD, ''),
      S('Regime tributário:', 'select', REG_SIMP, ''),
      S('Principais fontes de receita (fretes, contratos, distribuição, etc.)?', 'texto', null, ''),
      S('Possui certificações (ISO, ANTT, etc.)?', 'texto', null, ''),
    ]

    var perfilEducacao = [
      S('Faturamento anual aproximado?', 'texto', null, ''),
      S('Unidades (campi, filiais, polos EAD)?', 'numero', null, ''),
      S('Colaboradores (Docentes vs. Adm/Pedagógico)?', 'texto', null, ''),
      S('Alunos matriculados e capacidade instalada?', 'texto', null, ''),
      S('Tempo de operação e crescimento nos últimos 3 anos?', 'texto', null, ''),
      S('Estrutura de propriedade?', 'select', PROP_PAD, ''),
      S('Regime tributário atual?', 'select', REG_NAC, ''),
      S('Fontes de receita (Mensalidades, Matrículas, Convênios)?', 'texto', null, ''),
      S('Certificações (MEC, ISO, Internacionais)?', 'texto', null, ''),
    ]

    var perfilAcademias = [
      S('Faturamento anual aproximado?', 'texto', null, ''),
      S('Unidades (academias/estúdios)?', 'numero', null, ''),
      S('Colaboradores (Instrutores vs. Adm/Atendimento)?', 'texto', null, ''),
      S('Alunos ativos e capacidade instalada?', 'texto', null, ''),
      S('Tempo de operação e crescimento nos últimos 3 anos?', 'texto', null, ''),
      S('Estrutura de propriedade?', 'select', PROP_PAD, ''),
      S('Regime tributário atual?', 'select', REG_NAC, ''),
      S('Fontes de receita (Mensalidades, Planos, Personal, Loja)?', 'texto', null, ''),
      S('Certificações ou premiações setoriais?', 'texto', null, ''),
    ]

    var perfilPorSlug = {
      saude: perfilSaude,
      'servicos-profissionais': perfilServicos,
      industria: perfilIndustria,
      varejo: perfilVarejo,
      agronegocio: perfilAgronegocio,
      'tecnologia-startups': perfilTecnologia,
      'construcao-civil': perfilConstrucao,
      'transporte-logistica': perfilTransporte,
      educacao: perfilEducacao,
      'academias-de-ginastica': perfilAcademias,
    }

    // --- Segmentos por slug (para a Identificação) ---
    var segmentosPorSlug = {
      saude: ['Hospitalar', 'Clínica', 'Odontológica', 'Laboratório', 'Home Care'],
      'servicos-profissionais': [
        'Consultoria',
        'Advocacia',
        'Contabilidade',
        'Arquitetura',
        'Agência',
        'TI',
      ],
      industria: ['Manufatura', 'Metalurgia', 'Alimentos', 'Químico', 'Têxtil', 'Plástico'],
      varejo: ['Lojas Físicas', 'E-commerce', 'Distribuição', 'Alimentação', 'Moda'],
      agronegocio: ['Grãos', 'Pecuária', 'Cana', 'Café', 'Fruticultura'],
      'tecnologia-startups': ['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'Marketplace'],
      'construcao-civil': ['Edificações', 'Incorporação', 'Infraestrutura', 'Reformas'],
      'transporte-logistica': ['Cargas', 'Passageiros', 'Distribuição', 'Armazenagem'],
      educacao: ['Básica', 'Superior', 'Técnico', 'Idiomas', 'Edtech'],
      'academias-de-ginastica': ['Musculação', 'Estúdio', 'CrossFit', 'Pilates', 'Natação'],
    }

    // --- Seção 5 — Hackman (6 perguntas, comum a todos) ---
    var secaoHackman = [
      S('Existe um time real, com limites claros e interdependência definida?', 'select', SNP, ''),
      S('A direção da empresa está clara e convincente para todos?', 'select', SNP, ''),
      S('As tarefas e normas facilitam a execução do trabalho?', 'select', SNP, ''),
      S('A equipe dispõe de recursos e recompensas adequados?', 'select', SNP, ''),
      S('Existe coaching ou feedback contínuo para as lideranças?', 'select', SNP, ''),
      S('Quantos dos seus líderes são considerados de alta performance?', 'texto', null, ''),
    ]

    // --- Seção 6 — Buffett (6 perguntas) ---
    // Versão padrão (9 setores): 6.6 = "reserva de capital de giro para
    // 3 meses de operação".
    var secaoBuffett = [
      S('Qual a margem EBITDA atual aproximada?', 'texto', null, ''),
      S('Qual o nível de endividamento atual (Dívida Líquida / EBITDA)?', 'texto', null, ''),
      S('Qual o prazo médio de recebimento da carteira?', 'texto', null, ''),
      S('Qual o índice de inadimplência da carteira de clientes?', 'texto', null, ''),
      S('A empresa fecha DRE gerencial mensal até o 10º dia útil?', 'select', SNP, ''),
      S('Possui reserva de capital de giro para 3 meses de operação?', 'select', SNP, ''),
    ]

    // Versão Tecnologia/Startups: 6.6 = "reserva de capital (runway) para 12
    // meses de operação". Não há Seção 6.6 separada no PDF.
    var secaoBuffettTecnologia = [
      S('Qual a margem EBITDA atual aproximada?', 'texto', null, ''),
      S('Qual o nível de endividamento atual (Dívida Líquida / EBITDA)?', 'texto', null, ''),
      S('Qual o prazo médio de recebimento da carteira?', 'texto', null, ''),
      S('Qual o índice de inadimplência da carteira de clientes?', 'texto', null, ''),
      S('A empresa fecha DRE gerencial mensal até o 10º dia útil?', 'select', SNP, ''),
      S(
        'A empresa possui reserva de capital (runway) para 12 meses de operação?',
        'select',
        SNP,
        '',
      ),
    ]

    var buffettPorSlug = {
      'tecnologia-startups': secaoBuffettTecnologia,
    }

    // --- Seção 7 — Expectativas (5 perguntas, comum a todos) ---
    var secaoExpectativas = [
      S('O que o levou a buscar este diagnóstico?', 'textarea', null, ''),
      S('Qual o principal problema a resolver nos próximos 12 meses?', 'textarea', null, ''),
      S('Qual o horizonte de transformação desejado para a empresa?', 'textarea', null, ''),
      S('Nível de disposição para mudanças:', 'select', DISP, ''),
      S(
        'Já contratou consultoria ou mentoria anteriormente? Qual o resultado?',
        'textarea',
        null,
        '',
      ),
    ]

    // --- Seção 9 — Próximos Passos (4 campos + Documentação Adicional) ---
    var secaoProximosPassos = [
      S(
        'Você receberá um Diagnóstico Executivo com recomendações prioritárias.',
        'display',
        null,
        '',
      ),
      S('Autoriza sessão de devolutiva de 45 min?', 'select', SN, ''),
      S('Formato de interesse:', 'select', FORMATO, ''),
      S('Responsável pelos documentos:', 'texto', null, ''),
      S('Documentação Adicional (Opcional):', 'checkbox', DOC_ADIC, ''),
    ]

    // --- Seção 8 — Inovação e Tecnologia (setorial) ---
    var secaoInovacaoPorSlug = {
      saude: [
        S('Utiliza sistema de gestão de saúde/ERP integrado? Qual?', 'texto', null, ''),
        S('Seus sistemas operam em nuvem ou servidor local?', 'texto', null, ''),
        S(
          'Acompanha dashboards de ocupação, glosa e faturamento em tempo real?',
          'select',
          SNP,
          '',
        ),
        S('Utiliza prontuário eletrônico, IA ou telemedicina na operação?', 'texto', null, ''),
        S(
          'Quais processos são automatizados (faturamento, guias, cobrança)?',
          'textarea',
          null,
          '',
        ),
        S('Nível de maturidade digital:', 'select', MAT_SAUDE, ''),
        S(
          'Quais as maiores barreiras para inovar (Custo, Equipe, Integração)?',
          'textarea',
          null,
          '',
        ),
      ],
      'servicos-profissionais': [
        S('Utiliza ERP/CRM integrado (propostas, contratos, financeiro)? Qual?', 'texto', null, ''),
        S('Seus sistemas operam em nuvem?', 'select', SNP, ''),
        S(
          'Acompanha dashboards de utilização, receita e pipeline em tempo real?',
          'select',
          SNP,
          '',
        ),
        S('Utiliza IA para apoio a propostas, contratos ou pesquisa?', 'texto', null, ''),
        S('Quais processos administrativos já são automatizados?', 'textarea', null, ''),
        S('Nível de maturidade digital:', 'select', MAT, ''),
        S('Quais as maiores barreiras para digitalizar a operação?', 'textarea', null, ''),
      ],
      industria: [
        S(
          'Utiliza ERP integrado (produção, estoque, financeiro, fiscal)? Qual?',
          'texto',
          null,
          '',
        ),
        S('Seus sistemas operam em nuvem?', 'select', SNP, ''),
        S('Acompanha dashboards de OEE, refugo e margem em tempo real?', 'select', SNP, ''),
        S('Utiliza automação, IoT, robótica ou IA na linha de produção?', 'texto', null, ''),
        S('Quais processos já são automatizados (PCP, faturamento, NF-e)?', 'textarea', null, ''),
        S('Nível de maturidade digital:', 'select', MAT, ''),
        S('Quais as maiores barreiras para inovar na indústria?', 'textarea', null, ''),
      ],
      varejo: [
        S('Utiliza ERP/PDV integrado (estoque, vendas, financeiro)? Qual?', 'texto', null, ''),
        S('Seus sistemas operam em nuvem?', 'select', SNP, ''),
        S(
          'Acompanha dashboards de vendas, ruptura e ticket médio em tempo real?',
          'select',
          SNP,
          '',
        ),
        S('Utiliza e-commerce, marketplaces ou IA para precificação dinâmica?', 'texto', null, ''),
        S(
          'Quais processos são automatizados (reposição, faturamento, logística)?',
          'textarea',
          null,
          '',
        ),
        S('Nível de maturidade digital:', 'select', MAT, ''),
        S('Quais as maiores barreiras para inovar no varejo?', 'textarea', null, ''),
      ],
      agronegocio: [
        S('Utiliza sistema de gestão agrícola/ERP integrado? Qual?', 'texto', null, ''),
        S('Seus sistemas operam em nuvem?', 'select', SNP, ''),
        S(
          'Acompanha dashboards de produtividade, custo/ha e clima em tempo real?',
          'select',
          SNP,
          '',
        ),
        S('Utiliza agricultura de precisão, IoT, drones ou satélite?', 'texto', null, ''),
        S(
          'Quais processos são automatizados (insumos, rastreabilidade, trading)?',
          'textarea',
          null,
          '',
        ),
        S('Nível de maturidade digital:', 'select', MAT, ''),
        S('Quais as barreiras (incluindo conectividade no campo)?', 'textarea', null, ''),
      ],
      'tecnologia-startups': [
        S('Utiliza ERP/CRM integrado (vendas, financeiro, suporte)? Qual?', 'texto', null, ''),
        S('Sistemas em nuvem?', 'select', SNP, ''),
        S('Dashboards de MRR, Churn, CAC e NPS em tempo real?', 'select', SNP, ''),
        S('Utiliza IA generativa, automação ou dados para produto e comercial?', 'texto', null, ''),
        S(
          'Quais processos são automatizados (onboarding, cobrança, suporte)?',
          'textarea',
          null,
          '',
        ),
        S('Nível de maturidade digital:', 'select', MAT, ''),
        S('Quais as maiores barreiras para escalar (incluindo capital)?', 'textarea', null, ''),
      ],
      'construcao-civil': [
        S('Utiliza ERP ou software de gestão de obras? Qual?', 'texto', null, ''),
        S('Sistemas em nuvem?', 'select', SNP, ''),
        S('Dashboards de custo orçado vs. realizado e curva S em tempo real?', 'select', SNP, ''),
        S('Utiliza BIM, drones, IoT ou IA para planejamento e canteiro?', 'texto', null, ''),
        S(
          'Quais processos são automatizados (medições, materiais, faturamento)?',
          'textarea',
          null,
          '',
        ),
        S('Nível de maturidade digital:', 'select', MAT, ''),
        S('Quais as maiores barreiras para inovar na construção?', 'textarea', null, ''),
      ],
      'transporte-logistica': [
        S('Utiliza TMS ou ERP integrado (frota, rotas, financeiro)? Qual?', 'texto', null, ''),
        S('Sistemas em nuvem?', 'select', SNP, ''),
        S(
          'Dashboards de ociosidade, km vazios e entregas no prazo em tempo real?',
          'select',
          SNP,
          '',
        ),
        S('Utiliza telemetria, rastreamento ou IA para roteirização?', 'texto', null, ''),
        S(
          'Quais processos são automatizados (CT-e, agendamento, monitoramento)?',
          'textarea',
          null,
          '',
        ),
        S('Nível de maturidade digital:', 'select', MAT, ''),
        S('Quais as maiores barreiras para inovar na logística?', 'textarea', null, ''),
      ],
      educacao: [
        S('Utiliza ERP ou software de gestão escolar integrado? Qual?', 'texto', null, ''),
        S('Sistemas em nuvem?', 'select', SNP, ''),
        S('Dashboards de evasão, inadimplência e captação em tempo real?', 'select', SNP, ''),
        S('Utiliza EAD, plataformas digitais ou IA para ensino e comunicação?', 'texto', null, ''),
        S(
          'Quais processos são automatizados (matrícula, cobrança, comunicação)?',
          'textarea',
          null,
          '',
        ),
        S('Nível de maturidade digital:', 'select', MAT, ''),
        S('Quais as barreiras (incluindo resistência do corpo docente)?', 'textarea', null, ''),
      ],
      'academias-de-ginastica': [
        S('Utiliza sistema de gestão de academia ou ERP integrado? Qual?', 'texto', null, ''),
        S('Sistemas em nuvem?', 'select', SNP, ''),
        S('Dashboards de evasão, inadimplência e vendas em tempo real?', 'select', SNP, ''),
        S('Utiliza app próprio, IA ou automação para retenção e treinos?', 'texto', null, ''),
        S(
          'Quais processos são automatizados (matrícula online, acesso, cobrança)?',
          'textarea',
          null,
          '',
        ),
        S('Nível de maturidade digital:', 'select', MAT, ''),
        S('Quais as maiores barreiras para inovar na academia?', 'textarea', null, ''),
      ],
    }

    var slugs = [
      'saude',
      'servicos-profissionais',
      'industria',
      'varejo',
      'agronegocio',
      'tecnologia-startups',
      'construcao-civil',
      'transporte-logistica',
      'educacao',
      'academias-de-ginastica',
    ]

    for (var i = 0; i < slugs.length; i++) {
      var slug = slugs[i]
      var rec = findBySlug(slug)
      if (!rec) continue

      var segmentos = segmentosPorSlug[slug] || []
      var identificacao = buildIdentificacao(segmentos)
      var perfil = perfilPorSlug[slug] || []
      var secaoInovacao = secaoInovacaoPorSlug[slug] || []
      var buffett = buffettPorSlug[slug] || secaoBuffett

      var questionarioCompleto = {
        versao: '6.5-consolidado-pdf-19ago26',
        identificacao: identificacao,
        secao_1_perfil: perfil,
        secao_5_hackman: secaoHackman,
        secao_6_buffett: buffett,
        secao_7_expectativas: secaoExpectativas,
        secao_8_inovacao: secaoInovacao,
        secao_9_proximos_passos: secaoProximosPassos,
      }

      rec.set('questionario', questionarioCompleto)
      app.save(rec)
    }
  },
  (app) => {
    // Reverte: limpa o campo `questionario` de todos os setores. A versão
    // anterior (0020) permanece aplicada no banco caso esta seja desfeita;
    // não é possível restaurar exatamente o JSON anterior sem reexecutar
    // 0020, então apenas anulamos o campo.
    try {
      var records = app.findRecordsByFilter('setores', '1=1', 'ordem', 0, 0)
      for (var i = 0; i < records.length; i++) {
        records[i].set('questionario', null)
        app.save(records[i])
      }
    } catch (_) {}
  },
)
