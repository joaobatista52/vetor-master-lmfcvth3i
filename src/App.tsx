import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import Diagnosticos from './pages/Diagnosticos'
import PlanoDeAcao from './pages/PlanoDeAcao'
import Modelos from './pages/Modelos'
import Notas from './pages/Notas'
import Resultados from './pages/Resultados'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/diagnosticos" element={<Diagnosticos />} />
            <Route path="/plano-de-acao" element={<PlanoDeAcao />} />
            <Route path="/modelos" element={<Modelos />} />
            <Route path="/notas" element={<Notas />} />
            <Route path="/resultados" element={<Resultados />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
