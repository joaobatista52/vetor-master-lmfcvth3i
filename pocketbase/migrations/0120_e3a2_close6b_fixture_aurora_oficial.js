/// <reference path="../pb_data/types.d.ts" />

/**
 * E3-A-2-CLOSE-6-B · Migration 0120 — correção de alvo do cron de prova.
 *
 * Diagnóstico (rodada anterior): o cron pegava a PRIMEIRA lead com
 * dados_completos por ordem de inserção (fm89kpmmaowg5ko, "Import Hub Trading
 * Ltda."), cujos dados estão em FORMATO DO SITE — sem as 4 chaves de 1º nível
 * do FORMATO 1 — e morria com FORMATO1_CHAVE_AUSENTE_DOSSIE_CLIENTE_SECOES_ANEXOS
 * ANTES da IA. A migration 0119 só cria a fixture se NÃO houver NENHUMA lead
 * com dados_completos preenchido — e o banco tem leads reais do site, então a
 * fixture nunca foi gravada.
 *
 * Ação (mínima): grava a fixture FORMATO 1 da Aurora Trading EM MEMÓRIA da
 * lead Aurora oficial t8zia1qyovt9cof (dados_completos). O hook
 * e3a2_close_gatilho_temp.js (CLOSE-6-B) seleciona a lead que de fato tem o
 * FORMATO 1; esta migration garante que a Aurora oficial o tenha. Não toca nas
 * demais leads, não altera lógica de montagem, contagens, IDs nem FK.
 */
const DOSSIE_AURORA_FORMATO1 = JSON.stringify({
  dossie: {
    id: 'DM-E3A2-CLOSE6-AURORA',
    protocolo: 'PROTO-E3A2-CLOSE6-AURORA',
    versao: 'V7.2',
  },
  cliente: {
    razao_social: 'Aurora Trading Ltda',
    cnpj: '98.765.432/0001-10',
    respondente: 'Marcos Andrade',
    cargo: 'Diretor Comercial',
    email: 'joaobatistadepaula52@gmail.com',
    whatsapp: '(11) 99966-6655',
    setor: 'Comércio Internacional - Trading Company',
    segmento: 'Comércio internacional — trading company',
    formato_interesse: 'Bespoke CaaS',
    versao_questionario: 'V7.2',
  },
  metadados: {
    origem_fix: 'migration-0120-e3a2-close-6-b',
    exercicio: 'E3-A-2-CLOSE-6-B',
  },
  secoes: [
    {
      nome: 'estrategia',
      perguntas: {
        modelo_de_receita:
          'Importação por encomenda e por conta e ordem de terceiros; margem por modalidade, com serviço embutido no preço da mercadoria.',
        decisao_estrategica:
          'Matriz em Santa Catarina com incentivo fiscal de ICMS; decisão de ampliação dependente de margem por modalidade e exposição cambial.',
        diferenciação:
          'Domínio de classificação fiscal e regime aduaneiro; cliente médio não tem estrutura própria de comércio exterior.',
        horizonte_planejamento:
          'Orçamento anual; sem desdobramento formal de estratégia em projetos e metas por área.',
      },
    },
    {
      nome: 'financas',
      perguntas: {
        faturamento_mensal: '78.000.000',
        margem_ebitda:
          'Margem apertada por modalidade; câmbio drena margem em operações de conta e ordem.',
        controle_financeiro:
          'DRE condensada mensal; custo por operação não rateado entre clientes.',
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
    let rec = null
    try {
      rec = app.findRecordById('leads', 't8zia1qyovt9cof')
    } catch (eFind) {
      console.log('[E3A2-CLOSE6-B] lead Aurora t8zia1qyovt9cof não encontrada: ' + eFind.message)
      return
    }
    rec.set('dados_completos', DOSSIE_AURORA_FORMATO1)
    rec.set('status', 'teste')
    app.save(rec)
    console.log('[E3A2-CLOSE6-B] fixture FORMATO 1 gravada na lead Aurora t8zia1qyovt9cof')
  },
  (app) => {
    // down: nada a restaurar — o valor anterior era ∅ (vazio)
  },
)
