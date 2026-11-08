import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'src/hooks/use-toast'
import { pb } from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { extrairJsonDeTexto } from '@/services/pacote-v2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

/**
 * ETAPA E2-B — TELA /admin/ingestao (Pacote Estruturado V2.0)
 * Operação INTERNA (admin + consultor). Nenhum cliente final tem acesso
 * a esta tela; nenhum lead exporta .json (Regra Capital).
 */

interface LeadOpcao {
  id: string
  nome: string
  razao_social: string
  cnpj: string
  dossie_id: string
  nivel: string
}

interface ErroValidacao {
  codigo: number
  mensagem: string
  detalhe?: string
}

interface BlocoValidacao {
  bloco: string
  status: 'ok' | 'erro'
  resumo: string
  erros?: ErroValidacao[]
}

interface ResultadoValidacao {
  valido: boolean
  parte: string
  blocos: BlocoValidacao[]
  erros: ErroValidacao[]
  dossie_id: string
}

interface ResultadoIngestao {
  parte: string
  prj: number
  pac: number
  etapas: number
  okrs: number
  hoshin: number
  rituais: number
  pacote_id: string
  dossie_id: string
}

interface PacoteV2Item {
  id: string
  dossie_id: string
  parte: string
  status_validacao: string
  erros_validacao: ErroValidacao[] | string
  importado_em: string
  importado_por: string
  expand?: { importado_por?: { id: string; name: string; email: string } }
}

const CONTADORES_ESPERADOS: Record<string, number> = {
  prj: 6,
  pac: 12,
  etapas: 116,
  okrs: 7,
  hoshin: 7,
  rituais: 5,
}

const ROTULOS_CONTADORES: Record<string, string> = {
  prj: 'PRJ (Projetos)',
  pac: 'PAC (Planos de Ação)',
  etapas: 'Etapas',
  okrs: 'OKRs',
  hoshin: 'Cartões Hoshin',
  rituais: 'Rituais',
}

const LABEL_PARTE: Record<string, string> = {
  A: 'Parte A',
  B: 'Parte B',
  AB: 'Parte AB (completo)',
}

