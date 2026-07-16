import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PriorityBadge } from './priority-badge'
import { STATUSES, STATUS_CONFIG } from '@/lib/notes-constants'
import type { NotaProjeto } from '@/services/notas_projeto'
import { cn } from '@/lib/utils'

interface KanbanBoardProps {
  notas: NotaProjeto[]
  onEdit: (nota: NotaProjeto) => void
  onDelete: (id: string) => void
  onStatusChange?: (id: string, status: string) => void
}

export function KanbanBoard({ notas, onEdit, onDelete, onStatusChange }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (draggedId && onStatusChange) {
      onStatusChange(draggedId, status)
    }
    setDraggedId(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STATUSES.map((status) => {
        const config = STATUS_CONFIG[status]
        const columnNotas = notas.filter((n) => (n.status || 'A Fazer') === status)
        return (
          <div
            key={status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
            className={cn(
              'rounded-xl border-t-4 bg-secondary/30 p-3 min-h-[200px] transition-colors',
              config.columnClass,
              draggedId && 'ring-2 ring-primary/20',
            )}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', config.dotClass)} />
                <h3 className="font-semibold text-sm">{config.label}</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {columnNotas.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {columnNotas.map((nota) => (
                <Card
                  key={nota.id}
                  draggable={!!onStatusChange}
                  onDragStart={(e) => handleDragStart(e, nota.id)}
                  className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium leading-tight flex-1">{nota.title}</h4>
                      <PriorityBadge priority={nota.priority} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                      {nota.content}
                    </p>
                    {nota.tags && nota.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {nota.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => onEdit(nota)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => onDelete(nota.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {columnNotas.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">Nenhuma nota</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
