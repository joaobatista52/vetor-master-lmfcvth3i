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
import {
  getDashboardConfigDoSetor,
  type IndicadorSetorial,
  type StatusIndicador,
} from '@/services/dashboard-setorial'
import { setores } from '@/data/setores-questionario'

// Identidade visual oficial Vetor Master V7.2
// Azul Estratégico: #0066CC
// Verde Crescimento: #22B14C
// Laranja Atenção / Conexão: #FF9900
// Cinza / Chumbo Executivo: #333333

const STATUS_BADGE_STYLE: Record<
  StatusIndicador,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  saudavel: {
    label: 'Saudável',
    bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    text: 'text-emerald-700',
    border: 'border-emerald-500/30',
    icon: CheckCircle2,
  },
  atencao: {
    label: 'Em Atenção',
    bg: 'bg-[#FF9900]/10 text-[#D97706] dark:text-[#FBBF24]',
    text: 'text-[#D97706]',
    border: 'border-[#FF9900]/30',
    icon: AlertTriangle,
  },
  critico: {
    label: 'Crítico',
    bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    text: 'text-rose-700',
    border: 'border-rose-500/30',
    icon: Flame,
  },
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([])
  const [planos, setPlanos] = useState<PlanoAcao[]>([])
  const [okrs, setOKRs] = useState<OKR[]>([])
  const [selectedSetorSlug, setSelectedSetorSlug] = useState<string>('')

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

        // Setor inicial a partir do último diagnóstico, se houver
        if (dList.length > 0) {
          const ultimo = dList[0]
          const slug =
            ultimo.setor || ultimo.dados_entrada?.setor_slug || ultimo.dados_entrada?.setor_id
          if (slug) {
            setSelectedSetorSlug(slug)
          }
        }
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
  const setorAtivoSlug = selectedSetorSlug || ultimoDiagnostico?.setor || 'varejo'
  const setorConfig = useMemo(() => getDashboardConfigDoSetor(setorAtivoSlug), [setorAtivoSlug])

  // Metadados do cliente e do diagnóstico
  const nomeEmpresa =
    ultimoDiagnostico?.dados_entrada?.empresa?.['Razão Social'] ||
    ultimoDiagnostico?.dados_entrada?.empresa?.['Nome Fantasia'] ||
    'Sua Empresa'
  const segmentoEmpresa = ultimoDiagnostico?.dados_entrada?.empresa?.segmento || setorConfig.nome

  // Indicadores consolidados (extraídos de dados_entrada se houver, ou configurados por setor)
  const indicadores: IndicadorSetorial[] = useMemo(() => {
    return setorConfig.indicadoresPadrao
  }, [setorConfig])

  // Métricas do Plano de Ação
  // Se houver planos reais no banco, consolidar; se não, usar modelo estruturado da V7.2
  const tarefasConsolidadas = useMemo(() => {
    if (planos.length > 0) {
      return planos.flatMap((p) => p.tarefas_5w2h || [])
    }
    // Mock estruturado representativo da V7.2 para clientes sem plano gravado
    return [
      {
        what: 'Parametrização do Ponto de Pedido Automático e Trava de Ruptura',
        why: 'Eliminar 100% da perda de vendas por falta de itens curva A nas lojas',
        where: 'Sistemas ERP / Central de Compras',
        when: 'Curto Prazo (30 dias)',
        who: 'Coordenador de Suprimentos / TI',
        how: 'Integrar lead time dos 10 maiores fornecedores à curva ABC semanal',
        howMuch: 'R$ 4.500 (desenvolvimento de API)',
        status: 'Concluído',
      },
      {
        what: 'Implantação da Matriz de Delegação e Alçadas de Desconto',
        why: 'Libertar 15h semanais do fundador de aprovações de tíquete médio',
        where: 'Todas as unidades operacionais',
        when: 'Curto Prazo (45 dias)',
        who: 'Gerente Geral / RH',
        how: 'Criar tabela fixa de limites de margem para gerentes de ponta',
        howMuch: 'Sem custo adicional direto',
        status: 'Em Progresso',
      },
      {
        what: 'Auditoria e Régua Automatizada de Cobrança de Inadimplentes',
        why: 'Reduzir prazo médio de recebimento de 48 para 26 dias',
        where: 'Departamento Financeiro',
        when: 'Médio Prazo (90 dias)',
        who: 'Controller Financeiro',
        how: 'Disparos multicanal (WhatsApp/Email/SMS) com réguas de D-3 até D+60',
        howMuch: 'R$ 1.800/mês',
        status: 'Em Progresso',
      },
      {
        what: 'Implementação de Comitê de Gestão Quinzenal com OKRs',
        why: 'Fechar o abismo entre diretrizes da diretoria e execução na ponta',
        where: 'Sala de Governança / Remoto',
        when: 'Médio Prazo (90 dias)',
        who: 'CEO + Líderes de Área',
        how: 'Ritual fixo de 90min a cada 15 dias com revisão de KPIs e travas',
        howMuch: 'R$ 0 (disciplina de gestão)',
        status: 'A Fazer',
      },
      {
        what: 'Transição da Margem Bruta para Lógica de Valor (Reforma Tributária)',
        why: 'Blindar margem líquida contra o fim de benefícios estaduais 2027-2033',
        where: 'Diretoria Estratégica / Tributário',
        when: 'Longo Prazo (180 dias)',
        who: 'CFO / Consultoria Especializada',
        how: 'Reprecificação determinística e simulação de impactos CBS/IBS',
        howMuch: 'R$ 18.000',
        status: 'A Fazer',
      },
    ]
  }, [planos])

  // Distribuição de status do plano
  const statusCounts = useMemo(() => {
    let aFazer = 0
    let emProgresso = 0
    let concluido = 0

    tarefasConsolidadas.forEach((t: any) => {
      const st = (t.status || 'A Fazer').toLowerCase()
      if (st.includes('concl') || st.includes('done')) concluido++
      else if (st.includes('progr') || st.includes('andamento') || st.includes('doing'))
        emProgresso++
      else aFazer++
    })

    const total = tarefasConsolidadas.length
    const pctConcluido = total > 0 ? Math.round((concluido / total) * 100) : 0

    return { aFazer, emProgresso, concluido, total, pctConcluido }
  }, [tarefasConsolidadas])

  // Distribuição por horizontes (Curto, Médio, Longo Prazo)
  const horizonteData = useMemo(() => {
    const curto = { total: 0, concluidas: 0 }
    const medio = { total: 0, concluidas: 0 }
    const longo = { total: 0, concluidas: 0 }

    tarefasConsolidadas.forEach((t: any) => {
      const w = (t.when || '').toLowerCase()
      const isDone = (t.status || '').toLowerCase().includes('concl')

      if (w.includes('curto') || w.includes('30') || w.includes('45') || w.includes('60')) {
        curto.total++
        if (isDone) curto.concluidas++
      } else if (
        w.includes('longo') ||
        w.includes('180') ||
        w.includes('360') ||
        w.includes('ano')
      ) {
        longo.total++
        if (isDone) longo.concluidas++
      } else {
        medio.total++
        if (isDone) medio.concluidas++
      }
    })

    return {
      curto: {
        ...curto,
        pct: curto.total > 0 ? Math.round((curto.concluidas / curto.total) * 100) : 0,
      },
      medio: {
        ...medio,
        pct: medio.total > 0 ? Math.round((medio.concluidas / medio.total) * 100) : 0,
      },
      longo: {
        ...longo,
        pct: longo.total > 0 ? Math.round((longo.concluidas / longo.total) * 100) : 0,
      },
    }
  }, [tarefasConsolidadas])

  // OKRs consolidados
  const okrsConsolidados = useMemo(() => {
    if (okrs.length > 0) return okrs
    return [
      {
        id: 'mock-1',
        user: '',
        objetivo: 'Estancar os vazamentos invisíveis operacionais e de estoque',
        progresso: 68,
        resultados_chave: [
          { descricao: 'Reduzir taxa de ruptura dos 10 maiores itens para < 3%', progresso: 75 },
          { descricao: 'Elevar o giro de estoque anual de 3.1x para 5.5x', progresso: 60 },
          { descricao: 'Recuperar R$ 85k em perdas operacionais acumuladas', progresso: 70 },
        ],
        created: '',
        updated: '',
      },
      {
        id: 'mock-2',
        user: '',
        objetivo: 'Instituir autonomia operacional e libertar o fundador da rotina diária',
        progresso: 52,
        resultados_chave: [
          { descricao: 'Descentralizar 100% das concessões de desconto sob alçada', progresso: 80 },
          {
            descricao: 'Reduzir horas semanais do fundador na operação de 38h para < 10h',
            progresso: 45,
          },
          {
            descricao: 'Implantar comitê quinzenal de gestão com indicadores padronizados',
            progresso: 30,
          },
        ],
        created: '',
        updated: '',
      },
      {
        id: 'mock-3',
        user: '',
        objetivo: 'Blindagem de margem e segurança financeira (Lente de Buffett)',
        progresso: 40,
        resultados_chave: [
          {
            descricao: 'Construir reserva de capital de giro equivalente a 3 meses de despesas',
            progresso: 50,
          },
          { descricao: 'Reduzir inadimplência acima de 30 dias para < 3.5%', progresso: 30 },
        ],
        created: '',
        updated: '',
      },
    ]
  }, [okrs])

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

  // Estado vazio: nenhum diagnóstico cadastrado ainda
  const semDados = diagnosticos.length === 0 && planos.length === 0

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Banner de Topo Executivo — Alinhado à identidade Vetor Master V7.2 */}
      <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#0066CC] uppercase tracking-wider">
            <span>Passo 05 da Jornada</span>
            <span className="text-[#808080]">•</span>
            <span className="text-[#333333]">Vetor Master V7.2</span>
            <span className="text-[#808080]">•</span>
            <span className="text-[#22B14C] font-mono">Direção · Conexão · Crescimento</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC]">
              Dashboard Executivo Integrado
            </h1>
            <Badge
              variant="outline"
              className="border-[#0066CC]/30 text-[#0066CC] bg-[#0066CC]/5 text-xs font-semibold rounded-[3px] px-2.5 py-0.5"
            >
              Inteligência Estratégica Determinística
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-[#333333] leading-relaxed">
            Painel de controle C-Level para monitoramento simultâneo do desempenho do negócio por
            setor e da velocidade de execução do plano de ação estratégico.
          </p>
        </div>

        {/* Seletor dinâmico de setor para auditoria & ações rápidas */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
          <div className="flex items-center gap-2 bg-white border border-[#E0E0E0] rounded-[4px] px-3 py-1.5 shadow-xs">
            <Building2 className="w-4 h-4 text-[#0066CC] shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-bold text-[#808080] tracking-wider">
                Setor do Diagnóstico
              </span>
              <select
                aria-label="Setor do Diagnóstico"
                value={setorAtivoSlug}
                onChange={(e) => setSelectedSetorSlug(e.target.value)}
                className="text-xs font-semibold text-[#333333] bg-transparent focus:outline-none cursor-pointer pr-4"
              >
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            asChild
            className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs font-medium shadow-sm gap-1.5 h-10"
          >
            <Link to="/questionario">
              <Activity className="w-3.5 h-3.5" />
              Atualizar Diagnóstico
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerta de Estado Vazio Elegante (sem quebrar a tela) */}
      {semDados && (
        <Card className="bg-gradient-to-r from-blue-50/70 via-white to-slate-50 border-[#0066CC]/30 rounded-[4px] shadow-sm overflow-hidden">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#0066CC] animate-pulse" />
                <Badge className="bg-[#0066CC]/10 text-[#0066CC] hover:bg-[#0066CC]/15 border-none text-[11px] font-semibold">
                  Ambiente Pré-Diagnóstico
                </Badge>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#333333]">
                Você está visualizando a demonstração parametrizada para {setorConfig.nome}
              </h3>
              <p className="text-xs md:text-sm text-[#808080] leading-relaxed">
                Nenhum diagnóstico setorial foi submetido ainda nesta conta. Os cartões e planos
                abaixo refletem o referencial determinístico do seu setor. Preencha o questionário
                oficial dos 12 setores para carregar as métricas reais da sua empresa.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2 shrink-0 w-full md:w-auto">
              <Button
                asChild
                className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs font-semibold gap-2 shadow-sm"
              >
                <Link to="/questionario">
                  <Sparkles className="w-4 h-4" /> Realizar Diagnóstico Agora
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#E0E0E0] text-[#333333] hover:bg-slate-100 rounded-[4px] text-xs"
              >
                <Link to="/plano-de-acao">Ver Metodologia 5W2H</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegação Principal em 2 Abas Oficiais */}
      <Tabs defaultValue="desempenho" className="space-y-6">
        <TabsList className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-1 grid grid-cols-2 max-w-xl h-auto">
          <TabsTrigger
            value="desempenho"
            className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white rounded-[3px] text-xs md:text-sm font-semibold py-2.5 transition-all flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Aba 1 — Desempenho do Negócio</span>
          </TabsTrigger>
          <TabsTrigger
            value="plano"
            className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white rounded-[3px] text-xs md:text-sm font-semibold py-2.5 transition-all flex items-center justify-center gap-2"
          >
            <ListTodo className="w-4 h-4" />
            <span>Aba 2 — Evolução do Plano de Ação</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* ABA 1 — DESEMPENHO DO NEGÓCIO */}
        {/* ========================================================= */}
        <TabsContent value="desempenho" className="space-y-6 mt-0">
          {/* Aviso discreto sobre dados auto-declarados & importância documental */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-[4px] p-3.5 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 text-[#FF9900] shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="leading-relaxed">
                <span className="font-semibold text-amber-950 dark:text-amber-100">
                  Aviso de Acurácia:
                </span>{' '}
                Os indicadores abaixo são provenientes de questionário auto-declarado. Para
                validação de auditoria C-Level com precisão determinística, anexe os demonstrativos
                financeiros oficiais (DRE, Balancete e Relatório de Fechamento).
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-white/80 dark:bg-zinc-900 border-amber-400/50 hover:bg-white text-amber-900 dark:text-amber-200 text-[11px] font-semibold shrink-0 h-7 rounded-[3px]"
              >
                <Link to="/modelos" className="flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-[#FF9900]" />
                  Anexar Documentos
                </Link>
              </Button>
            </div>
          </div>

          {/* Cartões de Destaque com Principais Indicadores Setoriais */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#0066CC]" />
                  Indicadores Determinísticos do Diagnóstico · Setor {setorConfig.nome}
                </h3>
                <p className="text-xs text-[#808080]">
                  Gargalos quantificados e limiares de segurança operacional para a sua atividade.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-[#808080]">
                {indicadores.length} Métricas Críticas
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {indicadores.map((ind) => {
                const cfg = STATUS_BADGE_STYLE[ind.status]
                const IconStatus = cfg.icon

                return (
                  <Card
                    key={ind.id}
                    className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] shadow-sm hover:border-[#0066CC] hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div
                      className={`h-1 w-full ${
                        ind.status === 'saudavel'
                          ? 'bg-[#22B14C]'
                          : ind.status === 'atencao'
                            ? 'bg-[#FF9900]'
                            : 'bg-rose-500'
                      }`}
                    />
                    <CardHeader className="p-4 pb-2 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-[#808080] tracking-wider truncate">
                          {ind.label}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-[3px] border ${cfg.bg} ${cfg.border} flex items-center gap-1 shrink-0`}
                        >
                          <IconStatus className="w-3 h-3" />
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-2xl md:text-3xl font-extrabold text-[#333333] tracking-tight">
                          {ind.valor}
                        </span>
                        {ind.meta && (
                          <span className="text-[11px] text-[#808080] font-mono">
                            Meta: <strong className="text-[#333333]">{ind.meta}</strong>
                          </span>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-0 space-y-2.5">
                      <p className="text-xs text-[#808080] leading-snug line-clamp-2">
                        {ind.descricao}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#E0E0E0] text-[10px] text-[#808080]">
                        <span className="flex items-center gap-1 font-medium">
                          {ind.tendencia === 'up' && (
                            <span className="text-rose-600 flex items-center">
                              <ArrowUpRight className="w-3 h-3" /> Tendência alta
                            </span>
                          )}
                          {ind.tendencia === 'down' && (
                            <span className="text-[#0066CC] flex items-center">
                              <ArrowDownRight className="w-3 h-3" /> Tendência baixa
                            </span>
                          )}
                          {ind.tendencia === 'stable' && (
                            <span className="text-[#808080] flex items-center">
                              <Minus className="w-3 h-3" /> Estável
                            </span>
                          )}
                        </span>
                        {ind.autoDeclarado && (
                          <span className="italic text-[#808080]">Auto-declarado</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Mapa de Prioridades: Gargalos & Micro-Epifanias de Maior Impacto */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1 & 2: Gargalos e Prioridades Estratégicas */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF9900]" />
                    Mapa de Prioridades · Gargalos de Maior Impacto Financeiro
                  </h3>
                  <p className="text-xs text-[#808080]">
                    Priorização determinística dos vazamentos que exigem intervenção imediata.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {setorConfig.gargalosTipicos.map((gargalo, idx) => (
                  <Card
                    key={idx}
                    className="bg-white border border-[#E0E0E0] rounded-[4px] shadow-xs hover:border-[#0066CC] transition-all p-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0066CC]/10 text-[#0066CC] text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-[#333333]">{gargalo.titulo}</h4>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold rounded-[3px] ${
                          gargalo.severidade === 'critico'
                            ? 'border-rose-400 bg-rose-50 text-rose-700'
                            : 'border-[#FF9900]/40 bg-amber-50 text-amber-800'
                        }`}
                      >
                        {gargalo.pilar}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#E0E0E0]">
                      <div>
                        <span className="text-[10px] font-bold text-[#808080] uppercase tracking-wider block">
                          Impacto Mensurado
                        </span>
                        <p className="text-xs font-semibold text-rose-600 mt-0.5">
                          {gargalo.impactoEstimado}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#808080] uppercase tracking-wider block">
                          Ação Recomendada (V7.2)
                        </span>
                        <p className="text-xs text-[#333333] mt-0.5">{gargalo.acaoRecomendada}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Coluna 3: Micro-Epifanias Gatilho do Setor (Contexto V7.2) */}
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#0066CC]" />
                  Micro-Epifanias Gatilho
                </h3>
                <p className="text-xs text-[#808080]">
                  Gatilhos proprietários V7.2 para quebra de inércia da liderança.
                </p>
              </div>

              <Card className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-4 shadow-sm space-y-3">
                <div className="space-y-2.5">
                  {setorConfig.microEpifanias.map((m, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#E0E0E0] rounded-[4px] p-3 flex items-start gap-2.5 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC] mt-1.5 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#333333]">{m}</p>
                        <p className="text-[11px] text-[#808080] leading-tight">
                          Ponto de alavancagem para transformar ineficiência oculta em caixa livre.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0066CC]/5 border border-[#0066CC]/20 rounded-[4px] p-3 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066CC] block">
                    Diretriz Determinística
                  </span>
                  <p className="text-xs text-[#333333] leading-relaxed">
                    Identificar a causa raiz antes de alocar capital. 80% das empresas sofrem do
                    mesmo vazamento setorial há mais de 18 meses sem percepção contábil.
                  </p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white rounded-[4px] text-xs font-semibold h-9"
                >
                  <Link to="/resultados" className="flex items-center justify-center gap-1.5">
                    Ver Relatório Completo das 8 Áreas
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* ABA 2 — EVOLUÇÃO DO PLANO DE AÇÃO */}
        {/* ========================================================= */}
        <TabsContent value="plano" className="space-y-6 mt-0">
          {/* Card Resumo do Progresso Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#808080] tracking-wider">
                Progresso Geral do Plano
              </span>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#0066CC]">
                  {statusCounts.pctConcluido}%
                </span>
                <span className="text-xs text-[#808080] font-mono">
                  {statusCounts.concluido} de {statusCounts.total} iniciativas
                </span>
              </div>
              <Progress value={statusCounts.pctConcluido} className="h-2 rounded-[2px]" />
            </Card>

            <Card className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#808080] tracking-wider">
                Ações Concluídas
              </span>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#22B14C]">
                  {statusCounts.concluido}
                </span>
                <Badge
                  variant="outline"
                  className="border-[#22B14C]/30 text-[#22B14C] bg-[#22B14C]/10 text-[10px] font-semibold"
                >
                  Finalizadas
                </Badge>
              </div>
              <p className="text-[11px] text-[#808080]">Entregas com impacto validado</p>
            </Card>

            <Card className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#808080] tracking-wider">
                Em Andamento
              </span>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#FF9900]">
                  {statusCounts.emProgresso}
                </span>
                <Badge
                  variant="outline"
                  className="border-[#FF9900]/30 text-[#FF9900] bg-[#FF9900]/10 text-[10px] font-semibold"
                >
                  Na Cadência
                </Badge>
              </div>
              <p className="text-[11px] text-[#808080]">Em execução nos 30–60 dias</p>
            </Card>

            <Card className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#808080] tracking-wider">
                Backlog / A Fazer
              </span>
              <div className="my-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#333333]">
                  {statusCounts.aFazer}
                </span>
                <Badge variant="outline" className="text-[10px] text-[#808080] font-semibold">
                  Mapeadas
                </Badge>
              </div>
              <p className="text-[11px] text-[#808080]">Aguardando horizontes futuros</p>
            </Card>
          </div>

          {/* Seção Central: Horizontes de Prazo & Próximo Marco/Ritual */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1 e 2: Avanço por Horizonte (Curto, Médio e Longo Prazo) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0066CC]" />
                    Avanço por Horizonte de Execução (Regra Camaleão V7.2)
                  </h3>
                  <p className="text-xs text-[#808080]">
                    Desdobramento temporal das iniciativas para equilibrar quick wins e
                    transformação estrutural.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Curto Prazo */}
                <Card className="bg-white border border-[#E0E0E0] rounded-[4px] p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#0066CC] text-white text-[10px] font-bold rounded-[3px]">
                      Curto Prazo
                    </Badge>
                    <span className="text-[11px] font-mono text-[#808080]">0 a 45 dias</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-[#333333]">Quick Wins</span>
                      <span className="text-xs font-bold text-[#0066CC]">
                        {horizonteData.curto.pct}%
                      </span>
                    </div>
                    <Progress value={horizonteData.curto.pct} className="h-2 rounded-[2px]" />
                  </div>
                  <div className="text-[11px] text-[#808080] space-y-1 pt-1 border-t border-[#E0E0E0]">
                    <p>
                      <strong>{horizonteData.curto.concluidas}</strong> de{' '}
                      <strong>{horizonteData.curto.total}</strong> tarefas concluídas
                    </p>
                    <p className="text-[10px] text-[#22B14C] font-medium">
                      Foco: Estancar vazamentos imediatos
                    </p>
                  </div>
                </Card>

                {/* Médio Prazo */}
                <Card className="bg-white border border-[#E0E0E0] rounded-[4px] p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#FF9900] text-white text-[10px] font-bold rounded-[3px]">
                      Médio Prazo
                    </Badge>
                    <span className="text-[11px] font-mono text-[#808080]">45 a 90 dias</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-[#333333]">
                        Processos & Alçadas
                      </span>
                      <span className="text-xs font-bold text-[#FF9900]">
                        {horizonteData.medio.pct}%
                      </span>
                    </div>
                    <Progress value={horizonteData.medio.pct} className="h-2 rounded-[2px]" />
                  </div>
                  <div className="text-[11px] text-[#808080] space-y-1 pt-1 border-t border-[#E0E0E0]">
                    <p>
                      <strong>{horizonteData.medio.concluidas}</strong> de{' '}
                      <strong>{horizonteData.medio.total}</strong> tarefas concluídas
                    </p>
                    <p className="text-[10px] text-[#FF9900] font-medium">
                      Foco: Autonomia e rituais de gestão
                    </p>
                  </div>
                </Card>

                {/* Longo Prazo */}
                <Card className="bg-white border border-[#E0E0E0] rounded-[4px] p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#333333] text-white text-[10px] font-bold rounded-[3px]">
                      Longo Prazo
                    </Badge>
                    <span className="text-[11px] font-mono text-[#808080]">90 a 180+ dias</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-semibold text-[#333333]">Escala & Moat</span>
                      <span className="text-xs font-bold text-[#333333]">
                        {horizonteData.longo.pct}%
                      </span>
                    </div>
                    <Progress value={horizonteData.longo.pct} className="h-2 rounded-[2px]" />
                  </div>
                  <div className="text-[11px] text-[#808080] space-y-1 pt-1 border-t border-[#E0E0E0]">
                    <p>
                      <strong>{horizonteData.longo.concluidas}</strong> de{' '}
                      <strong>{horizonteData.longo.total}</strong> tarefas concluídas
                    </p>
                    <p className="text-[10px] text-[#0066CC] font-medium">
                      Foco: Moat, sucessão e blindagem
                    </p>
                  </div>
                </Card>
              </div>

              {/* Lista das Próximas Ações Críticas 5W2H */}
              <Card className="bg-white border border-[#E0E0E0] rounded-[4px] p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333] flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5 text-[#0066CC]" />
                    Iniciativas 5W2H em Destaque
                  </h4>
                  <Link
                    to="/plano-de-acao"
                    className="text-xs font-semibold text-[#0066CC] hover:underline flex items-center gap-1"
                  >
                    Abrir Quadro Completo <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-[#E0E0E0]">
                  {tarefasConsolidadas.slice(0, 4).map((t: any, i: number) => (
                    <div key={i} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              (t.status || '').toLowerCase().includes('concl')
                                ? 'bg-[#22B14C]'
                                : (t.status || '').toLowerCase().includes('progr')
                                  ? 'bg-[#FF9900]'
                                  : 'bg-slate-300'
                            }`}
                          />
                          <div>
                            <p className="text-xs font-bold text-[#333333] leading-snug">
                              {t.what}
                            </p>
                            <p className="text-[11px] text-[#808080]">
                              <strong>Por quê:</strong> {t.why}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold shrink-0 rounded-[3px] border-[#E0E0E0]"
                        >
                          {t.status || 'A Fazer'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#808080] pl-4">
                        <span>
                          <strong>Quem:</strong> {t.who || 'Líder Operacional'}
                        </span>
                        <span>
                          <strong>Quando:</strong> {t.when || 'Em definição'}
                        </span>
                        <span>
                          <strong>Onde:</strong> {t.where || 'Empresa'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Coluna 3: Próximo Marco e Rituais de Gestão Previstos */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0066CC]" />
                  Próximos Marcos & Governança
                </h3>
                <p className="text-xs text-[#808080]">
                  Cadências recomendadas para evitar recaída na rotina do fundador.
                </p>
              </div>

              {/* Card Destaque: Próximo Ritual */}
              <Card className="bg-[#0066CC] text-white rounded-[4px] p-5 shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
                <div className="flex items-center justify-between">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold rounded-[3px] border-none">
                    Próximo Marco Oficial
                  </Badge>
                  <span className="text-[10px] font-mono text-white/80">Em 4 dias</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold leading-tight">
                    Reunião Quinzenal de Alinhamento 5W2H
                  </h4>
                  <p className="text-xs text-white/85 leading-relaxed">
                    Pauta: Revisão dos indicadores de ruptura/glosa, aprovação das alçadas de
                    autonomia e checagem de gargalos travados.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#22B14C]" />
                    Duração: 60 min
                  </span>
                  <span>Participantes: C-Level & Gerentes</span>
                </div>
              </Card>

              {/* Calendário de Rituais V7.2 */}
              <Card className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333]">
                  Rituais Determinísticos Recomendados
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#333333]">Daily Operacional (15 min)</p>
                      <p className="text-[10px] text-[#808080]">
                        Alinhamento rápido de bloqueios do dia
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-emerald-400 text-emerald-700"
                    >
                      Diário
                    </Badge>
                  </div>

                  <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#333333]">Weekly de Execução (1h)</p>
                      <p className="text-[10px] text-[#808080]">
                        Checagem de tarefas 5W2H e metas da semana
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-[#0066CC] text-[#0066CC]"
                    >
                      Semanal
                    </Badge>
                  </div>

                  <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#333333]">Monthly Deep Dive (2-4h)</p>
                      <p className="text-[10px] text-[#808080]">
                        DRE gerencial, Lente de Buffett e OKRs
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-[#FF9900] text-[#D97706]"
                    >
                      Mensal
                    </Badge>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white rounded-[4px] text-xs font-semibold h-9"
                  >
                    <Link to="/plano-de-acao" className="flex items-center justify-center gap-1.5">
                      Gerenciar Tarefas no Plano de Ação
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Avanço das Metas Estratégicas (OKRs) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#0066CC]" />
                  Avanço das Metas Trimestrais (OKRs Hoshin Kanri V7.2)
                </h3>
                <p className="text-xs text-[#808080]">
                  Desdobramento vertical dos objetivos determinísticos e acompanhamento dos
                  resultados-chave.
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-mono text-[#0066CC] border-[#0066CC]/30"
              >
                {okrsConsolidados.length} Objetivos Ativos
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {okrsConsolidados.map((okr, idx) => (
                <Card
                  key={okr.id || idx}
                  className="bg-white border border-[#E0E0E0] rounded-[4px] shadow-xs p-4 flex flex-col justify-between hover:border-[#0066CC] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#0066CC] uppercase tracking-wider font-mono">
                        OKR 0{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#22B14C]">{okr.progresso}%</span>
                    </div>

                    <h4 className="text-sm font-bold text-[#333333] leading-snug line-clamp-2">
                      {okr.objetivo}
                    </h4>

                    <Progress value={okr.progresso} className="h-2 rounded-[2px]" />

                    <Separator className="my-2" />

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#808080] uppercase tracking-wider block">
                        Resultados-Chave (KRs):
                      </span>
                      {okr.resultados_chave?.map((kr: any, kIdx: number) => (
                        <div key={kIdx} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-[#333333] leading-tight line-clamp-2 flex-1 pr-2">
                              • {kr.descricao}
                            </span>
                            <span className="font-semibold text-[#0066CC] shrink-0">
                              {kr.progresso}%
                            </span>
                          </div>
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0066CC] transition-all duration-300"
                              style={{ width: `${kr.progresso}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E0E0E0] flex items-center justify-between text-[10px] text-[#808080]">
                    <span>Cadência: Trimestral</span>
                    <span className="font-semibold text-[#22B14C]">Alinhado ao Framework</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
