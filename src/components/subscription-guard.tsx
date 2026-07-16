import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SubscriptionGuard({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="border-primary/20 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-3">Desbloquear Solução Completa</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Seu diagnóstico estratégico está pronto. Para acessar os planos de ação detalhados,
              OKRs e direção assistida de especialistas, assine a solução completa JBP Gestão
              Master.
            </p>

            <div className="grid gap-3 w-full max-w-md mb-8 text-left">
              {[
                'Planos de Ação 5W2H personalizados',
                'OKRs com acompanhamento de progresso',
                'Direção assistida por consultores',
                'Templates e ferramentas exclusivas',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full max-w-sm gap-2"
              onClick={() => navigate('/resultados')}
            >
              <Sparkles className="w-4 h-4" />
              Desbloquear Agora
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Transforme diagnóstico em execução. Saia da prisão do fundador.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
