import pb from '@/lib/pocketbase/client'

export interface MapeamentoDor {
  id: string
  descricao_dor: string
  framework: string
  livros_referencia: string[]
  created: string
  updated: string
}

export const getDores = async (): Promise<MapeamentoDor[]> => {
  const records = await pb.collection('mapeamento_dores').getFullList({ sort: '-created' })
  return records.map((r: any) => ({
    id: r.id,
    descricao_dor: r.descricao_dor || '',
    framework: r.framework || '',
    livros_referencia: Array.isArray(r.livros_referencia) ? r.livros_referencia : [],
    created: r.created,
    updated: r.updated,
  })) as MapeamentoDor[]
}

export const getDor = async (id: string): Promise<MapeamentoDor> => {
  const r: any = await pb.collection('mapeamento_dores').getOne(id)
  return {
    id: r.id,
    descricao_dor: r.descricao_dor || '',
    framework: r.framework || '',
    livros_referencia: r.livros_referencia || [],
    created: r.created,
    updated: r.updated,
  } as MapeamentoDor
}
