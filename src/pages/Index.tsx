import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  FolderKanban,
  ListTodo,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Building2,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ContextualCta, PerfilUsuario } from '@/components/contextual-cta'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

interface DadosEmpresa {
  razaoSocial: string | null
  setor: string | null
  nivelContratado: string | null
}

/**
 * Mapeia um valor bruto de plano/nível para o rótulo oficial da escada de valor.
 * Valor ausente, vazio ou não reconhecido → null (nunca assume padrão).
 */
function mapearRotuloNivel(valor: string): string | null {
  const v = (valor || '').trim().toLowerCase()
  if (!v) return null
  if (v.includes('bespoke') || v.includes('caas') || v.includes('customizado'))
    return 'Bespoke CaaS'
  if (v.includes('híbrid') || v.includes('hibrid') || v.includes('maas') || v.includes('assistido'))
    return 'MaaS Híbrido'
  if (v.includes('saas')) return 'SaaS Puro'
  return null
}

/**
 * Resolve o nível contratado a partir de dados REAIS do lead vinculado ao usuário logado.
 * Ordem de prioridade: nivel_assinatura → formato_interesse → plano_interesse →
 * dados_completos.plano_escolhido. Tolerante a campo ausente/erro: 'A definir'.
 */
function resolverNivelPlano(lead: any): string {
  try {
    if (!lead) return 'A definir'
    const candidatos: string[] = []
    if (typeof lead.nivel_assinatura === 'string') candidatos.push(lead.nivel_assinatura)
    if (typeof lead.formato_interesse === 'string') candidatos.push(lead.formato_interesse)
    if (typeof lead.plano_interesse === 'string') candidatos.push(lead.plano_interesse)
    const planoEscolhido = lead?.dados_completos?.plano_escolhido
    if (typeof planoEscolhido === 'string') candidatos.push(planoEscolhido)
    for (const bruto of candidatos) {
      const rotulo = mapearRotuloNivel(bruto)
      if (rotulo) return rotulo
    }
    return 'A definir'
  } catch {
    return 'A definir'
  }
}

interface DadosSituacaoGeral {
  diagnosticosTotal: number
  diagnosticosConcluidos: number
  projetosTotal: number
  projetosEmExecucao: number
  projetosDisponivel: boolean
  planosTotal: number
  planosEmExecucao: number
  okrsTotal: number
  okrsAtivos: number
  okrsProgressoMedio: number
  empresa: DadosEmpresa
}

