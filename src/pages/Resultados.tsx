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
import { fasesStateMachineV72 } from '@/data/master-framework-v72'

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
        {/* Banner de topo */}
        <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#0066CC] uppercase tracking-wider">
              <span>Passo 03 da Jornada</span>
              <span className="text-[#808080]">•</span>
              <span>Vetor Master V7.2</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC]">
              Resultados e Devolutiva Executiva
            </h1>
            <p className="text-xs md:text-sm text-[#333333]">
              Acompanhe sua jornada rumo a uma empresa autogerenciável e examine a devolutiva das 8
              áreas estratégicas.
            </p>
          </div>
          <Button
            asChild
            className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] shadow-sm shrink-0 font-medium"
          >
            <a href="/questionario">Realizar Diagnóstico Agora</a>
          </Button>
        </div>

        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-[#333333]">
              <Target className="w-5 h-5 text-[#0066CC]" />
              Heat Map das 8 Áreas Estratégicas
            </CardTitle>
            <CardDescription className="text-xs text-[#808080]">
              Inicie um diagnóstico setorial para preencher seu heat map com os limiares
              determinísticos reais.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {strategicAreas.map((a) => (
                <div
                  key={a.numero}
                  className="border border-[#E0E0E0] rounded-[4px] p-3 bg-white opacity-75"
                >
                  <a.icon className="w-5 h-5 text-[#0066CC] mb-2" />
                  <p className="text-xs font-semibold text-[#333333] leading-tight">{a.titulo}</p>
                  <p className="text-[11px] text-[#808080] mt-1">— Aguardando dados</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-[#333333]">
              <TrendingUp className="w-5 h-5 text-[#0066CC]" />
              As 8 Fases da Metodologia Vetor Master V7.2
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fasesStateMachineV72.map((f) => (
                <div
                  key={f.numero}
                  className="border border-[#E0E0E0] rounded-[4px] p-3.5 bg-white"
                >
                  <Badge
                    variant="outline"
                    className="mb-1 text-[10px] text-[#0066CC] border-[#0066CC]/30 font-semibold bg-[#0066CC]/5"
                  >
                    Fase {f.numero}
                  </Badge>
                  <p className="font-semibold text-sm text-[#333333]">{f.titulo}</p>
                  <p className="text-xs text-[#808080] mt-1 line-clamp-2">{f.foco}</p>
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
      <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#22B14C] uppercase tracking-wider mb-1">
            <span>Diagnóstico Processado</span>
            <span className="text-[#808080]">•</span>
            <span>Vetor Master V7.2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC]">
            Resultados e Devolutiva Estratégica
          </h1>
          <p className="text-xs md:text-sm text-[#808080] mt-1">
            Análise determinística e identificação dos vazamentos operacionais
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white rounded-[4px] text-xs"
        >
          <a href="/questionario">Novo Diagnóstico</a>
        </Button>
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
              Solução Completa V7.2
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
