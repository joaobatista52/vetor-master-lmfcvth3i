import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { STATUSES, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/notes-constants'
import { PriorityBadge } from './priority-badge'
import { StatusBadge } from './status-badge'
import { cn } from '@/lib/utils'
import type { NotaProjeto } from '@/services/notas_projeto'

interface KanbanBoardProps {
  notas: NotaProjeto[]
  onEdit: (nota: NotaProjeto) => void
  onDelete: (id: string) => void
}

export function KanbanBoard({ notas, onEdit, onDelete }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STATUSES.map((status) => {
        const config = STATUS_CONFIG[status]
        const items = notas.filter((n) => (n.status || 'A Fazer') === status)
        return (
          <div
            key={status}
            className={cn(
              'flex flex-col rounded-xl border-2 bg-muted/30 min-h-[300px]',
              config.columnClass,
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bg-card rounded-t-lg">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', config.dotClass)} />
                <span className="font-semibold text-sm">{config.label}</span>
              </div>
              <Badge variant="secondary" className="text-xs font-normal">
                {items.length}
              </Badge>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Nenhuma tarefa aqui.
                </p>
              ) : (
                items.map((nota) => (
                  <Card key={nota.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <span className="text-sm font-semibold leading-tight">{nota.title}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <StatusBadge status={nota.status} />
                        <PriorityBadge priority={nota.priority} />
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                        {nota.content}
                      </p>
                      {nota.tags && nota.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {nota.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] font-normal py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1"
                          onClick={() => onEdit(nota)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(nota.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
