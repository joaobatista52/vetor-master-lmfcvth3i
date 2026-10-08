import React, { useState } from 'react'
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Info,
  BookOpen,
  FileText,
  UserCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/**
 * Textos de Apoio ao Operador do Painel
 * Fonte literal: PDF "FAQs_textos_melhorias_07out26-a80fc.pdf", Observação A (página 4).
 * Conteúdo estritamente interno de atendimento — visível apenas em /admin/leads.
 */
export const TEXTOS_APOIO_OPERADOR = [
  {
    id: 'A1',
    codigo: '1',
    titulo: 'Por que meu lead está classificado como Lista de Espera SaaS?',
    icone: Info,
    texto:
      'Lead inscrito no modal do card SaaS ("Em breve"), que coleta apenas contato e autorizações. Não respondeu o questionário: o dossiê completo só existirá se ele aceitar o convite feito na tela de confirmação. Acionamento manual: contato direto + oferta do MaaS Híbrido, priorizando os que retornaram com o questionário respondido.',
  },
  {
    id: 'A2',
    codigo: '2',
    titulo: 'Como usar os anexos do dossiê?',
    icone: FileText,
    texto:
      'Os arquivos (DRE, relatórios gerenciais, documentos societários) servem exclusivamente à elaboração do diagnóstico. Uso restrito à equipe do atendimento; nunca compartilhar fora do contexto da devolutiva.',
  },
  {
    id: 'A3',
    codigo: '3',
    titulo: 'Conduta na devolutiva',
    icone: UserCheck,
    texto:
      'Sessão conduzida por executivo sênior, 45 minutos, com as recomendações do diagnóstico em mãos; comunicar o raciocínio por trás de cada recomendação e registrar no app o resultado da sessão.',
  },
] as const

interface ApoioOperadorProps {
  className?: string
}

export function ApoioOperador({ className = '' }: ApoioOperadorProps) {
  const [expandido, setExpandido] = useState(false)

  return (
    <Card
      className={`bg-[#111A2E] border-[#24334F] rounded-[4px] shadow-sm overflow-hidden transition-all duration-200 ${className}`}
    >
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111A2E]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[#0066CC]/15 border border-[#0066CC]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <HelpCircle className="w-4 h-4 text-[#5B9DFF]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">
                Textos de Apoio ao Operador
              </span>
              <Badge
                variant="outline"
                className="border-[#FF9900]/40 text-[#FFB84D] bg-[#FF9900]/10 text-[10px] font-medium py-0 h-5"
              >
                Uso Restrito • Atendimento
              </Badge>
              <Badge
                variant="outline"
                className="border-[#24334F] text-[#8B98B4] bg-[#0B1120] text-[10px] font-mono py-0 h-5"
              >
                3 Orientações
              </Badge>
            </div>
            <p className="text-[11px] text-[#8B98B4] mt-0.5">
              Diretrizes operacionais para triagem de leads, anexos do dossiê e conduta da sessão de
              devolutiva.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setExpandido((prev) => !prev)}
          className="border-[#24334F] bg-[#16213A] hover:bg-[#1f2e4d] text-[#F8FAFC] text-xs h-8 px-3 rounded-[4px] self-start sm:self-auto shrink-0 gap-1.5"
          aria-expanded={expandido}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#5B9DFF]" />
          <span>{expandido ? 'Ocultar Orientações' : 'Ver Orientações de Apoio'}</span>
          {expandido ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#8B98B4]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#8B98B4]" />
          )}
        </Button>
      </div>

      {expandido && (
        <CardContent className="pt-0 pb-4 px-4 border-t border-[#24334F]/70 bg-[#0E1626]/60">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-4">
            {TEXTOS_APOIO_OPERADOR.map((item) => {
              const Icone = item.icone
              return (
                <div
                  key={item.id}
                  className="bg-[#111A2E] border border-[#24334F] rounded-[4px] p-4 flex flex-col justify-between hover:border-[#384c70] transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-[3px] bg-[#16213A] border border-[#24334F] flex items-center justify-center shrink-0 mt-0.5">
                        <Icone className="w-3.5 h-3.5 text-[#5B9DFF]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold font-mono text-[#FF9900] bg-[#FF9900]/10 px-1 py-0.2 rounded">
                            {item.id}
                          </span>
                          <span className="text-[10px] text-[#8B98B4] font-medium">
                            Diretriz Operacional #{item.codigo}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#F8FAFC] leading-snug">
                          {item.titulo}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-[#C7D0E0] leading-relaxed pl-8">{item.texto}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#24334F]/50 pl-8 flex items-center gap-1.5 text-[10px] text-[#8B98B4]">
                    <ShieldAlert className="w-3 h-3 text-[#FF9900]" />
                    <span>Diretriz estritamente interna</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
