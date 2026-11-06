/**
 * PAPÉIS DE USUÁRIO — ETAPA E0 (Papel Consultor) — VETOR MASTER CaaS
 *
 * Diferenças entre os papéis (definição do usuário):
 * - admin:     acesso total, incluindo /admin/*.
 * - consultor: acesso às rotas operacionais (processar lead, reprocessar fase,
 *              atualizar respostas, comparador, liberação de download) e às páginas
 *              /projetos, /dashboard, /app. NÃO acessa /admin/*.
 * - cliente:   acesso somente-leitura ao próprio diagnóstico.
 * - user:      papel legado, mantido como está (não quebrar usuários existentes).
 */

/** Papéis que acessam as páginas operacionais do portal (/app, /dashboard, /projetos). */
export const PAPEIS_PORTAL: readonly string[] = ['admin', 'consultor', 'user']

export function papelEhAdmin(role: string | null | undefined): boolean {
  return role === 'admin'
}

export function papelEhConsultor(role: string | null | undefined): boolean {
  return role === 'consultor'
}

/** admin OU consultor: gate usado nas rotas operacionais (E0: /app, /dashboard, /projetos). */
export function papelEhOperacional(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'consultor' || role === 'user'
}
