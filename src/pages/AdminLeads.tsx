import React, { useEffect, useState, useCallback } from 'react'
import {
  Users,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Building2,
  Mail,
  Phone,
  Search,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getLeadsList,
  dispararSincronizacaoSite,
  dispararTesteE2E,
  type LeadRecord,
  type SyncResult,
  type E2ETestResult,
} from '@/services/site-leads-sync'
import { LeadDetailsDialog } from '@/components/admin/lead-details-dialog'

export default function AdminLeads() {
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [testingE2E, setTestingE2E] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const loadLeads = useCallback(async () => {
    try {
      const data = await getLeadsList()
      setLeads(data)
    } catch (err) {
      console.error('Erro ao carregar leads:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  // Ouvir atualizações da coleção leads via Realtime do PocketBase
  useRealtime('leads', () => {
    loadLeads()
  })

  // Sincronização manual sob demanda
  const handleSyncManual = async () => {
    setSyncing(true)
    setFeedback(null)
    try {
      const res: SyncResult = await dispararSincronizacaoSite()
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Sincronização concluída com sucesso! ${res.novosLeads ?? 0} novos lead(s) adicionados, ${res.atualizadosLeads ?? 0} atualizados. Total no site: ${res.totalRemote ?? 0}.`,
        })
        await loadLeads()
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Falha ao sincronizar leads com o site institucional.',
        })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro inesperado na sincronização.',
      })
    } finally {
      setSyncing(false)
    }
  }

  // Teste E2E ponta-a-ponta
  const handleTestE2E = async () => {
    setTestingE2E(true)
    setFeedback(null)
    try {
      const res: E2ETestResult = await dispararTesteE2E()
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Teste ponta-a-ponta concluído com sucesso! Lead de teste criado no site e sincronizado no app. Protocolo: ${res.protocolo}`,
        })
        await loadLeads()
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Falha na execução do teste ponta-a-ponta.',
        })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro inesperado no teste E2E.',
      })
    } finally {
      setTestingE2E(false)
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const q = searchTerm.toLowerCase()
    return (
      (lead.protocolo || '').toLowerCase().includes(q) ||
      (lead.nome_completo || '').toLowerCase().includes(q) ||
      (lead.razao_social || '').toLowerCase().includes(q) ||
      (lead.email || '').toLowerCase().includes(q) ||
      (lead.setor || '').toLowerCase().includes(q) ||
      (lead.cnpj || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 p-6 animate-fade-in text-[#F8FAFC]">
      {/* Cabeçalho */}
      <div className="bg-[#111A2E] border border-[#24334F] rounded-[4px] p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#FF9900] uppercase tracking-wider mb-1">
            <span>Integração Site ↔ App (Fluxo B)</span>
            <span className="text-[#8B98B4]">•</span>
            <span>Vetor Master V7.2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2">
            <Users className="w-7 h-7 text-[#0066CC]" />
            Leads & Sessões do Site
          </h1>
          <p className="text-xs md:text-sm text-[#C7D0E0] mt-1 max-w-2xl">
            Sincronização automática contínua (cron a cada 5 minutos) da coleção{' '}
            <code className="text-[#5B9DFF] bg-[#16213A] px-1.5 py-0.5 rounded">leads</code> do site
            institucional para este app. Zero importador .json. O Admin tem acesso direto a todas as
            respostas e dossiês do questionário.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Button
            onClick={handleSyncManual}
            disabled={syncing || testingE2E}
            className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs font-semibold gap-2 transition-colors"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
          </Button>

          <Button
            onClick={handleTestE2E}
            disabled={syncing || testingE2E}
            variant="outline"
            className="border-[#24334F] bg-[#16213A] text-[#FFB84D] hover:bg-[#1f2e4d] rounded-[4px] text-xs font-semibold gap-2"
          >
            {testingE2E ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-[#FFB84D]" />
            )}
            <span>{testingE2E ? 'Testando E2E...' : 'Testar Lead E2E'}</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-[4px] border text-xs flex items-start gap-3 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-[#3DDC74]/10 border-[#3DDC74]/30 text-[#3DDC74]'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">
              {feedback.type === 'success' ? 'Operação Concluída' : 'Atenção / Falha'}
            </span>
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* Cards de Status da Conexão */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#16213A] border-[#24334F]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-[#8B98B4] uppercase flex items-center justify-between">
              <span>Status da Integração</span>
              <ShieldCheck className="w-4 h-4 text-[#3DDC74]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-[#3DDC74] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3DDC74] animate-pulse"></span>
              Ativa e Monitorada
            </div>
            <p className="text-[11px] text-[#8B98B4] mt-1">
              Poller via cron ativo a cada 5 min + endpoint manual
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#16213A] border-[#24334F]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-[#8B98B4] uppercase flex items-center justify-between">
              <span>Total de Leads no App</span>
              <Users className="w-4 h-4 text-[#5B9DFF]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F8FAFC]">{leads.length}</div>
            <p className="text-[11px] text-[#8B98B4] mt-1">
              Sessões capturadas no site e disponíveis no app
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#16213A] border-[#24334F]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-[#8B98B4] uppercase flex items-center justify-between">
              <span>Regra Capital V7.2</span>
              <CheckCircle2 className="w-4 h-4 text-[#FFB84D]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-[#FFB84D]">Zero Importador .JSON</div>
            <p className="text-[11px] text-[#8B98B4] mt-1">
              Sessões entram automaticamente via API sem exportação manual pelo lead
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Leads */}
      <Card className="bg-[#16213A] border-[#24334F]">
        <CardHeader className="border-b border-[#24334F] pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-bold text-[#F8FAFC]">
                Listagem de Sessões & Leads Sincronizados
              </CardTitle>
              <CardDescription className="text-xs text-[#8B98B4]">
                Clique em &quot;Ver Respostas&quot; para auditar o dossiê e questionário completo do
                lead
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8B98B4]" />
              <Input
                placeholder="Buscar por nome, empresa, protocolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#0B1120] border-[#24334F] text-xs text-[#F8FAFC] rounded-[4px] h-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0066CC]" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <Users className="w-10 h-10 text-[#8B98B4] mx-auto opacity-50" />
              <p className="text-sm text-[#C7D0E0]">
                {searchTerm
                  ? 'Nenhum lead encontrado com os filtros aplicados.'
                  : 'Nenhum lead na base local ainda.'}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  size="sm"
                  onClick={handleSyncManual}
                  disabled={syncing}
                  className="bg-[#0066CC] hover:bg-[#22B14C] text-white text-xs rounded-[4px]"
                >
                  Sincronizar do Site Agora
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestE2E}
                  disabled={testingE2E}
                  className="border-[#24334F] text-[#FFB84D] hover:bg-[#0B1120] text-xs rounded-[4px]"
                >
                  Gerar Lead de Teste E2E
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#0B1120]/60">
                  <TableRow className="border-[#24334F] hover:bg-transparent">
                    <TableHead className="text-xs text-[#8B98B4]">Protocolo</TableHead>
                    <TableHead className="text-xs text-[#8B98B4]">Empresa / Lead</TableHead>
                    <TableHead className="text-xs text-[#8B98B4]">Setor & Formato</TableHead>
                    <TableHead className="text-xs text-[#8B98B4]">Contato</TableHead>
                    <TableHead className="text-xs text-[#8B98B4]">Status</TableHead>
                    <TableHead className="text-xs text-[#8B98B4]">Sincronizado Em</TableHead>
                    <TableHead className="text-xs text-[#8B98B4] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="border-[#24334F] hover:bg-[#0B1120]/40">
                      <TableCell className="font-mono text-xs text-[#5B9DFF]">
                        {lead.protocolo}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-[#F8FAFC]">
                            {lead.razao_social || lead.nome_completo || 'Sem identificação'}
                          </div>
                          <div className="text-[11px] text-[#8B98B4]">
                            {lead.nome_completo} {lead.cargo ? `• ${lead.cargo}` : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="text-xs text-[#C7D0E0]">{lead.setor || '—'}</div>
                          <div className="text-[10px] text-[#FFB84D]">
                            {lead.formato_interesse || lead.plano_interesse || '—'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-[#C7D0E0]">{lead.email || '—'}</div>
                          <div className="text-[#8B98B4]">{lead.whatsapp || '—'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            lead.status === 'Novo'
                              ? 'border-[#3DDC74]/50 text-[#3DDC74] bg-[#3DDC74]/10 text-[10px]'
                              : 'border-[#8B98B4] text-[#C7D0E0] text-[10px]'
                          }
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#8B98B4] whitespace-nowrap">
                        {lead.synced_at
                          ? new Date(lead.synced_at).toLocaleString('pt-BR')
                          : new Date(lead.created).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLead(lead)
                            setDialogOpen(true)
                          }}
                          className="border-[#24334F] bg-[#0B1120] text-[#5B9DFF] hover:bg-[#0066CC] hover:text-white rounded-[4px] text-xs h-8 gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Respostas</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal com detalhes e respostas completas do lead */}
      <LeadDetailsDialog
        lead={selectedLead}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedLead(null)
        }}
      />
    </div>
  )
}