export default function AdminIngestao() {
  const { user } = useAuth()

  // ---- contexto (1.1) ----
  const [leads, setLeads] = useState<LeadOpcao[]>([])
  const [leadSelecionado, setLeadSelecionado] = useState<string>('')
  const [dossieId, setDossieId] = useState<string>('')
  const [carregandoLeads, setCarregandoLeads] = useState(true)

  // ---- colagem (1.2) ----
  const [texto, setTexto] = useState('')
  const [jsonExtraido, setJsonExtraido] = useState(false)

  // ---- validar / importar ----
  const [validando, setValidando] = useState(false)
  const [importando, setImportando] = useState(false)
  const [validacao, setValidacao] = useState<ResultadoValidacao | null>(null)
  const [ingestao, setIngestao] = useState<ResultadoIngestao | null>(null)
  const [erroValidar, setErroValidar] = useState<string | null>(null)
  const [erroImportar, setErroImportar] = useState<string | null>(null)

  // ---- histórico (1.5) ----
  const [pacotes, setPacotes] = useState<PacoteV2Item[]>([])
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [carregandoPacotes, setCarregandoPacotes] = useState(false)
  const [pacoteSelecionado, setPacoteSelecionado] = useState<PacoteV2Item | null>(null)

  const leadAtual = useMemo(
    () => leads.find((l) => l.id === leadSelecionado) || null,
    [leads, leadSelecionado],
  )

  // Carrega leads com dossiê (dropdown)
  useEffect(() => {
    let ativo = true
    setCarregandoLeads(true)
    pb.collection('leads')
      .getFullList({
        sort: '-created',
        filter: 'dossie_id != ""',
        fields: 'id,nome_completo,razao_social,cnpj,dossie_id,nivel_assinatura,formato_interesse',
      })
      .then((items) => {
        if (!ativo) return
        setLeads(
          (items as unknown as LeadOpcao[]).map((l) => ({
            ...l,
            nome: l.nome_completo || l.razao_social || l.id,
          })),
        )
      })
      .catch(() => {
        if (ativo) toast({ title: 'Falha ao carregar leads', variant: 'destructive' })
      })
      .finally(() => {
        if (ativo) setCarregandoLeads(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  // Carrega histórico de pacotes
  const carregarHistorico = useCallback(() => {
    setCarregandoPacotes(true)
    const filtro = filtroStatus !== 'todos' ? `status_validacao="${filtroStatus}"` : ''
    pb.collection('pacotes_v2')
      .getList(1, 50, {
        sort: '-importado_em',
        ...(filtro ? { filter: filtro } : {}),
        expand: 'importado_por',
      })
      .then((res) => {
        setPacotes(res.items as unknown as PacoteV2Item[])
      })
      .catch(() => {
        toast({ title: 'Falha ao carregar histórico', variant: 'destructive' })
      })
      .finally(() => setCarregandoPacotes(false))
  }, [filtroStatus])

  useEffect(() => {
    carregarHistorico()
  }, [carregarHistorico])

  const selecionarLead = (id: string) => {
    setLeadSelecionado(id)
    setValidacao(null)
    setIngestao(null)
    setErroValidar(null)
    setErroImportar(null)
    const l = leads.find((x) => x.id === id)
    setDossieId(l?.dossie_id || '')
  }

  const handleTextoChange = (valor: string) => {
    setTexto(valor)
    setJsonExtraido(!!extrairJsonDeTexto(valor))
  }

  const colarDaAreaDeTransferencia = async () => {
    try {
      const txt = await navigator.clipboard.readText()
      if (txt) {
        handleTextoChange(txt)
        toast({ title: 'Conteúdo colado da área de transferência' })
      }
    } catch {
      toast({
        title: 'Não foi possível ler a área de transferência',
        description: 'Cole manualmente com Ctrl+V.',
        variant: 'destructive',
      })
    }
  }

  // ---- validar (1.3) ----
  const validar = async () => {
    if (!leadSelecionado) {
      setErroValidar('Selecione um lead / dossiê antes de validar.')
      return
    }
    if (!texto.trim()) {
      setErroValidar('Cole o conteúdo JSON do pacote antes de validar.')
      return
    }
    setErroValidar(null)
    setErroImportar(null)
    setValidando(true)
    setValidacao(null)
    setIngestao(null)
    try {
      const res = await pb.send('/backend/v1/pacote-v2/validar', {
        method: 'POST',
        body: { texto, lead_id: leadSelecionado || undefined },
      })
      setValidacao(res as unknown as ResultadoValidacao)
      if (!(res as unknown as ResultadoValidacao).valido) {
        toast({ title: 'Pacote com erros de validação', variant: 'destructive' })
      }
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string; response?: { message?: string } }
      if (e?.status === 401 || e?.status === 403) {
        setErroValidar('Sem permissão: apenas admin e consultor podem validar pacotes.')
      } else if (e?.status === 400 && (e?.response as { code?: number })?.code) {
        setErroValidar(
          `Erro ${(e.response as { code?: number }).code}: ${e?.response?.message || e?.message || 'Requisição inválida.'}`,
        )
      } else {
        setErroValidar(e?.message || 'Falha na validação.')
      }
    } finally {
      setValidando(false)
    }
  }

  // ---- importar (1.4) ----
  const importar = async () => {
    if (!validacao?.valido) return
    setImportando(true)
    setErroImportar(null)
    try {
      const res = await pb.send('/backend/v1/pacote-v2/ingestar', {
        method: 'POST',
        body: { texto, lead_id: leadSelecionado || undefined },
      })
      const resultado = res as unknown as ResultadoIngestao
      setIngestao(resultado)
      const divergencias: string[] = []
      for (const [chave, esperado] of Object.entries(CONTADORES_ESPERADOS)) {
        const recebido = (resultado as unknown as Record<string, number>)[chave]
        if (typeof recebido === 'number' && recebido !== esperado) {
          divergencias.push(
            `${ROTULOS_CONTADORES[chave]}: recebido ${recebido} · esperado ${esperado}`,
          )
        }
      }
      if (divergencias.length > 0) {
        toast({
          title: 'Pacote importado com divergências',
          description: divergencias.join(' · '),
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Pacote importado com sucesso!' })
      }
      setTexto('')
      setJsonExtraido(false)
      setValidacao(null)
      carregarHistorico()
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string; response?: { message?: string } }
      if (e?.status === 401 || e?.status === 403) {
        setErroImportar('Sem permissão: apenas admin e consultor podem importar pacotes.')
      } else {
        setErroImportar(e?.message || 'Falha na importação.')
      }
    } finally {
      setImportando(false)
    }
  }

  const divergenciasIngestao = useMemo(() => {
    if (!ingestao) return []
    const out: string[] = []
    for (const [chave, esperado] of Object.entries(CONTADORES_ESPERADOS)) {
      const recebido = (ingestao as unknown as Record<string, number>)[chave]
      if (typeof recebido === 'number' && recebido !== esperado) {
        out.push(`${ROTULOS_CONTADORES[chave]} — recebido: ${recebido}, esperado: ${esperado}`)
      }
    }
    return out
  }, [ingestao])

  const podeValidar = !!leadSelecionado && texto.trim().length > 0 && !validando
  const podeImportar = !!validacao?.valido && !importando

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ingestão do Pacote V2.0</h1>
        <p className="text-sm text-muted-foreground">
          Operação interna (admin/consultor): validação e importação do Pacote Estruturado V2.0 para
          um dossiê existente.
        </p>
      </div>

      {/* 1.1 — Contexto */}
      <Card>
        <CardHeader>
          <CardTitle>1. Contexto — Lead / Dossiê</CardTitle>
          <CardDescription>
            Selecione o lead existente cujo dossiê receberá o pacote. O campo dossie_id é opcional e
            pré-preenchido quando o lead já possui um.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lead / Dossiê *</label>
              <Select
                value={leadSelecionado}
                onValueChange={selecionarLead}
                disabled={carregandoLeads}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={carregandoLeads ? 'Carregando leads…' : 'Selecione o lead'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.nome} · {l.razao_social || 's/ razão social'} · {l.cnpj || 's/ CNPJ'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">dossie_id (opcional)</label>
              <Input
                value={dossieId}
                onChange={(e2) => setDossieId(e2.target.value)}
                placeholder="Pré-preenchido se o lead tiver dossiê"
              />
            </div>
          </div>
          {leadAtual && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Nível:</span>
              <Badge variant="default">{leadAtual.nivel || 'A definir'}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1.2 + 1.3 + 1.4 — Colagem, Validar, Importar */}
      <Card>
        <CardHeader>
          <CardTitle>2. Pacote Estruturado V2.0 (JSON)</CardTitle>
          <CardDescription>
            Cole o JSON do pacote (com ou sem texto ao redor). Valide antes de importar — a
            importação só é liberada com validação verde.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={texto}
            onChange={(e2) => handleTextoChange(e2.target.value)}
            rows={20}
            placeholder="Cole aqui o JSON do pacote…"
            className="font-mono text-xs min-h-[20rem]"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {texto.length} caracteres
              {jsonExtraido && ' · JSON detectado no texto colado'}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={colarDaAreaDeTransferencia}>
              Colar da área de transferência
            </Button>
          </div>

          {erroValidar && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {erroValidar}
            </div>
          )}
          {erroImportar && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {erroImportar}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={validar} disabled={!podeValidar}>
              {validando ? 'Validando…' : 'Validar'}
            </Button>
            <Button onClick={importar} disabled={!podeImportar} variant="default">
              {importando ? 'Importando…' : 'Importar'}
            </Button>
          </div>

          {/* resultado por bloco */}
          {validacao && (
            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center gap-2">
                <Badge variant={validacao.valido ? 'default' : 'destructive'}>
                  {validacao.valido ? '✅ Pacote válido' : '❌ Pacote inválido'}
                </Badge>
                {validacao.parte && (
                  <Badge variant="outline">{LABEL_PARTE[validacao.parte] || validacao.parte}</Badge>
                )}
              </div>
              <div className="space-y-2">
                {validacao.blocos?.map((b) => (
                  <div key={b.bloco} className="flex items-start gap-2 text-sm">
                    <span>{b.status === 'ok' ? '✅' : '❌'}</span>
                    <span className="font-medium">{b.bloco}</span>
                    <span className="text-muted-foreground">— {b.resumo}</span>
                    {b.erros?.map((err) => (
                      <span key={err.codigo} className="text-destructive">
                        [{err.codigo}] {err.mensagem}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* contadores reais pós-importação */}
          {ingestao && (
            <div className="space-y-3 rounded-md border bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <Badge>{LABEL_PARTE[ingestao.parte] || ingestao.parte}</Badge>
                <span className="text-sm font-medium">
                  Pacote {ingestao.pacote_id} gravado no dossiê {ingestao.dossie_id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {Object.entries(CONTADORES_ESPERADOS).map(([chave, esperado]) => {
                  const recebido = (ingestao as unknown as Record<string, number>)[chave]
                  const divergiu = recebido !== esperado
                  return (
                    <div
                      key={chave}
                      className={cn(
                        'rounded border p-2 text-sm',
                        divergiu ? 'border-yellow-500 bg-yellow-50' : 'bg-background',
                      )}
                    >
                      <div className="font-medium">{ROTULOS_CONTADORES[chave]}</div>
                      <div className={cn('text-xs', divergiu && 'text-yellow-700')}>
                        {recebido} {divergiu && `(esperado ${esperado})`}
                      </div>
                    </div>
                  )
                })}
              </div>
              {divergenciasIngestao.length > 0 && (
                <div className="rounded-md border border-yellow-500 bg-yellow-50 p-3 text-sm text-yellow-800">
                  Divergências vs esperado: {divergenciasIngestao.join(' · ')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1.5 — Histórico */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>3. Histórico de pacotes</CardTitle>
            <CardDescription>Últimas ingestões por importado_em decrescente.</CardDescription>
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="valido">Válido</SelectItem>
              <SelectItem value="invalido">Inválido</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {carregandoPacotes ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : pacotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pacote importado ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>dossie_id</TableHead>
                  <TableHead>parte</TableHead>
                  <TableHead>status</TableHead>
                  <TableHead>importado_em</TableHead>
                  <TableHead>importado_por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacotes.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => setPacoteSelecionado(p)}
                  >
                    <TableCell className="font-mono text-xs">{p.dossie_id}</TableCell>
                    <TableCell>{p.parte}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status_validacao === 'valido'
                            ? 'default'
                            : p.status_validacao === 'invalido'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {p.status_validacao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.importado_em ? new Date(p.importado_em).toLocaleString('pt-BR') : '—'}
                    </TableCell>
                    <TableCell>{p.expand?.importado_por?.name || p.importado_por || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* painel de erros do pacote selecionado */}
      <Dialog open={!!pacoteSelecionado} onOpenChange={(o) => !o && setPacoteSelecionado(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pacote {pacoteSelecionado?.id}</DialogTitle>
            <DialogDescription>
              dossie_id {pacoteSelecionado?.dossie_id} · parte {pacoteSelecionado?.parte} · status{' '}
              {pacoteSelecionado?.status_validacao}
            </DialogDescription>
          </DialogHeader>
          {(() => {
            const erros = (() => {
              const raw = pacoteSelecionado?.erros_validacao
              if (!raw) return []
              if (Array.isArray(raw)) return raw
              try {
                return JSON.parse(raw as string) as ErroValidacao[]
              } catch {
                return []
              }
            })()
            if (!erros.length)
              return <p className="text-sm text-muted-foreground">Sem erros de validação.</p>
            return (
              <ul className="space-y-2 text-sm">
                {erros.map((err, i) => (
                  <li key={i} className="rounded border p-2">
                    <span className="font-medium text-destructive">[{err.codigo}]</span>{' '}
                    {err.mensagem}
                    {err.detalhe && (
                      <div className="text-xs text-muted-foreground">{err.detalhe}</div>
                    )}
                  </li>
                ))}
              </ul>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
