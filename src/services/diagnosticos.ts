import pb from '@/lib/pocketbase/client'

export interface HeatMapArea {
  numero: number
  titulo: string
  score: number
  nivel: string
}

export interface HeatMap {
  areas: HeatMapArea[]
}

export interface FaseExecucaoPrompt {
  fase: number // 1 a 8
  titulo: string // ex: "Fase 1 — Diagnóstico Profundo"
  prompt_id: string // "P2", "P5", "P6", "P7", "P8", "P9", "P10", "P11"
  output_integral: string // texto completo gerado pelo agente na fase
  evidencias_usadas: string[] // anexos/seções/dados que alimentaram a fase
  duracao_ms: number
  tokens_input: number
  tokens_output: number
}

export interface Diagnostico {
  id: string
  user?: string
  lead?: string
  status?: 'processando' | 'concluido' | 'erro'
  autorizacao_devolutiva?: string
  versao_questionario?: string
  dados_entrada: Record<string, any>
  relatorio_gerado: string
  setor?: string
  fase_atual?: number
  output_prompts?: FaseExecucaoPrompt[]
  dre_normalizada_15_linhas?: Array<{
    numero: number
    linha: string
    valor: string | number
    fonte?: string
    nota?: string
    status?: string
  }>
  estrutura_erec_a9?: Array<{ acao: string; item: string; base: string; dimensao: string }>
  gabarito_auditoria?: Record<string, any>
  blocos_solucao?: Record<string, any>
  custo_gateway?: {
    tokens_input: number
    tokens_output: number
    custo_usd: number
    tempo_execucao_ms: number
    executado_em: string
    agente?: string
    versao?: string
    tier?: string
    total_fases_executadas?: number
    medicao_real_gateway?: boolean
  }
  origem_tipo?: 'direto' | 'parceiro'
  origem_parceiro?: string
  versao_incremental?: number
  historico_versoes?: Array<{
    versao: number
    arquivado_em: string
    status: string
    versao_questionario: string
    fase_atual: number
    relatorio_gerado: string
    dados_entrada: any
    dre_normalizada_15_linhas: any
    estrutura_erec_a9: any
    custo_gateway: any
    motivo: string
  }>
  created?: string
  updated?: string
}
export const getDiagnosticos = async (): Promise<Diagnostico[]> => {
  const records = await pb.collection('diagnosticos').getFullList({ sort: '-created' })
  return records.map((r: any) => ({
    id: r.id,
    user: r.user,
    lead: r.lead,
    status: r.status,
    autorizacao_devolutiva: r.autorizacao_devolutiva,
    versao_questionario: r.versao_questionario,
    dados_entrada: r.dados_entrada || {},
    relatorio_gerado: r.relatorio_gerado || '',
    setor: r.setor || '',
    fase_atual: r.fase_atual,
    output_prompts: r.output_prompts,
    dre_normalizada_15_linhas: r.dre_normalizada_15_linhas,
    estrutura_erec_a9: r.estrutura_erec_a9,
    gabarito_auditoria: r.gabarito_auditoria,
    blocos_solucao: r.blocos_solucao,
    custo_gateway: r.custo_gateway,
    origem_tipo: r.origem_tipo,
    origem_parceiro: r.origem_parceiro,
    versao_incremental: r.versao_incremental || 1,
    historico_versoes: r.historico_versoes || [],
    created: r.created,
    updated: r.updated,
  })) as Diagnostico[]
}

export const createDiagnostico = async (data: {
  user: string
  dados_entrada?: Record<string, any>
  relatorio_gerado?: string
  setor?: string
  fase_atual?: number
}): Promise<Diagnostico> => {
  const r: any = await pb.collection('diagnosticos').create(data)
  return {
    id: r.id,
    user: r.user,
    dados_entrada: r.dados_entrada || {},
    relatorio_gerado: r.relatorio_gerado || '',
    setor: r.setor || '',
    fase_atual: r.fase_atual,
    created: r.created,
    updated: r.updated,
  } as Diagnostico
}

export const updateDiagnostico = async (
  id: string,
  data: Partial<Diagnostico>,
): Promise<Diagnostico> => {
  const r: any = await pb.collection('diagnosticos').update(id, data)
  return {
    id: r.id,
    user: r.user,
    dados_entrada: r.dados_entrada || {},
    relatorio_gerado: r.relatorio_gerado || '',
    setor: r.setor || '',
    fase_atual: r.fase_atual,
    created: r.created,
    updated: r.updated,
  } as Diagnostico
}

