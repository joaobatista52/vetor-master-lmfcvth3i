import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Briefcase,
  Users,
  Layers,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function NiveisEPlanos() {
  const navigate = useNavigate()

  const plans = [
    {
      id: 'maas',
      tag: 'Nível 1',
      title: 'MaaS — Management as a Service',
      subtitle: 'Direção Contínua & Monitoramento de KPIs',
      target: 'Fundadores de PMEs buscando governança básica e saída da operação.',
      price: 'Assinatura Mensal',
      highlight: false,
      badge: 'Essencial',
      features: [
        'Diagnóstico Estratégico Contínuo nas 8 Áreas',
        'Dashboards Executivos de Performance em Tempo Real',
        'Plano de Ação 5W2H com Acompanhamento Trimestral',
        'Acesso Completo à Biblioteca JBP V2.4 (138 Obras)',
        'Checklists dos Limiares da Lente de Buffett & Hackman',
        'Suporte Estratégico Dirigido',
      ],
      ctaText: 'Escolher MaaS',
    },
    {
      id: 'hibrido',
      tag: 'Nível 2 — Mais Escolhido',
      title: 'Modelo Híbrido',
      subtitle: 'Mentoria Consultiva + Software Integrado',
      target: 'Scale-ups e médias empresas estruturando comitês e liderança.',
      price: 'MaaS + Sessões C-Level',
      highlight: true,
      badge: 'Recomendado',
      features: [
        'Tudo incluso no plano MaaS',
        'Sessões Quinzenais de Orientação C-Level com Especialistas',
        'Auditoria e Redesenho de Processos (As Is → To Be)',
        'Estruturação de Conselho Consultivo (até 5 membros)',
        'Desdobramento de OKRs Corporativos e Setoriais (Hoshin Kanri)',
        'Stress Test Financeiro com Motor Determinístico',
      ],
      ctaText: 'Acelerar com Modelo Híbrido',
    },
    {
      id: 'caas',
      tag: 'Nível 3',
      title: 'CaaS — Consulting as a Service',
      subtitle: 'Alta Complexidade, M&A e Turnaround',
      target: 'Empresas em momento de fusão, aquisição, sucessão ou reestruturação.',
      price: 'Bespoke + Success Fee',
      highlight: false,
      badge: 'Enterprise',
      features: [
        'Projetos Especiais de Reestruturação e Governança Plena',
        'Estruturação de Conselho de Administração (7 membros)',
        'Valuation FCD Determinístico Completo para Captação ou Venda',
        'Plano de Sucessão Top 10 Posições Críticas (Readiness Score)',
        'Due Diligence Estratégica e Blindagem de Riscos',
        'Dedicação C-Level Sênior Dedicada',
      ],
      ctaText: 'Falar com Consultor C-Level',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Cabeçalho */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[#0066CC]/10 text-[#0066CC] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Escada de Valor Vetor Master V7.2</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0066CC]">
          Níveis de Atuação e Planos Estratégicos
        </h1>
        <p className="text-base text-[#333333] leading-relaxed">
          Modelo C-Level as a Service & Mentorship as a Software com precificação baseada no valor
          entregue (Value-Based Pricing). Escolha o nível de intensidade ideal para destravar a
          escala da sua organização.
        </p>
      </div>

      {/* Grid dos 3 Planos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col justify-between rounded-[4px] transition-all relative ${
              plan.highlight
                ? 'bg-white border-2 border-[#0066CC] shadow-md ring-1 ring-[#0066CC]/20'
                : 'bg-[#F5F5F5] border border-[#E0E0E0] shadow-sm hover:border-[#0066CC]'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#22B14C] hover:bg-[#22B14C] text-white text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-[3px] border-none">
                  {plan.badge}
                </Badge>
              </div>
            )}
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#808080] mb-2">
                <span>{plan.tag}</span>
                {!plan.highlight && (
                  <Badge variant="outline" className="text-[10px] border-[#E0E0E0] text-[#333333]">
                    {plan.badge}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-[#333333] leading-snug">
                {plan.title}
              </CardTitle>
              <CardDescription className="text-xs text-[#0066CC] font-medium mt-1">
                {plan.subtitle}
              </CardDescription>
              <div className="pt-4 border-t border-[#E0E0E0] mt-4">
                <div className="text-2xl font-bold text-[#333333]">{plan.price}</div>
                <p className="text-xs text-[#808080] mt-1 line-clamp-2">{plan.target}</p>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 flex-1">
              <div className="text-xs font-semibold text-[#333333] uppercase tracking-wider mb-3">
                Entregáveis inclusos:
              </div>
              <ul className="space-y-2.5">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-[#333333] leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#22B14C] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="p-6 pt-2">
              <Button
                className={`w-full rounded-[4px] font-medium gap-2 ${
                  plan.highlight
                    ? 'bg-[#0066CC] hover:bg-[#22B14C] text-white'
                    : 'bg-[#333333] hover:bg-[#0066CC] text-white'
                }`}
                onClick={() => navigate('/diagnosticos')}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Caixa institucional de autoridade VETOR MASTER */}
      <Card className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0066CC] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#22B14C]" />
              <span>Garantia de Fidelidade Metodológica</span>
            </div>
            <h3 className="text-lg font-bold text-[#333333]">
              Mais de 40 anos de liderança executiva traduzidos em algoritmos determinísticos
            </h3>
            <p className="text-xs text-[#808080] leading-relaxed">
              Sem alucinações de IA genérica. Toda recomendação deriva do cruzamento de modelos
              validados (Balanced Scorecard, OKRs, Hackman, Lente de Buffett e Matriz ERRC)
              parametrizados especificamente para a realidade de pequenas e médias empresas.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant="outline"
              className="border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white rounded-[4px]"
              onClick={() => navigate('/biblioteca')}
            >
              Explorar Metodologia
            </Button>
            <Button
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px]"
              onClick={() => navigate('/questionario')}
            >
              Iniciar Diagnóstico Gratuito
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
