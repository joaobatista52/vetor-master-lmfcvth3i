import pb from '@/lib/pocketbase/client'

export interface LogAuditoria {
  id: string
  user: string
  action: string
  resource: string
  details: string
  created: string
  updated: string
  expand?: { user?: { id: string; name: string; email: string } }
}

export const getLogs = (): Promise<LogAuditoria[]> =>
  pb.collection('logs_auditoria').getFullList({
    sort: '-created',
    expand: 'user',
  })
