import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export type PerfilUsuario = 'visitante' | 'lead' | 'assinante_saas' | 'assinante_maas_bespoke'

interface ContextualCtaProps {
  perfil: PerfilUsuario
  className?: string
  origem?: 'resultados' | 'dashboard' | 'app'
}

/**
 * DIRETRIZ 1 — CTAs CONTEXTUAIS POR PERFIL (JBP GM V7.2.3 — Rodada 1.5)
 *
 * Regra de ouro:
 * - Um assinante NUNCA vê um CTA que o trata como lead.
 * - Um lead NUNCA vê CTA de assinatura às cegas.
 *
 * Comportamento por perfil:
 * (a) Visitante (não logado): CTA de conversão para questionário/Lista de Prioridade.
 * (b) Lead com diagnóstico pronto: CTA único "Agendar minha Devolutiva Executiva" (nunca "fazer outro diagnóstico").
 * (c) Assinante SaaS: CTA "Atualizar Diagnóstico" apenas onde faz sentido (dashboard), levando ao histórico.
 * (d) Assinante MaaS/Bespoke: igual ao SaaS + indicação do portão de validação humano ativo.
 */
export function ContextualCta({
  perfil,
  className = '',
  origem = 'resultados',
}: ContextualCtaProps) {
  // (a) Visitante (não logado)
  if (perfil === 'visitante') {
    return (
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 ${className}`}
      >
        <Button
          asChild
          className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] shadow-sm font-semibold text-xs h-10 px-4 gap-1.5"
        >
          <Link to="/questionario">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Realizar Diagnóstico Gratuito</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-[#FF9900] text-[#D97706] hover:bg-[#FF9900]/10 rounded-[4px] text-xs h-10 px-3.5"
        >
          <Link to="/lista-prioridade">Lista de Prioridade</Link>
        </Button>
      </div>
    )
  }

  // (b) Lead com diagnóstico pronto — CTA único
  if (perfil === 'lead') {
    return (
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 ${className}`}
      >
        <Button
          asChild
          className="bg-[#22B14C] hover:bg-[#1E9E43] text-white rounded-[4px] shadow-sm font-semibold text-xs h-10 px-5 gap-2"
        >
          <a
            href="mailto:contato.comercial@vetormaster.com.br?subject=Agendamento%20de%20Devolutiva%20Executiva%20V7.2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar minha Devolutiva Executiva</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </Button>
        <Badge
          variant="outline"
          className="border-[#22B14C]/40 bg-[#22B14C]/10 text-[#1E9E43] text-[11px] font-semibold px-2.5 py-1.5 rounded-[3px] justify-center"
        >
          SLA: Retorno em até 72h úteis
        </Badge>
      </div>
    )
  }

  // (c) Assinante SaaS
  if (perfil === 'assinante_saas') {
    return (
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 ${className}`}
      >
        <Button
          asChild
          className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] shadow-sm font-semibold text-xs h-10 px-4 gap-2"
        >
          <Link to="/diagnosticos">
            <History className="w-4 h-4" />
            <span>Atualizar Diagnóstico</span>
          </Link>
        </Button>
        <Badge
          variant="outline"
          className="border-[#0066CC]/30 bg-[#0066CC]/5 text-[#0066CC] text-[11px] font-semibold px-2.5 py-1.5 rounded-[3px] justify-center"
        >
          Assinatura SaaS Ativa
        </Badge>
      </div>
    )
  }

  // (d) Assinante MaaS / Bespoke
  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 ${className}`}>
      <Button
        asChild
        className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] shadow-sm font-semibold text-xs h-10 px-4 gap-2"
      >
        <Link to="/diagnosticos">
          <History className="w-4 h-4" />
          <span>Atualizar Diagnóstico</span>
        </Link>
      </Button>
      <Badge className="bg-[#3DDC74]/15 text-[#22B14C] border-[#22B14C]/30 text-[10px] font-semibold px-2.5 py-1.5 flex items-center gap-1 justify-center">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Portão de Validação Humano Ativo (MaaS/Bespoke)</span>
      </Badge>
    </div>
  )
}
