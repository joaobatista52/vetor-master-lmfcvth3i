import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, User } from 'lucide-react'
import { AppSidebar } from './app-sidebar'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/hooks/use-auth'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const routeNames: Record<string, string> = {
  '/app': 'Início da Jornada',
  '/diagnosticos': 'Diagnóstico Estrutural',
  '/resultados': 'Resultados & Devolutiva',
  '/plano-de-acao': 'Plano de Ação Guiado',
  '/dashboard': 'Dashboard Executivo',
  '/areas-da-empresa': 'Áreas da Empresa',
  '/biblioteca': 'Biblioteca do Cliente',
  '/niveis-e-planos': 'Níveis e Planos (Escada de Valor)',
  '/questionario': 'Diagnóstico Setorial V7.2',
  '/questionario/sucesso': 'Relatório Devolutivo V7.2',
  '/notas': 'Notas do Projeto',
  '/modelos': 'Modelos & Templates',
  '/admin': 'Painel Geral Admin',
  '/admin/dashboard': 'Métricas do Projeto',
  '/admin/biblioteca': 'Biblioteca Profissional (Admin)',
  '/admin/logs': 'Logs de Auditoria',
  '/admin/convites': 'Gestão de Convites',
}

export default function Layout() {
  const location = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const currentPage = routeNames[location.pathname] || 'Página'

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#0B1120] text-[#F8FAFC] w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 w-full overflow-hidden bg-[#0B1120]">
          <header className="h-16 flex items-center justify-between px-6 border-b border-[#24334F] bg-[#111A2E]/95 backdrop-blur-md z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-[#C7D0E0] hover:text-[#5B9DFF] transition-colors" />
              <Breadcrumb className="hidden sm:block">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/"
                      className="text-[#8B98B4] hover:text-[#5B9DFF] transition-colors text-xs font-medium"
                    >
                      Início
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-[#8B98B4]/50" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-[#5B9DFF] text-xs">
                      {currentPage}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-[#8B98B4]" />
                <Input
                  placeholder="Buscar estratégias, frameworks..."
                  className="pl-8 h-8 w-60 bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px] focus-visible:ring-1 focus-visible:ring-[#5B9DFF]"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 text-[#C7D0E0] hover:bg-[#16213A] rounded-[4px] transition-colors"
              >
                <Bell className="w-4 h-4 text-[#C7D0E0]" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#3DDC74] rounded-full" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-[4px] bg-[#16213A] border border-[#24334F] text-[#5B9DFF] hover:bg-[#5B9DFF]/15 transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-[#16213A] border border-[#24334F] text-[#F8FAFC] rounded-[4px] shadow-xl"
                >
                  <DropdownMenuLabel className="text-xs text-[#C7D0E0]">
                    Minha Conta
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#24334F]" />
                  <DropdownMenuItem
                    className="text-xs cursor-pointer text-[#C7D0E0] hover:bg-[#1B2742] hover:text-[#F8FAFC]"
                    onClick={() => navigate('/niveis-e-planos')}
                  >
                    Níveis e Planos (Escada de Valor)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs cursor-pointer text-[#C7D0E0] hover:bg-[#1B2742] hover:text-[#F8FAFC]"
                    onClick={() => navigate('/biblioteca')}
                  >
                    Biblioteca (Perguntas, Respostas & Insights)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#24334F]" />
                  <DropdownMenuItem
                    className="text-xs text-red-400 cursor-pointer hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => {
                      signOut()
                      navigate('/login')
                    }}
                  >
                    Sair da Plataforma
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in bg-[#0B1120] text-[#F8FAFC]">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
