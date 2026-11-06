/// <reference path="../pb_data/types.d.ts" />

/**
 * ATUALIZAÇÃO DO PAPEL (ROLE) DO USUÁRIO — ETAPA E0 (Papel Consultor)
 *
 * Expande o campo select `role` da collection `users` de:
 *   admin | user
 * para:
 *   admin | consultor | cliente | user
 *
 * - "user" é mantido para retrocompatibilidade (usuários legados NÃO são migrados).
 * - "consultor": acesso às rotas operacionais (processar lead, reprocessar fase,
 *   atualizar respostas, comparador, liberação de download) e às páginas
 *   /projetos, /dashboard, /app — SEM acesso a /admin/*.
 * - "cliente": acesso somente-leitura ao próprio diagnóstico.
 * - Nenhuma alteração de dados de usuários existentes nesta migration.
 */

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('users')
    const roleField = collection.fields.getByName('role')
    if (!roleField) {
      throw new Error("Campo 'role' não encontrado na collection 'users'")
    }
    roleField.values = ['admin', 'consultor', 'cliente', 'user']
    app.save(collection)
  },
  (app) => {
    // Rollback: restaura os valores originais do select.
    // Só executa de fato se nenhum registro usar os papéis novos.
    const collection = app.findCollectionByNameOrId('users')
    const roleField = collection.fields.getByName('role')
    roleField.values = ['admin', 'user']
    try {
      app.save(collection)
    } catch (err) {
      // Presença de registros com 'consultor'/'cliente' impede o rollback — deixar como está.
      console.log('Rollback do enum role não aplicado: ' + (err && err.message))
    }
  },
)
