/// <reference path="../pb_data/types.d.ts" />

/**
 * ETAPA E2 — CORRETIVO DE ÍNDICES
 *
 * A migration 0102 criou as 7 collections, mas alguns índices declarados no
 * construtor `Collection` não foram persistidos pelo PocketBase. Esta migration
 * garante os índices de forma idempotente (cria somente se não existir).
 */

const INDICES = [
  'CREATE INDEX IF NOT EXISTS idx_pacotes_v2_dossie ON pacotes_v2 (dossie_id)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_objetivos_estrategicos_objetivo_id ON objetivos_estrategicos (objetivo_id)',
  'CREATE INDEX IF NOT EXISTS idx_objetivos_estrategicos_dossie ON objetivos_estrategicos (dossie_id)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_projetos_projeto_id ON projetos (projeto_id)',
  'CREATE INDEX IF NOT EXISTS idx_projetos_dossie ON projetos (dossie_id)',
  'CREATE INDEX IF NOT EXISTS idx_projetos_oe ON projetos (objetivo_estrategico_id)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_planos_acao_v2_plano_id ON planos_acao_v2 (plano_id)',
  'CREATE INDEX IF NOT EXISTS idx_planos_acao_v2_projeto ON planos_acao_v2 (projeto_id)',
  'CREATE INDEX IF NOT EXISTS idx_planos_acao_v2_dossie ON planos_acao_v2 (dossie_id)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_okrs_v2_okr_id ON okrs_v2 (okr_id)',
  'CREATE INDEX IF NOT EXISTS idx_okrs_v2_projeto ON okrs_v2 (projeto_id)',
  'CREATE INDEX IF NOT EXISTS idx_okrs_v2_dossie ON okrs_v2 (dossie_id)',
  'CREATE INDEX IF NOT EXISTS idx_matriz_hoshin_oe ON matriz_hoshin (objetivo_estrategico_id)',
  'CREATE INDEX IF NOT EXISTS idx_matriz_hoshin_dossie ON matriz_hoshin (dossie_id)',
]

migrate(
  (app) => {
    for (const ddl of INDICES) {
      try {
        app.db().newQuery(ddl).execute()
      } catch (err) {
        // Idempotente: índice já existente não deve bloquear o apply
        console.log('Índice já existente/ignorado: ' + (err && err.message))
      }
    }
  },
  (app) => {
    // Rollback: remove os índices criados (best-effort)
    const drops = INDICES.map((ddl) => {
      const m = ddl.match(/INDEX (IF NOT EXISTS )?(\w+) ON/)
      return m ? 'DROP INDEX IF EXISTS ' + m[2] : null
    }).filter(Boolean)
    for (const ddl of drops) {
      try {
        app.db().newQuery(ddl).execute()
      } catch (_) {}
    }
  },
)
