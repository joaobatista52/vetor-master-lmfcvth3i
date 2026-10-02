import { useState } from 'react'
import {
  GitCompare,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  FileSearch,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

export interface DivergenciaItem {
  numero: number
  divergencia: string
  correcao: string
  status: string
  versao: string
}

export const DIVERGENCIAS_GATE_0B: DivergenciaItem[] = [
  {
    numero: 1,
    divergencia: 'App não exibia a mensagem de abertura do Dossiê Estratégico nas etapas.',
    correcao:
      'Bloco literal ("Este documento é a base…" + "Não oferecemos teorias de gaveta…") renderizado no topo das etapas 2–12, nos 12 setores.',
    status: 'Corrigida',
    versao: 'v0.0.84/85',
  },
  {
    numero: 2,
    divergencia: 'Home trazia "Ordem Canônica Oficial" e selo "Destaque" nos 3 primeiros setores.',
    correcao:
      'Título alterado para "12 Setores Parametrizados com o Mercado"; "Destaque" eliminado da home e da Etapa 1.',
    status: 'Corrigida',
    versao: 'v0.0.84/85',
  },
  {
    numero: 3,
    divergencia: 'Cards dos setores com textos próprios do app (metas/soluções).',
    correcao:
      'Cards aberto/fechado rigorosamente iguais aos do site (01–12, nome, subsegmentos, dor, métrica, micro-epifanias).',
    status: 'Corrigida',
    versao: 'v0.0.84/85',
  },
  {
    numero: 4,
    divergencia: 'Enunciados repetiam o texto das opções dentro da pergunta.',
    correcao: 'Opções removidas dos enunciados; exibidas apenas nas caixas próprias.',
    status: 'Corrigida',
    versao: 'v0.0.84/85',
  },
  {
    numero: 5,
    divergencia: 'Underlines "_______" de diagramação impressa após as perguntas.',
    correcao: 'Eliminados; caixas de resposta (Input/Textarea) cumprem o papel.',
    status: 'Corrigida',
    versao: 'v0.0.84/85',
  },
  {
    numero: 6,
    divergencia: 'Perguntas de listagem permitiam marcar apenas uma opção.',
    correcao:
      'Conversão para seleção MÚLTIPLA (checkbox, array persistido) em segmento, fontes de receita, certificações, barreiras e processos automatizados; exclusivas (Sim/Não, Parcialmente, maturidade 1/2/3, Alto/Médio/Baixo, 9.2, 9.3) permanecem em radio.',
    status: 'Corrigida',
    versao: 'v0.0.84/85',
  },
  {
    numero: 7,
    divergencia: 'Trading 1.9 sem a complementação da política de repasse.',
    correcao:
      'Campo condicional incluído — quando "Sim", textarea literal "Em caso afirmativo, descreva a política: critérios, percentuais e forma de repasse (ex.: …)" — obrigatória antes de avançar.',
    status: 'Corrigida',
    versao: 'v0.0.84/85',
  },
  {
    numero: 8,
    divergencia: 'Trading 1.10 continha a palavra "não" (erro do PDF, já corrigido nele).',
    correcao: 'Enunciado alinhado ao PDF corrigido.',
    status: 'Corrigida',
    versao: 'v0.0.84/85',
  },
  {
    numero: 9,
    divergencia: 'Trading 1.13 sem a subpergunta condicional.',
    correcao:
      'Quando "Não": "Em caso negativo, as operações são estruturadas como Importação por Encomenda? ( ) Sim ( ) Não".',
    status: 'Corrigida',
    versao: 'v0.0.84/85',
  },
  {
    numero: 10,
    divergencia: 'Ordem das etapas finais divergia do PDF (documentação antes de Próximos Passos).',
    correcao:
      'Etapa 11 = Seção 9 — Próximos Passos (9.1–9.4); Etapa 12 = Documentação Adicional & Anexos (págs. 44–45: 3 grupos, Word/PDF/Excel, 100MB, 15 arquivos, sem bloqueio de envio, LGPD) com submissão final; rascunhos antigos migrados automaticamente.',
    status: 'Corrigida',
    versao: 'v0.0.84/85',
  },
]

export const MARKDOWN_LOG_DIVERGENCIAS = `# Log de Divergências — Paridade V7.2
**Versão do App:** v0.0.85
**Escopo:** Gate 0B + 10 ajustes de paridade
**Resultado Final:** ✅ Zero divergências em aberto (10 de 10 corrigidas)
**Status do Gate:** Pronto para validação e liberação da Onda 1

---

## Encaminhamento de Paridade — Gate 0B (10 Ajustes)

| Nº | Divergência Identificada | Correção Aplicada | Status |
|---|---|---|---|
| 01 | App não exibia a mensagem de abertura do Dossiê Estratégico nas etapas. | Bloco literal ("Este documento é a base…" + "Não oferecemos teorias de gaveta…") renderizado no topo das etapas 2–12, nos 12 setores. | ✅ Corrigida (v0.0.84/85) |
| 02 | Home trazia "Ordem Canônica Oficial" e selo "Destaque" nos 3 primeiros setores. | Título alterado para "12 Setores Parametrizados com o Mercado"; "Destaque" eliminado da home e da Etapa 1. | ✅ Corrigida (v0.0.84/85) |
| 03 | Cards dos setores com textos próprios do app (metas/soluções). | Cards aberto/fechado rigorosamente iguais aos do site (01–12, nome, subsegmentos, dor, métrica, micro-epifanias). | ✅ Corrigida (v0.0.84/85) |
| 04 | Enunciados repetiam o texto das opções dentro da pergunta. | Opções removidas dos enunciados; exibidas apenas nas caixas próprias. | ✅ Corrigida (v0.0.84/85) |
| 05 | Underlines "_______" de diagramação impressa após as perguntas. | Eliminados; caixas de resposta (Input/Textarea) cumprem o papel. | ✅ Corrigida (v0.0.84/85) |
| 06 | Perguntas de listagem permitiam marcar apenas uma opção. | Conversão para seleção MÚLTIPLA (checkbox, array persistido) em segmento, fontes de receita, certificações, barreiras e processos automatizados; exclusivas (Sim/Não, Parcialmente, maturidade 1/2/3, Alto/Médio/Baixo, 9.2, 9.3) permanecem em radio. | ✅ Corrigida (v0.0.84/85) |
| 07 | Trading 1.9 sem a complementação da política de repasse. | Campo condicional incluído — quando "Sim", textarea literal "Em caso afirmativo, descreva a política: critérios, percentuais e forma de repasse (ex.: …)" — obrigatória antes de avançar. | ✅ Corrigida (v0.0.84/85) |
| 08 | Trading 1.10 continha a palavra "não" (erro do PDF, já corrigido nele). | Enunciado alinhado ao PDF corrigido. | ✅ Corrigida (v0.0.84/85) |
| 09 | Trading 1.13 sem a subpergunta condicional. | Quando "Não": "Em caso negativo, as operações são estruturadas como Importação por Encomenda? ( ) Sim ( ) Não". | ✅ Corrigida (v0.0.84/85) |
| 10 | Ordem das etapas finais divergia do PDF (documentação antes de Próximos Passos). | Etapa 11 = Seção 9 — Próximos Passos (9.1–9.4); Etapa 12 = Documentação Adicional & Anexos (págs. 44–45: 3 grupos, Word/PDF/Excel, 100MB, 15 arquivos, sem bloqueio de envio, LGPD) com submissão final; rascunhos antigos migrados automaticamente. | ✅ Corrigida (v0.0.84/85) |

---

## Nota de Interface e Conformidade de Documentação
Regra de interface: zero ocorrências de 'obrigatório'/'opcional' sobre documentos (verificado por busca no código / grep).
Fontes: PDF 'Questionários Consolidados 12 Setores V7.2' (30set26) e site (referência visual).

---

## Parecer Solicitado
Validar a fidelidade da cópia e liberar o Gate 0B para a Onda 1.
`

export default function AdminDivergencias() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MARKDOWN_LOG_DIVERGENCIAS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error('Falha ao copiar:', err)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-[#333333]">
      {/* Top Banner Oficial da Governança Admin */}
      <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#FF9900] uppercase tracking-wider mb-1">
            <span className="bg-[#FF9900]/10 px-2 py-0.5 rounded text-[#FF9900]">
              Área Restrita do Administrador
            </span>
            <span className="text-[#808080]">•</span>
            <span className="text-[#0066CC]">Governança V7.2</span>
            <span className="text-[#808080]">•</span>
            <span className="text-[#22B14C] font-mono">v0.0.85</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC] flex items-center gap-2.5">
            <GitCompare className="w-7 h-7 text-[#0066CC]" />
            Log de Divergências — Paridade V7.2
          </h1>
          <p className="text-xs md:text-sm text-[#555555] mt-1 max-w-3xl leading-relaxed">
            Relatório oficial de encaminhamento de paridade do <strong>Gate 0B</strong> entre o app
            SaaS Vetor Master, o site em produção e o PDF canônico consolidado de 12 setores.
          </p>
        </div>

        <Button
          onClick={handleCopy}
          className="shrink-0 bg-[#0066CC] hover:bg-[#0052a3] text-white font-medium text-xs rounded-[4px] shadow-sm flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#3DDC74]" />
              Copiado em Markdown!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar como texto
            </>
          )}
        </Button>
      </div>

      {/* Cartões de Indicadores do Gate 0B */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#0066CC]/10 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#808080] uppercase tracking-wider">
                Versão do App
              </div>
              <div className="text-lg font-bold text-[#333333] font-mono">v0.0.85</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#FF9900]/10 flex items-center justify-center shrink-0">
              <FileSearch className="w-5 h-5 text-[#FF9900]" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#808080] uppercase tracking-wider">
                Escopo Homologado
              </div>
              <div className="text-sm font-bold text-[#333333]">
                Gate 0B + 10 ajustes de paridade
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#22B14C]/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#22B14C]" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#808080] uppercase tracking-wider">
                Resultado Final
              </div>
              <div className="text-sm font-bold text-[#22B14C] flex items-center gap-1">
                Zero divergências em aberto
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#0066CC]/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#808080] uppercase tracking-wider">
                Auditoria de Interface
              </div>
              <div className="text-xs font-bold text-[#333333]">0 menções obrigatório/opcional</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Principal dos 10 Itens */}
      <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
        <CardHeader className="p-5 pb-3 border-b border-[#E0E0E0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-[#333333] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF9900]" />
                Tabela de Encaminhamento — Gate 0B (10 Ajustes de Paridade)
              </CardTitle>
              <CardDescription className="text-xs text-[#666666] mt-0.5">
                Alinhamento determinístico entre o app SaaS, o site Vetor Master e o PDF canônico
                V7.2.
              </CardDescription>
            </div>
            <Badge className="bg-[#22B14C] text-white text-xs px-2.5 py-1 font-semibold rounded-[2px] self-start sm:self-auto">
              10/10 Corrigidas (100%)
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#EAEAEA]">
                <TableRow className="border-b border-[#E0E0E0]">
                  <TableHead className="w-[60px] text-center font-bold text-[#333333] text-xs">
                    Nº
                  </TableHead>
                  <TableHead className="w-[38%] font-bold text-[#333333] text-xs">
                    Divergência Identificada
                  </TableHead>
                  <TableHead className="w-[47%] font-bold text-[#333333] text-xs">
                    Correção Aplicada
                  </TableHead>
                  <TableHead className="w-[15%] text-right font-bold text-[#333333] text-xs pr-6">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DIVERGENCIAS_GATE_0B.map((item) => (
                  <TableRow
                    key={item.numero}
                    className="border-b border-[#E0E0E0] hover:bg-white/60 transition-colors"
                  >
                    <TableCell className="text-center font-mono font-bold text-xs text-[#0066CC] align-top py-3.5">
                      {item.numero.toString().padStart(2, '0')}
                    </TableCell>
                    <TableCell className="text-xs text-[#222222] align-top py-3.5 leading-relaxed font-medium">
                      {item.divergencia}
                    </TableCell>
                    <TableCell className="text-xs text-[#444444] align-top py-3.5 leading-relaxed">
                      {item.correcao}
                    </TableCell>
                    <TableCell className="text-right align-top py-3.5 pr-6">
                      <div className="inline-flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22B14C] bg-[#22B14C]/10 px-2 py-0.5 rounded-[2px] whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#22B14C]" />
                          {item.status}
                        </span>
                        <span className="text-[10px] text-[#808080] font-mono">{item.versao}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Regra de Interface & Parecer Solicitado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[#F5F5F5] border-[#E0E0E0] rounded-[4px] shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-[#333333] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#0066CC]" />
              Regra de Interface e Fontes Oficiais
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2.5 text-xs text-[#444444] leading-relaxed">
            <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-3">
              <p className="font-medium text-[#222222]">
                <strong>Regra de interface:</strong> zero ocorrências de "obrigatório"/"opcional"
                sobre documentos (verificado por busca no código / grep).
              </p>
            </div>
            <p className="text-[11px] text-[#666666]">
              <strong>Fontes:</strong> PDF "Questionários Consolidados 12 Setores V7.2" (30set26) e
              site oficial (referência visual).
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#22B14C]/5 border border-[#22B14C]/30 rounded-[4px] shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-[#1e7e34] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22B14C]" />
              Parecer Solicitado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <p className="text-xs text-[#1e7e34] font-medium leading-relaxed">
              Validar a fidelidade da cópia e liberar o Gate 0B para a Onda 1.
            </p>
            <div className="pt-2 border-t border-[#22B14C]/20 flex flex-wrap items-center justify-between text-[11px] text-[#666666]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#808080]" />
                Registrado para governança permanente
              </span>
              <span className="font-mono text-[#0066CC] font-semibold">
                Área do Admin • Vetor Master
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rodapé do Documento */}
      <div className="bg-[#EAEAEA] border border-[#D0D0D0] rounded-[4px] p-4 text-xs text-[#555555] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22B14C] shrink-0" />
          <span>
            Documento de Paridade V7.2 permanente registrado no app. Gate 0B concluído sem resíduos.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="text-xs border-[#C0C0C0] bg-white text-[#333333] hover:bg-[#F5F5F5] rounded-[4px] shrink-0 flex items-center gap-1.5"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[#22B14C]" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? 'Copiado!' : 'Copiar como texto'}
        </Button>
      </div>
    </div>
  )
}
