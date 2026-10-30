import pb from '@/lib/pocketbase/client'

export interface Tarefa5W2H {
  what: string
  why: string
  where: string
  when: string
  who: string
  how: string
  howMuch: string
}

export interface PlanoAcao {
  id: string
  user: string
  diagnostico: string
  tarefas_5w2h: Tarefa5W2H[]
  status: string
  fase_origem?: number
  versao_diagnostico?: number
  curadoria_vinculada?: string
  created: string
  updated: string
}

export const getPlanosAcao = async (): Promise<PlanoAcao[]> => {
  const records = await pb.collection('planos_acao').getFullList({ sort: '-created' })
  return records.map((r: any) => ({
    id: r.id,
    user: r.user,
    diagnostico: r.diagnostico || '',
    tarefas_5w2h: Array.isArray(r.tarefas_5w2h) ? r.tarefas_5w2h : [],
    status: r.status || 'A Fazer',
    fase_origem:
      typeof r.fase_origem === 'number'
        ? r.fase_origem
        : r.fase_origem
          ? Number(r.fase_origem)
          : undefined,
    versao_diagnostico:
      typeof r.versao_diagnostico === 'number'
        ? r.versao_diagnostico
        : r.versao_diagnostico
          ? Number(r.versao_diagnostico)
          : undefined,
    curadoria_vinculada: r.curadoria_vinculada || undefined,
    created: r.created,
    updated: r.updated,
  })) as PlanoAcao[]
}

export const createPlanoAcao = async (data: {
  user: string
  diagnostico?: string
  tarefas_5w2h?: Tarefa5W2H[]
  status?: string
  fase_origem?: number
  versao_diagnostico?: number
  curadoria_vinculada?: string
}): Promise<PlanoAcao> => {
  const r: any = await pb.collection('planos_acao').create(data)
  return {
    id: r.id,
    user: r.user,
    diagnostico: r.diagnostico || '',
    tarefas_5w2h: r.tarefas_5w2h || [],
    status: r.status || 'A Fazer',
    fase_origem:
      typeof r.fase_origem === 'number'
        ? r.fase_origem
        : r.fase_origem
          ? Number(r.fase_origem)
          : undefined,
    versao_diagnostico:
      typeof r.versao_diagnostico === 'number'
        ? r.versao_diagnostico
        : r.versao_diagnostico
          ? Number(r.versao_diagnostico)
          : undefined,
    curadoria_vinculada: r.curadoria_vinculada || undefined,
    created: r.created,
    updated: r.updated,
  } as PlanoAcao
}

export const updatePlanoAcao = async (id: string, data: Partial<PlanoAcao>): Promise<PlanoAcao> => {
  const r: any = await pb.collection('planos_acao').update(id, data)
  return {
    id: r.id,
    user: r.user,
    diagnostico: r.diagnostico || '',
    tarefas_5w2h: r.tarefas_5w2h || [],
    status: r.status || 'A Fazer',
    fase_origem:
      typeof r.fase_origem === 'number'
        ? r.fase_origem
        : r.fase_origem
          ? Number(r.fase_origem)
          : undefined,
    versao_diagnostico:
      typeof r.versao_diagnostico === 'number'
        ? r.versao_diagnostico
        : r.versao_diagnostico
          ? Number(r.versao_diagnostico)
          : undefined,
    curadoria_vinculada: r.curadoria_vinculada || undefined,
    created: r.created,
    updated: r.updated,
  } as PlanoAcao
}

export const deletePlanoAcao = async (id: string): Promise<void> => {
  await pb.collection('planos_acao').delete(id)
}
