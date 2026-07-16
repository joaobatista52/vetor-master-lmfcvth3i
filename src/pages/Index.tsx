import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Target,
  DollarSign,
  Settings,
  Users,
  TrendingUp,
  Cpu,
  Shield,
  ArrowRight,
  Activity,
  BrainCircuit,
  Clock,
  BookOpen,
  ListTodo,
  Stethoscope,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getFrameworks, type Framework } from '@/services/frameworks'
import { useRealtime } from '@/hooks/use-realtime'

const areaIcons = [Target, DollarSign, Settings, Users, TrendingUp, Cpu, Shield]
const areaColors = [
  'text-blue-500 bg-blue-50',
  'text-green-500 bg-green-50',
  'text-orange-500 bg-orange-50',
  'text-purple-500 bg-purple-50',
  'text-cyan-500 bg-cyan-50',
  'text-indigo-500 bg-indigo-50',
  'text-red-500 bg-red-50',
]

export default function Index() {
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await getFrameworks()
      setFrameworks(data)
    } catch {
      setFrameworks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('frameworks', () => {
    loadData()
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral Estratégica</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta. Aqui está o pulso do seu negócio hoje.
          </p>
        </div>
        <Button asChild className="gap-2 shadow-sm">
          <Link to="/diagnosticos">
            <Activity className="w-4 h-4" />
            Novo Diagnóstico
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Índice de Liberdade</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground mt-1">+12% este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Estratégicas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              7 <span className="text-lg text-muted-foreground font-normal">pendentes</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">3 com prazo esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Áreas Mapeadas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {frameworks.length}
              <span className="text-lg text-muted-foreground font-normal"> / 7</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Frameworks ativos</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />7 Áreas Estratégicas
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Os Master Frameworks da metodologia Vetor Master 6.4
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            : frameworks.map((fw) => {
                const Icon = areaIcons[fw.area_numero - 1] || Target
                const colorClass = areaColors[fw.area_numero - 1] || areaColors[0]
                return (
                  <Card
                    key={fw.id}
                    className="transition-all hover:shadow-md hover:border-primary/50 group"
                  >
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                      <div className={`p-3 rounded-xl ${colorClass} shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs shrink-0">
                            Área {fw.area_numero}
                          </Badge>
                        </div>
                        <CardTitle className="text-base mt-1 group-hover:text-primary transition-colors leading-tight">
                          {fw.titulo}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {fw.conteudo}
                      </p>
                      {fw.regras_ouro && (
                        <div className="bg-secondary/50 rounded-md p-3 border border-border">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Regras de Ouro: </span>
                            {fw.regras_ouro}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          asChild
        >
          <Link to="/diagnosticos">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-500">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      Meus Diagnósticos
                    </CardTitle>
                    <CardDescription>
                      Avalie gargalos e gere relatórios estratégicos
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
          </Link>
        </Card>
        <Card
          className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          asChild
        >
          <Link to="/plano-de-acao">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-green-50 text-green-500">
                    <ListTodo className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      Planos de Ação
                    </CardTitle>
                    <CardDescription>Execute tarefas 5W2H e acompanhe OKRs</CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>

      <Card className="bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <BrainCircuit className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="text-primary-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Biblioteca Profissional JBP
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-3">
          <p className="text-sm text-primary-foreground/80">
            Sua base de conhecimento estratégico com referências bibliográficas mapeadas aos 7
            frameworks. Utilize a busca semântica para encontrar soluções rapidamente.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="bg-background text-foreground hover:bg-background/90"
          >
            Explorar Biblioteca
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
