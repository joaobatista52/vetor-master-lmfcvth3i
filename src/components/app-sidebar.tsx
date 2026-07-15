import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Stethoscope,
  ListTodo,
  FileText,
  LineChart,
  Settings,
  Compass,
  StickyNote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-border/50">
        <div className="flex items-center gap-2 w-full font-bold text-xl text-primary overflow-hidden whitespace-nowrap">
          <Compass className="w-8 h-8 shrink-0 text-primary" />
          {!isCollapsed && <span>Vetor Master</span>}
        </div>{' '}
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
