import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

/**
 * ROTA DE INGESTÃO — ETAPA E2-B
 * Acesso EXCLUSIVO a admin e consultor (Regra Capital: ingestão é operação
 * interna de admin/consultor — cliente e user legado redirecionados para /app).
 */
export function IngestaoRoute() {
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

  if (!user?.role || !['admin', 'consultor'].includes(user.role)) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
