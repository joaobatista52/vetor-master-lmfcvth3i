import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Trash2, Pencil, FileText } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRealtime } from '@/hooks/use-realtime'
import { getAllNotas, deleteNota, type NotaProjeto } from '@/services/notas_projeto'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/notes-constants'
import { NoteEditDialog } from '@/components/admin/note-edit-dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function AdminNotes() {
  const [notas, setNotas] = useState<NotaProjeto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editNota, setEditNota] = useState<NotaProjeto | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setNotas(await getAllNotas())
    } catch {
      toast.error('Erro ao carregar notas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('notas_projeto', () => {
    load()
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return notas
    return notas.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.userName || '').toLowerCase().includes(q),
    )
  }, [notas, search])

  const handleEdit = (nota: NotaProjeto) => {
    setEditNota(nota)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteNota(deleteId)
      toast.success('Nota excluída!')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Erro ao excluir.')
    }
  }

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, conteúdo ou usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhuma nota encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell className="font-medium max-w-xs truncate">{nota.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {nota.userName || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(PRIORITY_CONFIG[nota.priority]?.badgeClass)}
                    >
                      {nota.priority || 'Média'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(STATUS_CONFIG[nota.status]?.badgeClass)}>
                      {nota.status || 'A Fazer'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(nota)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(nota.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <NoteEditDialog
        nota={editNota}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={load}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir nota?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A nota será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
