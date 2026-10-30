import { Link, useLocation } from 'react-router-dom'
import {
  ListTodo,
  LayoutDashboard,
  BookOpen,
  Shield,
  History,
  GitCompare,
  Mail,
  StickyNote,
  Users,
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
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar'

/**
 * MENU LATERAL OFICIAL VETOR MASTER — PORTAL DO CLIENTE CaaS (5 SEÇÕES):
 * 1. Dashboard (/dashboard)
 * 2. Plano de Ação (/plano-de-acao)
 * 3. Curadoria (/dashboard#curadoria)
 * 4. Biblioteca (/biblioteca)
 * 5. Apoio Operacional (/notas)
 */
const clientPortalNavItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, step: '1' },
  { title: 'Plano de Ação', path: '/plano-de-acao', icon: ListTodo, step: '2' },
  { title: 'Curadoria', path: '/dashboard#curadoria', icon: Shield, step: '3' },
  { title: 'Biblioteca', path: '/biblioteca', icon: BookOpen, step: '4' },
  { title: 'Apoio Operacional', path: '/notas', icon: StickyNote, step: '5' },
]

const adminNavItems = [
  { title: 'Painel Geral', path: '/admin', icon: Shield },
  { title: 'Leads do Site', path: '/admin/leads', icon: Users },
  { title: 'Métricas Admin', path: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Biblioteca Profissional', path: '/admin/biblioteca', icon: BookOpen },
  { title: 'Log de Divergências', path: '/admin/divergencias', icon: GitCompare },
  { title: 'Logs de Auditoria', path: '/admin/logs', icon: History },
  { title: 'Gestão de Convites', path: '/admin/convites', icon: Mail },
]

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()
  const { isAdmin } = useAuth()
  const isCollapsed = state === 'collapsed'

  const navItemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 px-3 py-2 transition-all duration-200 rounded-[4px] mx-2 text-xs font-medium',
      isActive
        ? 'bg-[#16213A] border border-[#5B9DFF]/40 text-[#F8FAFC] shadow-sm font-semibold'
        : 'text-[#C7D0E0] hover:bg-[#16213A] hover:text-[#F8FAFC]',
    )

  const iconClass = (isActive: boolean) =>
    cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-[#3DDC74]' : 'text-[#8B98B4]')

  const renderItem = (item: { title: string; path: string; icon: any; step?: string }) => {
    const itemPathOnly = item.path.split('#')[0]
    const itemHash = item.path.includes('#') ? `#${item.path.split('#')[1]}` : ''
    const isActive = itemHash
      ? location.pathname === itemPathOnly && location.hash === itemHash
      : location.pathname === itemPathOnly && (!location.hash || item.path === '/dashboard')
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <Link to={item.path} className={navItemClass(isActive)}>
            <item.icon className={iconClass(isActive)} />
            {!isCollapsed && <span className="flex-1 truncate tracking-tight">{item.title}</span>}
            {!isCollapsed && item.step && (
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.2 rounded',
                  isActive ? 'bg-white/20 text-white' : 'text-white/40',
                )}
              >
                0{item.step}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar className="border-r border-[#24334F] bg-[#111A2E] text-[#F8FAFC]">
      <SidebarHeader className="h-24 flex items-center justify-center px-2 border-b border-[#24334F]">
        <div className="flex items-center justify-center w-full overflow-hidden">
          <Link to="/" className="flex items-center justify-center w-full focus:outline-none py-1">
            <Logo
              variant={isCollapsed ? 'icon' : 'horizontal'}
              size={isCollapsed ? 'md' : 'sm'}
              showTagline={!isCollapsed}
              showVersion={false}
            />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-2 py-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-[#8B98B4] px-4">
              Portal do Cliente CaaS
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{clientPortalNavItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-[#FFB84D] px-4 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Governança & Admin
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">{adminNavItems.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-[#24334F] p-2 bg-[#0B1120]/50">
        <div className="px-3 py-2 flex items-center justify-between text-[11px] text-[#8B98B4]">
          {!isCollapsed && <span>VETOR MASTER</span>}
          <span className="font-mono text-[10px] text-[#3DDC74] font-semibold">
            V7.2 DETERMINÍSTICO
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
