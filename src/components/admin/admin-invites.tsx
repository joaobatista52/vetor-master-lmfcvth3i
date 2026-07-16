import { useState, useEffect, useCallback } from 'react'
import { Mail, Trash2, UserPlus, Clock } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { getConvites, createConvite, deleteConvite, type Convite } from '@/services/convites'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STATUS_BADGE: Record<string, string> = {
  Pendente: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Aceito: 'bg-green-500/10 text-green-600 border-green-500/20',
}

export function AdminInvites() {
  const [convites, setConvites] = useState<Convite[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setConvites(await getConvites())
    } catch {
      toast.error('Erro ao carregar convites.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('convites', () => load())

  const handleInvite = async () => {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Informe um email válido.')
      return
    }
    setSaving(true)
    try {
      await createConvite({ email: trimmed, role })
      toast.success('Convite enviado com sucesso!')
      setEmail('')
      load()
    } catch {
      toast.error('Erro ao criar convite. Talvez o email já esteja convidado.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteConvite(deleteId)
      toast.success('Convite revogado!')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Erro ao revogar convite.')
    }
  }

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />

  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-4 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Convidar Novo Usuário</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
          </div>
          <div className="w-full sm:w-40 space-y-2">
            <Label>Função</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInvite} disabled={saving} className="gap-2 w-full sm:w-auto">
            <Mail className="w-4 h-4" />
            {saving ? 'Enviando...' : 'Enviar Convite'}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead className="w-[120px]">Função</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[180px]">Criado em</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {convites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhum convite enviado.
                </TableCell>
              </TableRow>
            ) : (
              convites.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.role}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(STATUS_BADGE[c.status])}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(c.created).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {c.status === 'Pendente' && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar convite?</AlertDialogTitle>
            <AlertDialogDescription>
              O convite será removido e o usuário não poderá se registrar através dele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
