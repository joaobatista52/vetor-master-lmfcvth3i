import { useState, useEffect, useCallback } from 'react'
import { StickyNote, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer } from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useRealtime } from '@/hooks/use-realtime'
import { getAllNotas } from '@/services/notas_projeto'
import { getConvites } from '@/services/convites'
import { STATUS_CONFIG, PRIORITY_CONFIG, STATUSES, PRIORITIES } from '@/lib/notes-constants'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  'A Fazer': 'hsl(var(--muted-foreground))',
  'Em Progresso': 'hsl(38 92% 50%)',
  Concluído: 'hsl(142 71% 45%)',
}

const PRIORITY_COLORS: Record<string, string> = {
  Alta: 'hsl(0 84% 60%)',
  Média: 'hsl(38 92% 50%)',
  Baixa: 'hsl(217 91% 60%)',
}

export default function AdminMetrics() {
  const [notasCount, setNotasCount] = useState(0)
  const [concluidas, setConcluidas] = useState(0)
  const [convitesPendentes, setConvitesPendentes] = useState(0)
  const [statusData, setStatusData] = useState<{ name: string; value: number; fill: string }[]>([])
  const [priorityData, setPriorityData] = useState<{ name: string; value: number; fill: string }[]>(
    [],
  )
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [notas, convites] = await Promise.all([getAllNotas(), getConvites()])
      setNotasCount(notas.length)
      setConcluidas(notas.filter((n) => (n.status || 'A Fazer') === 'Concluído').length)
      setConvitesPendentes(convites.filter((c) => c.status === 'Pendente').length)

      setStatusData(
        STATUSES.map((s) => ({
          name: s,
          value: notas.filter((n) => (n.status || 'A Fazer') === s).length,
          fill: STATUS_COLORS[s] || 'hsl(var(--muted-foreground))',
        })),
      )

      setPriorityData(
        PRIORITIES.map((p) => ({
          name: p,
          value: notas.filter((n) => (n.priority || 'Média') === p).length,
          fill: PRIORITY_COLORS[p] || 'hsl(var(--muted-foreground))',
        })),
      )
    } catch {
      toast.error('Erro ao carregar métricas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('notas_projeto', () => load())
  useRealtime('convites', () => load())

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Notas
            </CardTitle>
            <StickyNote className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notasCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notas Concluídas
            </CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{concluidas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Convites Pendentes
            </CardTitle>
            <Clock className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{convitesPendentes}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visão Geral por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto max-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
