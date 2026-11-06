import { AdminUsers } from '@/components/admin/admin-users'

/**
 * GESTÃO DE USUÁRIOS — ETAPA E0 (Papel Consultor)
 *
 * Página mínima de gestão de usuários em /admin/usuarios (acesso exclusivo do
 * admin via AdminRoute). Lista usuários (nome, email, role) e permite alterar
 * o role — incluindo a atribuição do novo papel "consultor".
 *
 * Somente o admin acessa: consultor e cliente não podem alterar role.
 */
export default function AdminUsersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os papéis de acesso (admin, consultor, cliente, user).
        </p>
      </div>
      <AdminUsers />
    </div>
  )
}
