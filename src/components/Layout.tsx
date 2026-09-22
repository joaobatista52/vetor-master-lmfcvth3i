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
  '/': 'Início',
  '/diagnosticos': 'Diagnóstico',
  '/resultados': 'Resultados e Devolutiva',
  '/plano-de-acao': 'Plano de Ação',
  '/dashboard': 'Dashboard',
  '/biblioteca': 'Biblioteca',
  '/niveis-e-planos': 'Níveis e Planos',
  '/questionario': 'Questionário Estrutural V7.2',
  '/questionario/sucesso': 'Relatório Devolutivo V7.2',
  '/notas': 'Notas do Projeto',
  '/modelos': 'Modelos & Templates',
  '/admin': 'Painel Geral Admin',
  '/admin/dashboard': 'Métricas do Projeto',
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
      <div className="flex min-h-screen bg-white w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 border-b border-[#E0E0E0] bg-white z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-[#333333] hover:text-[#0066CC] transition-colors" />
              <Breadcrumb className="hidden sm:block">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/"
                      className="text-[#808080] hover:text-[#0066CC] transition-colors text-xs font-medium"
                    >
                      Início
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-[#808080]/50" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-[#0066CC] text-xs">
                      {currentPage}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-[#808080]" />
                <Input
                  placeholder="Buscar estratégias, frameworks..."
                  className="pl-8 h-8 w-60 bg-[#F5F5F5] border-[#E0E0E0] text-xs text-[#333333] placeholder:text-[#808080] rounded-[4px] focus-visible:ring-1 focus-visible:ring-[#0066CC]"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 text-[#333333] hover:bg-[#F5F5F5] rounded-[4px] transition-colors"
              >
                <Bell className="w-4 h-4 text-[#333333]" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#22B14C] rounded-full" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-[4px] bg-[#F5F5F5] border border-[#E0E0E0] text-[#0066CC] hover:bg-[#0066CC] hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border border-[#E0E0E0] rounded-[4px] shadow-md"
                >
                  <DropdownMenuLabel className="text-xs text-[#333333]">
                    Minha Conta
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs cursor-pointer hover:bg-[#F5F5F5]"
                    onClick={() => navigate('/niveis-e-planos')}
                  >
                    Níveis e Planos (Escada de Valor)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs cursor-pointer hover:bg-[#F5F5F5]"
                    onClick={() => navigate('/biblioteca')}
                  >
                    Biblioteca Estratégica (138 Obras)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs text-red-600 cursor-pointer hover:bg-red-50"
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

          <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in bg-white">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
