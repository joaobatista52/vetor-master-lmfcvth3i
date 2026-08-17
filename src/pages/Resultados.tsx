import { useState, useEffect } from 'react'
import {
  Trophy,
  TrendingUp,
  Target,
  CheckCircle2,
  Lock,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SimpleMarkdown } from '@/components/simple-markdown'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { HeatMapVisualization } from '@/components/heat-map'
import {
  getLatestDiagnostico,
  getHeatMap,
  type Diagnostico,
  type HeatMap,
} from '@/services/diagnosticos'
import { strategicAreas } from '@/lib/strategic-areas'
import { fasesStateMachineV65 } from '@/data/master-framework-v65'

const evolutionData = [
  { month: 'Jan', score: 35 },
  { month: 'Fev', score: 42 },
  { month: 'Mar', score: 40 },
  { month: 'Abr', score: 55 },
  { month: 'Mai', score: 62 },
  { month: 'Jun', score: 68 },
]

const lineChartConfig = {
  score: { label: 'Score de Liberdade (%)', color: 'hsl(var(--primary))' },
}

export default function Resultados() {
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null)
  const [heatMap, setHeatMap] = useState<HeatMap | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const d = await getLatestDiagnostico()
      if (cancelled) return
      setDiagnostico(d)
      setHeatMap(d ? getHeatMap(d) : null)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Carregando diagnóstico...</p>
      </div>
    )
  }

  // Sem diagnóstico: visão demonstrativa padrão (8 áreas)
  if (!diagnostico) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avaliação de Resultados</h1>
          <p className="text-muted-foreground mt-1">
            V6.5 — Acompanhe sua jornada rumo a uma empresa autogerenciável.
          </p>
        </div>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Heat Map das 8 Áreas Estratégicas
            </CardTitle>
            <CardDescription>
              Inicie um diagnóstico setorial para preencher seu heat map real.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {strategicAreas.map((a) => (
                <div
                  key={a.numero}
                  className={`border rounded-lg p-3 ${a.bg} border-border opacity-60`}
                >
                  <a.icon className={`w-5 h-5 ${a.cor} mb-2`} />
                  <p className="text-xs font-medium leading-tight">{a.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-1">—</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              As 8 Fases da Metodologia V6.5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fasesStateMachineV65.map((f) => (
                <div key={f.numero} className="border rounded-lg p-3">
                  <Badge variant="outline" className="mb-1">
                    Fase {f.numero}
                  </Badge>
                  <p className="font-medium text-sm">{f.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.foco}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Com diagnóstico: relatório gerado (isca gratuita) + heat map
  const temRelatorio = !!diagnostico.relatorio_gerado

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Avaliação de Resultados</h1>
        <p className="text-muted-foreground mt-1">
          JBP Gestão Master V 6.5 — Diagnóstico Executivo Estratégico
        </p>
      </div>

      {/* Heat Map das 8 áreas (isca gratuita) */}
      {heatMap ? (
        <HeatMapVisualization heatMap={heatMap} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Heat Map em processamento
            </CardTitle>
            <CardDescription>
              Seu heat map das 8 áreas ficará disponível em instantes.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Relatório gratuito (isca) */}
      {temRelatorio && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Diagnóstico Executivo (Resumo)
            </CardTitle>
            <CardDescription>
              Análise gratuita das dores identificadas nas 8 áreas estratégicas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleMarkdown content={diagnostico.relatorio_gerado} />
          </CardContent>
        </Card>
      )}

      {/* Solução completa — paywall */}
      <SubscriptionGuard>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Solução Completa V6.5
            </CardTitle>
            <CardDescription>Conteúdo premium desbloqueado para assinantes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <p className="font-medium text-sm">Diagnóstico completo das 8 Fases</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Foresight, Hackman, Buffett, Governança, Inovação.
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="font-medium text-sm">Plano de Ação 5W2H</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Roadmap faseado (Curto, Médio, Longo prazo).
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="font-medium text-sm">OKRs vinculados</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Objetivos e resultados-chave trimestrais.
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="font-medium text-sm">Análise financeira (Buffett)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  DRE, Fluxo de Caixa, Valuation, thresholds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </SubscriptionGuard>
    </div>
  )
}
