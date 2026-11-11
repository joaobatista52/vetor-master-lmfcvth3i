import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
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
  nome_completo: string
  razao_social: string
  cnpj: string
  dossie_id: string
  nivel: string
}

interface ErroValidacao {
  codigo: string
  mensagem: string
  /** E2-F: nome REAL do campo V2.0 validado pela regra (não o normalizado) */
  componente_validado?: string
  /** E2-F: bloqueante = impede a ingestão; informativa = apenas reporta */
  status_regra?: 'bloqueante' | 'informativa'
  detalhe?: unknown
}

interface BlocoValidacao {
  bloco: string
  status: 'ok' | 'erro'
  resumo?: string
  erros?: ErroValidacao[]
  avisos?: ErroValidacao[]
}

interface ResultadoValidacao {
  valido: boolean
  parte: string
  parte_detectada?: string
  metodo_deteccao?: string
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

interface ErroHttp {
  status?: number
  message?: string
  response?: unknown
}

/** E2-E Bloco 3 — payload do 415 com diagnóstico completo */
interface Diagnostico415 {
  codigo?: string
  mensagem?: string
  chaves_encontradas?: string[]
  campo_parte?: string | null
  conteudo_fases?: string | null
  projetos_e_planos?: string | null
  artefatos_financeiros?: string | null
}

/** Rótulo do método de detecção para o badge 4.2 */
const LABEL_METODO_DETECCAO: Record<string, string> = {
  campo_parte: 'via campo_parte',
  blocos_conteudo: 'via blocos_conteudo',
  chaves_auxiliares: 'via chaves_auxiliares',
}

/** Formata o detalhe de auditoria (encontrado vs esperado) de uma regra */
function formatarDetalhe(detalhe: unknown): string {
  if (detalhe === undefined || detalhe === null) return ''
  if (typeof detalhe === 'string') return detalhe
  if (typeof detalhe === 'object' && !Array.isArray(detalhe)) {
    const d = detalhe as Record<string, unknown>
    const partes: string[] = []
    if ('encontrado' in d) partes.push(`encontrado: ${String(d.encontrado)}`)
    if ('esperado' in d) partes.push(`esperado: ${String(d.esperado)}`)
    if ('ignorado' in d) partes.push(`ignorados: ${String(d.ignorados)}`)
    const resto = Object.keys(d).filter(
      (k) => k !== 'encontrado' && k !== 'esperado' && k !== 'ignorados',
    )
    for (const k of resto) partes.push(`${k}: ${String(d[k])}`)
    return partes.join(' · ')
  }
  return String(detalhe)
}

/**
 * Extrai o código + mensagem reais do backend (PACOTE_V2_*).
 * Se a resposta não vier como JSON válido, devolve
 * "Erro inesperado (HTTP <status>)" — nunca o genérico cru.
 */
function extrairErroBackend(err: unknown): string {
  const e = err as ErroHttp
  const status = e?.status ?? 0
  const body = e?.response
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const b = body as {
      codigo?: string
      mensagem?: string
      message?: string
      erros?: ErroValidacao[]
    }
    if (Array.isArray(b.erros) && b.erros.length > 0) {
      return b.erros
        .map((r) => {
          const det = formatarDetalhe(r.detalhe)
          return `[${r.codigo}] ${r.mensagem}${det ? ` (${det})` : ''}`
        })
        .join('\n')
    }
    if (b.codigo && b.mensagem) return `[${b.codigo}] ${b.mensagem}`
    if (b.mensagem) return b.mensagem
    if (b.message) return b.message
  }
  return `Erro inesperado (HTTP ${status})`
}

