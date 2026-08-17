import pb from '@/lib/pocketbase/client'

export interface SetorRecord {
  id: string
  nome: string
  slug: string
  segmentos: string[]
  micro_epifanias: string[]
  ordem: number
  created: string
  updated: string
}

export const getSetores = async (): Promise<SetorRecord[]> => {
  const records = await pb.collection('setores').getFullList({ sort: 'ordem' })
  return records.map((r: any) => ({
    id: r.id,
    nome: r.nome,
    slug: r.slug,
    segmentos: Array.isArray(r.segmentos) ? r.segmentos : [],
    micro_epifanias: Array.isArray(r.micro_epifanias) ? r.micro_epifanias : [],
    ordem: r.ordem ?? 0,
    created: r.created,
    updated: r.updated,
  })) as SetorRecord[]
}
