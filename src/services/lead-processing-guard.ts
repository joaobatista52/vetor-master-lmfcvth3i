/**
 * Motor de Processamento Estratégico de Leads e Diagnósticos (Onda 2)
 *
 * REGRAS CAPITAIS DE FILA E PROCESSAMENTO AUTOMÁTICO:
 * 1. Leads com status 'lista_espera' NUNCA devem ser processados automaticamente.
 *    Eles pertencem à Lista de Prioridade (espera comercial / sem dossiê aprovado)
 *    e devem ser estritamente IGNORADOS por qualquer fila ou rotina de processamento automático.
 * 2. Leads com status 'teste' são exclusivos para homologação e não entram no fluxo de clientes reais.
 * 3. Somente leads com status 'novo' (ou após aprovação manual pelo Admin) são elegíveis para
 *    a fila de processamento automático e geração de diagnóstico pelo Consultor Digital.
 */

import pb from '@/lib/pocketbase/client'
import type { LeadRecord } from '@/services/site-leads-sync'

export interface ProcessingEligibilityResult {
  podeProcessar: boolean
  motivoBloqueio?: string
  modoTestePermitido?: boolean
}

/**
 * Guarda central de elegibilidade de processamento.
 * Garante que leads em 'lista_espera' ou 'teste' NUNCA sejam disparados para processamento automático
 * em produção, exceto quando explicitamente executados sob modo de teste / dry-run controlado.
 */
export function verificarElegibilidadeProcessamento(
  lead: Partial<LeadRecord> | null | undefined,
  opcoes?: { permitirModoTeste?: boolean },
): ProcessingEligibilityResult {
  if (!lead) {
    return {
      podeProcessar: false,
      motivoBloqueio: 'Lead nulo ou não encontrado.',
    }
  }

  const status = (lead.status || '').toLowerCase().trim()

  // REGRA 4 DO USUÁRIO: O processamento automático deve IGNORAR sempre leads com status 'lista_espera'
  if (status === 'lista_espera') {
    return {
      podeProcessar: false,
      motivoBloqueio:
        'Leads em Lista de Prioridade / Lista de Espera requerem acompanhamento comercial e aprovação manual do Admin.',
    }
  }

  // Leads de teste: bloqueados na fila automática de produção;
  // contudo, no modo de teste explícito (dry-run com supressão de envios), o processamento da cópia é liberado.
  if (status === 'teste') {
    if (opcoes?.permitirModoTeste) {
      return {
        podeProcessar: true,
        modoTestePermitido: true,
      }
    }
    return {
      podeProcessar: false,
      motivoBloqueio: 'Lead marcado como teste (modo de teste não ativado na rotina automática).',
    }
  }

  // Apenas 'novo' pode entrar na fila de processamento padrão
  if (status !== 'novo') {
    return {
      podeProcessar: false,
      motivoBloqueio: `Status atual '${lead.status}' não permite novo processamento.`,
    }
  }

  return {
    podeProcessar: true,
  }
}

/**
 * Consulta a fila de leads elegíveis para processamento automático (Onda 2).
 * IGNORA estritamente 'lista_espera' e 'teste'.
 */
export async function getFilaLeadsParaProcessamento(): Promise<LeadRecord[]> {
  try {
    // Filtro PocketBase explícito garantindo que lista_espera seja ignorado
    const records = await pb.collection('leads').getFullList<LeadRecord>({
      filter: 'status = "novo"',
      sort: 'created',
    })

    // Dupla verificação em memória através da guarda de elegibilidade
    return records.filter((l) => verificarElegibilidadeProcessamento(l).podeProcessar)
  } catch (err) {
    console.error('Falha ao consultar fila de processamento de leads:', err)
    return []
  }
}
