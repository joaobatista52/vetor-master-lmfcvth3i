import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  AlertTriangle,
  Target,
  Send,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { createDiagnostico } from '@/services/diagnosticos'
import {
  strategicAreas,
  faturamentoOptions,
  funcionariosOptions,
  prazoOptions,
} from '@/lib/strategic-areas'

const stepTitles = ['Sua Empresa', 'Dores Estratégicas', 'Objetivos', 'Revisão']
const stepIcons = [Building2, AlertTriangle, Target, Check]

export default function Questionario() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState({
    nome: '',
    segmento: '',
    faturamento: '',
    funcionarios: '',
    dores: [] as number[],
    objetivos: '',
    prazo: '',
  })

  const toggleDor = (num: number) => {
    setData((p) => ({
      ...p,
      dores: p.dores.includes(num) ? p.dores.filter((d) => d !== num) : [...p.dores, num],
    }))
  }

  const canProceed = () => {
    if (step === 0) return data.nome.trim() !== '' && data.segmento.trim() !== ''
    if (step === 1) return data.dores.length > 0
    if (step === 2) return data.objetivos.trim().length > 0 && data.prazo !== ''
    return true
  }

  const handleSubmit = async () => {
    if (!user) return
    setSubmitting(true)
    try {
      await createDiagnostico({
        user: user.id,
        dados_entrada: {
          empresa: {
            nome: data.nome,
            segmento: data.segmento,
            faturamento: data.faturamento,
            funcionarios: data.funcionarios,
          },
          dores: data.dores,
          objetivos: { descricao: data.objetivos, prazo: data.prazo },
          questionario_version: '6.4',
          submetido_em: new Date().toISOString(),
        },
      })
      navigate('/questionario/sucesso')
    } catch {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas respostas. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const StepIcon = stepIcons[step]

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Questionário Padrão</h1>
        <p className="text-muted-foreground mt-1">
          JBP Gestão Master V 6.4 — Etapa {step + 1} de {stepTitles.length}
        </p>
      </div>
      <Progress value={((step + 1) / stepTitles.length) * 100} className="h-2 mb-6" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <StepIcon className="w-5 h-5 text-primary" /> {stepTitles[step]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <Label htmlFor="nome">Nome da Empresa *</Label>
                <Input
                  id="nome"
                  value={data.nome}
                  onChange={(e) => setData({ ...data, nome: e.target.value })}
                  placeholder="Ex: Minha Empresa Ltda."
                />
              </div>
              <div>
                <Label htmlFor="segmento">Segmento / Indústria *</Label>
                <Input
                  id="segmento"
                  value={data.segmento}
                  onChange={(e) => setData({ ...data, segmento: e.target.value })}
                  placeholder="Ex: Tecnologia, Varejo, Serviços..."
                />
              </div>
              <div>
                <Label>Faturamento Mensal</Label>
                <Select
                  value={data.faturamento}
                  onValueChange={(v) => setData({ ...data, faturamento: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {faturamentoOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Número de Colaboradores</Label>
                <Select
                  value={data.funcionarios}
                  onValueChange={(v) => setData({ ...data, funcionarios: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {funcionariosOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">
                Selecione as áreas onde você sente maior gargalo:
              </p>
              {strategicAreas.map((area) => (
                <div
                  key={area.numero}
                  className="flex items-start gap-3 border rounded-lg p-3 hover:bg-secondary/40 transition-colors"
                >
                  <Checkbox
                    checked={data.dores.includes(area.numero)}
                    onCheckedChange={() => toggleDor(area.numero)}
                    id={`dor-${area.numero}`}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`dor-${area.numero}`}
                      className="cursor-pointer font-medium text-sm flex items-center gap-2"
                    >
                      <area.icon className={`w-4 h-4 ${area.cor}`} /> {area.titulo}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">{area.dor}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {step === 2 && (
            <>
              <div>
                <Label htmlFor="objetivos">Seus Objetivos Estratégicos *</Label>
                <Textarea
                  id="objetivos"
                  value={data.objetivos}
                  onChange={(e) => setData({ ...data, objetivos: e.target.value })}
                  placeholder="Descreva onde você quer chegar nos próximos meses. Ex: Sair da operação, dobrar faturamento, delegar gestão..."
                  rows={5}
                />
              </div>
              <div>
                <Label>Horizonte de Tempo *</Label>
                <Select value={data.prazo} onValueChange={(v) => setData({ ...data, prazo: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {prazoOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {step === 3 && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Empresa:</span> {data.nome} —{' '}
                {data.segmento}
              </div>
              {data.faturamento && (
                <div>
                  <span className="text-muted-foreground">Faturamento:</span> {data.faturamento}
                </div>
              )}
              {data.funcionarios && (
                <div>
                  <span className="text-muted-foreground">Colaboradores:</span> {data.funcionarios}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Dores selecionadas:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.dores.map((n) => {
                    const a = strategicAreas.find((s) => s.numero === n)
                    return a ? (
                      <Badge key={n} variant="secondary">
                        {a.titulo}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Objetivos:</span> {data.objetivos}
              </div>
              <div>
                <span className="text-muted-foreground">Prazo:</span> {data.prazo}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Button>
        {step < stepTitles.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="gap-2">
            Próximo <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? 'Enviando...' : 'Enviar Diagnóstico'}
          </Button>
        )}
      </div>
    </div>
  )
}
