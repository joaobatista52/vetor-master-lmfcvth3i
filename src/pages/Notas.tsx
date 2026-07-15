import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Search, StickyNote, Save, X } from 'lucide-react'
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
import { PRIORITIES } from '@/lib/notes-constants'
import { NoteCard } from '@/components/notes/note-card'
import { TagsInput } from '@/components/notes/tags-input'
import { toast } from 'sonner'

export default function Notas() {
  const { user } = useAuth()
  const [notas, setNotas] = useState<NotaProjeto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState('Média')
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadNotas = useCallback(async () => {
    try {
      const data = await getNotas()
      setNotas(data)
    } catch {
      toast.error('Erro ao carregar notas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotas()
  }, [loadNotas])

  useRealtime('notas_projeto', () => {
    loadNotas()
  })

  const filteredNotas = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return notas
    return notas.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q)),
    )
  }, [notas, search])

  const openCreate = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setPriority('Média')
    setTags([])
    setDialogOpen(true)
  }

  const openEdit = (nota: NotaProjeto) => {
    setEditingId(nota.id)
    setTitle(nota.title)
    setContent(nota.content)
    setPriority(nota.priority || 'Média')
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
          tags,
        })
        toast.success('Nota atualizada com sucesso!')
      } else {
        await createNota({
          title: title.trim(),
          content: content.trim(),
          user: user.id,
          priority,
          tags,
        })
        toast.success('Nota criada com sucesso!')
      }
      setDialogOpen(false)
    } catch {
      toast.error('Erro ao salvar nota.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteNota(deleteId)
      toast.success('Nota excluída com sucesso!')
      setDeleteId(null)
    } catch {
      toast.error('Erro ao excluir nota.')
    } finally {
      setDeleting(false)
    }
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
        <Button className="gap-2 shadow-sm" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Nova Nota
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, conteúdo ou tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

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
              {search ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search
                ? 'Tente outro termo de busca.'
                : 'Crie sua primeira nota para começar a registrar suas decisões.'}
            </p>
            {!search && (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeira Nota
              </Button>
            )}
          </CardContent>
        </Card>
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
