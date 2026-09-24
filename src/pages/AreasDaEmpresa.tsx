import React, { useState } from 'react'
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Layers,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'

interface AreaEmpresaDetalhe {
  id: string
  numero: string
  nome: string
  score: number // 0-100
  status: 'critico' | 'atencao' | 'saudavel'
  vazamentos: string[]
  tarefasPlano: {
    titulo: string
    responsavel: string
    prazo: string
    status: 'concluido' | 'em_andamento' | 'pendente'
  }[]
  microLicoes: {
    titulo: string
    duracao: string
    topico: string
  }[]
}

const AREAS_EMPRESA_DATA: AreaEmpresaDetalhe[] = [
  {
    id: 'direcao-governanca',
    numero: '01',
    nome: 'Direção & Governança',
    score: 42,
    status: 'critico',
    vazamentos: [
      'Ausência de alçada formal para decisões de compras acima de R$ 5.000',
      'Dependência pessoal do fundador em 85% dos contratos e reuniões',
      'Inexistência de comitê executivo quinzenal com atas estruturadas',
    ],
    tarefasPlano: [
      {
        titulo: 'Instituir matriz de alçadas de decisão para lideranças',
        responsavel: 'CEO / Fundador',
        prazo: '15 dias',
        status: 'em_andamento',
      },
      {
        titulo: 'Estruturar rito de prestação de contas mensal',
        responsavel: 'Diretor Operacional',
        prazo: '30 dias',
        status: 'pendente',
      },
    ],
    microLicoes: [
      {
        titulo: 'Descentralização Estruturada: O Fim do Gargalo do Fundador',
        duracao: '8 min',
        topico: 'Governança',
      },
      {
        titulo: 'Rituais de Alinhamento: Da Reunião Inútil à Decisão Ágil',
        duracao: '6 min',
        topico: 'Liderança',
      },
    ],
  },
  {
    id: 'comercial-mercado',
    numero: '02',
    nome: 'Comercial & Mercado',
    score: 58,
    status: 'atencao',
    vazamentos: [
      'Propostas enviadas sem conferência prévia da margem de contribuição',
      'Descontos concedidos sem contrapartida de prazo ou volume',
      'Taxa de conversão de pipeline sem auditoria de motivos de perda',
    ],
    tarefasPlano: [
      {
        titulo: 'Parametrizar tabela de descontos máximos por vendedor',
        responsavel: 'Gerente Comercial',
        prazo: '10 dias',
        status: 'concluido',
      },
      {
        titulo: 'Implantar comitê semanal de análise de propostas perdidas',
        responsavel: 'Comercial',
        prazo: '20 dias',
        status: 'em_andamento',
      },
    ],
    microLicoes: [
      {
        titulo: 'Proteção de Margem: Por que Vender com Desconto Destrói o Ebitda',
        duracao: '7 min',
        topico: 'Pricing',
      },
    ],
  },
  {
    id: 'operacoes-entregas',
    numero: '03',
    nome: 'Operações & Entregas',
    score: 48,
    status: 'critico',
    vazamentos: [
      'Retrabalho de equipe por falta de briefing padronizado',
      'Ociosidade não monitorada em horários de vale ou linhas secundárias',
      'Horas extras recorrentes mascarando problemas de escala',
    ],
    tarefasPlano: [
      {
        titulo: 'Padronizar checklist de entrada de ordens e briefings',
        responsavel: 'Gerente de Operações',
        prazo: '15 dias',
        status: 'em_andamento',
      },
    ],
    microLicoes: [
      {
        titulo: 'Eliminação de Gargalos: A Teoria das Restrições na Prática',
        duracao: '9 min',
        topico: 'Eficiência',
      },
    ],
  },
  {
    id: 'financas-controladoria',
    numero: '04',
    nome: 'Finanças & Controladoria',
    score: 64,
    status: 'atencao',
    vazamentos: [
      'DRE fechada após o 15º dia útil do mês subsequente',
      'Ausência de conciliação bancária diária automatizada',
      'Falta de visão clara da Dívida Líquida / EBITDA em tempo real',
    ],
    tarefasPlano: [
      {
        titulo: 'Antecipar fechamento de DRE gerencial para o 10º dia útil',
        responsavel: 'Controller',
        prazo: '25 dias',
        status: 'em_andamento',
      },
    ],
    microLicoes: [
      {
        titulo: 'Lente de Buffett: Como Manter um Balanço com Margem de Segurança',
        duracao: '11 min',
        topico: 'Finanças Corporativas',
      },
    ],
  },
  {
    id: 'pessoas-cultura',
    numero: '05',
    nome: 'Pessoas & Cultura',
    score: 72,
    status: 'saudavel',
    vazamentos: [
      'Turnover em posições operacionais chave',
      'Falta de alinhamento individual com os OKRs do trimestre',
    ],
    tarefasPlano: [
      {
        titulo: 'Rodada de 1-on-1s com foco no desdobramento de OKRs',
        responsavel: 'RH / Lideranças',
        prazo: '15 dias',
        status: 'concluido',
      },
    ],
    microLicoes: [
      {
        titulo: 'Hackman na Prática: As 5 Condições para Equipes de Alta Performance',
        duracao: '10 min',
        topico: 'Design Organizacional',
      },
    ],
  },
  {
    id: 'tecnologia-processos',
    numero: '06',
    nome: 'Tecnologia & Processos',
    score: 52,
    status: 'atencao',
    vazamentos: [
      'Sistemas legados desconectados exigindo planilhas manuais de apoio',
      'Falta de dashboards em tempo real para tomada de decisão',
    ],
    tarefasPlano: [
      {
        titulo: 'Centralizar indicadores críticos no Dashboard do Vetor Master',
        responsavel: 'TI / Operações',
        prazo: '10 dias',
        status: 'em_andamento',
      },
    ],
    microLicoes: [
      {
        titulo: 'Automatização Determinística: Substituindo Planilhas por Sistemas Confiáveis',
        duracao: '8 min',
        topico: 'Tecnologia',
      },
    ],
  },
  {
    id: 'juridico-tributario',
    numero: '07',
    nome: 'Jurídico & Tributário',
    score: 60,
    status: 'atencao',
    vazamentos: [
      'Contratos de clientes antigos sem cláusula de reajuste por índice inflacionário',
      'Exposição ao novo regime de tributação CBS/IBS da Reforma Tributária',
    ],
    tarefasPlano: [
      {
        titulo: 'Auditoria de minutas contratuais e renovações com repactuação',
        responsavel: 'Jurídico',
        prazo: '30 dias',
        status: 'pendente',
      },
    ],
    microLicoes: [
      {
        titulo: 'Blindagem Patrimonial e Transição Tributária para PMEs',
        duracao: '9 min',
        topico: 'Compliance',
      },
    ],
  },
  {
    id: 'inovacao-futuro',
    numero: '08',
    nome: 'Inovação & Estratégia Futura',
    score: 38,
    status: 'critico',
    vazamentos: [
      'Concentração de receita em produtos ou clientes tradicionais',
      'Inexistência de esteira para teste e validação de novos canais',
    ],
    tarefasPlano: [
      {
        titulo: 'Workshop de Matriz ERRC (Eliminar, Reduzir, Elevar, Criar)',
        responsavel: 'Comitê Estratégico',
        prazo: '45 dias',
        status: 'pendente',
      },
    ],
    microLicoes: [
      {
        titulo: 'Estratégia do Oceano Azul: Como Escalar Sem Guerras Predatórias de Preço',
        duracao: '12 min',
        topico: 'Estratégia',
      },
    ],
  },
]

