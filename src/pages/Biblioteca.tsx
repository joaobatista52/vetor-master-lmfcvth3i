import React, { useState } from 'react'
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Send,
  Loader2,
  ShieldAlert,
  Info,
  CheckCircle2,
  Library,
  Compass,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { consultarBibliocompanion, ConsultaBibliocompanionResult } from '@/services/bibliocompanion'

/**
 * Biblioteca da Área do Assinante com Bibliocompanion Integrado (Bloco 5 Onda 2)
 *
 * FRONTEIRA CONCEITO × CONSULTORIA (Regra Regimental Inegociável):
 * - Assistente conceitual sobre o acervo bibliográfico da /biblioteca.
 * - Responde: conceitos, metodologias, frameworks e teorias.
 * - NUNCA presta consultoria (sem plano de ação 5W2H, sem diagnóstico da empresa, sem causa raiz individual).
 * - O acervo do Admin é ativo intelectual restrito; o assinante navega na Biblioteca do Usuário.
 * - Agente nativo único: jbp-gestao-master em tier reasoning.
 */
export default function Biblioteca() {
  const { user } = useAuth()
  const [camadaAtiva, setCamadaAtiva] = useState<'1_conceito' | '2_metodologia' | '3_socratico'>(
    '1_conceito',
  )
  const [pergunta, setPergunta] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState<ConsultaBibliocompanionResult | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const handleConsultar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!pergunta.trim() || carregando) return

    setCarregando(true)
    setErro(null)
    setResultado(null)

    try {
      const res = await consultarBibliocompanion({
        pergunta: pergunta.trim(),
        camada: camadaAtiva,
      })
      setResultado(res)
    } catch (err: any) {
      setErro(err?.message || 'Erro ao processar consulta no Bibliocompanion.')
    } finally {
      setCarregando(false)
    }
  }

  const sugestoesConceituais = [
    {
      camada: '1_conceito',
      texto:
        'O que define a Prisão do Fundador e como a teoria de Hackman aborda o design de equipes?',
    },
    {
      camada: '1_conceito',
      texto:
        'Qual é o conceito econômico de Moat (vantagem competitiva) formulado na ótica de Buffett?',
    },
    {
      camada: '2_metodologia',
      texto:
        'Como se articulam as 4 perspectivas do Balanced Scorecard com a Matriz EREC do Oceano Azul?',
    },
    {
      camada: '3_socratico',
      texto:
        'Qual a diferença conceitual entre alavancagem operacional e fragilidade de capital de giro?',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Banner de Topo Institucional VETOR MASTER */}
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
              Biblioteca & Assistente Conceitual (Bibliocompanion)
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Biblioteca Estratégica
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Acervo conceitual e assistente bibliográfico da área do assinante. Aprofunde definições
            metodológicas, teorias de gestão e lógica dos frameworks clássicos de estratégia,
            operações e finanças.
          </p>
        </div>
        <div className="relative z-10 text-right shrink-0">
          <Badge className="bg-[#22B14C] text-white border-none font-semibold text-xs px-3 py-1">
            Bibliocompanion Ativo
          </Badge>
          <div className="text-[11px] text-white/70 mt-1">Tier Reasoning • Agente V7.2</div>
        </div>
      </div>

      {/* Regra Regimental: FRONTEIRA CONCEITO × CONSULTORIA */}
      <Card className="bg-[#111A2E] border-[#24334F] text-[#F8FAFC] rounded-[4px] shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start gap-3">
          <div className="p-2 rounded-[4px] bg-[#0066CC]/20 border border-[#5B9DFF]/40 text-[#5B9DFF] shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F8FAFC] text-sm">
                Fronteira Regimental: Conceito × Consultoria
              </span>
              <Badge
                variant="outline"
                className="border-[#0066CC]/40 text-[#5B9DFF] text-[10px] font-mono"
              >
                BLOCO 5
              </Badge>
            </div>
            <p className="text-[#C7D0E0] leading-relaxed">
              O <strong>Bibliocompanion</strong> é um assistente pedagógico e conceitual. Ele
              responde sobre <strong>conceitos, frameworks, literatura e lógica teórica</strong>. Em
              respeito à metodologia, ele <strong>nunca prescreve consultoria</strong> para o caso
              particular da sua empresa, não aponta causa raiz individual e não gera planos de ação
              executivos (5W2H).
            </p>
            <p className="text-[#8B98B4]">
              Para diagnósticos específicos da sua operação, acerte os parâmetros em{' '}
              <Link to="/diagnosticos" className="text-[#5B9DFF] underline hover:text-[#00D47E]">
                /diagnosticos
              </Link>{' '}
              e desdobre a execução no{' '}
              <Link to="/plano-de-acao" className="text-[#5B9DFF] underline hover:text-[#00D47E]">
                /plano-de-acao
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Módulo Principal do Bibliocompanion (3 Camadas) */}
      <Card className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-[#E0E0E0] pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-[#333333] flex items-center gap-2">
                  <span>Bibliocompanion — Consulta Conceitual</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#808080]">
                  Escolha uma das 3 camadas pedagógicas para orientar o nível de profundidade
                  teórica
                </CardDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="border-[#22B14C]/40 text-[#1E9E43] bg-[#22B14C]/5 text-[11px] font-mono px-2.5 py-1"
            >
              Motor: jbp-gestao-master
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Seletor das 3 Camadas */}
          <Tabs
            value={camadaAtiva}
            onValueChange={(v) => setCamadaAtiva(v as any)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 bg-white border border-[#E0E0E0] p-1 rounded-[4px]">
              <TabsTrigger
                value="1_conceito"
                className="text-xs data-[state=active]:bg-[#0066CC] data-[state=active]:text-white rounded-[3px] py-2 font-medium"
              >
                Camada 1: Definição & Conceito
              </TabsTrigger>
              <TabsTrigger
                value="2_metodologia"
                className="text-xs data-[state=active]:bg-[#0066CC] data-[state=active]:text-white rounded-[3px] py-2 font-medium"
              >
                Camada 2: Metodologia & Lógica
              </TabsTrigger>
              <TabsTrigger
                value="3_socratico"
                className="text-xs data-[state=active]:bg-[#0066CC] data-[state=active]:text-white rounded-[3px] py-2 font-medium"
              >
                Camada 3: Diálogo Socrático
              </TabsTrigger>
            </TabsList>

            <TabsContent value="1_conceito" className="pt-2 text-xs text-[#555555]">
              Explicação objetiva e dicionarizada de termos de gestão, finanças, governança e
              estratégia.
            </TabsContent>
            <TabsContent value="2_metodologia" className="pt-2 text-xs text-[#555555]">
              Articulação estruturada entre frameworks consagrados (Porter, Hackman, Buffett, Oceano
              Azul, Kaplan/Norton).
            </TabsContent>
            <TabsContent value="3_socratico" className="pt-2 text-xs text-[#555555]">
              Reflexão teórica provocativa sobre dilemas conceituais de escala, alocação e
              governança.
            </TabsContent>
          </Tabs>

          {/* Campo de Entrada de Consulta */}
          <form onSubmit={handleConsultar} className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                placeholder="Ex: Como o conceito de 5 Condições de Hackman se aplica ao design organizacional?"
                disabled={carregando}
                className="bg-white border-[#E0E0E0] text-[#333333] text-sm h-11 rounded-[4px] focus-visible:ring-[#0066CC]"
              />
              <Button
                type="submit"
                disabled={carregando || !pergunta.trim()}
                className="bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-[4px] h-11 px-5 font-semibold text-xs flex items-center gap-2 shrink-0 shadow-sm"
              >
                {carregando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Consultar</span>
                  </>
                )}
              </Button>
            </div>

            {/* Sugestões Rápidas */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-[#808080] flex items-center gap-1 mr-1">
                <Lightbulb className="w-3.5 h-3.5 text-[#22B14C]" />
                Sugestões conceituais:
              </span>
              {sugestoesConceituais.map((sug, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setCamadaAtiva(sug.camada as any)
                    setPergunta(sug.texto)
                  }}
                  className="text-[11px] bg-white border border-[#E0E0E0] hover:border-[#0066CC] text-[#555555] hover:text-[#0066CC] px-2.5 py-1 rounded-[3px] transition-colors text-left"
                >
                  {sug.texto.slice(0, 48)}...
                </button>
              ))}
            </div>
          </form>

          {/* Erro */}
          {erro && (
            <div className="p-3.5 rounded-[4px] bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Exibição da Resposta Conceitual */}
          {resultado && (
            <div className="p-6 bg-white border border-[#E0E0E0] rounded-[4px] shadow-xs space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E0E0E0] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22B14C]" />
                  <span className="text-xs font-bold text-[#333333]">
                    Resposta Conceitual Emitida
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono border-[#0066CC]/30 text-[#0066CC]"
                  >
                    Camada: {resultado.camada}
                  </Badge>
                </div>
                {resultado.fronteira_consultoria_acionada && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-semibold">
                    Barreira de Consultoria Acionada
                  </Badge>
                )}
              </div>

              <div className="prose prose-sm max-w-none text-[#333333] leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
                {resultado.resposta}
              </div>

              <div className="pt-3 border-t border-[#E0E0E0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#808080]">
                <span>Pergunta analisada sob a lente teórica e acervo metodológico de gestão.</span>
                <span className="font-mono text-[#0066CC]">
                  Fronteira Conceito × Consultoria respeitada
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Destaques Editoriais da Base de Conhecimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5 text-[#0066CC] font-bold text-sm">
            <div className="w-7 h-7 rounded-[4px] bg-[#0066CC]/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-[#0066CC]" />
            </div>
            <span>Perguntas Frequentes & Fundamentação</span>
          </div>
          <p className="text-xs text-[#555555] leading-relaxed">
            Esclarecimentos estruturados sobre a lógica dos 3 Pilares metodológicos: Prisão do
            Fundador, Ineficiência Invisível e Abismo Estratégia vs. Execução.
          </p>
        </div>

        <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5 text-[#22B14C] font-bold text-sm">
            <div className="w-7 h-7 rounded-[4px] bg-[#22B14C]/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-[#22B14C]" />
            </div>
            <span>Conceitos dos 12 Setores Econômicos</span>
          </div>
          <p className="text-xs text-[#555555] leading-relaxed">
            Bases de conhecimento conceituais parametrizadas para os desafios estruturais dos
            setores canônicos, do Comércio Internacional aos Serviços Profissionais e Indústria.
          </p>
        </div>
      </div>
    </div>
  )
}
