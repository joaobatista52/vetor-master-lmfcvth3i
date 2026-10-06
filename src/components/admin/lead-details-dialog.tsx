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
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import type { LeadRecord } from '@/services/site-leads-sync'
import { getLeadById } from '@/services/site-leads-sync'
import { setores, type Setor, type PerguntaItemLiteral } from '@/data/setores-questionario'

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
}: LeadDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<'questionario' | 'anexos' | 'bruto'>('questionario')
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
    // Filtra de respostasEtapa2 chaves com prefixo de setor seguido de "_" e contendo razao, empresa ou social
    // (ex.: "varejo_razao_social", "trade_razao_social", "saude_razao_social", "varejo_empresa"),
    // mantendo apenas o item canônico de fallback "Razão Social / Nome da Empresa" (lead.razao_social).
    const respostasEtapa2 = extrairRespostasEtapa(2).filter((item) => {
      const k = item.chave.trim().toLowerCase()
      const ehRazaoSetorial = SETOR_PREFIXES.some(
        (prefix) =>
          k.startsWith(`${prefix}_`) &&
          (k.includes('razao') || k.includes('empresa') || k.includes('social')),
      )
      return !ehRazaoSetorial
    })
    const respostasExtras = [...outrasRespostas]

    const todos: RespostaExibicao[] = [...respostasEtapa1, ...respostasEtapa2, ...respostasExtras]

    // Deduplica por chave exata caso coincida
    const vistos = new Set<string>()
    const deduplicados: RespostaExibicao[] = []
    for (const item of todos) {
      const normalizada = item.chave.trim().toLowerCase()
      if (!vistos.has(normalizada)) {
        vistos.add(normalizada)
        deduplicados.push(item)
      }
    }

    return deduplicados
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
