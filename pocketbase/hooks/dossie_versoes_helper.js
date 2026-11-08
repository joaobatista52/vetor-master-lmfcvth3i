/**
 * ETAPA E2 — HELPER DE VERSIONAMENTO DO DOSSIÊ (Decisão 4)
 *
 * Cria um snapshot do estado ANTERIOR de um dossiê em `dossies_versoes` antes
 * de uma mutação (atualização de respostas pelo consultor/admin, ou
 * sobrescrita pelo sync do site). A versão é numerada sequencialmente por
 * lead (v1, v2, v3...).
 *
 * Auto-contido: não referencia funções de outros arquivos (o JSVM executa
 * callbacks em pools de VMs separados).
 * ETAPA E2-B: `snapshot` opcional passa a permitir versionar fontes fora do
 * record leads (ex.: diagnostico.dados_entrada), mantendo o mecanismo único.
 */

/**
 * Cria (se houver mudança) um registro em dossies_versoes com o snapshot do
 * estado anterior. Retorna o número da versão criada, ou 0 quando nada mudou
 * (evita inflação do histórico — regra 4.2).
 *
 * @param {Object} $app    instância do app PocketBase
 * @param {Object} leadRec record da collection leads (já carregado)
 * @param {Object} novoEstado { respostas, dados_completos }
 * @param {Object} opts    { criadoPor: id|null, motivo: string, snapshot?: {respostas?, dados_completos?} }
 *                          `snapshot` opcional: quando informado, usa esses valores como
 *                          ESTADO ANTERIOR (fontes fora do record leads, ex. dados_entrada
 *                          do diagnóstico na atualização de respostas). Sem `snapshot`,
 *                          compara e captura o estado de leads.respostas / dados_completos.
 * @returns {number} versão criada (0 = nenhuma mudança)
 */
function versionarDossieAntesDeSobrescrever($app, leadRec, novoEstado, opts) {
  opts = opts || {}
  if (!leadRec || !leadRec.id) return 0

  var snapshotOpt = opts.snapshot || null
  var anteriorRespostas = snapshotOpt ? snapshotOpt.respostas : leadRec.get('respostas')
  var anteriorDados = snapshotOpt ? snapshotOpt.dados_completos : leadRec.get('dados_completos')

  var houveMudancaRespostas =
    JSON.stringify(anteriorRespostas === undefined ? null : anteriorRespostas) !==
    JSON.stringify(novoEstado && novoEstado.respostas !== undefined ? novoEstado.respostas : null)
  var houveMudancaDados =
    JSON.stringify(anteriorDados === undefined ? null : anteriorDados) !==
    JSON.stringify(
      novoEstado && novoEstado.dados_completos !== undefined ? novoEstado.dados_completos : null,
    )

  if (!houveMudancaRespostas && !houveMudancaDados) {
    return 0 // sem mudança => NÃO cria versão
  }

  // Snapshot do ESTADO ANTERIOR
  var snapshot = {}
  if (anteriorRespostas !== null && anteriorRespostas !== undefined) {
    snapshot.respostas = anteriorRespostas
  }
  if (anteriorDados !== null && anteriorDados !== undefined) {
    snapshot.dados_completos = anteriorDados
  }

  // Descobrir a próxima versão sequencial por lead
  var ultima = null
  try {
    ultima = $app.findFirstRecordByFilter(
      'dossies_versoes',
      'lead = {:lead}',
      { lead: leadRec.id },
      '-versao',
    )
  } catch (_) {}
  var proximaVersao = ultima ? Number(ultima.getInt('versao') || 0) + 1 : 1

  var col = $app.findCollectionByNameOrId('dossies_versoes')
  var reg = new Record(col)
  reg.set('lead', leadRec.id)
  reg.set('versao', proximaVersao)
  reg.set('dados_entrada', snapshot)
  reg.set('motivo', opts.motivo || '')
  if (opts.criadoPor) {
    reg.set('criado_por', opts.criadoPor)
  }
  $app.save(reg)

  return proximaVersao
}
