import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Clock, FileText, BrainCircuit } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const nextSteps = [
  {
    icon: FileText,
    title: 'Análise dos Dados',
    desc: 'Seus dados estão sendo cruzados com os 7 Master Frameworks da metodologia.',
  },
  {
    icon: BrainCircuit,
    title: 'Geração de Relatório com IA',
    desc: 'Nossa IA está preparando um diagnóstico estratégico personalizado usando RAG.',
  },
  {
    icon: ArrowRight,
    title: 'Plano de Ação',
    desc: 'Em breve você terá acesso a tarefas 5W2H e OKRs baseados no seu diagnóstico.',
  },
]

export default function QuestionarioSucesso() {
  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico Recebido!</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Suas respostas foram registradas com sucesso. Agora iniciamos o processamento do seu
          relatório estratégico.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 space-y-5">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Próximos Passos
          </h2>
          {nextSteps.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary shrink-0">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline">
          <Link to="/">Ir para Dashboard</Link>
        </Button>
        <Button asChild className="gap-2">
          <Link to="/diagnosticos">
            Ver Diagnósticos <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
