import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Activity,
  Award,
  ListTodo,
  LayoutDashboard,
  BookOpen,
  Layers,
  Settings,
  Shield,
  History,
  Mail,
  StickyNote,
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
 * MENU LATERAL OFICIAL VETOR MASTER — Ordem exata da jornada do cliente:
 * 1. Início (/)
 * 2. Diagnóstico (/diagnosticos)
 * 3. Resultados e Devolutiva (/resultados)
 * 4. Plano de Ação (/plano-de-acao)
 * 5. Dashboard (/dashboard)
 * 6. Biblioteca (/biblioteca)
 * 7. Níveis e Planos (/niveis-e-planos)
 */
const clientJourneyNavItems = [
  { title: 'Início', path: '/', icon: Home, step: '1' },
  { title: 'Diagnóstico', path: '/diagnosticos', icon: Activity, step: '2' },
  { title: 'Resultados e Devolutiva', path: '/resultados', icon: Award, step: '3' },
  { title: 'Plano de Ação', path: '/plano-de-acao', icon: ListTodo, step: '4' },
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, step: '5' },
  { title: 'Biblioteca', path: '/biblioteca', icon: BookOpen, step: '6' },
  { title: 'Níveis e Planos', path: '/niveis-e-planos', icon: Layers, step: '7' },
]

const complementaryNavItems = [{ title: 'Notas do Projeto', path: '/notas', icon: StickyNote }]

const adminNavItems = [
  { title: 'Painel Geral', path: '/admin', icon: Shield },
  { title: 'Métricas Admin', path: '/admin/dashboard', icon: LayoutDashboard },
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
        ? 'bg-[#0066CC] text-white shadow-sm font-semibold'
        : 'text-white/80 hover:bg-white/10 hover:text-white',
    )

  const iconClass = (isActive: boolean) =>
    cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-[#22B14C]' : 'text-white/70')

  const renderItem = (item: { title: string; path: string; icon: any; step?: string }) => {
    const isActive = location.pathname === item.path
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
    <Sidebar className="border-r border-[#333333] bg-[#333333] text-white">
      <SidebarHeader className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center w-full overflow-hidden whitespace-nowrap">
          <Logo
            variant={isCollapsed ? 'icon' : 'horizontal'}
            size={isCollapsed ? 'sm' : 'sm'}
            showTagline={!isCollapsed}
            showVersion={!isCollapsed}
            versionText="V7.2"
            negative
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-2 py-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-white/50 px-4">
              Jornada Estratégica
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{clientJourneyNavItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-white/50 px-4">
              Apoio Operacional
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{complementaryNavItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-[#FF9900] px-4 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Governança & Admin
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">{adminNavItems.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-2">
        <div className="px-3 py-2 flex items-center justify-between text-[11px] text-white/60">
          {!isCollapsed && <span>VETOR MASTER</span>}
          <span className="font-mono text-[10px] text-[#22B14C] font-semibold">
            V7.2 DETERMINÍSTICO
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
