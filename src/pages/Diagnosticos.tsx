import { BarChart3, ClipboardList, Map, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContextualCta, PerfilUsuario } from '@/components/contextual-cta'
import { useAuth } from '@/hooks/use-auth'

/**
 * Central de Diagnósticos Estratégicos — Rodada 1.5b (saneamento da Rodada 1.5)
 *
 * Estado honesto: esta tela NÃO inventa scores, wizard de avaliação rápida nem
 * "descobertas" fixas. Todo diagnóstico exibido aqui deriva exclusivamente das
 * respostas reais do Questionário dos 12 Setores (3 Pilares), processadas pelo
 * motor determinístico V7.2. Sem dado real do banco, a tela permanece vazia.
 *
 * O CTA é decidido centralizadamente pelo ContextualCta (por perfil) — nenhum
 * botão de diagnóstico duplicado vive nesta página.
 */
export default function Diagnosticos() {
  const { user, isAuthenticated, isAdmin } = useAuth()

  const perfilUsuario: PerfilUsuario = (() => {
    if (!isAuthenticated) return 'visitante'
    if (isAdmin) return 'assinante_maas_bespoke'
    if (user?.role === 'admin') return 'assinante_maas_bespoke'
    return 'assinante_saas'
  })()

  const entregaveis = [
    {
      icon: Map,
      titulo: 'Heat Map de Criticalidade',
      desc: 'Mapa de calor das 8 áreas da empresa, calculado a partir das suas respostas reais.',
    },
    {
      icon: BarChart3,
      titulo: 'Scores por Área',
      desc: 'Nível de autonomia, eficiência e saúde estratégica por área — somente com dado real.',
    },
    {
      icon: Target,
      titulo: 'Plano de Ação 5W2H',
      desc: 'Tarefas executáveis e OKRs desdobrados do seu diagnóstico, não de um receituário genérico.',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner Principal de Diagnóstico VETOR MASTER */}
      <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#0066CC] uppercase tracking-wider">
            <span>Passo 02 da Jornada</span>
            <span className="text-[#808080]">•</span>
            <span>Vetor Master V7.2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC]">
            Central de Diagnósticos Estratégicos
          </h1>
          <p className="text-xs md:text-sm text-[#333333]">
            Identifique os gargalos operacionais e vazamentos invisíveis que prendem o fundador na
            operação diária.
          </p>
        </div>
        {/* CTA único — decisão centralizada no ContextualCta por perfil */}
        <div className="shrink-0">
          <ContextualCta perfil={perfilUsuario} origem="diagnosticos" />
        </div>
      </div>

      {/* Estado vazio honesto — nenhum score, wizard ou descoberta sem dado real do banco */}
      <Card className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] shadow-sm">
        <CardHeader className="items-center text-center pb-2">
          <div className="p-4 rounded-[4px] bg-white border border-[#E0E0E0] text-[#0066CC] w-fit mx-auto">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div className="pt-2 flex justify-center">
            <Badge
              variant="outline"
              className="text-[10px] border-[#FF9900]/40 text-[#D97706] bg-white font-mono"
            >
              Aguardando processamento do motor
            </Badge>
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-[#333333] pt-2">
            Nenhum diagnóstico processado ainda
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-[#333333] max-w-2xl mx-auto leading-relaxed pt-1">
            Os diagnósticos desta central são gerados exclusivamente a partir dos dados do seu
            dossiê estratégico, processados pelo motor determinístico V7.2.3. Enquanto o
            processamento não for concluído no cofre do assinante, nenhum score, ranking ou
            descoberta é exibido aqui — esta tela não apresenta dados simulados.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {entregaveis.map((item) => (
              <div
                key={item.titulo}
                className="p-4 rounded-[4px] bg-white border border-[#E0E0E0] text-left"
              >
                <div className="p-2 rounded-[4px] bg-[#F5F5F5] border border-[#E0E0E0] text-[#0066CC] w-fit">
                  <item.icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#333333] mt-3">{item.titulo}</h3>
                <p className="text-xs text-[#808080] mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#808080] text-center mt-5">
            O diagnóstico é atualizado incrementalmente a cada nova iteração do motor
            determinístico.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
