import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/protected-route'
import { AdminRoute } from '@/components/admin-route'
import Layout from './components/Layout'
import Index from './pages/Index'
import Diagnosticos from './pages/Diagnosticos'
import PlanoDeAcao from './pages/PlanoDeAcao'
import Modelos from './pages/Modelos'
import Notas from './pages/Notas'
import Resultados from './pages/Resultados'
import Biblioteca from './pages/Biblioteca'
import NiveisEPlanos from './pages/NiveisEPlanos'
import AdminDashboard from './pages/AdminDashboard'
import AdminMetrics from './pages/AdminMetrics'
import AdminLogsPage from './pages/AdminLogs'
import AdminInvitesPage from './pages/AdminInvites'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Questionario from './pages/Questionario'
import QuestionarioSucesso from './pages/QuestionarioSucesso'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Jornada Oficial Vetor Master V7.2 */}
              <Route path="/" element={<Index />} />
              <Route path="/diagnosticos" element={<Diagnosticos />} />
              <Route path="/resultados" element={<Resultados />} />
              <Route path="/plano-de-acao" element={<PlanoDeAcao />} />
              <Route path="/dashboard" element={<AdminMetrics />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/niveis-e-planos" element={<NiveisEPlanos />} />

              {/* Fluxos de Questionário e Recursos Complementares */}
              <Route path="/questionario" element={<Questionario />} />
              <Route path="/questionario/sucesso" element={<QuestionarioSucesso />} />
              <Route path="/notas" element={<Notas />} />
              <Route path="/modelos" element={<Modelos />} />
            </Route>
          </Route>
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminMetrics />} />
              <Route path="/admin/logs" element={<AdminLogsPage />} />
              <Route path="/admin/convites" element={<AdminInvitesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
