import { useEffect, useState, useCallback } from 'react'
import { History, Loader2, FilePlus, FileEdit, FileX, User as UserIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { useRealtime } from '@/hooks/use-realtime'
import { getLogs, type LogAuditoria } from '@/services/logs_auditoria'

const ACTION_CONFIG: Record<string, { icon: typeof FilePlus; color: string; label: string }> = {
  create: { icon: FilePlus, color: 'text-green-600', label: 'Criação' },
  update: { icon: FileEdit, color: 'text-blue-600', label: 'Atualização' },
  delete: { icon: FileX, color: 'text-red-600', label: 'Exclusão' },
}

function getActionConfig(action: string) {
  const key = action.toLowerCase()
  return ACTION_CONFIG[key] || { icon: History, color: 'text-muted-foreground', label: action }
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await getLogs()
      setLogs(data)
    } catch (err) {
      console.error('Failed to load logs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('logs_auditoria', () => {
    loadData()
  })

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Logs de Auditoria</h1>
        <p className="text-muted-foreground mt-1">
          Registro de todas as atividades realizadas nas notas do projeto
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Histórico de Atividades
          </CardTitle>
          <CardDescription>
            Atualizado em tempo real conforme novas ações são registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum registro de auditoria encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const config = getActionConfig(log.action)
                    const userName = log.expand?.user?.name || log.expand?.user?.email || 'Usuário'
                    return (
                      <TableRow key={log.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium">{userName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <config.icon className={`w-4 h-4 ${config.color}`} />
                            <Badge variant="outline">{config.label}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{log.resource}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {log.details || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(log.created).toLocaleString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
