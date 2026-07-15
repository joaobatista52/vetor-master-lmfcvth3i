import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, StickyNote, Save, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { toast } from 'sonner'

export default function Notas() {
  const { user } = useAuth()
  const [notas, setNotas] = useState<NotaProjeto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
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

  const openCreate = () => {
    setEditingId(null)
    setTitle('')
    setContent('')
    setDialogOpen(true)
  }

  const openEdit = (nota: NotaProjeto) => {
    setEditingId(nota.id)
    setTitle(nota.title)
    setContent(nota.content)
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
        await updateNota(editingId, { title: title.trim(), content: content.trim() })
        toast.success('Nota atualizada com sucesso!')
      } else {
        await createNota({ title: title.trim(), content: content.trim(), user: user.id })
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : notas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <StickyNote className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Nenhuma nota ainda</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie sua primeira nota para começar a registrar suas decisões.
            </p>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeira Nota
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notas.map((nota) => (
            <Card
              key={nota.id}
              className="flex flex-col h-full hover:shadow-md transition-all hover:-translate-y-1 duration-300 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <StickyNote className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg leading-tight truncate">{nota.title}</CardTitle>
                  </div>
                </div>
                <Badge variant="outline" className="font-normal text-xs w-fit">
                  {formatDate(nota.created)}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {nota.content}
                </p>
                <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => openEdit(nota)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(nota.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Nota' : 'Nova Nota'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Atualize o título ou conteúdo da sua nota.'
                : 'Preencha as informações abaixo para criar uma nova nota.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Digite o título da nota..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Conteúdo</label>
              <Textarea
                placeholder="Escreva o conteúdo da nota..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
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
