/**
 * MATRIZ DE PERMISSÕES — ETAPA E0 (Papel Consultor) — VETOR MASTER CaaS
 * Espelho frontend de pocketbase/hooks/permissao.js (mesma matriz).
 *
 * PAPÉIS (users.role):
 * - admin:     acesso total, incluindo /admin/*.
 * - consultor: acesso às rotas operacionais (processar lead, reprocessar fase,
 *              atualizar respostas, comparador, liberação de download) e às páginas
 *              /projetos, /dashboard, /app. NÃO acessa /admin/* e NÃO configura download.
 * - cliente:   acesso somente-leitura ao próprio diagnóstico (ação "baixar" apenas
 *              do próprio recurso — a posse é validada onde o recurso é conhecido).
 * - user:      papel legado, mantido como está (nenhuma das ações novas).
 *
 * As lógicas de E4–E8 (devolutiva, comparação, download, Fase Fundador) NÃO
 * estão implementadas aqui — apenas a base de verificação desta matriz.
 */

export const PAPEIS = {
  ADMIN: 'admin',
  CONSULTOR: 'consultor',
  CLIENTE: 'cliente',
  USER: 'user',
} as const

export type Papel = (typeof PAPEIS)[keyof typeof PAPEIS]

/** Papéis que acessam as páginas operacionais (/app, /dashboard, /projetos). */
export const PAPEIS_PAGINAS_OPERACIONAIS: readonly string[] = ['admin', 'consultor', 'user']

export interface ResultadoPermissao {
  permitido: boolean
  motivo: string
}

/** Matriz papel → ações permitidas (idêntica ao backend). */
const MATRIZ_ACOES: Record<string, readonly string[]> = {
  admin: [
    'processar_lead',
    'reprocessar_fase',
    'atualizar_respostas',
    'comparar',
    'liberar_download',
    'baixar',
    'configurar_download',
  ],
  consultor: [
    'processar_lead',
    'reprocessar_fase',
    'atualizar_respostas',
    'comparar',
    'liberar_download',
  ],
  cliente: ['baixar'],
  user: [], // papel legado: nada das ações novas
}

const RECURSOS: readonly string[] = [
  'lead',
  'diagnostico',
  'pacote',
  'relatorio',
  'tabela',
  'demonstrativo',
  'fase',
]

/** Papel de um usuário (objeto com campo role) em minúsculas. */
export function extrairPapel(user: { role?: string | null } | null | undefined): string {
  return user?.role ? String(user.role).toLowerCase() : ''
}

/**
 * Verificação centralizada de permissão da matriz E0 (espelho do backend).
 * @param user - usuário autenticado (useAuth().user) — não aceito objeto fabricado
 * @param acao - uma das ações previstas (ex.: 'processar_lead')
 * @param recurso - um dos recursos previstos (ex.: 'lead')
 */
export function verificarPermissao(
  user: { role?: string | null } | null | undefined,
  acao: string,
  recurso: string,
): ResultadoPermissao {
  const papel = extrairPapel(user)

  if (!user || !papel) {
    return { permitido: false, motivo: 'Usuário não autenticado.' }
  }

  if (!RECURSOS.includes(recurso)) {
    return { permitido: false, motivo: `Recurso desconhecido: '${recurso}'.` }
  }

  const acoesDoPapel = MATRIZ_ACOES[papel]
  if (!acoesDoPapel) {
    return { permitido: false, motivo: `Papel desconhecido: '${papel}'.` }
  }

  if (!acoesDoPapel.includes(acao)) {
    if (papel === 'user') {
      return {
        permitido: false,
        motivo: `Usuários do papel legado "user" não possuem permissão para a ação "${acao}".`,
      }
    }
    if (papel === 'cliente') {
      return {
        permitido: false,
        motivo: 'O papel "cliente" possui acesso somente-leitura ao próprio diagnóstico.',
      }
    }
    return {
      permitido: false,
      motivo: `O papel '${papel}' não possui permissão para a ação '${acao}'.`,
    }
  }

  return { permitido: true, motivo: `Permitido ao papel '${papel}'.` }
}

/** Ação "baixar" do cliente: restrita ao próprio recurso (somente-leitura). */
export function podeBaixarProprioDiagnostico(
  user: { id?: string | null; role?: string | null } | null | undefined,
  recursoComDono: { consultor_id?: string | null; user_id?: string | null } | null | undefined,
): boolean {
  const papel = extrairPapel(user)
  if (papel === 'admin' || papel === 'consultor') return true
  if (papel === 'cliente') {
    return !!(
      user?.id &&
      recursoComDono &&
      (recursoComDono.consultor_id === user.id || recursoComDono.user_id === user.id)
    )
  }
  return false
}
