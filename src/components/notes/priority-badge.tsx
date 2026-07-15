import { Badge } from '@/components/ui/badge'
import { PRIORITY_CONFIG } from '@/lib/notes-constants'
import { cn } from '@/lib/utils'

export function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority]
  if (!config) return null
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium text-xs', config.badgeClass)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </Badge>
  )
}
