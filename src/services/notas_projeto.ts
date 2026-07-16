import pb from '@/lib/pocketbase/client'

export interface NotaProjeto {
  id: string
  title: string
  content: string
  user: string
  priority: string
  status: string
  tags: string[]
  created: string
  updated: string
}

export const getNotas = async (): Promise<NotaProjeto[]> => {
  const records = await pb.collection('notas_projeto').getFullList({
    sort: '-created',
  })
  return records.map((r: any) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    user: r.user,
    priority: r.priority || 'Média',
    status: r.status || 'A Fazer',
    tags: Array.isArray(r.tags) ? r.tags : [],
    created: r.created,
    updated: r.updated,
  })) as NotaProjeto[]
}

export const createNota = async (data: {
  title: string
  content: string
  user: string
  priority: string
  status: string
  tags: string[]
}): Promise<NotaProjeto> => {
  const record = await pb.collection('notas_projeto').create(data)
  return record as unknown as NotaProjeto
}

export const updateNota = async (
  id: string,
  data: Partial<{
    title: string
    content: string
    priority: string
    status: string
    tags: string[]
  }>,
): Promise<NotaProjeto> => {
  const record = await pb.collection('notas_projeto').update(id, data)
  return record as unknown as NotaProjeto
}

export const deleteNota = async (id: string): Promise<void> => {
  await pb.collection('notas_projeto').delete(id)
}
