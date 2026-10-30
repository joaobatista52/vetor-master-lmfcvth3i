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
      id: 'saas-puro',
      tag: 'Nível 1',
      title: 'SaaS Puro',
      subtitle: 'Autosserviço Total + Curadoria Trimestral',
      target:
        'Diagnóstico completo com BSC enxuto. Portal do Cliente em autosserviço total. Curadoria virtual trimestral de 60 minutos com reprocessamento do diagnóstico.',
      price: 'R$ 1.190,00',
      period: '/mês',
      adicional: '—',
      highlight: false,
      badge: 'Autosserviço',
      features: [
        'Diagnóstico completo com BSC enxuto (1–2 objetivos por perspectiva)',
        'Portal do Cliente em autosserviço total contínuo (5W2H e rituais)',
        'Curadoria virtual trimestral de 60 minutos com reprocessamento do diagnóstico',
        'Visualização dos 3 Pilares estruturais e Causa Raiz sistêmica',
        'Snapshot financeiro, heat map e acompanhamento no Dashboard',
        'Acesso à base curada de micro-lições e glossário estratégico',
      ],
      ctaText: 'Entrar na lista de prioridade',
      ctaLink: '/lista-prioridade',
    },
    {
      id: 'maas-hibrido',
      tag: 'Nível 2 — Mais Escolhido',
      title: 'MaaS Híbrido',
      subtitle: 'Mentoria Consultiva + Software Integrado',
      target:
        'Diagnóstico completo com BSC detalhado. Portal do Cliente em autosserviço total. Curadoria virtual mensal de 90 minutos com reprocessamento. Reunião extra a R$ 890,00.',
      price: 'R$ 3.290,00',
      period: '/mês',
      adicional: '+ R$ 890,00 / reunião extra (90 min)',
      highlight: true,
      badge: 'Recomendado',
      features: [
        'Diagnóstico completo com BSC detalhado (4 perspectivas e causa-efeito)',
        'Portal do Cliente em autosserviço total com artefatos completos das 8 fases',
        'Curadoria virtual mensal de 90 minutos com Consultor Executivo e reprocessamento contínuo',
        'Matriz EREC canônica A9, Curva de Valor e Business Model Canvas To Be',
        'DRE Institucional de 15 linhas normalizada, FCF e Lente de Buffett',
        'Reunião extra a R$ 890,00 por sessão virtual adicional de 90 min',
      ],
      ctaText: 'Acelerar com MaaS Híbrido',
      ctaLink: '/questionario',
    },
    {
      id: 'bespoke-caas',
      tag: 'Nível 3',
      title: 'Bespoke CaaS',
      subtitle: 'Consulting as a Service Presencial de Alta Complexidade',
      target:
        'Diagnóstico completo com BSC detalhado e imersão presencial. Portal do Cliente em autosserviço total. Curadoria virtual mensal de 90 minutos mais curadoria presencial de 12 horas por mês com Consultor Executivo. Hora adicional a R$ 790,00.',
      price: 'R$ 15.750,00',
      period: '/mês',
      adicional: '+ R$ 790,00 / hora adicional',
      highlight: false,
      badge: 'Enterprise C-Level',
      features: [
        'Diagnóstico completo com BSC detalhado e imersão presencial de alta complexidade',
        'Portal do Cliente em autosserviço total com histórico completo de reprocessamento',
        'Curadoria virtual mensal de 90 minutos mais curadoria presencial de 12 horas por mês com Consultor Executivo Sênior',
        'Estruturação de Governança (Conselho Consultivo/Administração) e plano de sucessão Top 10',
        'Modelagem de Valuation FCD determinístico com análise de sensibilidade e Gordon',
        'Hora adicional a R$ 790,00 por intervenção presencial adicional',
      ],
      ctaText: 'Falar com Consultor C-Level',
      ctaLink: '/questionario',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-[#F8FAFC]">
      {/* Cabeçalho */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[#16213A] border border-[#24334F] text-[#5B9DFF] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#3DDC74]" />
          <span>Escada de Valor Oficial V1.3 • Vetor Master</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
          Níveis de Atuação e Valores Oficiais
        </h1>
        <p className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
          Modelo C-Level as a Service & Mentorship as a Software com precificação baseada no valor
          entregue (Value-Based Pricing). Sem taxas ocultas. Escolha a profundidade ideal para a sua
          operação.
        </p>
      </div>

      {/* Grid dos 3 Planos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col justify-between rounded-[4px] transition-all relative ${
              plan.highlight
                ? 'bg-[#16213A] border-2 border-[#5B9DFF] shadow-xl ring-1 ring-[#5B9DFF]/30'
                : 'bg-[#16213A] border border-[#24334F] shadow-sm hover:border-[#5B9DFF]/40'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#3DDC74] hover:bg-[#3DDC74] text-[#0B1120] text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-[3px] border-none">
                  {plan.badge}
                </Badge>
              </div>
            )}
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8B98B4] mb-2">
                <span>{plan.tag}</span>
                {!plan.highlight && (
                  <Badge variant="outline" className="text-[10px] border-[#24334F] text-[#C7D0E0]">
                    {plan.badge}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl font-bold text-[#F8FAFC] leading-snug font-heading">
                {plan.title}
              </CardTitle>
              <CardDescription className="text-xs text-[#5B9DFF] font-medium mt-1">
                {plan.subtitle}
              </CardDescription>
              <div className="pt-4 border-t border-[#24334F] mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{plan.price}</span>
                  <span className="text-xs text-[#8B98B4]">{plan.period}</span>
                </div>
                <p className="text-xs text-[#C7D0E0] mt-1 line-clamp-2">{plan.target}</p>
                {plan.adicional !== '—' && (
                  <div className="text-[11px] text-[#FFB84D] font-medium mt-2 bg-[#111A2E] p-2 rounded-[3px] border border-[#24334F]">
                    {plan.adicional}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 flex-1">
              <div className="text-xs font-semibold text-[#8B98B4] uppercase tracking-wider mb-3">
                Entregáveis inclusos:
              </div>
              <ul className="space-y-2.5">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-[#C7D0E0] leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#3DDC74] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="p-6 pt-2">
              <Button
                className={`w-full rounded-[4px] font-semibold text-xs py-5 gap-2 ${
                  plan.highlight
                    ? 'bg-[#0066CC] hover:bg-[#22B14C] text-white shadow-md'
                    : 'bg-[#111A2E] hover:bg-[#5B9DFF]/20 text-[#5B9DFF] border border-[#24334F]'
                }`}
                onClick={() => navigate(plan.ctaLink || '/plano-de-acao')}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Caixa institucional de autoridade VETOR MASTER */}
      <Card className="bg-[#16213A] border border-[#24334F] rounded-[4px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5B9DFF] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#3DDC74]" />
              <span>Garantia de Fidelidade Metodológica</span>
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFC]">
              Mais de 40 anos de liderança executiva traduzidos em algoritmos determinísticos
            </h3>
            <p className="text-xs text-[#C7D0E0] leading-relaxed">
              Sem alucinações de IA genérica. Toda recomendação deriva do cruzamento de modelos
              validados (Balanced Scorecard, OKRs, Hackman, Lente de Buffett e Matriz ERRC)
              parametrizados especificamente para a realidade de pequenas e médias empresas.
            </p>
          </div>
          {/* Rodada 1.5b: CTA duplicado "Iniciar Diagnóstico Gratuito" removido — a decisão de CTA fica centralizada no ContextualCta por perfil. */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant="outline"
              className="border-[#24334F] text-[#C7D0E0] hover:bg-[#111A2E] rounded-[4px] text-xs"
              onClick={() => navigate('/areas-da-empresa')}
            >
              Ver Áreas da Empresa
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
