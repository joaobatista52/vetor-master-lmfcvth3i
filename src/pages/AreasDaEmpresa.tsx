import React, { useState } from 'react'
import {
  Compass,
  CheckCircle2,
  ListTodo,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  User,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'
import { fasesStateMachineV72 } from '@/data/master-framework-v72'

/**
 * TRILHA DE ETAPAS DA METODOLOGIA JBP GESTÃO MASTER V7.2.3
 * (Substitui a antiga página demo de 8 áreas /areas-da-empresa com scores e vazamentos hardcoded)
 *
 * Exibe a trilha canônica de Etapas da metodologia (Fase 1 a 8), pautada por Etapas e Fases reais.
 * Estado honesto: sem scores ou tarefas fictícias gravadas.
 * Estrutura pronta para o motor alimentar progresso/dono/prazo por Etapa na Onda 2.
 */
export default function AreasDaEmpresa() {
  const [etapaAtivaIdx, setEtapaAtivaIdx] = useState<number>(0)
  const etapaSelecionada = fasesStateMachineV72[etapaAtivaIdx] || fasesStateMachineV72[0]

  return (
    <div className="space-y-8 animate-fade-in text-[#F8FAFC]">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#24334F] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#16213A] border border-[#24334F] text-[#5B9DFF] text-xs font-semibold mb-2">
            <span>CAMADA 2 • TRILHA DE ETAPAS METODOLÓGICAS (V7.2.3)</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F8FAFC] font-heading">
            Trilha de Etapas & Execução do Plano
          </h1>
          <p className="text-xs sm:text-sm text-[#C7D0E0] mt-1">
            Plano pautado pela sequência das 8 Fases do protocolo JBP Gestão Master V7.2:
            diagnóstico, estratégia, capacidade, roadmap, validação financeira, governança e
            tecnologia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs font-semibold"
          >
            <Link to="/plano-de-acao" className="flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5" />
              <span>Ver Plano 5W2H Completo</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Banner de Estado Honesto / Demonstração */}
      <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#24334F] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#5B9DFF] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#5B9DFF]/15 text-[#5B9DFF] border-[#5B9DFF]/30 text-[10px] font-semibold">
                Demonstração Estrutural
              </Badge>
              <span className="font-semibold text-[#F8FAFC]">
                Trilha estruturada para recepção do diagnóstico real (Onda 2)
              </span>
            </div>
            <p className="text-[#8B98B4] leading-relaxed">
              Esta visualização substitui a antiga grade estática de 8 áreas da empresa com scores
              fictícios. Em conformidade com a <strong>Rodada 1.5</strong>, nenhum dado fake é
              exibido: as etapas abaixo refletem a arquitetura canônica da metodologia e serão
              alimentadas automaticamente pelo motor conforme o diagnóstico real do assinante for
              processado na Onda 2.
            </p>
          </div>
        </div>
      </div>

      {/* Grid das 8 Etapas — Navegação Horizontal / Rápida */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {fasesStateMachineV72.map((fase, idx) => {
          const isSelected = idx === etapaAtivaIdx
          return (
            <button
              type="button"
              key={fase.numero}
              onClick={() => setEtapaAtivaIdx(idx)}
              className={`p-3 rounded-[4px] border text-left transition-all ${
                isSelected
                  ? 'bg-[#1B2742] border-[#5B9DFF] shadow-lg ring-1 ring-[#5B9DFF]/30'
                  : 'bg-[#16213A] border-[#24334F] hover:border-[#5B9DFF]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] font-bold text-[#5B9DFF]">
                  0{fase.numero}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] border-[#24334F] text-[#8B98B4] font-mono px-1 py-0"
                >
                  Fase {fase.numero}
                </Badge>
              </div>
              <div className="text-xs font-semibold text-[#F8FAFC] line-clamp-2 leading-tight">
                {fase.titulo}
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-[#8B98B4]">
                <span>Progresso</span>
                <span className="font-mono text-[#5B9DFF]">Aguardando</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Detalhe da Etapa Selecionada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Escopo Metodológico, Lentes e Tarefas Reais */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#16213A] border-[#24334F] rounded-[4px] text-[#F8FAFC]">
            <CardHeader className="border-b border-[#24334F] pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold text-[#5B9DFF] bg-[#111A2E] px-2.5 py-1 rounded-[3px] border border-[#24334F]">
                  Fase 0{etapaSelecionada.numero}
                </span>
                <div>
                  <CardTitle className="text-lg text-[#F8FAFC]">
                    {etapaSelecionada.titulo}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#8B98B4] mt-0.5">
                    Foco: {etapaSelecionada.foco}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-[#5B9DFF]/10 text-[#5B9DFF] border-[#5B9DFF]/30 text-[10px] font-semibold">
                Demonstração
              </Badge>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Lentes Metodológicas da Fase */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B9DFF] flex items-center gap-1.5 mb-3">
                  <Compass className="w-4 h-4 text-[#5B9DFF]" />
                  <span>Lentes & Ferramentas Canônicas (Framework V2.4)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {etapaSelecionada.lentes.map((lente, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[4px] bg-[#111A2E] border border-[#24334F] text-xs text-[#C7D0E0] flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#3DDC74] shrink-0" />
                      <span className="font-medium">{lente}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output Esperado */}
              <div className="p-3.5 rounded-[4px] bg-[#111A2E] border border-[#24334F] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#FFB84D] tracking-wider block">
                  Output Metodológico Desta Fase:
                </span>
                <p className="text-xs text-[#C7D0E0] leading-relaxed">{etapaSelecionada.output}</p>
              </div>

              {/* Tarefas da Etapa (Estado Vazio Honesto — sem mock fake) */}
              <div className="pt-4 border-t border-[#24334F] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3DDC74] flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-[#3DDC74]" />
                    <span>Iniciativas & Tarefas Desta Etapa</span>
                  </h3>
                  <Badge variant="outline" className="text-[9px] border-[#24334F] text-[#8B98B4]">
                    Alimentado na Onda 2
                  </Badge>
                </div>

                <div className="p-6 rounded-[4px] bg-[#111A2E] border border-dashed border-[#24334F] text-center space-y-2">
                  <Clock className="w-6 h-6 text-[#5B9DFF] mx-auto opacity-70" />
                  <p className="text-xs font-semibold text-[#F8FAFC]">
                    Nenhuma tarefa gravada para esta etapa ainda
                  </p>
                  <p className="text-[11px] text-[#8B98B4] max-w-md mx-auto leading-relaxed">
                    A vinculação de iniciativas 5W2H (com dono, prazo e status) por Etapa será
                    gerada automaticamente pelo motor determinístico V7.2 na Onda 2, a partir das
                    vulnerabilidades do seu diagnóstico real.
                  </p>
                  <div className="pt-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-[#0066CC] text-[#5B9DFF] hover:bg-[#0066CC] hover:text-white rounded-[3px] text-xs"
                    >
                      <Link to="/plano-de-acao">Acessar Metodologia 5W2H Geral</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 3: Governança, Dono, Prazo e Status da Etapa */}
        <div className="space-y-6">
          <Card className="bg-[#16213A] border-[#24334F] rounded-[4px] text-[#F8FAFC]">
            <CardHeader className="border-b border-[#24334F] pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-[#F8FAFC] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3DDC74]" />
                Parâmetros da Etapa
              </CardTitle>
              <Badge className="bg-[#5B9DFF]/10 text-[#5B9DFF] border-[#5B9DFF]/30 text-[9px]">
                Demonstração
              </Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-[4px] bg-[#111A2E] border border-[#24334F] space-y-1">
                  <span className="text-[10px] text-[#8B98B4] uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#5B9DFF]" />
                    Responsável / Dono da Etapa
                  </span>
                  <div className="font-semibold text-[#F8FAFC]">A definir pelo plano real</div>
                  <span className="text-[10px] text-[#8B98B4]">
                    Diretoria Executiva / Líder designado
                  </span>
                </div>

                <div className="p-3 rounded-[4px] bg-[#111A2E] border border-[#24334F] space-y-1">
                  <span className="text-[10px] text-[#8B98B4] uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FFB84D]" />
                    Janela de Execução
                  </span>
                  <div className="font-semibold text-[#F8FAFC]">Cadência Metodológica V7.2</div>
                  <span className="text-[10px] text-[#8B98B4]">
                    Horizonte 30 a 90 dias conforme Regra Camaleão
                  </span>
                </div>

                <div className="p-3 rounded-[4px] bg-[#111A2E] border border-[#24334F] space-y-1">
                  <span className="text-[10px] text-[#8B98B4] uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#3DDC74]" />
                    Portão Metodológico
                  </span>
                  <div className="font-semibold text-[#F8FAFC]">
                    P{etapaSelecionada.numero} — Validação Determinística
                  </div>
                  <span className="text-[10px] text-[#8B98B4]">
                    Supervisão de portões ativada na Onda 2
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#16213A] border-[#24334F] rounded-[4px] text-[#F8FAFC]">
            <CardHeader className="border-b border-[#24334F] pb-4">
              <CardTitle className="text-base text-[#F8FAFC] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5B9DFF]" />
                Regras de Honestidade Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-xs text-[#C7D0E0] leading-relaxed">
              <p>• Scores e vazamentos fictícios anteriores foram removidos.</p>
              <p>
                • As Etapas seguem rigorosamente a taxonomia do Framework V2.4 e a máquina de
                estados V7.2.
              </p>
              <p>• A conexão aos OKRs e ao plano 5W2H entrará em operação no fecho da Onda 2.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
