import pb from '@/lib/pocketbase/client'

export interface Livro {
  id: string
  titulo: string
  autor: string
  categoria: string
  resumo: string
  capa?: string
  created: string
  updated: string
}

export const getLivros = async (): Promise<Livro[]> => {
  const records = await pb.collection('livros').getFullList({ sort: 'titulo' })
  return records.map((r: any) => ({
    id: r.id,
    titulo: r.titulo,
    autor: r.autor,
    categoria: r.categoria || '',
    resumo: r.resumo || '',
    capa: r.capa || '',
    created: r.created,
    updated: r.updated,
  })) as Livro[]
}

export const getLivro = async (id: string): Promise<Livro> => {
  const r: any = await pb.collection('livros').getOne(id)
  return {
    id: r.id,
    titulo: r.titulo,
    autor: r.autor,
    categoria: r.categoria || '',
    resumo: r.resumo || '',
    capa: r.capa || '',
    created: r.created,
    updated: r.updated,
  } as Livro
}
