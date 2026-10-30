import pb from '@/lib/pocketbase/client'

export interface ResultadoChave {
  descricao: string
  progresso: number
}

export interface OKR {
  id: string
  user: string
  objetivo: string
  resultados_chave: ResultadoChave[]
  progresso: number
  etapa?: number
  fase_origem?: number
  curadoria_vinculada?: string
  created: string
  updated: string
}

export const getOKRs = async (): Promise<OKR[]> => {
  const records = await pb.collection('okrs').getFullList({ sort: '-created' })
  return records.map((r: any) => ({
    id: r.id,
    user: r.user,
    objetivo: r.objetivo || '',
    resultados_chave: Array.isArray(r.resultados_chave) ? r.resultados_chave : [],
    progresso: r.progresso || 0,
    etapa: r.etapa || undefined,
    fase_origem:
      typeof r.fase_origem === 'number'
        ? r.fase_origem
        : r.fase_origem
          ? Number(r.fase_origem)
          : undefined,
    curadoria_vinculada: r.curadoria_vinculada || undefined,
    created: r.created,
    updated: r.updated,
  })) as OKR[]
}

export const createOKR = async (data: {
  user: string
  objetivo: string
  resultados_chave?: ResultadoChave[]
  progresso?: number
  etapa?: number
  fase_origem?: number
  curadoria_vinculada?: string
}): Promise<OKR> => {
  const r: any = await pb.collection('okrs').create(data)
  return {
    id: r.id,
    user: r.user,
    objetivo: r.objetivo,
    resultados_chave: r.resultados_chave || [],
    progresso: r.progresso || 0,
    etapa: r.etapa || undefined,
    fase_origem:
      typeof r.fase_origem === 'number'
        ? r.fase_origem
        : r.fase_origem
          ? Number(r.fase_origem)
          : undefined,
    curadoria_vinculada: r.curadoria_vinculada || undefined,
    created: r.created,
    updated: r.updated,
  } as OKR
}

export const updateOKR = async (id: string, data: Partial<OKR>): Promise<OKR> => {
  const r: any = await pb.collection('okrs').update(id, data)
  return {
    id: r.id,
    user: r.user,
    objetivo: r.objetivo,
    resultados_chave: r.resultados_chave || [],
    progresso: r.progresso || 0,
    etapa: r.etapa || undefined,
    fase_origem:
      typeof r.fase_origem === 'number'
        ? r.fase_origem
        : r.fase_origem
          ? Number(r.fase_origem)
          : undefined,
    curadoria_vinculada: r.curadoria_vinculada || undefined,
    created: r.created,
    updated: r.updated,
  } as OKR
}

export const deleteOKR = async (id: string): Promise<void> => {
  await pb.collection('okrs').delete(id)
}
