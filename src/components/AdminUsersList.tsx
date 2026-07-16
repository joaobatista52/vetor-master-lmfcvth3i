import { useState } from 'react'
import { Shield, User as UserIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminUser } from '@/services/admin'
import type { FieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'

interface AdminUsersListProps {
  users: AdminUser[]
  onRoleChange: (userId: string, role: string) => Promise<void>
  saving: boolean
  fieldErrors: FieldErrors
}

export function AdminUsersList({ users, onRoleChange, saving, fieldErrors }: AdminUsersListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="hidden sm:table-cell">Criado</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {u.role === 'admin' ? (
                      <Shield className="w-4 h-4 text-primary" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                    {u.name || '—'}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  {editingId === u.id ? (
                    <Select
                      defaultValue={u.role}
                      onValueChange={(v) => onRoleChange(u.id, v).then(() => setEditingId(null))}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">admin</SelectItem>
                        <SelectItem value="user">user</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant="outline"
                      className={cn(
                        u.role === 'admin' && 'bg-primary/10 text-primary border-primary/20',
                      )}
                    >
                      {u.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {new Date(u.created).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(editingId === u.id ? null : u.id)}
                  >
                    {editingId === u.id ? 'Cancelar' : 'Alterar role'}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {fieldErrors.role && <p className="text-sm text-red-500 mt-2 px-4">{fieldErrors.role}</p>}
    </div>
  )
}
