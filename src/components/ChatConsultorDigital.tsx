import React, { useState, useRef, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  PROMPTS_CANONICOS_13,
  enviarMensagemConsultor,
  ConsultorChatMessage,
} from '@/services/consultor-digital'

interface ChatConsultorDigitalProps {
  onSuggestTask?: (task: {
    title: string
    area: string
    priority: 'alta' | 'media' | 'baixa'
  }) => void
}

export const ChatConsultorDigital: React.FC<ChatConsultorDigitalProps> = ({ onSuggestTask }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ConsultorChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou o **Consultor Digital Vetor Master** (Agente Nativo JBP Gestão Master V7.2.3).\n\nEstou parametrizado com os 12 setores canônicos, os critérios de Warren Buffett, o protocolo contábil CS-17 e o Roteiro de 13 Prompts.\n\nComo posso orientar a execução do seu plano de ação hoje? Você também pode selecionar um dos 13 passos canônicos abaixo.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [promptAtivoId, setPromptAtivoId] = useState<string>('P01')
  const [showRoteiro, setShowRoteiro] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const promptSelecionado =
    PROMPTS_CANONICOS_13.find((p) => p.id === promptAtivoId) || PROMPTS_CANONICOS_13[0]

  const handleSend = async (mensagemPersonalizada?: string) => {
    const textoParaEnviar = (mensagemPersonalizada || input).trim()
    if (!textoParaEnviar || loading) return

    setErrorMessage(null)
    const userMessage: ConsultorChatMessage = {
      role: 'user',
      content: textoParaEnviar,
      created: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!mensagemPersonalizada) {
      setInput('')
    }
    setLoading(true)

    try {
      const res = await enviarMensagemConsultor({
        message: textoParaEnviar,
        conversationId,
        promptAtivo: `${promptSelecionado.id} - ${promptSelecionado.portao}: ${promptSelecionado.titulo}`,
      })

      if (res.success && res.content) {
        if (res.conversation_id) {
          setConversationId(res.conversation_id)
        }
        const assistantMessage: ConsultorChatMessage = {
          role: 'assistant',
          content: res.content,
          created: new Date().toISOString(),
          citations: res.citations,
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Se o prompt atual for concluído com sucesso, avança sugestivamente para o próximo prompt do roteiro
        const currentIndex = PROMPTS_CANONICOS_13.findIndex((p) => p.id === promptAtivoId)
        if (currentIndex >= 0 && currentIndex < PROMPTS_CANONICOS_13.length - 1) {
          setPromptAtivoId(PROMPTS_CANONICOS_13[currentIndex + 1].id)
        }
      } else {
        setErrorMessage(res.error || 'Não foi possível obter resposta do Consultor Digital.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar ao motor do Consultor Digital.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPrompt = (prompt: (typeof PROMPTS_CANONICOS_13)[0]) => {
    setPromptAtivoId(prompt.id)
    setInput(prompt.sugestao)
    setShowRoteiro(false)
  }

  const handleClearHistory = () => {
    setConversationId(null)
    setMessages([
      {
        role: 'assistant',
        content:
          'Histórico reiniciado. O Consultor Digital Vetor Master está pronto para um novo ciclo de acompanhamento do seu plano.',
      },
    ])
    setPromptAtivoId('P01')
    setErrorMessage(null)
  }

  return (
    <Card className="flex flex-col h-[650px] border-[#0066CC]/20 shadow-md">
      {/* Header do Consultor Digital */}
      <CardHeader className="bg-gradient-to-r from-[#111A2E] to-[#1E293B] text-white py-3.5 px-4 rounded-t-lg shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0066CC] flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold tracking-tight text-white">
                  Consultor Digital Vetor Master
                </CardTitle>
                <Badge className="bg-[#22B14C] hover:bg-[#1E9E43] text-white text-[10px] font-mono border-none px-1.5 py-0">
                  Agente Nativo V7.2.3
                </Badge>
              </div>
              <CardDescription className="text-[11px] text-slate-300">
                Tier Reasoning • JBP Gestão Master • 13 Prompts & Portões
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              title="Reiniciar Conversa"
              className="text-slate-300 hover:text-white hover:bg-white/10 h-8 px-2 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reiniciar
            </Button>
          </div>
        </div>

        {/* Barra do Portão Ativo do Roteiro */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <Badge className="bg-[#0066CC] text-white text-[10px] font-mono shrink-0">
              {promptSelecionado.id} • {promptSelecionado.portao}
            </Badge>
            <span className="text-[11px] text-slate-200 truncate">{promptSelecionado.titulo}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRoteiro(!showRoteiro)}
            className="text-slate-300 hover:text-white hover:bg-white/10 h-6 px-1.5 text-[11px] shrink-0"
          >
            {showRoteiro ? 'Ocultar Roteiro' : 'Ver 13 Prompts'}
            {showRoteiro ? (
              <ChevronUp className="w-3 h-3 ml-1" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-1" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Painel expansível com o Roteiro dos 13 Prompts Canônicos */}
      {showRoteiro && (
        <div className="bg-slate-50 border-b border-[#E0E0E0] p-3 max-h-56 overflow-y-auto space-y-2 text-xs shrink-0">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="font-bold text-[#333333] text-[11px] uppercase tracking-wide">
              Roteiro de Execução Canônico (13 Prompts e Portões de Decisão)
            </span>
            <span className="text-[10px] text-[#808080]">Clique para carregar</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {PROMPTS_CANONICOS_13.map((p) => {
              const isSelected = p.id === promptAtivoId
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPrompt(p)}
                  className={`text-left p-2 rounded text-xs transition-colors border ${
                    isSelected
                      ? 'bg-[#0066CC]/10 border-[#0066CC] text-[#0066CC] font-semibold'
                      : 'bg-white border-[#E0E0E0] hover:bg-slate-100 text-[#333333]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#0066CC]">{p.id}</span>
                    <span className="text-[9px] text-[#808080]">{p.portao}</span>
                  </div>
                  <div className="truncate mt-0.5">{p.titulo}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Área de Mensagens */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.map((m, index) => {
          const isUser = m.role === 'user'
          return (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-[#0066CC] text-white' : 'bg-[#111A2E] text-white shadow-xs'
                }`}
              >
                {isUser ? 'VC' : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] rounded-lg p-3 text-xs leading-relaxed space-y-1.5 ${
                  isUser
                    ? 'bg-[#0066CC] text-white rounded-tr-none'
                    : 'bg-white text-[#333333] border border-[#E0E0E0] shadow-2xs rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                {/* Citações / Referências do Agente Nativo */}
                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-200 space-y-1 text-[11px] text-[#808080]">
                    <div className="flex items-center gap-1 font-semibold text-[#0066CC]">
                      <FileText className="w-3 h-3" />
                      Referências Metodológicas:
                    </div>
                    {m.citations.map((c, cIdx) => (
                      <div key={cIdx} className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        {c.title && <div className="font-bold text-[#333333]">{c.title}</div>}
                        {c.snippet && <div className="italic text-[10px]">{c.snippet}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#111A2E] text-white flex items-center justify-center text-xs shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-white border border-[#E0E0E0] rounded-lg rounded-tl-none p-3 shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-[#808080]">
                <Sparkles className="w-3.5 h-3.5 text-[#0066CC] animate-pulse" />
                <span>Consultor Digital analisando dados determinísticos V7.2...</span>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Aviso do Motor:</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Footer com Input e Botão de Envio */}
      <CardFooter className="bg-white border-t border-[#E0E0E0] p-3 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2 w-full">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={`Pergunte ao Consultor ou execute o passo [${promptSelecionado.id}: ${promptSelecionado.titulo}]...`}
            rows={2}
            className="text-xs resize-none flex-1 border-[#CCCCCC] focus:border-[#0066CC]"
            disabled={loading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-[#0066CC] hover:bg-[#0052A3] text-white h-[58px] px-4 rounded-[4px] shrink-0"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between w-full text-[11px] text-[#808080]">
          <span className="truncate">
            Sugestão rápida:{' '}
            <button
              onClick={() => handleSend(promptSelecionado.sugestao)}
              disabled={loading}
              className="text-[#0066CC] hover:underline font-medium text-left"
            >
              "{promptSelecionado.sugestao.substring(0, 75)}..."
            </button>
          </span>
          <span className="shrink-0 font-mono text-[10px] text-slate-400">Enter envia</span>
        </div>
      </CardFooter>
    </Card>
  )
}