export default function Index() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null)
  const [dados, setDados] = useState<DadosSituacaoGeral>({
    diagnosticosTotal: 0,
    diagnosticosConcluidos: 0,
    projetosTotal: 0,
    projetosEmExecucao: 0,
    projetosDisponivel: false,
    planosTotal: 0,
    planosEmExecucao: 0,
    okrsTotal: 0,
    okrsAtivos: 0,
    okrsProgressoMedio: 0,
    empresa: {
      razaoSocial: null,
      setor: null,
      nivelContratado: null,
    },
  })

  // Perfil contextual para CTAs
  const perfilUsuario: PerfilUsuario = (() => {
    if (!isAuthenticated) return 'visitante'
    if (isAdmin) return 'assinante_maas_bespoke'
    if (user?.role === 'admin') return 'assinante_maas_bespoke'
    return 'assinante_saas'
  })()

  useEffect(() => {
    let mounted = true

    async function carregarSituacaoGeral() {
      setLoading(true)
      setErroCarregamento(null)

      try {
        const userId = user?.id || ''
        const userEmail = (user?.email || '').trim().toLowerCase()

        // 1. Diagnósticos
        // Usuário comum filtra por user = userId; admin vê o mais recente ou geral
        let diagnosticosItems: any[] = []
        try {
          if (userId) {
            diagnosticosItems = await pb.collection('diagnosticos').getFullList({
              filter: `user = "${userId}"`,
              sort: '-created',
            })
          }
          if (diagnosticosItems.length === 0 && isAdmin) {
            diagnosticosItems = await pb.collection('diagnosticos').getFullList({
              sort: '-created',
            })
          }
        } catch (err) {
          console.warn('Aviso ao consultar diagnosticos:', err)
        }

        const diagnosticosTotal = diagnosticosItems.length
        const diagnosticosConcluidos = diagnosticosItems.filter(
          (d) => d.status === 'concluido' || (d.fase_atual && d.fase_atual >= 8),
        ).length

        // 2. Projetos (tolerante à ausência da collection)
        let projetosItems: any[] = []
        let projetosDisponivel = false
        try {
          if (userId) {
            projetosItems = await pb.collection('projetos').getFullList({
              filter: `user = "${userId}"`,
            })
          } else {
            projetosItems = await pb.collection('projetos').getFullList()
          }
          projetosDisponivel = true
        } catch {
          // Collection inexistente no schema PocketBase atual — tolerância obrigatória
          projetosDisponivel = false
          projetosItems = []
        }

        const projetosTotal = projetosItems.length
        const projetosEmExecucao = projetosItems.filter((p) => {
          const st = (p.status || '').toLowerCase()
          return (
            st.includes('execu') ||
            st.includes('progress') ||
            st.includes('andamento') ||
            st === 'ativo'
          )
        }).length

        // 3. Planos de Ação
        let planosItems: any[] = []
        try {
          if (userId) {
            planosItems = await pb.collection('planos_acao').getFullList({
              filter: `user = "${userId}"`,
            })
          }
          if (planosItems.length === 0 && isAdmin) {
            planosItems = await pb.collection('planos_acao').getFullList()
          }
        } catch (err) {
          console.warn('Aviso ao consultar planos_acao:', err)
        }

        const planosTotal = planosItems.length
        const planosEmExecucao = planosItems.filter((p) => {
          const st = (p.status || '').toLowerCase()
          return (
            st === 'em progresso' || st === 'em andamento' || st === 'em execução' || st === 'ativo'
          )
        }).length

        // 4. OKRs
        let okrsItems: any[] = []
        try {
          if (userId) {
            okrsItems = await pb.collection('okrs').getFullList({
              filter: `user = "${userId}"`,
            })
          }
          if (okrsItems.length === 0 && isAdmin) {
            okrsItems = await pb.collection('okrs').getFullList()
          }
        } catch (err) {
          console.warn('Aviso ao consultar okrs:', err)
        }

        const okrsTotal = okrsItems.length
        const okrsAtivosItems = okrsItems.filter((o) => {
          const prog = Number(o.progresso) || 0
          return prog < 100
        })
        const okrsAtivos = okrsAtivosItems.length
        const okrsProgressoMedio =
          okrsItems.length > 0
            ? Math.round(
                okrsItems.reduce((acc, cur) => acc + (Number(cur.progresso) || 0), 0) /
                  okrsItems.length,
              )
            : 0

        // 5. Identificação da Empresa (Razão Social, Setor e Nível Contratado)
        let razaoSocial: string | null = null
        let setor: string | null = null
        let leadVinculado: any = null

        // Tentar obter lead vinculado ao diagnóstico mais recente
        const leadIdVinculado = diagnosticosItems.find((d) => d.lead)?.lead
        if (leadIdVinculado) {
          try {
            const leadRecord = await pb.collection('leads').getOne(leadIdVinculado)
            leadVinculado = leadRecord
            razaoSocial = leadRecord.razao_social || leadRecord.nome_completo || null
            setor = leadRecord.setor || null
          } catch (err) {
            console.warn('Aviso ao buscar lead vinculado do diagnóstico:', err)
          }
        }

        // Se ainda não encontrou e temos email do usuário, buscar na collection leads
        if (!razaoSocial && userEmail) {
          try {
            const leadRecord = await pb
              .collection('leads')
              .getFirstListItem(`email = "${userEmail}"`, { sort: '-created' })
            leadVinculado = leadRecord
            razaoSocial = leadRecord.razao_social || leadRecord.nome_completo || null
            setor = leadRecord.setor || null
          } catch {
            // Nenhum lead com esse email
          }
        }

        // Fallbacks se não houver lead: setor do diagnóstico ou nome do usuário
        if (!setor && diagnosticosItems[0]?.setor) {
          setor = diagnosticosItems[0].setor
        }

        // Nível contratado: sempre de dado real do lead vinculado ('A definir' se ausente)
        const nivelContratado = resolverNivelPlano(leadVinculado)

        if (mounted) {
          setDados({
            diagnosticosTotal,
            diagnosticosConcluidos,
            projetosTotal,
            projetosEmExecucao,
            projetosDisponivel,
            planosTotal,
            planosEmExecucao,
            okrsTotal,
            okrsAtivos,
            okrsProgressoMedio,
            empresa: {
              razaoSocial,
              setor,
              nivelContratado,
            },
          })
        }
      } catch (err: any) {
        console.error('Erro ao carregar situação geral da empresa:', err)
        if (mounted) {
          setErroCarregamento(
            err?.message || 'Não foi possível carregar os dados da empresa no momento.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    carregarSituacaoGeral()

    return () => {
      mounted = false
    }
  }, [user?.id, user?.email, isAdmin])

  // Lógica da Próxima Ação Recomendada conforme regras da especificação:
  // 1. 0 diagnósticos → "Inicie seu primeiro diagnóstico na seção As 8 Fases." -> /fases
  // 2. diagnósticos > 0 e 0 projetos → "Seu diagnóstico está pronto. Consulte os Projetos e Planos de Ação." -> /projetos
  // 3. projetos > 0 e planos > 0 → "Há N planos de ação em execução. Acompanhe no Dashboard." -> /dashboard
  // 4. OKRs ativos → "Você tem N OKRs em andamento. Verifique o progresso no Dashboard." -> /dashboard
  const proximaAcao = (() => {
    if (dados.diagnosticosTotal === 0) {
      return {
        texto: 'Inicie seu primeiro diagnóstico na seção As 8 Fases.',
        acaoLabel: 'Iniciar Diagnóstico',
        rota: '/fases',
      }
    }
    if (dados.diagnosticosTotal > 0 && dados.projetosEmExecucao === 0) {
      return {
        texto: 'Seu diagnóstico está pronto. Consulte os Projetos e Planos de Ação.',
        acaoLabel: 'Ver Projetos e Planos',
        rota: '/projetos',
      }
    }
    if (dados.projetosEmExecucao > 0 && dados.planosEmExecucao > 0) {
      return {
        texto: `Há ${dados.planosEmExecucao} plano${dados.planosEmExecucao > 1 ? 's' : ''} de ação em execução. Acompanhe no Dashboard.`,
        acaoLabel: 'Acompanhar no Dashboard',
        rota: '/dashboard',
      }
    }
    if (dados.okrsAtivos > 0) {
      return {
        texto: `Você tem ${dados.okrsAtivos} OKR${dados.okrsAtivos > 1 ? 's' : ''} em andamento. Verifique o progresso no Dashboard.`,
        acaoLabel: 'Ver OKRs no Dashboard',
        rota: '/dashboard',
      }
    }
    return {
      texto: 'Acompanhe a evolução estratégica dos seus projetos e métricas.',
      acaoLabel: 'Acessar Dashboard',
      rota: '/dashboard',
    }
  })()

  // Resumo de execução (Linha 3): só se houver dados
  const temAlgumDadoReal =
    dados.diagnosticosTotal > 0 ||
    dados.projetosTotal > 0 ||
    dados.planosTotal > 0 ||
    dados.okrsTotal > 0

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas Institucional VETOR MASTER */}
      <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#0066CC] uppercase tracking-wider">
            <span>Inteligência Estratégica Determinística</span>
            <span className="text-[#808080]">•</span>
            <span className="text-[#22B14C]">Vetor Master V7.2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC]">
            Início — Jornada de Libertação do Fundador
          </h1>
          <p className="text-xs md:text-sm text-[#333333]">
            Estancar os vazamentos invisíveis, fechar o abismo entre estratégia e execução e
            construir uma empresa autogerenciável.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <ContextualCta perfil={perfilUsuario} origem="app" />
        </div>
      </div>

      {/* BLOCO ÚNICO: Situação Geral da Empresa */}
      <div className="space-y-4">
        {/* Título e Subtítulo dinâmico */}
        <div className="border-b border-[#E0E0E0] pb-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#808080] uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5 text-[#0066CC]" />
            <span>Visão Consolidada de Governança</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#111A2E] tracking-tight">
            Situação Geral da Empresa
          </h2>
          {loading ? (
            <div className="mt-1 space-y-1">
              <Skeleton className="h-4 w-64 bg-[#E0E0E0]" />
            </div>
          ) : (
            <p className="text-xs md:text-sm text-[#555555] mt-0.5">
              {dados.empresa.razaoSocial && dados.empresa.setor ? (
                <span>
                  <strong className="text-[#111A2E]">{dados.empresa.razaoSocial}</strong> —{' '}
                  <span className="text-[#0066CC] font-medium">{dados.empresa.setor}</span>
                </span>
              ) : dados.empresa.razaoSocial ? (
                <strong className="text-[#111A2E]">{dados.empresa.razaoSocial}</strong>
              ) : dados.empresa.setor ? (
                <span className="text-[#0066CC] font-medium">Setor: {dados.empresa.setor}</span>
              ) : (
                <span className="text-[#808080] italic">
                  Identificação da empresa vinculada ao diagnóstico estratégico
                </span>
              )}
            </p>
          )}
          {!loading && (
            <p className="text-[11px] text-[#808080] mt-1">
              Plano contratado:{' '}
              <span className="text-[#555555] font-medium">
                {dados.empresa.nivelContratado || 'A definir'}
              </span>
            </p>
          )}
        </div>

        {/* Alerta de erro amigável se houver falha de rede/backend */}
        {erroCarregamento && (
          <div className="bg-[#FFF5F5] border border-[#FFD0D0] text-[#C53030] rounded-[4px] p-3 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erroCarregamento}</span>
          </div>
        )}

        {/* LINHA 1 — 4 cards de estado (1 coluna mobile, 2x2 tablet, 4 desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Diagnósticos */}
          <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
                Diagnósticos
              </CardTitle>
              <FileText className="w-4 h-4 text-[#0066CC]" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16 bg-[#E0E0E0]" />
                  <Skeleton className="h-3 w-32 bg-[#E0E0E0]" />
                </div>
              ) : dados.diagnosticosTotal === 0 ? (
                <div>
                  <div className="text-xl font-bold text-[#333333]">0</div>
                  <p className="text-xs text-[#808080] mt-1 font-medium">
                    Nenhum diagnóstico processado ainda
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-[#333333]">
                    {dados.diagnosticosConcluidos}
                  </div>
                  <p className="text-xs text-[#22B14C] mt-1 font-medium">
                    {dados.diagnosticosConcluidos > 0
                      ? `${dados.diagnosticosConcluidos} de 8 fases concluídas`
                      : `${dados.diagnosticosTotal} diagnóstico(s) em andamento`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Projetos Ativos */}
          <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
                Projetos Ativos
              </CardTitle>
              <FolderKanban className="w-4 h-4 text-[#0066CC]" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16 bg-[#E0E0E0]" />
                  <Skeleton className="h-3 w-32 bg-[#E0E0E0]" />
                </div>
              ) : !dados.projetosDisponivel ? (
                <div>
                  <div className="text-xl font-bold text-[#808080]">0</div>
                  <p className="text-xs text-[#808080] mt-1 font-medium">
                    Aguardando processamento
                  </p>
                </div>
              ) : dados.projetosTotal === 0 ? (
                <div>
                  <div className="text-xl font-bold text-[#333333]">0</div>
                  <p className="text-xs text-[#808080] mt-1 font-medium">
                    Nenhum projeto iniciado ainda
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-[#333333]">
                    {dados.projetosEmExecucao}
                  </div>
                  <p className="text-xs text-[#0066CC] mt-1 font-medium">
                    de {dados.projetosTotal} projeto{dados.projetosTotal > 1 ? 's' : ''} do plano
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Planos de Ação */}
          <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
                Planos de Ação
              </CardTitle>
              <ListTodo className="w-4 h-4 text-[#0066CC]" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16 bg-[#E0E0E0]" />
                  <Skeleton className="h-3 w-32 bg-[#E0E0E0]" />
                </div>
              ) : dados.planosTotal === 0 ? (
                <div>
                  <div className="text-xl font-bold text-[#333333]">0</div>
                  <p className="text-xs text-[#808080] mt-1 font-medium">
                    Nenhum plano em execução
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-[#333333]">{dados.planosEmExecucao}</div>
                  <p className="text-xs text-[#0066CC] mt-1 font-medium">
                    de {dados.planosTotal} plano{dados.planosTotal > 1 ? 's' : ''} cadastrado
                    {dados.planosTotal > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: OKRs */}
          <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
                OKRs
              </CardTitle>
              <CheckCircle2 className="w-4 h-4 text-[#0066CC]" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16 bg-[#E0E0E0]" />
                  <Skeleton className="h-3 w-32 bg-[#E0E0E0]" />
                </div>
              ) : dados.okrsTotal === 0 ? (
                <div>
                  <div className="text-xl font-bold text-[#333333]">0%</div>
                  <p className="text-xs text-[#808080] mt-1 font-medium">Nenhum OKR cadastrado</p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-[#333333]">
                    {dados.okrsProgressoMedio}%
                  </div>
                  <p className="text-xs text-[#22B14C] mt-1 font-medium">
                    {dados.okrsAtivos} OKR{dados.okrsAtivos > 1 ? 's' : ''} ativo
                    {dados.okrsAtivos > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* LINHA 2 — Card destacado "Próxima Ação Recomendada" */}
        <Card className="bg-white border-2 border-[#0066CC]/30 rounded-[4px] p-5 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0066CC] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#0066CC]" />
                <span>Próxima Ação Recomendada</span>
              </div>
              {loading ? (
                <Skeleton className="h-5 w-80 bg-[#E0E0E0]" />
              ) : (
                <p className="text-sm md:text-base font-semibold text-[#111A2E]">
                  {proximaAcao.texto}
                </p>
              )}
            </div>
            <Button
              asChild
              disabled={loading}
              className="bg-[#0066CC] hover:bg-[#004C99] text-white rounded-[4px] font-medium shrink-0 shadow-sm"
            >
              <Link to={proximaAcao.rota} className="flex items-center gap-2">
                <span>{proximaAcao.acaoLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* LINHA 3 — Resumo de execução, SÓ se houver dados reais */}
        {!loading && temAlgumDadoReal && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] px-4 py-3 flex items-center justify-between text-xs text-[#475569]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1E293B]">Resumo de Execução:</span>
              <span>
                {dados.projetosDisponivel ? `${dados.projetosEmExecucao} projetos` : '0 projetos'} ·{' '}
                {dados.planosEmExecucao} planos de ação · {dados.okrsProgressoMedio}% de execução
                média dos OKRs
              </span>
            </div>
            <Link
              to="/dashboard"
              className="text-[#0066CC] hover:underline font-medium flex items-center gap-1"
            >
              <span>Ver detalhes no Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* LINHA 4 — Card escuro da Biblioteca sem número fixo */}
      <Card className="bg-[#333333] text-white border border-[#E0E0E0] rounded-[4px] relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <BrainCircuit className="w-48 h-48 text-white" />
        </div>
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#22B14C] uppercase tracking-wider mb-1">
            <span>Central de Conhecimento</span>
            <span>•</span>
            <span>Ativo Intelectual</span>
          </div>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#22B14C]" />
            Biblioteca Estratégica Vetor Master
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2 relative z-10 space-y-4">
          <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-3xl">
            Consulte a base de conhecimento estratégico, frameworks metodológicos e referências de
            gestão para apoiar a implementação dos planos de ação e a evolução contínua da sua
            empresa.
          </p>
          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-medium"
            >
              <Link to="/biblioteca">Acessar Biblioteca</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-[4px]"
            >
              <Link to="/niveis-e-planos">Ver Escada de Valor</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
