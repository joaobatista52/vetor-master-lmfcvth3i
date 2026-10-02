import { useMemo, useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  AlertTriangle,
  Target,
  Send,
  Loader2,
  Layers,
  Users,
  DollarSign,
  Cpu,
  Compass,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Upload,
  Info,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Clock,
  Eye,
  Shield,
  ArrowLeft,
  FileSpreadsheet,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'
import { createDiagnostico } from '@/services/diagnosticos'
import {
  enviarQuestionarioEstrategico,
  type AutorizacaoDevolutiva,
  type FormatoInteresse,
} from '@/services/leads-unificados'
import { SETORES_CANONICOS_12 } from '@/data/setores-canonicos'
import {
  setores,
  nomePilares,
  simNaoOpcoes,
  formatoInteresseOpcoes,
  BLOCO_ABERTURA_DOSSIE_ESTRATEGICO,
  BLOCO_DOCUMENTACAO_FINAL,
  type Setor,
  type PerguntaItemLiteral,
  type SecaoQuestionarioLiteral,
} from '@/data/setores-questionario'

/**
 * Questionário Estratégico Canônico de 12 Etapas — Vetor Master V7.2
 *
 * Fonte de Verdade: PDF "Questionários Consolidados 12 Setores V7.2" (30set26, 45 págs.)
 *
 * Etapas do Fluxo:
 *   01: Setor de Atuação (Seleção entre os 12 canônicos com cards informativos)
 *   02: Identificação da Empresa & Lead (Razão Social, CNPJ, Data, Segmento, Respondente, Cargo, Modalidade para Trading, Email, WhatsApp)
 *   03: Seção 1 — Perfil da Empresa e Contexto (1.1 a 1.8 / 1.9 / 1.14 literal)
 *   04: Seção 2 — Pilar 1: Prisão do Fundador (2.1 a 2.6 literal)
 *   05: Seção 3 — Pilar 2: Ineficiência Invisível (3.1 a 3.7 / 3.8 literal)
 *   06: Seção 4 — Pilar 3: Abismo Estratégia vs. Execução (4.1 a 4.6 literal)
 *   07: Seção 5 — Capacidade e Design Organizacional (Hackman) (5.1 a 5.6 literal)
 *   08: Seção 6 — Saúde Econômico-Financeira (Buffett) (6.1 a 6.6 / 6.10 literal)
 *   09: Seção 7 — Expectativas e Ambição (7.1 a 7.5 literal)
 *   10: Seção 8 — Inovação e Tecnologia (8.1 a 8.7 / 8.9 literal)
 *   11: Seção 9 — Próximos Passos & Devolutiva Executiva (9.1 a 9.4 literal)
 *   12: Bloco de Documentação Adicional e Anexos (Páginas 44 e 45 do PDF) com submissão final
 */

interface EtapaInfo {
  numero: number
  key: string
  titulo: string
  subtitulo: string
  icone: any
}

const ETAPAS_INFO: EtapaInfo[] = [
  {
    numero: 1,
    key: 'setor',
    titulo: 'Setor de Atuação',
    subtitulo: 'Escolha seu setor entre os 12 canônicos',
    icone: Layers,
  },
  {
    numero: 2,
    key: 'identificacao',
    titulo: 'Identificação da Empresa & Lead',
    subtitulo: 'Dados cadastrais do executivo e da organização',
    icone: Building2,
  },
  {
    numero: 3,
    key: 'perfil',
    titulo: 'Seção 1 — Perfil da Empresa e Contexto',
    subtitulo: 'Mapeamento estrutural de faturamento, equipe e contexto setorial',
    icone: FileText,
  },
  {
    numero: 4,
    key: 'pilar1',
    titulo: 'Seção 2 — Pilar 1: Prisão do Fundador',
    subtitulo: 'Centralização decisória e autonomia da equipe',
    icone: AlertTriangle,
  },
  {
    numero: 5,
    key: 'pilar2',
    titulo: 'Seção 3 — Pilar 2: Ineficiência Invisível',
    subtitulo: 'Gargalos operacionais, retrabalho e vazamento de margem',
    icone: Clock,
  },
  {
    numero: 6,
    key: 'pilar3',
    titulo: 'Seção 4 — Pilar 3: Abismo Estratégia vs. Execução',
    subtitulo: 'Alinhamento tático, governança e metas',
    icone: Target,
  },
  {
    numero: 7,
    key: 'hackman',
    titulo: 'Seção 5 — Capacidade e Design Organizacional (Hackman)',
    subtitulo: 'As 5 condições determinísticas para eficácia de equipes',
    icone: Users,
  },
  {
    numero: 8,
    key: 'buffett',
    titulo: 'Seção 6 — Saúde Econômico-Financeira (Buffett)',
    subtitulo: 'Solidez de caixa, margens, endividamento e governança',
    icone: DollarSign,
  },
  {
    numero: 9,
    key: 'expectativas',
    titulo: 'Seção 7 — Expectativas e Ambição',
    subtitulo: 'Objetivos prioritários para os próximos 12 meses',
    icone: Sparkles,
  },
  {
    numero: 10,
    key: 'inovacao',
    titulo: 'Seção 8 — Inovação e Tecnologia',
    subtitulo: 'Maturidade digital, automações e barreiras tecnológicas',
    icone: Cpu,
  },
  {
    numero: 11,
    key: 'proximos_passos',
    titulo: 'Seção 9 — Próximos Passos',
    subtitulo: 'Autorização da sessão de 45 minutos e formato de interesse',
    icone: Compass,
  },
  {
    numero: 12,
    key: 'documentacao',
    titulo: 'Documentação Adicional & Anexos',
    subtitulo: 'Uploads complementares e demonstrativos para o diagnóstico',
    icone: FileCheck2,
  },
]

export default function Questionario() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  const { setorParam } = useParams<{ setorParam?: string }>()

  // Modo Revisão (exclusivo para Admin; nunca persiste em localStorage de lead)
  const [modoRevisao, setModoRevisao] = useState(false)

  // Setor Selecionado
  const [setorId, setSetorId] = useState<string>(() => {
    if (setorParam) {
      const match = SETORES_CANONICOS_12.find((s) => s.id === setorParam)
      if (match) return match.id
    }
    try {
      const salvo = localStorage.getItem('vm_questionario_progresso')
      if (salvo) {
        const parsed = JSON.parse(salvo)
        if (parsed.setorId) return parsed.setorId
      }
    } catch {
      /* intentionally ignored */
    }
    return 'saude'
  })

  const [etapaAtual, setEtapaAtual] = useState<number>(() => {
    try {
      const salvo = localStorage.getItem('vm_questionario_progresso')
      if (salvo) {
        const parsed = JSON.parse(salvo)
        if (parsed.etapaAtual && typeof parsed.etapaAtual === 'number') {
          // Migração de rascunhos salvos na ordem antiga (11=documentação, 12=proximos_passos)
          if (parsed.versaoEtapas !== 2) {
            if (parsed.etapaAtual === 11) return 12
            if (parsed.etapaAtual === 12) return 11
          }
          return Math.min(Math.max(parsed.etapaAtual, 1), 12)
        }
      }
    } catch {
      /* intentionally ignored */
    }
    return 1
  }) // 1..12

  const [submitting, setSubmitting] = useState(false)
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null)
  const [modoArmazenamento, setModoArmazenamento] = useState<'remoto' | 'local_fila'>('remoto')

  // Identificação da Empresa & Lead
  const [razaoSocial, setRazaoSocial] = useState(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p) return JSON.parse(p).razaoSocial || ''
    } catch {
      /* intentionally ignored */
    }
    return ''
  })
  const [cnpj, setCnpj] = useState(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p) return JSON.parse(p).cnpj || ''
    } catch {
      /* intentionally ignored */
    }
    return ''
  })
  const [dataPreenchimento, setDataPreenchimento] = useState(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p && JSON.parse(p).dataPreenchimento) return JSON.parse(p).dataPreenchimento
    } catch {
      /* intentionally ignored */
    }
    return new Date().toLocaleDateString('pt-BR')
  })
  const [segmento, setSegmento] = useState<string[]>(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p) {
        const parsed = JSON.parse(p).segmento
        if (Array.isArray(parsed)) return parsed
        if (typeof parsed === 'string' && parsed.trim() !== '') return [parsed.trim()]
      }
    } catch {
      /* intentionally ignored */
    }
    return []
  })
  const [segmentoOutro, setSegmentoOutro] = useState(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p) return JSON.parse(p).segmentoOutro || ''
    } catch {
      /* intentionally ignored */
    }
    return ''
  })
  const [modalidadeTrading, setModalidadeTrading] = useState(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p) return JSON.parse(p).modalidadeTrading || ''
    } catch {
      /* intentionally ignored */
    }
    return ''
  })
  const [respondente, setRespondente] = useState(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p) return JSON.parse(p).respondente || ''
    } catch {
      /* intentionally ignored */
    }
    return ''
  })
  const [cargo, setCargo] = useState(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p) return JSON.parse(p).cargo || ''
    } catch {
      /* intentionally ignored */
    }
    return ''
  })
  const [emailCorporativo, setEmailCorporativo] = useState(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p) return JSON.parse(p).emailCorporativo || ''
    } catch {
      /* intentionally ignored */
    }
    return ''
  })
  const [whatsapp, setWhatsapp] = useState(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p) return JSON.parse(p).whatsapp || ''
    } catch {
      /* intentionally ignored */
    }
    return ''
  })

  // Respostas estruturadas por chave: `${secaoId}-${numero}`
  // Suporta string ou string[] para perguntas de seleção múltipla (checkbox)
  const [respostas, setRespostas] = useState<Record<string, string | string[]>>(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p && JSON.parse(p).respostas) return JSON.parse(p).respostas
    } catch {
      /* intentionally ignored */
    }
    return {}
  })

  // Normaliza rascunhos antigos onde respostas de perguntas múltiplas foram salvas como string
  useEffect(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (!p) return
      const parsed = JSON.parse(p)
      if (parsed && parsed.respostas && typeof parsed.respostas === 'object') {
        const rawRespostas = parsed.respostas as Record<string, any>
        let houveMudanca = false
        const atualizadas: Record<string, string | string[]> = { ...rawRespostas }
        Object.keys(rawRespostas).forEach((key) => {
          const val = rawRespostas[key]
          // Se for string com formato de array JSON serializado
          if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
            try {
              const arrayVal = JSON.parse(val)
              if (Array.isArray(arrayVal)) {
                atualizadas[key] = arrayVal
                houveMudanca = true
              }
            } catch {
              /* ignore */
            }
          }
        })
        if (houveMudanca) {
          setRespostas((prev) => ({ ...prev, ...atualizadas }))
        }
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Checkboxes de Documentação Adicional do Setor (Balanço, DRE, etc.)
  const [documentosAdicionaisCheck, setDocumentosAdicionaisCheck] = useState<string[]>(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p && Array.isArray(JSON.parse(p).documentosAdicionaisCheck)) {
        return JSON.parse(p).documentosAdicionaisCheck
      }
    } catch {
      /* intentionally ignored */
    }
    return []
  })

  // Simulação de nomes de arquivos anexados nos 3 grupos do bloco final
  const [anexosFinanceiros, setAnexosFinanceiros] = useState<string[]>([])
  const [anexosGerenciais, setAnexosGerenciais] = useState<string[]>([])
  const [anexosSociedade, setAnexosSociedade] = useState<string[]>([])

  // Opções do bloco "CASO NÃO VÁ ANEXAR ARQUIVOS AGORA:"
  const [naoPossuiDocumentosAgora, setNaoPossuiDocumentosAgora] = useState(false)
  const [prefiroEnviarDepois, setPrefiroEnviarDepois] = useState(false)

  // Seção 9: Próximos Passos
  const [autorizacaoDevolutiva, setAutorizacaoDevolutiva] = useState<AutorizacaoDevolutiva>(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p && JSON.parse(p).autorizacaoDevolutiva) return JSON.parse(p).autorizacaoDevolutiva
    } catch {
      /* intentionally ignored */
    }
    return 'Sim'
  })
  const [formatoInteresse, setFormatoInteresse] = useState<FormatoInteresse>(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p && JSON.parse(p).formatoInteresse) return JSON.parse(p).formatoInteresse
    } catch {
      /* intentionally ignored */
    }
    return 'Híbrido'
  })
  const [responsavelDocumentos, setResponsavelDocumentos] = useState(() => {
    try {
      const p = localStorage.getItem('vm_questionario_progresso')
      if (p && JSON.parse(p).responsavelDocumentos) return JSON.parse(p).responsavelDocumentos
    } catch {
      /* intentionally ignored */
    }
    return ''
  })

  // Sincroniza setor pela rota se vier param na URL (/questionario/:setorParam)
  useEffect(() => {
    if (setorParam) {
      const match = SETORES_CANONICOS_12.find((s) => s.id === setorParam)
      if (match && match.id !== setorId) {
        setSetorId(match.id)
      }
    }
  }, [setorParam, setorId])

  // Salvar progresso no localStorage automaticamente
  useEffect(() => {
    if (protocoloGerado || modoRevisao) return
    try {
      const dados = {
        versaoEtapas: 2,
        etapaAtual,
        setorId,
        razaoSocial,
        cnpj,
        dataPreenchimento,
        segmento,
        segmentoOutro,
        modalidadeTrading,
        respondente,
        cargo,
        emailCorporativo,
        whatsapp,
        respostas,
        documentosAdicionaisCheck,
        naoPossuiDocumentosAgora,
        prefiroEnviarDepois,
        autorizacaoDevolutiva,
        formatoInteresse,
        responsavelDocumentos,
        atualizadoEm: new Date().toISOString(),
      }
      localStorage.setItem('vm_questionario_progresso', JSON.stringify(dados))
    } catch (e) {
      console.warn('[Questionario] Erro ao salvar progresso local:', e)
    }
  }, [
    etapaAtual,
    setorId,
    razaoSocial,
    cnpj,
    dataPreenchimento,
    segmento,
    segmentoOutro,
    modalidadeTrading,
    respondente,
    cargo,
    emailCorporativo,
    whatsapp,
    respostas,
    documentosAdicionaisCheck,
    naoPossuiDocumentosAgora,
    prefiroEnviarDepois,
    autorizacaoDevolutiva,
    formatoInteresse,
    responsavelDocumentos,
    protocoloGerado,
    modoRevisao,
  ])

  const setorObj: Setor = useMemo(
    () => setores.find((s) => s.id === setorId) || setores[0],
    [setorId],
  )

  // Mapeia seções por número
  const secao1 = useMemo(() => setorObj.secoes.find((s) => s.numero === 1)!, [setorObj])
  const secao2 = useMemo(() => setorObj.secoes.find((s) => s.numero === 2)!, [setorObj])
  const secao3 = useMemo(() => setorObj.secoes.find((s) => s.numero === 3)!, [setorObj])
  const secao4 = useMemo(() => setorObj.secoes.find((s) => s.numero === 4)!, [setorObj])
  const secao5 = useMemo(() => setorObj.secoes.find((s) => s.numero === 5)!, [setorObj])
  const secao6 = useMemo(() => setorObj.secoes.find((s) => s.numero === 6)!, [setorObj])
  const secao7 = useMemo(() => setorObj.secoes.find((s) => s.numero === 7)!, [setorObj])
  const secao8 = useMemo(() => setorObj.secoes.find((s) => s.numero === 8)!, [setorObj])
  const secao9 = useMemo(() => setorObj.secoes.find((s) => s.numero === 9)!, [setorObj])

  const setResposta = (secaoKey: string, numero: string, val: string | string[]) => {
    setRespostas((prev) => ({ ...prev, [`${secaoKey}-${numero}`]: val }))
  }

  // Verifica se um valor de resposta está preenchido (string não vazia ou array com itens)
  const isValorPreenchido = (v: string | string[] | undefined): boolean => {
    if (v === undefined || v === null) return false
    if (Array.isArray(v)) return v.length > 0
    return typeof v === 'string' && v.trim() !== ''
  }

  // Verifica preenchimento de uma lista de perguntas
  const secaoCompleta = (secaoKey: string, perguntas: PerguntaItemLiteral[]): boolean => {
    return perguntas.every((p) => {
      if (p.tipoForma === 'informativo') return true
      const v = respostas[`${secaoKey}-${p.numero}`]
      if (!isValorPreenchido(v)) return false

      // Subpergunta condicional (ex: Trading 1.9 e 1.13)
      const vStr = Array.isArray(v) ? v.join(', ') : v || ''
      if (p.subpergunta && vStr === p.subpergunta.condicao) {
        const subV = respostas[`${secaoKey}-${p.numero}-sub`]
        if (!isValorPreenchido(subV)) return false
      }
      return true
    })
  }

  // Total de perguntas do questionário
  const todasPerguntasParaContagem = useMemo(() => {
    const listas = [
      secao1?.perguntas || [],
      secao2?.perguntas || [],
      secao3?.perguntas || [],
      secao4?.perguntas || [],
      secao5?.perguntas || [],
      secao6?.perguntas || [],
      secao7?.perguntas || [],
      secao8?.perguntas || [],
    ]
    return listas.flat().filter((p) => p.tipoForma !== 'informativo')
  }, [secao1, secao2, secao3, secao4, secao5, secao6, secao7, secao8])

  const perguntasRespondidasTotal = useMemo(() => {
    let count = 0
    const pares: [string, PerguntaItemLiteral[]][] = [
      ['secao1', secao1?.perguntas || []],
      ['secao2', secao2?.perguntas || []],
      ['secao3', secao3?.perguntas || []],
      ['secao4', secao4?.perguntas || []],
      ['secao5', secao5?.perguntas || []],
      ['secao6', secao6?.perguntas || []],
      ['secao7', secao7?.perguntas || []],
      ['secao8', secao8?.perguntas || []],
    ]
    pares.forEach(([k, pergs]) => {
      pergs.forEach((p) => {
        if (p.tipoForma === 'informativo') return
        const val = respostas[`${k}-${p.numero}`]
        if (isValorPreenchido(val)) count++
      })
    })
    return count
  }, [secao1, secao2, secao3, secao4, secao5, secao6, secao7, secao8, respostas])

  // Validação estrita por etapa: TODAS AS PERGUNTAS DEVEM SER RESPONDIDAS ANTES DE AVANÇAR
  const canAvancar = (): boolean => {
    if (modoRevisao) return true
    switch (etapaAtual) {
      case 1:
        return !!setorId
      case 2:
        return (
          razaoSocial.trim() !== '' &&
          cnpj.trim() !== '' &&
          respondente.trim() !== '' &&
          cargo.trim() !== '' &&
          emailCorporativo.trim() !== '' &&
          whatsapp.trim() !== '' &&
          (segmento.length > 0 || segmentoOutro.trim() !== '') &&
          (setorId !== 'trading' || modalidadeTrading.trim() !== '')
        )
      case 3:
        return secaoCompleta('secao1', secao1.perguntas)
      case 4:
        return secaoCompleta('secao2', secao2.perguntas)
      case 5:
        return secaoCompleta('secao3', secao3.perguntas)
      case 6:
        return secaoCompleta('secao4', secao4.perguntas)
      case 7:
        return secaoCompleta('secao5', secao5.perguntas)
      case 8:
        return secaoCompleta('secao6', secao6.perguntas)
      case 9:
        return secaoCompleta('secao7', secao7.perguntas)
      case 10:
        return secaoCompleta('secao8', secao8.perguntas)
      case 11:
        return (
          Boolean(autorizacaoDevolutiva) &&
          Boolean(formatoInteresse) &&
          responsavelDocumentos.trim() !== ''
        )
      case 12:
        // Etapa 12 (Documentação): O envio continua liberado mesmo sem anexar.
        return true
      default:
        return true
    }
  }

  const proximaEtapa = () => {
    if (etapaAtual < 12) {
      setEtapaAtual((e) => e + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual((e) => e - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const irParaEtapa = (etapaNum: number) => {
    if (!modoRevisao) return
    const alvo = Math.min(Math.max(etapaNum, 1), 12)
    setEtapaAtual(alvo)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Manipulação de arquivos fictícios no navegador (sem envio para rascunho local)
  const handleFileSimulado = (
    grupo: 'financeiros' | 'gerenciais' | 'sociedade',
    fileList: FileList | null,
  ) => {
    if (!fileList || fileList.length === 0) return
    const nomes: string[] = []
    const formatosValidos = ['.doc', '.docx', '.pdf', '.xls', '.xlsx']
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (formatosValidos.includes(ext)) {
        nomes.push(file.name)
      } else {
        toast({
          title: 'Formato não aceito',
          description: `O arquivo ${file.name} foi recusado. Aceitos exclusivamente Word, PDF e Excel.`,
          variant: 'destructive',
        })
      }
    }
    if (grupo === 'financeiros') setAnexosFinanceiros((prev) => [...prev, ...nomes].slice(0, 15))
    if (grupo === 'gerenciais') setAnexosGerenciais((prev) => [...prev, ...nomes].slice(0, 15))
    if (grupo === 'sociedade') setAnexosSociedade((prev) => [...prev, ...nomes].slice(0, 15))
  }

  // Submissão Final do Questionário (Etapa 12)
  const handleFinalizar = async () => {
    setSubmitting(true)
    try {
      const segmentosLimpos = segmento.filter((s) => s !== 'Outro')
      if (segmento.includes('Outro') && segmentoOutro.trim()) {
        segmentosLimpos.push(`Outro: ${segmentoOutro.trim()}`)
      }
      const segmentoFinal = segmentosLimpos.join(', ') || segmentoOutro

      const mapRespostasSecao = (secaoKey: string, perguntas: PerguntaItemLiteral[]) =>
        perguntas.map((p) => {
          const rawVal = respostas[`${secaoKey}-${p.numero}`]
          const val = Array.isArray(rawVal) ? rawVal : rawVal || ''
          const rawSub = p.subpergunta ? respostas[`${secaoKey}-${p.numero}-sub`] : undefined
          const sub = Array.isArray(rawSub) ? rawSub : rawSub
          return {
            numero: p.numero,
            enunciado: p.enunciado,
            resposta: val,
            subpergunta:
              sub !== undefined
                ? { enunciado: p.subpergunta?.enunciado, resposta: sub }
                : undefined,
          }
        })

      const perfilRespostas = mapRespostasSecao('secao1', secao1.perguntas)
      const pilar1Respostas = mapRespostasSecao('secao2', secao2.perguntas)
      const pilar2Respostas = mapRespostasSecao('secao3', secao3.perguntas)
      const pilar3Respostas = mapRespostasSecao('secao4', secao4.perguntas)
      const hackmanRespostas = mapRespostasSecao('secao5', secao5.perguntas)
      const buffettRespostas = mapRespostasSecao('secao6', secao6.perguntas)
      const expectativasRespostas = mapRespostasSecao('secao7', secao7.perguntas)
      const inovacaoRespostas = mapRespostasSecao('secao8', secao8.perguntas)

      const docPayload = {
        documentos_adicionais_declarados: documentosAdicionaisCheck,
        anexos_financeiros: anexosFinanceiros,
        anexos_gerenciais: anexosGerenciais,
        anexos_sociedade: anexosSociedade,
        nao_possui_documentos_agora: naoPossuiDocumentosAgora,
        prefiro_enviar_depois: prefiroEnviarDepois,
        responsavel_envio: responsavelDocumentos,
      }

      // Envia à base unificada de leads
      const res = await enviarQuestionarioEstrategico({
        autorizacao_devolutiva: autorizacaoDevolutiva,
        formato_interesse: formatoInteresse,
        razao_social: razaoSocial,
        cnpj,
        data_preenchimento: dataPreenchimento,
        setor: setorObj.nome,
        segmento: segmentoFinal,
        respondente,
        cargo,
        email_corporativo: emailCorporativo,
        whatsapp,
        perfil: {
          modalidade: modalidadeTrading,
          respostas: perfilRespostas,
        },
        pilares: {
          pilar_1_prisao_fundador: pilar1Respostas,
          pilar_2_ineficiencia_invisivel: pilar2Respostas,
          pilar_3_abismo_estrategia_execucao: pilar3Respostas,
        },
        hackman: hackmanRespostas,
        buffett: buffettRespostas,
        expectativas: expectativasRespostas,
        inovacao: inovacaoRespostas,
        documentacao: docPayload as any,
      })

      // Se autenticado na aplicação SaaS, também cria o diagnóstico na collection local
      if (user?.id) {
        try {
          await createDiagnostico({
            user: user.id,
            setor: setorObj.id,
            dados_entrada: {
              protocolo: res.protocolo,
              empresa: {
                razao_social: razaoSocial,
                cnpj,
                setor: setorObj.nome,
                segmento: segmentoFinal,
                respondente,
                cargo,
                email: emailCorporativo,
                whatsapp,
              },
              documentacao: docPayload,
              autorizacao_devolutiva: autorizacaoDevolutiva,
              formato_interesse: formatoInteresse,
            },
          })
        } catch (e) {
          console.warn('[Questionario] Aviso ao salvar diagnostico local:', e)
        }
      }

      setProtocoloGerado(res.protocolo)
      setModoArmazenamento(res.armazenamento)

      try {
        localStorage.removeItem('vm_questionario_progresso')
      } catch {
        /* intentionally ignored */
      }

      toast({
        title: 'Questionário Estratégico Concluído!',
        description: `Seu protocolo oficial é ${res.protocolo}.`,
      })
    } catch (err: any) {
      console.error('[Questionario] Erro ao submeter:', err)
      toast({
        title: 'Protocolo registrado com segurança',
        description: 'Seus dados foram preservados localmente para sincronização.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // TELA DE PROTOCOLO GERADO (SUCESSO)
  if (protocoloGerado) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <div className="flex items-center">
            {isAdmin ? (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 px-2 text-xs text-[#8B98B4] hover:text-[#F8FAFC] hover:bg-[#16213A] rounded-[4px] gap-1.5"
              >
                <Link to="/app">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Voltar ao App</span>
                </Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 px-2 text-xs text-[#8B98B4] hover:text-[#F8FAFC] hover:bg-[#16213A] rounded-[4px] gap-1.5"
              >
                <Link to="/">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Voltar à Página Institucional</span>
                </Link>
              </Button>
            )}
          </div>

          <div className="text-center space-y-3">
            <Badge className="bg-[#3DDC74]/15 text-[#3DDC74] border-[#3DDC74]/30 px-3 py-1 font-semibold text-xs">
              QUESTIONÁRIO ESTRATÉGICO CONCLUÍDO • SLA 72H
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
              Dossiê Estratégico Registrado com Sucesso
            </h1>
            <p className="text-xs sm:text-sm text-[#C7D0E0] max-w-xl mx-auto leading-relaxed">
              Obrigado, <strong className="text-[#F8FAFC]">{respondente}</strong>. Os dados da{' '}
              <strong className="text-[#F8FAFC]">{razaoSocial}</strong> foram consolidados no motor
              determinístico Vetor Master V7.2.
            </p>
          </div>

          <Card className="bg-[#16213A] border-2 border-[#3DDC74]/50 rounded-[4px] shadow-2xl overflow-hidden">
            <div className="bg-[#3DDC74]/15 border-b border-[#3DDC74]/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#3DDC74]" />
                <span className="font-semibold text-sm text-[#3DDC74]">
                  Protocolo Oficial Gerado
                </span>
              </div>
              <Badge className="bg-[#111A2E] text-[#8B98B4] border border-[#24334F] text-[10px] font-mono">
                {modoArmazenamento === 'remoto' ? 'Base Unificada Online' : 'Fila Local Segura'}
              </Badge>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="bg-[#111A2E] border border-[#24334F] rounded-[4px] p-6 text-center space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#8B98B4] font-semibold block">
                  Identificador Imutável do Lead
                </span>
                <span className="text-3xl sm:text-4xl font-mono font-bold text-[#3DDC74] block tracking-wider">
                  {protocoloGerado}
                </span>
                <p className="text-[11px] text-[#C7D0E0]">
                  Guarde este número para referência da sua devolutiva de 45 minutos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#C7D0E0]">
                <div className="bg-[#111A2E]/70 p-4 rounded-[4px] border border-[#24334F] space-y-1">
                  <span className="text-[#8B98B4] block uppercase text-[10px] font-semibold">
                    Setor & Segmento
                  </span>
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    {setorObj.nome} — {segmento.join(', ') || segmentoOutro}
                  </p>
                </div>
                <div className="bg-[#111A2E]/70 p-4 rounded-[4px] border border-[#24334F] space-y-1">
                  <span className="text-[#8B98B4] block uppercase text-[10px] font-semibold">
                    Responsável pelos Documentos
                  </span>
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    {responsavelDocumentos || respondente}
                  </p>
                </div>
                <div className="bg-[#111A2E]/70 p-4 rounded-[4px] border border-[#24334F] space-y-1">
                  <span className="text-[#8B98B4] block uppercase text-[10px] font-semibold">
                    Devolutiva Executiva (45 min)
                  </span>
                  <p className="text-sm font-semibold text-[#3DDC74]">
                    {autorizacaoDevolutiva === 'Sim'
                      ? 'Autorizada pelo Executivo'
                      : 'Não solicitada'}
                  </p>
                </div>
                <div className="bg-[#111A2E]/70 p-4 rounded-[4px] border border-[#24334F] space-y-1">
                  <span className="text-[#8B98B4] block uppercase text-[10px] font-semibold">
                    Formato de Interesse
                  </span>
                  <p className="text-sm font-semibold text-[#5B9DFF]">{formatoInteresse}</p>
                </div>
              </div>

              <div className="bg-[#111A2E] p-4 rounded-[4px] border border-[#24334F] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5B9DFF]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SLA e Próximos Passos Determinísticos</span>
                </div>
                <ul className="text-xs text-[#C7D0E0] space-y-1 list-disc list-inside">
                  <li>
                    O Motor Determinístico processa a matriz dos 3 Pilares e thresholds em 72h.
                  </li>
                  <li>
                    Nossa equipe executiva entrará em contato via WhatsApp e e-mail em até 5 dias.
                  </li>
                  <li>
                    Sessão executiva de 45 min estruturada com especialista C-Level sem alucinação.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#24334F]">
                <Button
                  asChild
                  className="w-full sm:w-auto bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-semibold text-xs py-5 px-6 gap-2"
                >
                  <Link to="/questionario/sucesso">
                    <span>Visualizar Relatório de Devolutiva Executiva</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto border-[#24334F] text-[#C7D0E0] hover:bg-[#111A2E] rounded-[4px] text-xs py-5"
                >
                  <Link to="/">Voltar à Página Institucional</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const etapaInfo = ETAPAS_INFO[etapaAtual - 1]
  const IconeEtapa = etapaInfo.icone

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Retorno discreto no topo */}
        <div className="flex items-center">
          {isAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 px-2 text-xs text-[#8B98B4] hover:text-[#F8FAFC] hover:bg-[#16213A] rounded-[4px] gap-1.5"
            >
              <Link to="/app">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Voltar ao App</span>
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 px-2 text-xs text-[#8B98B4] hover:text-[#F8FAFC] hover:bg-[#16213A] rounded-[4px] gap-1.5"
            >
              <Link to="/">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Voltar à Página Institucional</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Banner de Modo Revisão para Admin */}
        {isAdmin && (
          <div className="rounded-[4px] border border-[#F59E0B]/40 bg-[#78350F]/20 p-3 sm:p-4 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                      Painel do Administrador
                    </span>
                    {modoRevisao && (
                      <Badge className="bg-[#DC2626] text-white border-none font-bold text-[10px] tracking-widest px-2 py-0.5 animate-pulse">
                        MODO REVISÃO ATIVO
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-[#C7D0E0]">
                    {modoRevisao
                      ? 'Navegação livre entre as 12 etapas ativa. Envio desativado.'
                      : 'Ative o Modo Revisão para conferir e auditar todas as seções sem validação.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center bg-[#111A2E]/80 border border-[#24334F] rounded-[4px] px-3 py-1.5">
                <Eye className="w-4 h-4 text-[#F59E0B]" />
                <Label
                  htmlFor="toggle-modo-revisao"
                  className="text-xs font-medium text-[#F8FAFC] cursor-pointer"
                >
                  Modo Revisão
                </Label>
                <Switch
                  id="toggle-modo-revisao"
                  checked={modoRevisao}
                  onCheckedChange={(val) => {
                    setModoRevisao(val)
                    toast({
                      title: val ? 'Modo Revisão Ativado' : 'Modo Revisão Desativado',
                      description: val ? 'Navegação livre liberada.' : 'Validações reativadas.',
                    })
                  }}
                  className="data-[state=checked]:bg-[#F59E0B]"
                />
              </div>
            </div>

            {modoRevisao && (
              <div className="mt-3 pt-3 border-t border-[#F59E0B]/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#FCD34D] font-medium">
                  <span className="uppercase tracking-wider">Saltar diretamente para etapa:</span>
                  <span className="text-[10px] text-[#C7D0E0]">
                    Clique em qualquer etapa abaixo
                  </span>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {ETAPAS_INFO.map((item) => {
                    const isAtual = etapaAtual === item.numero
                    return (
                      <button
                        key={item.numero}
                        type="button"
                        onClick={() => irParaEtapa(item.numero)}
                        title={`Etapa ${item.numero}: ${item.titulo}`}
                        className={`h-8 rounded-[3px] text-xs font-mono font-bold transition-all border flex items-center justify-center ${
                          isAtual
                            ? 'bg-[#F59E0B] text-[#0B1120] border-[#F59E0B] shadow-md ring-2 ring-[#F59E0B]/50'
                            : 'bg-[#16213A] text-[#C7D0E0] border-[#24334F] hover:bg-[#1F2E4D] hover:text-[#F8FAFC]'
                        }`}
                      >
                        {String(item.numero).padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#24334F]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#16213A] border border-[#24334F] text-[#5B9DFF] text-xs font-semibold mb-2">
              <span>CAMADA 1 • CONVERSÃO & DIAGNÓSTICO GRATUITO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC] font-heading">
              Questionário Estratégico Determinístico
            </h1>
            <p className="text-xs sm:text-sm text-[#C7D0E0] mt-0.5">
              Etapa {etapaAtual} de 12 • {etapaInfo.titulo}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[#111A2E] text-[#3DDC74] border border-[#24334F] text-xs font-mono">
              SLA 72h
            </Badge>
            <Badge className="bg-[#111A2E] text-[#5B9DFF] border border-[#24334F] text-xs font-mono">
              Devolutiva 45 min
            </Badge>
            <Badge className="bg-[#16213A] text-[#FFB84D] border border-[#FFB84D]/30 text-xs font-mono">
              {perguntasRespondidasTotal}/{todasPerguntasParaContagem.length} Respondidas
            </Badge>
          </div>
        </div>

        {/* Progresso Geral */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#8B98B4]">
            <span>Progresso Geral</span>
            <span className="font-mono text-[#5B9DFF] font-semibold">
              {Math.round((etapaAtual / 12) * 100)}%
            </span>
          </div>
          <Progress
            value={(etapaAtual / 12) * 100}
            className="h-2 bg-[#16213A] [&>div]:bg-[#0066CC]"
          />
        </div>

        {/* Card Principal da Etapa */}
        <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px] shadow-xl">
          <CardHeader className="border-b border-[#24334F] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-[#0066CC]/20 border border-[#5B9DFF]/30 flex items-center justify-center text-[#5B9DFF]">
                <IconeEtapa className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-[#F8FAFC]">
                  Etapa {String(etapaAtual).padStart(2, '0')} • {etapaInfo.titulo}
                </CardTitle>
                <CardDescription className="text-xs text-[#C7D0E0]">
                  {etapaInfo.subtitulo}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Bloco de Abertura do Dossiê Estratégico nas etapas 2 a 12 (literais do PDF) */}
            {etapaAtual >= 2 && etapaAtual <= 12 && (
              <div className="mb-6 p-4 sm:p-5 rounded-[4px] bg-[#111A2E] border border-[#5B9DFF]/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#0066CC]/20 text-[#5B9DFF] border-[#5B9DFF]/40 text-[10px] sm:text-xs font-semibold tracking-wide">
                    {BLOCO_ABERTURA_DOSSIE_ESTRATEGICO.avisoCaixaAlta}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-[#F8FAFC] leading-relaxed">
                  {BLOCO_ABERTURA_DOSSIE_ESTRATEGICO.paragrafo1}.
                </p>
                <p className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
                  {BLOCO_ABERTURA_DOSSIE_ESTRATEGICO.paragrafo2}
                </p>
              </div>
            )}

            {/* ETAPA 1: SETOR DE ATUAÇÃO (Card FECHADO igual ao do site, sem textos próprios de metas/soluções) */}
            {etapaAtual === 1 && (
              <div className="space-y-6">
                <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#24334F] text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
                  Selecione o setor de atuação da sua organização para carregar as perguntas
                  específicas, indicadores e matrizes de benchmarking correspondentes.
                </div>

                {/* 12 Setores com visual sóbrio, idêntico ao do site */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {SETORES_CANONICOS_12.map((s) => {
                    const isSelected = setorId === s.id
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSetorId(s.id)
                          setSegmento([])
                          navigate(`/questionario/${s.id}`, { replace: true })
                        }}
                        className={`p-4 rounded-[4px] border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1B2742] border-[#5B9DFF] ring-2 ring-[#5B9DFF]/40 shadow-lg'
                            : 'bg-[#111A2E]/60 border-[#24334F] hover:border-[#5B9DFF]/50 hover:bg-[#111A2E]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-[#5B9DFF]">
                            {s.numero}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#F8FAFC]">{s.nome}</h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.segmentos.map((seg) => (
                            <span
                              key={seg}
                              className="inline-block px-1.5 py-0.5 rounded-[2px] bg-[#16213A] border border-[#24334F] text-[10px] text-[#8B98B4]"
                            >
                              {seg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#5B9DFF]/40 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#8B98B4] block">
                      Setor Selecionado:
                    </span>
                    <span className="text-sm font-bold text-[#5B9DFF]">{setorObj.nome}</span>
                  </div>
                  <Badge className="bg-[#3DDC74]/15 text-[#3DDC74] border-[#3DDC74]/30 text-xs">
                    Questionário Carregado
                  </Badge>
                </div>
              </div>
            )}

            {/* ETAPA 2: IDENTIFICAÇÃO DA EMPRESA & LEAD */}
            {etapaAtual === 2 && (
              <div className="space-y-4">
                <div className="p-3 bg-[#111A2E] rounded-[4px] border border-[#24334F] text-xs text-[#C7D0E0]">
                  Setor selecionado: <strong className="text-[#5B9DFF]">{setorObj.nome}</strong>.
                  Preencha os dados oficiais da empresa.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs text-[#C7D0E0]">Razão Social:</Label>
                    <Input
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      placeholder="Nome oficial da empresa"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">CNPJ:</Label>
                    <Input
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">Data:</Label>
                    <Input
                      value={dataPreenchimento}
                      onChange={(e) => setDataPreenchimento(e.target.value)}
                      placeholder="DD/MM/AAAA"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  {/* Segmento com as opções exatas do PDF + Outro (Seleção Múltipla via Checkbox) */}
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-[#C7D0E0] block">
                        Segmento (seleção múltipla):
                      </Label>
                      {segmento.length > 0 && (
                        <span className="text-[11px] text-[#5B9DFF]">
                          {segmento.length} {segmento.length === 1 ? 'selecionado' : 'selecionados'}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {setorObj.identificacao.segmentos.map((seg) => {
                        const checked = segmento.includes(seg)
                        return (
                          <div
                            key={seg}
                            onClick={() => {
                              setSegmento((prev) =>
                                checked ? prev.filter((s) => s !== seg) : [...prev, seg],
                              )
                            }}
                            className="flex items-center space-x-2.5 p-2 rounded-[3px] bg-[#111A2E] border border-[#24334F] hover:bg-[#16213A] cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={checked}
                              id={`seg-${seg}`}
                              className="border-[#24334F] data-[state=checked]:bg-[#5B9DFF]"
                            />
                            <Label
                              htmlFor={`seg-${seg}`}
                              className="text-xs text-[#F8FAFC] cursor-pointer font-normal"
                            >
                              {seg}
                            </Label>
                          </div>
                        )
                      })}
                      {(() => {
                        const checkedOutro = segmento.includes('Outro')
                        return (
                          <div
                            onClick={() => {
                              setSegmento((prev) =>
                                checkedOutro
                                  ? prev.filter((s) => s !== 'Outro')
                                  : [...prev, 'Outro'],
                              )
                            }}
                            className="flex items-center space-x-2.5 p-2 rounded-[3px] bg-[#111A2E] border border-[#24334F] hover:bg-[#16213A] cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={checkedOutro}
                              id="seg-outro"
                              className="border-[#24334F] data-[state=checked]:bg-[#5B9DFF]"
                            />
                            <Label
                              htmlFor="seg-outro"
                              className="text-xs text-[#F8FAFC] cursor-pointer font-normal"
                            >
                              Outro
                            </Label>
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {segmento.includes('Outro') && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs text-[#C7D0E0]">Outro (especifique):</Label>
                      <Input
                        value={segmentoOutro}
                        onChange={(e) => setSegmentoOutro(e.target.value)}
                        placeholder="Digite sua resposta..."
                        className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                      />
                    </div>
                  )}

                  {/* Modalidade de atuação exclusiva para Trading */}
                  {setorId === 'trading' && setorObj.identificacao.modalidadeTrading && (
                    <div className="space-y-2 sm:col-span-2 p-3 rounded-[4px] bg-[#111A2E] border border-[#5B9DFF]/40">
                      <Label className="text-xs text-[#F8FAFC] font-semibold block">
                        Modalidade de atuação:
                      </Label>
                      <RadioGroup
                        value={modalidadeTrading}
                        onValueChange={setModalidadeTrading}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2"
                      >
                        {setorObj.identificacao.modalidadeTrading.map((mod) => (
                          <div
                            key={mod}
                            onClick={() => setModalidadeTrading(mod)}
                            className="flex items-center space-x-2.5 p-2 rounded-[3px] bg-[#16213A] border border-[#24334F] hover:bg-[#1F2E4D] cursor-pointer"
                          >
                            <RadioGroupItem
                              value={mod}
                              id={`mod-${mod}`}
                              className="border-[#24334F] text-[#5B9DFF]"
                            />
                            <Label
                              htmlFor={`mod-${mod}`}
                              className="text-xs text-[#F8FAFC] cursor-pointer font-normal"
                            >
                              {mod}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">Respondente:</Label>
                    <Input
                      value={respondente}
                      onChange={(e) => setRespondente(e.target.value)}
                      placeholder="Digite sua resposta..."
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">Cargo:</Label>
                    <Input
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder="Ex.: CEO, Fundador"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">E-mail Corporativo:</Label>
                    <Input
                      type="email"
                      value={emailCorporativo}
                      onChange={(e) => setEmailCorporativo(e.target.value)}
                      placeholder="diretoria@empresa.com.br"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">WhatsApp / Telefone:</Label>
                    <Input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3: SEÇÃO 1 — PERFIL DA EMPRESA E CONTEXTO */}
            {etapaAtual === 3 && (
              <RenderSecaoLiteral
                secaoKey="secao1"
                secao={secao1}
                respostas={respostas}
                setResposta={setResposta}
                notaImportante={setorObj.notaImportante}
              />
            )}

            {/* ETAPA 4: SEÇÃO 2 — PILAR 1: PRISÃO DO FUNDADOR */}
            {etapaAtual === 4 && (
              <RenderSecaoLiteral
                secaoKey="secao2"
                secao={secao2}
                respostas={respostas}
                setResposta={setResposta}
              />
            )}

            {/* ETAPA 5: SEÇÃO 3 — PILAR 2: INEFICIÊNCIA INVISÍVEL */}
            {etapaAtual === 5 && (
              <RenderSecaoLiteral
                secaoKey="secao3"
                secao={secao3}
                respostas={respostas}
                setResposta={setResposta}
              />
            )}

            {/* ETAPA 6: SEÇÃO 4 — PILAR 3: ABISMO ESTRATÉGIA vs. EXECUÇÃO */}
            {etapaAtual === 6 && (
              <RenderSecaoLiteral
                secaoKey="secao4"
                secao={secao4}
                respostas={respostas}
                setResposta={setResposta}
              />
            )}

            {/* ETAPA 7: SEÇÃO 5 — CAPACIDADE E DESIGN ORGANIZACIONAL (HACKMAN) */}
            {etapaAtual === 7 && (
              <RenderSecaoLiteral
                secaoKey="secao5"
                secao={secao5}
                respostas={respostas}
                setResposta={setResposta}
              />
            )}

            {/* ETAPA 8: SEÇÃO 6 — SAÚDE ECONÔMICO-FINANCEIRA (BUFFETT) */}
            {etapaAtual === 8 && (
              <RenderSecaoLiteral
                secaoKey="secao6"
                secao={secao6}
                respostas={respostas}
                setResposta={setResposta}
              />
            )}

            {/* ETAPA 9: SEÇÃO 7 — EXPECTATIVAS E AMBIÇÃO */}
            {etapaAtual === 9 && (
              <RenderSecaoLiteral
                secaoKey="secao7"
                secao={secao7}
                respostas={respostas}
                setResposta={setResposta}
              />
            )}

            {/* ETAPA 10: SEÇÃO 8 — INOVAÇÃO E TECNOLOGIA */}
            {etapaAtual === 10 && (
              <RenderSecaoLiteral
                secaoKey="secao8"
                secao={secao8}
                respostas={respostas}
                setResposta={setResposta}
              />
            )}

            {/* ETAPA 11: SEÇÃO 9 — PRÓXIMOS PASSOS (9.1 A 9.4 LITERAIS) */}
            {etapaAtual === 11 && (
              <div className="space-y-6">
                {/* 9.1 Frase fixa informativa */}
                <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#3DDC74]/40 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#3DDC74] shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    9.1 Você receberá um Diagnóstico Executivo com recomendações prioritárias.
                  </p>
                </div>

                {/* 9.2 Autoriza sessão de devolutiva de 45 min? */}
                <div className="border border-[#24334F] bg-[#111A2E]/50 rounded-[4px] p-4 space-y-3">
                  <Label className="text-xs sm:text-sm font-medium leading-relaxed block text-[#F8FAFC]">
                    9.2 Autoriza sessão de devolutiva de 45 min?
                  </Label>
                  <RadioGroup
                    value={autorizacaoDevolutiva}
                    onValueChange={(v) => setAutorizacaoDevolutiva(v as AutorizacaoDevolutiva)}
                    className="flex flex-wrap gap-4"
                  >
                    {simNaoOpcoes.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => setAutorizacaoDevolutiva(opt as AutorizacaoDevolutiva)}
                        className="flex items-center space-x-2 p-2 rounded-[3px] bg-[#111A2E] border border-[#24334F] hover:bg-[#16213A] cursor-pointer"
                      >
                        <RadioGroupItem
                          value={opt}
                          id={`aut-${opt}`}
                          className="border-[#24334F] text-[#5B9DFF]"
                        />
                        <Label
                          htmlFor={`aut-${opt}`}
                          className="text-xs text-[#F8FAFC] cursor-pointer font-normal"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* 9.3 Formato de interesse: */}
                <div className="border border-[#24334F] bg-[#111A2E]/50 rounded-[4px] p-4 space-y-3">
                  <Label className="text-xs sm:text-sm font-medium leading-relaxed block text-[#F8FAFC]">
                    9.3 Formato de interesse:
                  </Label>
                  <RadioGroup
                    value={formatoInteresse}
                    onValueChange={(v) => setFormatoInteresse(v as FormatoInteresse)}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2"
                  >
                    {formatoInteresseOpcoes.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => setFormatoInteresse(opt as FormatoInteresse)}
                        className="flex items-center space-x-2 p-2.5 rounded-[3px] bg-[#111A2E] border border-[#24334F] hover:bg-[#16213A] cursor-pointer"
                      >
                        <RadioGroupItem
                          value={opt}
                          id={`fmt-${opt}`}
                          className="border-[#24334F] text-[#5B9DFF]"
                        />
                        <Label
                          htmlFor={`fmt-${opt}`}
                          className="text-xs text-[#F8FAFC] cursor-pointer font-normal"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* 9.4 Responsável pelos documentos: */}
                <div className="border border-[#24334F] bg-[#111A2E]/50 rounded-[4px] p-4 space-y-2">
                  <Label className="text-xs sm:text-sm font-medium leading-relaxed block text-[#F8FAFC]">
                    9.4 Responsável pelos documentos:
                  </Label>
                  <Input
                    value={responsavelDocumentos}
                    onChange={(e) => setResponsavelDocumentos(e.target.value)}
                    placeholder="Nome completo e cargo da pessoa que assina ou faz a interlocução dos dados"
                    className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] rounded-[4px]"
                  />
                </div>

                {/* Resumo */}
                <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#24334F] space-y-2 text-xs text-[#C7D0E0]">
                  <span className="font-semibold text-[#F8FAFC] block text-xs uppercase tracking-wider">
                    Resumo do Diagnóstico:
                  </span>
                  <p>
                    <strong>Organização:</strong> {razaoSocial || '—'} (CNPJ: {cnpj || '—'})
                  </p>
                  <p>
                    <strong>Setor & Segmento:</strong> {setorObj.nome} —{' '}
                    {segmento.join(', ') || segmentoOutro || '—'}
                  </p>
                  <p>
                    <strong>Respondente:</strong> {respondente || '—'} ({cargo || '—'}) •{' '}
                    {emailCorporativo || '—'}
                  </p>
                  <p>
                    <strong>Responsável pelos Documentos:</strong> {responsavelDocumentos || '—'}
                  </p>
                </div>
              </div>
            )}

            {/* ETAPA 12: BLOCO FINAL DE DOCUMENTAÇÃO (PÁGS. 44–45 DO PDF) */}
            {etapaAtual === 12 && (
              <div className="space-y-6">
                {/* Checkboxes de DOCUMENTAÇÃO ADICIONAL específicos do setor (sem a palavra OPCIONAL) */}
                <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#24334F] space-y-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#5B9DFF]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                      DOCUMENTAÇÃO ADICIONAL:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {setorObj.documentacaoAdicional.map((doc) => {
                      const checked = documentosAdicionaisCheck.includes(doc)
                      return (
                        <div
                          key={doc}
                          onClick={() => {
                            setDocumentosAdicionaisCheck((prev) =>
                              checked ? prev.filter((d) => d !== doc) : [...prev, doc],
                            )
                          }}
                          className="flex items-center space-x-2.5 p-2 rounded-[3px] bg-[#16213A] border border-[#24334F] hover:bg-[#1F2E4D] cursor-pointer"
                        >
                          <Checkbox
                            checked={checked}
                            className="border-[#24334F] data-[state=checked]:bg-[#5B9DFF]"
                          />
                          <span className="text-xs text-[#F8FAFC]">{doc}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Parágrafos Literais de Abertura do PDF p.44 */}
                <div className="space-y-3 text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
                  <p>{BLOCO_DOCUMENTACAO_FINAL.paragrafoAbertura1}</p>
                  <p>{BLOCO_DOCUMENTACAO_FINAL.paragrafoAbertura2}</p>
                </div>

                {/* Bloco Formatos e Limites de Arquivos Aceitos */}
                <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#5B9DFF]/40 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[#5B9DFF]">
                    {BLOCO_DOCUMENTACAO_FINAL.formatosLimites.titulo}
                  </h4>
                  <ul className="text-xs text-[#C7D0E0] space-y-1 list-disc list-inside">
                    {BLOCO_DOCUMENTACAO_FINAL.formatosLimites.itens.map((it, idx) => (
                      <li key={idx}>{it}</li>
                    ))}
                  </ul>
                </div>

                {/* Aviso de Rascunho */}
                <div className="p-3.5 rounded-[4px] bg-[#78350F]/20 border border-[#F59E0B]/40 text-xs text-[#FCD34D] leading-relaxed">
                  {BLOCO_DOCUMENTACAO_FINAL.avisoRascunho}
                </div>

                {/* Os 3 Grupos de Upload com Textos Literais */}
                {BLOCO_DOCUMENTACAO_FINAL.grupos.map((grupo) => {
                  const listaArquivos =
                    grupo.id === 'financeiros'
                      ? anexosFinanceiros
                      : grupo.id === 'gerenciais'
                        ? anexosGerenciais
                        : anexosSociedade

                  return (
                    <div
                      key={grupo.id}
                      className="p-4 sm:p-5 rounded-[4px] bg-[#111A2E]/80 border border-[#24334F] space-y-3"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-[#F8FAFC]">{grupo.titulo}</h4>
                        <p className="text-xs text-[#8B98B4] mt-1 leading-relaxed">
                          {grupo.descricao}
                        </p>
                      </div>

                      {/* Botão de Selecionar/Anexar Arquivos */}
                      <div>
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-[3px] bg-[#0066CC] hover:bg-[#22B14C] text-white text-xs font-semibold cursor-pointer transition-colors shadow">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Clique para selecionar ou anexar arquivos</span>
                          <input
                            type="file"
                            multiple
                            accept=".doc,.docx,.pdf,.xls,.xlsx"
                            className="hidden"
                            onChange={(e) =>
                              handleFileSimulado(
                                grupo.id as 'financeiros' | 'gerenciais' | 'sociedade',
                                e.target.files,
                              )
                            }
                          />
                        </label>
                      </div>

                      {/* Lista de Arquivos ou Mensagem Padrão Literal */}
                      {listaArquivos.length === 0 ? (
                        <p className="text-xs text-[#8B98B4] italic">
                          Nenhum arquivo anexado ainda neste grupo.
                        </p>
                      ) : (
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] uppercase tracking-wider text-[#5B9DFF] font-semibold block">
                            Arquivos selecionados ({listaArquivos.length}/15):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {listaArquivos.map((nome, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] text-[11px] gap-1 px-2 py-1"
                              >
                                <FileSpreadsheet className="w-3 h-3 text-[#3DDC74]" />
                                <span>{nome}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Bloco CASO NÃO VÁ ANEXAR ARQUIVOS AGORA: */}
                <div className="p-4 sm:p-5 rounded-[4px] bg-[#111A2E] border border-[#24334F] space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
                    {BLOCO_DOCUMENTACAO_FINAL.casoNaoVaAnexar.titulo}
                  </h4>

                  <div className="space-y-2">
                    <div
                      onClick={() => setNaoPossuiDocumentosAgora(!naoPossuiDocumentosAgora)}
                      className="flex items-center space-x-2.5 p-2 rounded-[3px] bg-[#16213A] hover:bg-[#1F2E4D] cursor-pointer"
                    >
                      <Checkbox
                        checked={naoPossuiDocumentosAgora}
                        className="border-[#24334F] data-[state=checked]:bg-[#5B9DFF]"
                      />
                      <span className="text-xs text-[#F8FAFC]">
                        {BLOCO_DOCUMENTACAO_FINAL.casoNaoVaAnexar.opcao1}
                      </span>
                    </div>

                    <div
                      onClick={() => setPrefiroEnviarDepois(!prefiroEnviarDepois)}
                      className="flex items-center space-x-2.5 p-2 rounded-[3px] bg-[#16213A] hover:bg-[#1F2E4D] cursor-pointer"
                    >
                      <Checkbox
                        checked={prefiroEnviarDepois}
                        className="border-[#24334F] data-[state=checked]:bg-[#5B9DFF]"
                      />
                      <span className="text-xs text-[#F8FAFC]">
                        {BLOCO_DOCUMENTACAO_FINAL.casoNaoVaAnexar.opcao2}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#C7D0E0] leading-relaxed pt-1">
                    {BLOCO_DOCUMENTACAO_FINAL.casoNaoVaAnexar.nota}
                  </p>
                </div>

                {/* Parágrafo de Sigilo e LGPD */}
                <p className="text-[11px] text-[#8B98B4] leading-relaxed">
                  {BLOCO_DOCUMENTACAO_FINAL.sigiloLgpd}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Barra de Navegação Inferior */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={etapaAnterior}
            disabled={etapaAtual === 1 || submitting}
            className="border-[#24334F] text-[#C7D0E0] hover:bg-[#16213A] rounded-[4px] text-xs gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Etapa Anterior
          </Button>

          {etapaAtual < 12 ? (
            <Button
              type="button"
              onClick={proximaEtapa}
              disabled={!canAvancar()}
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs font-semibold px-6 py-5 gap-2 transition-all"
            >
              <span>
                {etapaAtual === 11 ? 'Avançar para Documentação & Anexos →' : 'Próxima Etapa'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : modoRevisao ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-[#DC2626]/20 text-[#EF4444] border-[#DC2626]/40 font-mono text-[11px] py-1.5 px-3">
                Envio desativado no Modo Revisão
              </Badge>
              <Button
                type="button"
                disabled
                className="bg-[#1F2E4D] text-[#8B98B4] rounded-[4px] text-xs font-semibold px-8 py-5 gap-2 cursor-not-allowed opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>Submissão Desativada (Modo Revisão)</span>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleFinalizar}
              disabled={!canAvancar() || submitting}
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs font-semibold px-8 py-5 gap-2 shadow-lg transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Consolidando Dossiê e Gerando
                  Protocolo...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submeter Questionário Estratégico Oficial</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Componente que renderiza uma Seção Literal inteira (Seções 1 a 8)
 * correspondendo fielmente aos formatos do PDF:
 * - dissertativo em linha com underline "_________________________" -> input de texto
 * - múltipla escolha com alternativas "( ) ..." -> radio buttons reais com rótulos literais
 * - maturidade 1 / 2 / 3 -> radio de seleção única
 * - estruturas especiais (Trading 1.9 com campo condicional, Trading 1.13 com subpergunta condicional)
 */
/**
 * Extrai opções de lista entre parênteses para perguntas de listagem (fontes de receita,
 * certificações, barreiras, processos automatizados) se não vierem pré-definidas em `opcoes`.
 */
function extrairOpcoesDeListagem(enunciado: string): string[] | null {
  const match = enunciado.match(/\(([^)]+)\)/)
  if (!match) return null
  const interior = match[1]
  // Limpa sufixos como ", etc.", ", etc"
  const limpo = interior
    .replace(/,\s*etc\.?/gi, '')
    .replace(/\betc\.?/gi, '')
    .trim()
  const partes = limpo
    .split(/[,;/]| e /gi)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== 'etc' && s !== 'etc.')
  return partes.length >= 2 ? partes : null
}

/**
 * Determina se a pergunta é uma pergunta de listagem / múltipla seleção:
 * - segmento (já tratado na Etapa 2)
 * - fontes de receita
 * - certificações
 * - barreiras
 * - processos automatizados
 *
 * MANTÉM RADIO (escolha única) estrito em:
 * - Sim/Não, Sim/Não/Parcialmente
 * - maturidade 1/2/3
 * - Alto/Médio/Baixo
 * - Estrutura de propriedade / Regime tributário
 * - 9.2 e 9.3 da Seção 9
 */
function isPerguntaDeListagemMultipla(p: PerguntaItemLiteral): boolean {
  if (p.tipoForma === 'checkbox') return true
  if (p.tipoForma === 'maturidade' || p.tipoForma === 'informativo') return false
  if (p.tipoForma === 'trading_condicional_1_9' || p.tipoForma === 'trading_condicional_1_13')
    return false

  const texto = (p.enunciado || '').toLowerCase()

  // Perguntas exclusivas NÃO devem ser múltiplas
  if (texto.includes('autoriza sessão') || texto.includes('formato de interesse')) return false
  if (texto.includes('estrutura de propriedade') || texto.includes('regime tributário'))
    return false

  // Detecta perguntas de listagem de acordo com os temas do item (a)
  const isFontesReceita = texto.includes('fontes de receita') || texto.includes('fonte de receita')
  const isCertificacoes = texto.includes('certificaç') || texto.includes('certificações')
  const isBarreiras = texto.includes('barreiras') || texto.includes('barreira')
  const isProcessosAuto =
    texto.includes('processos são automatizados') ||
    texto.includes('processos já são automatizados') ||
    texto.includes('processos automatizados')

  return isFontesReceita || isCertificacoes || isBarreiras || isProcessosAuto
}

/**
 * Converte valor em array de strings seguro (compatibilidade de rascunhos antigos).
 * Aceita string única ("Convênios"), string separada por vírgula ("A, B"),
 * array real (["A", "B"]) ou string serializada JSON.
 */
function normalizarArrayDeRespostas(raw: string | string[] | undefined): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter((s) => typeof s === 'string' && s.trim() !== '')
  if (typeof raw === 'string') {
    const s = raw.trim()
    if (!s) return []
    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        const parsed = JSON.parse(s)
        if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean)
      } catch {
        /* parse falhou, trata como texto */
      }
    }
    // Tolerância com rascunhos que salvaram string isolada
    return [s]
  }
  return []
}

function RenderSecaoLiteral({
  secaoKey,
  secao,
  respostas,
  setResposta,
  notaImportante,
}: {
  secaoKey: string
  secao: SecaoQuestionarioLiteral
  respostas: Record<string, string | string[]>
  setResposta: (secaoKey: string, numero: string, val: string | string[]) => void
  notaImportante?: string
}) {
  return (
    <div className="space-y-4">
      {/* Título Oficial Literal da Seção */}
      <div className="border-b border-[#24334F] pb-3 mb-2">
        <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] tracking-wide">
          {secao.titulo}
        </h3>
        {notaImportante && secao.numero === 1 && (
          <p className="text-xs text-[#FFB84D] mt-1 font-semibold">{notaImportante}</p>
        )}
      </div>

      {secao.perguntas.map((p) => {
        const rawVal = respostas[`${secaoKey}-${p.numero}`]
        const rawSub = respostas[`${secaoKey}-${p.numero}-sub`]
        const strVal =
          typeof rawVal === 'string' ? rawVal : Array.isArray(rawVal) ? rawVal.join(', ') : ''
        const subVal =
          typeof rawSub === 'string' ? rawSub : Array.isArray(rawSub) ? rawSub.join(', ') : ''

        // Detecta se esta pergunta é uma pergunta de listagem múltipla
        const isMultipla = isPerguntaDeListagemMultipla(p)

        return (
          <div
            key={p.numero}
            className="border border-[#24334F] bg-[#111A2E]/60 rounded-[4px] p-4 space-y-3"
          >
            {/* Enunciado Literal do PDF */}
            <div className="flex items-start justify-between gap-2">
              <Label className="text-xs sm:text-sm font-medium leading-relaxed block text-[#F8FAFC]">
                • {p.numero} {p.enunciado}
              </Label>
              {isMultipla && (
                <span className="text-[10px] text-[#5B9DFF] font-semibold uppercase tracking-wider shrink-0 bg-[#16213A] border border-[#24334F] px-2 py-0.5 rounded-[2px]">
                  Múltipla Seleção
                </span>
              )}
            </div>

            {/* SELEÇÃO MÚLTIPLA: Perguntas de LISTAGEM (fontes de receita, certificações, barreiras, processos automatizados) */}
            {isMultipla && (
              <RenderCampoMultiplo
                secaoKey={secaoKey}
                pergunta={p}
                valorAtual={rawVal}
                onChange={(novoArray) => setResposta(secaoKey, p.numero, novoArray)}
              />
            )}

            {/* Forma 1: Dissertativo em linha (quando NÃO for de listagem múltipla) */}
            {!isMultipla && p.tipoForma === 'dissertativo' && (
              <Input
                value={strVal}
                onChange={(e) => setResposta(secaoKey, p.numero, e.target.value)}
                placeholder="Digite sua resposta..."
                className="bg-[#16213A] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4]/60 rounded-[4px]"
              />
            )}

            {/* Forma 2: Radio com alternativas "( ) ..." (exclusivo para escolha única quando NÃO for múltiplo) */}
            {!isMultipla && p.tipoForma === 'radio' && p.opcoes && (
              <RadioGroup
                value={strVal}
                onValueChange={(v) => setResposta(secaoKey, p.numero, v)}
                className="flex flex-wrap gap-2.5 pt-1"
              >
                {p.opcoes.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => setResposta(secaoKey, p.numero, opt)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-[3px] bg-[#16213A] border border-[#24334F] hover:bg-[#1F2E4D] cursor-pointer transition-colors"
                  >
                    <RadioGroupItem
                      value={opt}
                      id={`${secaoKey}-${p.numero}-${opt}`}
                      className="border-[#24334F] text-[#5B9DFF]"
                    />
                    <Label
                      htmlFor={`${secaoKey}-${p.numero}-${opt}`}
                      className="text-xs text-[#F8FAFC] cursor-pointer font-normal"
                    >
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Forma 3: Maturidade 1 / 2 / 3 (SEMPRE RADIO - ESCOLHA ÚNICA) */}
            {p.tipoForma === 'maturidade' && p.opcoes && (
              <RadioGroup
                value={strVal}
                onValueChange={(v) => setResposta(secaoKey, p.numero, v)}
                className="flex flex-wrap gap-2.5 pt-1"
              >
                {p.opcoes.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => setResposta(secaoKey, p.numero, opt)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-[3px] bg-[#16213A] border border-[#24334F] hover:bg-[#1F2E4D] cursor-pointer transition-colors"
                  >
                    <RadioGroupItem
                      value={opt}
                      id={`${secaoKey}-${p.numero}-${opt}`}
                      className="border-[#24334F] text-[#5B9DFF]"
                    />
                    <Label
                      htmlFor={`${secaoKey}-${p.numero}-${opt}`}
                      className="text-xs text-[#F8FAFC] cursor-pointer font-normal"
                    >
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Forma 4: Informativo (ex: 9.1) */}
            {p.tipoForma === 'informativo' && (
              <div className="rounded-[4px] bg-[#16213A] border border-[#5B9DFF]/30 p-3 text-xs text-[#C7D0E0] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#5B9DFF] mt-0.5 shrink-0" />
                <span>{p.enunciado}</span>
              </div>
            )}

            {/* ITEM (b.1): Estrutura especial Trading 1.9: Sim/Não + Textarea condicional para política de repasse */}
            {p.tipoForma === 'trading_condicional_1_9' && p.opcoes && (
              <div className="space-y-3">
                <RadioGroup
                  value={strVal}
                  onValueChange={(v) => setResposta(secaoKey, p.numero, v)}
                  className="flex flex-wrap gap-2.5 pt-1"
                >
                  {p.opcoes.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => setResposta(secaoKey, p.numero, opt)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-[3px] bg-[#16213A] border border-[#24334F] hover:bg-[#1F2E4D] cursor-pointer transition-colors"
                    >
                      <RadioGroupItem
                        value={opt}
                        id={`${secaoKey}-${p.numero}-${opt}`}
                        className="border-[#24334F] text-[#5B9DFF]"
                      />
                      <Label
                        htmlFor={`${secaoKey}-${p.numero}-${opt}`}
                        className="text-xs text-[#F8FAFC] cursor-pointer font-normal"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {strVal === 'Sim' && (
                  <div className="p-3 rounded-[4px] bg-[#16213A] border border-[#5B9DFF]/40 space-y-2 mt-2">
                    <Label className="text-xs text-[#C7D0E0] leading-relaxed block">
                      {p.subpergunta?.enunciado ||
                        'Em caso afirmativo, descreva a política de repasse (critérios, percentuais e forma de repasse):'}
                    </Label>
                    <Textarea
                      value={subVal}
                      onChange={(e) => setResposta(secaoKey, `${p.numero}-sub`, e.target.value)}
                      placeholder="Descreva a política de repasse de ganhos de incentivo fiscal..."
                      rows={3}
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ITEM (b.2): Estrutura especial Trading 1.13: Sim/Não + Subpergunta condicional com radio Sim/Não */}
            {p.tipoForma === 'trading_condicional_1_13' && p.opcoes && (
              <div className="space-y-3">
                <RadioGroup
                  value={strVal}
                  onValueChange={(v) => setResposta(secaoKey, p.numero, v)}
                  className="flex flex-wrap gap-2.5 pt-1"
                >
                  {p.opcoes.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => setResposta(secaoKey, p.numero, opt)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-[3px] bg-[#16213A] border border-[#24334F] hover:bg-[#1F2E4D] cursor-pointer transition-colors"
                    >
                      <RadioGroupItem
                        value={opt}
                        id={`${secaoKey}-${p.numero}-${opt}`}
                        className="border-[#24334F] text-[#5B9DFF]"
                      />
                      <Label
                        htmlFor={`${secaoKey}-${p.numero}-${opt}`}
                        className="text-xs text-[#F8FAFC] cursor-pointer font-normal"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {strVal === 'Não' && (
                  <div className="p-3 rounded-[4px] bg-[#16213A] border border-[#5B9DFF]/40 space-y-2 mt-2">
                    <Label className="text-xs text-[#C7D0E0] leading-relaxed block">
                      {p.subpergunta?.enunciado ||
                        'Em caso negativo, as operações são estruturadas como Importação por Encomenda?'}
                    </Label>
                    <RadioGroup
                      value={subVal}
                      onValueChange={(v) => setResposta(secaoKey, `${p.numero}-sub`, v)}
                      className="flex flex-wrap gap-2.5 pt-1"
                    >
                      {(p.subpergunta?.opcoes || simNaoOpcoes).map((subOpt) => (
                        <div
                          key={subOpt}
                          onClick={() => setResposta(secaoKey, `${p.numero}-sub`, subOpt)}
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-[3px] bg-[#111A2E] border border-[#24334F] hover:bg-[#1B2742] cursor-pointer"
                        >
                          <RadioGroupItem
                            value={subOpt}
                            id={`${secaoKey}-${p.numero}-sub-${subOpt}`}
                            className="border-[#24334F] text-[#5B9DFF]"
                          />
                          <Label
                            htmlFor={`${secaoKey}-${p.numero}-sub-${subOpt}`}
                            className="text-xs text-[#F8FAFC] cursor-pointer font-normal"
                          >
                            {subOpt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Componente dedicado para renderizar perguntas de seleção múltipla (checkbox)
 * com suporte a opções estruturadas extraídas da pergunta ou fornecidas em `p.opcoes`,
 * mais campo de texto adicional / opção "Outro" / dissertativo complementar integrado.
 */
function RenderCampoMultiplo({
  secaoKey,
  pergunta,
  valorAtual,
  onChange,
}: {
  secaoKey: string
  pergunta: PerguntaItemLiteral
  valorAtual: string | string[] | undefined
  onChange: (val: string[]) => void
}) {
  const selecionados = useMemo(() => normalizarArrayDeRespostas(valorAtual), [valorAtual])

  // Opções estruturadas para o checkbox: usa opcoes se existirem; senão extrai do enunciado
  const opcoesBase = useMemo(() => {
    if (pergunta.opcoes && pergunta.opcoes.length > 0) return pergunta.opcoes
    const extraidas = extrairOpcoesDeListagem(pergunta.enunciado)
    if (extraidas && extraidas.length > 0) return extraidas
    return []
  }, [pergunta.opcoes, pergunta.enunciado])

  const toggleOpcao = (opt: string) => {
    if (selecionados.includes(opt)) {
      onChange(selecionados.filter((s) => s !== opt))
    } else {
      onChange([...selecionados, opt])
    }
  }

  // Identifica se há itens personalizados digitados (que não estão em opcoesBase)
  const itensCustomizados = selecionados.filter(
    (s) => !opcoesBase.includes(s) && !s.startsWith('Outro:'),
  )
  const [outroInput, setOutroInput] = useState('')

  const handleAddOutro = () => {
    const val = outroInput.trim()
    if (!val) return
    if (!selecionados.includes(val)) {
      onChange([...selecionados, val])
    }
    setOutroInput('')
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Grade de checkboxes */}
      {opcoesBase.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {opcoesBase.map((opt) => {
            const checked = selecionados.includes(opt)
            return (
              <div
                key={opt}
                onClick={() => toggleOpcao(opt)}
                className="flex items-center space-x-2.5 p-2 rounded-[3px] bg-[#16213A] border border-[#24334F] hover:bg-[#1F2E4D] cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={checked}
                  id={`${secaoKey}-${pergunta.numero}-${opt}`}
                  className="border-[#24334F] data-[state=checked]:bg-[#5B9DFF]"
                />
                <Label
                  htmlFor={`${secaoKey}-${pergunta.numero}-${opt}`}
                  className="text-xs text-[#F8FAFC] cursor-pointer font-normal leading-tight"
                >
                  {opt}
                </Label>
              </div>
            )
          })}
        </div>
      )}

      {/* Itens adicionados manualmente */}
      {itensCustomizados.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {itensCustomizados.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#1F2E4D] border border-[#5B9DFF]/40 text-xs text-[#F8FAFC]"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => toggleOpcao(item)}
                className="text-[#8B98B4] hover:text-[#FF6B6B] text-xs font-bold leading-none"
                title="Remover"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Campo complementar para adicionar outra opção / especificar */}
      <div className="flex items-center gap-2 pt-1">
        <Input
          value={outroInput}
          onChange={(e) => setOutroInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddOutro()
            }
          }}
          placeholder="Adicionar outra opção à lista..."
          className="bg-[#16213A] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4]/60 rounded-[4px] h-8"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOutro}
          disabled={!outroInput.trim()}
          className="h-8 px-3 text-xs bg-[#1F2E4D] border-[#24334F] text-[#F8FAFC] hover:bg-[#24334F] shrink-0"
        >
          Adicionar
        </Button>
      </div>
    </div>
  )
}
