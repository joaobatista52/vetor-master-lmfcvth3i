import { Link } from 'react-router-dom'
import { Activity, CheckCircle2, Clock, ArrowRight, TrendingUp, BrainCircuit } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

const radialData = [{ name: 'Liberdade', value: 68, fill: 'var(--color-value)' }]
const radialConfig = {
  value: { label: 'Índice', color: 'hsl(var(--primary))' },
}

export default function Index() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-1 lg:col-span-2 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-card to-secondary/30">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Índice de Liberdade do Fundador</CardTitle>
            <CardDescription>Sua transição do operacional para o estratégico</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="w-[120px] h-[120px]">
              <ChartContainer config={radialConfig} className="w-full h-full">
                <RadialBarChart
                  innerRadius="80%"
                  outerRadius="100%"
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background
                    clockWise
                    dataKey="value"
                    cornerRadius={10}
                    fill="var(--color-value)"
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-2xl font-bold"
                  >
                    68%
                  </text>
                </RadialBarChart>
              </ChartContainer>
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">
                Você avançou <strong className="text-accent">+12%</strong> este mês.
              </p>
              <div className="bg-background rounded-md p-3 border border-border shadow-sm text-sm">
                <span className="font-semibold text-primary block mb-1">Próximo Marco:</span>
                Delegar rotina de pagamentos (Financeiro)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível de Delegação</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45%</div>
            <p className="text-xs text-muted-foreground mt-1">Das rotinas mapeadas transferidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Estratégicas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              7<span className="text-lg text-muted-foreground font-normal"> pendentes</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">3 com prazo para esta semana</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Plano de Ação Ativo</CardTitle>
              <CardDescription>
                Suas próximas prioridades para destravar crescimento
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/plano-de-acao" className="text-primary hover:text-primary/80">
                Ver todos <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: 'Documentar Fluxo de Atendimento',
                area: 'Operações',
                status: 'Em Andamento',
                color: 'bg-blue-100 text-blue-700',
              },
              {
                title: 'Definir Metas OKR Trimestrais',
                area: 'Estratégia',
                status: 'Atrasado',
                color: 'bg-red-100 text-red-700',
              },
              {
                title: 'Reunião 1:1 com Lideranças',
                area: 'Pessoas',
                status: 'A Fazer',
                color: 'bg-gray-100 text-gray-700',
              },
            ].map((task, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{task.area}</p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`font-normal border-transparent ${task.color}`}
                >
                  {task.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <BrainCircuit className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-primary-foreground flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              Insight do Especialista
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <p className="text-lg leading-tight font-medium text-primary-foreground/90">
              "Você não constrói um negócio. Você constrói pessoas, e então as pessoas constroem o
              negócio."
            </p>
            <div className="pt-4 border-t border-primary-foreground/20">
              <p className="text-sm text-primary-foreground/80 mb-3">
                Seu diagnóstico de <strong>Gestão de Pessoas</strong> indica gargalos em
                treinamento. Foque em documentar um processo chave esta semana.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-background text-foreground hover:bg-background/90"
              >
                Iniciar Documentação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
