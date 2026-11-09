/// <reference path="../pb_data/types.d.ts" />

/**
 * E2-D — CORREÇÃO DE CONFLITO DE NAMESPACE: projetos (legado) × projetos (V2)
 *
 * Decisão do usuário: a collection criada na E2 (migration 0102) com o nome
 * "projetos" conflita com o namespace legado. Ela passa a se chamar
 * "projetos_v2", seguindo a convenção de planos_acao_v2 e okrs_v2.
 *
 * Comportamento (idempotente, seguro em BD vazio e em BD onde "projetos" seja
 * a LEGADA Beatek):
 *  1. Cria "projetos_v2" com o MESMO schema da "projetos" da E2 (0102),
 *     incluindo o índice único em projeto_id (PRJ-01..PRJ-06) e as regras
 *     admin + consultor.
 *  2. Se existir uma collection "projetos" MARCADA como V2 (possui o campo
 *     schema_versao — marcador exclusivo da E2):
 *       - copia os registros dela (schema_versao = "2.0") para projetos_v2;
 *       - REMOVE a collection "projetos" da E2.
 *     Se "projetos" NÃO tiver o marcador (legada Beatek), ela permanece
 *     INTOCADA — nada é copiado nem removido dela.
 *  3. Nunca altera planos_acao, okrs ou qualquer collection legada.
 */

const SCHEMA_VERSAO_FIELD = { name: 'schema_versao', type: 'text' }
const AUTODATES = [
  { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
  { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
]

const ADMIN_ONLY_RULES = {
  listRule: "@request.auth.role = 'admin' || @request.auth.role = 'consultor'",
  viewRule: "@request.auth.role = 'admin' || @request.auth.role = 'consultor'",
  createRule: null, // somente superuser/hooks (rotas /pacote-v2/*)
  updateRule: null,
  deleteRule: "@request.auth.role = 'admin'",
}

const jsonField = (name) => ({ name, type: 'json' })
const textField = (name) => ({ name, type: 'text' })

// Campos copiados na migração de dados (created/updated são autodate e id é do PocketBase)
const CAMPOS_PROJETO = [
  'schema_versao',
  'projeto_id',
  'objetivo_estrategico_id',
  'projeto_nome',
  'sponsor',
  'escopo',
  'objetivos',
  'melhorias_esperadas',
  'aplicacao_abrangencia',
  'planos_acao_ids',
  'fundamentacao',
  'benchmark_setorial',
  'prazo',
  'criterio_aceite',
  'status',
  'pacote',
  'dossie_id',
]

const camposColecaoProjetosV2 = (idPacotesV2) => [
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
  textField('status'),
  {
    name: 'pacote',
    type: 'relation',
    collectionId: idPacotesV2,
    maxSelect: 1,
  },
  textField('dossie_id'),
  ...AUTODATES,
]

// Índices equivalentes aos criados pela 0103 sobre "projetos", agora em projetos_v2
const INDICES_PROJETOS_V2 = [
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_projetos_v2_projeto_id ON projetos_v2 (projeto_id)',
  'CREATE INDEX IF NOT EXISTS idx_projetos_v2_dossie ON projetos_v2 (dossie_id)',
  'CREATE INDEX IF NOT EXISTS idx_projetos_v2_oe ON projetos_v2 (objetivo_estrategico_id)',
]

function colecaoEhDaE2(app, nome) {
  try {
    const col = app.findCollectionByNameOrId(nome)
    try {
      col.fields.getByName('schema_versao')
      return true // marcador da E2 (schema V2)
    } catch (_) {
      return false // sem schema_versao → legada (Beatek), intocada
    }
  } catch (_) {
    return false // não existe
  }
}

function copiarRegistros(app, de, para, filtro) {
  let registros = []
  try {
    registros = app.findRecordsByFilter(de, filtro, '-created', 10000, 0)
  } catch (err) {
    console.log('[E2-D] Sem registros a copiar de ' + de + ': ' + (err && err.message))
    return 0
  }
  let copiados = 0
  for (const rec of registros) {
    if (String(rec.get('schema_versao') || '') !== '2.0') continue // só registros V2
    try {
      const novo = new Record(para)
      for (const campo of CAMPOS_PROJETO) {
        const valor = rec.get(campo)
        if (valor !== undefined) novo.set(campo, valor)
      }
      app.save(novo)
      copiados++
    } catch (err) {
      console.log(
        '[E2-D] Registro ' +
          rec.id +
          ' (' +
          rec.get('projeto_id') +
          ') não migrado: ' +
          (err && err.message),
      )
    }
  }
  return copiados
}

migrate(
  (app) => {
    // 1. Cria projetos_v2 com o schema completo (idempotente)
    let projetosV2
    try {
      projetosV2 = app.findCollectionByNameOrId('projetos_v2')
      console.log('[E2-D] projetos_v2 já existe — nada a criar.')
    } catch (_) {
      const idPacotesV2 = app.findCollectionByNameOrId('pacotes_v2').id
      projetosV2 = new Collection({
        name: 'projetos_v2',
        type: 'base',
        fields: camposColecaoProjetosV2(idPacotesV2),
        indexes: [],
        ...ADMIN_ONLY_RULES,
      })
      app.save(projetosV2)
      console.log('[E2-D] Collection projetos_v2 criada.')
    }

    // 2. Índices (DDL direto — declarados no construtor podem não persistir, cf. 0103)
    for (const ddl of INDICES_PROJETOS_V2) {
      try {
        app.db().newQuery(ddl).execute()
      } catch (err) {
        console.log('[E2-D] Índice já existente/ignorado: ' + (err && err.message))
      }
    }

    // 3. Migra dados e remove a "projetos" da E2 — SOMENTE se ela for a da E2
    if (colecaoEhDaE2(app, 'projetos')) {
      const migrados = copiarRegistros(app, 'projetos', projetosV2, 'schema_versao = "2.0"')
      console.log('[E2-D] Registros migrados de projetos → projetos_v2: ' + migrados)
      try {
        app.delete(app.findCollectionByNameOrId('projetos'))
        console.log('[E2-D] Collection projetos (E2) removida — namespace legado livre.')
      } catch (err) {
        console.log('[E2-D] Falha ao remover projetos (E2): ' + (err && err.message))
      }
    } else {
      console.log(
        '[E2-D] Collection projetos é a LEGADA (Beatek) ou não existe — permanece intocada.',
      )
    }
  },
  (app) => {
    // Rollback: recria "projetos" (schema E2), copia de volta os registros V2 e remove projetos_v2
    try {
      const idPacotesV2 = app.findCollectionByNameOrId('pacotes_v2').id
      let colProjetos
      try {
        colProjetos = app.findCollectionByNameOrId('projetos')
      } catch (_) {
        colProjetos = new Collection({
          name: 'projetos',
          type: 'base',
          fields: camposColecaoProjetosV2(idPacotesV2),
          indexes: [],
          ...ADMIN_ONLY_RULES,
        })
        app.save(colProjetos)
      }
      const copiados = copiarRegistros(app, 'projetos_v2', colProjetos, 'schema_versao = "2.0"')
      console.log('[E2-D] Rollback: ' + copiados + ' registros devolvidos a projetos.')
      try {
        app.delete(app.findCollectionByNameOrId('projetos_v2'))
      } catch (_) {}
    } catch (err) {
      console.log('[E2-D] Rollback incompleto: ' + (err && err.message))
    }
  },
)