export default function AdminIngestao() {
  // ---- contexto (1.1) ----
  const [leads, setLeads] = useState<LeadOpcao[]>([])
  const [leadSelecionado, setLeadSelecionado] = useState<string>('')
  const [dossieId, setDossieId] = useState<string>('')
  const [carregandoLeads, setCarregandoLeads] = useState(true)
  const [erroLeads, setErroLeads] = useState<string | null>(null)

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
  // E2-E — 415 com diagnóstico completo (chaves_encontradas etc.)
  const [diagnostico415, setDiagnostico415] = useState<Diagnostico415 | null>(null)

  // ---- histórico (1.5) ----
  const [pacotes, setPacotes] = useState<PacoteV2Item[]>([])
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [carregandoPacotes, setCarregandoPacotes] = useState(false)
  const [pacoteSelecionado, setPacoteSelecionado] = useState<PacoteV2Item | null>(null)

  const leadAtual = useMemo(
    () => leads.find((l) => l.id === leadSelecionado) || null,
    [leads, leadSelecionado],
  )

  // Carrega TODOS os leads (dropdown) — dossie_id não existe no schema de leads
  // e é opcional na tela (pré-preenchido apenas quando o lead tiver dossiê).
  useEffect(() => {
    let ativo = true
    setCarregandoLeads(true)
    setErroLeads(null)
    pb.collection('leads')
      .getFullList({
        sort: '-created',
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
      .catch((err: unknown) => {
        // Diagnóstico em console (3.2): nunca engolir o erro em silêncio.
        const e = err as { status?: number; message?: string; response?: { message?: string } }
        const status = e?.status ?? 0
        const mensagem = e?.response?.message || e?.message || 'erro desconhecido'
        console.error(
          `[AdminIngestao] Falha ao carregar leads (status ${status}): ${mensagem}`,
          err,
        )
        if (ativo) {
          setErroLeads(`Erro ao carregar leads — ${mensagem}`)
          toast.error('Falha ao carregar leads')
        }
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
        toast.error('Falha ao carregar histórico')
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
        toast.success('Conteúdo colado da área de transferência')
      }
    } catch {
      toast.error('Não foi possível ler a área de transferência — cole manualmente com Ctrl+V.')
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
    setDiagnostico415(null)
    try {
      const res = await pb.send('/backend/v1/pacote-v2/validar', {
        method: 'POST',
        body: { texto, lead_id: leadSelecionado || undefined },
      })
      setValidacao(res as unknown as ResultadoValidacao)
      setDiagnostico415(null)
      if (!(res as unknown as ResultadoValidacao).valido) {
        toast.error('Pacote com erros de validação')
      }
    } catch (err: unknown) {
      const e = err as ErroHttp
      if (e?.status === 401 || e?.status === 403) {
        setErroValidar('Sem permissão: apenas admin e consultor podem validar pacotes.')
      } else {
        setErroValidar(extrairErroBackend(err))
        // E2-E Bloco 3 — 415 traz diagnóstico completo (chaves + status dos blocos)
        const body = e?.response as Record<string, unknown> | undefined
        setDiagnostico415(
          e?.status === 415 && body && typeof body === 'object' ? (body as Diagnostico415) : null,
        )
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
        toast.error(`Pacote importado com divergências: ${divergencias.join(' · ')}`)
      } else {
        toast.success('Pacote importado com sucesso!')
      }
      setTexto('')
      setJsonExtraido(false)
      setValidacao(null)
      carregarHistorico()
    } catch (err: unknown) {
      const e = err as ErroHttp
      if (e?.status === 401 || e?.status === 403) {
        setErroImportar('Sem permissão: apenas admin e consultor podem importar pacotes.')
      } else {
        setErroImportar(extrairErroBackend(err))
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
                  {carregandoLeads ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Carregando leads…
                    </div>
                  ) : erroLeads ? (
                    <div className="px-2 py-1.5 text-sm text-destructive">{erroLeads}</div>
                  ) : leads.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Nenhum lead encontrado
                    </div>
                  ) : (
                    leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.nome} · {l.razao_social || 's/ razão social'} · {l.cnpj || 's/ CNPJ'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {erroLeads && (
                <p className="text-xs text-destructive" role="alert">
                  {erroLeads}
                </p>
              )}
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

          {/* 4.1 + 4.3 — Diagnóstico completo do 415 (chaves e status dos blocos) */}
          {diagnostico415 && (
            <div
              className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm"
              role="alert"
            >
              <div className="font-medium text-destructive">
                [PACOTE_V2_PARTE_INDETERMINADA_415]{' '}
                {diagnostico415.mensagem || 'Não foi possível determinar a parte do pacote'}
              </div>
              <div className="mt-2 text-xs space-y-1">
                <div>
                  <span className="font-medium">Chaves no JSON: </span>
                  {diagnostico415.chaves_encontradas?.length
                    ? diagnostico415.chaves_encontradas.join(', ')
                    : 'nenhuma'}
                </div>
                <div>
                  <span className="font-medium">Campo "parte": </span>
                  {diagnostico415.campo_parte ?? 'null'}
                </div>
                <div>
                  <span className="font-medium">conteudo_fases: </span>
                  {diagnostico415.conteudo_fases ?? 'ausente'}
                  <span className="mx-2 font-medium">·</span>
                  <span className="font-medium">projetos_e_planos: </span>
                  {diagnostico415.projetos_e_planos ?? 'ausente'}
                  <span className="mx-2 font-medium">·</span>
                  <span className="font-medium">artefatos_financeiros: </span>
                  {diagnostico415.artefatos_financeiros ?? 'ausente'}
                </div>
              </div>
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
                {/* 4.2 — Parte detectada + método de detecção */}
                {validacao.parte_detectada && (
                  <Badge variant="secondary">
                    {`Parte detectada: ${validacao.parte_detectada}${
                      validacao.metodo_deteccao
                        ? ` (${LABEL_METODO_DETECCAO[validacao.metodo_deteccao] || validacao.metodo_deteccao})`
                        : ''
                    }`}
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                {validacao.blocos?.map((b) => (
                  <div key={b.bloco} className="space-y-1">
                    <div className="flex items-start gap-2 text-sm">
                      <span>{b.status === 'ok' ? '✅' : '❌'}</span>
                      <span className="font-medium">{b.bloco}</span>
                      {b.resumo && <span className="text-muted-foreground">— {b.resumo}</span>}
                    </div>
                    {b.erros?.map((err, idx) => {
                      const det = formatarDetalhe(err.detalhe)
                      return (
                        <div
                          key={err.codigo + '-' + idx}
                          className="ml-6 rounded border border-destructive/40 bg-destructive/5 p-2 text-xs"
                        >
                          <span className="font-medium text-destructive">[{err.codigo}]</span>{' '}
                          {err.mensagem}
                          {(err.componente_validado || err.status_regra) && (
                            <div className="text-muted-foreground">
                              Componente validado: {err.componente_validado || '—'}
                              {err.status_regra ? ` · regra ${err.status_regra}` : ''}
                            </div>
                          )}
                          {det && <div className="text-muted-foreground">{det}</div>}
                        </div>
                      )
                    })}
                    {b.avisos?.map((av, idx) => {
                      const det = formatarDetalhe(av.detalhe)
                      return (
                        <div
                          key={av.codigo + '-' + idx}
                          className="ml-6 rounded border border-yellow-500/40 bg-yellow-50 p-2 text-xs text-yellow-800"
                        >
                          <span className="font-medium">⚠ [{av.codigo}]</span> {av.mensagem}
                          {(av.componente_validado || av.status_regra) && (
                            <div className="text-yellow-700">
                              Componente validado: {av.componente_validado || '—'}
                              {av.status_regra ? ` · regra ${av.status_regra}` : ''}
                            </div>
                          )}
                          {det && <div className="text-yellow-700">{det}</div>}
                        </div>
                      )
                    })}
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
                      <div className="text-xs text-muted-foreground">
                        {formatarDetalhe(err.detalhe)}
                      </div>
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
