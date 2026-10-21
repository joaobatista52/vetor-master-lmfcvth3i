import { useState, useEffect } from 'react'
import {
  Trophy,
  TrendingUp,
  Target,
  CheckCircle2,
  Lock,
  FileText,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Compass,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SimpleMarkdown } from '@/components/simple-markdown'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { ContextualCta, PerfilUsuario } from '@/components/contextual-cta'
import { useAuth } from '@/hooks/use-auth'
import { getLatestDiagnostico, type Diagnostico } from '@/services/diagnosticos'
import { fasesStateMachineV72 } from '@/data/master-framework-v72'

/**
 * PÁGINA RESULTADOS E DEVOLUTIVA EXECUTIVA (V7.2.3 — Rodada 1.5)
 *
 * Correções canônicas:
 * 1. Unidade canônica: ETAPAS / FASES (paridade total com o site institucional, fonte de verdade).
 *    Eliminada a dupla grade divergente de 8 ("Heat Map das 8 Áreas" × "As 8 Fases da Metodologia").
 * 2. Gráfico de evolução anterior (evolutionData fake hardcoded: Jan 35, Fev 42...) foi removido.
 *    Sem dados reais, exibe estado honesto de evolução por Etapas com badge "Demonstração".
 * 3. CTAs contextuais por perfil (visitante / lead com diagnóstico pronto / assinante SaaS / assinante MaaS-Bespoke):
 *    - Lead: "Agendar minha Devolutiva Executiva" (nunca "fazer outro diagnóstico").
 *    - Assinante: "Atualizar Diagnóstico" levando ao histórico de diagnósticos.
 * 4. Badge "Demonstração" explícito em todo cartão que exiba estrutura sem dados do banco.
 * 5. Isca gratuita (relatório gerado pelo hook legado) sinalizada como demonstração até a Onda 2.
 */
