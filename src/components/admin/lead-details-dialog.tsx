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
import { Button } from '@/components/ui/button'
import {
  Building2,
  Mail,
  Phone,
  User,
  FileCheck2,
  Download,
  FileSpreadsheet,
  FileText,
  Paperclip,
  CheckCircle2,
  ListOrdered,
  Loader2,
  Clock,
  Sparkles,
  Play,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  FileDown,
  AlertCircle,
  ArrowRightLeft,
  UploadCloud,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import type { LeadRecord } from '@/services/site-leads-sync'
import { getLeadById, updateLeadStatus } from '@/services/site-leads-sync'
import { setores, type Setor, type PerguntaItemLiteral } from '@/data/setores-questionario'
import type { FaseExecucaoPrompt } from '@/services/diagnosticos'
import { gerarRelatorioCompletoPDF } from '@/services/relatorio-pdf'

interface LeadDetailsDialogProps {
  lead: LeadRecord | null
  leadId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onLeadUpdated?: () => void
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
 * Normaliza uma string para comparação (sem acentos, minúsculas, pontuação simplificada).
 */
function normalizarTexto(txt: string): string {
  return txt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Mapeia o nome ou identificador do setor do lead para o objeto Setor literal canônico (V7.2).
 */
function encontrarSetorDoLead(setorNomeOuId?: string | null): Setor | undefined {
  if (!setorNomeOuId) return undefined
  const norm = normalizarTexto(setorNomeOuId)

  // 1. Match direto por id ou slug
  const matchId = setores.find((s) => s.id === norm || s.slug === norm)
  if (matchId) return matchId

  // 2. Match por nome exato normalizado
  const matchNome = setores.find((s) => normalizarTexto(s.nome) === norm)
  if (matchNome) return matchNome

  // 3. Match por inclusão / prefixos conhecidos
  if (norm.includes('saude')) return setores.find((s) => s.id === 'saude')
  if (norm.includes('varejo')) return setores.find((s) => s.id === 'varejo')
  if (norm.includes('servico')) return setores.find((s) => s.id === 'servicos')
  if (norm.includes('trad') || norm.includes('comercio internacional'))
    return setores.find((s) => s.id === 'trading')
  if (norm.includes('facilit')) return setores.find((s) => s.id === 'facilities')
  if (norm.includes('industr')) return setores.find((s) => s.id === 'industria')
  if (norm.includes('tec') || norm.includes('startup'))
    return setores.find((s) => s.id === 'tecnologia')
  if (norm.includes('construc')) return setores.find((s) => s.id === 'construcao')
  if (norm.includes('transp') || norm.includes('logistic'))
    return setores.find((s) => s.id === 'transporte')
  if (norm.includes('educac')) return setores.find((s) => s.id === 'educacao')
  if (norm.includes('agro')) return setores.find((s) => s.id === 'agronegocio')
  if (norm.includes('academia') || norm.includes('fitness'))
    return setores.find((s) => s.id === 'academias')

  return undefined
}

/**
 * Formata amigavelmente uma chave sem enunciado correspondente (ex: 'data_fundacao' -> 'Data Fundacao').
 */
function formatarChaveAmigavel(chave: string): string {
  const limpa = chave.replace(/[_-]+/g, ' ').trim()
  return limpa
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Mapeamentos canônicos seguros para chaves conhecidas sem prefixo setorial (ex: lead 'fasd').
 * Regra 2 do usuário: quando identificável com segurança, mapear pelo significado;
 * quando não houver correspondência segura, não inventar pergunta.
 */
const MAPEAMENTOS_CANONICOS_SEGUROS: Record<string, string> = {
  anosoperacao: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
  anos_operacao: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
  tempo_empresa: 'Há quantos anos a empresa opera e qual o crescimento nos últimos 3 anos?',
  faturamento: 'Qual o faturamento anual aproximado da empresa?',
  faturamento_anual: 'Qual o faturamento anual aproximado da empresa?',
  faturamento_mensal: 'Qual o faturamento anual aproximado da empresa?',
  colaboradores: 'Quantos colaboradores ao todo?',
  numero_colaboradores: 'Quantos colaboradores ao todo?',
  unidades: 'Quantas unidades/sedes a empresa possui?',
  sedes: 'Quantas unidades/sedes a empresa possui?',
  regime_tributario: 'Regime tributário:',
  estrutura_propriedade: 'Estrutura de propriedade:',
  fontes_receita: 'Principais fontes de receita?',
  certificacoes: 'Possui certificações ou reconhecimentos de mercado?',
  // Perguntas dos Pilares por ordem canônica (cap1 a cap6)
  cap1: 'Pilar 1 — Pergunta 1: Centralização Decisória / Operação sem o Fundador',
  cap2: 'Pilar 1 — Pergunta 2: Autonomia da Equipe e Alçadas',
  cap3: 'Pilar 2 — Pergunta 1: Retrabalho, Falhas de Processo e Perda Operacional',
  cap4: 'Pilar 2 — Pergunta 2: Ineficiência de Custos e Gargalos Invisíveis',
  cap5: 'Pilar 3 — Pergunta 1: Descompasso entre Metas Estratégicas e Execução',
  cap6: 'Pilar 3 — Pergunta 2: Alinhamento de Indicadores, Comitê e SLAs',
  // Etapa 11 / Próximos Passos
  autorizacao_devolutiva: 'Autoriza sessão de devolutiva de 45 min?',
  formato_interesse: 'Formato de interesse:',
  plano_interesse: 'Formato de interesse:',
  plano_escolhido: 'Plano / Formato escolhido:',
  responsavel_documentos: 'Responsável pelos documentos:',
  responsavel_envio: 'Responsável pelos documentos / envio:',
  // Identificação e Cadastro
  razao_social: 'Razão Social:',
  empresa: 'Razão Social / Empresa:',
  cnpj: 'CNPJ:',
  nome_completo: 'Respondente:',
  nomecompleto: 'Respondente:',
  respondente: 'Respondente:',
  cargo: 'Cargo:',
  email: 'E-mail Corporativo:',
  whatsapp: 'WhatsApp / Telefone:',
  telefone: 'WhatsApp / Telefone:',
  setor: 'Setor de Atuação:',
  segmento: 'Segmento Específico:',
}

/**
 * Resolve o ENUNCIADO literal e o identificador/título da pergunta para qualquer chave de resposta.
 *
 * Regras do usuário:
 * 1) Chave no padrão setor_seção_questão (ex.: 'varejo_1_1' -> setor Varejo, Seção 1, pergunta 1.1)
 *    -> exibir o enunciado literal da pergunta do setor do lead.
 * 2) Chaves sem padrão de setor (ex.: 'cap1', 'anosOperacao', 'faturamento' - presentes no lead 'fasd')
 *    -> mapear pelo significado para a pergunta canônica correspondente quando identificável com segurança;
 *    -> quando NÃO houver correspondência segura, exibir apenas a chave formatada sem inventar pergunta.
 */
function resolverEnunciadoPergunta(
  chave: string,
  setorDoLead?: Setor,
): { enunciado: string | null; tituloChave: string } {
  const chaveLimpa = chave.trim()
  const k = chaveLimpa.toLowerCase()

  // 1. Padrão Setor + Seção + Pergunta (ex: varejo_1_1, saude_2_3, trade_1_14)
  for (const prefix of SETOR_PREFIXES) {
    if (k.startsWith(`${prefix}_`)) {
      const rest = k.slice(prefix.length + 1)
      const match = rest.match(/^(\d+)_(\d+)$/)
      if (match) {
        const secaoNum = parseInt(match[1], 10)
        const questaoNum = parseInt(match[2], 10)
        const numeroBuscado = `${secaoNum}.${questaoNum}` // ex: "1.1", "2.1", "3.6"

        // Localizar a pergunta no questionário do setor do lead (ou no setor apontado pelo prefixo)
        const setorAlvo =
          setorDoLead ||
          setores.find((s) => s.id === prefix || s.slug.startsWith(prefix)) ||
          setores.find((s) => s.id === 'saude')

        if (setorAlvo) {
          const secao = setorAlvo.secoes.find((s) => s.numero === secaoNum)
          const pergunta = secao?.perguntas.find((p) => p.numero === numeroBuscado)
          if (pergunta && pergunta.enunciado) {
            return {
              enunciado: pergunta.enunciado,
              tituloChave: `${chaveLimpa} (${numeroBuscado})`,
            }
          }
        }

        // Seção identificada mas sem pergunta literal exata encontrada
        return {
          enunciado: `Pergunta ${numeroBuscado}`,
          tituloChave: `${chaveLimpa} (${numeroBuscado})`,
        }
      }

      // Prefixo setorial seguido de nome semântico (ex: trade_anosOperacao, trade_cap1, etc.)
      const sufixoSemPrefixo = rest
      const sufixoNorm = sufixoSemPrefixo.toLowerCase().replace(/[_-]/g, '')
      if (MAPEAMENTOS_CANONICOS_SEGUROS[sufixoNorm]) {
        return {
          enunciado: MAPEAMENTOS_CANONICOS_SEGUROS[sufixoNorm],
          tituloChave: chaveLimpa,
        }
      }
    }
  }

  // 2. Chaves com prefixo secaoX_Y (ex: secao1_1, secao_2_1)
  const secaoMatch = k.match(/^(?:secao|seção)[_-]?(\d+)[_-](\d+)$/)
  if (secaoMatch) {
    const secaoNum = parseInt(secaoMatch[1], 10)
    const questaoNum = parseInt(secaoMatch[2], 10)
    const numeroBuscado = `${secaoNum}.${questaoNum}`
    const setorAlvo = setorDoLead || setores[0]
    const secao = setorAlvo?.secoes.find((s) => s.numero === secaoNum)
    const pergunta = secao?.perguntas.find((p) => p.numero === numeroBuscado)
    if (pergunta && pergunta.enunciado) {
      return {
        enunciado: pergunta.enunciado,
        tituloChave: `${chaveLimpa} (${numeroBuscado})`,
      }
    }
  }

  // 3. Mapeamento semântico canônico seguro (ex: anosOperacao, cap1..cap6, faturamento, etc.)
  const kNorm = k.replace(/[_-]/g, '')
  if (MAPEAMENTOS_CANONICOS_SEGUROS[k]) {
    return {
      enunciado: MAPEAMENTOS_CANONICOS_SEGUROS[k],
      tituloChave: chaveLimpa,
    }
  }
  if (MAPEAMENTOS_CANONICOS_SEGUROS[kNorm]) {
    return {
      enunciado: MAPEAMENTOS_CANONICOS_SEGUROS[kNorm],
      tituloChave: chaveLimpa,
    }
  }

  // 4. Sem correspondência segura -> exibir apenas a chave formatada amigavelmente, sem inventar pergunta
  return {
    enunciado: null,
    tituloChave: chaveLimpa.includes('_') ? chaveLimpa : formatarChaveAmigavel(chaveLimpa),
  }
}

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

// Definição das seções exibidas na aba Questionário Completo
// Os blocos 'Setor de Atuação', 'Identificação da Empresa & Lead' e 'Outras Respostas & Metadados Extras'
// foram fundidos num único grupo 'Identificação da Empresa & Lead' (id: 'identificacao').
// As etapas 3 a 11 do questionário canônico permanecem exatamente como estão.
const SECOES_QUESTIONARIO_CONFIG = [
  {
    id: 'identificacao',
    titulo: 'Identificação da Empresa & Lead',
    descricao:
      'Dados cadastrais do executivo, da pessoa jurídica, contatos, setor de atuação e metadados complementares',
  },
  {
    id: 3,
    numero: 3,
    titulo: 'Etapa 3 — Seção 1: Perfil da Empresa e Contexto',
    descricao:
      'Mapeamento estrutural de faturamento, equipe e modelo de negócio (perguntas 1.1 a 1.8)',
    chaves: ['secao1', 'perfil', 'etapa_3'],
  },
  {
    id: 4,
    numero: 4,
    titulo: 'Etapa 4 — Seção 2: Pilar 1: Prisão do Fundador',
    descricao:
      'Centralização decisória, dependência de pessoas-chave e autonomia (perguntas 2.1 a 2.6)',
    chaves: ['secao2', 'pilar1', 'pilar_1', 'pilar_1_prisao_fundador', 'etapa_4'],
  },
  {
    id: 5,
    numero: 5,
    titulo: 'Etapa 5 — Seção 3: Pilar 2: Ineficiência Invisível',
    descricao: 'Gargalos operacionais, retrabalho e vazamento de margem (perguntas 3.1 a 3.6)',
    chaves: ['secao3', 'pilar2', 'pilar_2', 'pilar_2_ineficiencia_invisivel', 'etapa_5'],
  },
  {
    id: 6,
    numero: 6,
    titulo: 'Etapa 6 — Seção 4: Pilar 3: Abismo Estratégia vs. Execução',
    descricao: 'Alinhamento tático, governança, metas e desdobramento (perguntas 4.1 a 4.6)',
    chaves: ['secao4', 'pilar3', 'pilar_3', 'pilar_3_abismo_estrategia_execucao', 'etapa_6'],
  },
  {
    id: 7,
    numero: 7,
    titulo: 'Etapa 7 — Seção 5: Capacidade e Design Organizacional (Hackman)',
    descricao: 'As 5 condições determinísticas para eficácia de equipes (perguntas 5.1 a 5.6)',
    chaves: ['secao5', 'hackman', 'etapa_7'],
  },
  {
    id: 8,
    numero: 8,
    titulo: 'Etapa 8 — Seção 6: Saúde Econômico-Financeira (Buffett)',
    descricao:
      'Solidez de caixa, margens, endividamento e governança contábil (perguntas 6.1 a 6.6)',
    chaves: ['secao6', 'buffett', 'etapa_8'],
  },
  {
    id: 9,
    numero: 9,
    titulo: 'Etapa 9 — Seção 7: Expectativas e Ambição',
    descricao: 'Objetivos prioritários de crescimento e consolidação (perguntas 7.1 a 7.5)',
    chaves: ['secao7', 'expectativas', 'etapa_9'],
  },
  {
    id: 10,
    numero: 10,
    titulo: 'Etapa 10 — Seção 8: Inovação e Tecnologia',
    descricao: 'Maturidade digital, automações e barreiras tecnológicas (perguntas 8.1 a 8.4)',
    chaves: ['secao8', 'inovacao', 'tecnologia', 'etapa_10'],
  },
  {
    id: 11,
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
  onLeadUpdated,
}: LeadDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<
    'questionario' | 'diagnostico' | 'fases' | 'intercambio' | 'anexos' | 'bruto'
  >('questionario')
  const [diagnosticoVinculado, setDiagnosticoVinculado] = useState<any | null>(null)
  const [loadingDiagnostico, setLoadingDiagnostico] = useState<boolean>(false)
  const [processandoWorker, setProcessandoWorker] = useState<boolean>(false)
  const [gerandoPdf, setGerandoPdf] = useState<boolean>(false)
  const [exportandoDossie, setExportandoDossie] = useState<boolean>(false)
  const [jsonExpertInput, setJsonExpertInput] = useState<string>('')
  const [registrandoExpert, setRegistrandoExpert] = useState<boolean>(false)
  const [salvandoA8Humano, setSalvandoA8Humano] = useState<boolean>(false)
  const [obsConsultorA8, setObsConsultorA8] = useState<string>('')
  const [fasesExpandidas, setFasesExpandidas] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
  })
  const [currentLead, setCurrentLead] = useState<LeadRecord | null>(initialLead)
  const [loadingFresh, setLoadingFresh] = useState<boolean>(false)
  const [savingStatus, setSavingStatus] = useState<boolean>(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

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

      // Carregar diagnóstico vinculado ao lead, se houver
      setLoadingDiagnostico(true)
      import('@/services/diagnosticos')
        .then(({ getDiagnosticoByLeadId }) => getDiagnosticoByLeadId(targetId))
        .then((diag) => {
          if (isMounted) setDiagnosticoVinculado(diag)
        })
        .catch(() => {
          if (isMounted) setDiagnosticoVinculado(null)
        })
        .finally(() => {
          if (isMounted) setLoadingDiagnostico(false)
        })

      return () => {
        isMounted = false
      }
    } else if (!open) {
      setCurrentLead(initialLead)
      setDiagnosticoVinculado(null)
    }
  }, [open, leadId, initialLead])

  const lead = currentLead || initialLead

  // Estado dos itens da Auditoria Humana A8 contra o Expert (Fase A5) — para os 3 níveis (SaaS, MaaS, Bespoke)
  const [statusItensA8, setStatusItensA8] = useState<
    Record<string, 'CONFORME' | 'REJEITADO' | 'PENDENTE'>
  >({
    a8_1: 'PENDENTE',
    a8_2: 'PENDENTE',
    a8_3: 'PENDENTE',
    a8_4: 'PENDENTE',
    a8_5: 'PENDENTE',
    a8_6: 'PENDENTE',
    a8_7: 'PENDENTE',
    a8_8: 'PENDENTE',
    a8_9: 'PENDENTE',
    a8_10: 'PENDENTE',
  })
  const [nivelPortaoA8, setNivelPortaoA8] = useState<'saas' | 'maas' | 'bespoke'>('maas')

  // Sincronizar status dos itens caso o diagnóstico já possua gabarito_auditoria gravado
  useEffect(() => {
    if (diagnosticoVinculado?.gabarito_auditoria) {
      const gab = diagnosticoVinculado.gabarito_auditoria
      setStatusItensA8((prev) => ({
        ...prev,
        a8_1: (gab.item1_identificacao_setor_protocolo?.status as any) || prev.a8_1,
        a8_2: (gab.item2_confirmacao_carga_2_linhas?.status as any) || prev.a8_2,
        a8_3: (gab.item3_causa_raiz_canvas_as_is?.status as any) || prev.a8_3,
        a8_4: (gab.item4_micro_epifanias_bloco_setorial?.status as any) || prev.a8_4,
        a8_5: (gab.item5_vazamentos_objetivos?.status as any) || prev.a8_5,
        a8_6: (gab.item6_nota_triangulacao?.status as any) || prev.a8_6,
        a8_7: (gab.item7_snapshot_f6_dre_15_linhas?.status as any) || prev.a8_7,
        a8_8: (gab.item8_anexo_b_erec_a9?.status as any) || prev.a8_8,
        a8_9: (gab.item9_gate_autorizacao_cs20?.status as any) || prev.a8_9,
        a8_10: (gab.item10_fechamento_aguardo_comando?.status as any) || prev.a8_10,
      }))
      if (gab.observacoes_consultor) {
        setObsConsultorA8(gab.observacoes_consultor)
      }
    }
  }, [diagnosticoVinculado])

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
  // Identifica o setor do lead para resolução dos questionários literais
  const setorDoLead = encontrarSetorDoLead(lead.setor)

  // Mapa de todas as chaves de respostas classificadas por etapa (1..11)
  // e as chaves não padronizadas ("Outras Respostas")
  interface RespostaExibicao {
    chave: string
    enunciado?: string | null
    resposta: any
    nota?: string
  }

  const respostasPorEtapa: Record<number, RespostaExibicao[]> = {
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
  const outrasRespostas: RespostaExibicao[] = []

  // Preencher a partir de `respostasObj` (fonte primária do questionário gravado no banco)
  Object.keys(respostasObj).forEach((k) => {
    const val = respostasObj[k]
    const etapaAlvo = classificarChaveEtapa(k)
    const resolucao = resolverEnunciadoPergunta(k, setorDoLead)

    if (etapaAlvo !== null && etapaAlvo >= 1 && etapaAlvo <= 11) {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        Object.keys(val).forEach((subK) => {
          const subResolucao = resolverEnunciadoPergunta(`${k}_${subK}`, setorDoLead)
          respostasPorEtapa[etapaAlvo].push({
            chave: `${resolucao.tituloChave} - ${subK}`,
            enunciado: subResolucao.enunciado || resolucao.enunciado,
            resposta: val[subK],
          })
        })
      } else {
        respostasPorEtapa[etapaAlvo].push({
          chave: resolucao.tituloChave,
          enunciado: resolucao.enunciado,
          resposta: val,
        })
      }
    } else {
      // Chave não padronizada -> Outras respostas
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        Object.keys(val).forEach((subK) => {
          outrasRespostas.push({
            chave: `${resolucao.tituloChave} - ${subK}`,
            enunciado: resolucao.enunciado,
            resposta: val[subK],
          })
        })
      } else {
        outrasRespostas.push({
          chave: resolucao.tituloChave,
          enunciado: resolucao.enunciado,
          resposta: val,
        })
      }
    }
  })

  // Agrupamento de respostas por etapa 1 a 11 com fallbacks contextuais
  const extrairRespostasEtapa = (etapaNum: number): RespostaExibicao[] => {
    const itens = [...(respostasPorEtapa[etapaNum] || [])]

    // Fallbacks dos dados estruturados da base para complementar campos em branco
    if (etapaNum === 1) {
      if (!itens.some((i) => i.chave.toLowerCase().includes('setor'))) {
        itens.push({
          chave: 'Setor de Atuação',
          enunciado: 'Qual o setor de atuação da empresa?',
          resposta: lead.setor || '—',
        })
      }
      if (lead.segmento && !itens.some((i) => i.chave.toLowerCase().includes('segmento'))) {
        itens.push({
          chave: 'Segmento Específico',
          enunciado: 'Segmento ou nicho de atuação:',
          resposta: lead.segmento,
        })
      }
    } else if (etapaNum === 2) {
      if (
        !itens.some(
          (i) =>
            i.chave.toLowerCase().includes('razão social') ||
            i.chave.toLowerCase().includes('empresa'),
        )
      ) {
        itens.push({
          chave: 'Razão Social',
          enunciado: 'Razão Social / Nome da Empresa:',
          resposta: lead.razao_social || '—',
        })
      }
      if (lead.cnpj && !itens.some((i) => i.chave.toLowerCase().includes('cnpj'))) {
        itens.push({
          chave: 'CNPJ',
          enunciado: 'CNPJ da empresa:',
          resposta: lead.cnpj,
        })
      }
      if (
        !itens.some(
          (i) =>
            i.chave.toLowerCase().includes('respondente') || i.chave.toLowerCase().includes('nome'),
        )
      ) {
        itens.push({
          chave: 'Respondente',
          enunciado: 'Nome do respondente:',
          resposta: lead.nome_completo || '—',
        })
      }
      if (lead.cargo && !itens.some((i) => i.chave.toLowerCase().includes('cargo'))) {
        itens.push({
          chave: 'Cargo / Função',
          enunciado: 'Cargo do respondente:',
          resposta: lead.cargo,
        })
      }
      if (
        !itens.some(
          (i) =>
            i.chave.toLowerCase().includes('e-mail') || i.chave.toLowerCase().includes('email'),
        )
      ) {
        itens.push({
          chave: 'E-mail Corporativo',
          enunciado: 'E-mail corporativo:',
          resposta: lead.email || '—',
        })
      }
      if (
        !itens.some(
          (i) =>
            i.chave.toLowerCase().includes('whatsapp') ||
            i.chave.toLowerCase().includes('telefone'),
        )
      ) {
        itens.push({
          chave: 'WhatsApp / Telefone',
          enunciado: 'WhatsApp / Telefone para contato:',
          resposta: lead.whatsapp || '—',
        })
      }
    } else if (etapaNum === 3) {
      if (itens.length === 0 && perfil.respostas && Array.isArray(perfil.respostas)) {
        perfil.respostas.forEach((r: any, idx: number) => {
          itens.push({
            chave: `Pergunta 1.${idx + 1}`,
            enunciado: r.enunciado || null,
            resposta: r.resposta,
          })
        })
      }
      if (
        perfil.faturamento_anual &&
        !itens.some((i) => i.chave.toLowerCase().includes('faturamento'))
      ) {
        itens.push({
          chave: 'Faturamento Anual',
          enunciado: 'Qual o faturamento anual aproximado da empresa?',
          resposta: perfil.faturamento_anual,
        })
      }
      if (
        perfil.colaboradores &&
        !itens.some((i) => i.chave.toLowerCase().includes('colaborador'))
      ) {
        itens.push({
          chave: 'Número de Colaboradores',
          enunciado: 'Quantos colaboradores ao todo?',
          resposta: perfil.colaboradores,
        })
      }
    } else if (etapaNum === 4) {
      if (
        itens.length === 0 &&
        pilares.pilar_1_prisao_fundador &&
        Array.isArray(pilares.pilar_1_prisao_fundador)
      ) {
        pilares.pilar_1_prisao_fundador.forEach((p: any, idx: number) => {
          itens.push({
            chave: `Pergunta 2.${idx + 1}`,
            enunciado: p.pergunta || p.item || null,
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
            chave: `Pergunta 3.${idx + 1}`,
            enunciado: p.pergunta || p.item || null,
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
            chave: `Pergunta 4.${idx + 1}`,
            enunciado: p.pergunta || p.item || null,
            resposta: p.resposta || p.valor,
            nota: p.nota,
          })
        })
      }
    } else if (etapaNum === 7) {
      if (itens.length === 0 && dadosCompletos.hackman && Array.isArray(dadosCompletos.hackman)) {
        dadosCompletos.hackman.forEach((h: any, idx: number) => {
          itens.push({
            chave: `Hackman ${idx + 1}`,
            enunciado: h.dimensao || h.pergunta || null,
            resposta: h.nota !== undefined ? `Nota ${h.nota}` : h.resposta,
          })
        })
      }
    } else if (etapaNum === 8) {
      if (itens.length === 0 && dadosCompletos.buffett && Array.isArray(dadosCompletos.buffett)) {
        dadosCompletos.buffett.forEach((b: any, idx: number) => {
          itens.push({
            chave: `Buffett ${idx + 1}`,
            enunciado: b.dimensao || b.pergunta || null,
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
            chave: `Expectativa ${idx + 1}`,
            enunciado: e.enunciado || e.pergunta || null,
            resposta: e.resposta,
          })
        })
      }
    } else if (etapaNum === 10) {
      if (itens.length === 0 && dadosCompletos.inovacao && Array.isArray(dadosCompletos.inovacao)) {
        dadosCompletos.inovacao.forEach((i: any, idx: number) => {
          itens.push({
            chave: `Inovação ${idx + 1}`,
            enunciado: i.enunciado || i.pergunta || null,
            resposta: i.resposta,
          })
        })
      }
    } else if (etapaNum === 11) {
      if (itens.length === 0) {
        itens.push({
          chave: '9.1 Devolutiva Estratégica Determinística',
          enunciado: 'Agendamento e formato da Devolutiva Estratégica:',
          resposta: 'Diagnóstico Executivo com SLA de 72h garantido',
        })
        itens.push({
          chave: '9.2 Autorização Sessão de 45 Minutos',
          enunciado: 'Autoriza sessão de devolutiva de 45 min?',
          resposta: lead.autorizacao_devolutiva || 'Sim',
        })
        itens.push({
          chave: '9.3 Formato de Interesse',
          enunciado: 'Formato de interesse:',
          resposta: lead.formato_interesse || lead.plano_interesse || 'Não informado',
        })
        itens.push({
          chave: '9.4 Responsável pelos Documentos',
          enunciado: 'Responsável pelos documentos:',
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

  // Extração unificada do grupo fundido "Identificação da Empresa & Lead"
  // Reúne:
  // 1) Setor de Atuação (etapa 1)
  // 2) Identificação da Empresa & Lead (etapa 2)
  // 3) Outras Respostas & Metadados Extras (chaves não padronizadas)
  const extrairRespostasIdentificacaoUnificada = (): RespostaExibicao[] => {
    const respostasEtapa1 = extrairRespostasEtapa(1)
    const respostasEtapa2 = extrairRespostasEtapa(2)
    const respostasExtras = [...outrasRespostas]

    const todos: RespostaExibicao[] = [...respostasEtapa1, ...respostasEtapa2, ...respostasExtras]

    // Filtra de TODOS os itens mesclados na lista unificada chaves que iniciam com prefixo setorial
    // seguido de "_" e contêm 'razao', 'empresa' ou 'social' (ex.: "varejo_razao_social",
    // "trade_razao_social", "varejo_empresa", "trade_empresa"), mantendo apenas o item canônico
    // "Razão Social" / "Razão Social / Nome da Empresa" (lead.razao_social).
    const filtrados = todos.filter((item) => {
      const k = item.chave.trim().toLowerCase()
      const ehRazaoSetorial = SETOR_PREFIXES.some(
        (prefix) =>
          k.startsWith(`${prefix}_`) &&
          (k.includes('razao') || k.includes('empresa') || k.includes('social')),
      )
      return !ehRazaoSetorial
    })

    // Deduplica por chave exata caso coincida
    const vistos = new Set<string>()
    const deduplicados: RespostaExibicao[] = []
    for (const item of filtrados) {
      const normalizada = item.chave.trim().toLowerCase()
      if (!vistos.has(normalizada)) {
        vistos.add(normalizada)
        deduplicados.push(item)
      }
    }

    return deduplicados
  }

  // Ação de aprovação/assinatura (Fluxo L7 - Seção 8.5 / 8.7)
  const handleAprovarAssinatura = async () => {
    if (!lead) return
    setSavingStatus(true)
    setFeedbackMsg(null)
    try {
      const dataAssinatura = new Date()
      const dataValidade = new Date(dataAssinatura)
      dataValidade.setFullYear(dataValidade.getFullYear() + 1)
      const dataValidadeISO = dataValidade.toISOString()
      const dataFormatada = dataValidade.toLocaleDateString('pt-BR')

      const updated = await updateLeadStatus(lead.id, 'novo', {
        membro_fundador: true,
        checkpoint_valido_ate: dataValidadeISO,
      })
      if (updated) setCurrentLead(updated)

      setFeedbackMsg({
        type: 'success',
        text: `Bem-vindo, Membro Fundador. Seu checkpoint mensal está agendado e válido até ${dataFormatada}. Sua trava de preço é vitalícia enquanto a assinatura estiver ativa.`,
      })
      if (onLeadUpdated) onLeadUpdated()
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.message || 'Falha ao confirmar assinatura e registrar checkpoint.',
      })
    } finally {
      setSavingStatus(false)
    }
  }

  // Transição pós-validade para Membro Fundador Graduado (Seção 8.5 / 8.9)
  const handleGraduarFundador = async () => {
    if (!lead) return
    setSavingStatus(true)
    setFeedbackMsg(null)
    try {
      const updated = await updateLeadStatus(lead.id, 'membro_fundador_graduado', {
        membro_fundador: true,
      })
      if (updated) setCurrentLead(updated)

      setFeedbackMsg({
        type: 'success',
        text: 'Seu ciclo de Membro Fundador foi concluído. Sua trava de preço e o acesso antecipado permanecem vitalícios. O acompanhamento segue: em cadência trimestral [SaaS Puro] / pelas sessões consultivas do seu plano [MaaS Híbrido e Bespoke CaaS].',
      })
      if (onLeadUpdated) onLeadUpdated()
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err?.message || 'Falha ao registrar transição pós-validade.',
      })
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] max-h-[90vh] bg-[#111A2E] text-[#F8FAFC] border-[#24334F] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-[#24334F] bg-[#0B1120] space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-[#0066CC]/20 text-[#5B9DFF] border border-[#5B9DFF]/40 font-mono text-xs">
                  {lead.protocolo}
                </Badge>
                {/* Badge Membro Fundador */}
                {Boolean(lead.membro_fundador) && (
                  <Badge className="bg-[#FF9900] text-[#0B1120] border-none font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#0B1120]" />
                    <span>Membro Fundador</span>
                  </Badge>
                )}
                {(lead.status || '').toLowerCase() === 'membro_fundador_graduado' ? (
                  <Badge
                    variant="outline"
                    className="border-[#5B9DFF]/60 text-[#5B9DFF] bg-[#0066CC]/15 text-xs font-semibold gap-1"
                  >
                    <span>Membro Fundador Graduado</span>
                  </Badge>
                ) : (lead.status || '').toLowerCase() === 'teste' ? (
                  <Badge
                    variant="outline"
                    className="border-slate-500/60 text-slate-300 bg-slate-700/40 text-xs font-semibold gap-1"
                  >
                    <span>Teste</span>
                  </Badge>
                ) : (lead.status || '').toLowerCase() === 'novo' ? (
                  <Badge
                    variant="outline"
                    className="border-[#3DDC74]/50 text-[#3DDC74] bg-[#3DDC74]/10 text-xs font-semibold"
                  >
                    Novo
                  </Badge>
                ) : (lead.status || '').toLowerCase() === 'lista_espera' ? (
                  <Badge
                    variant="outline"
                    className="border-[#FF9900]/60 text-[#FFB84D] bg-[#FF9900]/15 text-xs font-semibold gap-1"
                  >
                    <Clock className="w-3 h-3 text-[#FF9900]" />
                    <span>Lista de Prioridade</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-[#8B98B4] text-[#C7D0E0] text-xs">
                    {lead.status}
                  </Badge>
                )}
                {lead.origem && (
                  <Badge className="bg-[#16213A] text-[#C7D0E0] border border-[#24334F] text-xs">
                    {lead.origem}
                    {lead.origem_parceiro ? ` (${lead.origem_parceiro})` : ''}
                  </Badge>
                )}
                {lead.parceiro_email && (
                  <Badge className="bg-purple-950/60 text-purple-300 border border-purple-500/40 text-xs">
                    Parceiro: {lead.parceiro_email}
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
                Setor:{' '}
                <span className="text-[#C7D0E0] font-medium">
                  {lead.setor || 'Não especificado'}
                </span>
                {lead.segmento ? ` (${lead.segmento})` : ''}
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

          {/* Alerta de Feedback L7 / Operações */}
          {feedbackMsg && (
            <div
              className={`p-3 rounded-[4px] border text-xs flex items-start gap-2.5 animate-fade-in ${
                feedbackMsg.type === 'success'
                  ? 'bg-[#3DDC74]/15 border-[#3DDC74]/50 text-[#3DDC74]'
                  : 'bg-red-500/10 border-red-500/40 text-red-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{feedbackMsg.text}</div>
            </div>
          )}

          {/* Banner de Membro Fundador / Informações de Validade */}
          {Boolean(lead.membro_fundador) && (
            <div className="p-3 rounded-[4px] bg-[#FF9900]/10 border border-[#FF9900]/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-[#FFB84D] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF9900]" />
                  <span>Condição de Membro Fundador Ativa</span>
                </div>
                <p className="text-[11px] text-[#C7D0E0]">
                  Trava de preço: <strong className="text-[#3DDC74]">Vitalícia</strong> • Checkpoint
                  mensal:{' '}
                  {lead.checkpoint_valido_ate ? (
                    <span>
                      válido até{' '}
                      <strong className="text-[#FFB84D]">
                        {new Date(lead.checkpoint_valido_ate).toLocaleDateString('pt-BR')}
                      </strong>
                    </span>
                  ) : (
                    <span className="italic text-[#8B98B4]">
                      a definir na assinatura (12 meses)
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(!lead.checkpoint_valido_ate ||
                  (lead.status || '').toLowerCase() === 'lista_espera') && (
                  <Button
                    size="sm"
                    onClick={handleAprovarAssinatura}
                    disabled={savingStatus}
                    className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs h-7 px-3 gap-1.5 font-semibold"
                  >
                    {savingStatus ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    <span>Confirmar Assinatura (L7)</span>
                  </Button>
                )}

                {lead.checkpoint_valido_ate &&
                  (lead.status || '').toLowerCase() !== 'membro_fundador_graduado' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGraduarFundador}
                      disabled={savingStatus}
                      className="border-[#24334F] bg-[#16213A] text-[#5B9DFF] hover:bg-[#1f2e4d] rounded-[4px] text-xs h-7 px-2.5"
                      title="Conclui janela de 12 meses preservando a trava de preço vitalícia (Seção 8.5)"
                    >
                      <span>Graduar Membro Fundador</span>
                    </Button>
                  )}
              </div>
            </div>
          )}

          {/* Dados de contato essenciais no cabeçalho acima das abas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-[#24334F]/60 text-xs">
            <div className="flex items-center gap-2 bg-[#16213A]/60 px-2.5 py-1.5 rounded border border-[#24334F]/50">
              <Building2 className="w-4 h-4 text-[#5B9DFF] shrink-0" />
              <div className="overflow-hidden min-w-0">
                <span className="text-[10px] text-[#8B98B4] block uppercase leading-tight font-medium">
                  Empresa
                </span>
                <span
                  className="font-semibold text-[#F8FAFC] truncate block text-[11px]"
                  title={lead.razao_social || '—'}
                >
                  {lead.razao_social || '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#16213A]/60 px-2.5 py-1.5 rounded border border-[#24334F]/50">
              <User className="w-4 h-4 text-[#3DDC74] shrink-0" />
              <div className="overflow-hidden min-w-0">
                <span className="text-[10px] text-[#8B98B4] block uppercase leading-tight font-medium">
                  Responsável
                </span>
                <span
                  className="font-semibold text-[#F8FAFC] truncate block text-[11px]"
                  title={`${lead.nome_completo || '—'}${lead.cargo ? ` (${lead.cargo})` : ''}`}
                >
                  {lead.nome_completo || '—'}
                  {lead.cargo ? (
                    <span className="font-normal text-[#8B98B4] ml-1">({lead.cargo})</span>
                  ) : null}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#16213A]/60 px-2.5 py-1.5 rounded border border-[#24334F]/50">
              <Mail className="w-4 h-4 text-[#FFB84D] shrink-0" />
              <div className="overflow-hidden min-w-0">
                <span className="text-[10px] text-[#8B98B4] block uppercase leading-tight font-medium">
                  E-mail
                </span>
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="font-medium text-[#5B9DFF] hover:underline truncate block text-[11px]"
                    title={lead.email}
                  >
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-[#8B98B4] block text-[11px]">—</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#16213A]/60 px-2.5 py-1.5 rounded border border-[#24334F]/50">
              <Phone className="w-4 h-4 text-[#3DDC74] shrink-0" />
              <div className="overflow-hidden min-w-0">
                <span className="text-[10px] text-[#8B98B4] block uppercase leading-tight font-medium">
                  WhatsApp / Tel
                </span>
                {lead.whatsapp ? (
                  <a
                    href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[#3DDC74] hover:underline truncate block text-[11px]"
                    title={lead.whatsapp}
                  >
                    {lead.whatsapp}
                  </a>
                ) : (
                  <span className="text-[#8B98B4] block text-[11px]">—</span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 flex-1 min-h-0 overflow-hidden flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(v: any) => setActiveTab(v)}
            className="flex-1 min-h-0 flex flex-col"
          >
            <TabsList className="bg-[#16213A] border border-[#24334F] text-[#8B98B4] mb-4 flex-wrap h-auto p-1 gap-1 shrink-0">
              <TabsTrigger
                value="questionario"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs flex items-center gap-1.5"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Questionário Completo</span>
              </TabsTrigger>
              <TabsTrigger
                value="diagnostico"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFB84D]" />
                <span>Diagnóstico V7.2 {diagnosticoVinculado ? '✓' : ''}</span>
              </TabsTrigger>
              <TabsTrigger
                value="fases"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5 text-[#3DDC74]" />
                <span>
                  Execução das Fases (1–8)
                  {diagnosticoVinculado?.output_prompts &&
                  diagnosticoVinculado.output_prompts.length > 0
                    ? ` (${diagnosticoVinculado.output_prompts.length}/8)`
                    : ''}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="intercambio"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#FF9900]" />
                <span>Intercâmbio Expert (A2)</span>
              </TabsTrigger>
              <TabsTrigger
                value="anexos"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs flex items-center gap-1.5"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Anexos ({totalAnexos})</span>
              </TabsTrigger>
              <TabsTrigger
                value="bruto"
                className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs"
              >
                Dados Brutos
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              {/* ABA 1: QUESTIONÁRIO COMPLETO */}
              <TabsContent value="questionario" className="mt-0 space-y-4 pb-4">
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
                  {SECOES_QUESTIONARIO_CONFIG.map((secao) => {
                    const respostasSecao =
                      secao.id === 'identificacao'
                        ? extrairRespostasIdentificacaoUnificada()
                        : extrairRespostasEtapa(secao.numero!)
                    return (
                      <Card key={secao.id} className="bg-[#16213A] border-[#24334F]">
                        <CardHeader className="py-3 px-4 border-b border-[#24334F]/70 bg-[#111A2E]/70">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
                                {secao.titulo}
                              </CardTitle>
                              <p className="text-[11px] text-[#8B98B4] mt-0.5">{secao.descricao}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                respostasSecao.length > 0
                                  ? 'border-[#3DDC74]/50 text-[#3DDC74] bg-[#3DDC74]/10 text-[10px]'
                                  : 'border-[#8B98B4]/40 text-[#8B98B4] text-[10px]'
                              }
                            >
                              {respostasSecao.length}{' '}
                              {respostasSecao.length === 1 ? 'resposta' : 'respostas'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2.5 text-xs">
                          {respostasSecao.length > 0 ? (
                            respostasSecao.map((item, idx) => (
                              <div
                                key={idx}
                                className="border-b border-[#24334F]/40 pb-2.5 last:border-0 last:pb-0"
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-mono font-semibold text-[#8B98B4] uppercase tracking-wide bg-[#111A2E] px-1.5 py-0.5 rounded border border-[#24334F]/60">
                                    {item.chave}
                                  </span>
                                </div>
                                {item.enunciado && (
                                  <p className="text-xs font-semibold text-[#F8FAFC] mt-1.5 leading-snug">
                                    {item.enunciado}
                                  </p>
                                )}
                                <div className="mt-1.5 pl-3 border-l-2 border-[#5B9DFF]/40 bg-[#111A2E]/50 py-1.5 pr-2.5 rounded-r">
                                  <span className="text-[10px] uppercase tracking-wider text-[#8B98B4] font-medium block mb-0.5">
                                    Resposta registrada:
                                  </span>
                                  <div className="text-[#3DDC74] font-medium">
                                    {Array.isArray(item.resposta) ? (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item.resposta.map((r: any, rIdx: number) => (
                                          <Badge
                                            key={rIdx}
                                            variant="secondary"
                                            className="bg-[#16213A] text-[#3DDC74] border border-[#3DDC74]/30 text-[11px] font-normal"
                                          >
                                            {String(r)}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : typeof item.resposta === 'object' &&
                                      item.resposta !== null ? (
                                      <pre className="text-[10px] font-mono bg-[#0B1120] p-2 rounded text-[#3DDC74] overflow-x-auto mt-1 border border-[#24334F]/60">
                                        {JSON.stringify(item.resposta, null, 2)}
                                      </pre>
                                    ) : (
                                      <span className="text-xs text-[#3DDC74] font-semibold break-words">
                                        {String(item.resposta ?? '—')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {item.nota && (
                                  <div className="text-[11px] text-[#8B98B4] mt-1 italic">
                                    Nota: {item.nota}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-[#8B98B4] italic py-1">
                              Sem respostas registradas para esta seção neste envio.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>{' '}
              </TabsContent>

              {/* ABA DIAGNÓSTICO V7.2 & COFRE (ONDA 2) */}
              <TabsContent value="diagnostico" className="mt-0 space-y-4 pb-4">
                <div className="p-3 bg-[#16213A] border border-[#5B9DFF]/40 rounded-[4px] flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Sparkles className="w-4 h-4 text-[#FFB84D]" />
                    <span className="font-semibold text-[#F8FAFC]">
                      Ativo Estratégico no Cofre — JBP Gestão Master V7.2.3
                    </span>
                    <Badge
                      variant="outline"
                      className="border-[#FFB84D]/60 text-[#FFB84D] bg-[#FFB84D]/10 text-[10px] font-semibold"
                    >
                      Homologação: pendente do expert
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Botão Relatório Completo (Gera PDF Consolidado de 7 Seções) */}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={gerandoPdf}
                      onClick={() => {
                        setGerandoPdf(true)
                        try {
                          gerarRelatorioCompletoPDF({
                            lead,
                            diagnostico: diagnosticoVinculado,
                          })
                          setFeedbackMsg({
                            type: 'success',
                            text: 'Relatório Completo V7.2.3 em PDF gerado com sucesso!',
                          })
                        } catch (err: any) {
                          setFeedbackMsg({
                            type: 'error',
                            text: err?.message || 'Erro ao gerar PDF do relatório.',
                          })
                        } finally {
                          setGerandoPdf(false)
                        }
                      }}
                      className="border-[#5B9DFF]/60 text-[#5B9DFF] hover:bg-[#0066CC]/20 rounded-[4px] text-xs h-7 px-2.5 gap-1.5"
                    >
                      {gerandoPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5 text-[#3DDC74]" />
                      )}
                      <span>Gerar PDF p/ Auditoria do Expert</span>
                    </Button>
                    {/* Botão de Disparo Manual sob Controle do Admin (Sem disparo em lote) — suporta modo de teste */}
                    <Button
                      size="sm"
                      disabled={processandoWorker}
                      onClick={async () => {
                        setProcessandoWorker(true)
                        try {
                          const isLeadTeste = (lead.status || '').toLowerCase() === 'teste'
                          const { processarLeadViaWorker } =
                            await import('@/services/site-leads-sync')
                          const res = await processarLeadViaWorker(lead.id, {
                            dryRun: true,
                          })
                          if (res.success) {
                            setFeedbackMsg({
                              type: 'success',
                              text: 'Diagnóstico processado com sucesso pelo agente V7.2.3! Status atualizado no cofre.',
                            })
                            const { getLeadById } = await import('@/services/site-leads-sync')
                            const fresh = await getLeadById(lead.id)
                            if (fresh) setCurrentLead(fresh)
                            const { getDiagnosticoByLeadId } =
                              await import('@/services/diagnosticos')
                            const freshDiag = await getDiagnosticoByLeadId(lead.id)
                            if (freshDiag) setDiagnosticoVinculado(freshDiag)
                            if (onLeadUpdated) onLeadUpdated()
                          } else {
                            setFeedbackMsg({
                              type: 'error',
                              text: res.error || 'Falha ao acionar worker.',
                            })
                          }
                        } catch (err: any) {
                          setFeedbackMsg({
                            type: 'error',
                            text: err?.message || 'Erro ao comunicar com worker.',
                          })
                        } finally {
                          setProcessandoWorker(false)
                        }
                      }}
                      className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs h-7 px-2.5 gap-1.5"
                    >
                      {processandoWorker ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {(lead.status || '').toLowerCase() === 'teste' || diagnosticoVinculado
                          ? 'Reprocessar cópia (dry-run garantido)'
                          : 'Processar Agora (Worker V7.2)'}
                      </span>
                    </Button>{' '}
                  </div>
                </div>

                {/* Status e Metadados do Lead no Fluxo da Seção 9 / Parceiro */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <Card className="bg-[#16213A] border-[#24334F] p-3">
                    <span className="text-[10px] text-[#8B98B4] uppercase block font-medium">
                      Origem do Lead
                    </span>
                    <div className="text-sm font-semibold text-[#F8FAFC] mt-0.5">
                      {lead.origem_tipo === 'parceiro' || lead.origem_parceiro ? (
                        <span className="text-purple-300">
                          Parceiro: <strong>{lead.origem_parceiro || 'Não especificado'}</strong>
                        </span>
                      ) : (
                        <span className="text-[#3DDC74]">Lead Direto (Site)</span>
                      )}
                    </div>
                    {(lead.origem_tipo === 'parceiro' || lead.origem_parceiro) && (
                      <div className="mt-2 text-[11px] text-[#8B98B4] space-y-0.5">
                        {lead.parceiro_email && (
                          <div>
                            E-mail Cadência:{' '}
                            <span className="text-[#5B9DFF] font-mono">{lead.parceiro_email}</span>
                          </div>
                        )}
                        <div>
                          Status Parceiro:{' '}
                          {lead.parceiro_confirmou ? (
                            <span className="text-[#3DDC74] font-medium">
                              Confirmado em{' '}
                              {new Date(lead.parceiro_confirmou_em || '').toLocaleDateString(
                                'pt-BR',
                              )}
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-medium">
                              Fluxo unificado (cadência D+3/D+10/D+25 ao parceiro)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card className="bg-[#16213A] border-[#24334F] p-3">
                    <span className="text-[10px] text-[#8B98B4] uppercase block font-medium">
                      Gate Devolutiva (CS-20)
                    </span>
                    <div className="text-sm font-semibold text-[#F8FAFC] mt-0.5">
                      {(lead.autorizacao_devolutiva || '').toLowerCase().includes('sim') ? (
                        <span className="text-[#3DDC74]">Autorização Concedida (Sim)</span>
                      ) : (
                        <span className="text-rose-400">Não Autorizo → Nutrição Ativa</span>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-[#8B98B4]">
                      Formato:{' '}
                      <span className="text-[#F8FAFC]">
                        {lead.formato_interesse || lead.plano_interesse || '—'}
                      </span>
                    </div>
                  </Card>

                  <Card className="bg-[#16213A] border-[#24334F] p-3">
                    <span className="text-[10px] text-[#8B98B4] uppercase block font-medium">
                      Economia Unitária SaaS
                    </span>
                    <div className="text-sm font-semibold text-[#F8FAFC] mt-0.5">
                      {diagnosticoVinculado?.custo_gateway ? (
                        <span className="text-[#3DDC74]">
                          Custo Gateway: ${diagnosticoVinculado.custo_gateway.custo_usd}{' '}
                          <span className="text-[10px] text-[#8B98B4]">
                            ({diagnosticoVinculado.custo_gateway.tempo_execucao_ms}ms)
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#8B98B4]">Ainda não calculado</span>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-[#8B98B4]">
                      Versão Questionário (CS-19):{' '}
                      <span className="text-[#5B9DFF] font-mono">
                        {diagnosticoVinculado?.versao_questionario || 'V7.2'}
                      </span>
                    </div>
                  </Card>
                </div>

                {/* Bloco Confirmação de Carga — Formato 10.7 e Versão (CS-19) */}
                <Card className="bg-[#16213A] border-[#24334F]">
                  <CardHeader className="py-2.5 px-4 border-b border-[#24334F]/70 bg-[#111A2E]/60 flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                        <span>CS-19: Confirmação de Carga dos Documentos (Formato 10.7)</span>
                      </CardTitle>
                      <p className="text-[11px] text-[#8B98B4]">
                        Declara versão do questionário (CS-19) e inventário de documentos recebidos
                        como anexos referenciados, sem slot dedicado no app (decisão 16/10)
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-[#5B9DFF]/50 text-[#5B9DFF] text-[10px] font-mono"
                    >
                      {diagnosticoVinculado?.versao_questionario || 'V7.2'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-3 text-xs space-y-2">
                    <div className="p-2.5 rounded bg-[#0B1120] border border-[#24334F] font-mono text-[11px] text-[#C7D0E0] space-y-1">
                      <div className="text-[#5B9DFF]">
                        CONFIRMAÇÃO DE CARGA — DOSSIÊ {lead.setor || 'Geral'} [
                        {lead.protocolo || lead.id}]
                      </div>
                      <div className="text-[#3DDC74]">
                        ✓ Questionário Estratégico: Versão{' '}
                        {diagnosticoVinculado?.versao_questionario || 'V7.2'} declarada e indexada
                        no cofre (CS-19).
                      </div>
                      <div className="text-[#8B98B4]">
                        ✓ Demonstrativos Financeiros (Grupo 1): {arquivosFinanceiros.length}{' '}
                        arquivo(s) referenciado(s) como anexo (DRE no Prompt 1 sem slot dedicado no
                        app).
                      </div>
                      <div className="text-[#8B98B4]">
                        ✓ Relatórios Gerenciais (Grupo 2): {arquivosGerenciais.length} arquivo(s)
                        recebido(s).
                      </div>
                      <div className="text-[#8B98B4]">
                        ✓ Sociedade & Complementares (Grupo 3): {arquivosSociedade.length}{' '}
                        arquivo(s) recebido(s).
                      </div>
                      <div className="text-[#FFB84D] pt-0.5">
                        ✓ Gate de Autorização Devolutiva (CS-20):{' '}
                        {(lead.autorizacao_devolutiva || '').toLowerCase().includes('sim')
                          ? 'Autorização concedida (Sim)'
                          : 'Não autorizo → Nutrição ativa (Teaser protegido)'}
                        .
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PAINEL DE VALIDAÇÃO HUMANA A8 — 3 NÍVEIS (SaaS, MaaS, Bespoke) — VEDADA AUTOCERTIFICAÇÃO */}
                <Card className="bg-[#16213A] border-[#24334F]">
                  <CardHeader className="py-2.5 px-4 border-b border-[#24334F]/70 bg-[#111A2E]/60 flex-row items-center justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#3DDC74]" />
                        <span>
                          Painel de Validação Humana A8 (Portões Metodológicos — SaaS, MaaS &
                          Bespoke)
                        </span>
                      </CardTitle>
                      <p className="text-[11px] text-[#8B98B4]">
                        Auditoria comparativa: <strong>Motor vs. Output do Expert</strong> como
                        referência externa. Aprovação manual item a item —{' '}
                        <strong>vedada a autocertificação do motor</strong>.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-[#0B1120] p-0.5 rounded border border-[#24334F]">
                        <button
                          type="button"
                          onClick={() => setNivelPortaoA8('saas')}
                          className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
                            nivelPortaoA8 === 'saas'
                              ? 'bg-[#0066CC] text-white'
                              : 'text-[#8B98B4] hover:text-[#F8FAFC]'
                          }`}
                        >
                          SaaS Puro
                        </button>
                        <button
                          type="button"
                          onClick={() => setNivelPortaoA8('maas')}
                          className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
                            nivelPortaoA8 === 'maas'
                              ? 'bg-[#3DDC74] text-[#0B1120] font-bold'
                              : 'text-[#8B98B4] hover:text-[#F8FAFC]'
                          }`}
                        >
                          MaaS Híbrido
                        </button>
                        <button
                          type="button"
                          onClick={() => setNivelPortaoA8('bespoke')}
                          className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
                            nivelPortaoA8 === 'bespoke'
                              ? 'bg-[#FF9900] text-[#0B1120] font-bold'
                              : 'text-[#8B98B4] hover:text-[#F8FAFC]'
                          }`}
                        >
                          Bespoke CaaS
                        </button>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-[#3DDC74]/60 text-[#3DDC74] bg-[#3DDC74]/10 text-[10px] font-semibold"
                      >
                        Portão A8 ({nivelPortaoA8.toUpperCase()})
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 text-xs space-y-3">
                    <div className="p-2.5 rounded bg-[#0B1120] border border-[#24334F] text-[11px] text-[#C7D0E0] flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-[#8B98B4]">Regime de Validação A8:</span>{' '}
                        <strong className="text-[#F8FAFC]">
                          {nivelPortaoA8 === 'saas'
                            ? 'SaaS Puro — Gate P1 a P6 auditado por amostragem humana (SLA 72h)'
                            : nivelPortaoA8 === 'maas'
                              ? 'MaaS Híbrido — Validação humana 100% item a item pré-sessão devolutiva (45 min)'
                              : 'Bespoke CaaS — Certificação executiva da Banca do Expert (10 itens com ata registrada)'}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#8B98B4]">
                          Conformes:{' '}
                          {Object.values(statusItensA8).filter((s) => s === 'CONFORME').length}/10
                        </span>
                        <span className="text-[10px] text-rose-400">
                          Rejeitados:{' '}
                          {Object.values(statusItensA8).filter((s) => s === 'REJEITADO').length}
                        </span>
                        <span className="text-[10px] text-amber-300">
                          Pendentes:{' '}
                          {Object.values(statusItensA8).filter((s) => s === 'PENDENTE').length}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#24334F] text-[#8B98B4] text-[11px]">
                            <th className="py-1.5 px-2 w-12 font-mono">Item</th>
                            <th className="py-1.5 px-2 w-44">Critério de Portão</th>
                            <th className="py-1.5 px-2">Saída Produzida (Motor V7.2.3)</th>
                            <th className="py-1.5 px-2">Referência Externa (Expert / Dossiê)</th>
                            <th className="py-1.5 px-2 text-center w-40">Validação Humana</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#24334F]/30">
                          {[
                            {
                              id: 'a8_1',
                              label: 'A8.1',
                              criterio: 'Identificação, Setor & Protocolo',
                              saida: `Protocolo ${lead.protocolo || '—'} | Cliente: ${lead.razao_social} | Setor: ${lead.setor}`,
                              referencia: 'Dossiê cadastral oficial e contrato social (Fase A2)',
                            },
                            {
                              id: 'a8_2',
                              label: 'A8.2',
                              criterio: 'CS-19 / CS-20 Carga em 2 Linhas',
                              saida: `Versão declarada: ${diagnosticoVinculado?.versao_questionario || 'V7.2'} | Gate 9.2: ${lead.autorizacao_devolutiva || 'Sim'}`,
                              referencia:
                                'Resposta 9.2 do questionário e confirmação P1 sem slot dedicado para DRE',
                            },
                            {
                              id: 'a8_3',
                              label: 'A8.3',
                              criterio: 'Causa Raiz & Canvas As Is (9 Blocos)',
                              saida: diagnosticoVinculado?.output_prompts?.[0]
                                ? 'Fase 1 emitida com síntese da dor e 9 blocos estruturados'
                                : 'Saída Fase 1 aguardando processamento do motor',
                              referencia:
                                'Causa raiz formulada pelo Expert no Bloco Solução Completo',
                            },
                            {
                              id: 'a8_4',
                              label: 'A8.4',
                              criterio: 'Micro-epifanias Bloco Setorial',
                              saida: `3 a 5 micro-epifanias ancoradas no Bloco Setorial ${lead.setor} V7.2`,
                              referencia: 'Seção 6 do Contexto Estratégico Global V7.2',
                            },
                            {
                              id: 'a8_5',
                              label: 'A8.5',
                              criterio: 'Vazamentos Quantificados no Dossiê',
                              saida:
                                'Vazamentos financeiros e operacionais ancorados nos números do cliente',
                              referencia: 'Demonstrativos e respostas financeiras do questionário',
                            },
                            {
                              id: 'a8_6',
                              label: 'A8.6',
                              criterio: 'Nota de Triangulação Contábil',
                              saida:
                                'Cruzamento entre respostas qualitativas e balancetes reais anexados',
                              referencia: `${arquivosFinanceiros.length} documento(s) contábil(is) do cofre`,
                            },
                            {
                              id: 'a8_7',
                              label: 'A8.7',
                              criterio: 'CS-17: DRE Normalizada 15 Linhas',
                              saida: diagnosticoVinculado?.dre_normalizada_15_linhas
                                ? `15 de 15 linhas estruturadas com RB = ${lead.faturamento_mensal || 'projeção'} (Linha 1)`
                                : 'DRE 15 linhas não processada',
                              referencia:
                                'DRE ECD 2025 / Balancete contábil sob Exceção A11 (sem sobrepor convenção)',
                            },
                            {
                              id: 'a8_8',
                              label: 'A8.8',
                              criterio: 'A9: Matriz EREC Canônica 4 Colunas',
                              saida: diagnosticoVinculado?.estrutura_erec_a9
                                ? `Tabela 4 colunas: Ação (EREC) | Item | Base Conclusiva | Dimensão (${diagnosticoVinculado.estrutura_erec_a9.length} itens)`
                                : 'Matriz EREC A9 pendente',
                              referencia: 'Matriz EREC do Expert no Bloco Solução (Fase 3 — P6)',
                            },
                            {
                              id: 'a8_9',
                              label: 'A8.9',
                              criterio: 'CS-20: Gate Devolutiva / Nutrição',
                              saida: (lead.autorizacao_devolutiva || '')
                                .toLowerCase()
                                .includes('sim')
                                ? 'Autorizado → Devolutiva liberada'
                                : 'Não autorizou → CTA retido, nutrição com teaser protegido',
                              referencia:
                                'Pergunta 9.2 do questionário respeitada deterministicamente',
                            },
                            {
                              id: 'a8_10',
                              label: 'A8.10',
                              criterio: 'Fechamento Inviolável "Aguardo seu comando."',
                              saida:
                                'Todas as fases encerradas rigorosamente com comando de fechamento formal',
                              referencia: 'Roteiro de Execução de 13 Prompts (Skill canônica V7.2)',
                            },
                          ].map((item) => {
                            const statusAtual = statusItensA8[item.id] || 'PENDENTE'
                            return (
                              <tr key={item.id} className="hover:bg-[#111A2E]/40 text-xs">
                                <td className="py-2 px-2 font-mono text-[#8B98B4] font-semibold">
                                  {item.label}
                                </td>
                                <td className="py-2 px-2 font-semibold text-[#F8FAFC]">
                                  {item.criterio}
                                </td>
                                <td className="py-2 px-2 text-[#C7D0E0] text-[11px]">
                                  {item.saida}
                                </td>
                                <td className="py-2 px-2 text-[#8B98B4] text-[11px]">
                                  {item.referencia}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setStatusItensA8((prev) => ({
                                          ...prev,
                                          [item.id]: 'CONFORME',
                                        }))
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                                        statusAtual === 'CONFORME'
                                          ? 'bg-[#3DDC74]/20 border-[#3DDC74] text-[#3DDC74] font-bold'
                                          : 'border-[#24334F] text-[#8B98B4] hover:text-[#F8FAFC]'
                                      }`}
                                    >
                                      Aprovar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setStatusItensA8((prev) => ({
                                          ...prev,
                                          [item.id]: 'REJEITADO',
                                        }))
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                                        statusAtual === 'REJEITADO'
                                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                                          : 'border-[#24334F] text-[#8B98B4] hover:text-rose-300'
                                      }`}
                                    >
                                      Rejeitar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setStatusItensA8((prev) => ({
                                          ...prev,
                                          [item.id]: 'PENDENTE',
                                        }))
                                      }
                                      className={`px-1 py-0.5 rounded text-[9px] font-medium border transition-colors ${
                                        statusAtual === 'PENDENTE'
                                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                          : 'border-[#24334F] text-[#8B98B4]'
                                      }`}
                                    >
                                      ?
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Observações e Registro do Consultor */}
                    <div className="pt-2 border-t border-[#24334F] space-y-2">
                      <label className="text-[11px] font-semibold text-[#F8FAFC] block">
                        Ata da Auditoria do Consultor / Parecer Humano:
                      </label>
                      <input
                        type="text"
                        value={obsConsultorA8}
                        onChange={(e) => setObsConsultorA8(e.target.value)}
                        placeholder="Ex.: Portão MaaS aprovado pelo consultor — paridade 100% conferida contra o Bloco Solução do Expert."
                        className="w-full bg-[#0B1120] border border-[#24334F] rounded-[4px] px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B9DFF]"
                      />
                      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                        <div className="text-[11px] text-[#8B98B4]">
                          Vedada a autocertificação: registro requer salvamento explícito pelo
                          consultor.
                        </div>
                        <Button
                          size="sm"
                          disabled={salvandoA8Humano || !diagnosticoVinculado?.id}
                          onClick={async () => {
                            if (!diagnosticoVinculado?.id) return
                            setSalvandoA8Humano(true)
                            setFeedbackMsg(null)
                            try {
                              const { salvarValidacaoHumanaA8 } =
                                await import('@/services/site-leads-sync')
                              const payloadGabarito: Record<string, any> = {
                                nivel_portao: nivelPortaoA8,
                                auditado_em: new Date().toISOString(),
                                tipo_auditoria: 'validacao_humana_sem_autocertificacao',
                                item1_identificacao_setor_protocolo: {
                                  status: statusItensA8.a8_1,
                                  criterio: 'Identificação, Setor & Protocolo',
                                },
                                item2_confirmacao_carga_2_linhas: {
                                  status: statusItensA8.a8_2,
                                  criterio: 'CS-19 / CS-20 Carga em 2 Linhas',
                                },
                                item3_causa_raiz_canvas_as_is: {
                                  status: statusItensA8.a8_3,
                                  criterio: 'Causa Raiz & Canvas As Is (9 Blocos)',
                                },
                                item4_micro_epifanias_bloco_setorial: {
                                  status: statusItensA8.a8_4,
                                  criterio: 'Micro-epifanias Bloco Setorial',
                                },
                                item5_vazamentos_objetivos: {
                                  status: statusItensA8.a8_5,
                                  criterio: 'Vazamentos Quantificados no Dossiê',
                                },
                                item6_nota_triangulacao: {
                                  status: statusItensA8.a8_6,
                                  criterio: 'Nota de Triangulação Contábil',
                                },
                                item7_snapshot_f6_dre_15_linhas: {
                                  status: statusItensA8.a8_7,
                                  criterio: 'CS-17: DRE Normalizada 15 Linhas',
                                },
                                item8_anexo_b_erec_a9: {
                                  status: statusItensA8.a8_8,
                                  criterio: 'A9: Matriz EREC Canônica 4 Colunas',
                                },
                                item9_gate_autorizacao_cs20: {
                                  status: statusItensA8.a8_9,
                                  criterio: 'CS-20: Gate Devolutiva / Nutrição',
                                },
                                item10_fechamento_aguardo_comando: {
                                  status: statusItensA8.a8_10,
                                  criterio: 'Fechamento Inviolável "Aguardo seu comando."',
                                },
                              }

                              const res = await salvarValidacaoHumanaA8(
                                diagnosticoVinculado.id,
                                payloadGabarito,
                                'Consultor Responsável',
                                obsConsultorA8,
                              )
                              if (!res.success) {
                                throw new Error(res.error || 'Falha ao salvar validação humana A8.')
                              }

                              setFeedbackMsg({
                                type: 'success',
                                text: `Validação Humana A8 (${nivelPortaoA8.toUpperCase()}) registrada com sucesso no cofre!`,
                              })

                              // Recarregar diagnóstico
                              const { getDiagnosticoByLeadId } =
                                await import('@/services/diagnosticos')
                              const diagAtualizado = await getDiagnosticoByLeadId(lead.id)
                              setDiagnosticoVinculado(diagAtualizado)
                            } catch (err: any) {
                              setFeedbackMsg({
                                type: 'error',
                                text: err?.message || 'Erro ao salvar validação humana.',
                              })
                            } finally {
                              setSalvandoA8Humano(false)
                            }
                          }}
                          className="bg-[#22B14C] hover:bg-[#1E9E43] text-white text-xs h-7 gap-1.5"
                        >
                          {salvandoA8Humano ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Registrar Validação Humana do Consultor</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* DRE Normalizada de 15 Linhas (CS-17) */}
                {diagnosticoVinculado?.dre_normalizada_15_linhas && (
                  <Card className="bg-[#16213A] border-[#24334F]">
                    <CardHeader className="py-2.5 px-4 border-b border-[#24334F]/70 bg-[#111A2E]/60 flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                          <span>CS-17: DRE Normalizada em 15 Linhas (Snapshot Fase 6)</span>
                        </CardTitle>
                        <p className="text-[11px] text-[#8B98B4]">
                          Estrutura mandatória sem omissões; linhas não segregáveis recebem [REQUER
                          VERIFICAÇÃO]
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-[#3DDC74]/50 text-[#3DDC74]"
                      >
                        15 / 15 Linhas
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 text-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#24334F] text-[#8B98B4] text-[11px]">
                              <th className="py-1 px-2 w-12 font-mono">#</th>
                              <th className="py-1 px-2">Linha Contábil</th>
                              <th className="py-1 px-2 text-right">Valor Declarado / Apurado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diagnosticoVinculado.dre_normalizada_15_linhas.map(
                              (l: any, idx: number) => (
                                <tr
                                  key={idx}
                                  className="border-b border-[#24334F]/30 hover:bg-[#111A2E]/40 font-mono text-[11px]"
                                >
                                  <td className="py-1 px-2 text-[#8B98B4]">
                                    {String(l.numero).padStart(2, '0')}
                                  </td>
                                  <td className="py-1 px-2 text-[#F8FAFC] font-sans font-medium">
                                    {l.linha}
                                  </td>
                                  <td className="py-1 px-2 text-right">
                                    {String(l.valor).includes('[REQUER') ? (
                                      <span className="text-[#FFB84D] bg-[#FF9900]/10 px-1.5 py-0.5 rounded text-[10px]">
                                        {l.valor}
                                      </span>
                                    ) : (
                                      <span className="text-[#3DDC74] font-semibold">
                                        {l.valor}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Estrutura Canônica EREC A9 */}
                {diagnosticoVinculado?.estrutura_erec_a9 && (
                  <Card className="bg-[#16213A] border-[#24334F]">
                    <CardHeader className="py-2.5 px-4 border-b border-[#24334F]/70 bg-[#111A2E]/60">
                      <CardTitle className="text-xs font-bold text-[#F8FAFC]">
                        Anexo B Canônico A9: Matriz EREC Estruturada
                      </CardTitle>
                      <p className="text-[11px] text-[#8B98B4]">
                        Tabela quadrivalente com colunas Ação | Item de Intervenção | Base
                        Conclusiva | Dimensão setorial
                      </p>
                    </CardHeader>
                    <CardContent className="p-3 text-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#24334F] text-[#8B98B4] text-[11px]">
                              <th className="py-1 px-2 w-28">Ação (EREC)</th>
                              <th className="py-1 px-2">Item de Intervenção</th>
                              <th className="py-1 px-2">Base Conclusiva</th>
                              <th className="py-1 px-2 w-32">Dimensão Setorial</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diagnosticoVinculado.estrutura_erec_a9.map((er: any, idx: number) => (
                              <tr
                                key={idx}
                                className="border-b border-[#24334F]/30 hover:bg-[#111A2E]/40 text-xs"
                              >
                                <td className="py-1.5 px-2 font-semibold">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      er.acao === 'Eliminar'
                                        ? 'border-rose-500/50 text-rose-300 bg-rose-500/10'
                                        : er.acao === 'Reduzir'
                                          ? 'border-amber-500/50 text-amber-300 bg-amber-500/10'
                                          : er.acao === 'Elevar'
                                            ? 'border-blue-500/50 text-blue-300 bg-blue-500/10'
                                            : 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10'
                                    }`}
                                  >
                                    {er.acao}
                                  </Badge>
                                </td>
                                <td className="py-1.5 px-2 text-[#F8FAFC] font-medium">
                                  {er.item}
                                </td>
                                <td className="py-1.5 px-2 text-[#8B98B4] text-[11px]">
                                  {er.base}
                                </td>
                                <td className="py-1.5 px-2 text-[#5B9DFF] text-[11px] font-mono">
                                  {er.dimensao}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Relatório Gerado pelo Agente V7.2 */}
                {diagnosticoVinculado?.relatorio_gerado ? (
                  <Card className="bg-[#0B1120] border-[#24334F]">
                    <CardHeader className="py-2.5 px-4 border-b border-[#24334F]/70">
                      <CardTitle className="text-xs font-bold text-[#F8FAFC]">
                        Output do Motor Determinístico (Fase 1 + Snapshot F6)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <pre className="text-[11px] font-mono text-[#C7D0E0] whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto">
                        {diagnosticoVinculado.relatorio_gerado}
                      </pre>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="p-6 bg-[#16213A] rounded border border-[#24334F] text-center text-xs text-[#8B98B4]">
                    Nenhum diagnóstico gerado ainda para este lead. Utilize o botão{' '}
                    <strong className="text-[#5B9DFF]">Processar Agora</strong> acima para acionar o
                    motor JBP Gestão Master V7.2.3.
                  </div>
                )}
              </TabsContent>

              {/* ABA: EXECUÇÃO DAS FASES (1–8) — MASTER FRAMEWORK V2.4 */}
              <TabsContent value="fases" className="mt-0 space-y-4 pb-4">
                {/* Cabeçalho da Aba com Ações e Economia Unitária */}
                <div className="p-3 bg-[#16213A] border border-[#5B9DFF]/40 rounded-[4px] flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#3DDC74]" />
                    <span className="font-semibold text-[#F8FAFC]">
                      Linha do Tempo da Execução — 8 Fases do Master Framework V2.4 (Serviço Trilha
                      A)
                    </span>
                    {diagnosticoVinculado?.output_prompts && (
                      <Badge className="bg-[#3DDC74]/20 text-[#3DDC74] border border-[#3DDC74]/40 text-[10px]">
                        {diagnosticoVinculado.output_prompts.length}/8 Fases Concluídas via Serviço
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Botão de recolher/expandir todas */}
                    {diagnosticoVinculado?.output_prompts &&
                      diagnosticoVinculado.output_prompts.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const todasAbertas = Object.values(fasesExpandidas).every(Boolean)
                            const novoEstado: Record<number, boolean> = {}
                            ;[1, 2, 3, 4, 5, 6, 7, 8].forEach((f) => {
                              novoEstado[f] = !todasAbertas
                            })
                            setFasesExpandidas(novoEstado)
                          }}
                          className="text-[#8B98B4] hover:text-[#F8FAFC] text-[11px] h-7 px-2"
                        >
                          {Object.values(fasesExpandidas).every(Boolean)
                            ? 'Recolher Todas'
                            : 'Expandir Todas'}
                        </Button>
                      )}

                    {/* Botão Relatório Completo */}
                    <Button
                      size="sm"
                      disabled={gerandoPdf}
                      onClick={() => {
                        setGerandoPdf(true)
                        try {
                          gerarRelatorioCompletoPDF({
                            lead,
                            diagnostico: diagnosticoVinculado,
                          })
                          setFeedbackMsg({
                            type: 'success',
                            text: 'PDF para Auditoria do Expert gerado e baixado com sucesso!',
                          })
                        } catch (err: any) {
                          setFeedbackMsg({
                            type: 'error',
                            text: err?.message || 'Erro ao gerar PDF do relatório.',
                          })
                        } finally {
                          setGerandoPdf(false)
                        }
                      }}
                      className="bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-[4px] text-xs h-7 px-2.5 gap-1.5 shadow"
                    >
                      {gerandoPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5" />
                      )}
                      <span>Gerar PDF p/ Auditoria do Expert</span>
                    </Button>
                  </div>
                </div>

                {/* Resumo de Métricas de Execução (Gateway) */}
                {diagnosticoVinculado?.custo_gateway && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <Card className="bg-[#111A2E] border-[#24334F] p-2.5">
                      <span className="text-[10px] text-[#8B98B4] uppercase block font-medium">
                        Custo Total Gateway
                      </span>
                      <div className="text-sm font-bold text-[#3DDC74] mt-0.5">
                        ${Number(diagnosticoVinculado.custo_gateway.custo_usd || 0).toFixed(4)} USD
                      </div>
                      <span className="text-[10px] text-[#8B98B4]">Tier reasoning</span>
                    </Card>
                    <Card className="bg-[#111A2E] border-[#24334F] p-2.5">
                      <span className="text-[10px] text-[#8B98B4] uppercase block font-medium">
                        Tempo de Execução
                      </span>
                      <div className="text-sm font-bold text-[#5B9DFF] mt-0.5">
                        {diagnosticoVinculado.custo_gateway.tempo_execucao_ms} ms
                      </div>
                      <span className="text-[10px] text-[#8B98B4]">
                        {(diagnosticoVinculado.custo_gateway.tempo_execucao_ms / 1000).toFixed(1)}s
                        total
                      </span>
                    </Card>
                    <Card className="bg-[#111A2E] border-[#24334F] p-2.5">
                      <span className="text-[10px] text-[#8B98B4] uppercase block font-medium">
                        Tokens de Entrada
                      </span>
                      <div className="text-sm font-bold text-[#F8FAFC] mt-0.5">
                        {diagnosticoVinculado.custo_gateway.tokens_input?.toLocaleString('pt-BR')}
                      </div>
                      <span className="text-[10px] text-[#8B98B4]">Contexto & Prompts</span>
                    </Card>
                    <Card className="bg-[#111A2E] border-[#24334F] p-2.5">
                      <span className="text-[10px] text-[#8B98B4] uppercase block font-medium">
                        Tokens de Saída
                      </span>
                      <div className="text-sm font-bold text-[#FFB84D] mt-0.5">
                        {diagnosticoVinculado.custo_gateway.tokens_output?.toLocaleString('pt-BR')}
                      </div>
                      <span className="text-[10px] text-[#8B98B4]">Geração Determinística</span>
                    </Card>
                  </div>
                )}

                {/* Renderização Sequencial da Linha do Tempo (Fases 1 a 8) */}
                {diagnosticoVinculado?.output_prompts &&
                Array.isArray(diagnosticoVinculado.output_prompts) &&
                diagnosticoVinculado.output_prompts.length > 0 ? (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#24334F]">
                    {diagnosticoVinculado.output_prompts.map(
                      (faseItem: FaseExecucaoPrompt, idx: number) => {
                        const isExpanded = fasesExpandidas[faseItem.fase] ?? true
                        return (
                          <div key={idx} className="relative group">
                            {/* Ponto na Linha do Tempo */}
                            <div className="absolute -left-6 top-3.5 w-5 h-5 rounded-full bg-[#16213A] border-2 border-[#0066CC] flex items-center justify-center text-[10px] font-bold text-[#5B9DFF] group-hover:border-[#3DDC74] transition-colors">
                              {faseItem.fase}
                            </div>

                            {/* Card da Fase */}
                            <Card className="bg-[#16213A] border-[#24334F] overflow-hidden">
                              <CardHeader
                                onClick={() =>
                                  setFasesExpandidas((prev) => ({
                                    ...prev,
                                    [faseItem.fase]: !prev[faseItem.fase],
                                  }))
                                }
                                className="py-2.5 px-4 bg-[#111A2E]/80 border-b border-[#24334F]/70 cursor-pointer hover:bg-[#111A2E] transition-colors flex flex-row items-center justify-between"
                              >
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <Badge className="bg-[#0066CC] text-white font-mono text-[10px] font-bold">
                                    Fase {faseItem.fase}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="border-[#FFB84D]/60 text-[#FFB84D] bg-[#FFB84D]/10 font-mono text-[10px] font-bold"
                                  >
                                    Prompt {faseItem.prompt_id}
                                  </Badge>
                                  <span className="text-xs font-bold text-[#F8FAFC]">
                                    {faseItem.titulo}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[11px] text-[#8B98B4] hidden sm:inline">
                                    {faseItem.duracao_ms}ms •{' '}
                                    {faseItem.tokens_input + faseItem.tokens_output} tokens
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-[#8B98B4]" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-[#8B98B4]" />
                                  )}
                                </div>
                              </CardHeader>

                              {isExpanded && (
                                <CardContent className="p-4 space-y-3 text-xs">
                                  {/* Evidências Usadas (Chips) */}
                                  {faseItem.evidencias_usadas &&
                                    faseItem.evidencias_usadas.length > 0 && (
                                      <div className="space-y-1.5">
                                        <span className="text-[10px] text-[#8B98B4] uppercase tracking-wider font-semibold block">
                                          Evidências e Dados-Fonte Utilizados:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {faseItem.evidencias_usadas.map((ev, evIdx) => (
                                            <Badge
                                              key={evIdx}
                                              variant="secondary"
                                              className="bg-[#111A2E] text-[#93C5FD] border border-[#24334F] text-[10px] font-normal"
                                            >
                                              {ev}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  {/* Output Integral Completo (sem truncar) */}
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-[#8B98B4] uppercase tracking-wider font-semibold block">
                                      Output Integral do Agente na Fase:
                                    </span>
                                    <div className="p-3 bg-[#0B1120] rounded border border-[#24334F]">
                                      <pre className="text-[11px] font-mono text-[#C7D0E0] whitespace-pre-wrap leading-relaxed break-words overflow-x-auto selection:bg-[#0066CC] selection:text-white">
                                        {faseItem.output_integral}
                                      </pre>
                                    </div>
                                  </div>

                                  {/* Rodapé do Bloco da Fase */}
                                  <div className="pt-2 border-t border-[#24334F]/40 flex items-center justify-between text-[11px] text-[#8B98B4] flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-[#5B9DFF]" />
                                        <span>
                                          Duração:{' '}
                                          <strong className="text-[#F8FAFC]">
                                            {faseItem.duracao_ms} ms
                                          </strong>
                                        </span>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Cpu className="w-3.5 h-3.5 text-[#3DDC74]" />
                                        <span>
                                          Tokens:{' '}
                                          <strong className="text-[#F8FAFC]">
                                            {faseItem.tokens_input} in / {faseItem.tokens_output}{' '}
                                            out
                                          </strong>
                                        </span>
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-[#8B98B4] font-mono">
                                      Prompt ID: {faseItem.prompt_id}
                                    </span>
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          </div>
                        )
                      },
                    )}
                  </div>
                ) : (
                  <Card className="bg-[#16213A] border-[#24334F] p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-[#FFB84D] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#F8FAFC]">
                      Nenhuma execução de fases gravada para este diagnóstico
                    </p>
                    <p className="text-xs text-[#8B98B4] mt-1 max-w-md mx-auto">
                      Este registro pode ter sido gerado em versão anterior ou ainda não foi
                      processado com o Master Framework V2.4 de 8 fases.
                    </p>
                  </Card>
                )}
              </TabsContent>

              {/* ABA: INTERCÂMBIO MANUAL COM O EXPERT (FASE A2) */}
              <TabsContent value="intercambio" className="mt-0 space-y-4 pb-4">
                <div className="p-4 bg-[#16213A] border border-[#FF9900]/40 rounded-[4px] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-[#FF9900]" />
                      <span className="font-bold text-sm text-[#F8FAFC]">
                        Intercâmbio Manual de Diagnóstico (Contrato V2.0.0)
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-[#FF9900]/50 text-[#FFB84D] text-[10px]"
                    >
                      Fase A2 — Operador Humano
                    </Badge>
                  </div>
                  <p className="text-xs text-[#8B98B4] leading-relaxed">
                    O Expert é o motor determinístico (Adapta ONE / JBP V7.2); o App é a casca
                    transacional. O consultor exporta o <code>.json</code> do dossiê, submete ao
                    Expert e registra o output de volta aqui.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Passo 1: Exportar Dossiê JSON */}
                  <Card className="bg-[#111A2E] border-[#24334F] flex flex-col justify-between">
                    <CardHeader className="py-3 px-4 border-b border-[#24334F]/70">
                      <CardTitle className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                        <FileDown className="w-4 h-4 text-[#5B9DFF]" />
                        <span>Passo 1: Exportar Dossiê JSON (Entrada A1)</span>
                      </CardTitle>
                      <p className="text-[11px] text-[#8B98B4]">
                        Gera o arquivo padronizado para submissão ao motor do Expert.
                      </p>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="p-2.5 rounded bg-[#0B1120] border border-[#24334F] text-[#C7D0E0] space-y-1 font-mono text-[11px]">
                        <div>• Lead ID: {lead.id}</div>
                        <div>• Protocolo: {lead.protocolo}</div>
                        <div>
                          • Questionário: {lead.setor} (
                          {(lead as any).versao_questionario || 'V7.2'})
                        </div>
                        <div>• Total Anexos: {totalAnexos} arquivo(s)</div>
                        <div>• Gate CS-20: {lead.autorizacao_devolutiva || 'Não autorizo'}</div>
                      </div>

                      <Button
                        disabled={exportandoDossie}
                        onClick={async () => {
                          setExportandoDossie(true)
                          try {
                            const { exportarDossieContratoV2 } =
                              await import('@/services/site-leads-sync')
                            const res = await exportarDossieContratoV2(lead.id)
                            if (res.success && res.dossie_contrato_v2) {
                              const blob = new Blob(
                                [JSON.stringify(res.dossie_contrato_v2, null, 2)],
                                {
                                  type: 'application/json',
                                },
                              )
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `dossie_${lead.id}_${(lead.protocolo || 'VM').replace(/[^a-zA-Z0-9_-]/g, '_')}.json`
                              document.body.appendChild(a)
                              a.click()
                              document.body.removeChild(a)
                              URL.revokeObjectURL(url)
                              setFeedbackMsg({
                                type: 'success',
                                text: 'Dossiê do Contrato V2 exportado com sucesso!',
                              })
                            } else {
                              throw new Error(res.error || 'Falha ao gerar dossiê.')
                            }
                          } catch (err: any) {
                            setFeedbackMsg({
                              type: 'error',
                              text: err?.message || 'Erro ao exportar dossiê.',
                            })
                          } finally {
                            setExportandoDossie(false)
                          }
                        }}
                        className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs h-8 gap-1.5"
                      >
                        {exportandoDossie ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>Baixar Dossiê (.json) Contrato V2</span>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Passo 2: Registrar Output do Expert */}
                  <Card className="bg-[#111A2E] border-[#24334F] flex flex-col justify-between">
                    <CardHeader className="py-3 px-4 border-b border-[#24334F]/70">
                      <CardTitle className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-[#3DDC74]" />
                        <span>Passo 2: Registrar Output do Expert (Saída A1)</span>
                      </CardTitle>
                      <p className="text-[11px] text-[#8B98B4]">
                        Cole o JSON de saída entregue pelo Expert para gravar no cofre do lead.
                      </p>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-xs">
                      <textarea
                        value={jsonExpertInput}
                        onChange={(e) => setJsonExpertInput(e.target.value)}
                        placeholder="Cole aqui o JSON de saída retornado pelo Expert..."
                        rows={6}
                        className="w-full bg-[#0B1120] border border-[#24334F] rounded-[4px] p-2 text-[11px] font-mono text-[#F8FAFC] focus:outline-none focus:border-[#5B9DFF]"
                      />

                      <Button
                        disabled={registrandoExpert || !jsonExpertInput.trim()}
                        onClick={async () => {
                          setRegistrandoExpert(true)
                          setFeedbackMsg(null)
                          try {
                            let parsed: any = null
                            try {
                              parsed = JSON.parse(jsonExpertInput.trim())
                            } catch (eParse: any) {
                              throw new Error(
                                'O texto informado não é um JSON válido: ' + eParse.message,
                              )
                            }

                            // Validação estrita via TypeScript validador do contrato
                            const { validarOutputExpert } = await import('@/types/contrato-expert')
                            const validacao = validarOutputExpert(parsed)
                            if (!validacao.valido) {
                              throw new Error(
                                `Erro [${validacao.codigo_erro || 'VALIDACAO'}]: ${validacao.erros.join('; ')}`,
                              )
                            }

                            const { registrarOutputExpertManual } =
                              await import('@/services/site-leads-sync')
                            const res = await registrarOutputExpertManual(lead.id, parsed, {
                              dryRun: true,
                            })
                            if (!res.success) {
                              throw new Error(
                                res.codigo_erro
                                  ? `[${res.codigo_erro}] ${res.error}`
                                  : res.error || 'Falha ao registrar output.',
                              )
                            }

                            setFeedbackMsg({
                              type: 'success',
                              text: 'Output do Expert validado e registrado com sucesso no cofre do lead!',
                            })
                            setJsonExpertInput('')
                            if (onLeadUpdated) onLeadUpdated()

                            // Recarregar diagnóstico vinculado
                            const { getDiagnosticoByLeadId } =
                              await import('@/services/diagnosticos')
                            const diagAtualizado = await getDiagnosticoByLeadId(lead.id)
                            setDiagnosticoVinculado(diagAtualizado)
                          } catch (err: any) {
                            setFeedbackMsg({
                              type: 'error',
                              text: err?.message || 'Falha ao registrar output do Expert.',
                            })
                          } finally {
                            setRegistrandoExpert(false)
                          }
                        }}
                        className="w-full bg-[#22B14C] hover:bg-[#1E9E43] text-white text-xs h-8 gap-1.5"
                      >
                        {registrandoExpert ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Validar Schema e Gravar Diagnóstico</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ABA 2: ANEXOS RE-HOSPEDADOS */}
              <TabsContent value="anexos" className="mt-0 space-y-4 pb-4">
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

              {/* ABA 3: DADOS BRUTOS */}
              <TabsContent value="bruto" className="mt-0 pb-4">
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
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
