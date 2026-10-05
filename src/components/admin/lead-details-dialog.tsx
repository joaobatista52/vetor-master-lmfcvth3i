import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  Layers,
  FileCheck2,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import type { LeadRecord } from '@/services/site-leads-sync'

interface LeadDetailsDialogProps {
  lead: LeadRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadDetailsDialog({ lead, open, onOpenChange }: LeadDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'respostas' | 'bruto'>('geral')

  if (!lead) return null

  const dadosCompletos = lead.dados_completos || {}
  const pilares = dadosCompletos.pilares || {}
  const perfil = dadosCompletos.perfil || {}
  const doc = dadosCompletos.documentacao || {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#111A2E] text-[#F8FAFC] border-[#24334F] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-[#24334F] bg-[#0B1120]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#0066CC]/20 text-[#5B9DFF] border border-[#5B9DFF]/40 font-mono text-xs">
                  {lead.protocolo}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    lead.status === 'Novo'
                      ? 'border-[#3DDC74]/50 text-[#3DDC74] bg-[#3DDC74]/10'
                      : 'border-[#8B98B4] text-[#C7D0E0]'
                  }
                >
                  {lead.status}
                </Badge>
                {lead.origem && (
                  <Badge className="bg-[#FF9900]/20 text-[#FFB84D] border border-[#FF9900]/40 text-xs">
                    {lead.origem}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-bold mt-2 text-[#F8FAFC]">
                {lead.razao_social || lead.nome_completo || 'Lead do Site Institucional'}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8B98B4] mt-0.5">
                Respondente: <span className="text-[#C7D0E0]">{lead.nome_completo || '—'}</span> (
                {lead.cargo || 'Cargo não informado'})
              </DialogDescription>
            </div>
            <div className="text-right text-xs text-[#8B98B4]">
              <div>
                ID Site:{' '}
                <span className="font-mono text-[#5B9DFF]">{lead.site_lead_id || '—'}</span>
              </div>
              <div>
                Sincronizado:{' '}
                {lead.synced_at ? new Date(lead.synced_at).toLocaleString('pt-BR') : '—'}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(v: any) => setActiveTab(v)}
            className="flex-1 flex flex-col"
          >
            <TabsList className="bg-[#16213A] border border-[#24334F] text-[#8B98B4] mb-4">
              <TabsTrigger
                value="geral"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs"
              >
                Visão Geral & Contato
              </TabsTrigger>
              <TabsTrigger
                value="respostas"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs"
              >
                Questionário & 3 Pilares
              </TabsTrigger>
              <TabsTrigger
                value="bruto"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs"
              >
                Dossiê Completo (JSON)
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 pr-4">
              <TabsContent value="geral" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[#16213A] border-[#24334F]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-[#8B98B4] uppercase flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#5B9DFF]" /> Dados Corporativos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div>
                        <span className="text-[#8B98B4]">Razão Social / Nome:</span>{' '}
                        <span className="font-medium text-[#F8FAFC]">
                          {lead.razao_social || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8B98B4]">CNPJ:</span>{' '}
                        <span className="font-mono text-[#F8FAFC]">{lead.cnpj || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[#8B98B4]">Setor / Segmento:</span>{' '}
                        <span className="text-[#F8FAFC]">
                          {lead.setor || '—'} {lead.segmento ? `(${lead.segmento})` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8B98B4]">Faturamento:</span>{' '}
                        <span className="text-[#F8FAFC]">
                          {lead.faturamento_mensal || perfil.faturamento_anual || '—'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#16213A] border-[#24334F]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-[#8B98B4] uppercase flex items-center gap-2">
                        <User className="w-4 h-4 text-[#3DDC74]" /> Contato do Respondente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div>
                        <span className="text-[#8B98B4]">Nome:</span>{' '}
                        <span className="font-medium text-[#F8FAFC]">
                          {lead.nome_completo || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8B98B4]">Cargo / Função:</span>{' '}
                        <span className="text-[#F8FAFC]">{lead.cargo || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#8B98B4]" />
                        <span className="text-[#F8FAFC]">{lead.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#8B98B4]" />
                        <span className="text-[#F8FAFC]">{lead.whatsapp || '—'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-[#16213A] border-[#24334F]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-[#8B98B4] uppercase flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#FFB84D]" /> Interesse & Governança Comercial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#8B98B4] block mb-1">Autorização Devolutiva:</span>
                      <Badge className="bg-[#3DDC74]/20 text-[#3DDC74] border-[#3DDC74]/30">
                        {lead.autorizacao_devolutiva || 'Sim'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-[#8B98B4] block mb-1">Formato de Interesse:</span>
                      <Badge className="bg-[#0066CC]/20 text-[#5B9DFF] border-[#5B9DFF]/30">
                        {lead.formato_interesse || lead.plano_interesse || 'Não especificado'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-[#8B98B4] block mb-1">Responsável Documentos:</span>
                      <span className="text-[#F8FAFC] font-medium">
                        {lead.responsavel_envio || doc.responsavel_envio || '—'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="respostas" className="mt-0 space-y-4">
                {/* 3 Pilares */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFB84D] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Diagnóstico dos 3 Pilares e Lentes
                    Metodológicas
                  </h4>

                  {/* Pilar 1 */}
                  <Card className="bg-[#16213A] border-[#24334F]">
                    <CardHeader className="pb-2 border-b border-[#24334F]/60">
                      <CardTitle className="text-xs font-semibold text-[#F8FAFC]">
                        Pilar 1 — Prisão do Fundador & Centralização
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 text-xs space-y-2">
                      {pilares.pilar_1_prisao_fundador &&
                      Array.isArray(pilares.pilar_1_prisao_fundador) &&
                      pilares.pilar_1_prisao_fundador.length > 0 ? (
                        pilares.pilar_1_prisao_fundador.map((p: any, idx: number) => (
                          <div
                            key={idx}
                            className="border-b border-[#24334F]/40 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="font-medium text-[#C7D0E0]">
                              {p.pergunta || p.item || `Pergunta ${idx + 1}`}:{' '}
                            </span>
                            <span className="text-[#3DDC74] font-semibold">
                              {String(p.resposta || p.valor || p.nota || '—')}
                            </span>
                            {p.nota && p.resposta && (
                              <div className="text-[11px] text-[#8B98B4] mt-0.5">{p.nota}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-[#8B98B4]">
                          Nenhuma resposta detalhada registrada neste bloco.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pilar 2 */}
                  <Card className="bg-[#16213A] border-[#24334F]">
                    <CardHeader className="pb-2 border-b border-[#24334F]/60">
                      <CardTitle className="text-xs font-semibold text-[#F8FAFC]">
                        Pilar 2 — Ineficiência Invisível & Processos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 text-xs space-y-2">
                      {pilares.pilar_2_ineficiencia_invisivel &&
                      Array.isArray(pilares.pilar_2_ineficiencia_invisivel) &&
                      pilares.pilar_2_ineficiencia_invisivel.length > 0 ? (
                        pilares.pilar_2_ineficiencia_invisivel.map((p: any, idx: number) => (
                          <div
                            key={idx}
                            className="border-b border-[#24334F]/40 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="font-medium text-[#C7D0E0]">
                              {p.pergunta || p.item || `Pergunta ${idx + 1}`}:{' '}
                            </span>
                            <span className="text-[#3DDC74] font-semibold">
                              {String(p.resposta || p.valor || p.nota || '—')}
                            </span>
                            {p.nota && p.resposta && (
                              <div className="text-[11px] text-[#8B98B4] mt-0.5">{p.nota}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-[#8B98B4]">
                          Nenhuma resposta detalhada registrada neste bloco.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pilar 3 */}
                  <Card className="bg-[#16213A] border-[#24334F]">
                    <CardHeader className="pb-2 border-b border-[#24334F]/60">
                      <CardTitle className="text-xs font-semibold text-[#F8FAFC]">
                        Pilar 3 — Abismo entre Estratégia & Execução
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 text-xs space-y-2">
                      {pilares.pilar_3_abismo_estrategia_execucao &&
                      Array.isArray(pilares.pilar_3_abismo_estrategia_execucao) &&
                      pilares.pilar_3_abismo_estrategia_execucao.length > 0 ? (
                        pilares.pilar_3_abismo_estrategia_execucao.map((p: any, idx: number) => (
                          <div
                            key={idx}
                            className="border-b border-[#24334F]/40 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="font-medium text-[#C7D0E0]">
                              {p.pergunta || p.item || `Pergunta ${idx + 1}`}:{' '}
                            </span>
                            <span className="text-[#3DDC74] font-semibold">
                              {String(p.resposta || p.valor || p.nota || '—')}
                            </span>
                            {p.nota && p.resposta && (
                              <div className="text-[11px] text-[#8B98B4] mt-0.5">{p.nota}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-[#8B98B4]">
                          Nenhuma resposta detalhada registrada neste bloco.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="bruto" className="mt-0">
                <Card className="bg-[#0B1120] border-[#24334F]">
                  <CardContent className="p-4">
                    <pre className="text-[11px] font-mono text-[#3DDC74] whitespace-pre-wrap break-words overflow-x-auto">
                      {JSON.stringify(lead.dados_completos || lead, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
