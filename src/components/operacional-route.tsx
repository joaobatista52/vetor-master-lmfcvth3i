import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

/**
 * ROTA OPERACIONAL — ETAPA E0 (Papel Consultor)
 *
 * Wrapper idêntico ao ProtectedRoute, mas exigindo papel OPERACIONAL
 * (admin, consultor ou user legado) para /app, /dashboard e /projetos.
 *
 * Preservação: admin continua com acesso total; usuários "user" existentes
 * continuam acessando como antes; nenhum acesso pré-existente foi removido.
 */
export function OperacionalRoute() {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.role || !['admin', 'consultor', 'user'].includes(user.role)) {
    return <Navigate to="/notas" replace />
  }

  return <Outlet />
}
