import pb from '@/lib/pocketbase/client'

export interface Framework {
  id: string
  area_numero: number
  titulo: string
  conteudo: string
  regras_ouro: string
  created: string
  updated: string
}

export const getFrameworks = async (): Promise<Framework[]> => {
  const records = await pb.collection('frameworks').getFullList({
    sort: 'area_numero',
  })
  return records.map((r: any) => ({
    id: r.id,
    area_numero: r.area_numero,
    titulo: r.titulo,
    conteudo: r.conteudo,
    regras_ouro: r.regras_ouro || '',
    created: r.created,
    updated: r.updated,
  })) as Framework[]
}

export const getFramework = async (id: string): Promise<Framework> => {
  const r = await pb.collection('frameworks').getOne(id)
  return {
    id: r.id,
    area_numero: r.area_numero,
    titulo: r.titulo,
    conteudo: r.conteudo,
    regras_ouro: r.regras_ouro || '',
    created: r.created,
    updated: r.updated,
  } as Framework
}
