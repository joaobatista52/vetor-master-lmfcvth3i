import { Badge } from '@/components/ui/badge'
import { STATUS_CONFIG } from '@/lib/notes-constants'
import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status]
  if (!config) return null
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium text-xs', config.badgeClass)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </Badge>
  )
}
