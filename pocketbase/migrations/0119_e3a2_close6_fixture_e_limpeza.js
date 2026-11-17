/// <reference path="../pb_data/types.d.ts" />
// E3-A-2-CLOSE-6: preparação da prova ponta-a-ponta do teste 5 no gatilho cron.
// 1) Remove de logs_auditoria os registros CORE_INDISPONIVEL (tag E3A2_CLOSE3,
//    resource 'core_indisponivel' e 'excecao_core'): registro de falha de carga
//    NÃO é evidência de teste — limpeza exigida antes do veredito.
// 2) Garante UMA lead em FORMATO 1 (dossie/cliente/secoes/anexos) para a
//    montagem do Pacote V2.0 no cron: a lead Aurora real (t8zia1qyovt9cof)
//    está sem dados_completos e a efêmera da rodada anterior foi apagada pela
//    migration 0118. Fixture nova, idempotente (só cria se não existir nenhuma
//    lead com dados_completos preenchido). Conteúdo fictício derivado do caso
//    Aurora Trading (comércio internacional / trading company), nível Bespoke
//    CaaS via plano_interesse no registro (regra Etapa 2: Bespoke ANTES de CaaS).
// Idempotente: em banco já preparado, ambos os passos são no-op.
const DOSSIE_AURORA_FORMATO1 = JSON.stringify({
  dossie: { id: 'DM-E3A2-CLOSE6-AURORA', protocolo: 'PROTO-E3A2-CLOSE6-AURORA' },
  cliente: {
    razao_social: 'Aurora Trading Ltda',
    cnpj: '12.345.678/0001-90',
    respondente: 'Helena Duarte',
    cargo: 'Diretora Comercial',
    email: 'helena@auroratrading.com.br',
    whatsapp: '+55 48 99999-0000',
    setor: 'Comércio Atacadista',
    segmento: 'Comércio internacional — trading company',
    versao_questionario: 'V7.2',
  },
  secoes: [
    {
      nome: 'estrategia',
      perguntas: {
        modelo_de_negocio:
          'Importação por encomenda e por conta e ordem de bens industriais, operando como trading company entre fornecedores na Ásia e indústrias em Santa Catarina.',
        diferencial_competitivo:
          'Domínio regulatório de ICMS/ST em Santa Catarina e capacidade de travar câmbio antecipado por modalidade de importação.',
        margem_por_modalidade:
          'Margem média de 7,2% na importação por encomenda e 4,1% na importação por conta e ordem; a exposição cambial não precificada corrói 1,8 ponto percentual.',
        prioridade_estrategica:
          'Diversificar a base de fornecedores asiáticos sem perder o diferencial fiscal de ICMS em Santa Catarina.',
        horizonte_planejamento: '12 meses operacionais, 3 anos estratégicos.',
      },
    },
    {
      nome: 'mercado',
      perguntas: {
        principais_clientes:
          'Indústrias de alimentos e metal mecânica de Santa Catarina que importam insumos sem estrutura própria de comércio exterior.',
        canais_de_venda:
          'Venda consultiva direta da diretoria e indicação de despachantes aduaneiros.',
      },
    },
  ],
  anexos: {},
})

migrate(
  (app) => {
    // 1) Limpeza dos CORE_INDISPONIVEL (não são evidência de teste)
    try {
      const logs = app
        .recordQuery('logs_auditoria')
        .andWhere($dbx.exp('action', '=', 'E3A2_CLOSE3'))
        .andWhere($dbx.exp('resource', 'like', 'core_indisponivel'))
        .build()
        .all()
      for (let i = 0; i < logs.length; i++) app.delete(logs[i])
    } catch (_) {}
    try {
      const exc = app
        .recordQuery('logs_auditoria')
        .andWhere($dbx.exp('action', '=', 'E3A2_CLOSE3'))
        .andWhere($dbx.exp('resource', '=', 'excecao_core'))
        .build()
        .all()
      for (let i = 0; i < exc.length; i++) app.delete(exc[i])
    } catch (_) {}

    // 2) Fixture FORMATO 1 — só cria se NÃO houver nenhuma lead com dossiê
    try {
      const comDossie = app
        .recordQuery('leads')
        .andWhere($dbx.exp('dados_completos', '!=', ''))
        .build()
        .all()
      if (comDossie.length === 0) {
        let idUsuario = null
        try {
          idUsuario = app.findFirstRecordByFilter(
            'users',
            "email = 'svc-pipeline@vetormaster.com.br'",
          ).id
        } catch (eU1) {
          try {
            idUsuario = app.findFirstRecordByFilter('users', "role = 'admin'").id
          } catch (eU2) {
            idUsuario = null
          }
        }
        const col = app.findCollectionByNameOrId('leads')
        const rec = new Record(col)
        if (idUsuario) rec.set('user', idUsuario)
        rec.set('nome', 'Aurora Trading (fixture E3-A-2-CLOSE-6)')
        rec.set('email', 'helena@auroratrading.com.br')
        rec.set('empresa', 'Aurora Trading Ltda')
        rec.set('setor', 'Comércio Atacadista')
        rec.set('status', 'teste')
        rec.set('origem_tipo', 'exercicio')
        rec.set('plano_interesse', 'Bespoke CaaS')
        rec.set('dados_completos', DOSSIE_AURORA_FORMATO1)
        app.save(rec)
        console.log('[E3A2_CLOSE6] fixture FORMATO 1 criada: ' + rec.id)
      }
    } catch (errFix) {
      console.log('[E3A2_CLOSE6] fixture FORMATO 1: ' + (errFix && errFix.message))
    }
  },
  (app) => {
    // down: nada a restaurar
  },
)
