import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, Clock, Loader2, AlertTriangle, TrendingUp, FileText } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { ChartContainer, ChartConfig } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRealtime } from '@/hooks/use-realtime'
import { getAllNotas, type NotaProjeto } from '@/services/notas_projeto'
import { STATUSES, PRIORITIES, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/notes-constants'

const STATUS_COLORS: Record<string, string> = {
  'A Fazer': 'hsl(220, 70%, 50%)',
  'Em Progresso': 'hsl(45, 90%, 50%)',
  Concluído: 'hsl(140, 70%, 45%)',
}

const PRIORITY_COLORS: Record<string, string> = {
  Alta: 'hsl(0, 75%, 55%)',
  Média: 'hsl(45, 90%, 50%)',
  Baixa: 'hsl(140, 70%, 45%)',
}

const chartConfig: ChartConfig = {
  count: { label: 'Notas' },
}

export default function AdminMetrics() {
  const [notas, setNotas] = useState<NotaProjeto[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await getAllNotas()
      setNotas(data)
    } catch (err) {
      console.error('Failed to load notas:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('notas_projeto', () => {
    loadData()
  })

  const statusData = STATUSES.map((status) => ({
    name: status,
    count: notas.filter((n) => n.status === status).length,
    fill: STATUS_COLORS[status],
  }))

  const priorityData = PRIORITIES.map((priority) => ({
    name: priority,
    count: notas.filter((n) => n.priority === priority).length,
    fill: PRIORITY_COLORS[priority],
  }))

  const totalNotas = notas.length
  const concluidas = notas.filter((n) => n.status === 'Concluído').length
  const emProgresso = notas.filter((n) => n.status === 'Em Progresso').length
  const altaPrioridade = notas.filter((n) => n.priority === 'Alta').length

  const stats = [
    { label: 'Total de Notas', value: totalNotas, icon: FileText, color: 'text-blue-600' },
    { label: 'Concluídas', value: concluidas, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Em Progresso', value: emProgresso, icon: Loader2, color: 'text-yellow-600' },
    { label: 'Alta Prioridade', value: altaPrioridade, icon: AlertTriangle, color: 'text-red-600' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Métricas do Projeto</h1>
        <p className="text-muted-foreground mt-1">Visão geral das notas do projeto em tempo real</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Distribuição por Status
            </CardTitle>
            <CardDescription>Notas agrupadas por status atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${entry.count}`}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
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
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Distribuição por Prioridade
            </CardTitle>
            <CardDescription>Notas agrupadas por nível de prioridade</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {STATUSES.map((status) => {
                const count = notas.filter((n) => n.status === status).length
                const percentage = totalNotas > 0 ? (count / totalNotas) * 100 : 0
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{status}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: STATUS_COLORS[status] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PRIORITIES.map((priority) => {
                const count = notas.filter((n) => n.priority === priority).length
                const percentage = totalNotas > 0 ? (count / totalNotas) * 100 : 0
                return (
                  <div key={priority} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{priority}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: PRIORITY_COLORS[priority],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
