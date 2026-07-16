import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { strategicAreas } from '@/lib/strategic-areas'
import { cn } from '@/lib/utils'
import type { HeatMap } from '@/services/diagnosticos'

const nivelConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string; bar: string }
> = {
  critico: {
    label: 'Crítico',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    bar: 'bg-red-500',
  },
  moderado: {
    label: 'Moderado',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    bar: 'bg-amber-500',
  },
  sob_controle: {
    label: 'Sob Controle',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    bar: 'bg-green-500',
  },
}

function getNivelConfig(nivel: string) {
  const n = String(nivel || '')
    .toLowerCase()
    .trim()
  if (n.includes('crit')) return nivelConfig.critico
  if (n.includes('mod')) return nivelConfig.moderado
  return nivelConfig.sob_controle
}

const chartConfig = {
  score: { label: 'Severidade', color: 'hsl(var(--primary))' },
}

export function HeatMapVisualization({ heatMap }: { heatMap: HeatMap }) {
  const radarData = heatMap.areas.map((area) => {
    const sa = strategicAreas.find((s) => s.numero === area.numero)
    return { subject: sa?.titulo || area.titulo, score: area.score }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {heatMap.areas.map((area) => {
          const sa = strategicAreas.find((s) => s.numero === area.numero)
          const Icon = sa?.icon
          const config = getNivelConfig(area.nivel)
          return (
            <Card key={area.numero} className={cn('border', config.border, config.bg)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  {Icon && <Icon className={cn('w-5 h-5', sa?.cor)} />}
                  <Badge variant="outline" className={cn('text-xs font-medium', config.color)}>
                    {config.label}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm mb-3">{sa?.titulo || area.titulo}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', config.bar)}
                      style={{ width: `${area.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold tabular-nums">{area.score}%</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-center mb-4">Visão Geral de Risco</h3>
          <div className="h-[280px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full aspect-square mx-auto">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 10, fontWeight: 500 }}
                />
                <Radar
                  dataKey="score"
                  stroke="var(--color-score)"
                  fill="var(--color-score)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
