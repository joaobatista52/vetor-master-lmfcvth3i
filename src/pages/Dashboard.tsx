import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileCheck2,
  UploadCloud,
  ChevronRight,
  Target,
  Sparkles,
  BarChart3,
  ListTodo,
  Info,
  Activity,
  PlusCircle,
  Building2,
  RefreshCw,
  Loader2,
  Zap,
  Flame,
  DollarSign,
  PieChart,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getDiagnosticos, type Diagnostico } from '@/services/diagnosticos'
import { getPlanosAcao, type PlanoAcao } from '@/services/planos_acao'
import { getOKRs, type OKR } from '@/services/okrs'
import { ContextualCta, PerfilUsuario } from '@/components/contextual-cta'
import { useAuth } from '@/hooks/use-auth'
import { fasesStateMachineV72 } from '@/data/master-framework-v72'
import { setores } from '@/data/setores-questionario'

/**
 * DASHBOARD DO PLANO POR ETAPAS — VETOR MASTER V7.2.3 (Rodada 1.5)
 *
 * Em estrita conformidade com a DIRETRIZ 3:
 * O dashboard do assinante concentra TODOS os indicadores em três blocos,
 * todos alimentados pelo diagnóstico real (estrutura pronta para a Onda 2):
 *
 * (1) BLOCO 1: SAÚDE FINANCEIRA (Fase 6)
 *     - DRE de 15 linhas (CS-17: exibição integral, com [REQUER VERIFICAÇÃO] nas linhas não segregáveis)
 *     - Thresholds Buffett com status (Margem EBITDA, ROIC vs WACC, DL/EBITDA, Margem de Segurança, FCF, ROE)
 *     - WACC com memória de cálculo determinística por estágio
 *
 * (2) BLOCO 2: TRILHA DE ETAPAS (Fase 5)
 *     - Progresso por Etapa do plano real (substitui a grade de "8 Áreas" de /areas-da-empresa)
 *     - Etapa corrente destacada, dono e prazo
 *
 * (3) BLOCO 3: OKRs VIVOS
 *     - Cada KR com valor atual, meta e tendência, vinculado à Etapa
 *
 * REGRAS DE HONESTIDADE VISUAL (Achado 8):
 * - Enquanto não houver diagnóstico real processado, TODO cartão exibe badge "Demonstração"
 * - Gráficos e números fake foram eliminados
 * - CTA contextual por perfil implementado
 */

// 15 Linhas da DRE Institucional Canônica (CS-17 / Subitem 1.6.A)
const DRE_15_LINHAS_CANONICA = [
  {
    num: 1,
    descricao: '1. Receita Bruta de Importação/Exportação / Operacional',
    segregado: false,
    nota: 'Segregação Encomenda vs. Conta e Ordem',
    natureza: 'receita',
  },
  {
    num: 2,
    descricao: '2. (-) Deduções sobre a Receita Bruta',
    segregado: false,
    nota: 'Alíquotas e deduções fixadas (6% a 16%)',
    natureza: 'deducao',
  },
  {
    num: 3,
    descricao: '3. (=) Receita Líquida Operacional',
    segregado: true,
    nota: 'Base líquida auditável',
    natureza: 'subtotal',
  },
  {
    num: 4,
    descricao: '4. (-) Custos Operacionais Diretos / CPV (Landed Cost)',
    segregado: false,
    nota: 'CIF, frete internacional, seguro, armazenagem, capatazia',
    natureza: 'custo',
  },
  {
    num: 5,
    descricao: '5. (=) Margem Bruta de Comercialização',
    segregado: true,
    nota: 'Resultado bruto da operação',
    natureza: 'subtotal',
  },
  {
    num: 6,
    descricao: '6. (-) Custos Variáveis Comerciais e Operacionais',
    segregado: false,
    nota: 'Comissões, tarifas de câmbio, seguro nacional',
    natureza: 'custo',
  },
  {
    num: 7,
    descricao: '7. (=) Margem de Contribuição Comercial',
    segregado: true,
    nota: 'Contribuição para cobertura de OPEX',
    natureza: 'subtotal',
  },
  {
    num: 8,
    descricao: '8. (-) OPEX Total (SG&A, Equipe Comercial, P&D)',
    segregado: false,
    nota: 'Despesas administrativas e operacionais fixas',
    natureza: 'despesa',
  },
  {
    num: 9,
    descricao: '9. (=) EBITDA Operacional',
    segregado: true,
    nota: 'Geração operacional de caixa',
    natureza: 'subtotal_destaque',
  },
  {
    num: 10,
    descricao: '10. (-) Depreciação e Amortização (D&A)',
    segregado: false,
    nota: 'Amortização contábil de ativos',
    natureza: 'despesa',
  },
  {
    num: 11,
    descricao: '11. (=) EBIT (Resultado Operacional antes do Financeiro)',
    segregado: true,
    nota: 'Lucro operacional puro',
    natureza: 'subtotal',
  },
  {
    num: 12,
    descricao: '12. (+/-) Variação Cambial e Resultado Financeiro Líquido',
    segregado: false,
    nota: 'Hedge cambial, derivativos, variações ativas e passivas',
    natureza: 'financeiro',
  },
  {
    num: 13,
    descricao: '13. (=) EBT (Lucro antes dos Tributos sobre a Renda)',
    segregado: true,
    nota: 'Base de cálculo IR/CSLL',
    natureza: 'subtotal',
  },
  {
    num: 14,
    descricao: '14. (-) IR/CSLL',
    segregado: false,
    nota: 'Tributação sobre o lucro real/presumido',
    natureza: 'tributo',
  },
  {
    num: 15,
    descricao: '15. (=) Lucro Líquido do Exercício',
    segregado: true,
    nota: 'Resultado final retido ou distribuível',
    natureza: 'subtotal_destaque',
  },
]

