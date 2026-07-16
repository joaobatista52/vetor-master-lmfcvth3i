import { useEffect, useState, useCallback } from 'react'
import { Mail, Plus, Trash2, Loader2, UserPlus, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRealtime } from '@/hooks/use-realtime'
import { getConvites, createConvite, deleteConvite, type Convite } from '@/services/convites'
import { toast } from 'sonner'

export default function AdminInvites() {
  const [convites, setConvites] = useState<Convite[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await getConvites()
      setConvites(data)
    } catch (err) {
      console.error('Failed to load convites:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('convites', () => {
    loadData()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Informe um e-mail válido')
      return
    }
    setSubmitting(true)
    try {
      await createConvite({ email: email.trim(), role })
      toast.success('Convite enviado com sucesso!')
      setEmail('')
      setRole('user')
    } catch (err: any) {
      const msg = err?.response?.message || 'Erro ao criar convite'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteConvite(id)
      toast.success('Convite removido')
    } catch {
      toast.error('Erro ao remover convite')
    }
  }

  const roleBadge = (r: string) =>
    r === 'admin' ? (
      <Badge variant="default">Admin</Badge>
    ) : (
      <Badge variant="secondary">Usuário</Badge>
    )

  const statusBadge = (s: string) =>
    s === 'Aceito' ? (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Aceito
      </Badge>
    ) : (
      <Badge variant="outline">
        <Clock className="w-3 h-3 mr-1" />
        Pendente
      </Badge>
    )

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Convites</h1>
        <p className="text-muted-foreground mt-1">Convide membros da equipe e gerencie acessos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Novo Convite
          </CardTitle>
          <CardDescription>Envie um convite por e-mail com a função selecionada</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 w-full sm:w-40">
              <Label htmlFor="role">Função</Label>
              <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'user')}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Enviar Convite
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Convites Existentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : convites.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum convite enviado ainda.</p>
          ) : (
            <div className="space-y-3">
              {convites.map((convite) => (
                <div
                  key={convite.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{convite.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {roleBadge(convite.role)}
                        {statusBadge(convite.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(convite.created).toLocaleDateString('pt-BR')}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(convite.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
