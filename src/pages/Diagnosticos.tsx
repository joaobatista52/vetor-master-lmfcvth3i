import { useState } from 'react'
import {
  CheckCircle2,
  ChevronRight,
  Play,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const categories = [
  {
    id: 'op',
    title: 'Operações & Processos',
    desc: 'Avalie a dependência da sua presença física no dia a dia da empresa.',
    icon: Settings,
    score: 65,
    status: 'Melhorando',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    id: 'rh',
    title: 'Gestão de Pessoas',
    desc: 'Meça a capacidade do seu time de tomar decisões sem você.',
    icon: Users,
    score: 40,
    status: 'Crítico',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
  {
    id: 'fin',
    title: 'Financeiro & Eficiência',
    desc: 'Análise de previsibilidade de caixa e margens de lucro.',
    icon: DollarSign,
    score: 80,
    status: 'Saudável',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    id: 'sales',
    title: 'Vendas & Escala',
    desc: 'Sua máquina de vendas funciona de forma previsível e independente?',
    icon: TrendingUp,
    score: 0,
    status: 'Não iniciado',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
  },
]

const mockQuestions = [
  'Se você tirar 30 dias de férias hoje, a empresa continua crescendo?',
  'Quantas decisões diárias passam obrigatoriamente por você?',
  'Os processos da sua área mais crítica estão documentados?',
]

export default function Diagnosticos() {
  const [openWizard, setOpenWizard] = useState(false)
  const [step, setStep] = useState(0)
  const [activeCategory, setActiveCategory] = useState<any>(null)
  const [completed, setCompleted] = useState(false)

  const handleStart = (cat: any) => {
    setActiveCategory(cat)
    setStep(0)
    setCompleted(false)
    setOpenWizard(true)
  }

  const nextStep = () => {
    if (step < mockQuestions.length - 1) {
      setStep((s) => s + 1)
    } else {
      setCompleted(true)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Central de Diagnósticos</h1>
        <p className="text-muted-foreground mt-1">
          Identifique os gargalos que estão prendendo você na operação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className="transition-all hover:shadow-md hover:border-primary/50 group"
          >
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className={`p-3 rounded-xl ${cat.bg} ${cat.color} shrink-0`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {cat.title}
                  </CardTitle>
                  {cat.score > 0 ? (
                    <Badge
                      variant={
                        cat.score > 70 ? 'default' : cat.score > 50 ? 'secondary' : 'destructive'
                      }
                    >
                      {cat.score}% Saúde
                    </Badge>
                  ) : (
                    <Badge variant="outline">Novo</Badge>
                  )}
                </div>
                <CardDescription className="mt-2 line-clamp-2">{cat.desc}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {cat.score > 0 ? (
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progresso Atual</span>
                    <span className="font-medium text-foreground">{cat.score}%</span>
                  </div>
                  <Progress value={cat.score} className="h-2" />
                </div>
              ) : (
                <div className="py-3 px-4 bg-secondary/50 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Avaliação pendente
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant={cat.score === 0 ? 'default' : 'outline'}
                className="w-full gap-2"
                onClick={() => handleStart(cat)}
              >
                {cat.score === 0 ? <Play className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                {cat.score === 0 ? 'Iniciar Diagnóstico' : 'Refazer Avaliação'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={openWizard} onOpenChange={setOpenWizard}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          {activeCategory && !completed && (
            <>
              <div className="p-6 pb-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-md ${activeCategory.bg} ${activeCategory.color}`}>
                    <activeCategory.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{activeCategory.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Questão {step + 1} de {mockQuestions.length}
                    </p>
                  </div>
                </div>
                <Progress value={((step + 1) / mockQuestions.length) * 100} className="h-1 mb-8" />

                <div className="min-h-[200px] animate-slide-in-right">
                  <h2 className="text-xl font-medium mb-6">{mockQuestions[step]}</h2>

                  <RadioGroup defaultValue="" className="space-y-3">
                    {[
                      'Sim, funciona perfeitamente sem mim.',
                      'Funciona, mas com algumas falhas e atrasos.',
                      'Difícil, a equipe precisaria me acionar constantemente.',
                      'Impossível, tudo pararia no primeiro dia.',
                    ].map((opt, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 border p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer focus-within:border-primary focus-within:ring-1"
                      >
                        <RadioGroupItem value={`opt-${i}`} id={`opt-${i}`} />
                        <Label
                          htmlFor={`opt-${i}`}
                          className="flex-1 cursor-pointer font-normal text-sm"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
              <div className="p-6 pt-4 border-t border-border flex justify-end">
                <Button onClick={nextStep} className="gap-2">
                  {step === mockQuestions.length - 1 ? 'Finalizar' : 'Próxima'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}

          {completed && (
            <div className="p-8 text-center animate-fade-in flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Diagnóstico Concluído!</h2>
              <p className="text-muted-foreground mb-8">
                Analisamos suas respostas e geramos novos itens estratégicos para o seu Plano de
                Ação.
              </p>

              <div className="bg-secondary/50 rounded-lg p-4 w-full mb-8 text-left">
                <h4 className="font-medium text-sm text-foreground mb-3">
                  Principais Descobertas:
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" /> Alta dependência
                    de aprovações manuais.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" /> Falta de
                    processos documentados no comercial.
                  </li>
                </ul>
              </div>

              <Button className="w-full max-w-sm" onClick={() => setOpenWizard(false)}>
                Desbloquear Plano de Ação
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
