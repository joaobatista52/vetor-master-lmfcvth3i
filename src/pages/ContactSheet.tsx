import React from 'react'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Activity,
  Bot,
  MessageSquare,
  ShieldCheck,
  Building2,
  Users,
  LayoutDashboard,
  Award,
  ListTodo,
  BookOpen,
  Layers,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Send,
  Eye,
  Filter,
  PlusCircle,
  FileText,
  Clock,
  Briefcase,
  AlertTriangle,
  Flame,
  Search,
  Check,
  RefreshCw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/Logo'

/**
 * CONTACT SHEET — VETOR MASTER SAAS V7.2.3
 * Grade de 10 miniaturas (thumbnails) que retratam o conteúdo macro do app SaaS Vetor Master.
 * Peça de apresentação e mapeamento visual da arquitetura de telas (Camadas 0 a 3).
 * Cada miniatura é uma representação estilizada fiel (mock em código com pointer-events-none).
 */

export default function ContactSheet() {
  return (
    <div className="min-h-screen bg-[#070D18] text-[#F8FAFC] selection:bg-[#0066CC] selection:text-white pb-20">
      {/* Barra Superior / Header de Apresentação */}
      <header className="sticky top-0 z-50 border-b border-[#1E293B] bg-[#0B1120]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo variant="horizontal" size="sm" showTagline />
            <div className="hidden sm:block h-6 w-px bg-[#24334F]" />
            <div className="hidden sm:flex items-center gap-2">
              <Badge className="bg-[#16213A] text-[#5B9DFF] border-[#24334F] text-[10px] font-mono uppercase tracking-wider">
                V7.2.3 • v0.0.115
              </Badge>
              <span className="text-xs text-[#8B98B4]">Mapeamento Macro de Telas</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Badge
              variant="outline"
              className="border-[#3DDC74]/40 bg-[#3DDC74]/10 text-[#3DDC74] text-xs font-semibold px-2.5 py-1"
            >
              10 Telas Mapeadas
            </Badge>
            <span className="text-xs text-[#8B98B4] hidden md:inline">Camadas 0, 1, 2 e 3</span>
          </div>
        </div>
      </header>

      {/* Hero / Apresentação do Contact Sheet */}
      <section className="py-10 md:py-14 border-b border-[#1E293B] bg-gradient-to-b from-[#0B1120] to-[#070D18] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#16213A] border border-[#24334F] text-[#5B9DFF] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#3DDC74]" />
            <span>VISÃO PANORÂMICA DA ARQUITETURA SAAS • VETOR MASTER</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
                Contact Sheet — Vetor Master SaaS V7.2.3
              </h1>
              <p className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
                Grade de representação estilizada em código das 10 telas fundamentais do
                ecossistema. Estrutura de seções, copys literais, portões de conversão e supervisão
                executiva distribuídos pelas quatro camadas do sistema (Institucional, Conversão,
                Assinante e Admin).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8B98B4] bg-[#0E1726] border border-[#1E293B] p-3 rounded-[4px]">
              <span className="text-[#F8FAFC] font-semibold">Legenda de Camadas:</span>
              <span className="px-1.5 py-0.5 rounded bg-[#16213A] border border-[#24334F] text-[#5B9DFF]">
                C0: Vitrine
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#16213A] border border-[#24334F] text-[#3DDC74]">
                C1: Conversão
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#16213A] border border-[#24334F] text-[#FFB84D]">
                C2: Assinante
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#16213A] border border-[#24334F] text-[#F43F5E]">
                C3: Admin
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Grade Principal dos 10 Cards (2 colunas desktop, 1 mobile) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 01 — CAMADA 0 · Home Institucional (/) */}
          <CardItemContactSheet
            numero="01"
            camada="CAMADA 0"
            rota="/"
            corCamada="blue"
            nomeTela="Home Institucional"
            legenda="Captura de leads pelo diagnóstico gratuito e Lista de Prioridade; condição de Membro Fundador com trava de preço vitalícia."
          >
            <MiniHomeInstitucional />
          </CardItemContactSheet>

          {/* 02 — CAMADA 1 · Níveis e Planos (/planos) */}
          <CardItemContactSheet
            numero="02"
            camada="CAMADA 1"
            rota="/planos"
            corCamada="green"
            nomeTela="Níveis e Planos"
            legenda="Portão comercial P3→P4 — a devolutiva gratuita exige assinatura para liberar implementação."
          >
            <MiniNiveisEPlanos />
          </CardItemContactSheet>

          {/* 03 — CAMADA 1 · Lista de Prioridade (/lista-prioridade) */}
          <CardItemContactSheet
            numero="03"
            camada="CAMADA 1"
            rota="/lista-prioridade"
            corCamada="green"
            nomeTela="Lista de Prioridade"
            legenda="Cadastro sem questionário; leads nascem com status lista_espera e membro_fundador=true; promoção a novo só por aprovação manual do Admin."
          >
            <MiniListaPrioridade />
          </CardItemContactSheet>

          {/* 04 — CAMADA 1 · Questionário Estratégico (/questionario) */}
          <CardItemContactSheet
            numero="04"
            camada="CAMADA 1"
            rota="/questionario"
            corCamada="green"
            nomeTela="Questionário Estratégico"
            legenda="12 setores, Etapas 1–11 + Etapa 12 Documentação & Anexos (3 grupos de anexos, Word/PDF/Excel, 100MB); cópia integral do PDF Consolidado 12 Setores V7.2."
          >
            <MiniQuestionarioEstrategico />
          </CardItemContactSheet>

          {/* 05 — CAMADA 2 · Home do Assinante (/app) */}
          <CardItemContactSheet
            numero="05"
            camada="CAMADA 2"
            rota="/app"
            corCamada="amber"
            nomeTela="Home do Assinante"
            legenda="Hub do assinante — jornada V1.3/V7.2 em 3 camadas com acesso rápido e métricas consolidadas."
          >
            <MiniHomeAssinante />
          </CardItemContactSheet>

          {/* 06 — CAMADA 2 · Resultados e Devolutiva (/resultados) */}
          <CardItemContactSheet
            numero="06"
            camada="CAMADA 2"
            rota="/resultados"
            corCamada="amber"
            nomeTela="Resultados e Devolutiva"
            legenda="Alinhado à Rodada 1.5: unidade canônica ETAPAS (paridade total com o site, sem dupla grade de 8); fim do gráfico de evolução fake; CTAs contextuais por perfil (Lead: 'Agendar minha Devolutiva Executiva', Assinante: 'Atualizar Diagnóstico'); isca com badge 'Demonstração'."
          >
            <MiniResultadosDevolutiva />
          </CardItemContactSheet>

          {/* 07 — CAMADA 2 · Dashboard Executivo (/dashboard) */}
          <CardItemContactSheet
            numero="07"
            camada="CAMADA 2"
            rota="/dashboard"
            corCamada="amber"
            nomeTela="Dashboard do Plano por Etapas"
            legenda="Diretriz 3 implementada na Rodada 1.5: 3 blocos determinísticos (Saúde Financeira — DRE 15 linhas CS-17, Buffett, WACC por estágio; Trilha de Etapas Fase 5; OKRs Vivos) com badges 'Demonstração' explícitos em todos os cartões."
          >
            <MiniDashboardExecutivo />
          </CardItemContactSheet>

          {/* 08 — CAMADA 2 · Plano de Ação + Consultor Digital (/plano-de-acao) */}
          <CardItemContactSheet
            numero="08"
            camada="CAMADA 2"
            rota="/plano-de-acao"
            corCamada="amber"
            nomeTela="Plano de Ação + Consultor Digital"
            legenda="Alinhado à Rodada 1.5: chat simulado com afirmações de portão superado DESATIVADO; aviso honesto de acoplamento do agente nativo jbp-gestao-master na Onda 2; plano 5W2H mantido com taxonomia canônica."
          >
            <MiniPlanoDeAcao />
          </CardItemContactSheet>

          {/* 09 — CAMADA 2 · Trilha de Etapas (/areas-da-empresa) */}
          <CardItemContactSheet
            numero="09"
            camada="CAMADA 2"
            rota="/areas-da-empresa"
            corCamada="amber"
            nomeTela="Trilha de Etapas Metodológicas"
            legenda="Substituição da antiga página demo de 8 áreas (scores/vazamentos fake eliminados): visualização da Trilha de Etapas da Metodologia JBP GM V7.2.3 com estado honesto e estrutura pronta para recepção de dados do motor na Onda 2."
          >
            <MiniAreasDaEmpresa />
          </CardItemContactSheet>

          {/* 10 — CAMADA 3 · Admin Leads (/admin/leads) */}
          <CardItemContactSheet
            numero="10"
            camada="CAMADA 3"
            rota="/admin/leads"
            corCamada="rose"
            nomeTela="Admin Leads"
            legenda="Supervisão do Admin — sync automático do site (cron 1 min), modal do dossiê completo, ações de aprovação e 'Confirmar Assinatura Membro Fundador (L7)'."
          >
            <MiniAdminLeads />
          </CardItemContactSheet>
        </div>
      </main>

      {/* Rodapé Obrigatório */}
      <footer className="border-t border-[#1E293B] pt-8 pb-12 mt-12 bg-[#0B1120] text-[#8B98B4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#F8FAFC]">
              Vetor Master SaaS • V7.2.3 • Contact Sheet Macro (Pós-Rodada 1.5)
            </div>
            <p className="text-xs text-[#8B98B4] max-w-3xl leading-relaxed">
              Retrato macro do app na v0.0.116 — V7.2.3. Rodada 1.5 concluída: Trilha de Etapas
              implementada em /areas-da-empresa e /resultados, chat fake desativado, CTAs
              contextuais por perfil e Dashboard estruturado nos 3 blocos (Saúde Financeira CS-17,
              Trilha CS-5, OKRs). Próximo passo: Onda 2 (núcleo + worker de leads da Seção 9).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className="border-[#22B14C]/40 bg-[#22B14C]/10 text-[#3DDC74] text-[11px] font-mono px-3 py-1"
            >
              Rodada 1.5 Concluída (v0.0.116)
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* =========================================================================
   COMPONENTE CONTAINER DO CARD DO CONTACT SHEET
   ========================================================================= */

interface CardItemContactSheetProps {
  numero: string
  camada: string
  rota: string
  corCamada: 'blue' | 'green' | 'amber' | 'rose'
  nomeTela: string
  legenda: string
  children: React.ReactNode
}

function CardItemContactSheet({
  numero,
  camada,
  rota,
  corCamada,
  nomeTela,
  legenda,
  children,
}: CardItemContactSheetProps) {
  const badgeStyle = {
    blue: 'border-[#5B9DFF]/40 text-[#5B9DFF] bg-[#5B9DFF]/10',
    green: 'border-[#3DDC74]/40 text-[#3DDC74] bg-[#3DDC74]/10',
    amber: 'border-[#FFB84D]/40 text-[#FFB84D] bg-[#FFB84D]/10',
    rose: 'border-[#F43F5E]/40 text-[#F43F5E] bg-[#F43F5E]/10',
  }[corCamada]

  return (
    <Card className="bg-[#0E1726] border border-[#1E293B] rounded-[6px] overflow-hidden shadow-xl hover:border-[#334155] transition-all flex flex-col justify-between">
      {/* Cabeçalho do Card */}
      <div className="p-4 sm:p-5 pb-3 border-b border-[#1E293B] bg-[#111A2E]/80">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-[3px] ${badgeStyle}`}
            >
              {camada} ({rota})
            </Badge>
          </div>
          <span className="font-mono text-base font-extrabold text-[#5B9DFF] bg-[#070D18] px-2.5 py-0.5 rounded border border-[#1E293B]">
            {numero}
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] font-heading flex items-center gap-2">
          <span>{nomeTela}</span>
        </h2>
      </div>

      {/* Área da Miniatura Estilizada (Aspect ratio ~16:10, overflow hidden, pointer-events-none) */}
      <div className="p-3 sm:p-4 bg-[#070D18]/90">
        <div className="relative w-full aspect-[16/10] overflow-hidden rounded-[4px] border border-[#24334F] bg-[#0B1120] shadow-inner pointer-events-none select-none text-[10px]">
          {children}
        </div>
      </div>

      {/* Legenda Descritiva */}
      <div className="p-4 sm:p-5 pt-3 border-t border-[#1E293B] bg-[#0E1726] flex-1 flex flex-col justify-center">
        <p className="text-xs text-[#C7D0E0] leading-relaxed">
          <span className="font-semibold text-[#8B98B4] block mb-0.5 uppercase tracking-wider text-[10px]">
            Papel da Tela & Arquitetura:
          </span>
          {legenda}
        </p>
      </div>
    </Card>
  )
}

/* =========================================================================
   01 — MINIATURA: HOME INSTITUCIONAL (/)
   ========================================================================= */

function MiniHomeInstitucional() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0B1120] text-[#F8FAFC] p-2.5 space-y-2 overflow-hidden">
      {/* Top Navbar */}
      <div className="h-5 flex items-center justify-between border-b border-[#24334F] pb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#0066CC] flex items-center justify-center text-[7px] font-bold text-white">
            V
          </div>
          <span className="font-bold text-[9px] tracking-tight text-[#F8FAFC]">VETOR MASTER</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[7px] text-[#8B98B4]">Entrar</span>
          <div className="h-3 px-1 rounded bg-[#0066CC] text-white text-[7px] flex items-center">
            Diagnóstico Gratuito
          </div>
        </div>
      </div>

      {/* Hero Box */}
      <div className="bg-[#111A2E] border border-[#24334F] rounded p-2 text-center space-y-1 relative">
        <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#16213A] border border-[#FF9900]/40 text-[#FFB84D] text-[7px] font-bold">
          <Sparkles className="w-2 h-2 text-[#FF9900]" />
          <span>FASE FUNDADORA EM CURSO</span>
        </div>
        <div className="text-[10px] font-extrabold text-[#F8FAFC] leading-tight">
          Diagnósticos estratégicos em 72h.{' '}
          <span className="text-[#5B9DFF]">Expertise de C-Level. Preço de SaaS.</span>
        </div>
        <div className="text-[7px] text-[#8B98B4] line-clamp-1">
          Fase fundadora em curso — condição de Membro Fundador disponível pela Lista de Prioridade.
        </div>
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          <div className="h-3.5 px-2 bg-[#0066CC] text-white rounded text-[7px] font-semibold flex items-center gap-0.5">
            <span>Começar Diagnóstico Gratuito</span>
            <ArrowRight className="w-2 h-2" />
          </div>
          <div className="h-3.5 px-1.5 border border-[#FF9900] text-[#FFB84D] rounded text-[7px] font-semibold flex items-center">
            Lista de Prioridade
          </div>
        </div>
      </div>

      {/* Escada de Valor (3 Planos) */}
      <div className="grid grid-cols-3 gap-1">
        <div className="bg-[#16213A] border border-[#24334F] rounded p-1 text-[7px] space-y-0.5">
          <div className="text-[#8B98B4] font-semibold">SaaS Puro</div>
          <div className="font-bold text-[#F8FAFC] font-mono">R$ 1.190/mês</div>
          <div className="text-[6px] text-[#3DDC74]">Autosserviço 100%</div>
        </div>
        <div className="bg-[#16213A] border-2 border-[#5B9DFF] rounded p-1 text-[7px] space-y-0.5 relative">
          <span className="absolute -top-1 right-1 bg-[#3DDC74] text-[#0B1120] text-[5px] font-bold px-0.5 rounded">
            Mais Escolhido
          </span>
          <div className="text-[#5B9DFF] font-semibold">MaaS Híbrido</div>
          <div className="font-bold text-[#F8FAFC] font-mono">R$ 3.290/mês</div>
          <div className="text-[6px] text-[#C7D0E0]">Mentoria + Software</div>
        </div>
        <div className="bg-[#16213A] border border-[#24334F] rounded p-1 text-[7px] space-y-0.5">
          <div className="text-[#8B98B4] font-semibold">Bespoke CaaS</div>
          <div className="font-bold text-[#F8FAFC] font-mono">R$ 15.750/mês</div>
          <div className="text-[6px] text-[#FFB84D]">Presencial C-Level</div>
        </div>
      </div>

      {/* Seção Condição Membro Fundador */}
      <div className="bg-[#111A2E]/80 border border-[#FF9900]/30 rounded p-1.5 flex items-center justify-between text-[7px]">
        <div className="flex items-center gap-1 text-[#FFB84D] font-bold">
          <Sparkles className="w-2.5 h-2.5 text-[#FF9900]" />
          <span>Condição de Membro Fundador:</span>
        </div>
        <div className="flex gap-1.5 text-[6.5px] text-[#C7D0E0]">
          <span>• Trava de preço</span>
          <span>• Checkpoint 12m</span>
          <span>• Fila prioritária</span>
          <span>• Acesso antecipado</span>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   02 — MINIATURA: NÍVEIS E PLANOS (/planos)
   ========================================================================= */

function MiniNiveisEPlanos() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0B1120] text-[#F8FAFC] p-2.5 space-y-2 overflow-hidden">
      {/* Top Banner */}
      <div className="text-center space-y-0.5 border-b border-[#24334F] pb-1">
        <div className="inline-flex items-center gap-1 text-[7px] text-[#5B9DFF] font-semibold">
          <Sparkles className="w-2 h-2 text-[#3DDC74]" />
          <span>Escada de Valor Oficial V1.3 • Vetor Master</span>
        </div>
        <div className="text-[10px] font-bold text-[#F8FAFC]">
          Níveis de Atuação e Valores Oficiais
        </div>
        <div className="text-[6.5px] text-[#8B98B4]">
          Value-Based Pricing • Portão comercial P3→P4
        </div>
      </div>

      {/* 3 Cards de Planos Oficiais */}
      <div className="grid grid-cols-3 gap-1.5 flex-1 items-stretch">
        {/* Nível 1 */}
        <div className="bg-[#16213A] border border-[#24334F] rounded p-1.5 flex flex-col justify-between text-[7px]">
          <div>
            <div className="text-[#8B98B4] text-[6.5px]">Nível 1</div>
            <div className="font-bold text-[#F8FAFC] text-[8px]">SaaS Puro</div>
            <div className="text-[6px] text-[#5B9DFF]">Consultor Digital em Autosserviço</div>
            <div className="my-1 border-t border-[#24334F] pt-0.5">
              <span className="font-mono font-bold text-[9px] text-[#F8FAFC]">R$ 1.190</span>
              <span className="text-[6px] text-[#8B98B4]">/mês</span>
            </div>
            <ul className="space-y-0.5 text-[6px] text-[#C7D0E0]">
              <li className="flex items-center gap-0.5">
                <CheckCircle2 className="w-1.5 h-1.5 text-[#3DDC74]" /> Devolutiva SLA 72h
              </li>
              <li className="flex items-center gap-0.5">
                <CheckCircle2 className="w-1.5 h-1.5 text-[#3DDC74]" /> Heat Map 8 áreas
              </li>
              <li className="flex items-center gap-0.5">
                <CheckCircle2 className="w-1.5 h-1.5 text-[#3DDC74]" /> Tarefas 5W2H
              </li>
            </ul>
          </div>
          <div className="h-3 mt-1 bg-[#111A2E] border border-[#24334F] text-[#5B9DFF] rounded text-[6px] font-semibold flex items-center justify-center">
            Lista de Prioridade
          </div>
        </div>

        {/* Nível 2 - Destaque */}
        <div className="bg-[#16213A] border-2 border-[#5B9DFF] rounded p-1.5 flex flex-col justify-between text-[7px] relative shadow-md">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-[#3DDC74] text-[#0B1120] text-[5px] font-bold px-1 rounded">
            Recomendado
          </div>
          <div>
            <div className="text-[#8B98B4] text-[6.5px]">Nível 2 — Mais Escolhido</div>
            <div className="font-bold text-[#F8FAFC] text-[8px]">MaaS Híbrido</div>
            <div className="text-[6px] text-[#5B9DFF]">Mentoria Consultiva + Software</div>
            <div className="my-1 border-t border-[#24334F] pt-0.5">
              <span className="font-mono font-bold text-[9px] text-[#F8FAFC]">R$ 3.290</span>
              <span className="text-[6px] text-[#8B98B4]">/mês</span>
            </div>
            <div className="text-[5.5px] text-[#FFB84D] bg-[#111A2E] p-0.5 rounded border border-[#24334F] mb-1">
              Extra: + R$ 890 / reunião 90m
            </div>
            <ul className="space-y-0.5 text-[6px] text-[#C7D0E0]">
              <li className="flex items-center gap-0.5">
                <CheckCircle2 className="w-1.5 h-1.5 text-[#3DDC74]" /> Tudo do SaaS Puro
              </li>
              <li className="flex items-center gap-0.5">
                <CheckCircle2 className="w-1.5 h-1.5 text-[#3DDC74]" /> 2 reuniões virtuais 90m
              </li>
              <li className="flex items-center gap-0.5">
                <CheckCircle2 className="w-1.5 h-1.5 text-[#3DDC74]" /> Validação humana por etapa
              </li>
            </ul>
          </div>
          <div className="h-3 mt-1 bg-[#0066CC] text-white rounded text-[6px] font-semibold flex items-center justify-center">
            Acelerar com MaaS
          </div>
        </div>

        {/* Nível 3 */}
        <div className="bg-[#16213A] border border-[#24334F] rounded p-1.5 flex flex-col justify-between text-[7px]">
          <div>
            <div className="text-[#8B98B4] text-[6.5px]">Nível 3</div>
            <div className="font-bold text-[#F8FAFC] text-[8px]">Bespoke CaaS</div>
            <div className="text-[6px] text-[#5B9DFF]">Consultoria C-Level Presencial</div>
            <div className="my-1 border-t border-[#24334F] pt-0.5">
              <span className="font-mono font-bold text-[9px] text-[#F8FAFC]">R$ 15.750</span>
              <span className="text-[6px] text-[#8B98B4]">/mês</span>
            </div>
            <div className="text-[5.5px] text-[#FFB84D] bg-[#111A2E] p-0.5 rounded border border-[#24334F] mb-1">
              Extra: + R$ 790 / hora presencial
            </div>
            <ul className="space-y-0.5 text-[6px] text-[#C7D0E0]">
              <li className="flex items-center gap-0.5">
                <CheckCircle2 className="w-1.5 h-1.5 text-[#3DDC74]" /> 12h/mês intervenção
              </li>
              <li className="flex items-center gap-0.5">
                <CheckCircle2 className="w-1.5 h-1.5 text-[#3DDC74]" /> Conselho & M&A
              </li>
              <li className="flex items-center gap-0.5">
                <CheckCircle2 className="w-1.5 h-1.5 text-[#3DDC74]" /> Valuation FCD
              </li>
            </ul>
          </div>
          <div className="h-3 mt-1 bg-[#111A2E] border border-[#24334F] text-[#5B9DFF] rounded text-[6px] font-semibold flex items-center justify-center">
            Falar C-Level
          </div>
        </div>
      </div>

      {/* Caixa de Garantia Metodológica */}
      <div className="bg-[#111A2E] border border-[#24334F] rounded p-1 flex items-center justify-between text-[6.5px]">
        <div className="flex items-center gap-1 text-[#3DDC74]">
          <ShieldCheck className="w-2.5 h-2.5" />
          <span>Fidelidade Metodológica: Balanced Scorecard, OKRs, Lente de Buffett</span>
        </div>
        <span className="text-[#8B98B4]">Sem alucinação</span>
      </div>
    </div>
  )
}

/* =========================================================================
   03 — MINIATURA: LISTA DE PRIORIDADE (/lista-prioridade)
   ========================================================================= */

function MiniListaPrioridade() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0B1120] text-[#F8FAFC] p-2.5 space-y-2 overflow-hidden">
      {/* Header Form */}
      <div className="text-center space-y-0.5 border-b border-[#24334F] pb-1">
        <div className="inline-flex items-center gap-1 text-[7px] text-[#FFB84D] font-bold">
          <Badge className="bg-[#FF9900]/15 text-[#FFB84D] border-[#FF9900]/30 text-[6px] py-0 px-1">
            FASE FUNDADORA
          </Badge>
          <span>Documento 2 • Lista de Prioridade SaaS</span>
        </div>
        <div className="text-[10px] font-bold text-[#F8FAFC]">
          Garanta Sua Vaga no Plano SaaS Puro
        </div>
        <div className="text-[6.5px] text-[#8B98B4]">
          R$ 1.190,00/mês • Trava de preço vitalícia • Checkpoint 12 meses
        </div>
      </div>

      {/* Formulário Mock */}
      <div className="bg-[#16213A] border border-[#24334F] rounded p-2 space-y-1.5">
        <div className="text-[7.5px] font-semibold text-[#5B9DFF] flex items-center gap-1 border-b border-[#24334F] pb-1">
          <Sparkles className="w-2 h-2 text-[#3DDC74]" />
          <span>Dados do Solicitante e da Empresa</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[6.5px]">
          <div>
            <div className="text-[#8B98B4] mb-0.5">Nome Completo *</div>
            <div className="bg-[#111A2E] border border-[#24334F] rounded h-4 px-1 flex items-center text-[#F8FAFC]">
              Carlos Mendes
            </div>
          </div>
          <div>
            <div className="text-[#8B98B4] mb-0.5">Cargo / Função *</div>
            <div className="bg-[#111A2E] border border-[#24334F] rounded h-4 px-1 flex items-center text-[#F8FAFC]">
              Sócio-Fundador
            </div>
          </div>
          <div>
            <div className="text-[#8B98B4] mb-0.5">E-mail Corporativo *</div>
            <div className="bg-[#111A2E] border border-[#24334F] rounded h-4 px-1 flex items-center text-[#F8FAFC]">
              diretoria@empresa.com.br
            </div>
          </div>
          <div>
            <div className="text-[#8B98B4] mb-0.5">WhatsApp com DDD *</div>
            <div className="bg-[#111A2E] border border-[#24334F] rounded h-4 px-1 flex items-center text-[#F8FAFC]">
              (11) 98765-4321
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-[#8B98B4] mb-0.5">Empresa / Razão Social *</div>
            <div className="bg-[#111A2E] border border-[#24334F] rounded h-4 px-1 flex items-center text-[#F8FAFC]">
              Empresa Demo Industrial Ltda
            </div>
          </div>
          <div>
            <div className="text-[#8B98B4] mb-0.5">Setor de Atuação *</div>
            <div className="bg-[#111A2E] border border-[#24334F] rounded h-4 px-1 flex items-center text-[#5B9DFF] font-semibold">
              06. Indústria de Transformação
            </div>
          </div>
          <div>
            <div className="text-[#8B98B4] mb-0.5">Faturamento Mensal *</div>
            <div className="bg-[#111A2E] border border-[#24334F] rounded h-4 px-1 flex items-center text-[#F8FAFC]">
              R$ 500k a R$ 1,5M / mês
            </div>
          </div>
        </div>

        {/* Microcopy Membro Fundador */}
        <div className="bg-[#111A2E] p-1 rounded border border-[#24334F] text-[6px] text-[#C7D0E0] space-y-0.5">
          <div className="text-[#3DDC74] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-2 h-2" />
            <span>Condição de Membro Fundador Assegurada:</span>
          </div>
          <div>
            Trava de preço vitalícia • Checkpoint mensal 12 meses • Status inicial: lista_espera
          </div>
        </div>

        <div className="h-4 bg-[#0066CC] text-white rounded text-[7px] font-bold flex items-center justify-center gap-1">
          <span>Entrar na Lista de Prioridade SaaS</span>
          <ArrowRight className="w-2 h-2" />
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   04 — MINIATURA: QUESTIONÁRIO ESTRATÉGICO (/questionario)
   ========================================================================= */

function MiniQuestionarioEstrategico() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0B1120] text-[#F8FAFC] p-2.5 space-y-2 overflow-hidden">
      {/* Topo do Questionário: Setor Selecionado & Progresso */}
      <div className="bg-[#111A2E] border border-[#24334F] rounded p-1.5 flex items-center justify-between text-[7px]">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[#5B9DFF] bg-[#16213A] px-1 py-0.2 rounded border border-[#24334F]">
            SETOR 04
          </span>
          <div>
            <span className="font-bold text-[#F8FAFC] text-[8px] block">
              Trading — Comércio Internacional
            </span>
            <span className="text-[6px] text-[#3DDC74]">SLA Devolutiva: 72 horas úteis</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[#5B9DFF] font-mono font-bold text-[8px]">Etapa 3 de 12</span>
          <div className="w-16 h-1 bg-[#16213A] rounded overflow-hidden mt-0.5">
            <div className="w-1/4 h-full bg-[#0066CC]" />
          </div>
        </div>
      </div>

      {/* Bloco de Pergunta com Seleção e Checkbox */}
      <div className="bg-[#16213A] border border-[#24334F] rounded p-2 space-y-1.5 flex-1">
        <div className="flex items-center justify-between border-b border-[#24334F] pb-1">
          <span className="font-mono text-[#5B9DFF] text-[7px] font-bold">
            Seção 1 · Identificação & Operações
          </span>
          <span className="text-[6px] text-[#8B98B4]">Obrigatória</span>
        </div>

        {/* Pergunta 1: Radio Sim / Não */}
        <div className="space-y-0.5 text-[6.5px]">
          <div className="font-semibold text-[#F8FAFC]">
            1.4 A empresa possui controle segregado de margem por canal e operação de importação?
          </div>
          <div className="flex gap-2 text-[#C7D0E0]">
            <div className="flex items-center gap-0.5">
              <div className="w-2 h-2 rounded-full border border-[#0066CC] bg-[#0066CC] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
              <span>Sim</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="w-2 h-2 rounded-full border border-[#24334F] bg-[#111A2E]" />
              <span>Não</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="w-2 h-2 rounded-full border border-[#24334F] bg-[#111A2E]" />
              <span>Parcialmente</span>
            </div>
          </div>
        </div>

        {/* Pergunta 2: Checkbox Múltipla Escolha */}
        <div className="space-y-0.5 text-[6.5px] pt-1 border-t border-[#24334F]">
          <div className="font-semibold text-[#F8FAFC]">
            1.9 Quais modalidades cambiais são operadas na rotina da trading? (Seleção múltipla)
          </div>
          <div className="grid grid-cols-2 gap-1 text-[6px] text-[#C7D0E0]">
            <div className="flex items-center gap-1 bg-[#111A2E] p-0.5 rounded border border-[#24334F]">
              <div className="w-2 h-2 rounded-sm bg-[#0066CC] flex items-center justify-center text-white text-[5px]">
                ✓
              </div>
              <span>Hedge Cambial / NDF</span>
            </div>
            <div className="flex items-center gap-1 bg-[#111A2E] p-0.5 rounded border border-[#24334F]">
              <div className="w-2 h-2 rounded-sm bg-[#0066CC] flex items-center justify-center text-white text-[5px]">
                ✓
              </div>
              <span>Câmbio Pronto (Spot)</span>
            </div>
            <div className="flex items-center gap-1 bg-[#111A2E] p-0.5 rounded border border-[#24334F]">
              <div className="w-2 h-2 rounded-sm border border-[#24334F]" />
              <span>Conta Gráfica no Exterior</span>
            </div>
            <div className="flex items-center gap-1 bg-[#111A2E] p-0.5 rounded border border-[#24334F]">
              <div className="w-2 h-2 rounded-sm border border-[#24334F]" />
              <span>ACC / ACE Financiado</span>
            </div>
          </div>
        </div>

        {/* Nota da Etapa 12 Documentação */}
        <div className="bg-[#111A2E] p-1 rounded border border-[#24334F] text-[5.5px] text-[#8B98B4] flex items-center justify-between">
          <span>Etapa 12: Anexos (Financeiros, Gerenciais, Societários • 100MB)</span>
          <span className="text-[#3DDC74]">PDF Consolidado V7.2</span>
        </div>
      </div>

      {/* Rodapé Voltar / Avançar */}
      <div className="flex items-center justify-between pt-1 border-t border-[#24334F] text-[7px]">
        <div className="px-2 py-0.5 rounded bg-[#16213A] text-[#8B98B4] border border-[#24334F]">
          ← Voltar
        </div>
        <div className="px-3 py-0.5 rounded bg-[#0066CC] text-white font-semibold flex items-center gap-1">
          <span>Avançar Etapa</span>
          <ArrowRight className="w-2 h-2" />
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   05 — MINIATURA: HOME DO ASSINANTE (/app)
   ========================================================================= */

function MiniHomeAssinante() {
  return (
    <div className="w-full h-full flex bg-[#0B1120] text-[#F8FAFC] overflow-hidden">
      {/* Sidebar Reduzida */}
      <div className="w-20 bg-[#111A2E] border-r border-[#24334F] p-1 flex flex-col justify-between shrink-0 text-[6px]">
        <div className="space-y-1">
          <div className="font-bold text-[#5B9DFF] text-[7px] pb-1 border-b border-[#24334F] flex items-center gap-0.5">
            <div className="w-2 h-2 rounded bg-[#0066CC]" />
            <span>VETOR</span>
          </div>
          <div className="space-y-0.5 text-[#C7D0E0]">
            <div className="px-1 py-0.5 rounded bg-[#16213A] text-white font-bold flex items-center gap-1">
              <Activity className="w-1.5 h-1.5 text-[#3DDC74]" /> Início
            </div>
            <div className="px-1 py-0.5 text-[#8B98B4] flex items-center gap-1">
              <Award className="w-1.5 h-1.5" /> Resultados
            </div>
            <div className="px-1 py-0.5 text-[#8B98B4] flex items-center gap-1">
              <ListTodo className="w-1.5 h-1.5" /> Plano 5W2H
            </div>
            <div className="px-1 py-0.5 text-[#8B98B4] flex items-center gap-1">
              <LayoutDashboard className="w-1.5 h-1.5" /> Dashboard
            </div>
            <div className="px-1 py-0.5 text-[#8B98B4] flex items-center gap-1">
              <Layers className="w-1.5 h-1.5" /> 8 Áreas
            </div>
            <div className="px-1 py-0.5 text-[#8B98B4] flex items-center gap-1">
              <BookOpen className="w-1.5 h-1.5" /> Biblioteca
            </div>
          </div>
        </div>
        <div className="text-[5.5px] text-[#3DDC74] border-t border-[#24334F] pt-0.5">
          V7.2 DETERMINÍSTICO
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-2 space-y-1.5 overflow-hidden flex flex-col justify-between">
        {/* Banner de Boas-Vindas */}
        <div className="bg-[#16213A] border border-[#24334F] rounded p-1.5 flex items-center justify-between text-[7px]">
          <div>
            <div className="text-[6px] font-bold text-[#0066CC] uppercase">
              Jornada de Libertação do Fundador • V7.2
            </div>
            <div className="font-bold text-[#F8FAFC] text-[8.5px]">
              Hub do Assinante Vetor Master
            </div>
          </div>
          <div className="h-3 px-1.5 bg-[#0066CC] text-white rounded text-[6px] flex items-center">
            Novo Diagnóstico
          </div>
        </div>

        {/* Jornada em 5 Passos Sequenciais */}
        <div className="bg-[#111A2E] border border-[#24334F] rounded p-1.5 space-y-1">
          <div className="text-[6px] font-bold text-[#8B98B4] uppercase">
            Jornada Determinística do Negócio (Passos 01–05)
          </div>
          <div className="grid grid-cols-5 gap-1 text-[6px]">
            <div className="bg-[#16213A] border border-[#5B9DFF] p-1 rounded text-center">
              <div className="text-[#5B9DFF] font-bold font-mono">01</div>
              <div className="font-semibold text-white">Diagnóstico</div>
            </div>
            <div className="bg-[#16213A] border border-[#24334F] p-1 rounded text-center">
              <div className="text-[#8B98B4] font-bold font-mono">02</div>
              <div>Resultados</div>
            </div>
            <div className="bg-[#16213A] border border-[#24334F] p-1 rounded text-center">
              <div className="text-[#8B98B4] font-bold font-mono">03</div>
              <div>Plano 5W2H</div>
            </div>
            <div className="bg-[#16213A] border border-[#24334F] p-1 rounded text-center">
              <div className="text-[#8B98B4] font-bold font-mono">04</div>
              <div>Dashboard</div>
            </div>
            <div className="bg-[#16213A] border border-[#24334F] p-1 rounded text-center">
              <div className="text-[#8B98B4] font-bold font-mono">05</div>
              <div>Biblioteca</div>
            </div>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-[#16213A] border border-[#24334F] rounded p-1 text-[7px]">
            <div className="text-[#8B98B4] text-[6px]">Score Liberdade</div>
            <div className="font-bold text-[#F8FAFC] text-[10px] font-mono">68%</div>
            <div className="text-[#3DDC74] text-[5.5px]">+12% autonomia</div>
          </div>
          <div className="bg-[#16213A] border border-[#24334F] rounded p-1 text-[7px]">
            <div className="text-[#8B98B4] text-[6px]">Plano 5W2H</div>
            <div className="font-bold text-[#F8FAFC] text-[10px] font-mono">7 ativas</div>
            <div className="text-[#FFB84D] text-[5.5px]">3 esta semana</div>
          </div>
          <div className="bg-[#16213A] border border-[#24334F] rounded p-1 text-[7px]">
            <div className="text-[#8B98B4] text-[6px]">Áreas Mapeadas</div>
            <div className="font-bold text-[#F8FAFC] text-[10px] font-mono">8 / 8</div>
            <div className="text-[#5B9DFF] text-[5.5px]">Metodologia V7.2</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   06 — MINIATURA: RESULTADOS E DEVOLUTIVA (/resultados)
   ========================================================================= */

function MiniResultadosDevolutiva() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0B1120] text-[#F8FAFC] p-2.5 space-y-2 overflow-hidden">
      {/* Banner Passo 03 com CTA Contextual */}
      <div className="bg-[#111A2E] border border-[#24334F] rounded p-1.5 flex items-center justify-between text-[7px]">
        <div>
          <span className="text-[6px] font-bold text-[#5B9DFF] uppercase tracking-wider block">
            Passo 03 • Unidade Canônica: Etapas (V7.2)
          </span>
          <span className="font-bold text-[#F8FAFC] text-[8.5px]">
            Resultados e Devolutiva Executiva
          </span>
        </div>
        <div className="text-[6px] text-[#3DDC74] bg-[#22B14C]/20 border border-[#22B14C]/30 px-1 py-0.5 rounded font-semibold">
          CTA: Agendar Devolutiva
        </div>
      </div>

      {/* Trilha Canônica de Etapas (Paridade Total com o Site) */}
      <div className="bg-[#16213A] border border-[#24334F] rounded p-1.5 space-y-1">
        <div className="flex items-center justify-between text-[6.5px]">
          <span className="font-bold text-[#F8FAFC] flex items-center gap-1">
            <Layers className="w-2 h-2 text-[#5B9DFF]" />
            Trilha de Etapas da Metodologia (Fases 1 a 8)
          </span>
          <span className="text-[5.5px] text-[#5B9DFF] bg-[#111A2E] px-1 py-0.2 rounded border border-[#24334F]">
            Demonstração
          </span>
        </div>

        {/* 8 Etapas Canônicas */}
        <div className="grid grid-cols-4 gap-1">
          {[
            'Etapa 01 · Diagnóstico',
            'Etapa 02 · Estratégia',
            'Etapa 03 · Capacidade',
            'Etapa 04 · Governança',
            'Etapa 05 · Roadmap',
            'Etapa 06 · Finanças',
            'Etapa 07 · Riscos',
            'Etapa 08 · Foresight',
          ].map((et, i) => (
            <div
              key={i}
              className="bg-[#111A2E] border border-[#24334F] p-1 rounded text-[5.5px] flex flex-col justify-between"
            >
              <span className="font-mono text-[#5B9DFF] font-bold">P0{i + 1}</span>
              <span className="text-white truncate font-medium">{et.split('·')[1]?.trim()}</span>
              <span className="text-[5px] text-[#8B98B4]">Aguardando</span>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnóstico Executivo com Badge Demonstração Explícito */}
      <div className="bg-[#111A2E] border border-[#24334F] rounded p-1.5 text-[6.5px] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#F8FAFC] flex items-center gap-1">
            <FileText className="w-2 h-2 text-[#5B9DFF]" />
            Diagnóstico Executivo (Isca Gratuita)
          </span>
          <span className="text-[5.5px] text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1 py-0.2 rounded">
            Demonstração (Motor V7.2 em Onda 2)
          </span>
        </div>
        <p className="text-[#C7D0E0] line-clamp-1">
          Análise preliminar de vazamentos estruturais mapeados pelas lentes de Hackman e Buffett.
        </p>
      </div>

      {/* Solução Completa V7.2 */}
      <div className="bg-[#1B2742] border border-[#24334F] rounded p-1.5 flex items-center justify-between text-[7px]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-2.5 h-2.5 text-[#3DDC74]" />
          <div>
            <div className="font-bold text-white text-[7.5px]">Solução Completa V7.2</div>
            <div className="text-[6px] text-[#8B98B4]">
              Desbloqueie roadmap 5W2H e DRE de 15 linhas
            </div>
          </div>
        </div>
        <div className="h-3.5 px-2 bg-[#0066CC] text-white rounded text-[6px] font-bold flex items-center">
          Atualizar Diagnóstico
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   07 — MINIATURA: DASHBOARD EXECUTIVO (/dashboard)
   ========================================================================= */

function MiniDashboardExecutivo() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0B1120] text-[#F8FAFC] p-2.5 space-y-2 overflow-hidden">
      {/* Banner Integrado */}
      <div className="bg-[#111A2E] border border-[#24334F] rounded p-1.5 flex items-center justify-between text-[7px]">
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#F8FAFC] text-[8.5px]">
              Dashboard Executivo Integrado
            </span>
            <Badge className="bg-[#0066CC]/20 text-[#5B9DFF] border-[#0066CC]/30 text-[5.5px] px-1 py-0">
              Determinístico
            </Badge>
          </div>
          <div className="text-[6px] text-[#8B98B4]">
            Monitoramento de KPIs setoriais e velocidade de execução
          </div>
        </div>
        <div className="text-[6px] text-[#3DDC74] font-mono bg-[#16213A] px-1.5 py-0.5 rounded border border-[#24334F]">
          Trading / Atacado
        </div>
      </div>

      {/* Abas: Desempenho do Negócio / Evolução do Plano */}
      <div className="flex items-center gap-1 border-b border-[#24334F] pb-0.5 text-[6.5px]">
        <div className="font-bold text-[#5B9DFF] border-b border-[#5B9DFF] pb-0.5 px-1">
          Desempenho do Negócio
        </div>
        <div className="text-[#8B98B4] px-1">Evolução do Plano 5W2H</div>
      </div>

      {/* Cards de Indicadores (Saudável, Atenção, Crítico) com Mini Barras */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-[#16213A] border border-emerald-500/30 rounded p-1 space-y-0.5 text-[6.5px]">
          <div className="flex items-center justify-between">
            <span className="text-[#8B98B4] text-[6px]">Margem Bruta</span>
            <span className="text-[5.5px] text-emerald-400 bg-emerald-500/10 px-0.5 rounded">
              Saudável
            </span>
          </div>
          <div className="text-[9px] font-bold font-mono text-white">28.4%</div>
          <div className="flex items-end gap-0.5 h-2.5 pt-0.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-t" />
            <div className="w-1.5 h-2 bg-emerald-500 rounded-t" />
            <div className="w-1.5 h-2.5 bg-emerald-500 rounded-t" />
          </div>
        </div>

        <div className="bg-[#16213A] border border-[#FF9900]/30 rounded p-1 space-y-0.5 text-[6.5px]">
          <div className="flex items-center justify-between">
            <span className="text-[#8B98B4] text-[6px]">Prazo Médio Rec.</span>
            <span className="text-[5.5px] text-[#FFB84D] bg-[#FF9900]/10 px-0.5 rounded">
              Atenção
            </span>
          </div>
          <div className="text-[9px] font-bold font-mono text-white">48 dias</div>
          <div className="flex items-end gap-0.5 h-2.5 pt-0.5">
            <div className="w-1.5 h-2 bg-[#FF9900] rounded-t" />
            <div className="w-1.5 h-2.5 bg-[#FF9900] rounded-t" />
            <div className="w-1.5 h-1.5 bg-[#FF9900] rounded-t" />
          </div>
        </div>

        <div className="bg-[#16213A] border border-rose-500/30 rounded p-1 space-y-0.5 text-[6.5px]">
          <div className="flex items-center justify-between">
            <span className="text-[#8B98B4] text-[6px]">Ruptura Curva A</span>
            <span className="text-[5.5px] text-rose-400 bg-rose-500/10 px-0.5 rounded">
              Crítico
            </span>
          </div>
          <div className="text-[9px] font-bold font-mono text-white">6.8%</div>
          <div className="flex items-end gap-0.5 h-2.5 pt-0.5">
            <div className="w-1.5 h-2.5 bg-rose-500 rounded-t" />
            <div className="w-1.5 h-2 bg-rose-500 rounded-t" />
            <div className="w-1.5 h-2.5 bg-rose-500 rounded-t" />
          </div>
        </div>
      </div>

      {/* Painel Mapa de Prioridades · Gargalos de Maior Impacto Financeiro */}
      <div className="bg-[#111A2E] border border-[#24334F] rounded p-1.5 space-y-1 text-[6.5px]">
        <div className="flex items-center justify-between text-[#FFB84D] font-bold text-[7px]">
          <span className="flex items-center gap-1">
            <Flame className="w-2.5 h-2.5 text-[#FF9900]" />
            Mapa de Prioridades · Gargalos de Maior Impacto Financeiro
          </span>
          <span className="text-[5.5px] text-[#8B98B4]">Contexto V7.2 §6</span>
        </div>
        <div className="space-y-0.5 text-[#C7D0E0]">
          <div className="bg-[#16213A] p-1 rounded flex items-center justify-between">
            <span>1. Descasamento Cambial Spot × NDF sem trava automática</span>
            <span className="text-[#FFB84D] font-mono">Impacto: Alto</span>
          </div>
          <div className="bg-[#16213A] p-1 rounded flex items-center justify-between">
            <span>2. Inadimplência em operações com prazo superior a 60 dias</span>
            <span className="text-rose-400 font-mono">Impacto: Crítico</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   08 — MINIATURA: PLANO DE AÇÃO + CONSULTOR DIGITAL (/plano-de-acao)
   ========================================================================= */

function MiniPlanoDeAcao() {
  return (
    <div className="w-full h-full flex bg-[#0B1120] text-[#F8FAFC] p-2 space-x-2 overflow-hidden">
      {/* Coluna 1: Tabela 5W2H */}
      <div className="flex-1 flex flex-col justify-between space-y-1.5">
        <div className="bg-[#111A2E] border border-[#24334F] rounded p-1 flex items-center justify-between text-[7px]">
          <div>
            <span className="text-[6px] font-bold text-[#0066CC] uppercase">
              Passo 04 da Jornada
            </span>
            <div className="font-bold text-[#F8FAFC] text-[8px]">
              Plano de Ação 5W2H Estratégico
            </div>
          </div>
          <Badge className="bg-[#22B14C]/20 text-[#3DDC74] border-[#22B14C]/30 text-[5.5px] px-1 py-0">
            Hoshin Kanri
          </Badge>
        </div>

        {/* Tabela Mock 5W2H com 4 linhas */}
        <div className="bg-[#16213A] border border-[#24334F] rounded overflow-hidden text-[6px]">
          <div className="grid grid-cols-4 bg-[#111A2E] p-1 font-bold text-[#8B98B4] border-b border-[#24334F]">
            <span>O Quê (What)</span>
            <span>Quem (Who)</span>
            <span>Prazo (When)</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-[#24334F]/60 text-[#C7D0E0]">
            <div className="grid grid-cols-4 p-1 items-center">
              <span className="truncate">Matriz de Delegação e Alçadas</span>
              <span>Fundador / RH</span>
              <span>30 dias</span>
              <span className="text-right text-[#3DDC74] font-semibold">Concluído</span>
            </div>
            <div className="grid grid-cols-4 p-1 items-center">
              <span className="truncate">Automação de Inadimplência</span>
              <span>Controller</span>
              <span>45 dias</span>
              <span className="text-right text-[#5B9DFF] font-semibold">Em Curso</span>
            </div>
            <div className="grid grid-cols-4 p-1 items-center">
              <span className="truncate">Comitê Quinzenal com OKRs</span>
              <span>CEO + Líderes</span>
              <span>60 dias</span>
              <span className="text-right text-[#FFB84D] font-semibold">A Fazer</span>
            </div>
            <div className="grid grid-cols-4 p-1 items-center">
              <span className="truncate">Trava de Ruptura de Estoque</span>
              <span>Suprimentos</span>
              <span>90 dias</span>
              <span className="text-right text-[#8B98B4]">Pendente</span>
            </div>
          </div>
        </div>

        <div className="text-[5.5px] text-[#8B98B4] italic">
          Cadência determinística auditável: desdobramento por curto, médio e longo prazo.
        </div>
      </div>

      {/* Coluna 2: Consultor Digital Desativado (Honesto — Onda 2) */}
      <div className="w-36 bg-[#16213A] border border-[#24334F] rounded p-1.5 flex flex-col justify-between text-[6.5px]">
        <div className="border-b border-[#24334F] pb-1 space-y-0.5">
          <div className="font-bold text-[#F8FAFC] flex items-center gap-1 text-[7px]">
            <Bot className="w-2.5 h-2.5 text-[#FFB84D]" />
            <span>Consultor Digital</span>
          </div>
          <div className="text-[5.5px] text-[#FFB84D] font-mono">Retorna na Onda 2</div>
        </div>

        {/* Aviso de Desativação e Alinhamento */}
        <div className="space-y-1 my-1 overflow-hidden bg-[#111A2E] p-1.5 rounded border border-[#24334F] text-[5.5px]">
          <span className="font-bold text-[#FFB84D] block text-[6px]">Status Rodada 1.5:</span>
          <p className="text-[#8B98B4] leading-tight">
            Chat fake desativado. Agente nativo{' '}
            <code className="text-[#5B9DFF]">jbp-gestao-master</code> será conectado na Onda 2 sem
            afirmações simuladas.
          </p>
        </div>

        {/* Rodapé informativo */}
        <div className="h-4 bg-[#111A2E] border border-[#24334F] rounded px-1 flex items-center justify-center text-[5.5px] text-[#8B98B4]">
          <span>Acoplamento Onda 2</span>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   09 — MINIATURA: TRILHA DE ETAPAS (/areas-da-empresa)
   ========================================================================= */

function MiniAreasDaEmpresa() {
  const etapas = [
    { num: '01', nome: 'Diagnóstico & Epifania', foco: 'Hackman & Foresight' },
    { num: '02', nome: 'Estratégia & Moat', foco: 'Lente de Buffett' },
    { num: '03', nome: 'Capacidade & Gargalos', foco: 'Teoria das Restrições' },
    { num: '04', nome: 'Governança & Alçadas', foco: 'Matriz RACI e Alçadas' },
    { num: '05', nome: 'Roadmap & 5W2H', foco: 'Execução e OKRs' },
    { num: '06', nome: 'Finanças & DRE 15L', foco: 'WACC e Valuation' },
    { num: '07', nome: 'Riscos & Compliance', foco: 'Matriz de Risco e LGPD' },
    { num: '08', nome: 'Foresight & Perpetuidade', foco: 'Cone dos Futuros' },
  ]

  return (
    <div className="w-full h-full flex flex-col bg-[#0B1120] text-[#F8FAFC] p-2.5 space-y-2 overflow-hidden">
      {/* Topo */}
      <div className="flex items-center justify-between border-b border-[#24334F] pb-1 text-[7px]">
        <div>
          <span className="text-[6px] font-bold text-[#5B9DFF] uppercase tracking-wider block">
            Camada 2 • Trilha de Etapas Metodológicas
          </span>
          <span className="font-bold text-[#F8FAFC] text-[8.5px]">
            Plano Pautado por Etapas (Substituição de 8 Áreas)
          </span>
        </div>
        <div className="text-[5.5px] text-[#5B9DFF] bg-[#111A2E] px-1 py-0.2 rounded border border-[#24334F]">
          Demonstração Estrutural
        </div>
      </div>

      {/* Grade de 8 Etapas Canônicas */}
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {etapas.map((et) => {
          return (
            <div
              key={et.num}
              className="bg-[#16213A] border border-[#24334F] rounded p-1 flex flex-col justify-between text-[6.5px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#5B9DFF] text-[6px] font-bold">Fase {et.num}</span>
                <span className="text-[5px] text-[#8B98B4] font-mono">P{et.num}</span>
              </div>
              <div className="font-semibold text-white truncate text-[7px]">{et.nome}</div>
              <div className="text-[5.5px] text-[#8B98B4] truncate">{et.foco}</div>
              <div className="pt-0.5 border-t border-[#24334F] flex items-center justify-between text-[5px] text-[#8B98B4]">
                <span>Status</span>
                <span className="text-[#5B9DFF]">Aguardando</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detalhe de Honestidade Visual */}
      <div className="bg-[#111A2E] border border-[#24334F] rounded p-1.5 text-[6.5px] space-y-0.5">
        <div className="text-[#3DDC74] font-bold flex items-center gap-1 text-[7px]">
          <ShieldCheck className="w-2 h-2 text-[#3DDC74]" />
          <span>Honestidade Visual:</span>
        </div>
        <div className="text-[#C7D0E0] text-[6px] line-clamp-1">
          Scores hardcoded eliminados. Etapas prontas para recepção de dados reais do motor na Onda
          2.
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   10 — MINIATURA: ADMIN LEADS (/admin/leads)
   ========================================================================= */

function MiniAdminLeads() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0B1120] text-[#F8FAFC] p-2.5 space-y-2 overflow-hidden">
      {/* Topo com Título e Ações */}
      <div className="bg-[#111A2E] border border-[#24334F] rounded p-1.5 flex items-center justify-between text-[7px]">
        <div>
          <span className="text-[6px] font-bold text-[#FF9900] uppercase block">
            Supervisão Admin • Fluxo B Integrado
          </span>
          <div className="font-bold text-[#F8FAFC] text-[8.5px] flex items-center gap-1">
            <Users className="w-2.5 h-2.5 text-[#0066CC]" />
            <span>Fila de Leads & Sessões do Site</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 px-1.5 bg-[#0066CC] text-white rounded text-[6px] font-semibold flex items-center gap-0.5">
            <RefreshCw className="w-1.5 h-1.5" />
            <span>Sincronizar (1m)</span>
          </div>
          <div className="h-3 px-1.5 bg-[#16213A] border border-[#24334F] text-[#FFB84D] rounded text-[6px] font-semibold flex items-center">
            Gerar Lead E2E
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex items-center gap-1 text-[6px] overflow-hidden">
        <div className="bg-[#16213A] px-1.5 py-0.5 rounded border border-[#5B9DFF] text-white font-bold">
          Todos (4)
        </div>
        <div className="bg-[#111A2E] px-1.5 py-0.5 rounded border border-[#24334F] text-[#8B98B4]">
          Ativos (3)
        </div>
        <div className="bg-[#111A2E] px-1.5 py-0.5 rounded border border-[#24334F] text-[#5B9DFF]">
          Novo (1)
        </div>
        <div className="bg-[#111A2E] px-1.5 py-0.5 rounded border border-[#24334F] text-[#FFB84D]">
          Lista de Espera (1)
        </div>
        <div className="bg-[#111A2E] px-1.5 py-0.5 rounded border border-[#24334F] text-[#3DDC74]">
          Concluído (1)
        </div>
        <div className="bg-[#111A2E] px-1.5 py-0.5 rounded border border-[#24334F] text-rose-400">
          Teste (1)
        </div>
      </div>

      {/* Tabela de Leads com 4 Linhas Fictícias */}
      <div className="bg-[#16213A] border border-[#24334F] rounded overflow-hidden text-[6px] flex-1">
        <div className="grid grid-cols-5 bg-[#111A2E] p-1 font-bold text-[#8B98B4] border-b border-[#24334F]">
          <span>Lead / Empresa</span>
          <span>Setor</span>
          <span>Origem</span>
          <span>Status</span>
          <span className="text-right">Ação Admin</span>
        </div>
        <div className="divide-y divide-[#24334F]/60 text-[#C7D0E0]">
          {/* Linha 1: Novo com Membro Fundador */}
          <div className="grid grid-cols-5 p-1 items-center">
            <div className="truncate">
              <span className="font-bold text-white block truncate">Lead Exemplo Indústria</span>
              <span className="text-[5px] text-[#8B98B4]">lead.ind@exemplo.com</span>
            </div>
            <span className="truncate">06. Indústria</span>
            <span className="text-[#3DDC74]">Site V7.2</span>
            <div>
              <span className="bg-[#0066CC]/20 text-[#5B9DFF] border border-[#0066CC]/30 px-1 py-0.2 rounded text-[5px] font-bold">
                Novo
              </span>
              <span className="ml-0.5 bg-[#FF9900]/20 text-[#FFB84D] px-0.5 rounded text-[4.5px]">
                Membro Fundador
              </span>
            </div>
            <span className="text-right text-[#5B9DFF] font-semibold">Ver Dossiê</span>
          </div>

          {/* Linha 2: Lista de Espera */}
          <div className="grid grid-cols-5 p-1 items-center">
            <div className="truncate">
              <span className="font-bold text-white block truncate">Logística Express Demo</span>
              <span className="text-[5px] text-[#8B98B4]">diretoria@logdemo.com</span>
            </div>
            <span className="truncate">05. Logística</span>
            <span className="text-[#FFB84D]">Lista Prioridade</span>
            <div>
              <span className="bg-[#FF9900]/20 text-[#FFB84D] border border-[#FF9900]/30 px-1 py-0.2 rounded text-[5px] font-bold">
                Lista de Espera
              </span>
            </div>
            <span className="text-right text-[#3DDC74] font-semibold">Aprovar</span>
          </div>

          {/* Linha 3: Concluído */}
          <div className="grid grid-cols-5 p-1 items-center">
            <div className="truncate">
              <span className="font-bold text-white block truncate">Hospital Geral Modelo</span>
              <span className="text-[5px] text-[#8B98B4]">contato@hospital.com</span>
            </div>
            <span className="truncate">01. Saúde</span>
            <span className="text-[#3DDC74]">Site V7.2</span>
            <div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded text-[5px] font-bold">
                Concluído
              </span>
            </div>
            <span className="text-right text-[#8B98B4]">Assinatura L7</span>
          </div>

          {/* Linha 4: Teste E2E */}
          <div className="grid grid-cols-5 p-1 items-center">
            <div className="truncate">
              <span className="font-bold text-white block truncate">Lead Teste E2E Auto</span>
              <span className="text-[5px] text-[#8B98B4]">teste@vetormaster.com</span>
            </div>
            <span className="truncate">04. Trading</span>
            <span className="text-[#8B98B4]">Robô Cron</span>
            <div>
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1 py-0.2 rounded text-[5px] font-bold">
                Teste
              </span>
            </div>
            <span className="text-right text-rose-400">Expurgar</span>
          </div>
        </div>
      </div>

      {/* Nota de Supervisão */}
      <div className="text-[5.5px] text-[#8B98B4] flex items-center justify-between pt-0.5">
        <span>
          Poller a cada 1 minuto • Zero importador .json • Acesso integral a respostas e anexos
        </span>
        <span className="text-[#3DDC74]">Conexão Ativa</span>
      </div>
    </div>
  )
}
