import { useState, useEffect, useCallback } from 'react'
import { Users as UsersIcon, Shield, User as UserIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtime } from '@/hooks/use-realtime'
import { getAllUsers, updateUserRole, type UserRecord } from '@/services/users'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

export function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldErrors>>({})

  const load = useCallback(async () => {
    try {
      setUsers(await getAllUsers())
    } catch {
      toast.error('Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('users', () => {
    load()
  })

  const handleRoleChange = async (id: string, role: string) => {
    setUpdating(id)
    setFieldErrors((prev) => ({ ...prev, [id]: {} }))
    try {
      await updateUserRole(id, role)
      toast.success('Role atualizada com sucesso!')
      load()
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, [id]: extractFieldErrors(err) }))
      toast.error('Erro ao atualizar role.')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <Skeleton className="h-64 w-full rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[60px]">Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) => handleRoleChange(u.id, v)}
                      disabled={updating === u.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">admin</SelectItem>
                        <SelectItem value="user">user</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors[u.id]?.role && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors[u.id].role}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.role === 'admin' ? (
                      <Shield className="w-4 h-4 text-primary" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
