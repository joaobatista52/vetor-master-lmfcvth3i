/// <reference path="../pb_data/types.d.ts" />

/**
 * MATRIZ DE PERMISSÕES — ETAPA E0 (Papel Consultor) — VETOR MASTER CaaS
 *
 * Helper centralizado de autorização para as rotas operacionais do backend.
 * Espelho frontend: src/lib/permissoes.ts (mesma matriz, para rotas/páginas).
 *
 * PAPÉIS (users.role): admin | consultor | cliente | user
 * AÇÕES E0: processar_lead, reprocessar_fase, atualizar_respostas, comparar,
 *           liberar_download, baixar, configurar_download, ingestar_pacote (E2).
 * RECURSOS E0: lead, diagnostico, pacote, relatorio, tabela, demonstrativo, fase.
 *
 * PADRÃO DE CARREGAMENTO (JSVM): este arquivo é um módulo CommonJS. Os hooks
 * que o usam carregam com require(`${__hooks}/permissao.js`) DENTRO do callback
 * (handlers rodam em contexto isolado — símbolos de topo não são visíveis).
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
 * @param {Object|null} authUser - usuário autenticado (e.auth)
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
 * resposta não-nulo significa que a rota DEVE retorná-lo imediatamente.
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

module.exports = {
  PAPEIS,
  MATRIZ_ACOES,
  RECURSOS,
  extrairPapel,
  verificarPermissao,
  exigirPermissao,
}
