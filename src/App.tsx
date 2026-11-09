import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/protected-route'
import { AdminRoute } from '@/components/admin-route'
import { OperacionalRoute } from '@/components/operacional-route'
import { IngestaoRoute } from '@/components/ingestao-route'
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
import AdminUsersPage from '@/pages/AdminUsersPage'
import AdminIngestao from '@/pages/AdminIngestao'
import RecuperarSenha from '@/pages/RecuperarSenha'
import RedefinirSenha from '@/pages/RedefinirSenha'

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
const App = () => (
  <TooltipProvider delayDuration={0}>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<InstitucionalVendedora />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/privacidade" element={<PrivacidadeLGPD />} />

          {/* Rotas Protegidas com Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* 1. Início da Jornada — E0: operacional (admin, consultor, user legado) */}
              <Route element={<OperacionalRoute />}>
                <Route path="/app" element={<Index />} />

                {/* 2. As 8 Fases */}
                <Route path="/fases" element={<Diagnosticos />} />

                {/* 3. Projetos e Planos de Ação */}
                <Route path="/projetos" element={<PlanoDeAcao />} />
                <Route path="/plano-de-acao" element={<Navigate to="/projetos" replace />} />

                {/* 4. Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* 5. Curadoria */}
                <Route path="/curadoria" element={<Navigate to="/dashboard#curadoria" replace />} />
              </Route>

              {/* 6. Biblioteca */}
              <Route path="/biblioteca" element={<Biblioteca />} />

              {/* 7. Apoio Operacional */}
              <Route path="/notas" element={<Notas />} />

              {/* Páginas de suporte */}
              <Route path="/modelos" element={<Modelos />} />
              <Route path="/areas-da-empresa" element={<AreasDaEmpresa />} />
              <Route path="/niveis-e-planos" element={<NiveisEPlanos />} />
              <Route path="/diagnosticos" element={<Diagnosticos />} />
              <Route path="/resultados" element={<Resultados />} />
              <Route path="/questionario" element={<Questionario />} />
              <Route path="/questionario/sucesso" element={<QuestionarioSucesso />} />
            </Route>
          </Route>

          {/* Rotas Admin com Layout */}
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/leads" element={<AdminLeads />} />
              <Route path="/admin/convites" element={<AdminInvites />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
              <Route path="/admin/metricas" element={<AdminMetrics />} />
              <Route path="/admin/biblioteca" element={<AdminDivergencias />} />
              <Route path="/admin/divergencias" element={<AdminDivergencias />} />
              <Route path="/admin/usuarios" element={<AdminUsersPage />} />
              {/* ETAPA E2-B — Ingestão do Pacote V2.0: admin + consultor (cliente/user → /app) */}
              <Route element={<IngestaoRoute />}>
                <Route path="/admin/ingestao" element={<AdminIngestao />} />
              </Route>
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </TooltipProvider>
)

export default App
