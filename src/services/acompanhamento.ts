/**
 * Serviço de Acompanhamento Consolidado CaaS — Fase F1
 * Consome a rota backend GET /backend/v1/diagnostico/acompanhamento/{leadId}
 * Criada no backend (commit 0.0.167) para consolidar Planos de Ação, OKRs e Curadoria.
 */

import pb from '@/lib/pocketbase/client'
import type { Tarefa5W2H } from '@/services/planos_acao'

export interface PlanoAcompanhamentoItem {
  id: string
  status: string
  fase_origem: number
  versao_diagnostico: number
  curadoria_vinculada: string
  tarefas_5w2h: Tarefa5W2H[]
}

export interface OKRAcompanhamentoItem {
  id: string
  progresso: number
  fase_origem: number
  curadoria_vinculada: string
}

export interface CuradoriaAcompanhamento {
  nivel_assinatura: string
  fases_desatualizadas: number[]
  ultima_curadoria: string | null
  planos_vinculados: number
}

export interface FaseAcompanhamentoItem {
  fase: number
  versao: number
  status: string
  artefatos: Record<string, unknown> | null
  updated: string
}

export interface OkrVinculado {
  id: string
  objetivo: string
  perspectiva: string
  area: string | null
  progresso: number
}

export interface EpifaniaItem {
  enunciado: string
  pilar: 1 | 2 | 3 | null
  area_critica: string | null
  secao_fonte: string | null
  valor: string | null
  fase_origem: number
  status: 'Não reconhecida' | 'Reconhecida' | 'Endereçada' | 'Resolvida' | string
  okr_vinculado: OkrVinculado | null
}

export interface AcompanhamentoResponse {
  fases?: FaseAcompanhamentoItem[]
  planos_acao: PlanoAcompanhamentoItem[]
  okrs: OKRAcompanhamentoItem[]
  epifanias?: EpifaniaItem[]
  curadoria: CuradoriaAcompanhamento
}

export type CodigoErroAcompanhamento =
  | 'NAO_AUTORIZADO'
  | 'LEAD_NAO_ENCONTRADO'
  | 'DIAGNOSTICO_NAO_ENCONTRADO'
  | 'SEM_SESSAO'
  | 'ERRO_GENERICO'

export interface BuscarAcompanhamentoResult {
  success: boolean
  data?: AcompanhamentoResponse
  codigoErro?: CodigoErroAcompanhamento
  error?: string
}

/**
 * Busca os dados consolidados de acompanhamento do lead
 * Replicando padrão de URL base, autenticação e tratamento de erro de consultor-digital.ts
 */
export async function buscarAcompanhamento(leadId: string): Promise<BuscarAcompanhamentoResult> {
  const token = pb.authStore.token
  if (!token) {
    return {
      success: false,
      codigoErro: 'SEM_SESSAO',
      error: 'Sessão expirada ou não autenticada. Faça login para continuar.',
    }
  }

  const baseUrl = import.meta.env.VITE_POCKETBASE_URL || ''

  try {
    const response = await fetch(
      `${baseUrl}/backend/v1/diagnostico/acompanhamento/${encodeURIComponent(leadId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const erroBackend = errData?.erro || ''

      if (response.status === 403 || erroBackend === 'NAO_AUTORIZADO') {
        return {
          success: false,
          codigoErro: 'NAO_AUTORIZADO',
          error: 'Acesso restrito ao perfil de administração.',
        }
      }

      if (
        response.status === 404 ||
        erroBackend === 'LEAD_NAO_ENCONTRADO' ||
        erroBackend === 'DIAGNOSTICO_NAO_ENCONTRADO'
      ) {
        return {
          success: false,
          codigoErro:
            erroBackend === 'LEAD_NAO_ENCONTRADO'
              ? 'LEAD_NAO_ENCONTRADO'
              : 'DIAGNOSTICO_NAO_ENCONTRADO',
          error:
            erroBackend === 'LEAD_NAO_ENCONTRADO'
              ? 'Lead não encontrado para acompanhamento.'
              : 'Diagnóstico não encontrado para o lead informado.',
        }
      }

      return {
        success: false,
        codigoErro: 'ERRO_GENERICO',
        error:
          errData?.mensagem ||
          errData?.error ||
          `Erro HTTP ${response.status} ao carregar acompanhamento consolidado.`,
      }
    }

    const data: AcompanhamentoResponse = await response.json()
    return {
      success: true,
      data,
    }
  } catch (err: any) {
    return {
      success: false,
      codigoErro: 'ERRO_GENERICO',
      error: err?.message || 'Falha na comunicação com o serviço de acompanhamento.',
    }
  }
}
