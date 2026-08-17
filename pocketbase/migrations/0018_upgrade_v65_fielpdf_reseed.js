/// <reference path="../pb_data/types.d.ts" />
// V6.5 Upgrade (Msg 2) — upgrade completo a partir dos 4 PDFs originais.
//
// 1. frameworks: re-semeia 8 areas (incluindo Area 8 Foresight) com texto
//    acentuado fiel ao master-framework-v65.txt.
// 2. setores: 10 registros com perguntas dos 3 Pilares palavra por palavra
//    do PDF "Contexto Estrategico Global 10 Setores V6.5" (financeiro, nao
//    financial). Reescreve todas as perguntas para corrigir o uso anterior
//    de "financial" e garantir fidelidade total ao PDF.
// 3. livros: re-semeia 138 obras da Biblioteca V2.4 (inclui Security Analysis
//    #111 e remove o "Volume Complementar" espurio de Sun Tzu).
// 4. Agente IA jbp-gestao-master: redefinido com o System Prompt V6.5
//    completo, acentuado, extraido fielmente do system-prompt-v65.txt
//    (8 Fases, Motor Deterministico, Clean Text, thresholds de Buffett,
//    lentes transversais, Escada de Valor, restricoes de seguranca).
migrate(
  (app) => {
    // ============================================================
    // 1. Re-semeia `frameworks` (8 areas V6.5) — texto acentuado
    // ============================================================
    var fwCol = app.findCollectionByNameOrId('frameworks')
    app.db().newQuery('DELETE FROM frameworks WHERE 1=1').execute()
    var areas = [
      {
        n: 1,
        t: 'Estratégia',
        c: 'Mapear o mercado com precisão cirúrgica e definir posicionamento disruptivo para capturar valor exponencial. Canvas As Is/To Be, 5 Forças de Porter, Oceano Azul, Matriz ERRC e Curva de Valor.',
        r: 'Clean Text: voz direta, assertiva e sem adjetivação desnecessária. Stress Test de Buffett: ROI projetado > 30% a.a. e margem de segurança > 50%. Proibição absoluta de citação acadêmica no corpo do texto.',
      },
      {
        n: 2,
        t: 'Execução e Qualidade',
        c: 'Garantir a implementação da estratégia com excelência operacional. Regra Camaleão (Agile/Waterfall), Hoshin Kanri, OKRs trimestrais e rituais de gestão (Daily, Weekly, Monthly).',
        r: 'Adaptar a cadência à maturidade organizacional. OKRs alinhados verticalmente via Hoshin Kanri.',
      },
      {
        n: 3,
        t: 'Liderança e Governança',
        c: 'Estruturar liderança de alta performance, planos de sucessão e governança corporativa. Tiers A/B/C, Conselho Consultivo e de Administração, Compliance e ESG.',
        r: 'Tolerância zero a desvios éticos ou financeiros. Shadow leadership trimestral para sucessores.',
      },
      {
        n: 4,
        t: 'Inovação e Tecnologia',
        c: 'Transformar tecnologia em vantagem competitiva absoluta (Moat). Auditoria de legados, Cloud, BI, IA Generativa/RAG e automação de processos cognitivos.',
        r: 'Stress Test de Buffett: toda tecnologia deve ampliar o Moat ou reduzir o custo marginal em > 50%. Regra Camaleão: adaptar a tecnologia ao nível de maturidade do cliente.',
      },
      {
        n: 5,
        t: 'Marketing e Vendas',
        c: 'Construção de uma Máquina de Vendas Previsível. ICP, Pirâmide de Chet Holmes, SDR/CRM (100 contatos/dia), LTV/CAC > 4:1 e upsell estruturado.',
        r: 'Upsell rate anual meta 30%. Otimização constante via inbound e upsell.',
      },
      {
        n: 6,
        t: 'Finanças e Economia',
        c: 'Engenharia Financeira e Proteção de Capital. Motor Determinístico: DRE, Fluxo de Caixa, Valuation FCD + Gordon com desaceleração linear. WACC 13,75%. OBZ. Alocação de capital com IRR > WACC + 10%.',
        r: 'Valuation DCF com atualização trimestral obrigatória. OPEX é SEMPRE SG&A + P&D/R&D + Outros Custos Operacionais Diretos.',
      },
      {
        n: 7,
        t: 'Gestão de Riscos e Compliance',
        c: 'Blindagem do Moat e Perenidade. Matriz de Calor (Probabilidade × Impacto), Compliance Jurídico (LGPD, NDAs), Sucessão e Tolerância Zero.',
        r: 'Tolerância zero a desvios éticos ou financeiros. Mitigação de riscos vermelhos em no máximo 90 dias.',
      },
      {
        n: 8,
        t: 'Foresight Estratégico',
        c: 'Preparar a organização para volatilidade e incerteza, criando vantagem antecipatória. STEEP/PESTEL, Cone dos Futuros, Roda de Futuros, Cenários 2x2 e Backcasting.',
        r: 'Integração: Foresight alimenta o Planejamento Estratégico via SWOT dinâmica e OKRs flexíveis calibrados pelos cenários.',
      },
    ]
    for (var i = 0; i < areas.length; i++) {
      var r = new Record(fwCol)
      r.set('area_numero', areas[i].n)
      r.set('titulo', areas[i].t)
      r.set('conteudo', areas[i].c)
      r.set('regras_ouro', areas[i].r)
      app.save(r)
    }

    // ============================================================
    // 2. Re-semeia `setores` (10 setores + perguntas dos 3 Pilares)
    //    Texto fiel ao PDF (financeiro, nunca financial).
    // ============================================================
    var setCol = app.findCollectionByNameOrId('setores')
    app.db().newQuery('DELETE FROM setores WHERE 1=1').execute()

    function P(pilar, texto) {
      return { pilar: pilar, texto: texto }
    }

    var setoresData = [
      // 6.1 SAUDE
      {
        nome: 'Saúde',
        slug: 'saude',
        segmentos: ['Hospitalar', 'Clínica', 'Odontológica', 'Laboratório', 'Home Care'],
        epifanias: [
          'Glosa hospitalar invisível',
          'Ociosidade de leitos',
          'Retrabalho de faturamento',
          'Descasamento entre prontuário e conta',
        ],
        ordem: 1,
        perguntas: [
          P(
            1,
            'Quantas cirurgias ou procedimentos são cancelados por mês por falta de decisão da equipe?',
          ),
          P(
            1,
            'Qual o percentual de decisões de internação que dependem da sua validação pessoal?',
          ),
          P(1, 'Sua equipe clínica tem autonomia para protocolos de urgência sem te consultar?'),
          P(
            1,
            'Se você se ausentar por 30 dias, a operação assistencial mantém o padrão de qualidade?',
          ),
          P(1, 'Quantas decisões de compra de insumos de alto custo passam por você pessoalmente?'),
          P(1, 'Existe um diretor técnico com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o índice de glosa das contas hospitalares no último trimestre?'),
          P(2, 'Quanto tempo a equipe perde com retrabalho de faturamento ou guias de convênio?'),
          P(2, 'Quantas horas administrativas são gastas por profissionais de saúde semanalmente?'),
          P(2, 'Quantos contratos com operadoras estão há mais de 12 meses sem revisão de tabela?'),
          P(2, 'Qual o valor total da inadimplência atual e quem são os 10 maiores devedores?'),
          P(2, 'Qual a taxa de ocupação média de leitos ou salas de atendimento?'),
          P(
            2,
            'Qual o volume de procedimentos realizados que não foram faturados por erro de registro?',
          ),
          P(
            3,
            'Qual o prazo médio entre uma decisão da diretoria e a implementação na ponta clínica?',
          ),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe comercial/faturamento sabe o lucro real por procedimento ou convênio?'),
          P(
            3,
            'Quantas reuniões de alinhamento entre corpo clínico e administrativo ocorrem por mês?',
          ),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'A equipe sabe exatamente o custo real de cada procedimento realizado?'),
        ],
      },
      // 6.2 SERVICOS PROFISSIONAIS
      {
        nome: 'Serviços Profissionais',
        slug: 'servicos-profissionais',
        segmentos: ['Consultoria', 'Advocacia', 'Contabilidade', 'Arquitetura', 'Agência', 'TI'],
        epifanias: [
          'Horas não cobradas',
          'Taxa de utilização',
          'Contratos sem revisão de preço',
          'Custo de oportunidade do sócio',
        ],
        ordem: 2,
        perguntas: [
          P(
            1,
            'Qual % do faturamento depende de você estar pessoalmente na negociação ou entrega?',
          ),
          P(1, 'Quantos contratos estão parados aguardando sua assinatura ou aprovação?'),
          P(1, 'Sua equipe consegue fechar um negócio de valor médio sem te envolver?'),
          P(1, 'Se você tirar 60 dias de férias, a receita da empresa cai quanto?'),
          P(1, 'Quantas entregas ou propostas dependem da sua revisão final pessoal por semana?'),
          P(1, 'Existe um sócio/gerente com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Quantas horas são perdidas com retrabalho por falta de briefing padronizado?'),
          P(2, 'Qual o percentual de horas trabalhadas e não cobradas (vazamento de honorários)?'),
          P(
            2,
            'Quanto tempo a equipe gasta com tarefas administrativas que poderiam ser automatizadas?',
          ),
          P(2, 'Quantos contratos são renovados sem revisão de preço ou escopo?'),
          P(2, 'Qual o valor da inadimplência e quem são os 10 maiores devedores?'),
          P(2, 'Qual a taxa de utilização real (horas faturáveis / horas disponíveis) da equipe?'),
          P(2, 'Quantas propostas enviadas no último trimestre não foram convertidas e por quê?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na ponta?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe comercial sabe o lucro líquido por cliente que ela vende?'),
          P(
            3,
            'Quantas horas de reunião a equipe gasta discutindo o que já deveria ter sido feito?',
          ),
          P(3, 'A equipe sabe qual a meta de receita por consultor e como ela é calculada?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
        ],
      },
      // 6.3 INDUSTRIA
      {
        nome: 'Indústria',
        slug: 'industria',
        segmentos: ['Manufatura', 'Metalurgia', 'Alimentos', 'Químico', 'Têxtil', 'Plástico'],
        epifanias: [
          'Refugo',
          'Paradas não programadas',
          'Ociosidade de máquinas',
          'Giro de estoque',
          'Custo real da OP',
        ],
        ordem: 3,
        perguntas: [
          P(1, 'Quantos dias por mês você passa apagando incêndio no chão de fábrica?'),
          P(1, 'Qual o percentual das decisões de compra de matéria-prima que passam por você?'),
          P(
            1,
            'Sua equipe de produção tem autonomia para parar uma linha com problema sem te consultar?',
          ),
          P(1, 'Quantos fornecedores foram escolhidos pessoalmente por você sem critério formal?'),
          P(1, 'Quantas decisões de investimento em máquinas dependem exclusivamente de você?'),
          P(1, 'Existe um gerente industrial com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o percentual de refugo na linha de produção e o valor em reais?'),
          P(2, 'Quantas horas de parada não programada ocorreram e qual o custo/hora?'),
          P(2, 'Qual o giro de estoque dos seus 10 principais insumos?'),
          P(2, 'Quantos pedidos foram perdidos por atraso na entrega no último trimestre?'),
          P(2, 'Sua equipe comercial sabe a margem de contribuição de cada produto que vende?'),
          P(2, 'Qual o índice de ociosidade das suas máquinas mais caras?'),
          P(2, 'Qual o percentual de retrabalho ou devolução por defeito de fabricação?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na fábrica?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe de produção conhece a margem de contribuição do que fabrica?'),
          P(3, 'Quantas reuniões de alinhamento entre comercial e produção ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'Sua equipe de PCP sabe exatamente o custo real de cada ordem de produção?'),
        ],
      },
      // 6.4 VAREJO
      {
        nome: 'Varejo',
        slug: 'varejo',
        segmentos: ['Lojas Físicas', 'E-commerce', 'Distribuição', 'Alimentação', 'Moda'],
        epifanias: [
          'Ruptura de estoque',
          'Vendas perdidas',
          'Quebra/perda',
          'Ticket médio',
          'Margem por categoria',
        ],
        ordem: 4,
        perguntas: [
          P(1, 'Sua loja consegue operar 30 dias sem sua presença física?'),
          P(1, 'Quantas decisões de precificação e desconto a equipe toma sem te consultar?'),
          P(1, 'Quanto tempo leva para contratar um vendedor se você não aprovar pessoalmente?'),
          P(1, 'Qual o valor de mercadoria parada porque você não decidiu o que fazer com ela?'),
          P(1, 'Quantas decisões de compra de novos produtos passam por você mensalmente?'),
          P(1, 'Existe um gerente de loja com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o índice de ruptura de estoque dos seus 10 produtos mais vendidos?'),
          P(2, 'Quantas vendas foram perdidas por falta de produto na prateleira?'),
          P(2, 'Qual o percentual de devoluções e qual o motivo principal?'),
          P(2, 'Quanto gasta por mês com frete expresso por falha no planejamento de compras?'),
          P(2, 'Sua equipe sabe o ticket médio por vendedor e como melhorá-lo?'),
          P(2, 'Qual o índice de quebra/perda (furtos, vencimentos, danos) em reais?'),
          P(2, 'Qual o giro de estoque geral e por categoria de produto?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na loja?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe de loja sabe a meta de margem por categoria de produto?'),
          P(3, 'Quantas decisões da última reunião comercial foram efetivamente implementadas?'),
          P(3, 'Existe um comitê de gestão periódico entre lojas, compras e financeiro?'),
          P(3, 'A equipe sabe o lucro líquido por cliente, canal e produto vendido?'),
        ],
      },
      // 6.5 AGRONEGOCIO
      {
        nome: 'Agronegócio',
        slug: 'agronegocio',
        segmentos: ['Grãos', 'Pecuária', 'Cana', 'Café', 'Fruticultura'],
        epifanias: [
          'Perda na colheita',
          'Custo por hectare',
          'Ociosidade da frota',
          'Janelas perdidas',
          'Quebra técnica',
        ],
        ordem: 5,
        perguntas: [
          P(1, 'Quantas decisões de plantio, colheita ou venda dependem exclusivamente de você?'),
          P(1, 'Seu gerente de fazenda tem autonomia para contratar safristas sem sua aprovação?'),
          P(1, 'Quanto tempo você gasta resolvendo problemas operacionais de baixo valor?'),
          P(1, 'Quantas negociações de venda da safra passam por você pessoalmente por ano?'),
          P(1, 'Em janelas críticas, quantas decisões ficam travadas aguardando sua palavra?'),
          P(1, 'Existe um gerente de fazenda com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o % de perda na colheita por ineficiência e o valor em reais?'),
          P(2, 'Quanto gasta por safra com insumos aplicados sem critério de taxa variável?'),
          P(2, 'Qual o custo real por hectare das suas operações mecanizadas?'),
          P(2, 'Quantos dias de janela foram perdidos por falha no planejamento logístico?'),
          P(2, 'Qual o índice de ociosidade da sua frota de tratores e colheitadeiras?'),
          P(2, 'Qual o % de quebra técnica (mortalidade ou pragas) na produção?'),
          P(2, 'Qual o seu custo por hectare/cabeça comparado à referência regional?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação no campo?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe de campo sabe a meta de produtividade por talhão?'),
          P(3, 'Quantas decisões do planejamento safra foram efetivamente executadas?'),
          P(3, 'Existe um comitê de gestão periódico entre produção, comercial e financeiro?'),
          P(3, 'A equipe comercial sabe o custo de produção e a margem por produto?'),
        ],
      },
      // 6.6 TECNOLOGIA/STARTUPS
      {
        nome: 'Tecnologia/Startups',
        slug: 'tecnologia-startups',
        segmentos: ['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'Marketplace'],
        epifanias: [
          'Churn',
          'CAC/LTV',
          'Débito técnico',
          'Risco de concentração de receita',
          'Runway',
        ],
        ordem: 6,
        perguntas: [
          P(1, 'Qual % das decisões de produto e roadmap dependem exclusivamente de você?'),
          P(1, 'Quantas vendas enterprise dependem da sua presença pessoal na negociação?'),
          P(1, 'Sua equipe de engenharia consegue fazer deploy sem sua aprovação?'),
          P(1, 'Se você ficar 30 dias sem acesso, o que para de funcionar na empresa?'),
          P(1, 'Quantas decisões de contratação e precificação passam por você mensalmente?'),
          P(1, 'Existe um COO/CTO com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o churn mensal e quanto isso representa em receita perdida por ano?'),
          P(2, 'Qual o CAC/payback e o LTV por canal de aquisição?'),
          P(2, 'Quantas horas de engenharia são perdidas com débito técnico ou retrabalho?'),
          P(2, 'Qual o tempo de resposta do suporte e quantos clientes estão em risco?'),
          P(2, 'Qual o % da receita concentrado nos 10 maiores clientes?'),
          P(2, 'Quantos leads foram perdidos por atraso na resposta ou onboarding?'),
          P(2, 'Qual o índice de ativação e adoção efetiva da plataforma?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Sua equipe comercial sabe o LTV/CAC e margem por cliente?'),
          P(3, 'Quantas reuniões entre produto, engenharia e comercial ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'A equipe de CS sabe o NRR e a meta de expansão por cliente?'),
        ],
      },
      // 6.7 CONSTRUCAO CIVIL
      {
        nome: 'Construção Civil',
        slug: 'construcao-civil',
        segmentos: ['Edificações', 'Incorporação', 'Infraestrutura', 'Reformas'],
        epifanias: [
          'Desperdício de materiais',
          'Retrabalho',
          'Aditivos não cobrados',
          'Orçado vs. realizado',
        ],
        ordem: 7,
        perguntas: [
          P(1, 'Quantas decisões de obra (compras, cronograma) dependem de você por semana?'),
          P(
            1,
            'Quantas horas por semana você resolve problemas que o engenheiro deveria resolver?',
          ),
          P(1, 'Sua equipe de obra libera pagamentos ou aditivos sem te consultar?'),
          P(
            1,
            'Se você tirar 30 dias de férias, quantos cronogramas atrasam por falta de decisão?',
          ),
          P(1, 'Quantos orçamentos e negociações passam por você pessoalmente?'),
          P(1, 'Existe um diretor técnico com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o % de perda de materiais nos canteiros e o valor em reais?'),
          P(2, 'Quantos dias de cronograma foram perdidos por retrabalho no último trimestre?'),
          P(2, 'Qual o índice de horas ociosas da mão de obra (espera por material/decisão)?'),
          P(2, 'Qual o % de aditivos e serviços extras realizados e não cobrados?'),
          P(2, 'Sua equipe comercial sabe a margem de contribuição de cada obra?'),
          P(2, 'Qual a diferença média entre o orçado e o realizado nas obras atuais?'),
          P(2, 'Qual o giro de estoque de materiais e o capital imobilizado em almoxarifado?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação no canteiro?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'A engenharia sabe o custo orçado vs. realizado por serviço de cada obra?'),
          P(3, 'Quantas reuniões entre comercial, engenharia e financeiro ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'Sua equipe de planejamento sabe o custo real de cada etapa da obra?'),
        ],
      },
      // 6.8 TRANSPORTE/LOGISTICA
      {
        nome: 'Transporte/Logística',
        slug: 'transporte-logistica',
        segmentos: ['Cargas', 'Passageiros', 'Distribuição', 'Armazenagem'],
        epifanias: ['Km vazios', 'Ociosidade da frota', 'Custo por km', 'Manutenção corretiva'],
        ordem: 8,
        perguntas: [
          P(1, 'Quantas decisões de rota, frete ou manutenção dependem de você por semana?'),
          P(1, 'Quantas negociações com grandes embarcadores passam por você pessoalmente?'),
          P(1, 'Sua equipe consegue redirecionar uma carga ou resolver avaria sem te consultar?'),
          P(1, 'Se você tirar 30 dias de férias, quantas operações param por falta de decisão?'),
          P(1, 'Quantas decisões de contratação e compra de veículos passam por você?'),
          P(1, 'Existe um gerente de operações com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o % de km rodados vazios e o custo mensal disso?'),
          P(2, 'Qual o índice de ociosidade da frota (veículos parados vs. disponíveis)?'),
          P(2, 'Qual o custo real por km rodado (combustível, pneus, manutenção)?'),
          P(2, 'Quantas entregas atrasaram e qual o custo de multas contratuais?'),
          P(2, 'Qual o índice de avarias, roubos ou perdas de carga em reais/ano?'),
          P(2, 'Qual o consumo médio de combustível vs. referência do fabricante?'),
          P(2, 'Quantas manutenções corretivas ocorreram vs. preventivas planejadas?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na ponta?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'A equipe sabe o custo e margem por rota, cliente e tipo de carga?'),
          P(3, 'Quantas reuniões entre comercial, operação e manutenção ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'O comercial sabe o custo real de cada rota antes de precificar o frete?'),
        ],
      },
      // 6.9 EDUCACAO
      {
        nome: 'Educação',
        slug: 'educacao',
        segmentos: ['Básica', 'Superior', 'Técnico', 'Idiomas', 'Edtech'],
        epifanias: ['Evasão', 'Inadimplência', 'Vagas ociosas', 'Rotatividade docente'],
        ordem: 9,
        perguntas: [
          P(1, 'Quantas decisões pedagógicas (currículo, professores) dependem de você?'),
          P(1, 'Quantas matrículas e negociações de desconto passam por você mensalmente?'),
          P(1, 'Sua coordenação resolve problemas de alunos/pais sem te consultar?'),
          P(1, 'Se você tirar 30 dias de férias, o que para de funcionar na instituição?'),
          P(1, 'Quantas decisões de expansão e infraestrutura dependem só de você?'),
          P(1, 'Existe um diretor executivo com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o índice de evasão escolar e a receita perdida com isso?'),
          P(2, 'Qual o índice de inadimplência e o prazo médio de recebimento?'),
          P(2, 'Qual o % de vagas ociosas por turma e por unidade?'),
          P(2, 'Alunos captados vs. perdidos e o custo de aquisição (CAC)?'),
          P(2, 'Taxa de rotatividade de professores e custo de substituição?'),
          P(2, 'A equipe sabe o custo por aluno e a margem por curso/turma?'),
          P(2, 'Qual o reajuste real das mensalidades vs. inflação nos últimos 3 anos?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na sala de aula?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'A equipe pedagógica sabe a meta de retenção por turma?'),
          P(3, 'Quantas reuniões entre pedagógico, comercial e financeiro ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'O comercial sabe a margem de contribuição por curso, turno e unidade?'),
        ],
      },
      // 6.10 ACADEMIAS DE GINASTICA
      {
        nome: 'Academias de Ginástica',
        slug: 'academias-de-ginastica',
        segmentos: ['Musculação', 'Estúdio', 'CrossFit', 'Pilates', 'Natação'],
        epifanias: ['Evasão', 'Capacidade ociosa', 'Ocupação por horário', 'CAC por aluno'],
        ordem: 10,
        perguntas: [
          P(1, 'Quantas matrículas e negociações de desconto dependem de você mensalmente?'),
          P(1, 'Sua recepção resolve problemas de alunos sem te consultar?'),
          P(1, 'Quantos dias por semana você precisa estar presencialmente na unidade?'),
          P(1, 'Se você tirar 30 dias de férias, o que para de funcionar na operação?'),
          P(1, 'Quantas decisões de contratação e compra de equipamentos passam por você?'),
          P(1, 'Existe um gerente de unidade com autonomia formal para decidir sem consultá-lo?'),
          P(2, 'Qual o índice de evasão (churn) e a receita perdida com isso?'),
          P(2, 'Qual o índice de inadimplência e o prazo médio de recebimento?'),
          P(2, 'Qual o % de capacidade ociosa por horário e por unidade?'),
          P(2, 'Alunos captados vs. perdidos e o custo de aquisição (CAC)?'),
          P(2, 'Qual o índice de ocupação dos horários de pico vs. baixa?'),
          P(2, 'A equipe sabe a margem por plano, modalidade e aluno?'),
          P(2, 'Qual o % de alunos em planos com desconto ou congelados sem margem?'),
          P(3, 'Qual o prazo médio entre decisão estratégica e implementação na recepção?'),
          P(3, 'Quantos dos seus OKRs do trimestre passado foram 100% concluídos?'),
          P(3, 'Os instrutores sabem a meta de retenção por turma?'),
          P(3, 'Quantas reuniões entre comercial, operação e financeiro ocorrem por mês?'),
          P(3, 'Existe um comitê de gestão periódico com indicadores padronizados?'),
          P(3, 'O comercial sabe a margem de contribuição por plano e unidade?'),
        ],
      },
    ]
    for (var s = 0; s < setoresData.length; s++) {
      var sr = new Record(setCol)
      sr.set('nome', setoresData[s].nome)
      sr.set('slug', setoresData[s].slug)
      sr.set('segmentos', setoresData[s].segmentos)
      sr.set('micro_epifanias', setoresData[s].epifanias)
      sr.set('perguntas', setoresData[s].perguntas)
      sr.set('ordem', setoresData[s].ordem)
      app.save(sr)
    }

    // ============================================================
    // 3. Re-semeia `livros` com Biblioteca V2.4 (138 obras)
    //    Ordem e conteudo fieis ao biblioteca-v24.txt.
    // ============================================================
    var livrosCol = app.findCollectionByNameOrId('livros')
    app.db().newQuery('DELETE FROM livros WHERE 1=1').execute()
    var livros = [
      // AREA 1
      ['Vantagem Competitiva', 'Michael E. Porter', 'Estratégia Competitiva e Posicionamento'],
      ['Competição', 'Michael E. Porter', 'Estratégia Competitiva e Posicionamento'],
      ['Estratégia Competitiva', 'Michael E. Porter', 'Estratégia Competitiva e Posicionamento'],
      [
        'Estratégia — A Busca da Vantagem Competitiva',
        'C. K. Prahalad, Gary Hamel, Mintzberg et al.',
        'Estratégia Competitiva e Posicionamento',
      ],
      ['A Arte da Guerra — Edição Completa', 'Sun Tzu', 'Estratégia Competitiva e Posicionamento'],
      [
        'A Estratégia do Oceano Azul',
        'W. Chan Kim & Renée Mauborgne',
        'Estratégia Competitiva e Posicionamento',
      ],
      [
        'A Transição para o Oceano Azul',
        'W. Chan Kim & Renée Mauborgne',
        'Estratégia Competitiva e Posicionamento',
      ],
      ['A Revolta de Atlas', 'Ayn Rand', 'Estratégia Competitiva e Posicionamento'],
      [
        'Business Model Generation — Inovação em Modelos de Negócios',
        'Alexander Osterwalder & Yves Pigneur',
        'Modelos de Negócio e Inovação de Valor',
      ],
      ['De Zero a Um', 'Peter Thiel', 'Modelos de Negócio e Inovação de Valor'],
      ['A Riqueza na Base da Pirâmide', 'C. K. Prahalad', 'Modelos de Negócio e Inovação de Valor'],
      [
        'Transformando Problemas em Oportunidades',
        'Berthold Gunster',
        'Modelos de Negócio e Inovação de Valor',
      ],
      [
        'Planejamento Estratégico',
        'Idalberto Chiavenato & Arão Sapiro',
        'Planejamento Estratégico Clássico',
      ],
      [
        'Organização Orientada para a Estratégia',
        'Kaplan & Norton',
        'Planejamento Estratégico Clássico',
      ],
      ['Mapas Estratégicos', 'Kaplan & Norton', 'Planejamento Estratégico Clássico'],
      ['Alinhamento', 'Kaplan & Norton', 'Planejamento Estratégico Clássico'],
      [
        "The Harvard Business Review Entrepreneur's Handbook",
        'HBR Press',
        'Guias Práticos para Planos de Negócios',
      ],
      [
        'The Ernst & Young Business Plan Guide',
        'Brian R. Ford, Jay M. Bornstein & Patrick T. Pruitt',
        'Guias Práticos para Planos de Negócios',
      ],
      // AREA 2
      ['A Execução Premium', 'Kaplan & Norton', 'Metodologia BSC e Gestão de Desempenho'],
      ['A Estratégia em Ação', 'Kaplan & Norton', 'Metodologia BSC e Gestão de Desempenho'],
      [
        'Balanced Score Card e Hoshin Kanri',
        'Manuel Fernandes Thomaz',
        'Metodologia BSC e Gestão de Desempenho',
      ],
      [
        'Balanced Scorecard e a Gestão do Capital Intelectual',
        'José Francisco Rezende',
        'Metodologia BSC e Gestão de Desempenho',
      ],
      [
        'Gerenciamento da Rotina do Trabalho do Dia a Dia',
        'Falconi',
        'Gestão da Rotina, Qualidade e Processos',
      ],
      [
        'Gerenciamento pelas Diretrizes (Hoshin Kanri)',
        'Falconi',
        'Gestão da Rotina, Qualidade e Processos',
      ],
      ['Estratégia 6 Sigma', 'Peter S. Pande et al.', 'Gestão da Rotina, Qualidade e Processos'],
      ['Scrum', 'Jeff Sutherland', 'Gestão da Rotina, Qualidade e Processos'],
      ['Sprint', 'Jake Knapp', 'Gestão da Rotina, Qualidade e Processos'],
      [
        'Execução — A Disciplina para Atingir Resultados',
        'Larry Bossidy & Ram Charan',
        'Disciplina da Execução',
      ],
      ['Gestão de Alta Performance', 'Andrew S. Grove', 'Disciplina da Execução'],
      [
        'Know-How — As 8 Competências que separam os que Fazem',
        'Ram Charan',
        'Disciplina da Execução',
      ],
      ['Afinal, o que Realmente Funciona?', 'Ram Charan', 'Disciplina da Execução'],
      [
        'Corporate Turnaround: How Managers Turn Losers into Winners',
        'Donald B. Bibeault',
        'Disciplina da Execução',
      ],
      // AREA 3
      ['O Monge e o Executivo', 'James Hunter', 'Liderança Essencial e Servidora'],
      ['De volta ao Mosteiro', 'James Hunter', 'Liderança Essencial e Servidora'],
      ['Como Se Tornar Um Líder Servidor', 'James Hunter', 'Liderança Essencial e Servidora'],
      [
        'As 21 Irrefutáveis Leis da Liderança',
        'John C. Maxwell',
        'Liderança Essencial e Servidora',
      ],
      ['O Líder 360º', 'John C. Maxwell', 'Liderança Essencial e Servidora'],
      ['O Líder Criador de Líderes', 'Ram Charan', 'Liderança Essencial e Servidora'],
      [
        'The Leadership Pipeline',
        'Ram Charan, Stephen Drotter & James Noel',
        'Liderança Essencial e Servidora',
      ],
      ['O Jogo da Liderança', 'Ram Charan & A. G. Lafley', 'Liderança Essencial e Servidora'],
      ['Liderando com Visão', 'Bonnie Hagemann et al.', 'Liderança Essencial e Servidora'],
      [
        'Leading Teams: Setting the Stage for Great Performances',
        'J. Richard Hackman',
        'Gestão de Pessoas, Cultura e Design de Equipes',
      ],
      [
        'Empresas Feitas para Vencer (Good to Great)',
        'Jim Collins',
        'Gestão de Pessoas, Cultura e Design de Equipes',
      ],
      [
        'Gestão de Pessoas',
        'Idalberto Chiavenato',
        'Gestão de Pessoas, Cultura e Design de Equipes',
      ],
      [
        'Os Mestres da Administração',
        'Daniel Goleman',
        'Gestão de Pessoas, Cultura e Design de Equipes',
      ],
      [
        'O Melhor de Peter Drucker — Fator Humano e Desempenho',
        'Peter Drucker',
        'Gestão de Pessoas, Cultura e Design de Equipes',
      ],
      ['The Great CEO Within', 'Matt Mochary', 'Gestão de Pessoas, Cultura e Design de Equipes'],
      [
        'Team Topologies: Organizing Business and Technology Teams for Fast Flow',
        'Matthew Skelton e Manuel Pais',
        'Gestão de Pessoas, Cultura e Design de Equipes',
      ],
      [
        'Governança Corporativa',
        'Adriana Andrade & José Paschoal Rossetti',
        'Governança Corporativa e Empresas Familiares',
      ],
      ['Governança Corporativa', 'Ram Charan', 'Governança Corporativa e Empresas Familiares'],
      ['Governança Corporativa', 'João Bosco Lodi', 'Governança Corporativa e Empresas Familiares'],
      [
        'A Dimensão da Governança Corporativa',
        'Herbert Steinberg et al.',
        'Governança Corporativa e Empresas Familiares',
      ],
      [
        'Governança na Empresa Familiar',
        'Renato Bernhoeft e Miguel Gallo',
        'Governança Corporativa e Empresas Familiares',
      ],
      [
        'Governança na Empresa Familiar',
        'Guilherme Dale et al.',
        'Governança Corporativa e Empresas Familiares',
      ],
      [
        'Governança na Empresa Familiar',
        'Werner Bornholdt',
        'Governança Corporativa e Empresas Familiares',
      ],
      [
        'Governando a Empresa Familiar',
        'Elismar Alvares et al.',
        'Governança Corporativa e Empresas Familiares',
      ],
      [
        'Código das Melhores Práticas de Governança Corporativa',
        'IBGC',
        'Governança Corporativa e Empresas Familiares',
      ],
      [
        'Uma Década de Governança Corporativa',
        'IBGC',
        'Governança Corporativa e Empresas Familiares',
      ],
      ['A Profissão do Administrador', 'Peter Drucker', 'Biografias e Pensamento Administrativo'],
      [
        'Drucker — O Homem que Inventou a Administração',
        'Peter Drucker',
        'Biografias e Pensamento Administrativo',
      ],
      [
        'O Melhor de Peter Drucker — O Homem, A Administração, A Sociedade',
        'Exame',
        'Biografias e Pensamento Administrativo',
      ],
      [
        'Administrando em Tempos de Grandes Mudanças',
        'Peter Drucker',
        'Biografias e Pensamento Administrativo',
      ],
      ['A Cabeça de Steve Jobs', 'Leander Kahney', 'Biografias e Pensamento Administrativo'],
      ['Sucesso', 'Tom Peters', 'Biografias e Pensamento Administrativo'],
      // AREA 4
      ['A Startup Enxuta (Lean Startup)', 'Eric Ries', 'Ecossistema Startup e Lean'],
      ['Startup — Manual do Empreendedor', 'Steve Blank & Bob Dorf', 'Ecossistema Startup e Lean'],
      ['Do Sonho à Realização em 4 Passos', 'Steven Gary Blank', 'Ecossistema Startup e Lean'],
      [
        'Design Thinking — Uma Metodologia Poderosa',
        'Tim Brown',
        'Design Thinking e Inovação de Serviços',
      ],
      [
        'Isto é Design Thinking de Serviços',
        'Marc Stickdorn & Jakob Schneider',
        'Design Thinking e Inovação de Serviços',
      ],
      ['Liderando a Revolução', 'Gary Hamel', 'Design Thinking e Inovação de Serviços'],
      ['O Futuro da Administração', 'Gary Hamel', 'Design Thinking e Inovação de Serviços'],
      ['A Empresa na Velocidade do Pensamento', 'Bill Gates', 'Tecnologia e Futuro'],
      ['A Estrada do Futuro', 'Bill Gates', 'Tecnologia e Futuro'],
      [
        'Competing in the Age of AI: Strategy and Leadership When Algorithms and Networks Run the World',
        'Marco Iansiti e Karim R. Lakhani',
        'Tecnologia e Futuro',
      ],
      // AREA 5
      ['Administração de Marketing', 'Philip Kotler', 'Marketing Estratégico e Branding'],
      [
        'Marketing 4.0 — Do Tradicional ao Digital',
        'Philip Kotler',
        'Marketing Estratégico e Branding',
      ],
      ['Marketing de A a Z', 'Philip Kotler', 'Marketing Estratégico e Branding'],
      ['O Marketing das Nações', 'Philip Kotler', 'Marketing Estratégico e Branding'],
      ['Os 10 Pecados Mortais do Marketing', 'Philip Kotler', 'Marketing Estratégico e Branding'],
      ['Vencer no Caos', 'Philip Kotler', 'Marketing Estratégico e Branding'],
      [
        'Marketing de Serviços Profissionais',
        'Philip Kotler et al.',
        'Marketing Estratégico e Branding',
      ],
      ['Return on Customer', 'Don Peppers & Martha Rogers', 'Marketing Estratégico e Branding'],
      ['Hacking Growth', 'Sean Ellis', 'Growth Hacking e Tração'],
      ['Growth Hacker Marketing', 'Ryan Holiday', 'Growth Hacking e Tração'],
      ['Traction', 'Gabriel Weinberg', 'Growth Hacking e Tração'],
      ['Hooked (Engajado)', 'Nir Eyal', 'Growth Hacking e Tração'],
      ['Spin Selling', 'Neil Rackham', 'Vendas Consultivas e Negociação'],
      ['Como Chegar ao Sim', 'Roger Fisher & William Ury', 'Vendas Consultivas e Negociação'],
      ['A Bíblia de Vendas', 'Jeffrey Gitomer', 'Vendas Consultivas e Negociação'],
      ['A Bíblia do Vendedor', 'Stephan Schiffman', 'Vendas Consultivas e Negociação'],
      ['Os Segredos da Arte de Vender', 'Zig Ziglar', 'Vendas Consultivas e Negociação'],
      [
        'Never Split the Difference (Negocie Como Se Sua Vida Dependesse Disso)',
        'Chris Voss',
        'Vendas Consultivas e Negociação',
      ],
      ['As Armas da Persuasão', 'Robert Cialdini', 'Copywriting e Persuasão'],
      ['Great Leads', 'Michael Masterson', 'Copywriting e Persuasão'],
      ['Breakthrough Advertising', 'Eugene Schwartz', 'Copywriting e Persuasão'],
      ['My Life in Advertising', 'Claude Hopkins', 'Copywriting e Persuasão'],
      ['Keys to Great Writing', 'Stephen Wilbers', 'Copywriting e Persuasão'],
      // AREA 6
      [
        'Valuation (McKinsey)',
        'Tim Koller, Marc Goedhart & David Wessels',
        'Valuation e Criação de Valor',
      ],
      ['Investment Valuation', 'Aswath Damodaran', 'Valuation e Criação de Valor'],
      ['The Dark Side of Valuation', 'Aswath Damodaran', 'Valuation e Criação de Valor'],
      ['Narrative and Numbers', 'Aswath Damodaran', 'Valuation e Criação de Valor'],
      [
        'Valuation — Guia Fundamental',
        'Ricardo Goulart Serra & Michael Wickert',
        'Valuation e Criação de Valor',
      ],
      ['Creating Shareholder Value', 'Alfred Rappaport', 'Valuation e Criação de Valor'],
      [
        'EVA e Gestão Baseada em Valor',
        "S. David Young & Stephen F. O'Byrne",
        'Valuation e Criação de Valor',
      ],
      [
        'Finance for Executives',
        'Gabriel Hawawini & Claude Viallet',
        'Valuation e Criação de Valor',
      ],
      ['Finanças Corporativas e Valor', 'Alexandre Assaf Neto', 'Valuation e Criação de Valor'],
      ['Principles of Managerial Finance', 'Lawrence J. Gitman', 'Valuation e Criação de Valor'],
      ['Crescimento & Lucro', 'Ram Charan', 'Valuation e Criação de Valor'],
      ['Mergers and Acquisitions from A to Z', 'Andrew J. Sherman', 'Valuation e Criação de Valor'],
      [
        'O Investidor Inteligente',
        'Benjamin Graham',
        'Filosofia de Investimento e Value Investing',
      ],
      [
        'Security Analysis',
        'Benjamin Graham & David Dodd',
        'Filosofia de Investimento e Value Investing',
      ],
      [
        'The Essays of Warren Buffett',
        'Warren Buffett (ed. Lawrence Cunningham)',
        'Filosofia de Investimento e Value Investing',
      ],
      [
        'Cartas aos Acionistas da Berkshire Hathaway',
        'Warren Buffett',
        'Filosofia de Investimento e Value Investing',
      ],
      [
        'A Contabilidade Gerencial',
        'Anthony A. Atkinson, Robert S. Kaplan et al.',
        'Controladoria e Custos',
      ],
      [
        'Management Control Systems',
        'Kenneth Merchant & Wim Van der Stede',
        'Controladoria e Custos',
      ],
      ['Cost & Effect', 'Robert S. Kaplan & Robin Cooper', 'Controladoria e Custos'],
      ['O Capital', 'Thomas Piketty', 'Economia e Contexto Global'],
      [
        'Economia Internacional e Comércio Exterior',
        'Jayme de Mariz Maia',
        'Economia e Contexto Global',
      ],
      ['A China Sacode o Mundo', 'James Kynge', 'Economia e Contexto Global'],
      ['Fazendo Negócios com a China', 'Ted Plafker', 'Economia e Contexto Global'],
      [
        'Corporate Finance',
        'Stephen Ross, Randolph Westerfield & Jeffrey Jaffe',
        'Finanças Corporativas Avançadas',
      ],
      // AREA 7
      [
        'Os 7 Hábitos das Pessoas Altamente Eficazes',
        'Stephen R. Covey',
        'Hábitos e Produtividade',
      ],
      ['O 8º Hábito', 'Stephen R. Covey', 'Hábitos e Produtividade'],
      ['O Poder da Confiança', 'Stephen R. Covey', 'Hábitos e Produtividade'],
      ['Essencialismo', 'Greg McKeown', 'Hábitos e Produtividade'],
      ['Foco', 'Daniel Goleman', 'Hábitos e Produtividade'],
      ['Mindset — A nova psicologia do sucesso', 'Carol S. Dweck', 'Psicologia, Mindset e Risco'],
      ['Antifrágil', 'Nassim Taleb', 'Psicologia, Mindset e Risco'],
      ['The Black Swan (A Lógica do Cisne Negro)', 'Nassim Taleb', 'Psicologia, Mindset e Risco'],
      ['Diário de Negócios de Maslow', 'Abraham Maslow', 'Psicologia, Mindset e Risco'],
      ['Princípios de Neurociências', 'Eric Kandel', 'Psicologia, Mindset e Risco'],
      ['A Quinta Disciplina', 'Peter Senge', 'Psicologia, Mindset e Risco'],
      ['Inteligência Pragmática', 'Max Peters', 'Psicologia, Mindset e Risco'],
      // AREA 8
      [
        'Foundations of Futures Studies (Volumes 1 e 2)',
        'Wendell Bell',
        'Fundamentos do Foresight',
      ],
      ['The Foresight Principle', 'Richard Slaughter', 'Fundamentos do Foresight'],
      ['Futuring: The Exploration of the Future', 'Edward Cornish', 'Fundamentos do Foresight'],
      ['Questioning the Future', 'Sohail Inayatullah', 'Cenários e Análise Prospectiva'],
      [
        'A Arte da Visão Longa (The Art of the Long View)',
        'Peter Schwartz',
        'Cenários e Análise Prospectiva',
      ],
    ]
    for (var j = 0; j < livros.length; j++) {
      var br = new Record(livrosCol)
      br.set('titulo', livros[j][0])
      br.set('autor', livros[j][1])
      br.set('categoria', String(livros[j][2]))
      br.set('resumo', '')
      app.save(br)
    }

    // ============================================================
    // 4. Redefine o agente de IA jbp-gestao-master com o System
    //    Prompt V6.5 completo (acentuado, fiel ao PDF).
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
    // Reverte: remove o agente redefinido (a definicao V6.5 anterior
    // permanece via migration 0016 caso esta seja desfeita).
    try {
      $ai.agents.delete(app, 'jbp-gestao-master')
    } catch (_) {}
  },
)
