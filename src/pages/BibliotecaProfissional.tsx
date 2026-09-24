import { useState } from 'react'
import {
  Search,
  BookOpen,
  Sparkles,
  Shield,
  Layers,
  FileText,
  Building2,
  CheckCircle2,
  Filter,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { bibliotecaV24, areasBibliotecaV24, type ObraBiblioteca } from '@/data/biblioteca-v24'
import { areasFrameworkV72 } from '@/data/master-framework-v72'
import { setores } from '@/data/setores-questionario'

export default function BibliotecaProfissional() {
  const [activeTab, setActiveTab] = useState<'obras' | 'frameworks' | 'setores'>('obras')
  const [searchObras, setSearchObras] = useState('')
  const [selectedArea, setSelectedArea] = useState<number | null>(null)
  const [searchFrameworks, setSearchFrameworks] = useState('')
  const [searchSetores, setSearchSetores] = useState('')
  const [selectedSetorId, setSelectedSetorId] = useState<string | null>(null)

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

  // 1. Filtragem das Obras da Biblioteca V2.4
  const filteredObras = bibliotecaV24.filter((obra: ObraBiblioteca) => {
    const matchesSearch =
      searchObras === '' ||
      obra.titulo.toLowerCase().includes(searchObras.toLowerCase()) ||
      obra.autor.toLowerCase().includes(searchObras.toLowerCase()) ||
      obra.subtema.toLowerCase().includes(searchObras.toLowerCase())

    const matchesArea = selectedArea === null || obra.area === selectedArea

    return matchesSearch && matchesArea
  })

  // 2. Filtragem dos Frameworks V7.2
  const filteredFrameworks = areasFrameworkV72.filter((fw) => {
    if (!searchFrameworks) return true
    const term = searchFrameworks.toLowerCase()
    return (
      fw.titulo.toLowerCase().includes(term) ||
      fw.objetivo.toLowerCase().includes(term) ||
      fw.fase.toLowerCase().includes(term) ||
      fw.output.toLowerCase().includes(term) ||
      fw.ferramentas.some((f) => f.toLowerCase().includes(term)) ||
      fw.regrasOuro.some((r) => r.toLowerCase().includes(term))
    )
  })

  // 3. Filtragem dos 12 Setores
  const filteredSetores = setores.filter((st) => {
    if (!searchSetores) return true
    const term = searchSetores.toLowerCase()
    return (
      st.nome.toLowerCase().includes(term) ||
      st.segmentos.some((seg) => seg.toLowerCase().includes(term)) ||
      st.microEpifanias.some((me) => me.toLowerCase().includes(term))
    )
  })

  const activeSetor =
    setores.find((s) => s.id === selectedSetorId) ||
    (filteredSetores.length > 0 ? filteredSetores[0] : null)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de topo Governança / Curadoria restrita */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-[#333333] text-white p-8 rounded-[4px] relative overflow-hidden border border-[#E0E0E0] shadow-sm">
        <div className="absolute right-0 top-0 opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Shield className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#FF9900] text-black">
              Área Restrita do Administrador
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#0066CC] text-white">
              Curadoria Intelectual V7.2
            </span>
            <span className="text-xs text-white/70">
              Ambiente de Manutenção e Governança de Conteúdo
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-[#FF9900]" />
            Biblioteca Profissional
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Acervo proprietário de ativos intelectuais que fundamenta o algoritmo determinístico do
            Vetor Master: as 138 obras catalogadas da Biblioteca JBP V2.4, as 8 Áreas e Apêndices do
            Master Framework V7.2 e o mapeamento dos 12 Setores econômicos com micro-epifanias e
            questionários.
          </p>
        </div>
        <div className="relative z-10 flex gap-4 text-right shrink-0">
          <div>
            <div className="text-2xl md:text-3xl font-bold text-[#22B14C]">
              {bibliotecaV24.length}
            </div>
            <div className="text-[11px] text-white/70">Obras V2.4</div>
          </div>
          <div className="border-l border-white/20 pl-4">
            <div className="text-2xl md:text-3xl font-bold text-[#0066CC]">
              {areasFrameworkV72.length}
            </div>
            <div className="text-[11px] text-white/70">Áreas Framework</div>
          </div>
          <div className="border-l border-white/20 pl-4">
            <div className="text-2xl md:text-3xl font-bold text-[#FF9900]">{setores.length}</div>
            <div className="text-[11px] text-white/70">Setores Mapeados</div>
          </div>
        </div>
      </div>

      {/* Abas Principais de Curadoria */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'obras' | 'frameworks' | 'setores')}
        className="w-full space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0E0E0] pb-3">
          <TabsList className="bg-[#F5F5F5] p-1 border border-[#E0E0E0] rounded-[4px]">
            <TabsTrigger
              value="obras"
              className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs font-semibold px-4 py-1.5 rounded-[2px]"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Obras da Biblioteca V2.4 ({bibliotecaV24.length})
            </TabsTrigger>
            <TabsTrigger
              value="frameworks"
              className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs font-semibold px-4 py-1.5 rounded-[2px]"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              Master Frameworks V7.2 ({areasFrameworkV72.length})
            </TabsTrigger>
            <TabsTrigger
              value="setores"
              className="data-[state=active]:bg-[#0066CC] data-[state=active]:text-white text-xs font-semibold px-4 py-1.5 rounded-[2px]"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              12 Setores Econômicos ({setores.length})
            </TabsTrigger>
          </TabsList>

          <span className="text-[11px] text-[#808080] font-mono">
            Acesso Restrito: Administrador • Somente Leitura e Curadoria
          </span>
        </div>

        {/* ABA 1: 138 OBRAS DA BIBLIOTECA V2.4 */}
        <TabsContent value="obras" className="space-y-4 m-0 focus-visible:outline-none">
          {/* Busca e Filtros por Área */}
          <div className="space-y-3 bg-[#F5F5F5] p-4 border border-[#E0E0E0] rounded-[4px]">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
                <Input
                  placeholder="Buscar por obra, autor ou subtema no acervo..."
                  className="pl-9 bg-white border-[#E0E0E0] text-[#333333] rounded-[4px]"
                  value={searchObras}
                  onChange={(e) => setSearchObras(e.target.value)}
                />
              </div>
              {searchObras && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchObras('')}
                  className="text-xs text-[#808080] hover:text-[#333333]"
                >
                  Limpar busca
                </Button>
              )}
            </div>

            {/* Áreas estratégicas 1 a 8 */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-[#808080] flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Filtrar por Área:
              </span>
              <button
                type="button"
                onClick={() => setSelectedArea(null)}
                className={`text-xs px-3 py-1 rounded-[4px] border font-medium transition-colors ${
                  selectedArea === null
                    ? 'bg-[#0066CC] text-white border-[#0066CC]'
                    : 'bg-white text-[#333333] border-[#E0E0E0] hover:bg-[#E0E0E0]/50'
                }`}
              >
                Todas ({bibliotecaV24.length})
              </button>
              {areasBibliotecaV24.map((areaItem) => {
                const count = bibliotecaV24.filter((o) => o.area === areaItem.area).length
                const isSelected = selectedArea === areaItem.area
                return (
                  <button
                    key={areaItem.area}
                    type="button"
                    onClick={() => setSelectedArea(isSelected ? null : areaItem.area)}
                    className={`text-xs px-3 py-1 rounded-[4px] border font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#0066CC] text-white border-[#0066CC]'
                        : 'bg-white text-[#333333] border-[#E0E0E0] hover:bg-[#E0E0E0]/50'
                    }`}
                  >
                    Área {areaItem.area} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          <div className="text-xs text-[#808080] flex items-center justify-between">
            <span>
              Exibindo <strong>{filteredObras.length}</strong> de {bibliotecaV24.length} obras
            </span>
            {selectedArea && (
              <span className="text-[#0066CC] font-medium">
                Área {selectedArea}: {areaTitleMap[selectedArea]}
              </span>
            )}
          </div>

          {/* Grid de Obras */}
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
                        Subtema & Aplicação Prática
                      </span>
                      <p className="text-xs text-[#333333] leading-relaxed">{obra.subtema}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#E0E0E0] flex items-center justify-between text-[11px] text-[#808080]">
                    <span>Ativo Intelectual V2.4</span>
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
        </TabsContent>

        {/* ABA 2: MASTER FRAMEWORKS V7.2 (8 ÁREAS E APÊNDICES) */}
        <TabsContent value="frameworks" className="space-y-4 m-0 focus-visible:outline-none">
          <div className="bg-[#F5F5F5] p-4 border border-[#E0E0E0] rounded-[4px]">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
              <Input
                placeholder="Buscar por conceito, ferramenta, regra de ouro..."
                className="pl-9 bg-white border-[#E0E0E0] text-[#333333] rounded-[4px]"
                value={searchFrameworks}
                onChange={(e) => setSearchFrameworks(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFrameworks.map((fw) => (
              <Card
                key={fw.numero}
                className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] shadow-sm flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-[#0066CC] text-white text-[10px] font-mono">
                      ÁREA {fw.numero.toString().padStart(2, '0')}
                    </Badge>
                    <span className="text-[11px] text-[#808080] font-medium">{fw.fase}</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#333333]">{fw.titulo}</CardTitle>
                  <CardDescription className="text-xs text-[#555555] mt-1 leading-relaxed">
                    {fw.objetivo}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-3">
                      <span className="text-[10px] font-bold text-[#0066CC] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Ferramentas & Mecanismos Operacionais
                      </span>
                      <ul className="space-y-1 text-xs text-[#333333]">
                        {fw.ferramentas.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#0066CC] font-bold">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-3">
                      <span className="text-[10px] font-bold text-[#808080] uppercase tracking-wider block mb-1">
                        Output Esperado
                      </span>
                      <p className="text-xs text-[#333333] leading-relaxed">{fw.output}</p>
                    </div>

                    {fw.regrasOuro && fw.regrasOuro.length > 0 && (
                      <div className="bg-[#22B14C]/10 border border-[#22B14C]/30 rounded-[4px] p-3">
                        <span className="text-[10px] font-bold text-[#22B14C] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#22B14C]" /> Regras de Ouro
                        </span>
                        <ul className="space-y-1 text-xs text-[#1e7e34]">
                          {fw.regrasOuro.map((ro, i) => (
                            <li key={i} className="flex items-start gap-1.5 font-medium">
                              <span>•</span>
                              <span>{ro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E0E0E0] flex items-center justify-between text-[11px] text-[#808080]">
                    <span>Master Framework V2.4</span>
                    <span className="text-[#0066CC] font-semibold">Vetor Master V7.2</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredFrameworks.length === 0 && (
              <div className="col-span-full py-12 text-center text-[#808080] bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px]">
                Nenhum framework encontrado para o termo pesquisado.
              </div>
            )}
          </div>
        </TabsContent>

        {/* ABA 3: OS 12 SETORES ECONÔMICOS */}
        <TabsContent value="setores" className="space-y-4 m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lista dos 12 Setores */}
            <div className="lg:col-span-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
                <Input
                  placeholder="Buscar setor ou segmento..."
                  className="pl-9 bg-[#F5F5F5] border-[#E0E0E0] text-xs text-[#333333] rounded-[4px]"
                  value={searchSetores}
                  onChange={(e) => setSearchSetores(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {filteredSetores.map((setor) => {
                  const isSelected = activeSetor?.id === setor.id
                  return (
                    <button
                      key={setor.id}
                      type="button"
                      onClick={() => setSelectedSetorId(setor.id)}
                      className={`w-full text-left p-3 rounded-[4px] border transition-all ${
                        isSelected
                          ? 'bg-[#0066CC] text-white border-[#0066CC] shadow-sm'
                          : 'bg-[#F5F5F5] text-[#333333] border-[#E0E0E0] hover:bg-white hover:border-[#0066CC]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{setor.nome}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#808080]'
                          }`}
                        >
                          {setor.perguntas.length} pergs
                        </span>
                      </div>
                      <div
                        className={`text-xs line-clamp-1 ${
                          isSelected ? 'text-white/80' : 'text-[#808080]'
                        }`}
                      >
                        {setor.segmentos.join(' • ')}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Detalhes do Setor Selecionado */}
            <div className="lg:col-span-8">
              {activeSetor ? (
                <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E0E0E0] pb-4">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#0066CC] uppercase tracking-wider mb-1">
                        <span>Setor Estrutural V7.2</span>
                        <span>•</span>
                        <span className="text-[#808080]">Slug: {activeSetor.slug}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-[#333333]">{activeSetor.nome}</h2>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-white border-[#0066CC] text-[#0066CC] font-mono"
                    >
                      {activeSetor.perguntas.length} Perguntas nos 3 Pilares
                    </Badge>
                  </div>

                  {/* Segmentos Atendidos */}
                  <div>
                    <h3 className="text-xs font-bold text-[#808080] uppercase tracking-wider mb-2">
                      Segmentos de Atuação
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {activeSetor.segmentos.map((seg, i) => (
                        <span
                          key={i}
                          className="text-xs bg-white border border-[#E0E0E0] text-[#333333] px-2.5 py-1 rounded-[4px] font-medium"
                        >
                          {seg}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Micro-Epifanias Gatilho */}
                  <div>
                    <h3 className="text-xs font-bold text-[#0066CC] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Micro-Epifanias Gatilho (Vazamentos
                      Típicos)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeSetor.microEpifanias.map((me, i) => (
                        <div
                          key={i}
                          className="bg-white border border-[#E0E0E0] rounded-[4px] p-2.5 text-xs text-[#333333] font-medium flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
                          <span>{me}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amostra das Perguntas dos 3 Pilares */}
                  <div>
                    <h3 className="text-xs font-bold text-[#808080] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Matriz de Perguntas Estruturais (Pilares
                      1, 2 e 3)
                    </h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {activeSetor.perguntas.map((p, i) => (
                        <div
                          key={i}
                          className="bg-white border border-[#E0E0E0] rounded-[4px] p-3 text-xs flex items-start gap-2.5"
                        >
                          <Badge
                            className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 ${
                              p.pilar === 1
                                ? 'bg-[#0066CC] text-white'
                                : p.pilar === 2
                                  ? 'bg-[#FF9900] text-black'
                                  : 'bg-[#22B14C] text-white'
                            }`}
                          >
                            P{p.pilar}
                          </Badge>
                          <span className="text-[#333333] leading-relaxed flex-1">{p.texto}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[4px] p-12 text-center text-[#808080]">
                  Selecione um setor à esquerda para inspecionar seus parâmetros.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
