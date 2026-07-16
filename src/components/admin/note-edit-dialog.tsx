import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { TagsInput } from '@/components/notes/tags-input'
import { Save, X } from 'lucide-react'
import { PRIORITIES, STATUSES } from '@/lib/notes-constants'
import { updateNota, type NotaProjeto } from '@/services/notas_projeto'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

interface NoteEditDialogProps {
  nota: NotaProjeto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function NoteEditDialog({ nota, open, onOpenChange, onSaved }: NoteEditDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState('Média')
  const [status, setStatus] = useState('A Fazer')
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (nota) {
      setTitle(nota.title)
      setContent(nota.content)
      setPriority(nota.priority || 'Média')
      setStatus(nota.status || 'A Fazer')
      setTags(nota.tags || [])
      setFieldErrors({})
    }
  }, [nota])

  const handleSave = async () => {
    if (!nota) return
    setSaving(true)
    setFieldErrors({})
    try {
      await updateNota(nota.id, {
        title: title.trim(),
        content: content.trim(),
        priority,
        status,
        tags,
      })
      toast.success('Nota atualizada com sucesso!')
      onOpenChange(false)
      onSaved()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast.error('Erro ao atualizar nota.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Editar Nota</DialogTitle>
          <DialogDescription>Atualize as informações da nota.</DialogDescription>
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
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagsInput tags={tags} onChange={setTags} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-1">
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
  )
}
