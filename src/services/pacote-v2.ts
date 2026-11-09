import pb from '@/lib/pocketbase/client'

/**
 * ETAPA E2-B — SERVIÇO DE INGESTÃO DO PACOTE V2.0 (tela /admin/ingestao)
 * Consumo interno (admin + consultor). NUNCA exposto ao cliente final.
 */

export interface ErroValidacao {
  codigo: number
  mensagem: string
  detalhe?: string
}

export interface BlocoValidacao {
  bloco: string
  status: 'ok' | 'erro'
  resumo: string
  erros?: ErroValidacao[]
}

export interface ResultadoValidacao {
  sucesso: boolean
  valido: boolean
  parte: string
  /** E2-E — parte detectada pela detecção em 4 níveis */
  parte_detectada?: string
  /** E2-E — campo_parte | blocos_conteudo | chaves_auxiliares */
  metodo_deteccao?: string
  blocos: BlocoValidacao[]
  erros: ErroValidacao[]
  dossie_id: string
  dry_run: boolean
  motivo: string
}

export interface ResultadoIngestao {
  sucesso: boolean
  valido: boolean
  parte: string
  prj: number
  pac: number
  etapas: number
  okrs: number
  hoshin: number
  rituais: number
  pacote_id: string
  dossie_id: string
  blocos: BlocoValidacao[]
  motivo: string
}

// Valores esperados do pacote completo AB (spec do Pacote Estruturado V2.0)
export const CONTADORES_ESPERADOS: Record<string, number> = {
  prj: 6,
  pac: 12,
  etapas: 116,
  okrs: 7,
  hoshin: 7,
  rituais: 5,
}

export interface PacoteV2Record {
  id: string
  dossie_id: string
  parte: string
  status_validacao: string
  erros_validacao: ErroValidacao[] | string
  importado_em: string
  importado_por: string
  lead: string
  schema_versao: string
  expand?: { importado_por?: { id: string; name: string; email: string } }
}

export interface DossieVersaoRecord {
  id: string
  lead: string
  versao: number
  motivo: string
  criado_por: string
  created: string
}

/** Extrai o primeiro objeto JSON embutido em texto com ou sem texto ao redor */
export function extrairJsonDeTexto(texto: string): any | null {
  const trimmed = (texto || '').trim()
  if (!trimmed) return null
  // Tentativa direta
  try {
    return JSON.parse(trimmed)
  } catch {
    /* continua: procura por objeto embutido */
  }
  // Procura o primeiro '{' com seu par '}' de fechamento balanceado
  const start = trimmed.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === '\\') {
      escaped = true
      continue
    }
    if (ch === '"') inString = !inString
    if (inString) continue
    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) {
        const candidate = trimmed.slice(start, i + 1)
        try {
          return JSON.parse(candidate)
        } catch {
          // continua procurando outro início
        }
      }
    }
  }
  return null
}

/** GET pacotes_v2 (histórico da tela /admin/ingestao) */
export async function getPacotesV2(filtroStatus?: string): Promise<PacoteV2Record[]> {
  try {
    const filter =
      filtroStatus && filtroStatus !== 'todos' ? `status_validacao="${filtroStatus}"` : ''
    const records = await pb.collection('pacotes_v2').getList<PacoteV2Record>(1, 50, {
      sort: '-importado_em',
      ...(filter ? { filter } : {}),
      expand: 'importado_por',
    })
    return records.items
  } catch (err) {
    console.error('Falha ao listar pacotes_v2:', err)
    return []
  }
}

/** GET dossies_versoes (histórico de versões por lead) */
export async function getDossieVersoesPorLead(leadId: string): Promise<DossieVersaoRecord[]> {
  try {
    const records = await pb.collection('dossies_versoes').getFullList<DossieVersaoRecord>({
      filter: `lead="${leadId}"`,
      sort: '-versao',
    })
    return records
  } catch (err) {
    console.error('Falha ao listar dossies_versoes:', err)
    return []
  }
}
