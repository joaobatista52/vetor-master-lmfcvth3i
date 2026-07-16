import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Stethoscope,
  ListTodo,
  FileText,
  LineChart,
  Settings,
  StickyNote,
  Shield,
  History,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar'

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Diagnósticos', path: '/diagnosticos', icon: Stethoscope },
  { title: 'Plano de Ação', path: '/plano-de-acao', icon: ListTodo },
  { title: 'Modelos de Negócio', path: '/modelos', icon: FileText },
  { title: 'Notas', path: '/notas', icon: StickyNote },
  { title: 'Resultados', path: '/resultados', icon: LineChart },
]

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()
  const { isAdmin } = useAuth()
  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-border/50">
        <div className="flex items-center w-full overflow-hidden whitespace-nowrap">
          <Logo
            className={cn('shrink-0', isCollapsed ? 'h-8 w-8' : 'h-8')}
            showText={!isCollapsed}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4 gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 transition-all rounded-md mx-2',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium before:absolute before:left-0 before:h-8 before:w-1 before:bg-primary before:rounded-r-full'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )}
                      >
                        <item.icon
                          className={cn('w-5 h-5 shrink-0', isActive ? 'text-primary' : '')}
                        />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              {isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard">
                      <Link
                        to="/admin/dashboard"
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 transition-all rounded-md mx-2',
                          location.pathname === '/admin/dashboard'
                            ? 'bg-primary/10 text-primary font-medium before:absolute before:left-0 before:h-8 before:w-1 before:bg-primary before:rounded-r-full'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )}
                      >
                        <LayoutDashboard
                          className={cn(
                            'w-5 h-5 shrink-0',
                            location.pathname === '/admin/dashboard' ? 'text-primary' : '',
                          )}
                        />
                        {!isCollapsed && <span>Dashboard</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Logs">
                      <Link
                        to="/admin/logs"
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 transition-all rounded-md mx-2',
                          location.pathname === '/admin/logs'
                            ? 'bg-primary/10 text-primary font-medium before:absolute before:left-0 before:h-8 before:w-1 before:bg-primary before:rounded-r-full'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )}
                      >
                        <History
                          className={cn(
                            'w-5 h-5 shrink-0',
                            location.pathname === '/admin/logs' ? 'text-primary' : '',
                          )}
                        />
                        {!isCollapsed && <span>Logs</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Convites">
                      <Link
                        to="/admin/convites"
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 transition-all rounded-md mx-2',
                          location.pathname === '/admin/convites'
                            ? 'bg-primary/10 text-primary font-medium before:absolute before:left-0 before:h-8 before:w-1 before:bg-primary before:rounded-r-full'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )}
                      >
                        <Mail
                          className={cn(
                            'w-5 h-5 shrink-0',
                            location.pathname === '/admin/convites' ? 'text-primary' : '',
                          )}
                        />
                        {!isCollapsed && <span>Convites</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Painel Admin">
                      <Link
                        to="/admin"
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 transition-all rounded-md mx-2',
                          location.pathname === '/admin'
                            ? 'bg-primary/10 text-primary font-medium before:absolute before:left-0 before:h-8 before:w-1 before:bg-primary before:rounded-r-full'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )}
                      >
                        <Shield
                          className={cn(
                            'w-5 h-5 shrink-0',
                            location.pathname === '/admin' ? 'text-primary' : '',
                          )}
                        />
                        {!isCollapsed && <span>Painel Admin</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configurações">
              <Link
                to="#"
                className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground mx-2"
              >
                <Settings className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Configurações</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
