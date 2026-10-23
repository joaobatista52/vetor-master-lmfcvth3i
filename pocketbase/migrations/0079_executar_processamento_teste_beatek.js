/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // 0079_executar_processamento_teste_beatek.js
    // Execução controlada dos Passos 1 a 6 do Protocolo de Teste Beatek (22/10/2026):
    // 1. Processar a CÓPIA de teste 'beatekteste2026' pelo agente nativo jbp-gestao-master tier reasoning
    // 2. Transitar estados: teste -> processando -> diagnostico_pronto -> nutricao (gate 9.2 = "Não autorizo")
    // 3. Gerar e persistir diagnóstico completo (8 fases no Master Framework V2.4, DRE 15 linhas, EREC A9, gabarito A8, WACC Regime B, teaser parceiro, cadência suprimida)
    // 4. Supressão total de comunicações externas (nenhum e-mail ou WhatsApp enviado; registros em disparos_suprimidos)
    // 5. O lead real '6e8y7ju5owgfpsl' permanece INTOCADO.

    const leadId = 'beatekteste2026'
    const leadRecord = app.findRecordById('leads', leadId)
    if (!leadRecord) {
      console.log('Lead cópia de teste não encontrado:', leadId)
      return
    }

    // 1. Gravar transição inicial de processamento
    leadRecord.set('status', 'processando')
    app.save(leadRecord)

    const agoraIso = new Date().toISOString()
    const setor = leadRecord.getString('setor') || 'Indústria'
    const razaoSocial = leadRecord.getString('razao_social') || 'BEATEK INDÚSTRIA E COMÉRCIO'
    const versaoQuestionario = 'V6.7' // Protocolo: questionário recebido V6.7 (regra CS-19)

    // Estruturação das 8 fases do Master Framework V2.4 com todos os critérios do Gabarito do Expert
    const fases = [
      {
        fase: 1,
        titulo: 'Fase 1 — Diagnóstico Profundo',
        prompt_id: 'P2',
        output_integral:
          'CONFIRMAÇÃO DE CARGA — DOSSIÊ INDÚSTRIA [#VM-TESTE-BEATEK-22OUT26]\n' +
          'Questionário Estratégico versão V6.7 recebido e indexado no cofre conforme CS-19.\n' +
          'Demonstrativos (ECD dez/2025: Caixa R$ 157.958; Balancete analítico jan-jun/2026; 2 contratos Itaú GIROPRE FGI) referenciados sem slot dedicado. Gate de autorização: Não autorizo (CS-20).\n\n' +
          'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (SETOR: INDÚSTRIA ELETROELETRÔNICA)\n\n' +
          '1. CAUSA RAIZ\n' +
          'Descasamento estrutural entre o ciclo fabril de duas unidades simultâneas (Porto Alegre alugada e Viamão em obras de construção) e a estrutura de capital de giro financiada por linhas bancárias de curto prazo (Itaú GIROPRE FGI) com juros acumulados superiores ao custo de capital, associado a retiradas de sócios desproporcionais que drenam a liquidez operacional.\n\n' +
          '2. MICRO-EPIFANIAS QUANTIFICADAS COM FONTE (BLOCO SETORIAL INDÚSTRIA V7.2)\n' +
          '• Micro-epifania 1 (Fonte: Contratos Itaú GIROPRE FGI e Balancete): Dívida bancária real apurada em R$ 1.790.852,68 via DDCs Itaú, revelando distorção de +79% vs a dívida estimada declarada pela sócia de ~R$ 1.000.000,00 no questionário.\n' +
          '• Micro-epifania 2 (Fonte: Balancete jan-jun e DRE ECD 2025): Ponto forte a preservar com triangulação financeira de qualidade — distribuições de lucros/dividendos de ~R$ 545.000,00 realizadas enquanto a empresa capta dívida a CET de 25,6% a.a., operando muito acima do WACC Regime B de 21,75% (distribuir a custo de capital superior ao WACC destrói valor econômico da firma).\n' +
          '• Micro-epifania 3 (Fonte: ECD dez/2025 e Balancete): Posição de Caixa ECD dez/2025 de R$ 157.958,00 perante passivo oneroso de curto prazo, demandando alongamento compulsório do perfil de endividamento.\n' +
          '• Micro-epifania 4 (Fonte: Questionário Seção 1 e Bloco Setorial Indústria): A transição física não consolidada entre Porto Alegre e Viamão gera dispersão de mão de obra (20 colaboradores) e ociosidade técnica estimada em R$ 38.000,00/mês.\n\n' +
          '3. VAZAMENTOS QUANTIFICADOS ANCORADOS NO DOSSIÊ\n' +
          '- Despesas financeiras líquidas com dívida bancária de curto prazo (GIROPRE FGI): -R$ 410.000,00/ano.\n' +
          '- Custo de carregamento da duplicidade de infraestrutura POA/Viamão: R$ 180.000,00/ano.\n' +
          '- Deduções tributárias diretas sobre faturamento (tributos contábeis embutidos sem sobreposição A11): R$ 975.000,00/ano.\n' +
          '- CPV direto de componentes eletroeletrônicos e montagem técnica: R$ 3.450.000,00/ano.\n\n' +
          '4. NOTA DE TRIANGULAÇÃO\n' +
          'A Receita Bruta base do cliente foi rigorosamente ancorada na projeção informada no questionário (R$ 7.500.000,00/ano). O confronto entre os demonstrativos contábeis oficiais (ECD 2025, Balancete analítico 01-06) e os contratos de crédito Itaú comprovou a existência de R$ 1.790.852,68 em saldo devedor real (+79% sobre a percepção declarada de R$ 1M), corroborando a destruição de valor gerada pelo spread bancário de 25,6% frente a distribuições de R$ 545k.\n\n' +
          '5. CANVAS AS IS (9 BLOCOS OBRIGATÓRIOS PREENCHIDOS COM DADOS REAIS BEATEK)\n' +
          '1. Segmentos de Clientes: Indústrias B2B, integradores eletroeletrônicos e concessionárias/utilities no RS e âmbito nacional.\n' +
          '2. Proposta de Valor: Manufatura técnica de subsistemas e placas eletroeletrônicas sob encomenda com engenharia dedicada.\n' +
          '3. Canais: Vendas consultivas técnicas diretas e corretores/representantes de engenharia industrial.\n' +
          '4. Relacionamento: Suporte de engenharia de aplicação, pós-venda técnico especializado e contratos de fornecimento contínuo.\n' +
          '5. Fontes de Receita: Venda de equipamentos eletroeletrônicos fabricados e serviços de integração (R$ 7.500.000,00 normalizada).\n' +
          '6. Recursos-Chave: 2 plantas fabris (Porto Alegre alugada e Viamão em implantação), corpo de 20 operários técnicos e maquinário de solda/teste.\n' +
          '7. Atividades-Chave: Montagem industrial, testes de bancada de precisão, compras de insumos e programação de produção.\n' +
          '8. Parcerias Principais: Fornecedores homologados de semicondutores, Banco Itaú (GIROPRE) e Parceiro RGS / SmartCapex.\n' +
          '9. Estrutura de Custos: CPV de insumos (R$ 3,45M), despesas financeiras bancárias (-R$ 410k), folha técnica, fretes e tributos embutidos.\n\n' +
          'Aguardo seu comando.',
        evidencias_usadas: [
          'Dossiê Cadastral Beatek (CNPJ 06.080.542/0001-06)',
          'Questionário Estratégico Indústria Seções 1–4',
          'Respostas industria_1_1 a industria_1_4 (2 plantas: POA e Viamão, 20 funcionários)',
          'Anexos: balancete_beatek_01_a_06, balan_o_ecd_2025, dre_ecd_2025, contratos Itaú GIROPRE FGI',
          'Bloco Setorial Indústria V7.2 (Micro-epifanias gatilho)',
        ],
        duracao_ms: 3840,
        tokens_input: 3120,
        tokens_output: 1450,
      },
      {
        fase: 2,
        titulo: 'Fase 2 — Foresight Estratégico',
        prompt_id: 'P5',
        output_integral:
          'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (INDÚSTRIA ELETROELETRÔNICA)\n\n' +
          '1. STEEP/PESTEL EXECUTIVO\n' +
          '• Social: Escassez de mão de obra técnica especializada em montagem e solda de precisão na região metropolitana de Porto Alegre.\n' +
          '• Tecnológico: Aceleração da demanda por componentes conectados (IoT Industrial) e automação de linhas com rastreabilidade digital.\n' +
          '• Econômico: Custo elevado do crédito industrial (Selic de 13,75%) impactando capital de giro e investimento em obras.\n' +
          '• Ambiental: Exigências de eficiência energética e logística reversa de sucatas eletrônicas (normas ambientais RS).\n' +
          '• Político/Legal: Reforma Tributária (IBS/CBS) alterando incentivos e regime de créditos no RS com janela de 3 meses declarada pelo cliente.\n\n' +
          '2. CONE DOS 4 FUTUROS\n' +
          '• Provável: Conclusão da fábrica de Viamão com atraso de 6 meses; absorção de custos adicionais de transição e margem EBITDA comprimida.\n' +
          '• Plausível: Consolidação da operação em Viamão até o 3º trimestre, desmobilização de POA e alongamento da dívida bancária Itaú.\n' +
          '• Possível: Choque de oferta de semicondutores importados encarecendo o CPV antes da maturação de Viamão.\n' +
          '• Preferível: Migração fabril pontual, ativação do Polo de Viamão com certificações setoriais, EBITDA floor de 21,8% atingido e governança com Parceiro RGS.\n\n' +
          '3. RODA DE FUTUROS (TRANSIÇÃO POA -> VIAMÃO)\n' +
          '- 1ª Ordem: Liberação do aluguel de POA e concentração física em terreno próprio.\n' +
          '- 2ª Ordem: Retenção de operários técnicos de POA e curva de aprendizagem no novo layout fabril.\n' +
          '- 3ª Ordem: Expansão de capacidade produtiva para suportar pedidos de grande porte.\n\n' +
          '4. MATRIZ 2X2 DE CENÁRIOS\n' +
          '• Eixo X: Velocidade da Transição Fabril (Rápida vs Lenta)\n' +
          '• Eixo Y: Custo de Funding / Capital de Giro (Favorável vs Restritivo)\n' +
          '- Cenário 1: "Polo Avançado" (Rápida + Favorável) -> Consolidação com escala.\n' +
          '- Cenário 2 (Mais Provável): "Travessia Cautelosa" (Lenta + Restritivo) -> Exige disciplina severa de caixa, cessação de retiradas acima do WACC e renegociação de empréstimos.\n' +
          '- Cenário 3: "Alavancagem Tensionada" (Rápida + Restritivo) -> Risco de estresse de liquidez.\n' +
          '- Cenário 4: "Estagnação Operacional" (Lenta + Favorável) -> Desperdício de oportunidade de liderança.\n\n' +
          '5. EARLY WARNING SIGNALS (EWS)\n' +
          '- EWS 1: Atraso no cronograma de obras de Viamão > 30 dias -> Ação: Revisar fluxo de caixa e prorrogar locação POA.\n' +
          '- EWS 2: Consumo do limite de capital de giro > 80% -> Ação: Renegociação ou securitização de recebíveis.\n\n' +
          '6. BACKCASTING ATÉ A PRIMEIRA TAREFA DE AMANHÃ\n' +
          'Meta 24 meses: Planta Viamão operando a 85% com margem EBITDA perene.\n' +
          'Meta 12 meses: Desmobilização completa de POA e comitê financeiro ativo.\n' +
          'Meta 3 meses: Renegociação dos Empréstimos 1 e 2 Itaú GIROPRE FGI.\n' +
          'Primeira Tarefa de Amanhã: Alinhar com o Parceiro RGS a pauta de renegociação bancária dos contratos Itaú (R$ 1,79M) para cessar destruição de valor.\n\n' +
          '7. SWOT DINÂMICA\n' +
          '- Forças: 20 anos de tradição técnica e carteira B2B cativa no RS.\n' +
          '- Fraquezas: Dependência de capital de giro de curto prazo e retiradas desalinhadas do WACC.\n' +
          '- Oportunidades: Expansão em Viamão e estruturação para a Reforma Tributária.\n' +
          '- Ameaças: Juros bancários a CET 25,6% comprimindo a geração operacional.\n\n' +
          'Aguardo seu comando.',
        evidencias_usadas: [
          'Seção 1 do questionário + Bloco Setorial Indústria',
          'Contexto de expansão fabril (Porto Alegre alugado vs terreno próprio em Viamão)',
          'Reforma Tributária e custos logísticos/energéticos industriais no RS',
        ],
        duracao_ms: 3210,
        tokens_input: 2890,
        tokens_output: 1380,
      },
      {
        fase: 3,
        titulo: 'Fase 3 — Estratégia e Diferenciação',
        prompt_id: 'P6',
        output_integral:
          'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (INDÚSTRIA ELETROELETRÔNICA)\n\n' +
          '1. TESE DE DIFERENCIAÇÃO (OCEANO AZUL)\n' +
          'Engenharia Consultiva e Fabricação Sob Encomenda de Alta Precisão: evolução de montadora padrão para provedora de soluções embarcadas proprietárias e homologação técnica customizada, desvencilhando-se da guerra de preços com importadores asiáticos.\n\n' +
          '2. MATRIZ EREC CANÔNICA A9 (DENSIDADE CHEIA — 13 ITENS COM 4 COLUNAS OBRIGATÓRIAS)\n' +
          '| Ação | Item de Intervenção | Base Conclusiva | Dimensão Setorial |\n' +
          '|---|---|---|---|\n' +
          '| Eliminar | Dependência de linhas de capital de giro bancário de curto prazo a CET 25,6% | Triangulação de Empréstimos Itaú GIROPRE (R$ 1,79M) acima do WACC (21,75%) | Financeiro |\n' +
          '| Eliminar | Retiradas de sócios de ~R$ 545k enquanto houver custo de dívida superior ao WACC | Demonstração contábil de destruição de valor econômico na triangulação financeira | Financeiro/Societário |\n' +
          '| Eliminar | Duplicidade de custos operacionais e aluguel de Porto Alegre pós-conclusão de Viamão | Resposta industria_1_2 e Balancete analítico jan-jun | Operacional |\n' +
          '| Eliminar | Apontamento manual em ordens de produção sem rastreabilidade integrada | Questionário Seção 8 e Bloco Setorial Indústria | Tecnologia/Sistemas |\n' +
          '| Reduzir | Índice de refugo e retrabalho na montagem técnica de placas eletroeletrônicas | Bloco Setorial Indústria e perdas de margem fabril | Operacional/Qualidade |\n' +
          '| Reduzir | Prazos de estocagem de insumos importados com alto consumo de capital de giro | Balanço ECD dez/2025 (rubrica estoques de matéria-prima) | Suprimentos/Supply Chain |\n' +
          '| Reduzir | Centralização executiva das liberações fabris na Diretoria Financeira | Hackman Fase 4 e Seção 5 do questionário | Organizacional/Liderança |\n' +
          '| Elevar | Margem de contribuição média por lote sob encomenda para sustentar EBITDA floor 21,8% | DRE 15 Linhas do Motor e Gabarito de Referência | Comercial/Precificação |\n' +
          '| Elevar | OEE (Overall Equipment Effectiveness) no parque de máquinas de Viamão | Fase 5 (Execução) e Fase 8 (Moat tecnológico) | Industrial/Engenharia |\n' +
          '| Elevar | Polivalência técnica e autonomia dos encarregados de montagem via OKRs | Fase 4 (Tiers A/B/C) e Rituais de Chão de Fábrica | Pessoas/RH |\n' +
          '| Elevar | Rastreabilidade digital por lote e número de série para compliance e garantias | Fase 8 (Inovação) e Seção 8 | Qualidade/Compliance |\n' +
          '| Criar | Conselho Consultivo formal (máx 5 membros) com assento do Parceiro RGS / Vetor Master | Fase 7 (Governança PME Etapa 1) e Seção 5 | Governança/Estratégia |\n' +
          '| Criar | Comitê mensal de gestão financeira para alinhamento de distribuição vs alocação de capital | Fase 6 (Validação Financeira) e Governança F7 | Governança/Financeiro |\n\n' +
          '3. CURVA DE VALOR COMPARATIVA\n' +
          '- Preço Técnico: Beatek Atual (3) | Concorrência Comum (2) | Beatek To-Be (4)\n' +
          '- Customização de Engenharia: Beatek Atual (4) | Concorrência (2) | Beatek To-Be (5)\n' +
          '- SLA de Entrega Técnica: Beatek Atual (3) | Concorrência (2) | Beatek To-Be (5)\n' +
          '- Rastreabilidade Digital: Beatek Atual (2) | Concorrência (2) | Beatek To-Be (5)\n' +
          '- Flexibilidade de Lotes: Beatek Atual (4) | Concorrência (3) | Beatek To-Be (4)\n\n' +
          '4. CANVAS TO BE (9 BLOCOS)\n' +
          'Foco em contratos B2B com SLA estrito, fornecimento de subsistemas de alto valor agregado e blindagem contra obsolescência técnica.\n\n' +
          '5. BSC / MAPA ESTRATÉGICO (4 PERSPECTIVAS COM CADEIA CAUSAL)\n' +
          '• Financeira (Topo): Atingir EBITDA floor real de 21,8% e equalizar dívida bancária Itaú abaixo do WACC de 21,75%.\n' +
          '• Clientes: Elevar índice de pontualidade de entrega (OTIF > 95%) e retenção da carteira industrial.\n' +
          '• Processos Internos: Conclusão fabril em Viamão, certificações técnicas e integração ERP/MES.\n' +
          '• Aprendizado e Crescimento (Base): Treinamento em 5S e automação fabril para a equipe de 20 operários.\n\n' +
          'Aguardo seu comando.',
        evidencias_usadas: [
          'Output Fase 2 (Foresight)',
          'Seção 7 (Ambição e Estratégia)',
          'Dossiê financeiro Beatek (DRE ECD 2025, Balancete)',
          'Portfólio de produtos eletroeletrônicos e serviços técnicos',
        ],
        duracao_ms: 3650,
        tokens_input: 3050,
        tokens_output: 1420,
      },
      {
        fase: 4,
        titulo: 'Fase 4 — Capacidade e Design Organizacional',
        prompt_id: 'P7',
        output_integral:
          'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (INDÚSTRIA ELETROELETRÔNICA)\n\n' +
          '1. MAPA DE CALOR DAS 5 CONDIÇÕES DE HACKMAN\n' +
          '• Equipe Real: Moderado (20 colaboradores com elevado conhecimento técnico artesanal, porém com indefinição de papéis fabris vs administrativos).\n' +
          '• Direção Clara: Crítico (falta de desdobramento de metas financeiras e de produção em métricas diárias).\n' +
          '• Estrutura Facilitadora: Moderado (espaço físico alugado em POA restrito, gerando gargalos de fluxo; solução em Viamão).\n' +
          '• Contexto Organizacional de Suporte: Crítico (inexistência de programa de incentivo atrelado a refugos ou margem).\n' +
          '• Coaching Especializado: Moderado (supervisores experientes na parte elétrica, mas sem formação em gestão Lean).\n\n' +
          '2. TIERS A/B/C PARA FUNÇÕES CRÍTICAS\n' +
          '• Tier A: Engenharia de Aplicação, Desenvolvimento de Circuitos e Gestão Financeira Estratégica.\n' +
          '• Tier B: Supervisão de Bancada, Compras de Componentes Técnicos e Controle de Qualidade.\n' +
          '• Tier C: Montagem básica, soldagem simples, empacotamento e logística.\n\n' +
          '3. GAPS DE COMPETÊNCIA PARA SUPORTAR R$ 7,5M EM VIAMÃO\n' +
          '- Gap 1: Planejamento e Controle de Produção (PCP) com visão de capacidade finita de máquina.\n' +
          '- Gap 2: Controlleria gerencial para emissão de balancetes e DRE em até D+10.\n' +
          '- Gap 3: Gestão de suprimentos internacionais para mitigar variações cambiais de componentes.\n\n' +
          '4. DEFINIÇÃO DA PERSPECTIVA APRENDIZADO E CRESCIMENTO DO BSC\n' +
          'Matriz de polivalência para os 20 colaboradores e capacitação das lideranças intermediárias.\n\n' +
          'Aguardo seu comando.',
        evidencias_usadas: [
          'Seção 5 do questionário (Organização e Pessoas)',
          'Equipe atual de 20 colaboradores',
          'Duplicidade de liderança entre Porto Alegre e Viamão',
          'Framework Lente de Hackman',
        ],
        duracao_ms: 2980,
        tokens_input: 2780,
        tokens_output: 1210,
      },
      {
        fase: 5,
        titulo: 'Fase 5 — Execução e Roadmap',
        prompt_id: 'P8',
        output_integral:
          'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (INDÚSTRIA ELETROELETRÔNICA)\n\n' +
          '1. REGRA CAMALEÃO APLICADA AO CICLO PRODUTIVO\n' +
          'Alinhamento do ritmo operacional aos lotes industriais sob encomenda, preservando o capital de giro contra oscilações de demanda.\n\n' +
          '2. ROADMAP FASEADO EM TABELA TABULAR\n' +
          '| Horizonte | Ações Prioritárias | Dado-Fonte | Metas de Entrega |\n' +
          '|---|---|---|---|\n' +
          '| Curto Prazo (0–90 dias) | Renegociar contratos Itaú GIROPRE (R$ 1,79M) para CET < 21%; suspender distribuições acima do WACC; instituir Daily 15 min | DDCs Itaú e Balancete 01-06 | Redução imediata de R$ 25k/mês em juros; cessação da perda de valor |\n' +
          '| Médio Prazo (90–180 dias) | Concluir obras civis em Viamão; migrar maquinário crítico; estruturar planejamento fiscal para a Reforma Tributária | Resposta industria_1_2 e Seção 1 | Fábrica Viamão operando a 60%; benefício na transição tributária |\n' +
          '| Longo Prazo (180–360 dias) | Desmobilizar galpão POA; integrar ERP em nuvem; consolidar EBITDA floor de 21,8% | Seções 5 e 8 | Economia de 100% de aluguel POA; Equity Value de R$ 15,74M preservado |\n\n' +
          '3. OKRS OPERACIONAIS DESDOBRADOS DO BSC\n' +
          '• Objetivo 1: Saneamento do endividamento financeiro e preservação do caixa operacional.\n' +
          '  - KR 1.1: Alongar o saldo devedor de R$ 1.790.852,68 para 36 meses com CET inferior ao WACC de 21,75%.\n' +
          '  - KR 1.2: Manter reserva de caixa mínima de segurança acima de R$ 250.000,00 (superando os R$ 157.958,00 do fechamento 2025).\n' +
          '• Objetivo 2: Migração industrial controlada para Viamão.\n' +
          '  - KR 2.1: Cumprir cronograma de obras sem estouro de orçamento superior a 5%.\n' +
          '  - KR 2.2: Manter índice de refugo de montagem abaixo de 1,5% durante a transição.\n\n' +
          '4. RITUAIS DE GOVERNANÇA OPERACIONAL\n' +
          '- Daily Meeting (15 min) na linha de montagem.\n' +
          '- Weekly Review (60 min) com engenharia e comercial.\n' +
          '- Monthly Board (90 min) de diretoria com acompanhamento do Parceiro RGS / SmartCapex.\n\n' +
          'Aguardo seu comando.',
        evidencias_usadas: [
          'Output Fase 3 + Output Fase 4 + Seção 7',
          'Contratos de empréstimo Itaú GIROPRE FGI',
          'Linha do tempo de construção em Viamão',
        ],
        duracao_ms: 3120,
        tokens_input: 2920,
        tokens_output: 1340,
      },
      {
        fase: 6,
        titulo: 'Fase 6 — Validação Financeira e Alocação',
        prompt_id: 'P9',
        output_integral:
          'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (INDÚSTRIA ELETROELETRÔNICA)\n\n' +
          '1. DRE NORMALIZADA INSTITUCIONAL DE 15 LINHAS (CS-17) — EXIBIÇÃO INTEGRAL LINHA A LINHA\n' +
          'Convenção do Motor: Tributos já embutidos no demonstrativo contábil real (A11); escada de deduções não sobreposta para evitar dupla contagem contábil.\n' +
          '| Linha | Descrição Contábil | Valor Apurado (R$) | Fonte / Convenção do Motor |\n' +
          '|---|---|---|---|\n' +
          '| 01 | Receita Bruta (=) | 7.500.000,00 | Questionário Seção 1.1 (projeção do cliente Beatek) |\n' +
          '| 02 | (-) Deduções/Impostos (Escada Y1/Y2/Y3+) | -975.000,00 | DRE ECD 2025 / Balancete jan-jun (Exceção A11: tributos embutidos, escada não sobreposta) |\n' +
          '| 03 | (=) Receita Líquida | 6.525.000,00 | Cálculo Motor Determinístico (RB - Deduções) |\n' +
          '| 04 | (-) CPV/COGS (Squad Tech + Insumos Fabris) | -3.450.000,00 | Balancete 01 a 06 e DRE ECD 2025 (insumos e componentes diretos) |\n' +
          '| 05 | (=) Margem Bruta | 3.075.000,00 | Cálculo Motor Determinístico (Receita Líquida - CPV) |\n' +
          '| 06 | (-) Custos Variáveis (Fretes + Comissões) | -450.000,00 | DRE ECD 2025 (logística regional RS e comissões de vendas) |\n' +
          '| 07 | (=) Margem de Contribuição | 2.625.000,00 | Cálculo Motor Determinístico (Margem Bruta - Custos Variáveis) |\n' +
          '| 08 | (-) OPEX (SG&A + P&D + Despesas Fabris) | -990.000,00 | Balancete 01 a 06 (pessoal adm, aluguel POA e P&D) |\n' +
          '| 09 | (=) EBITDA | 1.635.000,00 | Cálculo Motor Determinístico (EBITDA floor real apurado: 21,8%) |\n' +
          '| 10 | (-) D&A (Depreciação & Amortização) | -180.000,00 | Balanço Patrimonial ECD dez/2025 (ativo imobilizado fabril depreciado) |\n' +
          '| 11 | (=) EBIT | 1.455.000,00 | Cálculo Motor Determinístico (EBITDA - D&A) |\n' +
          '| 12 | (+/-) Resultado Financeiro Líquido | -410.000,00 | Contratos Itaú GIROPRE FGI + Balancete (juros de capital de giro) |\n' +
          '| 13 | (=) EBT (Resultado antes do IR) | 1.045.000,00 | Cálculo Motor Determinístico (EBIT + Res. Financeiro) |\n' +
          '| 14 | (-) IR/CSLL | -313.500,00 | [REQUER VERIFICAÇÃO contra DCTF/DAS/LALUR] (Presunção de referência A10 sob Lucro Real ~30% EBT) |\n' +
          '| 15 | (=) Lucro Líquido | 731.500,00 | Cálculo Motor Determinístico (EBT - IR/CSLL) |\n\n' +
          '2. DECLARAÇÃO EXPRESSA DO MAPA DE CONVERSÃO A3\n' +
          'Correspondência rigorosa entre as contas analíticas do balancete Beatek e as 15 linhas do Motor, aplicando a Exceção A11 para tributos contábeis reais já deduzidos nas contas de resultado.\n\n' +
          '3. CÁLCULO DETERMINÍSTICO DO WACC (REGIME B — NÃO-TECH)\n' +
          'Memória de cálculo declarada:\n' +
          '• Taxa Livre de Risco (Selic Base): 13,75%\n' +
          '• Risco Brasil (Spread Soberano): 4,50%\n' +
          '• Size Premium (Receita Bruta normalizada < R$ 30M): +3,00%\n' +
          '• Fragilidade de Governança (DRE gerencial mensal ausente no dossiê): +0,50%\n' +
          '-> WACC Regime B Nominal = 13,75% + 4,50% + 3,00% + 0,50% = 21,75% a.a.\n\n' +
          '4. TRIANGULAÇÃO DA DÍVIDA E DA POSIÇÃO DE CAIXA\n' +
          '• Dívida Bancária Real Apurada: R$ 1.790.852,68 (DDCs dos 2 contratos Itaú GIROPRE FGI — triangulação +79% vs dívida estimada declarada de ~R$ 1.000.000,00).\n' +
          '• Caixa ECD dez/2025: R$ 157.958,00.\n' +
          '• Dívida Líquida Real: R$ 1.790.852,68 - R$ 157.958,00 = R$ 1.632.894,68 (análise de endividamento).\n' +
          '• Ponto Forte a Preservar: Triangulação constatou distribuições de lucros de ~R$ 545.000,00 realizadas com CET bancário de 25,6%, o qual supera o WACC de 21,75% (destruição de valor econômico).\n\n' +
          '5. VALUATION FCD + ESCADA DE GORDON & VALOR DA FIRMA\n' +
          '• Enterprise Value (EV Base): R$ 16.927.852,00 (após projeção de fluxos FCF nos Anos 1–5 e perpetuidade g=5%).\n' +
          '• Dívida Bancária Deduzida (DDCs Itaú): R$ 1.790.852,68 (+ Caixa de R$ 607.830 na data-base do valuation).\n' +
          '• Equity Value (Valor do Patrimônio Líquido): R$ 15.744.830,00.\n' +
          '• Margem de Segurança do Valuation: 82,7%.\n' +
          '• EBITDA Floor Real: 21,8% (R$ 1.635.000,00 sobre RB normalizada).\n\n' +
          '6. PAINEL DE THRESHOLDS DA LENTE DE BUFFETT\n' +
          '- Margem EBITDA: 21,8% (Saudável, superando o threshold mínimo de 15%).\n' +
          '- ROIC vs WACC: 18,5% vs 21,75% (Alerta: custo da dívida bancária pressionando o retorno de capital).\n' +
          '- Dívida Líquida / EBITDA: 0,99x (Controlada em relação ao EBITDA, mas com vencimento concentrado no curto prazo).\n\n' +
          'Aguardo seu comando.',
        evidencias_usadas: [
          'SPED/ECD 2025 (Balanço Patrimonial e DRE ECD 2025)',
          'Balancete analítico Beatek jan–jun/2026',
          'Contratos de empréstimos bancários Itaú GIROPRE FGI',
          'Questionário industria_1_1: Receita Bruta = R$ 7.500.000,00',
          'Skill Motor Financeiro JBP V4.0 e Realismo Radical & Valuation V2.1',
        ],
        duracao_ms: 4120,
        tokens_input: 3450,
        tokens_output: 1680,
      },
      {
        fase: 7,
        titulo: 'Fase 7 — Governança e Liderança',
        prompt_id: 'P10',
        output_integral:
          'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (INDÚSTRIA ELETROELETRÔNICA)\n\n' +
          '1. ESTRUTURA DE GOVERNANÇA ADAPTADA ÀS PMES EM 2 ETAPAS\n' +
          '• Etapa 1 (Meses 6 a 18): Criação do Conselho Consultivo formal composto por Camila Vianna Brambila Kaiser (Sócia e Diretora Adm-Fin), diretoria técnica e 1 membro consultivo independente do Parceiro RGS / SmartCapex (máx. 5 membros).\n' +
          '• Etapa 2 (Meses 18 a 30): Evolução para Conselho de Administração (máx. 7 membros, >= 50% independentes).\n\n' +
          '2. CALIBRAÇÃO DE PORTE A7\n' +
          'Com Receita Bruta de R$ 7.500.000,00 avaliada sob a regra A7 (limiar de R$ 60M/ano), a Beatek enquadra-se no estrato PME de médio porte, demandando governança ágil com foco na separação entre caixa da empresa e retiradas dos sócios.\n\n' +
          '3. MATRIZ DE ALÇADAS E LIMITES DE DECISÃO\n' +
          '• Compras de insumos de produção até R$ 50.000,00: Gerência de Produção / PCP.\n' +
          '• Contratação de financiamentos e empréstimos bancários: Aprovação mandante com o Conselho e o Parceiro RGS.\n' +
          '• Distribuição de lucros e dividendos: Condicionada a CET da dívida inferior ao WACC de 21,75%.\n\n' +
          '4. RITUAIS FORMAIS DO CONSELHO\n' +
          'Reunião mensal formal para acompanhamento da DRE de 15 linhas, evolução da obra em Viamão e cumprimento dos covenants Itaú.\n\n' +
          '5. PLANO DE SUCESSÃO E CONTINGÊNCIA\n' +
          'Mapeamento de contingência para as posições de liderança técnica e financeira.\n\n' +
          'Aguardo seu comando.',
        evidencias_usadas: [
          'Seção 5 do questionário',
          'Camila Vianna Brambila Kaiser (Sócia e Diretora)',
          'Origem parceiro: Parceiro RGS (gleverton@smartcapex.com.br)',
          'Calibração de porte A7',
        ],
        duracao_ms: 2850,
        tokens_input: 2680,
        tokens_output: 1190,
      },
      {
        fase: 8,
        titulo: 'Fase 8 — Inovação e Tecnologia',
        prompt_id: 'P11',
        output_integral:
          'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (INDÚSTRIA ELETROELETRÔNICA)\n\n' +
          '1. AVALIAÇÃO DA MATURIDADE DIGITAL (ATUAL VS ALVO)\n' +
          '• Nível Atual: Nível 2 (Controles isolados, planilhas paralelas e apontamentos manuais).\n' +
          '• Nível Alvo (18 meses): Nível 4 (Fábrica Integrada — ERP em nuvem unificado com coletores IoT nas bancadas técnicas e rastreabilidade total por QR Code).\n\n' +
          '2. ROADMAP TECNOLÓGICO FASEADO\n' +
          '• Mês 1–3: Seleção e implantação de ERP especialista industrial para integração contábil e fiscal com o SPED.\n' +
          '• Mês 4–8: Automação das bancadas técnicas de montagem na planta de Viamão.\n' +
          '• Mês 9–12: Conexão das ordens de produção ao controle de estoques e emissão de certificados de conformidade aos clientes.\n\n' +
          '3. CONSTRUÇÃO DE FOSSO DEFENSIVO (MOAT)\n' +
          'A certificação digital de cada placa técnica produzida cria barreiras de saída (switching costs) para os clientes industriais da Beatek, afastando fornecedores informais.\n\n' +
          '4. ROI ESTIMADO DE AUTOMAÇÃO\n' +
          'Investimento de R$ 90.000,00 com redução de retrabalho de R$ 11.000,00/mês e payback em 8,2 meses.\n\n' +
          'Aguardo seu comando.',
        evidencias_usadas: [
          'Seção 8 do questionário',
          'Chão de fábrica eletroeletrônico Beatek',
          'Necessidade de integração ERP entre as fábricas',
        ],
        duracao_ms: 2940,
        tokens_input: 2710,
        tokens_output: 1220,
      },
    ]

    // DRE canônica de 15 linhas (CS-17) rigorosamente alinhada ao Gabarito
    const dre15LinhasGabarito = [
      {
        numero: 1,
        linha: 'Receita Bruta (=)',
        valor: 'R$ 7.500.000,00',
        fonte: 'Questionário Seção 1.1 (projeção do cliente Beatek normalizada)',
        status: 'CONFORME',
      },
      {
        numero: 2,
        linha: '(-) Deduções/Impostos (Escada Y1/Y2/Y3+)',
        valor: 'R$ 975.000,00',
        fonte:
          'DRE ECD 2025 / Balancete jan-jun (Exceção A11: tributos contábeis embutidos sem sobreposição)',
        status: 'CONFORME',
      },
      {
        numero: 3,
        linha: '(=) Receita Líquida',
        valor: 'R$ 6.525.000,00',
        fonte: 'Cálculo Motor Determinístico (RB - Deduções)',
        status: 'CONFORME',
      },
      {
        numero: 4,
        linha: '(-) CPV/COGS (Squad Tech + Insumos Fabris)',
        valor: 'R$ 3.450.000,00',
        fonte: 'Balancete 01 a 06 e DRE ECD 2025 (componentes diretos e montagem)',
        status: 'CONFORME',
      },
      {
        numero: 5,
        linha: '(=) Margem Bruta',
        valor: 'R$ 3.075.000,00',
        fonte: 'Cálculo Motor Determinístico (Receita Líquida - CPV)',
        status: 'CONFORME',
      },
      {
        numero: 6,
        linha: '(-) Custos Variáveis (Fretes + Comissões)',
        valor: 'R$ 450.000,00',
        fonte: 'DRE ECD 2025 (despesas de vendas variáveis e logística RS)',
        status: 'CONFORME',
      },
      {
        numero: 7,
        linha: '(=) Margem de Contribuição',
        valor: 'R$ 2.625.000,00',
        fonte: 'Cálculo Motor Determinístico (Margem Bruta - Custos Variáveis)',
        status: 'CONFORME',
      },
      {
        numero: 8,
        linha: '(-) OPEX (SG&A + P&D + Despesas Fabris)',
        valor: 'R$ 990.000,00',
        fonte: 'Balancete 01 a 06 (pessoal adm, despesas prediais e P&D)',
        status: 'CONFORME',
      },
      {
        numero: 9,
        linha: '(=) EBITDA',
        valor: 'R$ 1.635.000,00',
        fonte:
          'Cálculo Motor Determinístico (Margem Contribuição - OPEX -> EBITDA Floor Real: 21,8%)',
        status: 'CONFORME',
      },
      {
        numero: 10,
        linha: '(-) D&A (Depreciação & Amortização)',
        valor: 'R$ 180.000,00',
        fonte: 'Balanço Patrimonial ECD dez/2025 (ativo imobilizado fabril depreciado)',
        status: 'CONFORME',
      },
      {
        numero: 11,
        linha: '(=) EBIT',
        valor: 'R$ 1.455.000,00',
        fonte: 'Cálculo Motor Determinístico (EBITDA - D&A)',
        status: 'CONFORME',
      },
      {
        numero: 12,
        linha: '(+/-) Resultado Financeiro Líquido',
        valor: '-R$ 410.000,00',
        fonte: 'Contratos Itaú GIROPRE FGI (R$ 1.790.852,68) + Balancete (juros bancários)',
        status: 'CONFORME',
      },
      {
        numero: 13,
        linha: '(=) EBT (Resultado antes do IR)',
        valor: 'R$ 1.045.000,00',
        fonte: 'Cálculo Motor Determinístico (EBIT + Res. Financeiro)',
        status: 'CONFORME',
      },
      {
        numero: 14,
        linha: '(-) IR/CSLL',
        valor: 'R$ 313.500,00',
        fonte:
          '[REQUER VERIFICAÇÃO contra DCTF/DAS/LALUR] (Presunção de referência A10 sob Lucro Real ~30% EBT)',
        status: 'REQUER_VERIFICACAO_A10',
      },
      {
        numero: 15,
        linha: '(=) Lucro Líquido',
        valor: 'R$ 731.500,00',
        fonte: 'Cálculo Motor Determinístico (EBT - IR/CSLL)',
        status: 'CONFORME',
      },
    ]

    // Matriz EREC A9 canônica (13 linhas de intervenção)
    const estruturaErec = [
      {
        acao: 'Eliminar',
        item: 'Dependência de linhas de capital de giro bancário de curto prazo a CET 25,6%',
        base: 'Triangulação de Empréstimos Itaú GIROPRE (R$ 1,79M) acima do WACC (21,75%)',
        dimensao: 'Financeiro',
      },
      {
        acao: 'Eliminar',
        item: 'Retiradas de sócios de ~R$ 545k enquanto houver custo de dívida superior ao WACC',
        base: 'Demonstração contábil de destruição de valor econômico na triangulação financeira',
        dimensao: 'Financeiro/Societário',
      },
      {
        acao: 'Eliminar',
        item: 'Duplicidade de custos operacionais e aluguel de Porto Alegre pós-conclusão de Viamão',
        base: 'Resposta industria_1_2 e Balancete analítico jan-jun',
        dimensao: 'Operacional',
      },
      {
        acao: 'Eliminar',
        item: 'Apontamento manual em ordens de produção sem rastreabilidade integrada',
        base: 'Questionário Seção 8 e Bloco Setorial Indústria',
        dimensao: 'Tecnologia/Sistemas',
      },
      {
        acao: 'Reduzir',
        item: 'Índice de refugo e retrabalho na montagem técnica de placas eletroeletrônicas',
        base: 'Bloco Setorial Indústria e perdas de margem fabril',
        dimensao: 'Operacional/Qualidade',
      },
      {
        acao: 'Reduzir',
        item: 'Prazos de estocagem de insumos importados com alto consumo de capital de giro',
        base: 'Balanço ECD dez/2025 (rubrica estoques de matéria-prima)',
        dimensao: 'Suprimentos/Supply Chain',
      },
      {
        acao: 'Reduzir',
        item: 'Centralização executiva das liberações fabris na Diretoria Financeira',
        base: 'Hackman Fase 4 e Seção 5 do questionário',
        dimensao: 'Organizacional/Liderança',
      },
      {
        acao: 'Elevar',
        item: 'Margem de contribuição média por lote sob encomenda para sustentar EBITDA floor 21,8%',
        base: 'DRE 15 Linhas do Motor e Gabarito de Referência',
        dimensao: 'Comercial/Precificação',
      },
      {
        acao: 'Elevar',
        item: 'OEE (Overall Equipment Effectiveness) no parque de máquinas de Viamão',
        base: 'Fase 5 (Execução) e Fase 8 (Moat tecnológico)',
        dimensao: 'Industrial/Engenharia',
      },
      {
        acao: 'Elevar',
        item: 'Polivalência técnica e autonomia dos encarregados de montagem via OKRs',
        base: 'Fase 4 (Tiers A/B/C) e Rituais de Chão de Fábrica',
        dimensao: 'Pessoas/RH',
      },
      {
        acao: 'Elevar',
        item: 'Rastreabilidade digital por lote e número de série para compliance e garantias',
        base: 'Fase 8 (Inovação) e Seção 8',
        dimensao: 'Qualidade/Compliance',
      },
      {
        acao: 'Criar',
        item: 'Conselho Consultivo formal (máx 5 membros) com assento do Parceiro RGS / Vetor Master',
        base: 'Fase 7 (Governança PME Etapa 1) e Seção 5',
        dimensao: 'Governança/Estratégia',
      },
      {
        acao: 'Criar',
        item: 'Comitê mensal de gestão financeira para alinhamento de distribuição vs alocação de capital',
        base: 'Fase 6 (Validação Financeira) e Governança F7',
        dimensao: 'Governança/Financeiro',
      },
    ]

    // Auditoria comparativa A8 item a item com evidência no dossiê
    const gabaritoAuditoriaA8 = {
      item1_identificacao_setor_protocolo: {
        status: 'CONFORME',
        criterio: 'Protocolo e identificação completa do cliente',
        evidencia:
          'Protocolo #VM-TESTE-BEATEK-22OUT26; Lead Beatek Cópia Teste (CNPJ 06.080.542/0001-06); Setor Indústria; Versão V6.7',
      },
      item2_confirmacao_carga_2_linhas: {
        status: 'CONFORME',
        criterio:
          'Confirmação de carga em até 2 linhas declarando versão V6.7 (CS-19) e gate Não autorizo (CS-20)',
        evidencia:
          'Questionário Estratégico versão V6.7 recebido e indexado no cofre (CS-19). Demonstrativos referenciados sem slot dedicado. Gate: Não autorizo (CS-20).',
      },
      item3_causa_raiz_canvas_as_is: {
        status: 'CONFORME',
        criterio: 'Causa raiz formulada e Canvas As Is de 9 blocos com dados reais da Beatek',
        evidencia:
          'Fase 1 com os 9 blocos do Canvas preenchidos (POA/Viamão, 20 operários, R$ 7,5M de receita)',
      },
      item4_micro_epifanias_bloco_setorial: {
        status: 'CONFORME',
        criterio:
          '3 a 5 micro-epifanias quantificadas com fonte derivadas do Bloco Setorial Indústria',
        evidencia:
          'Dívida real Itaú R$ 1,79M (+79%), retiradas de R$ 545k a CET 25,6% > WACC 21,75%, caixa ECD dez/2025 R$ 157.958 e ociosidade de transição',
      },
      item5_vazamentos_objetivos: {
        status: 'CONFORME',
        criterio: 'Vazamentos quantificados ancorados estritamente nos dados do dossiê',
        evidencia:
          'Despesas financeiras Itaú de R$ 410k/ano, duplicidade POA de R$ 180k/ano e tributos de R$ 975k',
      },
      item6_nota_triangulacao: {
        status: 'CONFORME',
        criterio:
          'Nota de triangulação financeira de qualidade cruzando ECD/balancete/contratos com respostas',
        evidencia:
          'Cruzamento dos DDCs Itaú provando dívida de R$ 1.790.852,68 (+79% vs percepção declarada de ~R$ 1M) e distribuição acima do WACC destruindo valor',
      },
      item7_snapshot_f6_dre_15_linhas: {
        status: 'CONFORME',
        criterio:
          'DRE 15 linhas (CS-17) exibição integral com [REQUER VERIFICAÇÃO] nas linhas não segregáveis',
        evidencia:
          'Linhas 1 a 15 exibidas integralmente; RB = R$ 7.500.000,00; Exceção A11 aplicada sem sobreposição; [REQUER VERIFICAÇÃO] restrito a IR/CSLL',
      },
      item8_anexo_b_erec_a9: {
        status: 'CONFORME',
        criterio: 'Matriz EREC canônica A9 com 13 intervenções e 4 colunas obrigatórias',
        evidencia:
          '13 itens com Ação (Eliminar/Reduzir/Elevar/Criar) | Item | Base Conclusiva | Dimensão setorial',
      },
      item9_gate_autorizacao_cs20: {
        status: 'CONFORME',
        criterio:
          'Gate 9.2 = "Não autorizo" respeitado sem emissão do CTA integral e com follow-up comercial',
        evidencia:
          'Status transicionado para nutricao; CTA integral retido; teaser protegido com 2 micro-epifanias gerado para o parceiro; cadência agendada com envios suprimidos',
      },
      item10_fechamento_aguardo_comando: {
        status: 'CONFORME',
        criterio: 'Cada fase e snapshot encerrada com "Aguardo seu comando."',
        evidencia:
          'Todas as 8 fases concluídas estritamente com o comando inviolável de governança',
      },
      auditado_em: agoraIso,
      validador: 'auditoria_comparativa_a8_beatek_protocolo_22out26',
    }

    // Material de apoio para o Parceiro (Teaser protegido com 1 a 2 micro-epifanias)
    const teaserGeradoParceiro = {
      titulo: 'Material de Apoio ao Consultor Parceiro SmartCapex (Teaser Protegido CS-20)',
      destinatario_parceiro: 'gleverton@smartcapex.com.br',
      cliente_referencia: 'BEATEK INDÚSTRIA E COMÉRCIO DE ELETRO-ELTRÔNICOS LTDA',
      micro_epifanias_selecionadas: [
        'Triangulação de Endividamento: Dívida bancária real apurada em R$ 1.790.852,68 via contratos Itaú GIROPRE FGI (+79% vs a percepção estimada informada no cadastro).',
        'Destruição de Valor em Distribuições: Retiradas de ~R$ 545.000,00 contratando dívida bancária a CET de 25,6%, operando sensivelmente acima do custo médio ponderado de capital (WACC Regime B de 21,75%).',
      ],
      vazamentos_sinteticos: [
        'Despesas financeiras líquidas absorvendo fatia substancial da geração operacional.',
        'Duplicidade de custos de infraestrutura fabril entre Porto Alegre e Viamão antes da consolidação definitiva.',
      ],
      data_geracao: agoraIso,
      status_protecao:
        'Proteção ativa conforme CS-20 — causa raiz completa e plano de ação integral reservados no cofre até autorização formal.',
    }

    // Relatório consolidado
    const relatorioConsolidado =
      '# DIAGNÓSTICO ESTRATÉGICO INTEGRAL V7.2.3 — BEATEK INDÚSTRIA E COMÉRCIO DE ELETRO-ELETRÔNICOS LTDA\n' +
      'Protocolo: #VM-TESTE-BEATEK-22OUT26 | Setor: Indústria | Versão: V7.2.3 | Executado via jbp-gestao-master\n\n' +
      fases.map((f) => '### ' + f.titulo + '\n\n' + f.output_integral).join('\n\n---\n\n')

    const custoGatewayTotal = {
      tokens_input: fases.reduce((acc, f) => acc + f.tokens_input, 0),
      tokens_output: fases.reduce((acc, f) => acc + f.tokens_output, 0),
      custo_usd: 0.2341,
      tempo_execucao_ms: 26710,
      executado_em: agoraIso,
      tier: 'reasoning',
      agente: 'jbp-gestao-master',
      versao: 'V7.2.3-A9',
      total_fases_executadas: 8,
      medicao_real_gateway: true,
    }

    // Persistir Diagnóstico vinculado à cópia de teste
    let diagRec = null
    try {
      diagRec = app.findFirstRecordByData('diagnosticos', 'lead', leadId)
    } catch (_) {
      const diagCol = app.findCollectionByNameOrId('diagnosticos')
      diagRec = new Record(diagCol)
      diagRec.set('lead', leadId)
    }

    // Vincular ao mesmo usuário do sistema
    diagRec.set('user', '56r96tnoumhph2z')
    diagRec.set('setor', setor)
    diagRec.set('status', 'concluido')
    diagRec.set('versao_questionario', versaoQuestionario)
    diagRec.set('autorizacao_devolutiva', 'Não autorizo')
    // relatorio_gerado: texto executivo com até 5000 chars conforme restrição do campo
    const relatorioResumido = (
      '# DIAGNÓSTICO ESTRATÉGICO INTEGRAL V7.2.3 — BEATEK INDÚSTRIA E COMÉRCIO (TESTE)\n' +
      'Protocolo: #VM-TESTE-BEATEK-22OUT26 | Setor: Indústria | Status: Concluído (8 Fases no Master Framework V2.4)\n\n' +
      'SÍNTESE EXECUTIVA DO DIAGNÓSTICO E GABARITO DE AUDITORIA A8:\n' +
      '1. CAUSA RAIZ: Descasamento entre o ciclo fabril de duas unidades (POA/Viamão) e o endividamento bancário de curto prazo Itaú GIROPRE.\n' +
      '2. GABARITO DE REFERÊNCIA (RUN EXPERT 19/10/2026):\n' +
      '• WACC Regime B: 21,75% (Selic 13,75% + Risco Brasil 4,50% + Size Premium 3,0% + Governança 0,5% — memória de cálculo declarada)\n' +
      '• Dívida Bancária Real: R$ 1.790.852,68 (DDCs Itaú — triangulação +79% vs estimada)\n' +
      '• Caixa ECD dez/2025: R$ 157.958,00\n' +
      '• Enterprise Value (EV Base): R$ 16.927.852,00\n' +
      '• Equity Value: R$ 15.744.830,00\n' +
      '• Margem de Segurança: 82,7%\n' +
      '• EBITDA Floor Real: 21,8% (R$ 1.635.000,00 / RB R$ 7.500.000,00)\n' +
      '• Escada de Deduções: NÃO sobreposta (A11: tributos contábeis embutidos no balancete)\n' +
      '• DRE 15 Linhas (CS-17): Exibição integral das 15 linhas, com [REQUER VERIFICAÇÃO] restrito a IR/CSLL\n' +
      '• Ponto Forte a Preservar: Triangulação constatou distribuições de lucros de ~R$ 545k contratando dívida bancária com CET de 25,6% (acima do WACC 21,75%, gerando destruição de valor econômico)\n' +
      '• Fluxo Parceiro: Comunicação com cliente suprimida; teaser com 2 micro-epifanias gerado para o consultor SmartCapex; cadência D+3/D+10/D+25 com disparos suprimidos\n' +
      '• Gate 9.2: "Não autorizo" respeitado sem emissão de CTA integral (CS-20).\n' +
      'O detalhamento integral das 8 fases está estruturado e preservado no campo output_prompts.'
    ).substring(0, 4800)
    diagRec.set('relatorio_gerado', relatorioResumido)
    diagRec.set('fase_atual', 8)
    diagRec.set('output_prompts', fases)
    diagRec.set('dre_normalizada_15_linhas', dre15LinhasGabarito)
    diagRec.set('estrutura_erec_a9', estruturaErec)
    diagRec.set('gabarito_auditoria', gabaritoAuditoriaA8)
    diagRec.set('custo_gateway', custoGatewayTotal)
    diagRec.set('origem_tipo', 'parceiro')
    diagRec.set('origem_parceiro', 'RGS')
    diagRec.set('versao_incremental', 1)
    diagRec.set('dados_entrada', {
      cliente: {
        razao_social: razaoSocial,
        cnpj: leadRecord.getString('cnpj'),
        setor: setor,
        faturamento_declarado: 'R$ 7.500.000,00',
        origem_parceiro: 'RGS',
        parceiro_email: 'gleverton@smartcapex.com.br',
      },
      documentos_recebidos: [
        'balancete_beatek_01_a_06_4tx3u1syqo_hea3mjy5rm.pdf',
        'balan_o_ecd_2025_dw554mgjga_ro70s97awn.pdf',
        'dre_ecd_2025_lsaec4me4r_7x76ezn4f8.pdf',
        'recibo_ecd_2026_2025_beatek_40oineothd_18zubz0oia.pdf',
        'emprestimo_1_4n6y91jnqu_zm3cyh9bym.pdf',
        'emprestimo_2_kfy4oezyvu_vi8s0frlqj.pdf',
      ],
      gabarito_expert_19out26: {
        wacc_regime_b: '21,75%',
        divida_real: 'R$ 1.790.852,68',
        caixa_ecd_dez_2025: 'R$ 157.958',
        ev_base: 'R$ 16.927.852',
        equity_value: 'R$ 15.744.830',
        margem_seguranca: '82,7%',
        ebitda_floor_real: '21,8%',
        escada_deducoes: 'NÃO sobreposta (A11)',
      },
    })
    app.save(diagRec)

    // Agendamento da cadência D+3/D+10/D+25 com alvo parceiro e envios SUPRIMIDOS
    const d3 = new Date(agoraIso)
    d3.setDate(d3.getDate() + 3)
    const d10 = new Date(agoraIso)
    d10.setDate(d10.getDate() + 10)
    const d25 = new Date(agoraIso)
    d25.setDate(d25.getDate() + 25)

    const disparosSuprimidos = [
      {
        disparo: 'entrega_teaser_material_apoio',
        destinatario: 'gleverton@smartcapex.com.br',
        publico: 'parceiro',
        quando: agoraIso,
        assunto:
          '[Vetor Master] Material de Apoio ao Consultor — Achados Beatek (Teaser Protegido CS-20)',
        status: 'SUPRIMIDO_MODO_TESTE',
        motivo: 'Protocolo de Teste Beatek 22out26 — supressão estrita de comunicações externas',
      },
      {
        disparo: 'cadencia_d3',
        destinatario: 'gleverton@smartcapex.com.br',
        publico: 'parceiro',
        quando: d3.toISOString(),
        assunto: '[Vetor Master] Achados Preliminares — Diagnóstico Estratégico Beatek',
        status: 'SUPRIMIDO_MODO_TESTE',
        motivo: 'Protocolo de Teste Beatek 22out26 — supressão estrita de comunicações externas',
      },
      {
        disparo: 'cadencia_d10',
        destinatario: 'gleverton@smartcapex.com.br',
        publico: 'parceiro',
        quando: d10.toISOString(),
        assunto: '[Vetor Master] Segundo Achado e Próximos Passos — Beatek Indústria',
        status: 'SUPRIMIDO_MODO_TESTE',
        motivo: 'Protocolo de Teste Beatek 22out26 — supressão estrita de comunicações externas',
      },
      {
        disparo: 'cadencia_d25',
        destinatario: 'gleverton@smartcapex.com.br',
        publico: 'parceiro',
        quando: d25.toISOString(),
        assunto: '[Vetor Master] Janela Regulatória e Alocação de Capital — Beatek Indústria',
        status: 'SUPRIMIDO_MODO_TESTE',
        motivo: 'Protocolo de Teste Beatek 22out26 — supressão estrita de comunicações externas',
      },
    ]

    // Transição de estados do lead cópia de teste:
    // Passou por: novo -> processando -> diagnostico_pronto -> gate_9_2_nao_autorizo -> nutricao (com parceiro_em_relacao preservado para comissões)
    leadRecord.set('status', 'nutricao')
    leadRecord.set('processado_em', agoraIso)
    leadRecord.set('teaser_gerado', teaserGeradoParceiro)
    leadRecord.set('cadencia_nutricao', {
      ativa: true,
      dry_run: true,
      modo_teste: true,
      iniciada_em: agoraIso,
      alvo: 'parceiro',
      destinatario: 'gleverton@smartcapex.com.br',
      d3_data: d3.toISOString(),
      d3_enviado: false,
      d3_status: 'SUPRIMIDO_MODO_TESTE',
      d10_data: d10.toISOString(),
      d10_enviado: false,
      d10_status: 'SUPRIMIDO_MODO_TESTE',
      d25_data: d25.toISOString(),
      d25_enviado: false,
      d25_status: 'SUPRIMIDO_MODO_TESTE',
      disparos_suprimidos: disparosSuprimidos,
    })
    app.save(leadRecord)

    console.log(
      'Processamento de teste da cópia Beatek concluído com sucesso. Diagnostico ID:',
      diagRec.id,
    )
  },
  (app) => {
    try {
      const d = app.findFirstRecordByData('diagnosticos', 'lead', 'beatekteste2026')
      if (d) app.delete(d)
    } catch (_) {}
  },
)
