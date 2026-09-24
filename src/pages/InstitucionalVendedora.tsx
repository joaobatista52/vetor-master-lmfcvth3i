import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
  Compass,
  Building2,
  HelpCircle,
  FileCheck2,
  Zap,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SETORES_CANONICOS_12, type SetorCanonicoInfo } from '@/data/setores-canonicos'
import { ESCADA_DE_VALOR_OFICIAL } from '@/data/escada-valor-oficial'
import { CASES_REAIS_OFICIAIS, FAIXA_AUTORIDADE_OFICIAL, FAQ_OFICIAL_V13 } from '@/data/cases-e-faq'

/**
 * CAMADA 0 — INSTITUCIONAL / VENDEDORA (V1.3)
 * 1ª Tela para TODOS os visitantes (público e assinante).
 * Resumo comercial adaptado com fundo escuro oficial (#0B1120 / #111A2E).
 * CTA completo: "Começar Diagnóstico Gratuito" (primário) + "Ver Níveis e Planos" (laranja) + "Entrar" (assinante).
 */
export default function InstitucionalVendedora() {
  const navigate = useNavigate()
  const [setorAbertoId, setSetorAbertoId] = useState<string>('saude')

  const toggleSetor = (id: string) => {
    setSetorAbertoId((atual) => (atual === id ? '' : id))
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] selection:bg-[#0066CC] selection:text-white">
      {/* 1. NAVBAR OFICIAL — Logotipo negativo na navbar escura + CTA Completo */}
      <header className="sticky top-0 z-50 border-b border-[#24334F] bg-[#111A2E]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 focus:outline-none">
            <Logo variant="horizontal" size="sm" showTagline negative />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[#C7D0E0] hover:text-[#5B9DFF] hover:bg-[#16213A] text-xs font-medium rounded-[4px]"
            >
              <Link to="/login">Entrar</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden md:inline-flex border-[#FF9900] text-[#FFB84D] hover:bg-[#FF9900]/15 hover:text-[#FFB84D] text-xs font-medium rounded-[4px]"
            >
              <a href="#niveis">Ver Níveis e Planos</a>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white text-xs font-semibold rounded-[4px] shadow-sm transition-all duration-200"
            >
              <Link to="/questionario" className="flex items-center gap-1.5">
                <span>Começar Diagnóstico Gratuito</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* 2. HERO PRINCIPAL — Caixa grande no padrão aprovado (Seção 7.1) */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[#24334F]">
        {/* Textura sutil 3-6% + gradiente sutil azul->verde */}
        <div className="absolute inset-0 hex-watermark opacity-70 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#0066CC]/15 via-[#22B14C]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[4px] bg-[#16213A] border border-[#24334F] text-[#5B9DFF] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#3DDC74]" />
            <span>DIREÇÃO • CONEXÃO • CRESCIMENTO — VETOR MASTER V1.3</span>
          </div>

          <div className="p-8 md:p-12 rounded-[6px] bg-[#111A2E]/90 border border-[#24334F] shadow-2xl relative">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F8FAFC] leading-tight font-heading">
              Diagnósticos estratégicos em 72h.{' '}
              <span className="text-vm-gradient block mt-1">
                Expertise de C-Level. Preço de SaaS.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#C7D0E0] max-w-3xl mx-auto leading-relaxed">
              C-Level as a Service & Mentorship as a Software. Mais de 40 anos de liderança
              executiva traduzidos em algoritmos determinísticos proprietários que libertam o
              fundador da operação e estancam vazamentos invisíveis de margem.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-[#0066CC] hover:bg-[#22B14C] text-white text-sm font-semibold rounded-[4px] px-8 py-6 shadow-lg shadow-[#0066CC]/20 transition-all duration-200"
              >
                <Link to="/questionario" className="flex items-center justify-center gap-2">
                  <span>Começar Diagnóstico Gratuito</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                asChild
                variant="outline"
                className="w-full sm:w-auto border-[#FF9900] text-[#FFB84D] hover:bg-[#FF9900]/15 hover:text-[#FFB84D] text-sm font-semibold rounded-[4px] px-6 py-6"
              >
                <a href="#niveis">Ver Níveis e Planos</a>
              </Button>
              <Button
                size="lg"
                asChild
                variant="ghost"
                className="w-full sm:w-auto text-[#C7D0E0] hover:text-[#F8FAFC] hover:bg-[#16213A] text-sm font-medium rounded-[4px] px-5 py-6"
              >
                <Link to="/login">Entrada do Assinante</Link>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#24334F] flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-[#8B98B4]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3DDC74]" />
                <span>Zero alucinação (Algoritmos proprietários)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3DDC74]" />
                <span>SLA 72 horas para devolutiva</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3DDC74]" />
                <span>12 setores com parâmetros calibrados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3DDC74]" />
                <span>Acurácia 95%+ em 138 obras</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROPOSTA DE VALOR E DORES RESOLVIDAS (Seção 7.2) */}
      <section className="py-20 md:py-24 bg-[#111A2E]/60 border-b border-[#24334F] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge className="bg-[#16213A] text-[#5B9DFF] border-[#24334F] text-xs uppercase tracking-wider font-semibold">
              Diagnóstico Estratégico Determinístico
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
              As 3 Dores que Aprisionam Pequenas e Médias Empresas
            </h2>
            <p className="text-sm sm:text-base text-[#C7D0E0] leading-relaxed">
              Mais de 40 anos de liderança em reestruturações e governança comprovam: empresas não
              quebram por falta de trabalho do fundador, mas pela ausência de método determinístico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px] p-2 hover:border-[#5B9DFF]/50 transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-[4px] bg-[#FF9900]/15 text-[#FFB84D] flex items-center justify-center font-bold font-mono text-sm mb-2 border border-[#FF9900]/30">
                  01
                </div>
                <CardTitle className="text-lg text-[#F8FAFC]">Prisão do Fundador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm text-[#C7D0E0]">
                <p>
                  Todas as decisões críticas (compras, descontos, contratações e revisões de
                  propostas) dependem exclusivamente da presença física ou validação do
                  proprietário.
                </p>
                <p className="text-[#8B98B4] italic pt-2">
                  → Se você tirar 30 dias de férias, a operação perde o padrão e o faturamento
                  desaba.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px] p-2 hover:border-[#5B9DFF]/50 transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-[4px] bg-[#5B9DFF]/15 text-[#5B9DFF] flex items-center justify-center font-bold font-mono text-sm mb-2 border border-[#5B9DFF]/30">
                  02
                </div>
                <CardTitle className="text-lg text-[#F8FAFC]">Ineficiência Invisível</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm text-[#C7D0E0]">
                <p>
                  Vazamentos silenciosos de margem: glosas, horas trabalhadas não faturadas,
                  retrabalho, ociosidade de maquinário ou frota e compras emergenciais com
                  sobrepreço.
                </p>
                <p className="text-[#8B98B4] italic pt-2">
                  → Sangria contínua que não aparece nas DREs contábeis tradicionais até o caixa
                  secar.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px] p-2 hover:border-[#3DDC74]/50 transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-[4px] bg-[#3DDC74]/15 text-[#3DDC74] flex items-center justify-center font-bold font-mono text-sm mb-2 border border-[#3DDC74]/30">
                  03
                </div>
                <CardTitle className="text-lg text-[#F8FAFC]">
                  Abismo Estratégia × Execução
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm text-[#C7D0E0]">
                <p>
                  Planos elaborados em reuniões anuais morrem no dia seguinte. As lideranças não
                  sabem o custo ou margem por produto, e metas não se desdobram em rotinas 5W2H.
                </p>
                <p className="text-[#8B98B4] italic pt-2">
                  → Rituais de gestão ausentes geram dispersão de foco e paralisia operacional.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Faixa de benefícios consolidados */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-6 text-center">
            {[
              { valor: 'Zero', label: 'Alucinação de IA' },
              { valor: '40 Anos', label: 'Liderança Codificada' },
              { valor: '72h', label: 'SLA de Devolutiva' },
              { valor: '12', label: 'Setores Canônicos' },
              { valor: '95%+', label: 'Acurácia Analítica' },
              { valor: '138', label: 'Obras na Biblioteca' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-[4px] bg-[#16213A] border border-[#24334F] flex flex-col justify-center"
              >
                <div className="text-xl sm:text-2xl font-bold text-[#5B9DFF] font-heading">
                  {stat.valor}
                </div>
                <div className="text-[11px] text-[#8B98B4] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. JORNADA DETERMINÍSTICA 01–05 (Seção 7.3) */}
      <section className="py-20 md:py-24 border-b border-[#24334F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge className="bg-[#16213A] text-[#3DDC74] border-[#24334F] text-xs uppercase tracking-wider font-semibold">
              Passo a Passo
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
              A Jornada Determinística da Sua Empresa (01–05)
            </h2>
            <p className="text-sm sm:text-base text-[#C7D0E0]">
              Uma esteira clara e sequencial que transforma dores declaradas em autonomia e
              governança.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                num: '01',
                titulo: 'Diagnóstico',
                desc: 'Identificação estrutural nos 3 Pilares e Seções Setoriais com SLA de 72h.',
                highlight: true,
              },
              {
                num: '02',
                titulo: 'Resultados (Heat Map)',
                desc: 'Devolutiva executiva com mapeamento de calor das 8 áreas e causas-raiz.',
                highlight: false,
              },
              {
                num: '03',
                titulo: 'Plano de Ação',
                desc: 'Roadmap executável 5W2H priorizado e sincronizado com o Consultor Digital.',
                highlight: false,
              },
              {
                num: '04',
                titulo: 'Dashboard',
                desc: 'Acompanhamento em tempo real de KPIs setoriais, OKRs e rituais de governança.',
                highlight: false,
              },
              {
                num: '05',
                titulo: 'Biblioteca & Níveis',
                desc: 'Perguntas e respostas estratégicas, micro-lições e evolução na Escada de Valor.',
                highlight: false,
              },
            ].map((step) => (
              <div
                key={step.num}
                className={`p-5 rounded-[4px] border ${
                  step.highlight
                    ? 'bg-[#1B2742] border-[#5B9DFF]/60 shadow-lg'
                    : 'bg-[#16213A] border-[#24334F]'
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="text-2xl font-bold font-mono text-[#5B9DFF] mb-2">{step.num}</div>
                  <h3 className="font-semibold text-base text-[#F8FAFC] mb-2">{step.titulo}</h3>
                  <p className="text-xs text-[#C7D0E0] leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#24334F] text-[11px] text-[#8B98B4] flex items-center justify-between">
                  <span>Etapa {step.num}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5B9DFF]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 12 SETORES NA SEQUÊNCIA CANÔNICA (Seção 7.4 / 11) */}
      <section id="setores" className="py-20 md:py-24 bg-[#111A2E]/60 border-b border-[#24334F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge className="bg-[#16213A] text-[#FFB84D] border-[#24334F] text-xs uppercase tracking-wider font-semibold">
              Ordem Canônica Oficial
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
              12 Setores Parametrizados na Sequência Canônica
            </h2>
            <p className="text-sm sm:text-base text-[#C7D0E0]">
              Destaque prioritário para <strong className="text-[#5B9DFF]">01 Saúde</strong>,{' '}
              <strong className="text-[#5B9DFF]">02 Varejo</strong> e{' '}
              <strong className="text-[#5B9DFF]">03 Serviços Profissionais</strong>. Clique em cada
              card para alternar entre o modo fechado (dor) e aberto (intervenção determinística).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SETORES_CANONICOS_12.map((setor) => {
              const isAberto = setorAbertoId === setor.id
              return (
                <div
                  key={setor.numero}
                  className={`rounded-[4px] border transition-all duration-200 flex flex-col justify-between ${
                    setor.destaque
                      ? 'bg-[#16213A] border-[#5B9DFF]/60 shadow-md ring-1 ring-[#5B9DFF]/20'
                      : 'bg-[#16213A] border-[#24334F] hover:border-[#5B9DFF]/40'
                  }`}
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#5B9DFF] bg-[#111A2E] px-2 py-0.5 rounded-[3px] border border-[#24334F]">
                          {setor.numero}
                        </span>
                        <h3 className="font-bold text-base text-[#F8FAFC]">{setor.nome}</h3>
                      </div>
                      {setor.destaque && (
                        <Badge className="bg-[#3DDC74]/15 text-[#3DDC74] border-[#3DDC74]/30 text-[10px] font-semibold">
                          Destaque
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {setor.segmentos.slice(0, 3).map((seg) => (
                        <span
                          key={seg}
                          className="text-[10px] px-2 py-0.5 rounded-[2px] bg-[#111A2E] text-[#8B98B4] border border-[#24334F]"
                        >
                          {seg}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2">
                      {!isAberto ? (
                        <div className="space-y-2">
                          <p className="text-xs text-[#C7D0E0] leading-relaxed">
                            {setor.textoFechado}
                          </p>
                          <div className="text-[11px] font-medium text-[#3DDC74] flex items-center gap-1.5 pt-1">
                            <Sparkles className="w-3 h-3" />
                            <span>{setor.metricaChave}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 animate-fade-in bg-[#111A2E]/80 p-3 rounded-[4px] border border-[#24334F]">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#5B9DFF] tracking-wider block mb-1">
                              Intervenção Determinística:
                            </span>
                            <p className="text-xs text-[#C7D0E0] leading-relaxed">
                              {setor.textoAberto}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#FFB84D] tracking-wider block mb-1">
                              Micro-epifanias gatilho:
                            </span>
                            <ul className="text-[11px] text-[#8B98B4] space-y-1">
                              {setor.microEpifanias.map((me, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-[#FF9900]">•</span>
                                  <span>{me}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-[#24334F]/60 flex items-center justify-between text-xs mt-3">
                    <button
                      type="button"
                      onClick={() => toggleSetor(setor.id)}
                      className="text-[#5B9DFF] hover:text-[#F8FAFC] font-medium flex items-center gap-1 focus:outline-none"
                    >
                      <span>{isAberto ? 'Ver menos' : 'Ver intervenção completa'}</span>
                      {isAberto ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="h-7 text-xs text-[#C7D0E0] hover:text-white hover:bg-[#1B2742] p-1.5 rounded-[3px]"
                    >
                      <Link to={`/questionario?setor=${setor.id}`}>Diagnosticar →</Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. PROVA SOCIAL: CASES REAIS & FAIXA DE AUTORIDADE (Seção 8.4) */}
      <section className="py-20 md:py-24 border-b border-[#24334F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge className="bg-[#16213A] text-[#3DDC74] border-[#24334F] text-xs uppercase tracking-wider font-semibold">
              Resultados Validados
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
              Cases Reais de Transformação Executiva
            </h2>
            <p className="text-sm sm:text-base text-[#C7D0E0]">
              Empresas reais que saíram da asfixia operacional e destravaram crescimento exponencial
              com nossa governança determinística.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {CASES_REAIS_OFICIAIS.map((item, idx) => (
              <Card
                key={idx}
                className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px] flex flex-col justify-between hover:border-[#3DDC74]/50 transition-all"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#5B9DFF]">{item.setor}</span>
                  </div>
                  <CardTitle className="text-lg text-[#F8FAFC]">{item.empresa}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3 text-xs leading-relaxed flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div>
                      <strong className="text-[#FFB84D] block text-[11px] uppercase tracking-wider">
                        Dor Inicial:
                      </strong>
                      <span className="text-[#C7D0E0]">{item.dor}</span>
                    </div>
                    <div>
                      <strong className="text-[#5B9DFF] block text-[11px] uppercase tracking-wider">
                        Intervenção:
                      </strong>
                      <span className="text-[#C7D0E0]">{item.intervencao}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#24334F] bg-[#111A2E]/60 p-2.5 rounded-[4px]">
                    <strong className="text-[#3DDC74] block text-[11px] uppercase tracking-wider mb-0.5">
                      Resultado:
                    </strong>
                    <span className="text-[#F8FAFC] font-medium">{item.resultado}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Faixa de autoridade oficial */}
          <div className="rounded-[6px] bg-[#111A2E] border border-[#24334F] p-6 text-center space-y-4">
            <span className="text-xs uppercase font-bold text-[#5B9DFF] tracking-wider block">
              Faixa de Autoridade Executiva — Mais de 40 Anos de Liderança Codificados
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-2">
              {FAIXA_AUTORIDADE_OFICIAL.map((faixa, i) => (
                <div key={i} className="p-3 rounded-[4px] bg-[#16213A] border border-[#24334F]/70">
                  <div className="text-sm font-bold text-[#F8FAFC]">{faixa.nome}</div>
                  <div className="text-xs text-[#8B98B4] mt-1 leading-snug">{faixa.credencial}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. ESCADA DE VALOR COM VALORES OFICIAIS (Seção 8.3) */}
      <section id="niveis" className="py-20 md:py-24 bg-[#111A2E]/60 border-b border-[#24334F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge className="bg-[#16213A] text-[#FFB84D] border-[#24334F] text-xs uppercase tracking-wider font-semibold">
              Escada de Valor Oficial V1.3
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
              Três Níveis de Profundidade Estratégica
            </h2>
            <p className="text-sm sm:text-base text-[#C7D0E0]">
              Precificação oficial baseada no valor entregue (Value-Based Pricing). Sem taxas
              ocultas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {ESCADA_DE_VALOR_OFICIAL.map((plano) => (
              <Card
                key={plano.id}
                className={`flex flex-col justify-between rounded-[4px] relative transition-all ${
                  plano.destaque
                    ? 'bg-[#16213A] border-2 border-[#5B9DFF] shadow-2xl ring-1 ring-[#5B9DFF]/30'
                    : 'bg-[#16213A] border-[#24334F] shadow-sm hover:border-[#5B9DFF]/40'
                }`}
              >
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#3DDC74] hover:bg-[#3DDC74] text-[#0B1120] text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-[3px] border-none">
                      {plano.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#8B98B4] mb-2">
                    <span>{plano.nivel}</span>
                    {!plano.destaque && (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-[#24334F] text-[#C7D0E0]"
                      >
                        {plano.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold text-[#F8FAFC] font-heading">
                    {plano.nome}
                  </CardTitle>
                  <p className="text-xs text-[#5B9DFF] font-medium mt-1">{plano.subtitulo}</p>

                  <div className="pt-4 border-t border-[#24334F] mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#F8FAFC] font-mono">
                        {plano.preco}
                      </span>
                      <span className="text-xs text-[#8B98B4]">{plano.periodo}</span>
                    </div>
                    <p className="text-xs text-[#C7D0E0] mt-2 line-clamp-2">{plano.incluso}</p>
                    {plano.adicionais !== '—' && (
                      <div className="text-[11px] text-[#FFB84D] font-medium mt-2 bg-[#111A2E] p-2 rounded-[3px] border border-[#24334F]">
                        Adicionais: {plano.adicionais}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0 flex-1">
                  <div className="text-xs font-semibold text-[#8B98B4] uppercase tracking-wider mb-3">
                    O que está incluso:
                  </div>
                  <ul className="space-y-2.5">
                    {plano.itens.map((it, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[#C7D0E0]">
                        <CheckCircle2 className="w-4 h-4 text-[#3DDC74] shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <div className="p-6 pt-2">
                  <Button
                    asChild
                    className={`w-full rounded-[4px] font-semibold text-xs py-5 ${
                      plano.destaque
                        ? 'bg-[#0066CC] hover:bg-[#22B14C] text-white shadow-md'
                        : 'bg-[#111A2E] hover:bg-[#5B9DFF]/20 text-[#5B9DFF] border border-[#24334F]'
                    }`}
                  >
                    <Link to="/questionario" className="flex items-center justify-center gap-2">
                      <span>{plano.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ ADITIVA (Seção 7.7 / 12) */}
      <section className="py-20 md:py-24 border-b border-[#24334F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <Badge className="bg-[#16213A] text-[#5B9DFF] border-[#24334F] text-xs uppercase tracking-wider font-semibold">
              Perguntas Frequentes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
              Dúvidas Frequentes sobre a Metodologia
            </h2>
            <p className="text-sm text-[#C7D0E0]">
              Tudo o que você precisa saber antes de iniciar seu diagnóstico gratuito.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {FAQ_OFICIAL_V13.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-[#16213A] border border-[#24334F] rounded-[4px] px-4"
              >
                <AccordionTrigger className="text-sm font-semibold text-[#F8FAFC] hover:text-[#5B9DFF] text-left py-4">
                  {faq.pergunta}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed pb-4">
                  {faq.resposta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 9. CTA FINAL COMPLETO (Seção 7.8) */}
      <section className="py-20 bg-gradient-to-b from-[#111A2E] to-[#0B1120] text-center relative overflow-hidden">
        <div className="absolute inset-0 hex-watermark opacity-40 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Badge className="bg-[#3DDC74]/15 text-[#3DDC74] border-[#3DDC74]/30 text-xs uppercase tracking-wider font-semibold">
            Comece em Menos de 10 Minutos
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] font-heading">
            Pronto para Descobrir os Gargalos Ocultos da Sua Empresa?
          </h2>
          <p className="text-base text-[#C7D0E0] max-w-2xl mx-auto leading-relaxed">
            Inicie seu Diagnóstico Setorial Gratuito agora. Leve sua liderança a um novo patamar com
            modelos determinísticos e governança de C-Level.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto bg-[#0066CC] hover:bg-[#22B14C] text-white font-semibold rounded-[4px] px-8 py-6 shadow-xl shadow-[#0066CC]/20"
            >
              <Link to="/questionario" className="flex items-center justify-center gap-2">
                <span>Começar Diagnóstico Gratuito</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              variant="outline"
              className="w-full sm:w-auto border-[#FF9900] text-[#FFB84D] hover:bg-[#FF9900]/15 rounded-[4px] px-6 py-6"
            >
              <a href="#niveis">Ver Níveis e Planos</a>
            </Button>
            <Button
              size="lg"
              asChild
              variant="ghost"
              className="w-full sm:w-auto text-[#C7D0E0] hover:text-[#F8FAFC] hover:bg-[#16213A] rounded-[4px] px-5 py-6"
            >
              <Link to="/login">Já sou Assinante</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 10. RODAPÉ OFICIAL V1.3 — Fundo #0B1120 / #111A2E com logo negativo */}
      <footer className="border-t border-[#24334F] py-10 bg-[#0B1120] text-[#8B98B4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo variant="horizontal" size="sm" showTagline negative />
            <p className="text-xs text-[#8B98B4] mt-1">
              Expertise Executiva. Velocidade Tecnológica. Preço Acessível.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <Link to="/questionario" className="text-[#C7D0E0] hover:text-[#5B9DFF]">
              Diagnóstico Gratuito
            </Link>
            <a href="#setores" className="text-[#C7D0E0] hover:text-[#5B9DFF]">
              12 Setores
            </a>
            <a href="#niveis" className="text-[#C7D0E0] hover:text-[#5B9DFF]">
              Escada de Valor
            </a>
            <Link to="/login" className="text-[#C7D0E0] hover:text-[#5B9DFF]">
              Área do Assinante
            </Link>
          </div>
          <div className="text-xs text-center md:text-right">
            <div>© 2026 VETOR MASTER. Todos os direitos reservados.</div>
            <div className="font-mono text-[10px] text-[#3DDC74] mt-0.5">
              JBP Gestão Master V7.2 • Alinhamento V1.3
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
