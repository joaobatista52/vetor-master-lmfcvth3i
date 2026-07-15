import pb from '@/lib/pocketbase/client'

export interface NotaProjeto {
  id: string
  title: string
  content: string
  user: string
  created: string
  updated: string
}

export const getNotas = async (): Promise<NotaProjeto[]> => {
  const records = await pb.collection('notas_projeto').getFullList({
    sort: '-created',
  })
  return records as unknown as NotaProjeto[]
}

export const createNota = async (data: {
  title: string
  content: string
  user: string
}): Promise<NotaProjeto> => {
  const record = await pb.collection('notas_projeto').create(data)
  return record as unknown as NotaProjeto
}

export const updateNota = async (
  id: string,
  data: Partial<{ title: string; content: string }>,
): Promise<NotaProjeto> => {
  const record = await pb.collection('notas_projeto').update(id, data)
  return record as unknown as NotaProjeto
}

export const deleteNota = async (id: string): Promise<void> => {
  await pb.collection('notas_projeto').delete(id)
}
