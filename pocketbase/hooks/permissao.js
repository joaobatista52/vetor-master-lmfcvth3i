/// <reference path="../pb_data/types.d.ts" />

/**
 * MATRIZ DE PERMISSÕES — ETAPA E0 (Papel Consultor) — VETOR MASTER CaaS
 *
 * Helper centralizado de autorização para as rotas operacionais do backend.
 * Espelho frontend: src/lib/permissoes.ts (mesma matriz, para rotas/páginas).
 *
 * PAPÉIS (users.role):
 * - admin:     acesso total, incluindo /admin/*.
 * - consultor: acesso às rotas operacionais (processar, reprocessar, atualizar
 *              respostas, comparador, liberação de download) e às páginas
 *              /projetos, /dashboard, /app. NÃO acessa /admin/* e NÃO configura download.
 * - cliente:   acesso somente-leitura ao próprio diagnóstico (ação "baixar" apenas
 *              do próprio recurso — validação de posse feita pela rota).
 * - user:      papel legado, mantido como está (nenhuma das ações novas).
 *
 * AÇÕES E0: processar_lead, reprocessar_fase, atualizar_respostas, comparar,
 *           liberar_download, baixar, configurar_download, ingestar_pacote (E2).
 * RECURSOS E0: lead, diagnostico, pacote, relatorio, tabela, demonstrativo, fase.
 *
 * As lógicas de E4–E8 (devolutiva, comparação, download, Fase Fundador) NÃO
 * estão implementadas aqui — apenas a base de verificação desta matriz.
 */

var PAPEIS = {
  ADMIN: 'admin',
  CONSULTOR: 'consultor',
  CLIENTE: 'cliente',
  USER: 'user',
}

// Matriz papel → ações permitidas (independente de recurso na E0;
// "baixar" do cliente é restringido ao próprio recurso pela rota chamadora).
var MATRIZ_ACOES = {
  admin: [
    'processar_lead',
    'reprocessar_fase',
    'atualizar_respostas',
    'comparar',
    'liberar_download',
    'baixar',
    'configurar_download',
    'ingestar_pacote',
  ],
  consultor: [
    'processar_lead',
    'reprocessar_fase',
    'atualizar_respostas',
    'comparar',
    'liberar_download',
    'ingestar_pacote',
  ],
  cliente: ['baixar'],
  user: [], // papel legado: nada das ações novas
}

var RECURSOS = ['lead', 'diagnostico', 'pacote', 'relatorio', 'tabela', 'demonstrativo', 'fase']

/**
 * Extrai o papel do usuário autenticado de forma tolerante (PocketBase JSVM):
 * aceita registro completo (authUser.role) ou modelo dinâmico (getString('role')).
 * @param {Object|null} authUser - usuário autenticado (e.auth)
 * @returns {string} papel em minúsculas ('' quando não identificado)
 */
function extrairPapel(authUser) {
  if (!authUser) return ''
  try {
    if (typeof authUser.getString === 'function') {
      const papel = String(authUser.getString('role') || '').toLowerCase()
      if (papel) return papel
    }
    if (authUser.role) return String(authUser.role).toLowerCase()
  } catch (_) {}
  return ''
}

/**
 * Verificação centralizada de permissão da matriz E0.
 * @param {Object|null} authUser - usuário autenticado (e.auth) — NÃO aceita objeto fabricado
 * @param {string} acao - uma das ações previstas (ex.: 'processar_lead')
 * @param {string} recurso - um dos recursos previstos (ex.: 'lead')
 * @returns {{ permitido: boolean, motivo: string }}
 */
function verificarPermissao(authUser, acao, recurso) {
  const papel = extrairPapel(authUser)

  if (!authUser || !papel) {
    return { permitido: false, motivo: 'Usuário não autenticado.' }
  }

  if (RECURSOS.indexOf(recurso) === -1) {
    return { permitido: false, motivo: "Recurso desconhecido: '" + recurso + "'." }
  }

  const acoesDoPapel = MATRIZ_ACOES[papel]
  if (!acoesDoPapel) {
    return { permitido: false, motivo: "Papel desconhecido: '" + papel + "'." }
  }

  if (acoesDoPapel.indexOf(acao) === -1) {
    if (papel === 'user') {
      return {
        permitido: false,
        motivo: 'Usuários do papel legado "user" não possuem permissão para a ação "' + acao + '".',
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
      motivo: "O papel '" + papel + "' não possui permissão para a ação '" + acao + "'.",
    }
  }

  return { permitido: true, motivo: "Permitido ao papel '" + papel + "'." }
}

/**
 * Gate de rota: extrai o usuário autenticado, verifica a permissão e, quando
 * negada, responde 403 em pt-BR. Retorna o papel extraído para uso da rota.
 * @param {Object} e - contexto da requisição (routerAdd)
 * @param {string} acao - ação exigida
 * @param {string} recurso - recurso exigido
 * @returns {{ permitido: boolean, papel: string, resposta: Object|null }}
 *          resposta não-nulo significa que a rota DEVE retorná-lo imediatamente.
 */
function exigirPermissao(e, acao, recurso) {
  let authUser = null
  try {
    authUser = e.auth || (e.requestInfo && e.requestInfo().auth)
  } catch (_) {
    authUser = null
  }

  const resultado = verificarPermissao(authUser, acao, recurso)
  if (!resultado.permitido) {
    return {
      permitido: false,
      papel: extrairPapel(authUser),
      resposta: e.json(403, { sucesso: false, erro: 'NAO_AUTORIZADO', motivo: resultado.motivo }),
    }
  }
  return { permitido: true, papel: extrairPapel(authUser), resposta: null }
}
