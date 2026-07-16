import { useState, useMemo } from 'react'
import { Search, Pencil, Trash2, Save, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import type { AdminNota } from '@/services/admin'
import { PRIORITIES, STATUSES, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/notes-constants'
import type { FieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'

interface AdminNotesTableProps {
  notas: AdminNota[]
  onEdit: (
    id: string,
    data: Partial<{
      title: string
      content: string
      priority: string
      status: string
      tags: string[]
    }>,
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
  saving: boolean
  fieldErrors: FieldErrors
}

export function AdminNotesTable({
  notas,
  onEdit,
  onDelete,
  saving,
  fieldErrors,
}: AdminNotesTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [editNota, setEditNota] = useState<AdminNota | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState('Média')
  const [status, setStatus] = useState('A Fazer')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return notas.filter((n) => {
      if (
        q &&
        !n.title.toLowerCase().includes(q) &&
        !n.content.toLowerCase().includes(q) &&
        !n.userName.toLowerCase().includes(q)
      )
        return false
      if (statusFilter && (n.status || 'A Fazer') !== statusFilter) return false
      return true
    })
  }, [notas, search, statusFilter])

  const openEdit = (nota: AdminNota) => {
    setEditNota(nota)
    setTitle(nota.title)
    setContent(nota.content)
    setPriority(nota.priority || 'Média')
    setStatus(nota.status || 'A Fazer')
  }

  const handleSave = async () => {
    if (!editNota) return
    await onEdit(editNota.id, { title: title.trim(), content: content.trim(), priority, status })
    setEditNota(null)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await onDelete(deleteId)
    setDeleteId(null)
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, conteúdo ou usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter || 'all'}
          onValueChange={(v) => setStatusFilter(v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Usuário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Prioridade</TableHead>
              <TableHead className="hidden lg:table-cell">Criado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhuma nota encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((nota) => {
                const sConfig = STATUS_CONFIG[nota.status || 'A Fazer']
                const pConfig = PRIORITY_CONFIG[nota.priority || 'Média']
                return (
                  <TableRow key={nota.id}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={nota.title}>
                      {nota.title}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {nota.userName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('gap-1.5', sConfig.badgeClass)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', sConfig.dotClass)} />
                        {sConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className={cn('gap-1.5', pConfig.badgeClass)}>
                        {pConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(nota.created).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(nota)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(nota.id)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editNota} onOpenChange={(open) => !open && setEditNota(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Editar Nota (Admin)</DialogTitle>
            <DialogDescription>
              Editando nota de {editNota?.userName || 'usuário'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
              {fieldErrors.title && <p className="text-sm text-red-500">{fieldErrors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="resize-none"
              />
              {fieldErrors.content && <p className="text-sm text-red-500">{fieldErrors.content}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNota(null)} className="gap-1">
              <X className="w-4 h-4" /> Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1">
              <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
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
    </>
  )
}
