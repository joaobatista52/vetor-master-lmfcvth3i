/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // 0080_popular_okrs_e_planos_beatek_fases.js
    // PASSO 6 DO PROTOCOLO (Dashboard):
    // Popular OKRs e Planos de Ação reais gerados na Fase 5 do diagnóstico Beatek
    // para que os 3 blocos do Dashboard (Saúde Financeira, Trilha de Etapas, OKRs) exibam dados reais sem badge "Demonstração".

    const userId = '56r96tnoumhph2z'
    const diagId = 'wor27cnyubs22ot' // Diagnostico cópia Beatek

    // 1. OKRs derivados da Fase 5 do diagnóstico
    const okrsCollection = app.findCollectionByNameOrId('okrs')

    // OKR 1: Finanças & Dívida Itaú
    const okr1 = new Record(okrsCollection)
    okr1.set('user', userId)
    okr1.set('etapa', 6)
    okr1.set('etapa_nome', 'Fase 6 — Validação Financeira e Alocação')
    okr1.set(
      'objetivo',
      'Saneamento do endividamento bancário Itaú e preservação da liquidez operacional perante o WACC de 21,75%',
    )
    okr1.set('progresso', 35)
    okr1.set('resultados_chave', [
      {
        titulo: 'Alongar o saldo devedor Itaú (R$ 1.790.852,68) para CET inferior a 21,75% a.a.',
        progresso: 40,
        meta: 'CET < 21,75%',
      },
      {
        titulo:
          'Suspender retiradas de sócios de ~R$ 545k enquanto houver custo financeiro superior ao WACC',
        progresso: 50,
        meta: 'Zero destruição de valor',
      },
      {
        titulo:
          'Manter reserva de caixa mínima de segurança acima de R$ 250.000 (vs R$ 157.958 dez/2025)',
        progresso: 25,
        meta: '> R$ 250k',
      },
    ])
    app.save(okr1)

    // OKR 2: Transição Industrial POA -> Viamão
    const okr2 = new Record(okrsCollection)
    okr2.set('user', userId)
    okr2.set('etapa', 5)
    okr2.set('etapa_nome', 'Fase 5 — Execução e Roadmap')
    okr2.set(
      'objetivo',
      'Migração industrial controlada para o Polo de Viamão sem ruptura de fornecimento técnico',
    )
    okr2.set('progresso', 55)
    okr2.set('resultados_chave', [
      {
        titulo: 'Concluir obras civis em Viamão com desvio de orçamento inferior a 5%',
        progresso: 70,
        meta: 'Desvio < 5%',
      },
      {
        titulo:
          'Manter índice de refugo na montagem eletroeletrônica abaixo de 1,5% durante a transição',
        progresso: 60,
        meta: 'Refugo < 1,5%',
      },
      {
        titulo:
          'Desmobilizar galpão alugado em Porto Alegre economizando 100% dos custos locatícios',
        progresso: 35,
        meta: '100% economia aluguel',
      },
    ])
    app.save(okr2)

    // OKR 3: Governança & Parceiro RGS
    const okr3 = new Record(okrsCollection)
    okr3.set('user', userId)
    okr3.set('etapa', 7)
    okr3.set('etapa_nome', 'Fase 7 — Governança e Liderança')
    okr3.set(
      'objetivo',
      'Instituir Conselho Consultivo formal (máx 5 membros) com assento do Parceiro RGS',
    )
    okr3.set('progresso', 45)
    okr3.set('resultados_chave', [
      {
        titulo:
          'Realizar reuniões mensais formais do Conselho para acompanhamento da DRE de 15 linhas',
        progresso: 60,
        meta: '1 reunião/mês',
      },
      {
        titulo: 'Atingir EBITDA floor real de 21,8% sobre a Receita Bruta normalizada de R$ 7,5M',
        progresso: 50,
        meta: 'EBITDA 21,8%',
      },
      {
        titulo: 'Adequar planejamento fiscal e societário para a Reforma Tributária CBS/IBS',
        progresso: 30,
        meta: 'Compliance RT',
      },
    ])
    app.save(okr3)

    // 2. Plano de Ação 5W2H derivado da Fase 5
    const planosCol = app.findCollectionByNameOrId('planos_acao')
    const plano1 = new Record(planosCol)
    plano1.set('user', userId)
    plano1.set('diagnostico', diagId)
    plano1.set('etapa', 5)
    plano1.set('etapa_nome', 'Fase 5 — Execução e Roadmap')
    plano1.set('status', 'Em Progresso')
    plano1.set('tarefas_5w2h', [
      {
        id: 't1',
        o_que: 'Renegociação dos contratos Itaú GIROPRE FGI (R$ 1.790.852,68)',
        por_que: 'Custo de 25,6% a.a. supera o WACC Regime B de 21,75%, destruindo valor da firma',
        quem: 'Diretoria Administrativo-Financeira + Parceiro RGS',
        onde: 'Banco Itaú / Agência Empresas',
        quando: '30 dias',
        como: 'Alongamento para 36 meses com carência de 6 meses e mitigação de spread',
        quanto: 'Economia estimada de juros de R$ 25k/mês',
        concluida: false,
      },
      {
        id: 't2',
        o_que: 'Suspensão temporária de distribuições desproporcionais de lucros (~R$ 545k)',
        por_que: 'Preservar liquidez e capacidade de investimento próprio na planta de Viamão',
        quem: 'Sócios Camila Kaiser e Diretoria Técnica',
        onde: 'Reunião de Sócios',
        quando: 'Imediato',
        como: 'Alinhamento com base na DRE 15 linhas e demonstrativo de valor da firma',
        quanto: 'R$ 545k retidos no caixa operacional',
        concluida: true,
      },
      {
        id: 't3',
        o_que: 'Finalização do cronograma de transição fabril POA -> Viamão',
        por_que: 'Eliminar custos duplicados de aluguel e ociosidade de mão de obra (20 operários)',
        quem: 'Gerente Industrial e Engenharia',
        onde: 'Planta Viamão',
        quando: '90 dias',
        como: 'Layout Lean com bancadas de montagem com QR Code e esteiras modulares',
        quanto: 'R$ 180k/ano de economia pós-desmobilização POA',
        concluida: false,
      },
    ])
    app.save(plano1)

    console.log('OKRs e Planos de Ação Beatek vinculados com sucesso.')
  },
  (app) => {
    try {
      const okrs = app.findRecordsByFilter('okrs', 'user = "56r96tnoumhph2z"')
      for (const o of okrs) app.delete(o)
      const planos = app.findRecordsByFilter('planos_acao', 'user = "56r96tnoumhph2z"')
      for (const p of planos) app.delete(p)
    } catch (_) {}
  },
)
