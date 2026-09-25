import PocketBase from 'pocketbase'

// Configurações do Backend do Site Institucional (Opção B - Base Unificada)
// Quando VITE_LEADS_PB_URL ou VITE_POCKETBASE_URL estiver configurado com credenciais,
// as submissões são salvas na coleção 'leads' remota.
// Caso contrário, opera em modo local resiliente (localStorage + fila para sincronização).

const sitePbUrl =
  (import.meta.env.VITE_LEADS_PB_URL as string | undefined) ||
  (import.meta.env.VITE_SITE_POCKETBASE_URL as string | undefined) ||
  ''

const siteUser =
  (import.meta.env.VITE_LEADS_USER as string | undefined) ||
  (import.meta.env.VITE_SITE_PB_USER as string | undefined) ||
  ''

const sitePass =
  (import.meta.env.VITE_LEADS_PASS as string | undefined) ||
  (import.meta.env.VITE_SITE_PB_PASS as string | undefined) ||
  ''

let clientInstance: PocketBase | null = null

function getRemoteClient(): PocketBase | null {
  if (!sitePbUrl) return null
  if (!clientInstance) {
    clientInstance = new PocketBase(sitePbUrl)
    clientInstance.autoCancellation(false)
  }
  return clientInstance
}

async function authenticateRemote(client: PocketBase): Promise<boolean> {
  if (client.authStore.isValid) return true
  if (!siteUser || !sitePass) return false
  try {
    // Tenta auth como superuser / admin primeiro, depois coleção users
    try {
      await (client as any).admins.authWithPassword(siteUser, sitePass)
      return true
    } catch {
      await client.collection('users').authWithPassword(siteUser, sitePass)
      return true
    }
  } catch (err) {
    console.warn('[LeadsClient] Falha na autenticação remota:', err)
    return false
  }
}

export type AutorizacaoDevolutiva = 'Sim' | 'Não'
export type FormatoInteresse = 'MaaS' | 'Híbrido' | 'CaaS' | 'Ainda não sei'
export type OrigemTipo = 'app' | 'saas_prioridade'

export interface QuestionarioSubmissionPayload {
  origem: 'App'
  origemTipo: 'app'
  status: 'Novo'
  autorizacao_devolutiva: AutorizacaoDevolutiva
  formato_interesse: FormatoInteresse
  protocolo: string
  // Identificação e perfil
  razao_social: string
  cnpj: string
  data_preenchimento: string
  setor: string
  segmento: string
  respondente: string
  cargo: string
  email_corporativo: string
  whatsapp: string
  // Dados do perfil
  perfil: Record<string, any>
  // 3 Pilares e Lentes
  pilares: {
    pilar_1_prisao_fundador: any[]
    pilar_2_ineficiencia_invisivel: any[]
    pilar_3_abismo_estrategia_execucao: any[]
  }
  hackman: any[]
  buffett: any[]
  expectativas: any[]
  inovacao: any[]
  documentacao: {
    balanco_patrimonial_nome?: string
    balanco_patrimonial_observacao?: string
    dre_nome?: string
    dre_observacao?: string
    organograma_relatorios_nome?: string
    organograma_relatorios_observacao?: string
    responsavel_envio: string
    documentos_adicionais?: string[]
  }
  raw_payload?: Record<string, any>
}

export interface ListaPrioridadePayload {
  origem: 'Lista de Prioridade SaaS'
  origemTipo: 'saas_prioridade'
  status: 'Novo'
  protocolo: string
  nome_completo: string
  email_corporativo: string
  whatsapp: string
  empresa: string
  setor: string
  faturamento_mensal: string
  cargo_funcao: string
  plano_interesse: 'SaaS Puro'
}

export interface SendResult {
  sucesso: boolean
  protocolo: string
  armazenamento: 'remoto' | 'local_fila'
  mensagem: string
  recordId?: string
}

function gerarProtocolo(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `#VM-${ts}-${rand}`
}

const LOCAL_STORAGE_KEY_LEADS_QUEUE = 'vm_leads_queue'
const LOCAL_STORAGE_KEY_ULTIMO_PROTOCOLO = 'vm_ultimo_protocolo'

export function getFilaLocal(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LEADS_QUEUE)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function salvarNaFilaLocal(item: any): void {
  try {
    const fila = getFilaLocal()
    fila.push({ ...item, queued_at: new Date().toISOString() })
    localStorage.setItem(LOCAL_STORAGE_KEY_LEADS_QUEUE, JSON.stringify(fila))
  } catch (err) {
    console.warn('[LeadsClient] Falha ao gravar na fila local:', err)
  }
}

/**
 * Envia o Questionário Estratégico para o PocketBase unificado (Opção B)
 * com fallback gracioso para fila local no localStorage caso o backend remoto
 * não esteja configurado ou inacessível.
 */
