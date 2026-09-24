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
      <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center py-12 bg-[#16213A] border border-[#24334F] rounded-[4px] p-8">
          <AlertCircle className="w-12 h-12 text-[#FFB84D] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-[#F8FAFC]">Diagnóstico Não Localizado</h2>
          <p className="text-xs sm:text-sm text-[#C7D0E0] mb-6">
            Inicie seu diagnóstico gratuito agora ou importe um dossiê .json previamente preenchido.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs font-semibold"
              onClick={() => navigate('/questionario')}
            >
              Iniciar Diagnóstico Gratuito
            </Button>
            <Button
              variant="outline"
              className="border-[#24334F] text-[#C7D0E0] hover:bg-[#111A2E] rounded-[4px] text-xs"
              onClick={() => navigate('/')}
            >
              Ir para Tela Institucional
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] py-16 px-4">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px]">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[#5B9DFF] mb-6" />
                <h2 className="text-xl font-bold mb-2 text-[#F8FAFC]">
                  Gerando seu diagnóstico estratégico
                </h2>
                <p className="text-[#C7D0E0] text-sm">{loadingMessages[msgIndex]}</p>
                <p className="text-xs text-[#5B9DFF] mt-4 font-medium">
                  Algoritmo determinístico analisando seus dados com a metodologia Vetor Master V7.2
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const heatMap = getHeatMap(diagnostico)

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
        <div>
          <Badge className="mb-2 bg-[#3DDC74]/15 text-[#3DDC74] border border-[#3DDC74]/30 font-semibold rounded-[3px]">
            Diagnóstico Concluído • Camada de Conversão
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-[#F8FAFC] font-heading">
            Relatório Estratégico & Devolutiva Executiva
          </h1>
          <p className="text-sm text-[#C7D0E0] mt-1">
            Devolutiva Determinística • Vetor Master V7.2
          </p>
        </div>

        <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px] shadow-sm">
          <CardHeader className="border-b border-[#24334F]">
            <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
              <FileText className="w-5 h-5 text-[#5B9DFF]" />
              Sumário Executivo e Causas-Raiz
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-[#C7D0E0]">
            <SimpleMarkdown content={diagnostico.relatorio_gerado} />
          </CardContent>
        </Card>

        {heatMap && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Heat Map de Criticalidade (8 Áreas)</h2>
            <HeatMapVisualization heatMap={heatMap} />
          </div>
        )}

      {/* Portão P3 -> P4 de Conversão: Transição da Devolutiva (P3) para o Plano Executável (P4) sob assinatura */}
      <Card className="border-[#24334F] bg-[#16213A] rounded-[4px] shadow-xl">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[4px] bg-[#0066CC]/15 border border-[#5B9DFF]/30 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-[#5B9DFF]" />
              </div>
              <div className="space-y-1">
                <Badge className="bg-[#FF9900]/15 text-[#FFB84D] border-[#FF9900]/30 text-[10px] font-semibold uppercase">
                  Portão P3 → P4: Conversão Estruturada
                </Badge>
                <h3 className="font-bold text-lg md:text-xl text-[#F8FAFC]">
                  Caminho Estratégico Completo & Consultor Digital
                </h3>
                <p className="text-xs sm:text-sm text-[#C7D0E0] max-w-2xl leading-relaxed">
                  A devolutiva revelou as causas-raiz estruturais. Para destravar a execução via
                  roadmap 5W2H parametrizado, rotinas semanais de OKRs e atendimento contínuo do
                  Consultor Digital, selecione sua modalidade na Escada de Valor.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <Button
                className="w-full sm:w-auto bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-semibold text-xs py-5 px-6 gap-2"
                onClick={() => navigate('/niveis-e-planos')}
              >
                <Sparkles className="w-4 h-4 text-[#3DDC74]" />
                <span>Contratar / Ver Planos</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto border-[#24334F] text-[#C7D0E0] hover:bg-[#111A2E] rounded-[4px] text-xs py-5"
                onClick={() => navigate('/plano-de-acao')}
              >
                Acessar Área do Assinante
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => navigate('/questionario')}
          className="border-[#24334F] text-[#C7D0E0] hover:bg-[#16213A] rounded-[4px] text-xs"
        >
          Novo Diagnóstico
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-[#8B98B4] hover:text-[#F8FAFC] hover:bg-[#16213A] rounded-[4px] text-xs"
        >
          Voltar à Tela Inicial
        </Button>
      </div>
    </div>
  )
}
