import { useState } from 'react'
import { Search, BookOpen, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { bibliotecaV24, areasBibliotecaV24, type ObraBiblioteca } from '@/data/biblioteca-v24'

export default function Biblioteca() {
  const [search, setSearch] = useState('')
  const [selectedArea, setSelectedArea] = useState<number | null>(null)

  const areaTitleMap: Record<number, string> = {
    1: 'Estratégia, Competitividade e Modelos de Negócio',
    2: 'Execução, Processos e Qualidade',
    3: 'Liderança, Cultura e Governança',
    4: 'Inovação, Startups e Tecnologia',
    5: 'Marketing, Vendas e Growth',
    6: 'Finanças, Controladoria e Economia',
    7: 'Desenvolvimento Pessoal, Eficácia e Mindset',
    8: 'Foresight Estratégico e Prospectiva',
  }

  const filteredObras = bibliotecaV24.filter((obra: ObraBiblioteca) => {
    const matchesSearch =
      search === '' ||
      obra.titulo.toLowerCase().includes(search.toLowerCase()) ||
      obra.autor.toLowerCase().includes(search.toLowerCase()) ||
      obra.subtema.toLowerCase().includes(search.toLowerCase())

    const matchesArea = selectedArea === null || obra.area === selectedArea

    return matchesSearch && matchesArea
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de topo institucional VETOR MASTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-[#333333] text-white p-8 rounded-[4px] relative overflow-hidden border border-[#E0E0E0] shadow-sm">
        <div className="absolute right-0 top-0 opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <BookOpen className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#0066CC] text-white">
              Ativo Intelectual V7.2
            </span>
            <span className="text-xs text-white/70">
              Biblioteca Profissional JBP V2.4 • 138 Obras Catalogadas
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Biblioteca Estratégica
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            Acervo curado que fundamenta o algoritmo determinístico do Vetor Master. Conhecimento
            clássico e contemporâneo de gestão traduzido em código e regras operacionais para PMEs.
          </p>
        </div>
        <div className="relative z-10 text-right shrink-0">
          <div className="text-3xl font-bold text-[#22B14C]">{bibliotecaV24.length}</div>
          <div className="text-xs text-white/70">Obras Fundamentadas</div>
        </div>
      </div>

      {/* Busca e Filtros por Área */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
            <Input
              placeholder="Buscar por obra, autor ou subtema..."
              className="pl-9 bg-[#F5F5F5] border-[#E0E0E0] text-[#333333] rounded-[4px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch('')}
              className="text-xs text-[#808080] hover:text-[#333333]"
            >
              Limpar busca
            </Button>
          )}
        </div>

        {/* Áreas estratégicas 1 a 8 */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedArea(null)}
            className={`text-xs px-3 py-1.5 rounded-[4px] border font-medium transition-colors ${
              selectedArea === null
                ? 'bg-[#0066CC] text-white border-[#0066CC]'
                : 'bg-[#F5F5F5] text-[#333333] border-[#E0E0E0] hover:bg-[#E0E0E0]/50'
            }`}
          >
            Todas as Áreas ({bibliotecaV24.length})
          </button>
          {areasBibliotecaV24.map((areaItem) => {
            const count = bibliotecaV24.filter((o) => o.area === areaItem.area).length
            const isSelected = selectedArea === areaItem.area
            return (
              <button
                key={areaItem.area}
                type="button"
                onClick={() => setSelectedArea(isSelected ? null : areaItem.area)}
                className={`text-xs px-3 py-1.5 rounded-[4px] border font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#0066CC] text-white border-[#0066CC]'
                    : 'bg-[#F5F5F5] text-[#333333] border-[#E0E0E0] hover:bg-[#E0E0E0]/50'
                }`}
              >
                Área {areaItem.area} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Listagem das Obras em cards executivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredObras.map((obra) => (
          <Card
            key={obra.numero}
            className="flex flex-col bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] shadow-sm hover:border-[#0066CC] transition-all hover:shadow"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="text-[10px] bg-white border-[#E0E0E0] text-[#0066CC] font-semibold"
                >
                  Área {obra.area} • {areaTitleMap[obra.area] || `Área ${obra.area}`}
                </Badge>
                <span className="text-[11px] text-[#808080] font-mono">#{obra.numero}</span>
              </div>
              <CardTitle className="text-base font-bold text-[#333333] leading-snug line-clamp-2">
                {obra.titulo}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-[#0066CC]">
                {obra.autor}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="bg-white/80 border border-[#E0E0E0] rounded-[4px] p-2.5">
                  <span className="text-[10px] font-semibold text-[#808080] uppercase tracking-wider block mb-1">
                    Subtema & Aplicação
                  </span>
                  <p className="text-xs text-[#333333] leading-relaxed">{obra.subtema}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#E0E0E0] flex items-center justify-between text-[11px] text-[#808080]">
                <span>Framework V2.4</span>
                <span className="flex items-center gap-1 text-[#22B14C] font-medium">
                  <Sparkles className="w-3 h-3" /> Metodologia Determinística
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredObras.length === 0 && (
          <div className="col-span-full py-16 text-center text-[#808080] bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px]">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-[#808080]/50" />
            <p className="text-base font-medium text-[#333333]">Nenhuma obra encontrada</p>
            <p className="text-xs text-[#808080] mt-1">
              Tente ajustar os termos de pesquisa ou selecionar outra área temática.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
