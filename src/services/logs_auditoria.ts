import pb from '@/lib/pocketbase/client'

export interface LogAuditoria {
  id: string
  user: string
  action: string
  resource: string
  details: string
  created: string
  updated: string
  userName: string
  expand?: { user?: { id: string; name: string; email: string } }
}

export const getLogs = async (): Promise<LogAuditoria[]> => {
  const records = await pb.collection('logs_auditoria').getFullList({
    sort: '-created',
    expand: 'user',
  })
  return records.map((r: any) => ({
    id: r.id,
    user: r.user,
    action: r.action,
    resource: r.resource,
    details: r.details || '',
    created: r.created,
    updated: r.updated,
    userName: r.expand?.user?.name || r.expand?.user?.email || '—',
    expand: r.expand,
  }))
}
