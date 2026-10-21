import pb from '@/lib/pocketbase/client'

export interface ConsultaBibliocompanionParams {
  pergunta: string
  camada?: '1_conceito' | '2_metodologia' | '3_socratico'
}

export interface ConsultaBibliocompanionResult {
  success: boolean
  pergunta: string
  resposta: string
  camada: string
  fronteira_consultoria_acionada: boolean
}

export interface HistoricoBibliocompanionRecord {
  id: string
  pergunta: string
  resposta: string
  camada: string
  barreira_consultoria_acionada: boolean
  created: string
}

/**
 * Consulta o Bibliocompanion (Bloco 5 Onda 2)
 * Fronteira Conceito x Consultoria estritamente preservada.
 */
export async function consultarBibliocompanion(
  params: ConsultaBibliocompanionParams,
): Promise<ConsultaBibliocompanionResult> {
  const token = pb.authStore.token
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL || ''
  const response = await fetch(`${baseUrl}/backend/v1/bibliocompanion/consultar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.error || `Erro na consulta ao Bibliocompanion: ${response.status}`)
  }

  return response.json()
}

/**
 * Busca histórico recente de consultas do usuário
 */
export async function getHistoricoBibliocompanion(
  userId: string,
  limit = 20,
): Promise<HistoricoBibliocompanionRecord[]> {
  try {
    const records = await pb.collection('bibliocompanion_consultas').getList(1, limit, {
      filter: `user = "${userId}"`,
      sort: '-created',
    })
    return records.items.map((item) => ({
      id: item.id,
      pergunta: item.pergunta,
      resposta: item.resposta,
      camada: item.camada,
      barreira_consultoria_acionada: item.barreira_consultoria_acionada,
      created: item.created,
    }))
  } catch (err) {
    console.error('Erro ao buscar histórico do Bibliocompanion:', err)
    return []
  }
}
