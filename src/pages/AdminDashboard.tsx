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
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground mt-1">
          Ferramentas de gestão e monitoramento do Vetor Master
        </p>
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