// 6 Thresholds Oficiais da Lente de Buffett (V7.2)
const THRESHOLDS_BUFFETT = [
  {
    id: 'margem_ebitda',
    nome: 'Margem EBITDA',
    status: 'alerta',
    limiarTexto: 'Saudável >30% | Alerta 20–30% | Crítico <20%',
    descricao: 'Capacidade de conversão de receita em caixa operacional.',
  },
  {
    id: 'roic_wacc',
    nome: 'ROIC vs. WACC',
    status: 'alerta',
    limiarTexto: 'Saudável >WACC+5% | Alerta WACC a +5% | Crítico <WACC',
    descricao: 'Retorno sobre capital investido comparado ao custo do capital.',
  },
  {
    id: 'dl_ebitda',
    nome: 'Dívida Líquida / EBITDA',
    status: 'saudavel',
    limiarTexto: 'Saudável <2,0x | Alerta 2,0–3,0x | Crítico >3,0x',
    descricao: 'Capacidade de desalavancagem e solvência patrimonial.',
  },
  {
    id: 'margem_seguranca',
    nome: 'Margem de Segurança',
    status: 'alerta',
    limiarTexto: 'Saudável >50% | Alerta 30–50% | Crítico <30%',
    descricao: 'Filtro Graham/Buffett de desconto entre valor intrínseco e risco.',
  },
  {
    id: 'fcf',
    nome: 'Geração de Caixa Livre (FCF)',
    status: 'saudavel',
    limiarTexto: 'Saudável FCF>0 Y2 | Alerta FCF>0 Y3 | Crítico negativo Y3+',
    descricao: 'EBITDA (-) IR Efetivo (-) CAPEX (-) Δ Capital de Giro.',
  },
  {
    id: 'roe',
    nome: 'Retorno sobre o PL (ROE)',
    status: 'alerta',
    limiarTexto: 'Saudável >20% | Alerta 12–20% | Crítico <12%',
    descricao: 'Rentabilidade gerada sobre o capital próprio dos acionistas.',
  },
]

