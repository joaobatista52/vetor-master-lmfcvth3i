/// <reference path="../pb_data/types.d.ts" />
// 0038 — Sincronizar frameworks com Master Framework V2.4 (Áreas 1, 2, 4, 5, 7, 8)
migrate(
  (app) => {
    try {
      const frameworksCol = app.findCollectionByNameOrId('frameworks')

      // Área 1 — Estratégia
      try {
        const f1 = app.findFirstRecordByData('frameworks', 'area_numero', 1)
        f1.set(
          'conteudo',
          'Mapear o mercado com precisão cirúrgica e definir posicionamento disruptivo para capturar valor exponencial. Canvas As Is (9 blocos), 5 Forças de Porter, Canvas To Be (Inovação de Valor) e Estratégia do Oceano Azul (Matriz EREC/ERRC e Curva de Valor comparativa com foco nos 12 setores).',
        )
        f1.set(
          'regras_ouro',
          'Clean Text: voz direta, assertiva e sem adjetivação desnecessária. Stress Test de Buffett: ROI projetado > 30% a.a. e margem de segurança > 50%. Proibição absoluta de citação acadêmica no corpo do texto principal.',
        )
        app.save(f1)
      } catch (e1) {
        console.log('Aviso ao atualizar framework 1: ' + e1.message)
      }

      // Área 2 — Execução e Qualidade
      try {
        const f2 = app.findFirstRecordByData('frameworks', 'area_numero', 2)
        f2.set(
          'conteudo',
          'Garantir a implementação da estratégia com excelência operacional. Regra Camaleão (Agile para incerteza/inovação; Waterfall/Lean para estabilidade e escala), Hoshin Kanri (desdobramento vertical em todos os níveis), OKRs trimestrais e rituais de gestão padronizados (Daily Stand-ups 15 min, Weekly Reviews 1h, Monthly Deep Dives 2h-4h).',
        )
        f2.set(
          'regras_ouro',
          'Adaptar a cadência e metodologia à maturidade organizacional. OKRs alinhados verticalmente via Hoshin Kanri.',
        )
        app.save(f2)
      } catch (e2) {
        console.log('Aviso ao atualizar framework 2: ' + e2.message)
      }

      // Área 4 — Inovação e Tecnologia
      try {
        const f4 = app.findFirstRecordByData('frameworks', 'area_numero', 4)
        f4.set(
          'conteudo',
          'Transformar tecnologia em vantagem competitiva absoluta (Moat). Auditoria de legados e migração para Nuvem, BI e Cultura Data-Driven com dashboards em tempo real, IA Generativa e RAG institucional para preservação de conhecimento, e automação de processos cognitivos.',
        )
        f4.set(
          'regras_ouro',
          'Stress Test de Buffett: toda tecnologia deve ampliar o Moat ou reduzir o custo marginal em > 50%. Regra Camaleão aplicada à maturidade técnica da organização.',
        )
        app.save(f4)
      } catch (e4) {
        console.log('Aviso ao atualizar framework 4: ' + e4.message)
      }

      // Área 5 — Marketing e Vendas
      try {
        const f5 = app.findFirstRecordByData('frameworks', 'area_numero', 5)
        f5.set(
          'conteudo',
          'Construção de uma Máquina de Vendas Previsível. Definição cirúrgica de ICP (concentra 80% da receita saudável), Pirâmide de Chet Holmes (topo e meio de funil educando sobre custos da ineficiência), operação SDR/CRM com metas diárias e SLAs rigorosos, eficiência LTV/CAC > 4:1 com Payback < 12 meses e cronograma de upsell estruturado.',
        )
        f5.set(
          'regras_ouro',
          'Meta contínua de 30% de taxa de upsell anual. Otimização de conversão por canal e SLAs entre marketing e vendas.',
        )
        app.save(f5)
      } catch (e5) {
        console.log('Aviso ao atualizar framework 5: ' + e5.message)
      }

      // Área 7 — Gestão de Riscos e Compliance
      try {
        const f7 = app.findFirstRecordByData('frameworks', 'area_numero', 7)
        f7.set(
          'conteudo',
          'Blindagem do Moat e Perenidade. Matriz de Calor (Probabilidade × Impacto), Compliance Contratual com auditoria periódica de 100% dos contratos ativos, governança de LGPD e proteção de segredos comerciais via NDAs robustos, e política de tolerância zero.',
        )
        f7.set(
          'regras_ouro',
          'Tolerância zero a desvios éticos ou fraudes financeiras com rescisão e destituição imediata. Mitigação obrigatória de riscos em zona vermelha em no máximo 90 dias.',
        )
        app.save(f7)
      } catch (e7) {
        console.log('Aviso ao atualizar framework 7: ' + e7.message)
      }

      // Área 8 — Foresight Estratégico
      try {
        const f8 = app.findFirstRecordByData('frameworks', 'area_numero', 8)
        f8.set(
          'conteudo',
          'Antecipar disrupções e transformar incerteza em vantagem competitiva. Framework Prospectivo: STEEP/PESTEL, Cone dos Futuros, Roda de Futuros, Planejamento de Cenários 2x2, Backcasting (do futuro preferível até as ações do presente), alimentando SWOT Dinâmica e OKRs Flexíveis.',
        )
        f8.set(
          'regras_ouro',
          'Integração obrigatória: Foresight alimenta o Planejamento Estratégico via SWOT dinâmica e OKRs flexíveis calibrados continuamente pelos cenários.',
        )
        app.save(f8)
      } catch (e8) {
        console.log('Aviso ao atualizar framework 8: ' + e8.message)
      }
    } catch (err) {
      console.log('Erro geral na migration 0038: ' + err.message)
    }
  },
  (app) => {
    // Reversão no-op
  },
)
