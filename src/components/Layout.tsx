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
  '/': 'Dashboard Principal',
  '/diagnosticos': 'Central de Diagnósticos',
  '/plano-de-acao': 'Plano de Ação Estratégico',
  '/modelos': 'Modelos & Templates',
  '/notas': 'Notas do Projeto',
  '/resultados': 'Avaliação de Resultados',
  '/admin': 'Painel Administrativo',
  '/admin/dashboard': 'Dashboard de Métricas',
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
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border bg-sidebar z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors" />
              <Logo className="h-12 shrink-0" showText={false} />
              <Breadcrumb className="hidden sm:block">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/"
                      className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
                    >
                      Início
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-sidebar-foreground/40" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium text-sidebar-foreground">
                      {currentPage}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-sidebar-foreground/50" />
                <Input
                  placeholder="Buscar estratégias..."
                  className="pl-9 w-64 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-sidebar-accent transition-colors"
              >
                <Bell className="w-5 h-5 text-sidebar-foreground/70" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent rounded-full border border-sidebar" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-sidebar-accent text-sidebar-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil do Fundador</DropdownMenuItem>
                  <DropdownMenuItem>Assinatura & Faturamento</DropdownMenuItem>
                  <DropdownMenuItem>Configurações da Empresa</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
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

          <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
