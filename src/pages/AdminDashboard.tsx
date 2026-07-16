import { useState, useEffect, useCallback } from 'react'
import { Shield, StickyNote, Users, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getAllNotas,
  getAllUsers,
  updateNotaAdmin,
  deleteNotaAdmin,
  updateUserRole,
  type AdminNota,
  type AdminUser,
} from '@/services/admin'
import { AdminNotesTable } from '@/components/AdminNotesTable'
import { AdminUsersList } from '@/components/AdminUsersList'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const [notas, setNotas] = useState<AdminNota[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadNotas = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await getAllNotas()
      setNotas(data)
    } catch {
      toast.error('Erro ao carregar notas.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch {
      toast.error('Erro ao carregar usuários.')
    }
  }, [])

  useEffect(() => {
    loadNotas()
    loadUsers()
  }, [loadNotas, loadUsers])

  useRealtime('notas_projeto', () => {
    loadNotas(true)
  })

  useRealtime('users', () => {
    loadUsers()
  })

  const handleEditNota = async (
    id: string,
    data: Partial<{
      title: string
      content: string
      priority: string
      status: string
      tags: string[]
    }>,
  ) => {
    setSaving(true)
    setFieldErrors({})
    try {
      await updateNotaAdmin(id, data)
      toast.success('Nota atualizada com sucesso!')
      await loadNotas(true)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast.error('Erro ao atualizar nota.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNota = async (id: string) => {
    try {
      await deleteNotaAdmin(id)
      toast.success('Nota excluída com sucesso!')
      await loadNotas(true)
    } catch {
      toast.error('Erro ao excluir nota.')
    }
  }

  const handleRoleChange = async (userId: string, role: string) => {
    setSaving(true)
    setFieldErrors({})
    try {
      await updateUserRole(userId, role)
      toast.success('Role atualizada com sucesso!')
      await loadUsers()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast.error('Erro ao atualizar role.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as notas e usuários da plataforma.
          </p>
        </div>
        {refreshing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Atualizando...
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Notas
            </CardTitle>
            <StickyNote className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{notas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Usuários
            </CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notas">
        <TabsList>
          <TabsTrigger value="notas">Notas</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="notas" className="mt-4">
          {loading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : (
            <AdminNotesTable
              notas={notas}
              onEdit={handleEditNota}
              onDelete={handleDeleteNota}
              saving={saving}
              fieldErrors={fieldErrors}
            />
          )}
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <AdminUsersList
            users={users}
            onRoleChange={handleRoleChange}
            saving={saving}
            fieldErrors={fieldErrors}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