export const deleteDiagnostico = async (id: string): Promise<void> => {
  await pb.collection('diagnosticos').delete(id)
}

export const getLatestDiagnostico = async (): Promise<Diagnostico | null> => {
  try {
    const result = await pb.collection('diagnosticos').getList(1, 1, { sort: '-created' })
    if (result.items.length === 0) return null
    const r = result.items[0] as any
    return {
      id: r.id,
      user: r.user,
      lead: r.lead,
      status: r.status,
      autorizacao_devolutiva: r.autorizacao_devolutiva,
      versao_questionario: r.versao_questionario,
      dados_entrada: r.dados_entrada || {},
      relatorio_gerado: r.relatorio_gerado || '',
      setor: r.setor || '',
      fase_atual: r.fase_atual,
      output_prompts: r.output_prompts,
      dre_normalizada_15_linhas: r.dre_normalizada_15_linhas,
      estrutura_erec_a9: r.estrutura_erec_a9,
      gabarito_auditoria: r.gabarito_auditoria,
      blocos_solucao: r.blocos_solucao,
      custo_gateway: r.custo_gateway,
      origem_tipo: r.origem_tipo,
      origem_parceiro: r.origem_parceiro,
      versao_incremental: r.versao_incremental || 1,
      historico_versoes: r.historico_versoes || [],
      created: r.created,
      updated: r.updated,
    }
  } catch {
    return null
  }
}

export const getDiagnostico = async (id: string): Promise<Diagnostico> => {
  const r: any = await pb.collection('diagnosticos').getOne(id)
  return {
    id: r.id,
    user: r.user,
    lead: r.lead,
    status: r.status,
    autorizacao_devolutiva: r.autorizacao_devolutiva,
    versao_questionario: r.versao_questionario,
    dados_entrada: r.dados_entrada || {},
    relatorio_gerado: r.relatorio_gerado || '',
    setor: r.setor || '',
    fase_atual: r.fase_atual,
    output_prompts: r.output_prompts,
    dre_normalizada_15_linhas: r.dre_normalizada_15_linhas,
    estrutura_erec_a9: r.estrutura_erec_a9,
    gabarito_auditoria: r.gabarito_auditoria,
    blocos_solucao: r.blocos_solucao,
    custo_gateway: r.custo_gateway,
    origem_tipo: r.origem_tipo,
    origem_parceiro: r.origem_parceiro,
    versao_incremental: r.versao_incremental || 1,
    historico_versoes: r.historico_versoes || [],
    created: r.created,
    updated: r.updated,
  }
}

export const getDiagnosticoByLeadId = async (leadId: string): Promise<Diagnostico | null> => {
  try {
    const r: any = await pb.collection('diagnosticos').getFirstListItem(`lead="${leadId}"`, {
      sort: '-created',
    })
    return {
      id: r.id,
      user: r.user,
      lead: r.lead,
      status: r.status,
      autorizacao_devolutiva: r.autorizacao_devolutiva,
      versao_questionario: r.versao_questionario,
      dados_entrada: r.dados_entrada || {},
      relatorio_gerado: r.relatorio_gerado || '',
      setor: r.setor || '',
      fase_atual: r.fase_atual,
      output_prompts: r.output_prompts,
      dre_normalizada_15_linhas: r.dre_normalizada_15_linhas,
      estrutura_erec_a9: r.estrutura_erec_a9,
      gabarito_auditoria: r.gabarito_auditoria,
      blocos_solucao: r.blocos_solucao,
      custo_gateway: r.custo_gateway,
      origem_tipo: r.origem_tipo,
      origem_parceiro: r.origem_parceiro,
      versao_incremental: r.versao_incremental || 1,
      historico_versoes: r.historico_versoes || [],
      created: r.created,
      updated: r.updated,
    }
  } catch {
    return null
  }
}

export function getHeatMap(diagnostico: Diagnostico): HeatMap | null {
  const raw = diagnostico.dados_entrada?.heat_map
  if (!raw || !Array.isArray(raw.areas)) return null
  return raw as HeatMap
}
