/// <reference path="../pb_data/types.d.ts" />

/**
 * ETAPA E2 — FUNDAÇÃO DE INGESTÃO DO PACOTE V2.0 E VERSIONAMENTO DO DOSSIÊ
 *
 * Cria 7 collections:
 *   pacotes_v2, objetivos_estrategicos, projetos, planos_acao_v2, okrs_v2,
 *   matriz_hoshin, dossies_versoes.
 *
 * - planos_acao (legado Beatek) e okrs (legado) NÃO são tocados.
 * - Todas com schema_versao (text, default "2.0") e created/updated padrão.
 * - dossies_versoes tem índice único composto (lead, versao).
 * - Acesso interno (Admin/Consultor): regras somente leitura/escrita para admin;
 *   a escrita real acontece por hooks server-side (superuser), as rotas
 *   /pacote-v2/* validam papel admin|consultor via helper de permissão (E0).
 */

const SCHEMA_VERSAO_FIELD = { name: 'schema_versao', type: 'text' }
const AUTODATES = [
  { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
  { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
]
const REL_USERS = { name: 'importado_por', type: 'relation', collectionId: '_pb_users_auth_' }

const ADMIN_ONLY_RULES = {
  listRule: "@request.auth.role = 'admin' || @request.auth.role = 'consultor'",
  viewRule: "@request.auth.role = 'admin' || @request.auth.role = 'consultor'",
  createRule: null, // somente superuser/hooks (rotas /pacote-v2/*)
  updateRule: null,
  deleteRule: "@request.auth.role = 'admin'",
}

const DOSSIE_VERSOES_RULES = {
  listRule: "@request.auth.role = 'admin' || @request.auth.role = 'consultor'",
  viewRule: "@request.auth.role = 'admin' || @request.auth.role = 'consultor'",
  createRule: null, // somente superuser/hooks (versionamento server-side)
  updateRule: null,
  deleteRule: "@request.auth.role = 'admin'",
}

const relLead = (required) => ({
  name: 'lead',
  type: 'relation',
  collectionId: 'leads',
  required: !!required,
})
const relDiag = (required) => ({
  name: 'diagnostico',
  type: 'relation',
  collectionId: 'diagnosticos',
  required: !!required,
})

const jsonField = (name) => ({ name, type: 'json' })
const textField = (name, extra) => Object.assign({ name, type: 'text' }, extra || {})

migrate(
  (app) => {
    const colsById = {}
    try {
      colsById.leads = app.findCollectionByNameOrId('leads').id
    } catch (_) {}
    try {
      colsById.diagnosticos = app.findCollectionByNameOrId('diagnosticos').id
    } catch (_) {}

    const criarSeNaoExiste = (col) => {
      try {
        app.findCollectionByNameOrId(col.name)
        return false // já existe — idempotente
      } catch (_) {
        app.save(col)
        return true
      }
    }

    // ------------------------------------------------------------------
    // 1. pacotes_v2
    // ------------------------------------------------------------------
    criarSeNaoExiste(
      new Collection({
        name: 'pacotes_v2',
        type: 'base',
        fields: [
          SCHEMA_VERSAO_FIELD,
          textField('parte'),
          textField('execucao_id'),
          textField('dossie_id'),
          jsonField('payload'),
          textField('status_validacao'),
          jsonField('erros_validacao'),
          { name: 'lead', type: 'relation', collectionId: colsById.leads || 'leads', maxSelect: 1 },
          {
            name: 'diagnostico',
            type: 'relation',
            collectionId: colsById.diagnosticos || 'diagnosticos',
            maxSelect: 1,
          },
          REL_USERS,
          { name: 'importado_em', type: 'date' },
          ...AUTODATES,
        ],
        indexes: ['CREATE INDEX idx_pacotes_v2_lead ON pacotes_v2 (lead)'],
        ...ADMIN_ONLY_RULES,
      }),
    )

    // ------------------------------------------------------------------
    // 2. objetivos_estrategicos
    // ------------------------------------------------------------------
    criarSeNaoExiste(
      new Collection({
        name: 'objetivos_estrategicos',
        type: 'base',
        fields: [
          SCHEMA_VERSAO_FIELD,
          textField('objetivo_id'),
          textField('perspectiva_bsc'),
          textField('descricao'),
          textField('ancora'),
          jsonField('indicadores'),
          {
            name: 'pacote',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('pacotes_v2').id,
            maxSelect: 1,
          },
          textField('dossie_id'),
          ...AUTODATES,
        ],
        indexes: [],
        ...ADMIN_ONLY_RULES,
      }),
    )

    // ------------------------------------------------------------------
    // 3. projetos
    // ------------------------------------------------------------------
    criarSeNaoExiste(
      new Collection({
        name: 'projetos',
        type: 'base',
        fields: [
          SCHEMA_VERSAO_FIELD,
          textField('projeto_id'),
          textField('objetivo_estrategico_id'),
          textField('projeto_nome'),
          textField('sponsor'),
          textField('escopo'),
          textField('objetivos'),
          jsonField('melhorias_esperadas'),
          textField('aplicacao_abrangencia'),
          jsonField('planos_acao_ids'),
          jsonField('fundamentacao'),
          textField('benchmark_setorial'),
          textField('prazo'),
          textField('criterio_aceite'),
          { name: 'status', type: 'text' },
          {
            name: 'pacote',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('pacotes_v2').id,
            maxSelect: 1,
          },
          textField('dossie_id'),
          ...AUTODATES,
        ],
        indexes: [],
        ...ADMIN_ONLY_RULES,
      }),
    )

    // ------------------------------------------------------------------
    // 4. planos_acao_v2 (novo — NÃO é o planos_acao legado Beatek)
    // ------------------------------------------------------------------
    criarSeNaoExiste(
      new Collection({
        name: 'planos_acao_v2',
        type: 'base',
        fields: [
          SCHEMA_VERSAO_FIELD,
          textField('plano_id'),
          textField('projeto_id'),
          textField('objetivo_estrategico_id'),
          textField('plano_nome'),
          textField('sponsor'),
          textField('escopo'),
          textField('objetivos'),
          jsonField('melhorias_esperadas'),
          textField('aplicacao_abrangencia'),
          jsonField('etapas'),
          jsonField('fundamentacao'),
          {
            name: 'pacote',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('pacotes_v2').id,
            maxSelect: 1,
          },
          textField('dossie_id'),
          ...AUTODATES,
        ],
        indexes: [],
        ...ADMIN_ONLY_RULES,
      }),
    )

    // ------------------------------------------------------------------
    // 5. okrs_v2 (novo — NÃO é o okrs legado)
    // ------------------------------------------------------------------
    criarSeNaoExiste(
      new Collection({
        name: 'okrs_v2',
        type: 'base',
        fields: [
          SCHEMA_VERSAO_FIELD,
          textField('okr_id'),
          textField('objetivo_estrategico_id'),
          textField('projeto_id'),
          textField('plano_id'),
          textField('objetivo'),
          jsonField('key_results'),
          textField('prazo'),
          {
            name: 'pacote',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('pacotes_v2').id,
            maxSelect: 1,
          },
          textField('dossie_id'),
          ...AUTODATES,
        ],
        indexes: [],
        ...ADMIN_ONLY_RULES,
      }),
    )

    // ------------------------------------------------------------------
    // 6. matriz_hoshin
    // ------------------------------------------------------------------
    criarSeNaoExiste(
      new Collection({
        name: 'matriz_hoshin',
        type: 'base',
        fields: [
          SCHEMA_VERSAO_FIELD,
          textField('objetivo_estrategico_id'),
          textField('area'),
          textField('meta'),
          textField('responsavel'),
          textField('prazo'),
          {
            name: 'pacote',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('pacotes_v2').id,
            maxSelect: 1,
          },
          textField('dossie_id'),
          ...AUTODATES,
        ],
        indexes: [],
        ...ADMIN_ONLY_RULES,
      }),
    )

    // ------------------------------------------------------------------
    // 7. dossies_versoes (Decisão 4)
    // ------------------------------------------------------------------
    criarSeNaoExiste(
      new Collection({
        name: 'dossies_versoes',
        type: 'base',
        fields: [
          {
            name: 'lead',
            type: 'relation',
            collectionId: colsById.leads || 'leads',
            maxSelect: 1,
            required: true,
          },
          { name: 'versao', type: 'number' },
          jsonField('dados_entrada'),
          textField('motivo'),
          {
            name: 'criado_por',
            type: 'relation',
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_dossies_versoes_lead_versao ON dossies_versoes (lead, versao)',
        ],
        ...DOSSIE_VERSOES_RULES,
      }),
    )
  },
  (app) => {
    // Rollback: remove somente as collections criadas por esta migration
    const nomes = [
      'dossies_versoes',
      'matriz_hoshin',
      'okrs_v2',
      'planos_acao_v2',
      'projetos',
      'objetivos_estrategicos',
      'pacotes_v2',
    ]
    for (const nome of nomes) {
      try {
        const col = app.findCollectionByNameOrId(nome)
        app.delete(col)
      } catch (_) {}
    }
  },
)
