import { useEffect } from 'react'
import { Route, Switch, useLocation, Navigate } from 'wouter'
import { TooltipProvider } from '@/components/ui/tooltip'
import ScrollToTop from '@/components/ScrollToTop'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/protected-route'
import { AdminRoute } from '@/components/admin-route'
import Layout from '@/components/Layout'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import InstitucionalVendedora from '@/pages/InstitucionalVendedora'
import PrivacidadeLGPD from '@/pages/PrivacidadeLGPD'
import Dashboard from '@/pages/Dashboard'
import Resultados from '@/pages/Resultados'
import PlanoDeAcao from '@/pages/PlanoDeAcao'
import Biblioteca from '@/pages/Biblioteca'
import Notas from '@/pages/Notas'
import Modelos from '@/pages/Modelos'
import AreasDaEmpresa from '@/pages/AreasDaEmpresa'
import NiveisEPlanos from '@/pages/NiveisEPlanos'
import Questionario from '@/pages/Questionario'
import QuestionarioSucesso from '@/pages/QuestionarioSucesso'
import Diagnosticos from '@/pages/Diagnosticos'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import Admin from '@/pages/Admin'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminLeads from '@/pages/AdminLeads'
import AdminInvites from '@/pages/AdminInvites'
import AdminLogs from '@/pages/AdminLogs'
import AdminMetrics from '@/pages/AdminMetrics'
import AdminDivergencias from '@/pages/AdminDivergencias'

/**
 * ROTEADOR — FASE F5-BIS-A (7 seções da régua lateral, ordem canônica):
 *   1. Início da Jornada      → /app          (Index.tsx)
 *   2. As 8 Fases             → /fases        (Diagnosticos.tsx)
 *   3. Projetos e Planos      → /projetos     (PlanoDeAcao.tsx)
 *   4. Dashboard              → /dashboard    (Dashboard.tsx)
 *   5. Curadoria              → /dashboard#curadoria
 *   6. Biblioteca             → /biblioteca   (Biblioteca.tsx)
 *   7. Apoio Operacional      → /notas        (Notas.tsx)
 *
 * A rota pública "/" permanece com a página institucional/vendedora (divergência
 * declarada: a régua usa "/app" para o Início da Jornada, preservando a página
 * institucional intacta). A rota legada /plano-de-acao redireciona para /projetos.
 */
const RedirectPlanoDeAcao = () => <Navigate replace to="/projetos" />
const RedirectCuradoria = () => <Navigate replace to="/dashboard#curadoria" />

const Router = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash === '#curadoria') {
      const el = document.getElementById('curadoria')
      if (el) {
        // aguarda o conteúdo assíncrono do Dashboard montar antes de rolar
        const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
        return () => clearTimeout(t)
      }
    }
  }, [hash, pathname])

  return (
    <Switch>
      {/* Públicas */}
      <Route path="/" component={InstitucionalVendedora} />
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/privacidade" component={PrivacidadeLGPD} />

      {/* 1. Início da Jornada */}
      <Route path="/app">
        <ProtectedRoute>
          <Layout>
            <Index />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* 2. As 8 Fases */}
      <Route path="/fases">
        <ProtectedRoute>
          <Layout>
            <Diagnosticos />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* 3. Projetos e Planos de Ação (rota legada /plano-de-acao redireciona para cá) */}
      <Route path="/projetos">
        <ProtectedRoute>
          <Layout>
            <PlanoDeAcao />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/plano-de-acao">
        <RedirectPlanoDeAcao />
      </Route>

      {/* 4. Dashboard */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* 5. Curadoria */}
      <Route path="/curadoria">
        <RedirectCuradoria />
      </Route>

      {/* 6. Biblioteca */}
      <Route path="/biblioteca">
        <ProtectedRoute>
          <Layout>
            <Biblioteca />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* 7. Apoio Operacional */}
      <Route path="/notas">
        <ProtectedRoute>
          <Layout>
            <Notas />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* Páginas de suporte */}
      <Route path="/modelos">
        <ProtectedRoute>
          <Layout>
            <Modelos />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/areas-da-empresa">
        <ProtectedRoute>
          <Layout>
            <AreasDaEmpresa />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/niveis-e-planos">
        <ProtectedRoute>
          <Layout>
            <NiveisEPlanos />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/diagnosticos">
        <ProtectedRoute>
          <Layout>
            <Diagnosticos />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/resultados">
        <ProtectedRoute>
          <Layout>
            <Resultados />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/questionario">
        <ProtectedRoute>
          <Layout>
            <Questionario />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/questionario/sucesso">
        <ProtectedRoute>
          <Layout>
            <QuestionarioSucesso />
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* Admin */}
      <Route path="/admin">
        <AdminRoute>
          <Layout>
            <Admin />
          </Layout>
        </AdminRoute>
      </Route>
      <Route path="/admin/dashboard">
        <AdminRoute>
          <Layout>
            <AdminDashboard />
          </Layout>
        </AdminRoute>
      </Route>
      <Route path="/admin/leads">
        <AdminRoute>
          <Layout>
            <AdminLeads />
          </Layout>
        </AdminRoute>
      </Route>
      <Route path="/admin/convites">
        <AdminRoute>
          <Layout>
            <AdminInvites />
          </Layout>
        </AdminRoute>
      </Route>
      <Route path="/admin/logs">
        <AdminRoute>
          <Layout>
            <AdminLogs />
          </Layout>
        </AdminRoute>
      </Route>
      <Route path="/admin/metricas">
        <AdminRoute>
          <Layout>
            <AdminMetrics />
          </Layout>
        </AdminRoute>
      </Route>
      <Route path="/admin/biblioteca">
        <AdminRoute>
          <Layout>
            <AdminDivergencias />
          </Layout>
        </AdminRoute>
      </Route>
      <Route path="/admin/divergencias">
        <AdminRoute>
          <Layout>
            <AdminDivergencias />
          </Layout>
        </AdminRoute>
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  )
}

const App = () => (
  <TooltipProvider delayDuration={0}>
    <ScrollToTop />
    <AuthProvider>
      <Router />
    </AuthProvider>
  </TooltipProvider>
)

export default App
