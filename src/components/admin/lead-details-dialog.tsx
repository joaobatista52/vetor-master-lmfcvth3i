import React, { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import {
  Building2,
  Mail,
  Phone,
  User,
  Layers,
  FileCheck2,
  Sparkles,
  Download,
  FileSpreadsheet,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  ListOrdered,
  Loader2,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import type { LeadRecord } from '@/services/site-leads-sync'
import { getLeadById } from '@/services/site-leads-sync'

interface LeadDetailsDialogProps {
  lead: LeadRecord | null
  leadId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Prefixos de setores canônicos utilizados nos questionários do site institucional
const SETOR_PREFIXES = [
  'saude',
  'varejo',
  'servicos',
  'trade',
  'trading',
  'facilities',
  'industria',
  'tecnologia',
  'construcao',
  'transporte',
  'educacao',
  'agronegocio',
  'academias',
]

/**
 * Identifica a qual etapa (1 a 11) uma chave do campo `respostas` pertence.
 * Retorna o número da etapa (1..11) ou null se for não-padronizada / Outras Respostas.
 */
function classificarChaveEtapa(chave: string): number | null {
  const k = chave.trim().toLowerCase()

  // 1. Padrão Setor + Seção + Pergunta (ex: saude_1_1, varejo_1_2, trade_1_1, servicos_2_3, etc.)
  for (const prefix of SETOR_PREFIXES) {
    if (k.startsWith(`${prefix}_`)) {
      const rest = k.slice(prefix.length + 1) // ex: "1_1", "2_3", "cap1", "anosoperacao"
      const match = rest.match(/^(\d+)_(\d+)$/)
      if (match) {
        const secaoNum = parseInt(match[1], 10)
        // No questionário canônico:
        // Seção 1 (Perfil) -> Etapa 3
        // Seção 2 (Pilar 1) -> Etapa 4
        // Seção 3 (Pilar 2) -> Etapa 5
        // Seção 4 (Pilar 3) -> Etapa 6
        // Seção 5 (Hackman) -> Etapa 7
        // Seção 6 (Buffett) -> Etapa 8
        // Seção 7 (Expectativas) -> Etapa 9
        // Seção 8 (Inovação) -> Etapa 10
        // Seção 9 (Próximos Passos) -> Etapa 11
        if (secaoNum >= 1 && secaoNum <= 9) {
          return secaoNum + 2
        }
      }
      // Outros sufixos setoriais conhecidos
      if (
        rest.startsWith('cap') ||
        rest.includes('anosoperacao') ||
        rest.includes('colaboradores') ||
        rest.includes('unidades')
      ) {
        return 3 // Perfil da empresa
      }
      if (
        rest.includes('cargo') ||
        rest.includes('cnpj') ||
        rest.includes('empresa') ||
        rest.includes('contato')
      ) {
        return 2 // Identificação
      }
      if (rest.includes('hackman')) return 7
      if (rest.includes('buffett')) return 8
      if (rest.includes('expectativa')) return 9
      if (rest.includes('inovacao') || rest.includes('tecnologia')) return 10
      if (rest.includes('proximos') || rest.includes('passos')) return 11
    }
  }

  // 2. Chaves com prefixo secaoX (ex: secao1_1, secao2_1) ou pilarX
  const secaoMatch = k.match(/^(?:secao|seção)[_-]?(\d+)/)
  if (secaoMatch) {
    const sNum = parseInt(secaoMatch[1], 10)
    if (sNum >= 1 && sNum <= 9) return sNum + 2
  }

  const pilarMatch = k.match(/^(?:pilar)[_-]?(\d+)/)
  if (pilarMatch) {
    const pNum = parseInt(pilarMatch[1], 10)
    if (pNum === 1) return 4
    if (pNum === 2) return 5
    if (pNum === 3) return 6
  }

  // 3. Etapa direta (ex: etapa_1, etapa1, etapa_3)
  const etapaMatch = k.match(/^(?:etapa)[_-]?(\d+)/)
  if (etapaMatch) {
    const eNum = parseInt(etapaMatch[1], 10)
    if (eNum >= 1 && eNum <= 11) return eNum
  }

  // 4. Mapeamento semântico de campos específicos do lead / formulário
  if (
    ['setor', 'segmento', 'setor_id', 'segmento_outro', 'modalidade_trading', 'ramo'].some(
      (w) => k === w || k.startsWith(`${w}_`),
    )
  ) {
    return 1
  }

  if (
    [
      'razao_social',
      'cnpj',
      'data',
      'respondente',
      'cargo',
      'email',
      'whatsapp',
      'telefone',
      'cadastro',
      'nomecompleto',
      'nome_completo',
      'empresa',
    ].some((w) => k === w || k.startsWith(`${w}_`))
  ) {
    return 2
  }

  if (
    [
      'perfil',
      'faturamento',
      'faturamento_anual',
      'faturamento_mensal',
      'colaboradores',
      'unidades',
      'anosoperacao',
      'anos_operacao',
      'regime_tributario',
      'estrutura_propriedade',
    ].some((w) => k === w || k.startsWith(`${w}_`))
  ) {
    return 3
  }

  if (
    k.includes('prisao') ||
    k.includes('fundador') ||
    k.includes('centralizacao') ||
    k.startsWith('cap1') ||
    k.startsWith('cap2')
  ) {
    return 4
  }

  if (
    k.includes('ineficiencia') ||
    k.includes('retrabalho') ||
    k.includes('gargalo') ||
    k.startsWith('cap3') ||
    k.startsWith('cap4')
  ) {
    return 5
  }

  if (
    k.includes('abismo') ||
    k.includes('estrategia') ||
    k.includes('execucao') ||
    k.startsWith('cap5') ||
    k.startsWith('cap6')
  ) {
    return 6
  }

  if (k.includes('hackman') || k.includes('equipe') || k.includes('lideranca')) {
    return 7
  }

  if (
    k.includes('buffett') ||
    k.includes('ebitda') ||
    k.includes('endividamento') ||
    k.includes('inadimplencia')
  ) {
    return 8
  }

  if (k.includes('expectativa') || k.includes('ambicao') || k.includes('horizonte')) {
    return 9
  }

  if (k.includes('inovacao') || k.includes('tecnologia') || k.includes('maturidade_digital')) {
    return 10
  }

  if (
    [
      'proximos_passos',
      'autorizacao_devolutiva',
      'formato_interesse',
      'plano_interesse',
      'plano_escolhido',
      'responsavel_documentos',
      'responsavel_envio',
    ].some((w) => k === w || k.startsWith(`${w}_`))
  ) {
    return 11
  }

  // Não classificado -> Seção "Outras Respostas"
  return null
}

// Definição canônica das 11 etapas do questionário estratégico
const ETAPAS_QUESTIONARIO_CONFIG = [
  {
    numero: 1,
    titulo: 'Etapa 1 — Setor de Atuação',
    descricao: 'Setor canônico e enquadramento mercadológico da organização',
    chaves: ['setor', 'segmento', 'setor_id', 'segmento_outro', 'modalidade_trading', 'etapa_1'],
  },
  {
    numero: 2,
    titulo: 'Etapa 2 — Identificação da Empresa & Lead',
    descricao: 'Dados cadastrais do executivo, da pessoa jurídica e contatos',
    chaves: [
      'razao_social',
      'cnpj',
      'data',
      'respondente',
      'cargo',
      'email',
      'whatsapp',
      'telefone',
      'etapa_2',
      'cadastro',
      'nomecompleto',
    ],
  },
  {
    numero: 3,
    titulo: 'Etapa 3 — Seção 1: Perfil da Empresa e Contexto',
    descricao:
      'Mapeamento estrutural de faturamento, equipe e modelo de negócio (perguntas 1.1 a 1.8)',
    chaves: ['secao1', 'perfil', 'etapa_3'],
  },
  {
    numero: 4,
    titulo: 'Etapa 4 — Seção 2: Pilar 1: Prisão do Fundador',
    descricao:
      'Centralização decisória, dependência de pessoas-chave e autonomia (perguntas 2.1 a 2.6)',
    chaves: ['secao2', 'pilar1', 'pilar_1', 'pilar_1_prisao_fundador', 'etapa_4'],
  },
  {
    numero: 5,
    titulo: 'Etapa 5 — Seção 3: Pilar 2: Ineficiência Invisível',
    descricao: 'Gargalos operacionais, retrabalho e vazamento de margem (perguntas 3.1 a 3.6)',
    chaves: ['secao3', 'pilar2', 'pilar_2', 'pilar_2_ineficiencia_invisivel', 'etapa_5'],
  },
  {
    numero: 6,
    titulo: 'Etapa 6 — Seção 4: Pilar 3: Abismo Estratégia vs. Execução',
    descricao: 'Alinhamento tático, governança, metas e desdobramento (perguntas 4.1 a 4.6)',
    chaves: ['secao4', 'pilar3', 'pilar_3', 'pilar_3_abismo_estrategia_execucao', 'etapa_6'],
  },
  {
    numero: 7,
    titulo: 'Etapa 7 — Seção 5: Capacidade e Design Organizacional (Hackman)',
    descricao: 'As 5 condições determinísticas para eficácia de equipes (perguntas 5.1 a 5.6)',
    chaves: ['secao5', 'hackman', 'etapa_7'],
  },
  {
    numero: 8,
    titulo: 'Etapa 8 — Seção 6: Saúde Econômico-Financeira (Buffett)',
    descricao:
      'Solidez de caixa, margens, endividamento e governança contábil (perguntas 6.1 a 6.6)',
    chaves: ['secao6', 'buffett', 'etapa_8'],
  },
  {
    numero: 9,
    titulo: 'Etapa 9 — Seção 7: Expectativas e Ambição',
    descricao: 'Objetivos prioritários de crescimento e consolidação (perguntas 7.1 a 7.5)',
    chaves: ['secao7', 'expectativas', 'etapa_9'],
  },
  {
    numero: 10,
    titulo: 'Etapa 10 — Seção 8: Inovação e Tecnologia',
    descricao: 'Maturidade digital, automações e barreiras tecnológicas (perguntas 8.1 a 8.4)',
    chaves: ['secao8', 'inovacao', 'tecnologia', 'etapa_10'],
  },
  {
    numero: 11,
    titulo: 'Etapa 11 — Seção 9: Próximos Passos',
    descricao:
      'Autorização da sessão devolutiva executiva de 45 min e formato de interesse (9.1 a 9.4)',
    chaves: [
      'secao9',
      'proximos_passos',
      'autorizacao_devolutiva',
      'formato_interesse',
      'plano_interesse',
      'plano_escolhido',
      'responsavel_documentos',
      'responsavel_envio',
      'etapa_11',
    ],
  },
]

function extrairListaArquivos(valor: string[] | string | undefined | null): string[] {
  if (!valor) return []
  if (Array.isArray(valor)) return valor.filter((f) => typeof f === 'string' && f.trim() !== '')
  if (typeof valor === 'string' && valor.trim() !== '') {
    if (valor.startsWith('[') && valor.endsWith(']')) {
      try {
        const parsed = JSON.parse(valor)
        if (Array.isArray(parsed))
          return parsed.filter((f) => typeof f === 'string' && f.trim() !== '')
      } catch {
        /* intentionally ignored */
      }
    }
    return [valor]
  }
  return []
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet className="w-4 h-4 text-[#3DDC74] shrink-0" />
  }
  if (['doc', 'docx'].includes(ext)) {
    return <FileText className="w-4 h-4 text-[#5B9DFF] shrink-0" />
  }
  if (ext === 'pdf') {
    return <FileCheck2 className="w-4 h-4 text-[#EF4444] shrink-0" />
  }
  return <Paperclip className="w-4 h-4 text-[#FFB84D] shrink-0" />
}

export function LeadDetailsDialog({
  lead: initialLead,
  leadId,
  open,
  onOpenChange,
}: LeadDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<
    'geral' | 'questionario' | 'anexos' | 'pilares' | 'bruto'
  >('geral')
  const [currentLead, setCurrentLead] = useState<LeadRecord | null>(initialLead)
  const [loadingFresh, setLoadingFresh] = useState<boolean>(false)

  // Sempre que o modal abre ou o lead/leadId muda, buscar o registro fresco do banco por ID
  useEffect(() => {
    const targetId = leadId || initialLead?.id
    if (open && targetId) {
      let isMounted = true
      setLoadingFresh(true)
      getLeadById(targetId)
        .then((fresh) => {
          if (isMounted) {
            if (fresh) {
              setCurrentLead(fresh)
            } else if (initialLead) {
              setCurrentLead(initialLead)
            }
          }
        })
        .catch((err) => {
          console.error('Erro ao buscar lead fresco:', err)
          if (isMounted && initialLead) {
            setCurrentLead(initialLead)
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoadingFresh(false)
          }
        })

      return () => {
        isMounted = false
      }
    } else if (!open) {
      setCurrentLead(initialLead)
    }
  }, [open, leadId, initialLead])

  const lead = currentLead || initialLead

  if (!lead && !open) return null
  if (!lead) return null

  const dadosCompletos = lead.dados_completos || {}
  const pilares = dadosCompletos.pilares || {}
  const perfil = dadosCompletos.perfil || {}
  const doc = dadosCompletos.documentacao || {}
  const respostasObj = (lead.respostas || dadosCompletos.respostas || {}) as Record<string, any>

  // Anexos re-hospedados no PocketBase do app
  const arquivosFinanceiros = extrairListaArquivos(lead.documentacao_adicional)
  const arquivosGerenciais = extrairListaArquivos(lead.certificacoes)
  const arquivosSociedade = extrairListaArquivos(lead.contrato_social)
  const totalAnexos =
    arquivosFinanceiros.length + arquivosGerenciais.length + arquivosSociedade.length

  const getDownloadUrl = (_campo: string, fileName: string) => {
    try {
      const url = pb.files.getUrl(lead as any, fileName)
      const token = pb.authStore.token
      if (token && !url.includes('token=')) {
        return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
      }
      return url
    } catch (_) {
      const base = `/api/files/leads/${lead.id}/${fileName}`
      const token = pb.authStore.token
      return token ? `${base}?token=${encodeURIComponent(token)}` : base
    }
  }
  // Mapa de todas as chaves de respostas classificadas por etapa (1..11)
  // e as chaves não padronizadas ("Outras Respostas")
  const respostasPorEtapa: Record<number, { chave: string; resposta: any; nota?: string }[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    10: [],
    11: [],
  }
  const outrasRespostas: { chave: string; resposta: any }[] = []

  // Preencher a partir de `respostasObj` (fonte primária do questionário gravado no banco)
  Object.keys(respostasObj).forEach((k) => {
    const val = respostasObj[k]
    const etapaAlvo = classificarChaveEtapa(k)

    if (etapaAlvo !== null && etapaAlvo >= 1 && etapaAlvo <= 11) {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        Object.keys(val).forEach((subK) => {
          respostasPorEtapa[etapaAlvo].push({
            chave: `${k} - ${subK}`,
            resposta: val[subK],
          })
        })
      } else {
        respostasPorEtapa[etapaAlvo].push({
          chave: k,
          resposta: val,
        })
      }
    } else {
      // Chave não padronizada -> Outras respostas
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        Object.keys(val).forEach((subK) => {
          outrasRespostas.push({
            chave: `${k} - ${subK}`,
            resposta: val[subK],
          })
        })
      } else {
        outrasRespostas.push({
          chave: k,
          resposta: val,
        })
      }
    }
  })

  // Agrupamento de respostas por etapa 1 a 11 com fallbacks contextuais
  const extrairRespostasEtapa = (etapaNum: number) => {
    const itens = [...(respostasPorEtapa[etapaNum] || [])]

    // Fallbacks dos dados estruturados da base para complementar campos em branco
    if (etapaNum === 1) {
      if (!itens.some((i) => i.chave.toLowerCase().includes('setor'))) {
        itens.push({ chave: 'Setor de Atuação', resposta: lead.setor || '—' })
      }
      if (!itens.some((i) => i.chave.toLowerCase().includes('segmento'))) {
        itens.push({ chave: 'Segmento Específico', resposta: lead.segmento || '—' })
      }
    } else if (etapaNum === 2) {
      if (itens.length === 0) {
        itens.push({ chave: 'Razão Social', resposta: lead.razao_social || '—' })
        itens.push({ chave: 'CNPJ', resposta: lead.cnpj || '—' })
        itens.push({ chave: 'Respondente', resposta: lead.nome_completo || '—' })
        itens.push({ chave: 'Cargo / Função', resposta: lead.cargo || '—' })
        itens.push({ chave: 'E-mail Corporativo', resposta: lead.email || '—' })
        itens.push({ chave: 'WhatsApp / Telefone', resposta: lead.whatsapp || '—' })
      }
    } else if (etapaNum === 3) {
      if (itens.length === 0 && perfil.respostas && Array.isArray(perfil.respostas)) {
        perfil.respostas.forEach((r: any, idx: number) => {
          itens.push({
            chave: r.enunciado || `Pergunta 1.${idx + 1}`,
            resposta: r.resposta,
          })
        })
      }
      if (
        perfil.faturamento_anual &&
        !itens.some((i) => i.chave.toLowerCase().includes('faturamento'))
      ) {
        itens.push({ chave: 'Faturamento Anual', resposta: perfil.faturamento_anual })
      }
      if (
        perfil.colaboradores &&
        !itens.some((i) => i.chave.toLowerCase().includes('colaborador'))
      ) {
        itens.push({ chave: 'Número de Colaboradores', resposta: perfil.colaboradores })
      }
    } else if (etapaNum === 4) {
      if (
        itens.length === 0 &&
        pilares.pilar_1_prisao_fundador &&
        Array.isArray(pilares.pilar_1_prisao_fundador)
      ) {
        pilares.pilar_1_prisao_fundador.forEach((p: any, idx: number) => {
          itens.push({
            chave: p.pergunta || p.item || `Pergunta 2.${idx + 1}`,
            resposta: p.resposta || p.valor,
            nota: p.nota,
          })
        })
      }
    } else if (etapaNum === 5) {
      if (
        itens.length === 0 &&
        pilares.pilar_2_ineficiencia_invisivel &&
        Array.isArray(pilares.pilar_2_ineficiencia_invisivel)
      ) {
        pilares.pilar_2_ineficiencia_invisivel.forEach((p: any, idx: number) => {
          itens.push({
            chave: p.pergunta || p.item || `Pergunta 3.${idx + 1}`,
            resposta: p.resposta || p.valor,
            nota: p.nota,
          })
        })
      }
    } else if (etapaNum === 6) {
      if (
        itens.length === 0 &&
        pilares.pilar_3_abismo_estrategia_execucao &&
        Array.isArray(pilares.pilar_3_abismo_estrategia_execucao)
      ) {
        pilares.pilar_3_abismo_estrategia_execucao.forEach((p: any, idx: number) => {
          itens.push({
            chave: p.pergunta || p.item || `Pergunta 4.${idx + 1}`,
            resposta: p.resposta || p.valor,
            nota: p.nota,
          })
        })
      }
    } else if (etapaNum === 7) {
      if (itens.length === 0 && dadosCompletos.hackman && Array.isArray(dadosCompletos.hackman)) {
        dadosCompletos.hackman.forEach((h: any, idx: number) => {
          itens.push({
            chave: h.dimensao || h.pergunta || `Hackman ${idx + 1}`,
            resposta: h.nota !== undefined ? `Nota ${h.nota}` : h.resposta,
          })
        })
      }
    } else if (etapaNum === 8) {
      if (itens.length === 0 && dadosCompletos.buffett && Array.isArray(dadosCompletos.buffett)) {
        dadosCompletos.buffett.forEach((b: any, idx: number) => {
          itens.push({
            chave: b.dimensao || b.pergunta || `Buffett ${idx + 1}`,
            resposta: b.nota !== undefined ? `Nota ${b.nota}` : b.resposta,
          })
        })
      }
    } else if (etapaNum === 9) {
      if (
        itens.length === 0 &&
        dadosCompletos.expectativas &&
        Array.isArray(dadosCompletos.expectativas)
      ) {
        dadosCompletos.expectativas.forEach((e: any, idx: number) => {
          itens.push({
            chave: e.enunciado || e.pergunta || `Expectativa ${idx + 1}`,
            resposta: e.resposta,
          })
        })
      }
    } else if (etapaNum === 10) {
      if (itens.length === 0 && dadosCompletos.inovacao && Array.isArray(dadosCompletos.inovacao)) {
        dadosCompletos.inovacao.forEach((i: any, idx: number) => {
          itens.push({
            chave: i.enunciado || i.pergunta || `Inovação ${idx + 1}`,
            resposta: i.resposta,
          })
        })
      }
    } else if (etapaNum === 11) {
      if (itens.length === 0) {
        itens.push({
          chave: '9.1 Devolutiva Estratégica Determinística',
          resposta: 'Diagnóstico Executivo com SLA de 72h garantido',
        })
        itens.push({
          chave: '9.2 Autorização Sessão de 45 Minutos',
          resposta: lead.autorizacao_devolutiva || 'Sim',
        })
        itens.push({
          chave: '9.3 Formato de Interesse',
          resposta: lead.formato_interesse || lead.plano_interesse || 'Não informado',
        })
        itens.push({
          chave: '9.4 Responsável pelos Documentos',
          resposta: lead.responsavel_envio || doc.responsavel_envio || lead.nome_completo || '—',
        })
      }
    }

    // Ordenar itens por chave alfabética/numérica para manter a leitura limpa (ex: saude_1_1 antes de saude_1_2)
    itens.sort((a, b) =>
      a.chave.localeCompare(b.chave, undefined, { numeric: true, sensitivity: 'base' }),
    )

    return itens
  }

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
                {(lead.status || '').toLowerCase() === 'teste' ? (
                  <Badge
                    variant="outline"
                    className="border-slate-500/60 text-slate-300 bg-slate-700/40 text-xs font-semibold gap-1"
                  >
                    <span>Teste</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className={
                      (lead.status || '').toLowerCase() === 'novo'
                        ? 'border-[#3DDC74]/50 text-[#3DDC74] bg-[#3DDC74]/10 text-xs'
                        : 'border-[#8B98B4] text-[#C7D0E0] text-xs'
                    }
                  >
                    {lead.status}
                  </Badge>
                )}
                {lead.origem && (
                  <Badge className="bg-[#FF9900]/20 text-[#FFB84D] border border-[#FF9900]/40 text-xs">
                    {lead.origem}
                  </Badge>
                )}
                {totalAnexos > 0 && (
                  <Badge className="bg-[#3DDC74]/15 text-[#3DDC74] border border-[#3DDC74]/40 text-xs flex items-center gap-1">
                    <Paperclip className="w-3 h-3" /> {totalAnexos} anexo(s)
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <DialogTitle className="text-xl font-bold text-[#F8FAFC]">
                  {lead.razao_social || lead.nome_completo || 'Lead do Site Institucional'}
                </DialogTitle>
                {loadingFresh && <Loader2 className="w-4 h-4 text-[#5B9DFF] animate-spin" />}
              </div>
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
            <TabsList className="bg-[#16213A] border border-[#24334F] text-[#8B98B4] mb-4 flex-wrap h-auto p-1 gap-1">
              <TabsTrigger
                value="geral"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs"
              >
                Visão Geral & Contato
              </TabsTrigger>
              <TabsTrigger
                value="questionario"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs flex items-center gap-1.5"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Questionário Completo (1–11)</span>
              </TabsTrigger>
              <TabsTrigger
                value="anexos"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs flex items-center gap-1.5"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Anexos Re-hospedados ({totalAnexos})</span>
              </TabsTrigger>
              <TabsTrigger
                value="pilares"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs"
              >
                3 Pilares & Lentes
              </TabsTrigger>
              <TabsTrigger
                value="bruto"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs"
              >
                Dados Brutos (auditoria)
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 pr-4">
              {/* ABA 1: VISÃO GERAL */}
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

                {/* Resumo de Anexos na Visão Geral */}
                {totalAnexos > 0 && (
                  <Card className="bg-[#16213A] border-[#3DDC74]/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-[#3DDC74] uppercase flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4" /> Anexos do Dossiê Prontos para Download (
                        {totalAnexos})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p className="text-[#C7D0E0]">
                        Arquivos baixados do site institucional e hospedados localmente com
                        segurança no app SaaS:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {arquivosFinanceiros.map((fn, i) => (
                          <a
                            key={`f-${i}`}
                            href={getDownloadUrl('documentacao_adicional', fn)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#111A2E] hover:bg-[#1B2742] border border-[#24334F] text-[#F8FAFC] text-xs transition-colors"
                          >
                            {getFileIcon(fn)}
                            <span>{fn}</span>
                            <Download className="w-3 h-3 text-[#5B9DFF] ml-1" />
                          </a>
                        ))}
                        {arquivosGerenciais.map((fn, i) => (
                          <a
                            key={`g-${i}`}
                            href={getDownloadUrl('certificacoes', fn)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#111A2E] hover:bg-[#1B2742] border border-[#24334F] text-[#F8FAFC] text-xs transition-colors"
                          >
                            {getFileIcon(fn)}
                            <span>{fn}</span>
                            <Download className="w-3 h-3 text-[#5B9DFF] ml-1" />
                          </a>
                        ))}
                        {arquivosSociedade.map((fn, i) => (
                          <a
                            key={`s-${i}`}
                            href={getDownloadUrl('contrato_social', fn)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#111A2E] hover:bg-[#1B2742] border border-[#24334F] text-[#F8FAFC] text-xs transition-colors"
                          >
                            {getFileIcon(fn)}
                            <span>{fn}</span>
                            <Download className="w-3 h-3 text-[#5B9DFF] ml-1" />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ABA 2: QUESTIONÁRIO COMPLETO (ETAPAS 1 A 11) */}
              <TabsContent value="questionario" className="mt-0 space-y-4">
                <div className="p-3 bg-[#16213A] border border-[#5B9DFF]/40 rounded-[4px] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3DDC74]" />
                    <span className="font-semibold text-[#F8FAFC]">
                      Dossiê Estratégico Consolidado (11 Etapas)
                    </span>
                  </div>
                  <Badge className="bg-[#0066CC]/20 text-[#5B9DFF] border border-[#5B9DFF]/40">
                    Setor: {lead.setor || 'Geral'}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {ETAPAS_QUESTIONARIO_CONFIG.map((etapa) => {
                    const respostasEtapa = extrairRespostasEtapa(etapa.numero)
                    return (
                      <Card key={etapa.numero} className="bg-[#16213A] border-[#24334F]">
                        <CardHeader className="py-3 px-4 border-b border-[#24334F]/70 bg-[#111A2E]/70">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
                                {etapa.titulo}
                              </CardTitle>
                              <p className="text-[11px] text-[#8B98B4] mt-0.5">{etapa.descricao}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                respostasEtapa.length > 0
                                  ? 'border-[#3DDC74]/50 text-[#3DDC74] bg-[#3DDC74]/10 text-[10px]'
                                  : 'border-[#8B98B4]/40 text-[#8B98B4] text-[10px]'
                              }
                            >
                              {respostasEtapa.length}{' '}
                              {respostasEtapa.length === 1 ? 'resposta' : 'respostas'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2.5 text-xs">
                          {respostasEtapa.length > 0 ? (
                            respostasEtapa.map((item, idx) => (
                              <div
                                key={idx}
                                className="border-b border-[#24334F]/40 pb-2.5 last:border-0 last:pb-0"
                              >
                                <div className="text-[11px] font-semibold text-[#8B98B4] uppercase tracking-wide">
                                  {item.chave}
                                </div>
                                <div className="text-[#F8FAFC] font-medium mt-1">
                                  {Array.isArray(item.resposta) ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.resposta.map((r: any, rIdx: number) => (
                                        <Badge
                                          key={rIdx}
                                          variant="secondary"
                                          className="bg-[#111A2E] text-[#5B9DFF] border border-[#24334F] text-[11px]"
                                        >
                                          {String(r)}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : typeof item.resposta === 'object' &&
                                    item.resposta !== null ? (
                                    <pre className="text-[10px] font-mono bg-[#111A2E] p-2 rounded text-[#3DDC74] overflow-x-auto mt-1">
                                      {JSON.stringify(item.resposta, null, 2)}
                                    </pre>
                                  ) : (
                                    <span className="text-[#3DDC74]">
                                      {String(item.resposta ?? '—')}
                                    </span>
                                  )}
                                </div>
                                {item.nota && (
                                  <div className="text-[11px] text-[#8B98B4] mt-0.5 italic">
                                    Nota: {item.nota}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-[#8B98B4] italic py-1">
                              Sem respostas registradas para esta etapa neste envio.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}

                  {/* Seção adicional para respostas não-padronizadas */}
                  {outrasRespostas.length > 0 && (
                    <Card className="bg-[#16213A] border-[#FFB84D]/40">
                      <CardHeader className="py-3 px-4 border-b border-[#24334F]/70 bg-[#111A2E]/70">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xs sm:text-sm font-bold text-[#FFB84D]">
                              Outras Respostas & Metadados Extras
                            </CardTitle>
                            <p className="text-[11px] text-[#8B98B4] mt-0.5">
                              Chaves enviadas no campo &apos;respostas&apos; sem correlação direta
                              com as etapas 1 a 11
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-[#FFB84D]/50 text-[#FFB84D] bg-[#FFB84D]/10 text-[10px]"
                          >
                            {outrasRespostas.length}{' '}
                            {outrasRespostas.length === 1 ? 'item' : 'itens'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2.5 text-xs">
                        {outrasRespostas.map((item, idx) => (
                          <div
                            key={idx}
                            className="border-b border-[#24334F]/40 pb-2.5 last:border-0 last:pb-0"
                          >
                            <div className="text-[11px] font-semibold text-[#FFB84D] uppercase tracking-wide">
                              {item.chave}
                            </div>
                            <div className="text-[#F8FAFC] font-medium mt-1">
                              {Array.isArray(item.resposta) ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.resposta.map((r: any, rIdx: number) => (
                                    <Badge
                                      key={rIdx}
                                      variant="secondary"
                                      className="bg-[#111A2E] text-[#5B9DFF] border border-[#24334F] text-[11px]"
                                    >
                                      {String(r)}
                                    </Badge>
                                  ))}
                                </div>
                              ) : typeof item.resposta === 'object' && item.resposta !== null ? (
                                <pre className="text-[10px] font-mono bg-[#111A2E] p-2 rounded text-[#3DDC74] overflow-x-auto mt-1">
                                  {JSON.stringify(item.resposta, null, 2)}
                                </pre>
                              ) : (
                                <span className="text-[#3DDC74]">
                                  {String(item.resposta ?? '—')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>{' '}
              </TabsContent>

              {/* ABA 3: ANEXOS RE-HOSPEDADOS */}
              <TabsContent value="anexos" className="mt-0 space-y-4">
                <div className="p-3 bg-[#16213A] border border-[#3DDC74]/40 rounded-[4px] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#3DDC74]" />
                    <span className="font-semibold text-[#F8FAFC]">
                      Arquivos do Questionário Estratégico (Re-hospedados no SaaS)
                    </span>
                  </div>
                  <Badge className="bg-[#3DDC74]/20 text-[#3DDC74] border border-[#3DDC74]/40 font-mono">
                    Total: {totalAnexos} arquivo(s)
                  </Badge>
                </div>

                {/* Grupo 1: Demonstrativos Financeiros */}
                <Card className="bg-[#16213A] border-[#24334F]">
                  <CardHeader className="py-3 px-4 border-b border-[#24334F]/70">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs sm:text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#3DDC74]" />
                        <span>Grupo 1: Demonstrativos Financeiros (últimos 3 anos)</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-[#8B98B4]">
                        {arquivosFinanceiros.length} arquivo(s)
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#8B98B4] mt-0.5">
                      Balanço Patrimonial, DRE, Balancetes ou Fluxo de Caixa (Word, PDF, Excel)
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-xs">
                    {arquivosFinanceiros.length > 0 ? (
                      <div className="space-y-2">
                        {arquivosFinanceiros.map((fn, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#111A2E] border border-[#24334F]"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              {getFileIcon(fn)}
                              <span className="font-medium text-[#F8FAFC] truncate">{fn}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="h-7 text-xs border-[#24334F] text-[#5B9DFF] hover:bg-[#16213A] gap-1 shrink-0"
                            >
                              <a
                                href={getDownloadUrl('documentacao_adicional', fn)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="w-3.5 h-3.5" /> Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#8B98B4] italic py-1">
                        Nenhum arquivo enviado neste grupo de demonstrativos financeiros.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Grupo 2: Relatórios Gerenciais */}
                <Card className="bg-[#16213A] border-[#24334F]">
                  <CardHeader className="py-3 px-4 border-b border-[#24334F]/70">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs sm:text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#5B9DFF]" />
                        <span>Grupo 2: Relatórios Gerenciais & Certificações</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-[#8B98B4]">
                        {arquivosGerenciais.length} arquivo(s)
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#8B98B4] mt-0.5">
                      Relatórios operacionais, organogramas, certificações ISO/setoriais,
                      apresentações
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-xs">
                    {arquivosGerenciais.length > 0 ? (
                      <div className="space-y-2">
                        {arquivosGerenciais.map((fn, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#111A2E] border border-[#24334F]"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              {getFileIcon(fn)}
                              <span className="font-medium text-[#F8FAFC] truncate">{fn}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="h-7 text-xs border-[#24334F] text-[#5B9DFF] hover:bg-[#16213A] gap-1 shrink-0"
                            >
                              <a
                                href={getDownloadUrl('certificacoes', fn)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="w-3.5 h-3.5" /> Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#8B98B4] italic py-1">
                        Nenhum arquivo enviado neste grupo de relatórios gerenciais.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Grupo 3: Sociedade / Complementares */}
                <Card className="bg-[#16213A] border-[#24334F]">
                  <CardHeader className="py-3 px-4 border-b border-[#24334F]/70">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs sm:text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-[#FFB84D]" />
                        <span>Grupo 3: Sociedade & Documentação Complementar</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] text-[#8B98B4]">
                        {arquivosSociedade.length} arquivo(s)
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#8B98B4] mt-0.5">
                      Contrato Social consolidado, acordo de sócios, procurações e complementares
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-xs">
                    {arquivosSociedade.length > 0 ? (
                      <div className="space-y-2">
                        {arquivosSociedade.map((fn, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#111A2E] border border-[#24334F]"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              {getFileIcon(fn)}
                              <span className="font-medium text-[#F8FAFC] truncate">{fn}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="h-7 text-xs border-[#24334F] text-[#5B9DFF] hover:bg-[#16213A] gap-1 shrink-0"
                            >
                              <a
                                href={getDownloadUrl('contrato_social', fn)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="w-3.5 h-3.5" /> Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#8B98B4] italic py-1">
                        Nenhum arquivo enviado neste grupo de sociedade/complementares.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ABA 4: 3 PILARES & LENTES */}
              <TabsContent value="pilares" className="mt-0 space-y-4">
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

              {/* ABA 5: DADOS BRUTOS (AUDITORIA) */}
              <TabsContent value="bruto" className="mt-0">
                <Card className="bg-[#0B1120] border-[#24334F]">
                  <CardContent className="p-4">
                    <pre className="text-[11px] font-mono text-[#3DDC74] whitespace-pre-wrap break-words overflow-x-auto">
                      {JSON.stringify(
                        {
                          ...lead,
                          dados_completos: lead.dados_completos,
                          respostas: lead.respostas,
                          documentacao_adicional: lead.documentacao_adicional,
                          certificacoes: lead.certificacoes,
                          contrato_social: lead.contrato_social,
                        },
                        null,
                        2,
                      )}
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
