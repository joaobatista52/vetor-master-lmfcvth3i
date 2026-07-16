import { Pencil, Trash2, StickyNote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PriorityBadge } from './priority-badge'
import { StatusBadge } from './status-badge'
import type { NotaProjeto } from '@/services/notas_projeto'

interface NoteCardProps {
  nota: NotaProjeto
  onEdit: () => void
  onDelete: () => void
}

export function NoteCard({ nota, onEdit, onDelete }: NoteCardProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-all hover:-translate-y-1 duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <StickyNote className="w-5 h-5" />
          </div>
          <CardTitle className="text-lg leading-tight truncate">{nota.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={nota.status} />
          <PriorityBadge priority={nota.priority} />
          <Badge variant="outline" className="font-normal text-xs">
            {formatDate(nota.created)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
          {nota.content}
        </p>
        {nota.tags && nota.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {nota.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
