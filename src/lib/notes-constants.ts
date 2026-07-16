export const PRIORITIES = ['Alta', 'Média', 'Baixa'] as const
export type Priority = (typeof PRIORITIES)[number]

export const STATUSES = ['A Fazer', 'Em Progresso', 'Concluído'] as const
export type Status = (typeof STATUSES)[number]

export const PRIORITY_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  Alta: {
    label: 'Alta',
    badgeClass: 'bg-red-500/10 text-red-600 border-red-500/20',
    dotClass: 'bg-red-500',
  },
  Média: {
    label: 'Média',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    dotClass: 'bg-amber-500',
  },
  Baixa: {
    label: 'Baixa',
    badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    dotClass: 'bg-blue-500',
  },
}

export const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string; columnClass: string }
> = {
  'A Fazer': {
    label: 'A Fazer',
    badgeClass: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    dotClass: 'bg-slate-500',
    columnClass: 'border-slate-300',
  },
  'Em Progresso': {
    label: 'Em Progresso',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    dotClass: 'bg-amber-500',
    columnClass: 'border-amber-300',
  },
  Concluído: {
    label: 'Concluído',
    badgeClass: 'bg-green-500/10 text-green-600 border-green-500/20',
    dotClass: 'bg-green-500',
    columnClass: 'border-green-300',
  },
}

export const TAG_SUGGESTIONS = [
  'Decisão Técnica',
  'Ideia',
  'Plano de Ação',
  'Bug',
  'Estratégia',
  'Reunião',
  'Design',
]
