import pb from '@/lib/pocketbase/client'

export interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  created: string
  updated: string
}

export const getAllUsers = async (): Promise<UserRecord[]> => {
  const records = await pb.collection('users').getFullList({ sort: '-created' })
  return records.map((r: any) => ({
    id: r.id,
    name: r.name || '',
    email: r.email || '',
    role: r.role || 'user',
    created: r.created,
    updated: r.updated,
  })) as UserRecord[]
}

export const updateUserRole = async (id: string, role: string): Promise<void> => {
  await pb.collection('users').update(id, { role })
}
