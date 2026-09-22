import { Link } from 'react-router-dom'
import { LayoutDashboard, History, Mail, Shield, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const adminTools = [
  {
    title: 'Dashboard de Métricas',
    description: 'Visualize estatísticas das notas por status e prioridade em tempo real.',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
  },
  {
    title: 'Gerenciar Convites',
    description: 'Convide novos membros da equipe e gerencie funções de acesso.',
    icon: Mail,
    path: '/admin/convites',
  },
  {
    title: 'Logs de Auditoria',
    description: 'Acompanhe todas as ações de criação, edição e exclusão no sistema.',
    icon: History,
    path: '/admin/logs',
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#FF9900] uppercase tracking-wider mb-1">
            <span>Governança & Administração</span>
            <span className="text-[#808080]">•</span>
            <span>Vetor Master V7.2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0066CC]" />
            Painel Administrativo
          </h1>
          <p className="text-xs md:text-sm text-[#333333] mt-1">
            Ferramentas de gestão, governança de usuários e monitoramento operacional.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool) => (
          <Link key={tool.path} to={tool.path}>
            <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <tool.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {tool.title}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
