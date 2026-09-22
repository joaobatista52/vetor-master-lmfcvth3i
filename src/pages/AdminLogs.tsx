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
      <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#FF9900] uppercase tracking-wider mb-1">
            <span>Auditoria & Segurança</span>
            <span className="text-[#808080]">•</span>
            <span>Vetor Master V7.2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC]">
            Logs de Auditoria
          </h1>
          <p className="text-xs md:text-sm text-[#333333] mt-1">
            Registro de todas as atividades realizadas no ecossistema e notas do projeto.
          </p>
        </div>
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
