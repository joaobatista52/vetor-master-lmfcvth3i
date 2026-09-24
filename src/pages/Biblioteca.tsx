import { Link } from 'react-router-dom'
import { BookOpen, Sparkles, HelpCircle, Lightbulb, ArrowRight, Clock, Compass } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Biblioteca() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de topo institucional VETOR MASTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-[#333333] text-white p-8 rounded-[4px] relative overflow-hidden border border-[#E0E0E0] shadow-sm">
        <div className="absolute right-0 top-0 opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <BookOpen className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#0066CC] text-white">
              Vetor Master V7.2
            </span>
            <span className="text-xs text-white/70">
              Base de Conhecimento Estratégica do Cliente
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Biblioteca</h1>
          <p className="text-white/80 text-base leading-relaxed">
            Central de inteligência consultiva dedicada à sua jornada executiva, reunindo respostas
            a dúvidas estratégicas de clientes, desdobramentos práticos e insights acionáveis para
            aceleração da maturidade de gestão.
          </p>
        </div>
        <div className="relative z-10 text-right shrink-0">
          <div className="flex items-center gap-1.5 justify-end text-[#22B14C] font-semibold text-sm mb-1">
            <Clock className="w-4 h-4" />
            <span>Publicação em Breve</span>
          </div>
          <div className="text-xs text-white/70">Perguntas, Respostas & Insights</div>
        </div>
      </div>

      {/* Placeholder Elegante — Identidade Visual Vetor Master */}
      <Card className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] shadow-sm overflow-hidden">
        <CardContent className="p-8 md:p-12 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border border-[#E0E0E0] shadow-sm text-[#0066CC]">
            <BookOpen className="w-8 h-8 text-[#0066CC]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant="outline"
                className="bg-white border-[#0066CC]/30 text-[#0066CC] text-[11px] font-semibold tracking-wide uppercase px-3 py-1"
              >
                <Sparkles className="w-3 h-3 mr-1.5 text-[#22B14C]" /> Em Preparação Editorial
              </Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#333333]">
              Perguntas e Respostas aos Clientes + Insights
            </h2>
            <p className="text-[#808080] text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
              Estamos estruturando um acervo curado sob medida para os desafios reais da sua
              empresa. Em breve você terá acesso direto a respostas objetivas para as principais
              dúvidas de implementação, estudos de caso de governança e insights executivos dos 12
              setores.
            </p>
          </div>

          {/* Destaques do que virá */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
            <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-[#0066CC] font-bold text-sm mb-1.5">
                <div className="w-7 h-7 rounded-[4px] bg-[#0066CC]/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 text-[#0066CC]" />
                </div>
                <span>FAQ Estratégico & Respostas</span>
              </div>
              <p className="text-xs text-[#555555] leading-relaxed">
                Respostas práticas às dúvidas mais frequentes dos clientes durante o diagnóstico,
                estruturação de governança e execução de planos 5W2H.
              </p>
            </div>

            <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-[#22B14C] font-bold text-sm mb-1.5">
                <div className="w-7 h-7 rounded-[4px] bg-[#22B14C]/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-[#22B14C]" />
                </div>
                <span>Insights & Epifanias Setoriais</span>
              </div>
              <p className="text-xs text-[#555555] leading-relaxed">
                Pílulas de inteligência executiva sobre gargalos invisíveis, alavancas de margem e
                descentralização da operação em cada um dos 12 setores.
              </p>
            </div>
          </div>

          {/* Chamada para ação da jornada */}
          <div className="pt-4 border-t border-[#E0E0E0] flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-medium shadow-sm w-full sm:w-auto"
            >
              <Link to="/diagnosticos" className="flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Continuar Jornada: Diagnóstico
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#E0E0E0] bg-white text-[#333333] hover:bg-[#E0E0E0]/30 rounded-[4px] w-full sm:w-auto"
            >
              <Link to="/dashboard">Acessar Meu Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
