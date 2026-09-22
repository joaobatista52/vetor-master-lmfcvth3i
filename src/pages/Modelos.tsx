import { useState } from 'react'
import { Search, Download, FileSpreadsheet, FileText, LayoutTemplate, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const templates = [
  {
    title: 'Matriz de Delegação (RACI)',
    category: 'Gestão',
    format: 'Planilha',
    desc: 'Clarifique papéis e responsabilidades dentro da equipe para evitar centralização.',
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    title: 'POP - Procedimento Operacional',
    category: 'Operações',
    format: 'Documento',
    desc: 'Template padrão para documentar qualquer processo da sua empresa.',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    title: 'Dashboard de Indicadores (KPIs)',
    category: 'Financeiro',
    format: 'Planilha',
    desc: 'Controle os números vitais do negócio em uma única visão.',
    icon: LayoutTemplate,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    title: 'Estruturação de Reunião 1:1',
    category: 'Pessoas',
    format: 'Documento',
    desc: 'Roteiro prático para liderar e desenvolver sua equipe diretamente.',
    icon: FileText,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
]

export default function Modelos() {
  const [search, setSearch] = useState('')

  const filtered = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-[#F5F5F5] border border-[#E0E0E0] p-6 rounded-[4px] relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#0066CC] uppercase tracking-wider mb-1">
            <span>Modelos & Templates</span>
            <span className="text-[#808080]">•</span>
            <span>Vetor Master V7.2</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0066CC] mb-2">
            Modelos de Negócio e Templates
          </h1>
          <p className="text-[#333333] text-sm leading-relaxed">
            Biblioteca operacional de ativos e ferramentas táticas. Não reinvente a roda: baixe e
            aplique metodologias validadas pela governança C-Level.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou categoria..."
            className="pl-9 bg-card shadow-sm border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1.5 px-3"
          >
            Todos
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-secondary transition-colors py-1.5 px-3"
          >
            Operações
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-secondary transition-colors py-1.5 px-3"
          >
            Gestão
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item, idx) => (
          <Card
            key={idx}
            className="flex flex-col h-full hover:shadow-md transition-all hover:-translate-y-1 duration-300"
          >
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${item.bg} ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="font-normal text-xs">
                  {item.category}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="text-sm line-clamp-3">{item.desc}</CardDescription>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4 border-t border-border/50 bg-secondary/20">
              <Button variant="outline" size="sm" className="flex-1 bg-background">
                <Eye className="w-4 h-4 mr-2" />
                Prévia
              </Button>
              <Button size="sm" className="px-3">
                <Download className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Nenhum modelo encontrado para "{search}".
          </div>
        )}
      </div>
    </div>
  )
}
