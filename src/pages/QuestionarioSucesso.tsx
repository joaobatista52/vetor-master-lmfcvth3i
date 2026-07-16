import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, FileText, Lock, ChevronRight, AlertCircle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getLatestDiagnostico, getHeatMap, type Diagnostico } from '@/services/diagnosticos'
import { HeatMapVisualization } from '@/components/heat-map'
import { SimpleMarkdown } from '@/components/simple-markdown'

const loadingMessages = [
  'Analisando dados da sua empresa...',
  'Correlacionando com a metodologia JBP...',
  'Identificando gargalos críticos...',
  'Gerando heat map estratégico...',
  'Finalizando relatório executivo...',
]

export default function QuestionarioSucesso() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null)
  const [loading, setLoading] = useState(true)
  const [msgIndex, setMsgIndex] = useState(0)

  const loadDiagnostico = useCallback(async () => {
    try {
      const latest = await getLatestDiagnostico()
      setDiagnostico(latest)
    } catch {
      setDiagnostico(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDiagnostico()
  }, [loadDiagnostico])

  useRealtime('diagnosticos', () => {
    loadDiagnostico()
  })

  const isGenerating = !loading && diagnostico && !diagnostico.relatorio_gerado

  useEffect(() => {
    if (!isGenerating) return
    const msgInterval = setInterval(() => {
      setMsgIndex((p) => (p + 1) % loadingMessages.length)
    }, 3000)
    const pollInterval = setInterval(loadDiagnostico, 5000)
    return () => {
      clearInterval(msgInterval)
      clearInterval(pollInterval)
    }
  }, [isGenerating, loadDiagnostico])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!diagnostico) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nenhum diagnóstico encontrado</h2>
        <p className="text-muted-foreground mb-6">Inicie seu diagnóstico estratégico agora.</p>
        <Button onClick={() => navigate('/questionario')}>Iniciar Diagnóstico</Button>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
              <h2 className="text-xl font-semibold mb-2">Gerando seu diagnóstico estratégico</h2>
              <p className="text-muted-foreground">{loadingMessages[msgIndex]}</p>
              <p className="text-xs text-muted-foreground mt-4">
                Nossa IA está analisando seus dados com a metodologia JBP Gestão Master V 6.4
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const heatMap = getHeatMap(diagnostico)

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <div>
        <Badge className="mb-2 bg-green-100 text-green-700 hover:bg-green-200">
          Diagnóstico Concluído
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Relatório Estratégico Executivo</h1>
        <p className="text-muted-foreground mt-1">
          Análise baseada na metodologia JBP Gestão Master V 6.4
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Sumário Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleMarkdown content={diagnostico.relatorio_gerado} />
        </CardContent>
      </Card>

      {heatMap && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Heat Map de Criticalidade</h2>
          <HeatMapVisualization heatMap={heatMap} />
        </div>
      )}

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Caminho Estratégico Completo</h3>
              <p className="text-muted-foreground mb-4">
                O diagnóstico revelou gargalos críticos que requerem ação imediata. Desbloqueie a
                solução completa com planos de ação 5W2H, OKRs e direção assistida por
                especialistas.
              </p>
              <Button className="gap-2" onClick={() => navigate('/plano-de-acao')}>
                <Sparkles className="w-4 h-4" />
                Desbloquear Solução Completa
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => navigate('/questionario')}>
          Novo Diagnóstico
        </Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  )
}
