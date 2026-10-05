import pb from '@/lib/pocketbase/client'

export interface LeadRecord {
  id: string
  protocolo: string
  origem: string
  origem_tipo: string
  status: string
  autorizacao_devolutiva: string
  formato_interesse: string
  nome_completo: string
  razao_social: string
  cnpj: string
  cargo: string
  email: string
  whatsapp: string
  setor: string
  segmento: string
  faturamento_mensal: string
  plano_interesse: string
  responsavel_envio: string
  dados_completos: Record<string, any>
  site_lead_id: string
  site_created: string
  site_updated: string
  synced_at: string
  created: string
  updated: string
}

export interface SyncResult {
  success: boolean
  totalRemote?: number
  novosLeads?: number
  atualizadosLeads?: number
  syncedAt?: string
  message?: string
  error?: string
}

export interface E2ETestResult {
  success: boolean
  message: string
  siteLead?: any
  localLeadId?: string
  protocolo?: string
  error?: string
}

export async function getLeadsList(): Promise<LeadRecord[]> {
  try {
    const records = await pb.collection('leads').getFullList<LeadRecord>({
      sort: '-created',
    })
    return records
  } catch (err) {
    console.error('Falha ao listar leads locais:', err)
    return []
  }
}

export async function getLeadById(id: string): Promise<LeadRecord | null> {
  try {
    const record = await pb.collection('leads').getOne<LeadRecord>(id)
    return record
  } catch (err) {
    console.error('Falha ao obter lead por ID:', err)
    return null
  }
}

export async function dispararSincronizacaoSite(): Promise<SyncResult> {
  try {
    const res = await pb.send<SyncResult>('/backend/v1/sync/leads', {
      method: 'POST',
    })
    return res
  } catch (err: any) {
    console.error('Falha ao acionar sincronização de leads:', err)
    return {
      success: false,
      message: err?.message || 'Erro ao comunicar com serviço de sincronização.',
      error: String(err),
    }
  }
}

export async function dispararTesteE2E(): Promise<E2ETestResult> {
  try {
    const res = await pb.send<E2ETestResult>('/backend/v1/sync/test-e2e', {
      method: 'POST',
    })
    return res
  } catch (err: any) {
    console.error('Falha ao acionar teste E2E de integração:', err)
    return {
      success: false,
      message: err?.message || 'Erro ao executar teste ponta-a-ponta.',
      error: String(err),
    }
  }
}
