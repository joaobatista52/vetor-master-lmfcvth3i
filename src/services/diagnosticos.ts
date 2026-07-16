import pb from '@/lib/pocketbase/client'

export interface Diagnostico {
  id: string
  user: string
  dados_entrada: Record<string, any>
  relatorio_gerado: string
  created: string
  updated: string
}

export const getDiagnosticos = async (): Promise<Diagnostico[]> => {
  const records = await pb.collection('diagnosticos').getFullList({ sort: '-created' })
  return records.map((r: any) => ({
    id: r.id,
    user: r.user,
    dados_entrada: r.dados_entrada || {},
    relatorio_gerado: r.relatorio_gerado || '',
    created: r.created,
    updated: r.updated,
  })) as Diagnostico[]
}

export const createDiagnostico = async (data: {
  user: string
  dados_entrada?: Record<string, any>
  relatorio_gerado?: string
}): Promise<Diagnostico> => {
  const r: any = await pb.collection('diagnosticos').create(data)
  return {
    id: r.id,
    user: r.user,
    dados_entrada: r.dados_entrada || {},
    relatorio_gerado: r.relatorio_gerado || '',
    created: r.created,
    updated: r.updated,
  } as Diagnostico
}

export const updateDiagnostico = async (
  id: string,
  data: Partial<Diagnostico>,
): Promise<Diagnostico> => {
  const r: any = await pb.collection('diagnosticos').update(id, data)
  return {
    id: r.id,
    user: r.user,
    dados_entrada: r.dados_entrada || {},
    relatorio_gerado: r.relatorio_gerado || '',
    created: r.created,
    updated: r.updated,
  } as Diagnostico
}

export const deleteDiagnostico = async (id: string): Promise<void> => {
  await pb.collection('diagnosticos').delete(id)
}
