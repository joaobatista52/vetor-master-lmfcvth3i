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
  return (
    <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px] shadow-lg">
      <CardHeader className="border-b border-[#24334F] pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#0066CC]/20 border border-[#5B9DFF]/40 flex items-center justify-center text-[#5B9DFF]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <span>Consultor Digital Vetor Master</span>
              <span className="font-mono text-[10px] text-[#FFB84D] bg-[#111A2E] px-1.5 py-0.5 rounded border border-[#24334F]">
                INTEGRAÇÃO ONDA 2
              </span>
            </CardTitle>
            <p className="text-[11px] text-[#8B98B4]">
              Roteiro dos 13 Prompts Fixos & Automação • Agente nativo jbp-gestao-master
            </p>
          </div>
        </div>

        <Badge className="bg-[#FF9900]/15 text-[#FFB84D] border-[#FF9900]/30 text-[10px] font-semibold flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>Desativado temporariamente (Rodada 1.5)</span>
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#24334F] flex items-start gap-3">
          <Info className="w-5 h-5 text-[#5B9DFF] shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs">
            <h4 className="font-bold text-[#F8FAFC] text-sm">
              Alinhamento ao Protocolo JBP GM V7.2.3 (Auditoria de UI/UX)
            </h4>
            <p className="text-[#C7D0E0] leading-relaxed">
              O chat com respostas simuladas foi <strong>desativado nesta Rodada 1.5</strong> para
              assegurar a credibilidade do produto e eliminar qualquer declaração hardcoded sobre
              portões metodológicos.
            </p>
            <p className="text-[#8B98B4] leading-relaxed">
              Na <strong>Onda 2</strong>, este módulo será conectado diretamente ao agente nativo{' '}
              <code className="text-[#5B9DFF] font-mono">jbp-gestao-master</code> (System Prompt
              A5–A10 + A11 + CS-17/19/20 e as 4 skills consolidadas), consumindo o diagnóstico real
              do assinante e respeitando a validação humana nos portões MaaS/Bespoke.
            </p>
          </div>
        </div>

        {/* Visão de Roteiro Planejado (transparência metodológica, sem mentir sobre portão superado) */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8B98B4]">
            Estrutura canônica dos 13 prompts em acoplamento:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {PROMPTS_13_METADATA.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-[3px] bg-[#0E1726] border border-[#24334F] text-[11px] flex items-center justify-between"
              >
                <span className="font-mono text-[#5B9DFF] font-bold">{p.id}</span>
                <span className="text-[#C7D0E0] truncate px-2">
                  {p.nome.split(':')[1]?.trim() || p.nome}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] border-[#24334F] text-[#8B98B4] font-mono shrink-0"
                >
                  {p.portao}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
