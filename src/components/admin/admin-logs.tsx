import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, History } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRealtime } from '@/hooks/use-realtime'
import { getLogs, type LogAuditoria } from '@/services/logs_auditoria'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const ACTION_BADGE: Record<string, string> = {
  'Criou Nota': 'bg-green-500/10 text-green-600 border-green-500/20',
  'Editou Nota': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Excluiu Nota': 'bg-red-500/10 text-red-600 border-red-500/20',
}

export function AdminLogs() {
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState<string>('all')

  const load = useCallback(async () => {
    try {
      setLogs(await getLogs())
    } catch {
      toast.error('Erro ao carregar logs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('logs_auditoria', () => load())

  const uniqueUsers = useMemo(() => {
    const map = new Map<string, string>()
    logs.forEach((l) => {
      if (l.user && !map.has(l.user)) {
        map.set(l.user, l.userName)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [logs])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return logs.filter((l) => {
      if (userFilter !== 'all' && l.user !== userFilter) return false
      if (
        q &&
        !l.action.toLowerCase().includes(q) &&
        !l.details.toLowerCase().includes(q) &&
        !l.userName.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [logs, search, userFilter])

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por ação, detalhe ou usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filtrar por usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os usuários</SelectItem>
            {uniqueUsers.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Data/Hora</TableHead>
              <TableHead className="w-[160px]">Usuário</TableHead>
              <TableHead className="w-[140px]">Ação</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhum log encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(log.created).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{log.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(ACTION_BADGE[log.action])}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-md">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