/**
 * CAMADA 2 — ÁREAS DA EMPRESA (V1.3 / Item 14)
 * Substitui a antiga exposição de frameworks na área do cliente.
 * Apresenta:
 * 1. Vazamentos identificados por área
 * 2. Tarefas do plano executável por área
 * 3. Score e progresso por área
 * 4. Micro-lições setoriais curadas
 *
 * (Frameworks e obras da Biblioteca Profissional permanecem estritamente no Admin)
 */
export default function AreasDaEmpresa() {
  const [areaAtiva, setAreaAtiva] = useState<string>('direcao-governanca')
  const areaSelecionada =
    AREAS_EMPRESA_DATA.find((a) => a.id === areaAtiva) || AREAS_EMPRESA_DATA[0]

  const statusBadge = (status: AreaEmpresaDetalhe['status']) => {
    switch (status) {
      case 'critico':
        return (
          <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-semibold">
            Crítico
          </Badge>
        )
      case 'atencao':
        return (
          <Badge className="bg-[#FF9900]/15 text-[#FFB84D] border border-[#FF9900]/30 text-[10px] font-semibold">
            Atenção
          </Badge>
        )
      case 'saudavel':
        return (
          <Badge className="bg-[#3DDC74]/15 text-[#3DDC74] border border-[#3DDC74]/30 text-[10px] font-semibold">
            Saudável
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-8 animate-fade-in text-[#F8FAFC]">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#24334F] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#16213A] border border-[#24334F] text-[#5B9DFF] text-xs font-semibold mb-2">
            <span>CAMADA 2 • ÁREA OPERACIONAL DO ASSINANTE</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F8FAFC] font-heading">
            Áreas da Empresa & Vazamentos Identificados
          </h1>
          <p className="text-xs sm:text-sm text-[#C7D0E0] mt-1">
            Gestão integrada dos 8 pilares da sua organização: scores, vazamentos estancados,
            tarefas do plano e micro-lições setoriais aplicadas.
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

      {/* Grid das 8 Áreas — Visão Rápida */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {AREAS_EMPRESA_DATA.map((area) => {
          const isSelected = area.id === areaAtiva
          return (
            <button
              type="button"
              key={area.id}
              onClick={() => setAreaAtiva(area.id)}
              className={`p-3 rounded-[4px] border text-left transition-all ${
                isSelected
                  ? 'bg-[#1B2742] border-[#5B9DFF] shadow-lg ring-1 ring-[#5B9DFF]/30'
                  : 'bg-[#16213A] border-[#24334F] hover:border-[#5B9DFF]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] font-bold text-[#5B9DFF]">
                  {area.numero}
                </span>
                <span className="text-[10px] font-bold text-[#F8FAFC]">{area.score}%</span>
              </div>
              <div className="text-xs font-semibold text-[#F8FAFC] line-clamp-2 leading-tight">
                {area.nome}
              </div>
              <div className="mt-2">
                <Progress value={area.score} className="h-1 bg-[#111A2E] [&>div]:bg-[#0066CC]" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Detalhe da Área Selecionada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Vazamentos e Tarefas do Plano */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de Vazamentos */}
          <Card className="bg-[#16213A] border-[#24334F] rounded-[4px] text-[#F8FAFC]">
            <CardHeader className="border-b border-[#24334F] pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold text-[#5B9DFF] bg-[#111A2E] px-2 py-0.5 rounded-[3px] border border-[#24334F]">
                  {areaSelecionada.numero}
                </span>
                <div>
                  <CardTitle className="text-lg text-[#F8FAFC]">{areaSelecionada.nome}</CardTitle>
                  <p className="text-xs text-[#8B98B4] mt-0.5">
                    Diagnóstico e intervenções prioritárias
                  </p>
                </div>
              </div>
              <div>{statusBadge(areaSelecionada.status)}</div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFB84D] flex items-center gap-1.5 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#FF9900]" />
                  <span>Vazamentos Identificados (Pontos de Perda de Margem)</span>
                </h3>
                <div className="space-y-2">
                  {areaSelecionada.vazamentos.map((vaz, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[4px] bg-[#111A2E] border border-[#24334F] text-xs text-[#C7D0E0] flex items-start gap-2.5"
                    >
                      <span className="text-[#FF9900] font-bold shrink-0 mt-0.5">!</span>
                      <span className="leading-relaxed">{vaz}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#24334F]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B9DFF] flex items-center gap-1.5 mb-3">
                  <ListTodo className="w-4 h-4 text-[#5B9DFF]" />
                  <span>Tarefas do Plano de Ação Vinculadas</span>
                </h3>
                <div className="space-y-2">
                  {areaSelecionada.tarefasPlano.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[4px] bg-[#111A2E] border border-[#24334F] flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-[#F8FAFC]">{task.titulo}</div>
                        <div className="text-[11px] text-[#8B98B4]">
                          Responsável:{' '}
                          <strong className="text-[#C7D0E0]">{task.responsavel}</strong> · Prazo:{' '}
                          {task.prazo}
                        </div>
                      </div>
                      <Badge
                        className={`text-[10px] uppercase font-semibold ${
                          task.status === 'concluido'
                            ? 'bg-[#3DDC74]/15 text-[#3DDC74] border-[#3DDC74]/30'
                            : task.status === 'em_andamento'
                              ? 'bg-[#0066CC]/20 text-[#5B9DFF] border-[#5B9DFF]/30'
                              : 'bg-[#16213A] text-[#8B98B4] border-[#24334F]'
                        }`}
                      >
                        {task.status === 'concluido'
                          ? 'Concluído'
                          : task.status === 'em_andamento'
                            ? 'Em Andamento'
                            : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 3: Score & Micro-Lições Setoriais */}
        <div className="space-y-6">
          <Card className="bg-[#16213A] border-[#24334F] rounded-[4px] text-[#F8FAFC]">
            <CardHeader className="border-b border-[#24334F] pb-4">
              <CardTitle className="text-base text-[#F8FAFC] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3DDC74]" />
                Maturidade & Score da Área
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-24 h-24 rounded-full border-4 border-[#5B9DFF] flex flex-col items-center justify-center mx-auto bg-[#111A2E]">
                <span className="text-2xl font-bold font-mono text-[#F8FAFC]">
                  {areaSelecionada.score}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#8B98B4]">Score</span>
              </div>
              <p className="text-xs text-[#C7D0E0] leading-relaxed">
                Área com impacto direto na rentabilidade. A execução do plano de ação deve elevar
                este índice para a faixa de excelência (≥ 80%).
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#16213A] border-[#24334F] rounded-[4px] text-[#F8FAFC]">
            <CardHeader className="border-b border-[#24334F] pb-4">
              <CardTitle className="text-base text-[#F8FAFC] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5B9DFF]" />
                Micro-lições Setoriais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {areaSelecionada.microLicoes.map((licao, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[4px] bg-[#111A2E] border border-[#24334F] hover:border-[#5B9DFF]/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#8B98B4]">
                    <span className="uppercase tracking-wider font-semibold text-[#5B9DFF]">
                      {licao.topico}
                    </span>
                    <span>{licao.duracao}</span>
                  </div>
                  <div className="text-xs font-semibold text-[#F8FAFC] leading-snug">
                    {licao.titulo}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-[#3DDC74] hover:text-white hover:bg-[#16213A] p-0 font-medium flex items-center gap-1"
                  >
                    <span>Assistir micro-lição</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
