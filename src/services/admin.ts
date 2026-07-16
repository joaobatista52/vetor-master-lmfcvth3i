import pb from '@/lib/pocketbase/client'
import type { NotaProjeto } from '@/services/notas_projeto'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  created: string
  updated: string
}

export interface AdminNota extends NotaProjeto {
  userName: string
  userEmail: string
}

export const getAllNotas = async (): Promise<AdminNota[]> => {
  const records = await pb.collection('notas_projeto').getFullList({
    sort: '-created',
    expand: 'user',
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
    userName: r.expand?.user?.name || r.expand?.user?.email || 'Usuário',
    userEmail: r.expand?.user?.email || '',
  })) as AdminNota[]
}

export const getAllUsers = async (): Promise<AdminUser[]> => {
  const records = await pb.collection('users').getFullList({
    sort: '-created',
  })
  return records.map((r: any) => ({
    id: r.id,
    name: r.name || '',
    email: r.email || '',
    role: r.role || 'user',
    created: r.created,
    updated: r.updated,
  })) as AdminUser[]
}

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  await pb.collection('users').update(userId, { role })
}

export const updateNotaAdmin = async (
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

export const deleteNotaAdmin = async (id: string): Promise<void> => {
  await pb.collection('notas_projeto').delete(id)
}