export default function Resultados() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const d = await getLatestDiagnostico()
        if (cancelled) return
        setDiagnostico(d)
      } catch (err) {
        console.error('Erro ao buscar último diagnóstico:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Determinar perfil contextual
  const perfilUsuario: PerfilUsuario = (() => {
    if (!isAuthenticated) return 'visitante'
    if (isAdmin) return 'assinante_maas_bespoke'
    // Se o usuário já possui perfil de assinante ou diagnóstico salvo
    if (user?.role === 'admin') return 'assinante_maas_bespoke'
    if (diagnostico) return 'lead'
    return 'visitante'
  })()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground text-sm font-medium">Carregando diagnóstico...</p>
      </div>
    )
  }

  // =========================================================================
  // CENÁRIO 1: SEM DIAGNÓSTICO PROCESSADO (Estado Vazio Honesto por ETAPAS)
  // =========================================================================
  if (!diagnostico) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Banner de Topo com CTA Contextual */}
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
              Acompanhe sua jornada rumo a uma empresa autogerenciável pautada pela sequência
              canônica de Etapas.
            </p>
          </div>

          <ContextualCta perfil={perfilUsuario} origem="resultados" />
        </div>

        {/* Trilha Canônica de Etapas (substitui a dupla grade divergente) */}
        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-[#333333]">
                <Layers className="w-5 h-5 text-[#0066CC]" />
                Trilha de Etapas da Metodologia Vetor Master V7.2
              </CardTitle>
              <CardDescription className="text-xs text-[#808080]">
                Unidade canônica em paridade com o site institucional. Submeta seu questionário
                setorial para preencher a pontuação de cada etapa com dados reais.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-[#0066CC]/30 bg-[#0066CC]/5 text-[#0066CC] text-[10px] font-semibold shrink-0"
            >
              Demonstração Estrutural
            </Badge>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {fasesStateMachineV72.map((f) => (
                <div
                  key={f.numero}
                  className="border border-[#E0E0E0] rounded-[4px] p-3.5 bg-white space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] text-[#0066CC] border-[#0066CC]/30 font-semibold bg-[#0066CC]/5"
                      >
                        Etapa 0{f.numero}
                      </Badge>
                      <span className="text-[10px] text-[#808080] font-mono">— Aguardando</span>
                    </div>
                    <p className="font-semibold text-xs text-[#333333] leading-snug">{f.titulo}</p>
                    <p className="text-[11px] text-[#808080] mt-1 line-clamp-2">{f.foco}</p>
                  </div>
                  <div className="pt-2 border-t border-[#E0E0E0] flex items-center justify-between text-[10px] text-[#808080]">
                    <span className="truncate">Portão P{f.numero}</span>
                    <span className="text-[#0066CC] font-semibold">0%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evolução Histórica (Estado Honesto — fim do evolutionData fake) */}
        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-[#333333]">
                <TrendingUp className="w-5 h-5 text-[#0066CC]" />
                Evolução Temporal do Score de Liberdade
              </CardTitle>
              <CardDescription className="text-xs text-[#808080]">
                Curva de maturidade calculada a partir de diagnósticos e checkpoints mensais
                sucessivos.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-[#0066CC]/30 bg-[#0066CC]/5 text-[#0066CC] text-[10px] font-semibold"
            >
              Demonstração
            </Badge>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-2 bg-white rounded-b-[4px] border-t border-[#E0E0E0] m-5 mt-0">
            <Info className="w-6 h-6 text-[#0066CC] mx-auto opacity-70" />
            <p className="text-xs font-semibold text-[#333333]">
              Nenhum histórico temporal acumulado ainda
            </p>
            <p className="text-[11px] text-[#808080] max-w-md mx-auto leading-relaxed">
              Em conformidade com a Rodada 1.5, gráficos com valores fictícios foram removidos. A
              série histórica será traçada a cada novo checkpoint ou atualização diagnóstica.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // =========================================================================
  // CENÁRIO 2: COM DIAGNÓSTICO PROCESSADO
  // =========================================================================
  const temRelatorio = !!diagnostico.relatorio_gerado

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de Topo com CTA Contextual */}
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
            Análise determinística e identificação dos vazamentos operacionais por Etapa
          </p>
        </div>

        <ContextualCta perfil={perfilUsuario} origem="resultados" />
      </div>

      {/* Trilha Canônica de Etapas da Metodologia */}
      <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
        <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-[#333333]">
              <Layers className="w-5 h-5 text-[#0066CC]" />
              Trilha de Etapas Metodológicas (V7.2)
            </CardTitle>
            <CardDescription className="text-xs text-[#808080]">
              Sequência canônica de implementação do protocolo JBP Gestão Master.
            </CardDescription>
          </div>
          <Badge className="bg-[#5B9DFF]/10 text-[#0066CC] border-[#0066CC]/30 text-[10px] font-semibold">
            Demonstração Estrutural
          </Badge>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {fasesStateMachineV72.map((f) => (
              <div
                key={f.numero}
                className="border border-[#E0E0E0] rounded-[4px] p-3.5 bg-white space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] text-[#0066CC] border-[#0066CC]/30 font-semibold bg-[#0066CC]/5"
                    >
                      Etapa 0{f.numero}
                    </Badge>
                    <span className="text-[10px] text-[#22B14C] font-semibold">Mapeada</span>
                  </div>
                  <p className="font-semibold text-xs text-[#333333] leading-snug">{f.titulo}</p>
                  <p className="text-[11px] text-[#808080] mt-1 line-clamp-2">{f.foco}</p>
                </div>
                <div className="pt-2 border-t border-[#E0E0E0] flex items-center justify-between text-[10px] text-[#808080]">
                  <span className="truncate">Portão P{f.numero}</span>
                  <span className="text-[#0066CC] font-semibold">CS-{f.numero}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Relatório gratuito (isca) — com badge Demonstração explícito (Achado 9) */}
      {temRelatorio && (
        <Card className="shadow-sm border-[#E0E0E0]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Diagnóstico Executivo (Resumo Inicial)
              </CardTitle>
              <CardDescription>
                Análise gratuita das vulnerabilidades identificadas no questionário.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-amber-400/50 bg-amber-50 text-amber-800 text-[10px] font-semibold"
            >
              Demonstração (Motor V7.2 em acoplamento na Onda 2)
            </Badge>
          </CardHeader>
          <CardContent>
            <SimpleMarkdown content={diagnostico.relatorio_gerado} />
          </CardContent>
        </Card>
      )}

      {/* Solução completa — paywall */}
      <SubscriptionGuard>
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Solução Completa V7.2
              </CardTitle>
              <CardDescription>Conteúdo premium desbloqueado para assinantes.</CardDescription>
            </div>
            <Badge className="bg-[#5B9DFF]/10 text-[#0066CC] border-[#0066CC]/30 text-[10px] font-semibold">
              Demonstração
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <p className="font-medium text-sm">Diagnóstico completo das 8 Etapas</p>
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
                  DRE 15 linhas, Fluxo de Caixa, Valuation, thresholds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </SubscriptionGuard>
    </div>
  )
}
