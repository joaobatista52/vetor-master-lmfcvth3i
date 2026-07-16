import pb from '@/lib/pocketbase/client'

export interface Convite {
  id: string
  email: string
  role: string
  status: string
  created: string
  updated: string
}

export const getConvites = async (): Promise<Convite[]> => {
  const records = await pb.collection('convites').getFullList({
    sort: '-created',
  })
  return records.map((r: any) => ({
    id: r.id,
    email: r.email || '',
    role: r.role || 'user',
    status: r.status || 'Pendente',
    created: r.created,
    updated: r.updated,
  })) as Convite[]
}

export const createConvite = async (data: { email: string; role: string }): Promise<Convite> => {
  const record = await pb.collection('convites').create({
    email: data.email,
    role: data.role,
    status: 'Pendente',
  })
  return record as unknown as Convite
}

export const deleteConvite = async (id: string): Promise<void> => {
  await pb.collection('convites').delete(id)
}
