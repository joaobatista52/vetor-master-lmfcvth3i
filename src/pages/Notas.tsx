import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus,
  Search,
  StickyNote,
  Save,
  X,
  Download,
  LayoutGrid,
  Columns3,
  FileText,
  FileArchive,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getNotas,
  createNota,
  updateNota,
  deleteNota,
  type NotaProjeto,
} from '@/services/notas_projeto'
import { PRIORITIES, STATUSES, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/notes-constants'
import { NoteCard } from '@/components/notes/note-card'
import { KanbanBoard } from '@/components/notes/kanban-board'
import { TagsInput } from '@/components/notes/tags-input'
import { exportAsText, exportAsPDF } from '@/lib/export-utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Notas() {
  const { user } = useAuth()
  const [notas, setNotas] = useState<NotaProjeto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState('Média')
  const [status, setStatus] = useState('A Fazer')
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadNotas = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await getNotas()
      setNotas(data)
    } catch {
      toast.error('Erro ao carregar notas.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadNotas()
  }, [loadNotas])

  useRealtime('notas_projeto', () => {
    loadNotas(true)
  })

  const allTags = useMemo(() => {
    const set = new Set<string>()
    notas.forEach((n) => (n.tags || []).forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [notas])

  const filteredNotas = useMemo(() => {
    const q = search.toLowerCase().trim()
    return notas.filter((n) => {
      if (
        q &&
        !n.title.toLowerCase().includes(q) &&
        !n.content.toLowerCase().includes(q) &&
        !(n.tags || []).some((t) => t.toLowerCase().includes(q))
      ) {
        return false
      }
      if (statusFilter && (n.status || 'A Fazer') !== statusFilter) return false
      if (priorityFilter && (n.priority || 'Média') !== priorityFilter) return false
      if (tagFilter && !(n.tags || []).includes(tagFilter)) return false
      return true
    })
  }, [notas, search, statusFilter, priorityFilter, tagFilter])

  const openCreate = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setPriority('Média')
    setStatus('A Fazer')
    setTags([])
    setDialogOpen(true)
  }

  const openEdit = (nota: NotaProjeto) => {
    setEditingId(nota.id)
    setTitle(nota.title)
    setContent(nota.content)
    setPriority(nota.priority || 'Média')
    setStatus(nota.status || 'A Fazer')
    setTags(nota.tags || [])
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!user?.id || !title.trim() || !content.trim()) {
      toast.error('Preencha título e conteúdo.')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateNota(editingId, {
          title: title.trim(),
          content: content.trim(),
          priority,
          status,
          tags,
        })
        toast.success('Nota atualizada com sucesso!')
      } else {
        await createNota({
          title: title.trim(),
          content: content.trim(),
          user: user.id,
          priority,
          status,
          tags,
        })
        toast.success('Nota criada com sucesso!')
      }
      setDialogOpen(false)
      await loadNotas(true)
    } catch {
      toast.error('Erro ao salvar nota.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateNota(id, { status: newStatus })
      toast.success('Status atualizado com sucesso!')
      await loadNotas(true)
    } catch {
      toast.error('Erro ao atualizar status.')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteNota(deleteId)
      toast.success('Nota excluída com sucesso!')
      setDeleteId(null)
      await loadNotas(true)
    } catch {
      toast.error('Erro ao excluir nota.')
    } finally {
      setDeleting(false)
    }
  }

  const handleExportText = () => {
    if (filteredNotas.length === 0) {
      toast.error('Nenhuma nota para exportar.')
      return
    }
    exportAsText(filteredNotas)
    toast.success('Arquivo TXT exportado!')
  }

  const handleExportPDF = () => {
    if (filteredNotas.length === 0) {
      toast.error('Nenhuma nota para exportar.')
      return
    }
    exportAsPDF(filteredNotas)
    toast.success('PDF gerado!')
  }

  const toggleStatusFilter = (s: string) => {
    setStatusFilter((prev) => (prev === s ? null : s))
  }

  const togglePriorityFilter = (p: string) => {
    setPriorityFilter((prev) => (prev === p ? null : p))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notas do Projeto</h1>
          <p className="text-muted-foreground mt-1">
            Registre decisões importantes e mantenha o histórico do seu projeto.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 shadow-sm">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportText} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                Exportar como Texto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                <FileArchive className="w-4 h-4" />
                Exportar como PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="gap-2 shadow-sm" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Nova Nota
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, conteúdo ou tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 border rounded-lg p-1 bg-card">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="gap-1"
              onClick={() => setViewMode('list')}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              className="gap-1"
              onClick={() => setViewMode('kanban')}
            >
              <Columns3 className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1">Status:</span>
          {STATUSES.map((s) => {
            const config = STATUS_CONFIG[s]
            const active = statusFilter === s
            return (
              <button
                key={s}
                onClick={() => toggleStatusFilter(s)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  active
                    ? config.badgeClass + ' ring-1 ring-offset-1 ring-offset-background'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted',
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
                {config.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground mr-1">Prioridade:</span>
          {PRIORITIES.map((p) => {
            const config = PRIORITY_CONFIG[p]
            const active = priorityFilter === p
            return (
              <button
                key={p}
                onClick={() => togglePriorityFilter(p)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  active
                    ? config.badgeClass + ' ring-1 ring-offset-1 ring-offset-background'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted',
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
                {config.label}
              </button>
            )
          })}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 w-full">
              <span className="text-xs font-medium text-muted-foreground mr-1">Tags:</span>
              {allTags.map((t) => {
                const active = tagFilter === t
                return (
                  <button
                    key={t}
                    onClick={() => setTagFilter((prev) => (prev === t ? null : t))}
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all',
                      active
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-card text-muted-foreground border-border hover:bg-muted',
                    )}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          )}
          {(statusFilter || priorityFilter || tagFilter) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => {
                setStatusFilter(null)
                setPriorityFilter(null)
                setTagFilter(null)
              }}
            >
              <X className="w-3 h-3" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {refreshing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Atualizando...
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredNotas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <StickyNote className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {search || statusFilter || priorityFilter || tagFilter
                ? 'Nenhuma nota encontrada'
                : 'Nenhuma nota ainda'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || statusFilter || priorityFilter || tagFilter
                ? 'Tente outro termo de busca ou filtro.'
                : 'Crie sua primeira nota para começar a registrar suas decisões.'}
            </p>
            {!search && !statusFilter && !priorityFilter && !tagFilter && (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeira Nota
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          notas={filteredNotas}
          onEdit={openEdit}
          onDelete={(id) => setDeleteId(id)}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotas.map((nota) => (
            <NoteCard
              key={nota.id}
              nota={nota}
              onEdit={() => openEdit(nota)}
              onDelete={() => setDeleteId(nota.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Nota' : 'Nova Nota'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Atualize as informações da sua nota.'
                : 'Preencha as informações para criar uma nova nota.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Digite o título da nota..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
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
                placeholder="Escreva o conteúdo da nota..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagsInput tags={tags} onChange={setTags} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="gap-1">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1">
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
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
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
