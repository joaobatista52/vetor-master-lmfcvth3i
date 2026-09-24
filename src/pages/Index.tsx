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
      {/* Banner de Boas-Vindas Institucional VETOR MASTER */}
      <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#0066CC] uppercase tracking-wider">
            <span>Inteligência Estratégica Determinística</span>
            <span className="text-[#808080]">•</span>
            <span className="text-[#22B14C]">Vetor Master V7.2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC]">
            Início — Jornada de Libertação do Fundador
          </h1>
          <p className="text-xs md:text-sm text-[#333333]">
            Estancar os vazamentos invisíveis, fechar o abismo entre estratégia e execução e
            construir uma empresa autogerenciável.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            asChild
            className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] gap-2 shadow-sm font-medium"
          >
            <Link to="/questionario">
              <Activity className="w-4 h-4" />
              Novo Diagnóstico
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white rounded-[4px]"
          >
            <Link to="/niveis-e-planos">Níveis e Planos</Link>
          </Button>
        </div>
      </div>

      {/* Jornada do Cliente em 5 Passos Sequenciais */}
      <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-5 shadow-sm">
        <h2 className="text-xs font-semibold text-[#808080] uppercase tracking-wider mb-3">
          Jornada Determinística do Negócio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              step: '01',
              title: 'Diagnóstico',
              desc: '12 Setores e 3 Pilares',
              path: '/diagnosticos',
              active: true,
            },
            {
              step: '02',
              title: 'Resultados',
              desc: 'Heat Map das 8 Áreas',
              path: '/resultados',
              active: false,
            },
            {
              step: '03',
              title: 'Plano de Ação',
              desc: 'Metodologia 5W2H',
              path: '/plano-de-acao',
              active: false,
            },
            {
              step: '04',
              title: 'Dashboard',
              desc: 'Métricas e Execução',
              path: '/dashboard',
              active: false,
            },
            {
              step: '05',
              title: 'Biblioteca',
              desc: 'FAQ & Insights (Em breve)',
              path: '/biblioteca',
              active: false,
            },
          ].map((item) => (
            <Link
              key={item.step}
              to={item.path}
              className="p-3 rounded-[4px] border border-[#E0E0E0] bg-[#F5F5F5] hover:bg-white hover:border-[#0066CC] transition-all group"
            >
              <div className="text-[10px] font-mono text-[#0066CC] font-bold mb-1">
                PASSO {item.step}
              </div>
              <div className="text-sm font-semibold text-[#333333] group-hover:text-[#0066CC] transition-colors flex items-center justify-between">
                <span>{item.title}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#0066CC]" />
              </div>
              <div className="text-[11px] text-[#808080] mt-1">{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
              Score de Liberdade
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#22B14C]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#333333]">68%</div>
            <p className="text-xs text-[#22B14C] mt-1 font-medium">
              +12% este mês no índice de autonomia
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
              Plano de Ação 5W2H
            </CardTitle>
            <Clock className="h-4 w-4 text-[#FF9900]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#333333]">
              7 <span className="text-sm text-[#808080] font-normal">iniciativas ativas</span>
            </div>
            <p className="text-xs text-[#808080] mt-1">3 com cadência esta semana</p>
          </CardContent>
        </Card>
        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
              Frameworks V2.4 Mapeados
            </CardTitle>
            <Target className="h-4 w-4 text-[#0066CC]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#333333]">
              8 <span className="text-sm text-[#808080] font-normal">/ 8 Áreas</span>
            </div>
            <p className="text-xs text-[#0066CC] mt-1 font-medium">Metodologia Vetor Master V7.2</p>
          </CardContent>
        </Card>
      </div>

      {/* Áreas Estratégicas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#333333] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0066CC]" /> 8 Áreas do Master Framework V2.4
            </h2>
            <p className="text-xs text-[#808080] mt-1">
              Pilares determinísticos para governança, escala e mitigação de riscos em PMEs
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px]">
                  <CardContent className="p-5">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            : frameworks.map((fw) => {
                const Icon = areaIcons[fw.area_numero - 1] || Target
                return (
                  <Card
                    key={fw.id}
                    className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] hover:border-[#0066CC] transition-all hover:shadow-sm group flex flex-col justify-between"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono text-[#0066CC] border-[#0066CC]/30 bg-white"
                        >
                          ÁREA 0{fw.area_numero}
                        </Badge>
                        <div className="w-8 h-8 rounded-[4px] bg-white border border-[#E0E0E0] flex items-center justify-center text-[#0066CC]">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <CardTitle className="text-sm font-bold text-[#333333] group-hover:text-[#0066CC] transition-colors leading-tight">
                        {fw.titulo}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-[#808080] line-clamp-3 mb-3 leading-relaxed">
                        {fw.conteudo}
                      </p>
                      {fw.regras_ouro && (
                        <div className="bg-white rounded-[4px] p-2 border border-[#E0E0E0]">
                          <p className="text-[11px] text-[#333333] line-clamp-2">
                            <span className="font-semibold text-[#0066CC]">Regra de Ouro: </span>
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

      <Card className="bg-[#333333] text-white border border-[#E0E0E0] rounded-[4px] relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <BrainCircuit className="w-48 h-48 text-white" />
        </div>
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#22B14C] uppercase tracking-wider mb-1">
            <span>Central de Conhecimento</span>
            <span>•</span>
            <span>Publicação em Breve</span>
          </div>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#22B14C]" />
            Biblioteca do Cliente Vetor Master
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2 relative z-10 space-y-4">
          <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-3xl">
            Perguntas e respostas estratégicas aos clientes, estudos de caso e insights acionáveis
            para apoiar a implementação dos planos de ação e a maturidade de gestão nos 12 setores.
          </p>
          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-medium"
            >
              <Link to="/biblioteca">Acessar Biblioteca</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-[4px]"
            >
              <Link to="/niveis-e-planos">Ver Escada de Valor</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
