export const PRIORITIES = ['Alta', 'Média', 'Baixa'] as const
export type Priority = (typeof PRIORITIES)[number]

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

export const TAG_SUGGESTIONS = [
  'Decisão Técnica',
  'Ideia',
  'Plano de Ação',
  'Bug',
  'Estratégia',
  'Reunião',
  'Design',
]
