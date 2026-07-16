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

const adminNavItems = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Logs', path: '/admin/logs', icon: History },
  { title: 'Convites', path: '/admin/convites', icon: Mail },
  { title: 'Painel Admin', path: '/admin', icon: Shield },
]

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()
  const { isAdmin } = useAuth()
  const isCollapsed = state === 'collapsed'

  const navItemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 transition-all duration-200 rounded-md mx-2',
      isActive
        ? 'bg-sidebar-accent text-sidebar-foreground font-medium before:absolute before:left-0 before:h-8 before:w-1 before:bg-primary before:rounded-r-full'
        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
    )

  const iconClass = (isActive: boolean) => cn('w-5 h-5 shrink-0', isActive ? 'text-primary' : '')

  const renderItem = (item: (typeof navItems)[number]) => {
    const isActive = location.pathname === item.path
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <Link to={item.path} className={navItemClass(isActive)}>
            <item.icon className={iconClass(isActive)} />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center justify-center px-4 border-b border-sidebar-border/50">
        <div className="flex items-center w-full overflow-hidden whitespace-nowrap">
          <Logo
            className={cn('shrink-0', isCollapsed ? 'h-12 w-12' : 'h-[3.75rem]')}
            variant={isCollapsed ? 'icon' : 'full'}
            showText={!isCollapsed}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4 gap-2">
              {navItems.map(renderItem)}
              {isAdmin && adminNavItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configurações">
              <Link
                to="#"
                className="flex items-center gap-3 px-3 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 mx-2 rounded-md"
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
