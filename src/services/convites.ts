import pb from '@/lib/pocketbase/client'

export interface Convite {
  id: string
  email: string
  role: 'admin' | 'user'
  status: 'Pendente' | 'Aceito'
  created: string
  updated: string
}

export const getConvites = (): Promise<Convite[]> =>
  pb.collection('convites').getFullList({ sort: '-created' })

export const createConvite = (data: { email: string; role: 'admin' | 'user' }): Promise<Convite> =>
  pb.collection('convites').create({ ...data, status: 'Pendente' })

export const updateConvite = (
  id: string,
  data: Partial<Pick<Convite, 'role' | 'status'>>,
): Promise<Convite> => pb.collection('convites').update(id, data)

export const deleteConvite = (id: string): Promise<void> => pb.collection('convites').delete(id)
