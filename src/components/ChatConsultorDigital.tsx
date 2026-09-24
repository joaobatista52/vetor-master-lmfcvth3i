import React, { useState } from 'react'
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Bot,
  User,
  ChevronRight,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface MensagemChat {
  id: string
  remetente: 'agente' | 'usuario'
  texto: string
  promptAtivo?: string
  horario: string
}

const PROMPTS_13_METADATA = [
  { id: 'P1', nome: 'P1: Abertura e Leitura do Contexto da Empresa', portao: 'P1' },
  { id: 'P2', nome: 'P2: Análise dos 3 Pilares e Vulnerabilidades', portao: 'P2' },
  { id: 'P3', nome: 'P3: Micro-epifanias e Devolutiva Executiva', portao: 'P3' },
  { id: 'P4', nome: 'P4: Portão de Assinatura (Cliente assinou modalidade)', portao: 'P3→P4' },
  { id: 'P5', nome: 'P5: Diagnóstico Aprofundado (Hackman + Buffett)', portao: 'P5' },
  { id: 'P6', nome: 'P6: Priorização Estratégica (Matriz Gravidade x Tendência)', portao: 'P6' },
  { id: 'P7', nome: 'P7: Desdobramento do Plano 5W2H', portao: 'P7' },
  { id: 'P8', nome: 'P8: Calibragem de OKRs Trimestrais', portao: 'P8' },
  { id: 'P9', nome: 'P9: Auditoria de Landed Cost / Vazamentos', portao: 'P9' },
  { id: 'P10', nome: 'P10: Matriz ERRC e Diferenciação', portao: 'P10' },
  { id: 'P11', nome: 'P11: Preparação de Comitês e Governança', portao: 'P11' },
  { id: 'P12', nome: 'P12: Cadência Semanal e Rituais de Acompanhamento', portao: 'P12' },
  { id: 'P13', nome: 'P13: Revisão Mensal e Stress Test de Cenários', portao: 'P13' },
]

/**
 * Chat com o Consultor Digital V7.2
 * Executa as diretrizes dos 13 prompts fixos e portões metodológicos (P3 -> P4)
 * Fonte: Skill Roteiro de Execução (13 Prompts Fixos e Automação)
 */
export function ChatConsultorDigital() {
  const [promptAtivoIdx, setPromptAtivoIdx] = useState<number>(3) // P4: Plano de Ação ativo
  const [inputTexto, setInputTexto] = useState('')
  const [mensagens, setMensagens] = useState<MensagemChat[]>([
    {
      id: '1',
      remetente: 'agente',
      promptAtivo: 'P4',
      texto:
        'Olá! Eu sou seu Consultor Digital Vetor Master V7.2. O portão P3→P4 foi superado com sucesso sob sua assinatura ativa. Estamos no prompt P4/P5 com foco na execução do Plano de Ação 5W2H e estancamento imediato dos vazamentos de margem. Como posso orientar sua decisão executiva agora?',
      horario: 'Agora',
    },
  ])

  const handleEnviar = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputTexto.trim()) return

    const novaMsg: MensagemChat = {
      id: String(Date.now()),
      remetente: 'usuario',
      texto: inputTexto,
      horario: 'Agora',
    }

    setMensagens((prev) => [...prev, novaMsg])
    setInputTexto('')

    // Resposta determinística do Consultor Digital baseada no roteiro de 13 prompts
    setTimeout(() => {
      const respostaAgente: MensagemChat = {
        id: String(Date.now() + 1),
        remetente: 'agente',
        promptAtivo: PROMPTS_13_METADATA[promptAtivoIdx].id,
        texto: `[Consultor Digital • ${PROMPTS_13_METADATA[promptAtivoIdx].nome}]: Analisando pela lente determinística de governança: o primeiro passo é não tolerar ambiguidade de donos. Recomendo parametrizar o prazo no 5W2H e validar se a liderança possui alçada de até R$ 5.000 sem acionar o fundador. Essa intervenção protege seu caixa e desonera 4h semanais da diretoria.`,
        horario: 'Agora',
      }
      setMensagens((prev) => [...prev, respostaAgente])
    }, 800)
  }

  return (
    <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px] shadow-lg flex flex-col h-[520px]">
      <CardHeader className="border-b border-[#24334F] pb-3 shrink-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#0066CC]/20 border border-[#5B9DFF]/40 flex items-center justify-center text-[#5B9DFF]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <span>Consultor Digital Vetor Master</span>
              <span className="font-mono text-[10px] text-[#3DDC74] bg-[#111A2E] px-1.5 py-0.5 rounded border border-[#24334F]">
                V7.2 DETERMINÍSTICO
              </span>
            </CardTitle>
            <p className="text-[11px] text-[#8B98B4]">
              Execução guiada dos 13 Prompts Fixos • Portão Ativo:{' '}
              {PROMPTS_13_METADATA[promptAtivoIdx].portao}
            </p>
          </div>
        </div>

        <Badge className="bg-[#3DDC74]/15 text-[#3DDC74] border-[#3DDC74]/30 text-[10px] font-semibold">
          Assinante Ativo (P4 Liberado)
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
        {/* Histórico de Mensagens */}
        <div className="overflow-y-auto space-y-3 pr-2 flex-1 mb-4">
          {mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.remetente === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.remetente === 'agente' && (
                <div className="w-7 h-7 rounded-full bg-[#0066CC] flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-[4px] p-3 text-xs leading-relaxed ${
                  msg.remetente === 'usuario'
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-[#111A2E] border border-[#24334F] text-[#C7D0E0]'
                }`}
              >
                {msg.promptAtivo && (
                  <div className="text-[9px] font-mono text-[#5B9DFF] uppercase font-bold mb-1">
                    {msg.promptAtivo} • ROTEIRO V7.2
                  </div>
                )}
                <div>{msg.texto}</div>
                <div className="text-[9px] text-[#8B98B4] text-right mt-1">{msg.horario}</div>
              </div>
              {msg.remetente === 'usuario' && (
                <div className="w-7 h-7 rounded-full bg-[#1B2742] border border-[#24334F] flex items-center justify-center text-[#5B9DFF] shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input e Ações de Prompt */}
        <form
          onSubmit={handleEnviar}
          className="pt-2 border-t border-[#24334F] flex items-center gap-2"
        >
          <Input
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            placeholder="Consulte o Consultor Digital sobre o plano, vazamentos ou rituais..."
            className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px] h-9"
          />
          <Button
            type="submit"
            className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] h-9 px-4 text-xs font-semibold shrink-0 gap-1.5"
          >
            <span>Enviar</span>
            <Send className="w-3 h-3" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
