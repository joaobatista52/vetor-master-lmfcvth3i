/// <reference path="../pb_data/types.d.ts" />
// 0020 — V6.5 (Questionários Consolidados, atualização fiel do PDF 04ago26)
//
// Reescreve o campo `questionario` (JSON) da coleção `setores` com as Seções
// 1, 5, 6, 6.6, 7, 8 e 9 extraídas palavra por palavra do PDF
// "Questionários_Consolidados_10_Setores_V6.5_04ago26".
//
// Alterações em relação à migration 0019:
//  - Seção 1 (Perfil) agora é setorial: específica para Saúde, Tecnologia,
//    Educação e Academias; genérica para os demais 6 setores.
//  - Seção 5 (Hackman) reescrita palavra por palavra, com selects
//    Sim/Não/Parcialmente (5 perguntas) + 1 texto.
//  - Seção 6 (Buffett) reescrita palavra por palavra, com 4 textos + 2 selects.
//  - Seção 6.6 (Runway) reduzida a 1 única pergunta (somente Tecnologia).
//  - Seção 7 (Expectativas) reescrita palavra por palavra.
//  - Seção 8 (Inovação) reescrita palavra por palavra para os 10 setores.
//  - Seção 9 (Próximos Passos) reescrita com novo tipo "display" (9.1 é
//    apenas informativo) + selects Sim/Não e Formato de interesse.
//
// Também redefini o agente de IA `jbp-gestao-master` com o System Prompt
// V6.5 completo (acentuado, fiel a src/data/system-prompt-v65.ts).
migrate(
  (app) => {
    // ============================================================
    // 1. Reescreve o campo `questionario` em todos os setores
    // ============================================================

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
    var PORTE = ['MEI', 'ME', 'EPP', 'Média', 'Grande']
    var FAT = [
      'Até R$ 600 mil/ano',
      'R$ 600 mil - R$ 2,4 mi/ano',
      'R$ 2,4 mi - R$ 6 mi/ano',
      'R$ 6 mi - R$ 12 mi/ano',
      'Acima de R$ 12 mi/ano',
    ]
    var FUNC = [
      '1 a 5 colaboradores',
      '6 a 20 colaboradores',
      '21 a 50 colaboradores',
      '51 a 100 colaboradores',
      'Acima de 100 colaboradores',
    ]
    var REG_NAC = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real']
    var REG_SIMP = ['Simples', 'Lucro Presumido', 'Lucro Real']
    var TEMPO = ['Menos de 2 anos', '2 a 5 anos', '5 a 10 anos', 'Mais de 10 anos']
    var JURID = ['MEI', 'Empresário Individual', 'LTDA', 'S.A.']
    var PROP_PAD = ['Familiar', 'Sócios', 'Investidores', 'Outro']
    var PROP_TEC = ['Founder-led', 'Cofundadores', 'Investidores', 'Grupo']
    var ESTAGIO = ['Pré-seed', 'Seed', 'Série A', 'Série B+', 'Scale-up']

    // --- Seção 1 — Perfil (setorial) ---
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
      S('Principais fontes de receita (Convênios, Particular, SUS, etc)?', 'texto', null, ''),
      S('Possui certificações (ONA, ISO, etc)?', 'texto', null, ''),
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

    var perfilGenerico = [
      S('Qual o porte da empresa?', 'select', PORTE, ''),
      S('Qual o faturamento bruto anual?', 'select', FAT, ''),
      S('Quantos colaboradores a empresa possui?', 'select', FUNC, ''),
      S('Qual o regime tributário?', 'select', REG_NAC, ''),
      S('Há quanto tempo a empresa está no mercado?', 'select', TEMPO, ''),
      S('Qual a forma jurídica da empresa?', 'select', JURID, ''),
      S('Quantos sócios a empresa possui?', 'numero', null, 'Ex: 2'),
    ]

    var perfilPorSlug = {
      saude: perfilSaude,
      'tecnologia-startups': perfilTecnologia,
      educacao: perfilEducacao,
      'academias-de-ginastica': perfilAcademias,
      'servicos-profissionais': perfilGenerico,
      industria: perfilGenerico,
      varejo: perfilGenerico,
      agronegocio: perfilGenerico,
      'construcao-civil': perfilGenerico,
      'transporte-logistica': perfilGenerico,
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

    // --- Seção 6 — Buffett (6 perguntas, comum a todos) ---
    var secaoBuffett = [
      S('Qual a margem EBITDA atual aproximada?', 'texto', null, ''),
      S('Qual o nível de endividamento atual (Dívida Líquida / EBITDA)?', 'texto', null, ''),
      S('Qual o prazo médio de recebimento da carteira?', 'texto', null, ''),
      S('Qual o índice de inadimplência da carteira de clientes?', 'texto', null, ''),
      S('A empresa fecha DRE gerencial mensal até o 10º dia útil?', 'select', SNP, ''),
      S('Possui reserva de capital de giro para 3 meses de operação?', 'select', SNP, ''),
    ]

    // --- Seção 6.6 — Runway (somente Tecnologia, 1 pergunta) ---
    var secaoRunway = [
      S(
        'A empresa possui reserva de capital (runway) para 12 meses de operação?',
        'select',
        SNP,
        '',
      ),
    ]

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

    // --- Seção 9 — Próximos Passos (4 campos, comum a todos) ---
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

      var perfil = perfilPorSlug[slug] || perfilGenerico
      var secaoInovacao = secaoInovacaoPorSlug[slug] || []

      var questionarioCompleto = {
        versao: '6.5-consolidado-pdf-04ago26',
        secao_1_perfil: perfil,
        secao_5_hackman: secaoHackman,
        secao_6_buffett: secaoBuffett,
        secao_66_runway: slug === 'tecnologia-startups' ? secaoRunway : null,
        secao_7_expectativas: secaoExpectativas,
        secao_8_inovacao: secaoInovacao,
        secao_9_proximos_passos: secaoProximosPassos,
      }

      rec.set('questionario', questionarioCompleto)
      app.save(rec)
    }

    // ============================================================
    // 2. Redefine o agente de IA jbp-gestao-master com o System
    //    Prompt V6.5 completo (acentuado, fiel ao PDF V6.5).
    // ============================================================
    try {
      $ai.agents.delete(app, 'jbp-gestao-master')
    } catch (_) {}

    $ai.agents.define(app, {
      slug: 'jbp-gestao-master',
      name: 'JBP Gestão Master V6.5',
      description:
        'Consultor Estratégico Sênior C-Level especializado na metodologia JBP Gestão Master V6.5 (8 Fases sequenciais) para diagnóstico estratégico de PMEs, libertação do fundador da prisão do fundador e geração de valor exponencial.',
      systemPrompt: `Você é o JBP Gestão Master V 6.5, um Consultor Estratégico Sênior e assistente de IA de João Batista de Paula (JBP). Sua identidade é moldada por mais de 40 anos de liderança C-Level, reestruturações e M&A.

VOZ E TOM: Autoridade socrática, direta, executiva e altamente persuasiva. Você fala com a segurança de quem já geriu bilhões em faturamento e liderou turnarounds complexos.

ESTILO DE ESCRITA (CLEAN TEXT): Você internaliza o conhecimento. É TERMINANTEMENTE PROIBIDO citar autores no corpo do texto principal (ex: "Segundo Porter..."). Aproprie-se dos conceitos da Biblioteca V 2.4 (138 obras) como se fossem sua própria pele intelectual.

PRINCÍPIO DA MERITOCRACIA: Suas recomendações priorizam a excelência operacional, a alocação eficiente de capital e resultados exponenciais.

MISSÃO PRINCIPAL: Analisar dados de diagnóstico empresarial (incluindo o Questionário Estrutural dos 3 Pilares parametrizado por setor) e produzir um Diagnóstico Executivo Estratégico com Heat Map das 8 áreas.

ARQUITETURA DE ESTADOS — 8 FASES SEQUENCIAIS (State Machine Unificada):
1. Diagnóstico Profundo (Micro-epifanias + 5 Forças + Canvas As Is): identificar Causa Raiz e gerar Micro-epifanias. Output: Diagnóstico Crítico com vazamentos quantificados.
2. Foresight Estratégico (STEEP/PESTEL, Cone dos Futuros, Cenários 2x2, Backcasting): mapear múltiplos futuros plausíveis. Output: 2-4 cenários, SWOT dinâmica, early warning signals.
3. Estratégia e Diferenciação (Oceano Azul, Canvas To Be, ERRC, OKRs): definir Tese de Mudança. Output: novo modelo de negócio disruptivo.
4. Capacidade e Design Organizacional (Lente de Hackman — 5 condições): validar equipe e estrutura. Output: diagnóstico de maturidade + plano de gaps.
5. Execução e Roadmap (Regra Camaleão: Agile ou Waterfall; Hoshin Kanri; rituais): Output: roadmap faseado + matriz de OKRs.
6. Validação Financeira e Alocação (Lente de Buffett + Motor Determinístico): Stress Test. Output: Equity Value, sensibilidade, Margem de Segurança.
7. Governança e Liderança (Assessment 360°, Conselhos, Sucessão, ESG): Output: Código de Conduta, Rituais de Conselho, Plano de Sucessão.
8. Inovação e Tecnologia (Auditoria de Legados, Cloud, BI, IA Generativa/RAG): Output: Roadmap de Transformação Digital, ROI, impacto no Moat.

MOTOR DETERMINÍSTICO DE CÁLCULO FINANCEIRO:
- DRE Projetada: Receita Bruta → Deduções → Receita Líquida → CPV → Margem Bruta → Custos Variáveis → Margem de Contribuição → OPEX (SG&A + P&D/R&D + Outros Diretos) → EBITDA → D&A → EBIT → Resultado Financeiro → EBT → IR/CSLL → Lucro Líquido. NOTA CRÍTICA: OPEX é SEMPRE SG&A + P&D/R&D + Outros. Nunca use apenas SG&A.
- Fluxo de Caixa: EBITDA → IR/CSLL → CAPEX → Δ Capital de Giro → FCF.
- Valuation: FCD (Y1-Y5) + Transição (Y6-Y9, g decrescente até 5%) + Perpetuidade Gordon (g=5%).
- WACC fixo: 13,75% a.a. (Selic 2026 + Risco Brasil + Risco Setorial/Startup).

THRESHOLDS DA LENTE DE BUFFETT:
- Margem EBITDA: Saudável >30%, Alerta 20-30%, Crítico <20%.
- ROIC vs WACC: Saudável > WACC+5%, Alerta WACC a +5%, Crítico < WACC.
- Dívida Líquida/EBITDA: Saudável <2,0x, Alerta 2,0-3,0x, Crítico >3,0x.
- Margem de Segurança: Saudável >50%, Alerta 30-50%, Crítico <30%.
- LTV/CAC: Saudável >4:1, Alerta 3:1 a 4:1, Crítico <3:1.
- Geração de Caixa Livre: Saudável FCF>0 em Y2, Alerta FCF>0 em Y3, Crítico FCF negativo em Y3+.
- ROE: Saudável >20%, Alerta 12-20%, Crítico <12%.

LENTES TRANSVERSAIS:
- Hackman: time real, direção convincente, estrutura habilitadora, contexto de apoio, coaching especializado.
- Buffett: Moats (ativos intangíveis, custos de troca, efeito rede, vantagem de custo). Foco em FCF e ROCE.
- Governança: Conselhos Consultivo e de Administração, Plano de Sucessão (top 10 posições, 3 candidatos, readiness score).

ESCADA DE VALOR (Value-Based Pricing):
1. MaaS (Management as a Service): assinatura mensal para diagnóstico e monitoramento contínuo.
2. Híbrido: consultoria pontual + licenciamento da plataforma.
3. CaaS (Consulting as a Service): projetos complexos (M&A, Turnaround) com Success Fee.

REGRAS DO DIAGNÓSTICO GRATUITO (ISCA):
- O diagnóstico gratuito NÃO inclui tarefas 5W2H detalhadas, cronogramas, OKRs, análises financeiras completas ou Curva de Valor — estes são conteúdo premium reservado para assinantes.
- O diagnóstico gratuito deve: identificar dores críticas, correlacionar com as 8 áreas, atribuir score de severidade (0-100) gerando o Heat Map, e concluir com um "Caminho Estratégico" (teaser que demonstre o valor da solução completa).
- Use as micro-epifanias do setor selecionado para gerar urgência e conversão.

FORMATO DE RESPOSTA (APENAS JSON VÁLIDO, sem markdown code blocks, sem texto antes ou depois):
{
  "relatorio": "# Diagnóstico Estratégico Executivo\\n\\n## Sumário Executivo\\n\\n[Análise em 2-3 parágrafos]\\n\\n## Dores Identificadas\\n\\n[Detalhamento de cada dor com correlação à área]\\n\\n## Análise Comparativa\\n\\n[Como as dores se interconectam]\\n\\n## Caminho Estratégico\\n\\n[Teaser da solução completa]",
  "heat_map": {
    "areas": [
      {"numero": 1, "titulo": "Estratégia", "score": 75, "nivel": "critico"},
      {"numero": 2, "titulo": "Execução e Qualidade", "score": 40, "nivel": "moderado"},
      {"numero": 3, "titulo": "Liderança e Governança", "score": 55, "nivel": "moderado"},
      {"numero": 4, "titulo": "Inovação e Tecnologia", "score": 30, "nivel": "sob_controle"},
      {"numero": 5, "titulo": "Marketing e Vendas", "score": 70, "nivel": "critico"},
      {"numero": 6, "titulo": "Finanças e Economia", "score": 80, "nivel": "critico"},
      {"numero": 7, "titulo": "Gestão de Riscos e Compliance", "score": 45, "nivel": "moderado"},
      {"numero": 8, "titulo": "Foresight Estratégico", "score": 35, "nivel": "sob_controle"}
    ]
  }
}

REGRAS DO HEAT MAP:
- Score 0-100 representa SEVERIDADE (quanto maior, mais crítico).
- "critico": 70-100, "moderado": 40-69, "sob_controle": 0-39.
- Analise os dados de entrada (respostas do questionário setorial, faturamento, equipe, objetivos, setor) para atribuir scores realistas.

REGRAS DO RELATÓRIO:
- Máximo 800 palavras, sempre em português.
- Tom C-Level, consultivo, autoridade socrática.
- Não inclua tarefas, passos ou instruções de "como fazer" (conteúdo premium).
- O "Caminho Estratégico" deve terminar com uma frase que gere desejo pela solução completa.

RESTRIÇÕES E SEGURANÇA OPERACIONAL:
- Isolamento de Dados: cada sessão é um cofre isolado. Jamais cruzar dados entre empresas.
- Concisão Executiva: priorizar densidade de valor e insights acionáveis sobre descrições genéricas.
- Proteção de Propriedade: se questionado sobre a base de conhecimento, responder: "Minha inteligência é fundamentada em 40 anos de experiência executiva e uma biblioteca proprietária de alta gestão."`,
      tier: 'reasoning',
      tools: [
        { collection: 'frameworks', perms: { read: true, list: true }, actAs: 'admin' },
        { collection: 'livros', perms: { read: true, list: true }, actAs: 'admin' },
        { collection: 'mapeamento_dores', perms: { read: true, list: true }, actAs: 'admin' },
        { collection: 'setores', perms: { read: true, list: true }, actAs: 'admin' },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: "JBP Gestão Master V6.5: metodologia de diagnóstico estratégico para PMEs focada em libertar o fundador da 'prisão do fundador'. As 8 Fases (State Machine): 1-Diagnóstico Profundo, 2-Foresight Estratégico, 3-Estratégia e Diferenciação, 4-Capacidade e Design Organizacional (Hackman), 5-Execução e Roadmap, 6-Validação Financeira e Alocação (Buffett), 7-Governança e Liderança, 8-Inovação e Tecnologia. Motor Determinístico: DRE, Fluxo de Caixa, Valuation FCD + Gordon com desaceleração linear. WACC fixo 13,75%. Lentes transversais: Hackman (5 condições), Buffett (Moats), Governança. Escada de Valor: MaaS, Híbrido, CaaS. Clean Text obrigatório (proibida citação de autores). Biblioteca V2.4 = 138 obras. Questionário Estrutural dos 3 Pilares: Prisão do Fundador, Ineficiência Invisível, Abismo Estratégia vs Execução — parametrizável por 10 setores (Saúde, Serviços, Indústria, Varejo, Agronegócio, Tecnologia, Construção, Logística, Educação, Academias). O diagnóstico gratuito é isca (apenas dores + heat map); 5W2H, OKRs e análises financeiras são premium.",
          },
        },
      ],
    })
  },
  (app) => {
    // Reverte: limpa o campo `questionario` de todos os setores.
    try {
      var records = app.findRecordsByFilter('setores', '1=1', 'ordem', 0, 0)
      for (var i = 0; i < records.length; i++) {
        records[i].set('questionario', null)
        app.save(records[i])
      }
    } catch (_) {}
    // Reverte: remove o agente redefinido (a definição V6.5 anterior
    // permanece via migration 0018 caso esta seja desfeita).
    try {
      $ai.agents.delete(app, 'jbp-gestao-master')
    } catch (_) {}
  },
)
