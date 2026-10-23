import pb from '@/lib/pocketbase/client'

export interface IntegracaoSiteConfig {
  id: string
  chave: string
  site_backend_url: string
  site_sync_email: string
  site_sync_password?: string
  descricao?: string
  ativo: boolean
  updated: string
}

export interface LeadRecord {
  id: string
  protocolo: string
  origem: string
  origem_tipo: string
  origem_parceiro?: string
  parceiro_confirmou?: boolean
  parceiro_confirmou_em?: string
  parceiro_email?: string
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
  respostas?: Record<string, any>
  contrato_social?: string[] | string
  certificacoes?: string[] | string
  documentacao_adicional?: string[] | string
  processado_em?: string
  data_devolutiva?: string
  teaser_gerado?: any
  cadencia_nutricao?: any
  consentimento_lgpd?: boolean
  site_lead_id: string
  membro_fundador?: boolean
  checkpoint_valido_ate?: string
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

export async function updateLeadStatus(
  id: string,
  status: string,
  extraFields?: {
    membro_fundador?: boolean
    checkpoint_valido_ate?: string | null
  },
): Promise<LeadRecord | null> {
  try {
    const data: Record<string, any> = { status, ...(extraFields || {}) }
    const updated = await pb.collection('leads').update<LeadRecord>(id, data)
    return updated
  } catch (err) {
    console.error('Falha ao atualizar status do lead:', err)
    throw err
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

export async function processarLeadViaWorker(
  leadId: string,
  options?: { dryRun?: boolean },
): Promise<{ success: boolean; message?: string; resultado?: any; error?: string }> {
  try {
    const query = options?.dryRun ? '?dry_run=1' : ''
    const res = await pb.send<{ success: boolean; message?: string; resultado?: any }>(
      `/backend/v1/worker/processar-lead/${leadId}${query}`,
      {
        method: 'POST',
        body: options?.dryRun ? { dry_run: true } : undefined,
      },
    )
    return res
  } catch (err: any) {
    console.error('Falha ao processar lead via worker:', err)
    return {
      success: false,
      error: err?.message || 'Erro ao comunicar com o worker de processamento.',
    }
  }
}

export async function confirmarParceiroLead(
  leadId: string,
): Promise<{ success: boolean; message?: string; novo_status?: string; error?: string }> {
  try {
    const res = await pb.send<{ success: boolean; message?: string; novo_status?: string }>(
      `/backend/v1/leads/${leadId}/confirmar-parceiro`,
      { method: 'POST' },
    )
    return res
  } catch (err: any) {
    console.error('Falha ao confirmar parceria:', err)
    return {
      success: false,
      error: err?.message || 'Erro ao confirmar parceiro.',
    }
  }
}

export async function executarCadenciaNutricaoManual(): Promise<{
  success: boolean
  message?: string
  total_processados?: number
  error?: string
}> {
  try {
    const res = await pb.send<{ success: boolean; message?: string; total_processados?: number }>(
      '/backend/v1/worker/executar-cadencia',
      { method: 'POST' },
    )
    return res
  } catch (err: any) {
    console.error('Falha ao acionar cadência:', err)
    return {
      success: false,
      error: err?.message || 'Erro ao acionar cadência.',
    }
  }
}

/**
 * Invocação direta do Serviço de Diagnóstico JBP V7.2.3 (Trilha A)
 * Exposto como endpoint de serviço para consumo do App como Casca Transacional
 */
export async function invocarServicoDiagnostico(params: {
  dossie: any
  metadados?: {
    lead_id?: string
    versao_questionario?: string
    autorizacao_devolutiva?: string
    origem_tipo?: string
    origem_parceiro?: string
  }
  dry_run?: boolean
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await pb.send<any>('/backend/v1/servico-diagnostico', {
      method: 'POST',
      body: {
        dossie: params.dossie,
        metadados: params.metadados || {},
        dry_run: Boolean(params.dry_run),
      },
    })
    return { success: true, data: res }
  } catch (err: any) {
    console.error('Falha ao invocar Serviço de Diagnóstico:', err)
    return {
      success: false,
      error: err?.message || 'Falha na comunicação com o Serviço de Diagnóstico.',
    }
  }
}

export async function getIntegracaoSiteConfig(): Promise<IntegracaoSiteConfig | null> {
  try {
    const record = await pb
      .collection('integracoes_site')
      .getFirstListItem<IntegracaoSiteConfig>('chave="site_institucional_vetor_master"')
    return record
  } catch (err) {
    console.error('Falha ao obter integracoes_site:', err)
    return null
  }
}