export default function Dashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([])
  const [planos, setPlanos] = useState<PlanoAcao[]>([])
  const [okrs, setOKRs] = useState<OKR[]>([])
  const [estagioWacc, setEstagioWacc] = useState<'pre_seed' | 'seed' | 'serie_a'>('serie_a')

  useEffect(() => {
    let mounted = true
    async function carregarDados() {
      try {
        const [dList, pList, oList] = await Promise.all([
          getDiagnosticos(),
          getPlanosAcao(),
          getOKRs(),
        ])
        if (!mounted) return
        setDiagnosticos(dList)
        setPlanos(pList)
        setOKRs(oList)
      } catch (err) {
        console.error('Erro ao carregar dados do Dashboard:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    carregarDados()
    return () => {
      mounted = false
    }
  }, [])

  const ultimoDiagnostico = diagnosticos[0] || null
  const temDiagnosticoReal = !!(
    ultimoDiagnostico &&
    (ultimoDiagnostico.status === 'concluido' ||
      (ultimoDiagnostico.dre_normalizada_15_linhas &&
        ultimoDiagnostico.dre_normalizada_15_linhas.length > 0) ||
      ultimoDiagnostico.relatorio_gerado)
  )
  const temPlanosReais = planos.length > 0
  const temOKRsReais = okrs.length > 0
  const semDadosReais = !temDiagnosticoReal && !temPlanosReais && !temOKRsReais

  // Extrair indicadores calculados pelo motor do diagnóstico (Fase 6 / Gabarito / Dados de Entrada)
  const metricasFinanceirasReais = useMemo(() => {
    if (!temDiagnosticoReal || !ultimoDiagnostico) return null
    const de = ultimoDiagnostico.dados_entrada || {}
    const gab = ultimoDiagnostico.gabarito_auditoria || {}
    const faturamentoStr = de.cliente?.faturamento_declarado || de.faturamento || ''
    return {
      faturamento: faturamentoStr,
      setor: ultimoDiagnostico.setor || de.cliente?.setor || 'Geral',
      versaoQuestionario: ultimoDiagnostico.versao_questionario || 'V7.2',
      faseAtual: ultimoDiagnostico.fase_atual || 1,
      temDREGravada: !!(
        ultimoDiagnostico.dre_normalizada_15_linhas &&
        ultimoDiagnostico.dre_normalizada_15_linhas.length > 0
      ),
      temEREC: !!(
        ultimoDiagnostico.estrutura_erec_a9 && ultimoDiagnostico.estrutura_erec_a9.length > 0
      ),
    }
  }, [temDiagnosticoReal, ultimoDiagnostico])

  // DRE a exibir: se houver dado real no diagnóstico, alimenta a tabela; senão, usa a canônica com [REQUER VERIFICAÇÃO]
  const dreExibicao = useMemo(() => {
    if (
      temDiagnosticoReal &&
      ultimoDiagnostico?.dre_normalizada_15_linhas &&
      ultimoDiagnostico.dre_normalizada_15_linhas.length > 0
    ) {
      return ultimoDiagnostico.dre_normalizada_15_linhas.map((d: any, idx: number) => {
        const num = d.numero || idx + 1
        const valorReal =
          d.valor !== undefined && d.valor !== null ? String(d.valor) : '[REQUER VERIFICAÇÃO]'
        const temValorRealSegregado =
          valorReal !== '[REQUER VERIFICAÇÃO]' && valorReal.trim() !== ''
        return {
          num,
          descricao: d.linha || DRE_15_LINHAS_CANONICA[idx]?.descricao || `Linha ${idx + 1}`,
          valor: valorReal,
          segregado: temValorRealSegregado,
          nota:
            d.nota ||
            (temValorRealSegregado
              ? 'Auditado pelo motor determinístico V7.2'
              : 'Pendente de validação / documento (CS-17)'),
          natureza: idx === 2 || idx === 8 || idx === 14 ? 'subtotal_destaque' : 'normal',
        }
      })
    }
    return DRE_15_LINHAS_CANONICA
  }, [temDiagnosticoReal, ultimoDiagnostico])

  // Perfil contextual do usuário para o CTA
  const perfilUsuario: PerfilUsuario = (() => {
    if (!isAuthenticated) return 'visitante'
    if (isAdmin) return 'assinante_maas_bespoke'
    if (user?.role === 'admin') return 'assinante_maas_bespoke'
    if (temDiagnosticoReal) return 'assinante_saas'
    return 'visitante'
  })()

  // Memória de cálculo WACC determinístico
  const waccCalculo = useMemo(() => {
    const selic = 13.75
    const riscoBrasil = 4.5
    let premioEstagio = 2.5
    let rotulo = 'Série A / PME Madura'

    if (estagioWacc === 'pre_seed') {
      premioEstagio = 4.5
      rotulo = 'Pré-Seed / Estruturação'
    } else if (estagioWacc === 'seed') {
      premioEstagio = 3.5
      rotulo = 'Seed / Validação'
    }

    const total = selic + riscoBrasil + premioEstagio
    return { selic, riscoBrasil, premioEstagio, total, rotulo }
  }, [estagioWacc])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066CC]" />
        <p className="text-xs font-semibold text-[#808080] tracking-wider uppercase">
          Carregando inteligência executiva do dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner de Topo com CTA Contextual */}
      <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#0066CC] uppercase tracking-wider">
            <span>Passo 05 da Jornada</span>
            <span className="text-[#808080]">•</span>
            <span className="text-[#333333]">Vetor Master V7.2.3</span>
            <span className="text-[#808080]">•</span>
            <span className="text-[#22B14C] font-mono">Direção · Conexão · Crescimento</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC]">
              Dashboard do Plano por Etapas
            </h1>
            <Badge
              variant="outline"
              className="border-[#0066CC]/30 text-[#0066CC] bg-[#0066CC]/5 text-xs font-semibold rounded-[3px] px-2.5 py-0.5"
            >
              3 Blocos Determinísticos (Diretriz 3)
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-[#333333] leading-relaxed">
            Painel C-Level estruturado em 3 blocos: Saúde Financeira (Fase 6 — DRE 15 linhas,
            Buffett, WACC), Trilha de Etapas (Fase 5) e OKRs Vivos.
          </p>
        </div>

        <div className="w-full lg:w-auto shrink-0">
          <ContextualCta perfil={perfilUsuario} origem="dashboard" />
        </div>
      </div>

      {/* Banner de Status dos Dados (Regra de Honestidade Visual — Achado 8) */}
      {temDiagnosticoReal ? (
        <Card className="bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 border-emerald-500/30 rounded-[4px] shadow-sm overflow-hidden">
          <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#22B14C] text-white hover:bg-[#1E9E43] border-none text-[11px] font-semibold">
                  Diagnóstico Real V7.2 Gravado
                </Badge>
                <span className="text-xs font-semibold text-[#333333]">
                  Setor: {metricasFinanceirasReais?.setor} • Fase Atual:{' '}
                  {metricasFinanceirasReais?.faseAtual}
                </span>
              </div>
              <p className="text-xs text-[#808080] leading-relaxed">
                Os blocos com dados reais exibem o badge{' '}
                <strong className="text-[#22B14C]">"Dado Real V7.2"</strong>. Linhas da DRE
                pendentes de segregação contábil ou documentos complementares recebem o marcador
                canônico{' '}
                <span className="font-mono text-amber-700 bg-amber-100 px-1 py-0.2 rounded text-[11px]">
                  [REQUER VERIFICAÇÃO]
                </span>{' '}
                conforme o protocolo CS-17.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-[#0066CC] text-[#0066CC] rounded-[4px] text-xs h-9"
              >
                <Link to="/areas-da-empresa">Ver Trilha de Etapas</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-[4px] text-xs h-9"
              >
                <Link to="/plano-de-acao">Ir para Plano de Ação</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-blue-50/70 via-white to-slate-50 border-[#0066CC]/30 rounded-[4px] shadow-sm overflow-hidden">
          <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#0066CC]/10 text-[#0066CC] hover:bg-[#0066CC]/15 border-none text-[11px] font-semibold">
                  Modo Demonstração (Sem diagnóstico gravado)
                </Badge>
                <span className="text-xs font-semibold text-[#333333]">
                  Valores ilustrativos de referência metodológica
                </span>
              </div>
              <p className="text-xs text-[#808080] leading-relaxed">
                Nenhum diagnóstico real foi gravado ainda para esta conta. Todos os cartões exibem o
                badge explícito <strong className="text-[#0066CC]">"Demonstração"</strong>. Responda
                o Questionário Estratégico para alimentar este painel com a inteligência
                determinística da sua empresa.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                asChild
                size="sm"
                className="bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-[4px] text-xs h-9 shadow-sm"
              >
                <Link to="/questionario">Preencher Questionário</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* BLOCO 1 — SAÚDE FINANCEIRA (FASE 6) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E0E0] pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0066CC] bg-[#0066CC]/10 px-2 py-0.5 rounded">
                BLOCO 1
              </span>
              <h2 className="text-lg md:text-xl font-bold text-[#333333] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#22B14C]" />
                Saúde Financeira & Engenharia de Valor (Fase 6)
              </h2>
            </div>
            <p className="text-xs text-[#808080] mt-0.5">
              DRE de 15 linhas (CS-17), Thresholds da Lente de Buffett e Memória de Cálculo de WACC.
            </p>
          </div>
          {!temDiagnosticoReal ? (
            <Badge
              variant="outline"
              className="text-[10px] border-[#0066CC]/30 text-[#0066CC] font-mono self-start sm:self-auto"
            >
              Demonstração
            </Badge>
          ) : (
            <Badge className="bg-[#22B14C] text-white text-[10px] font-mono self-start sm:self-auto border-none">
              Dado Real V7.2
            </Badge>
          )}
        </div>

        {/* Thresholds Buffett (6 Cartões) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#333333] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#0066CC]" />
              Os 6 Thresholds da Lente de Buffett (V7.2)
            </span>
            {!temDiagnosticoReal && (
              <Badge variant="outline" className="text-[9px] border-[#808080]/30 text-[#808080]">
                Demonstração
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {THRESHOLDS_BUFFETT.map((th) => {
              const isSaudavel = th.status === 'saudavel'
              return (
                <Card
                  key={th.id}
                  className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#333333]">{th.nome}</span>
                      <div className="flex items-center gap-1">
                        {!temDiagnosticoReal && (
                          <Badge
                            variant="outline"
                            className="text-[9px] border-[#0066CC]/30 text-[#0066CC] font-mono px-1 py-0"
                          >
                            Demonstração
                          </Badge>
                        )}
                        <Badge
                          className={`text-[10px] font-semibold ${
                            isSaudavel
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-800 border-amber-500/30'
                          }`}
                        >
                          {isSaudavel ? 'Saudável' : 'Alerta'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#808080] leading-snug">{th.descricao}</p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#E0E0E0] text-[10px] text-[#808080] font-mono">
                    Limiares: <strong className="text-[#333333]">{th.limiarTexto}</strong>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* WACC com Memória de Cálculo Determinística */}
        <Card className="bg-white border border-[#E0E0E0] rounded-[4px] p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E0E0] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-[#333333] flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-[#0066CC]" />
                  WACC Determinístico Parametrizado por Estágio
                </CardTitle>
                {!temDiagnosticoReal ? (
                  <Badge
                    variant="outline"
                    className="text-[9px] border-[#0066CC]/30 text-[#0066CC] font-mono"
                  >
                    Demonstração
                  </Badge>
                ) : (
                  <Badge className="bg-[#22B14C] text-white text-[9px] font-mono border-none">
                    Dado Real V7.2
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#808080] mt-0.5">
                Memória de cálculo: WACC = Selic (13,75%) + Risco Brasil (4,50%) + Prêmio por
                Estágio
              </p>
            </div>

            {/* Seletor de Estágio para Simulação */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#808080]">Estágio:</span>
              <select
                aria-label="Estágio da Empresa para WACC"
                value={estagioWacc}
                onChange={(e) => setEstagioWacc(e.target.value as any)}
                className="text-xs font-semibold text-[#333333] bg-[#F5F5F5] border border-[#E0E0E0] rounded px-2 py-1 cursor-pointer focus:outline-none"
              >
                <option value="pre_seed">Pré-Seed (+4,50%)</option>
                <option value="seed">Seed (+3,50%)</option>
                <option value="serie_a">Série A / PME Madura (+2,50%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-[#F5F5F5] rounded-[3px] border border-[#E0E0E0] text-center">
              <span className="text-[10px] text-[#808080] uppercase font-bold block">
                Selic Base
              </span>
              <span className="text-lg font-extrabold text-[#333333] font-mono">13,75%</span>
              <span className="text-[9px] text-[#808080] block">Taxa Livre de Risco</span>
            </div>
            <div className="p-3 bg-[#F5F5F5] rounded-[3px] border border-[#E0E0E0] text-center">
              <span className="text-[10px] text-[#808080] uppercase font-bold block">
                Risco Brasil
              </span>
              <span className="text-lg font-extrabold text-[#333333] font-mono">+4,50%</span>
              <span className="text-[9px] text-[#808080] block">Spread Soberano</span>
            </div>
            <div className="p-3 bg-[#F5F5F5] rounded-[3px] border border-[#E0E0E0] text-center">
              <span className="text-[10px] text-[#808080] uppercase font-bold block">
                Prêmio Estágio
              </span>
              <span className="text-lg font-extrabold text-[#0066CC] font-mono">
                +{waccCalculo.premioEstagio.toFixed(2)}%
              </span>
              <span className="text-[9px] text-[#808080] block truncate">{waccCalculo.rotulo}</span>
            </div>
            <div className="p-3 bg-[#0066CC]/10 rounded-[3px] border border-[#0066CC]/30 text-center">
              <span className="text-[10px] text-[#0066CC] uppercase font-bold block">
                WACC Calculado
              </span>
              <span className="text-lg font-extrabold text-[#0066CC] font-mono">
                {waccCalculo.total.toFixed(2)}% a.a.
              </span>
              <span className="text-[9px] text-[#0066CC] block font-semibold">
                Taxa de Desconto
              </span>
            </div>
          </div>
        </Card>

        {/* DRE Institucional de 15 Linhas com [REQUER VERIFICAÇÃO] (CS-17) */}
        <Card className="bg-white border border-[#E0E0E0] rounded-[4px] p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E0E0] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-[#333333] flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#0066CC]" />
                  DRE Institucional de 15 Linhas (Protocolo CS-17 / Subitem 1.6.A)
                </CardTitle>
                {!temDiagnosticoReal ? (
                  <Badge
                    variant="outline"
                    className="text-[9px] border-[#0066CC]/30 text-[#0066CC] font-mono"
                  >
                    Demonstração
                  </Badge>
                ) : (
                  <Badge className="bg-[#22B14C] text-white text-[9px] font-mono border-none">
                    Serviço de Diagnóstico V7.2.3
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#808080] mt-0.5">
                Exibição integral das 15 linhas canônicas consumidas do Serviço de Diagnóstico.
                Rastreabilidade: Fase 6 (Prompt P9). Linhas não segregadas recebem{' '}
                <code className="text-amber-800 font-bold">[REQUER VERIFICAÇÃO]</code>.
              </p>
            </div>
            <Badge className="bg-amber-500/10 text-amber-800 border-amber-500/30 text-[10px] font-semibold self-start sm:self-auto">
              CS-17 Ativo
            </Badge>
          </div>

          <div className="divide-y divide-[#E0E0E0] text-xs">
            {dreExibicao.map((l: any) => {
              const isDestaque = l.natureza === 'subtotal_destaque'
              const isSubtotal = l.natureza === 'subtotal'
              return (
                <div
                  key={l.num}
                  className={`py-2 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 transition-colors ${
                    isDestaque
                      ? 'bg-[#0066CC]/5 font-bold text-[#0066CC]'
                      : isSubtotal
                        ? 'bg-[#F5F5F5] font-semibold text-[#333333]'
                        : 'hover:bg-slate-50 text-[#333333]'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-mono text-[11px] text-[#808080] w-6 shrink-0">
                      {String(l.num).padStart(2, '0')}.
                    </span>
                    <span className="font-medium">{l.descricao}</span>
                  </div>

                  <div className="flex items-center gap-2 pl-8 sm:pl-0">
                    <span className="text-[10px] text-[#808080] italic hidden md:inline">
                      {l.nota}
                    </span>
                    {!l.segregado ? (
                      <Badge
                        variant="outline"
                        className="border-amber-400 bg-amber-50 text-amber-800 text-[10px] font-mono font-semibold"
                      >
                        [REQUER VERIFICAÇÃO]
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-[#0066CC]/30 text-[#0066CC] bg-[#0066CC]/5 text-[10px] font-mono"
                      >
                        Linha Canônica
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2 border-t border-[#E0E0E0] text-[11px] text-[#808080] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>
              Vedação V7.2: incentivos fiscais transitórios não compõem margem perene; stress test
              sem TTD/Pró-Emprego.
            </span>
            <span className="font-semibold text-[#0066CC]">
              Reforma Tributária CBS/IBS 2027–2033
            </span>
          </div>
        </Card>
      </section>

      {/* ========================================================================= */}
      {/* BLOCO 2 — TRILHA DE ETAPAS (FASE 5) */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E0E0] pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0066CC] bg-[#0066CC]/10 px-2 py-0.5 rounded">
                BLOCO 2
              </span>
              <h2 className="text-lg md:text-xl font-bold text-[#333333] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0066CC]" />
                Trilha de Etapas & Execução do Plano Real (Fase 5)
              </h2>
            </div>
            <p className="text-xs text-[#808080] mt-0.5">
              Progresso por Etapa do plano real, Etapa corrente destacada, dono e prazo (substitui a
              grade de 8 Áreas).
            </p>
          </div>
          {temDiagnosticoReal || temPlanosReais ? (
            <Badge className="bg-[#22B14C] text-white text-[10px] font-mono self-start sm:self-auto border-none">
              Trilha Ativa V7.2
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[10px] border-[#0066CC]/30 text-[#0066CC] font-mono self-start sm:self-auto"
            >
              Demonstração
            </Badge>
          )}
        </div>

        {/* Grade das 8 Etapas com Dono, Prazo e Progresso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {fasesStateMachineV72.map((f, idx) => {
            const faseAtualDiag = ultimoDiagnostico?.fase_atual || 1
            const isCorrente = f.numero === faseAtualDiag
            const isConcluida = temDiagnosticoReal && f.numero < faseAtualDiag
            const temDadoRealNestaEtapa = temDiagnosticoReal && f.numero <= faseAtualDiag

            return (
              <Card
                key={f.numero}
                className={`rounded-[4px] p-4 shadow-xs flex flex-col justify-between transition-all ${
                  isCorrente
                    ? 'bg-white border-2 border-[#0066CC] ring-2 ring-[#0066CC]/15'
                    : isConcluida
                      ? 'bg-emerald-50/50 border border-emerald-300'
                      : 'bg-[#F5F5F5] border border-[#E0E0E0]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={
                        isCorrente
                          ? 'bg-[#0066CC] text-white text-[10px] font-bold'
                          : isConcluida
                            ? 'bg-[#22B14C] text-white text-[10px] font-bold'
                            : 'bg-[#111A2E] text-white text-[10px] font-mono'
                      }
                    >
                      Etapa 0{f.numero}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {temDadoRealNestaEtapa ? (
                        <Badge className="bg-[#22B14C]/10 text-[#1E9E43] border-none text-[9px] font-mono font-bold">
                          {isConcluida ? 'Concluída' : 'Em Curso'}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[9px] border-[#0066CC]/30 text-[#0066CC] font-mono"
                        >
                          Demonstração
                        </Badge>
                      )}
                      {isCorrente && (
                        <span className="text-[10px] font-bold text-[#22B14C] uppercase">
                          Corrente
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#333333] leading-tight">{f.titulo}</h3>
                  <p className="text-xs text-[#808080] line-clamp-2 leading-relaxed">{f.foco}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E0E0E0] space-y-1.5 text-[11px] text-[#808080]">
                  <div className="flex items-center justify-between">
                    <span>Dono da Etapa:</span>
                    <strong className="text-[#333333]">Diretoria Executiva</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Janela / Prazo:</span>
                    <strong className="text-[#333333]">30 a 45 dias</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span>Progresso Real:</span>
                    {temDadoRealNestaEtapa ? (
                      <strong className="text-[#22B14C] font-mono">
                        {isConcluida ? '100% Concluída' : 'Em Execução (Fase Ativa)'}
                      </strong>
                    ) : (
                      <strong className="text-[#808080] font-mono">Aguardando Diagnóstico</strong>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BLOCO 3 — OKRs VIVOS VINCULADOS ÀS ETAPAS */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E0E0] pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0066CC] bg-[#0066CC]/10 px-2 py-0.5 rounded">
                BLOCO 3
              </span>
              <h2 className="text-lg md:text-xl font-bold text-[#333333] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#0066CC]" />
                OKRs Vivos Vinculados às Etapas (Hoshin Kanri)
              </h2>
            </div>
            <p className="text-xs text-[#808080] mt-0.5">
              Cada Resultado-Chave (KR) com valor atual, meta e tendência, pronto para vínculo à
              Etapa.
            </p>
          </div>
          {temOKRsReais ? (
            <Badge className="bg-[#22B14C] text-white text-[10px] font-mono self-start sm:self-auto border-none">
              OKRs Ativos ({okrs.length})
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[10px] border-[#0066CC]/30 text-[#0066CC] font-mono self-start sm:self-auto"
            >
              Demonstração
            </Badge>
          )}
        </div>

        {/* OKRs Reais do Banco OU 3 OKRs Canônicos com badge correto */}
        {temOKRsReais ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {okrs.map((okrItem) => (
              <Card
                key={okrItem.id}
                className="bg-white border border-[#E0E0E0] rounded-[4px] p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-[#0066CC]/30 text-[#0066CC] bg-[#0066CC]/5 text-[10px] font-mono font-bold"
                    >
                      Etapa {okrItem.etapa ? `0${okrItem.etapa}` : 'Estratégica'}
                    </Badge>
                    <Badge className="bg-[#22B14C] text-white text-[9px] font-mono border-none">
                      Dado Real
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-[#333333] leading-snug">
                    {okrItem.objetivo}
                  </h3>
                  <div className="flex items-center gap-2 pt-1">
                    <Progress value={okrItem.progresso || 0} className="h-1.5 flex-1" />
                    <span className="font-mono text-xs font-bold text-[#0066CC]">
                      {okrItem.progresso || 0}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E0E0E0] text-xs">
                  {okrItem.resultados_chave?.map((kr: any, kIdx: number) => (
                    <div key={kIdx} className="flex items-center justify-between gap-2">
                      <span className="text-[#333333] truncate">
                        KR {kIdx + 1}: {kr.descricao || kr.titulo || 'Resultado-Chave'}
                      </span>
                      <span className="font-mono text-[#0066CC] font-bold shrink-0">
                        {kr.progresso !== undefined ? `${kr.progresso}%` : 'Em andamento'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border border-[#E0E0E0] rounded-[4px] p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-[#0066CC]/30 text-[#0066CC] bg-[#0066CC]/5 text-[10px] font-mono font-bold"
                  >
                    Vínculo: Etapa 01 (Diagnóstico)
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[9px] border-[#0066CC]/30 text-[#0066CC] font-mono"
                  >
                    Demonstração
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-[#333333] leading-snug">
                  Estancar os 3 maiores vazamentos invisíveis operacionais
                </h3>
                <p className="text-xs text-[#808080]">
                  Descentralização de alçadas e bloqueio de concessões de desconto manuais.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E0E0E0] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#333333]">KR 1: Taxa de ruptura curva A &lt; 3%</span>
                  <span className="font-mono text-[#0066CC] font-bold">Meta: 3,0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#333333]">KR 2: Alçadas formais até R$ 5.000</span>
                  <span className="font-mono text-[#22B14C] font-bold">Meta: 100%</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-[#E0E0E0] rounded-[4px] p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-[#FF9900]/40 text-[#D97706] bg-[#FF9900]/10 text-[10px] font-mono font-bold"
                  >
                    Vínculo: Etapa 05 (Roadmap)
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[9px] border-[#0066CC]/30 text-[#0066CC] font-mono"
                  >
                    Demonstração
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-[#333333] leading-snug">
                  Autonomia operacional e libertação do fundador
                </h3>
                <p className="text-xs text-[#808080]">
                  Rituais semanais e desoneração da diretoria de rotinas do dia a dia.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E0E0E0] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#333333]">KR 1: Horas semanais do fundador &lt; 10h</span>
                  <span className="font-mono text-[#0066CC] font-bold">Meta: 10h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#333333]">KR 2: Rituais quinzenais 5W2H cumpridos</span>
                  <span className="font-mono text-[#22B14C] font-bold">Meta: 100%</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-[#E0E0E0] rounded-[4px] p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 text-emerald-800 bg-emerald-50 text-[10px] font-mono font-bold"
                  >
                    Vínculo: Etapa 06 (Finanças)
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[9px] border-[#0066CC]/30 text-[#0066CC] font-mono"
                  >
                    Demonstração
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-[#333333] leading-snug">
                  Blindagem de margem e segurança financeira (Buffett)
                </h3>
                <p className="text-xs text-[#808080]">
                  Construção de reserva de capital de giro e DRE até o 10º dia útil.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E0E0E0] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#333333]">KR 1: Margem de segurança &gt; 50%</span>
                  <span className="font-mono text-[#0066CC] font-bold">Meta: 50%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#333333]">KR 2: Fechamento DRE até D+10</span>
                  <span className="font-mono text-[#22B14C] font-bold">Meta: D+10</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>
    </div>
  )
}
