import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Sparkles, BrainCircuit, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/Logo'
import { strategicAreas } from '@/lib/strategic-areas'
import { setores } from '@/data/setores-questionario'
import { fasesStateMachineV65, escadaDeValor } from '@/data/master-framework-v65'

const howItWorks = [
  {
    num: '01',
    title: 'Questionário Setorial',
    desc: 'Selecione seu setor (10 disponíveis) e responda ao Questionário Estrutural dos 3 Pilares.',
  },
  {
    num: '02',
    title: 'Diagnóstico com IA V6.5',
    desc: 'Nosso Expert processa as 8 Fases e cruza seus dados com 138 obras da Biblioteca proprietária.',
  },
  {
    num: '03',
    title: 'Solução Assistida',
    desc: 'Receba diagnóstico, plano 5W2H e OKRs — entrega dirigida, não receituário.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Logo className="h-10" showText={false} />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild className="gap-2">
              <Link to="/questionario">
                Iniciar Diagnóstico <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[hsl(215_28%_17%)] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215_28%_17%)] via-[hsl(215_28%_20%)] to-[hsl(217_91%_60%)]/20" />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              <Sparkles className="w-3 h-3 mr-1" /> JBP Gestão Master V 6.5
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Supere a Prisão do Fundador e Escale sua Empresa
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl">
              A metodologia Vetor Master opera em 8 Fases sequenciais, com Motor Determinístico de
              Valuation e lentes de Hackman e Buffett, para diagnosticar gargalos estratégicos e
              gerar planos de ação assistidos por IA.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link to="/questionario">
                  Iniciar Diagnóstico Gratuito <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap gap-8 text-sm text-white/60">
              {['Diagnóstico em 8 áreas', 'Relatório estratégico com IA', 'Plano de ação 5W2H'].map(
                (t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(160_84%_39%)]" /> {t}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10 Setores Atendidos */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">
              <Layers className="w-3 h-3 mr-1" /> Bloco Setorial Parametrizável
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">10 Setores Atendidos</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Cada setor possui um Questionário Estrutural dos 3 Pilares — Prisão do Fundador,
              Ineficiência Invisível e Abismo Estratégia vs. Execução — com micro-epifanias
              específicas que revelam vazamentos invisíveis.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {setores.map((s) => (
              <Card
                key={s.id}
                className="group transition-all hover:shadow-md hover:border-primary/30 text-center"
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm leading-tight">{s.nome}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {s.segmentos.slice(0, 3).join(' · ')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8 Áreas / Heatmap */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">8 Áreas que Mudam Negócios</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Cada área estratégica esconde um gargalo. Responda com honestidade e descubra onde sua
              empresa está presa.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {strategicAreas.map((area) => (
              <Card
                key={area.numero}
                className="group transition-all hover:shadow-lg hover:border-primary/30"
              >
                <CardHeader>
                  <div className={`inline-flex p-3 rounded-xl ${area.bg} ${area.cor} w-fit`}>
                    <area.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="mt-3 text-lg">{area.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-foreground mb-2 text-sm">{area.dor}</p>
                  <p className="text-sm text-muted-foreground italic">"{area.epifania}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8 Fases — State Machine */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">As 8 Fases do Método Proprietário</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Da Micro-epifania ao Moat tecnológico — uma State Machine unificada que integra
              diagnóstico, foresight, estratégia, capacidade, execução, finanças, governança e
              inovação.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fasesStateMachineV65.map((fase) => (
              <Card key={fase.numero} className="border-l-4 border-l-primary/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-primary tabular-nums">
                      FASE {fase.numero}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight mb-1">{fase.titulo}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">{fase.foco}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Escada de Valor */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Escada de Valor</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Value-Based Pricing em três níveis de profundidade. Do SaaS puro ao Bespoke sob
              demanda.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {escadaDeValor.map((nivel) => (
              <Card key={nivel.nivel} className="text-center">
                <CardHeader>
                  <Badge variant="secondary" className="mx-auto w-fit">
                    {nivel.nivel}
                  </Badge>
                  <CardTitle className="text-lg mt-2">{nivel.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{nivel.descricao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Como Funciona</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.num} className="text-center">
                <div className="text-5xl font-bold text-primary/20 mb-3">{step.num}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <Card className="relative overflow-hidden bg-[hsl(215_28%_17%)] text-white border-0">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BrainCircuit className="w-40 h-40" />
            </div>
            <CardContent className="relative z-10 p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-3">Pronto para Descobrir Seus Gargalos?</h2>
              <p className="text-white/70 mb-6 max-w-xl">
                Inicie seu diagnóstico setorial gratuito agora. Leva menos de 10 minutos e pode
                transformar a trajetória da sua empresa.
              </p>
              <Button size="lg" asChild className="gap-2">
                <Link to="/questionario">
                  Iniciar Diagnóstico <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo className="h-8" showText={false} />
          <p className="text-sm text-muted-foreground">
            © 2026 Vetor Master. JBP Gestão Master V 6.5.
          </p>
        </div>
      </footer>
    </div>
  )
}
