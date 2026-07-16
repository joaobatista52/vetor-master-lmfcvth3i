import { AdminInvites } from '@/components/admin/admin-invites'

export default function AdminInvitesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Convites</h1>
        <p className="text-muted-foreground mt-1">
          Convide novos membros para a plataforma e gerencie seus acessos.
        </p>
      </div>
      <AdminInvites />
    </div>
  )
}
