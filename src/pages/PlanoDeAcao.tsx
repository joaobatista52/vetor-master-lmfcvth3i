import { useState } from 'react'
import { PlayCircle, Clock, CheckCircle2, ChevronRight, FileText, ArrowRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

const mockTasks = [
  {
    id: 1,
    title: 'Criar Matriz de Delegação',
    area: 'Operações',
    priority: 'Alta',
    status: 'todo',
    desc: 'Mapear as decisões rotineiras e definir quem pode tomá-las na sua ausência.',
    impact: 'Reduz em 40% as interrupções diárias ao fundador.',
  },
  {
    id: 2,
    title: 'Automatizar Cobrança de Inadimplentes',
    area: 'Financeiro',
    priority: 'Média',
    status: 'doing',
    desc: 'Implementar régua de cobrança automática via sistema ERP.',
    impact: 'Aumenta a previsibilidade de caixa e reduz carga operacional.',
  },
  {
    id: 3,
    title: 'Treinamento de Liderança - Módulo 1',
    area: 'Pessoas',
    priority: 'Alta',
    status: 'done',
    desc: 'Capacitar líderes intermediários na cultura de feedback.',
    impact: 'Maior autonomia na resolução de conflitos de equipe.',
  },
]

export default function PlanoDeAcao() {
  const [activeTab, setActiveTab] = useState('board')

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plano de Ação Estratégico</h1>
          <p className="text-muted-foreground mt-1">
            Transforme diagnósticos em execução prática e previsível.
          </p>
        </div>
      </div>

      <Tabs defaultValue="todo" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="todo" className="data-[state=active]:bg-background">
            A Fazer (1)
          </TabsTrigger>
          <TabsTrigger
            value="doing"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            Em Andamento (1)
          </TabsTrigger>
          <TabsTrigger
            value="done"
            className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
          >
            Concluídas (1)
          </TabsTrigger>
        </TabsList>

        {['todo', 'doing', 'done'].map((status) => (
          <TabsContent key={status} value={status} className="flex-1 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mockTasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <Card
                    key={task.id}
                    className="border-border hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div
                      className={`absolute top-0 left-0 w-1 h-full ${status === 'todo' ? 'bg-gray-300' : status === 'doing' ? 'bg-primary' : 'bg-green-500'}`}
                    />
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="text-xs bg-secondary/50 font-medium">
                          {task.area}
                        </Badge>
                        <Badge
                          variant={task.priority === 'Alta' ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {task.priority} Prioridade
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-lg mb-2 leading-tight group-hover:text-primary transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{task.desc}</p>

                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="secondary"
                            className="w-full justify-between group/btn bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                          >
                            Ver Orientação do Especialista
                            <PlayCircle className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md w-full p-0 flex flex-col">
                          <SheetHeader className="p-6 pb-0 text-left">
                            <Badge className="w-fit mb-2 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                              Guia de Implementação
                            </Badge>
                            <SheetTitle className="text-2xl">{task.title}</SheetTitle>
                            <SheetDescription className="mt-2 text-base">
                              Siga este passo a passo validado para implementar esta estratégia de
                              forma eficiente.
                            </SheetDescription>
                          </SheetHeader>
                          <ScrollArea className="flex-1 px-6 py-6">
                            <div className="space-y-6">
                              <div className="aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white relative overflow-hidden group/vid cursor-pointer shadow-lg">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&auto=format&fit=crop')] bg-cover opacity-40 mix-blend-overlay group-hover/vid:opacity-50 transition-opacity" />
                                <PlayCircle className="w-12 h-12 mb-2 group-hover/vid:scale-110 transition-transform z-10" />
                                <span className="text-sm font-medium z-10">
                                  Assistir Aula Prática (5 min)
                                </span>
                              </div>

                              <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-3">
                                  <ArrowRight className="w-4 h-4 text-primary" /> Por que isso
                                  importa?
                                </h4>
                                <p className="text-sm text-muted-foreground p-4 bg-secondary/30 rounded-lg border border-border">
                                  {task.impact}
                                </p>
                              </div>

                              <Separator />

                              <div>
                                <h4 className="font-semibold mb-4">Passo a Passo de Execução</h4>
                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                  {[
                                    'Liste todas as decisões que você tomou na última semana.',
                                    'Categorize-as entre: Operacionais, Táticas e Estratégicas.',
                                    "Atribua um 'Dono' para as decisões operacionais utilizando a Matriz de Delegação.",
                                    'Faça uma reunião de alinhamento e passe o bastão oficialmente.',
                                  ].map((step, i) => (
                                    <div
                                      key={i}
                                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                                    >
                                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary bg-background shrink-0 text-xs font-bold text-primary relative z-10 shadow-sm">
                                        {i + 1}
                                      </div>
                                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-lg border border-border bg-card shadow-sm text-sm ml-4 md:ml-0">
                                        {step}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                  <FileText className="w-4 h-4 text-primary" /> Template Recomendado
                                </h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Utilize nosso modelo pronto para acelerar esta etapa.
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full bg-background"
                                >
                                  Baixar Template (XLSX)
                                </Button>
                              </div>
                            </div>
                          </ScrollArea>
                          <div className="p-6 border-t border-border mt-auto bg-card">
                            <Button className="w-full">Mover para 'Em Andamento'</Button>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </CardContent>
                  </Card>
                ))}
              {mockTasks.filter((t) => t.status === status).length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-lg">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-muted-foreground">Nenhuma tarefa aqui</h3>
                  <p className="text-sm text-muted-foreground/70">
                    As tarefas aparecerão conforme você avança.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
