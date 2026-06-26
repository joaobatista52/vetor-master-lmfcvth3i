import { Trophy, TrendingUp, CalendarDays, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

const evolutionData = [
  { month: 'Jan', score: 35 },
  { month: 'Fev', score: 42 },
  { month: 'Mar', score: 40 },
  { month: 'Abr', score: 55 },
  { month: 'Mai', score: 62 },
  { month: 'Jun', score: 68 },
]

const radarData = [
  { subject: 'Operações', A: 80, fullMark: 100 },
  { subject: 'Pessoas', A: 45, fullMark: 100 },
  { subject: 'Financeiro', A: 85, fullMark: 100 },
  { subject: 'Vendas', A: 30, fullMark: 100 },
  { subject: 'Estratégia', A: 60, fullMark: 100 },
]

const lineChartConfig = {
  score: { label: 'Score de Liberdade (%)', color: 'hsl(var(--primary))' },
}
const radarChartConfig = {
  A: { label: 'Desempenho Atual', color: 'hsl(var(--accent))' },
}

export default function Resultados() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Avaliação de Resultados</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe sua jornada rumo a uma empresa autogerenciável.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolução do Índice de Liberdade
            </CardTitle>
            <CardDescription>
              Acompanhamento mensal do seu desprendimento operacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer config={lineChartConfig} className="h-full w-full">
                <LineChart
                  data={evolutionData}
                  margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-score)"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: 'var(--color-score)',
                      strokeWidth: 2,
                      stroke: 'hsl(var(--background))',
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Análise por Pilares
            </CardTitle>
            <CardDescription>Onde focar seus esforços agora</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[250px] w-full">
              <ChartContainer
                config={radarChartConfig}
                className="h-full w-full mx-auto aspect-square"
              >
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                  />
                  <Radar
                    name="Desempenho Atual"
                    dataKey="A"
                    stroke="var(--color-A)"
                    fill="var(--color-A)"
                    fillOpacity={0.3}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ChartContainer>
            </div>
            <div className="mt-4 text-center w-full bg-secondary/40 p-3 rounded-lg text-sm">
              Maior gap atual: <strong className="text-red-500 font-semibold">Vendas (30%)</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Linha do Tempo de Conquistas Estratégicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {[
              {
                date: 'Junho 2026',
                title: 'Financeiro 100% Delegado',
                desc: 'Contratação e onboarding do novo Coordenador Financeiro.',
                achieved: true,
              },
              {
                date: 'Abril 2026',
                title: 'Processos Operacionais Documentados',
                desc: 'Conclusão dos POPs da área de atendimento.',
                achieved: true,
              },
              {
                date: 'Janeiro 2026',
                title: 'Início da Jornada',
                desc: 'Primeiro diagnóstico realizado. Score inicial: 35%.',
                achieved: true,
              },
            ].map((milestone, i) => (
              <div
                key={i}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-accent shrink-0 text-white relative z-10 shadow-md">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm ml-6 md:ml-0 hover:border-accent/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-1 uppercase tracking-wider">
                    <CalendarDays className="w-3 h-3" /> {milestone.date}
                  </div>
                  <h4 className="font-bold text-lg leading-tight mb-1">{milestone.title}</h4>
                  <p className="text-sm text-muted-foreground">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