export async function enviarQuestionarioEstrategico(
  dados: Omit<QuestionarioSubmissionPayload, 'origem' | 'origemTipo' | 'status' | 'protocolo'> & {
    protocolo?: string
  },
): Promise<SendResult> {
  const protocolo = dados.protocolo || gerarProtocolo()

  const payloadCompleto: QuestionarioSubmissionPayload = {
    ...dados,
    origem: 'App',
    origemTipo: 'app',
    status: 'Novo',
    autorizacao_devolutiva: dados.autorizacao_devolutiva,
    formato_interesse: dados.formato_interesse,
    protocolo,
  }

  // Grava sempre no backup local imediato
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ULTIMO_PROTOCOLO, protocolo)
    localStorage.setItem('vm_ultimo_dossie', JSON.stringify(payloadCompleto))
  } catch {
    // quota safe
  }

  const client = getRemoteClient()
  if (!client) {
    salvarNaFilaLocal(payloadCompleto)
    return {
      sucesso: true,
      protocolo,
      armazenamento: 'local_fila',
      mensagem:
        'Protocolo gerado com sucesso. Dados preservados com segurança localmente para sincronização.',
    }
  }

  try {
    await authenticateRemote(client)
    const record = await client.collection('leads').create({
      protocolo,
      origem: 'App',
      origem_tipo: 'app',
      status: 'Novo',
      autorizacao_devolutiva: payloadCompleto.autorizacao_devolutiva,
      formato_interesse: payloadCompleto.formato_interesse,
      nome_completo: payloadCompleto.respondente,
      razao_social: payloadCompleto.razao_social,
      cnpj: payloadCompleto.cnpj,
      cargo: payloadCompleto.cargo,
      email: payloadCompleto.email_corporativo,
      whatsapp: payloadCompleto.whatsapp,
      setor: payloadCompleto.setor,
      segmento: payloadCompleto.segmento,
      responsavel_envio: payloadCompleto.documentacao.responsavel_envio,
      dados_completos: payloadCompleto,
      criado_em: new Date().toISOString(),
    })

    return {
      sucesso: true,
      protocolo,
      armazenamento: 'remoto',
      mensagem: 'Questionário Estratégico submetido com sucesso à base unificada.',
      recordId: record.id,
    }
  } catch (err: any) {
    console.warn('[LeadsClient] Backend remoto indisponível, guardando na fila:', err?.message)
    salvarNaFilaLocal(payloadCompleto)
    return {
      sucesso: true,
      protocolo,
      armazenamento: 'local_fila',
      mensagem:
        'Protocolo gerado. O backend remoto está temporariamente inacessível, dados retidos com segurança.',
    }
  }
}

/**
 * Envia cadastro para a Lista de Prioridade SaaS
 */
export async function enviarListaPrioridade(
  dados: Omit<
    ListaPrioridadePayload,
    'origem' | 'origemTipo' | 'status' | 'protocolo' | 'plano_interesse'
  > & {
    protocolo?: string
  },
): Promise<SendResult> {
  const protocolo = dados.protocolo || gerarProtocolo()

  const payloadCompleto: ListaPrioridadePayload = {
    ...dados,
    origem: 'Lista de Prioridade SaaS',
    origemTipo: 'saas_prioridade',
    status: 'Novo',
    protocolo,
    plano_interesse: 'SaaS Puro',
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ULTIMO_PROTOCOLO, protocolo)
    localStorage.setItem('vm_ultima_prioridade', JSON.stringify(payloadCompleto))
  } catch {
    // quota safe
  }

  const client = getRemoteClient()
  if (!client) {
    salvarNaFilaLocal(payloadCompleto)
    return {
      sucesso: true,
      protocolo,
      armazenamento: 'local_fila',
      mensagem:
        'Inscrição confirmada na Lista de Prioridade SaaS! Seu protocolo foi registrado localmente.',
    }
  }

  try {
    await authenticateRemote(client)
    const record = await client.collection('leads').create({
      protocolo,
      origem: 'Lista de Prioridade SaaS',
      origem_tipo: 'saas_prioridade',
      status: 'Novo',
      nome_completo: payloadCompleto.nome_completo,
      email: payloadCompleto.email_corporativo,
      whatsapp: payloadCompleto.whatsapp,
      razao_social: payloadCompleto.empresa,
      setor: payloadCompleto.setor,
      faturamento_mensal: payloadCompleto.faturamento_mensal,
      cargo: payloadCompleto.cargo_funcao,
      plano_interesse: 'SaaS Puro',
      dados_completos: payloadCompleto,
      criado_em: new Date().toISOString(),
    })

    return {
      sucesso: true,
      protocolo,
      armazenamento: 'remoto',
      mensagem: 'Inscrição confirmada na Lista de Prioridade SaaS!',
      recordId: record.id,
    }
  } catch (err: any) {
    console.warn(
      '[LeadsClient] Backend remoto indisponível para lista de prioridade:',
      err?.message,
    )
    salvarNaFilaLocal(payloadCompleto)
    return {
      sucesso: true,
      protocolo,
      armazenamento: 'local_fila',
      mensagem:
        'Inscrição registrada com sucesso! Seu protocolo foi guardado na fila para sincronização.',
    }
  }
}
