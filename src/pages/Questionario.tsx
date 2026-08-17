import { useMemo, useState } from 'react'
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
  Layers,
  Users,
  DollarSign,
  Rocket,
  Eye,
  Cpu,
  Compass,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { createDiagnostico } from '@/services/diagnosticos'
import {
  setores,
  nomePilares,
  getStepsDoSetor,
  escalaOpcoes,
  type PerguntaSecao,
  type StepDescriptor,
} from '@/data/setores-questionario'

// V6.5 — Questionário Consolidado completo (10 setores).
// Fluxo: Setor → Seção 1 (Perfil) → Pilar 1 → Pilar 2 → Pilar 3 → Seção 5
//   (Hackman) → Seção 6 (Buffett) → Seção 6.6 (Runway, só Tecnologia) →
//   Seção 7 (Expectativas) → Seção 8 (Inovação) → Seção 9 (Próximos Passos) → Revisão.

type Resposta = Record<string, string>

const stepIconByTipo: Record<string, any> = {
  perfil: Building2,
  pilar: AlertTriangle,
  hackman: Users,
  buffett: DollarSign,
  runway: Rocket,
  expectativas: Target,
  inovacao: Cpu,
  'proximos-passos': Compass,
}

export default function Questionario() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  // 0 = seleção de setor; depois steps dinâmicos; último = revisão.
  const [setorId, setSetorId] = useState<string>('')
  const [segmento, setSegmento] = useState<string>('')
  const [respostas, setRespostas] = useState<Resposta>({})
  const [stepIdx, setStepIdx] = useState(0)

  const setorSelecionado = setores.find((s) => s.id === setorId) || null

  const steps = useMemo<StepDescriptor[]>(
    () => (setorSelecionado ? getStepsDoSetor(setorSelecionado) : []),
    [setorSelecionado],
  )

  // stepIdx === 0 : seleção de setor
  // 1..steps.length : steps dinâmicos
  // steps.length + 1 : revisão
  const totalSteps = steps.length + 2
  const isSetorStep = stepIdx === 0
  const isReviewStep = stepIdx === steps.length + 1
  const currentStep = !isSetorStep && !isReviewStep ? steps[stepIdx - 1] : null

  const canProceed = () => {
    if (isSetorStep) return setorId !== '' && segmento !== ''
    if (isReviewStep) return true
    if (!currentStep) return false
    return currentStep.perguntas.every((p, idx) => {
      // Campos puramente informativos (tipo "display") não exigem resposta.
      if ((p.tipo || 'escala') === 'display') return true
      const v = respostas[`${currentStep.key}-${idx}`]
      return v !== undefined && v.trim() !== ''
    })
  }

  const setResposta = (key: string, idx: number, valor: string) => {
    setRespostas((p) => ({ ...p, [`${key}-${idx}`]: valor }))
  }

  const next = () => setStepIdx((s) => Math.min(s + 1, totalSteps - 1))
  const back = () => setStepIdx((s) => Math.max(s - 1, 0))

  const coletarRespostasStep = (step: StepDescriptor) =>
    step.perguntas.map((p, idx) => {
      if ((p.tipo || 'escala') === 'display') {
        return { texto: p.texto, resposta: 'Informativo (sem resposta)' }
      }
      return {
        texto: p.texto,
        resposta: respostas[`${step.key}-${idx}`] || 'Não respondida',
      }
    })

  const handleSubmit = async () => {
    if (!user || !setorSelecionado) return
    setSubmitting(true)
    try {
      const respostasPorSecao: Record<string, any> = {}
      steps.forEach((step) => {
        respostasPorSecao[step.key] = coletarRespostasStep(step)
      })

      await createDiagnostico({
        user: user.id,
        setor: setorSelecionado.id,
        dados_entrada: {
          empresa: {
            segmento,
            setor: setorSelecionado.nome,
          },
          setor_id: setorSelecionado.id,
          setor_slug: setorSelecionado.slug,
          micro_epifanias: setorSelecionado.microEpifanias,
          respostas_3_pilares: [
            ...respostasPorSecao['pilar-1'],
            ...respostasPorSecao['pilar-2'],
            ...respostasPorSecao['pilar-3'],
          ],
          secao_1_perfil: respostasPorSecao['perfil'],
          secao_5_hackman: respostasPorSecao['hackman'],
          secao_6_buffett: respostasPorSecao['buffett'],
          secao_66_runway: respostasPorSecao['runway'] || null,
          secao_7_expectativas: respostasPorSecao['expectativas'],
          secao_8_inovacao: respostasPorSecao['inovacao'],
          secao_9_proximos_passos: respostasPorSecao['proximos-passos'],
          questionario_version: '6.5-consolidado',
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

  const StepIcon = isSetorStep
    ? Layers
    : isReviewStep
      ? Check
      : stepIconByTipo[currentStep!.tipo] || AlertTriangle

  const stepTitle = isSetorStep
    ? 'Setor de Atuação'
    : isReviewStep
      ? 'Revisão'
      : currentStep!.titulo

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico Estratégico Setorial</h1>
        <p className="text-muted-foreground mt-1">
          JBP Gestão Master V 6.5 — Etapa {stepIdx + 1} de {totalSteps}
        </p>
      </div>
      <Progress value={((stepIdx + 1) / totalSteps) * 100} className="h-2 mb-6" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <StepIcon className="w-5 h-5 text-primary" /> {stepTitle}
          </CardTitle>
          {currentStep?.descricao && (
            <p className="text-sm text-muted-foreground">{currentStep.descricao}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isSetorStep && (
            <div className="space-y-4">
              <div>
                <Label>Setor de Atuação *</Label>
                <Select
                  value={setorId}
                  onValueChange={(v) => {
                    setSetorId(v)
                    setSegmento('')
                    setStepIdx(0)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu setor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {setorSelecionado && (
                <>
                  <div>
                    <Label>Segmento *</Label>
                    <Select value={segmento} onValueChange={setSegmento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o segmento..." />
                      </SelectTrigger>
                      <SelectContent>
                        {setorSelecionado.segmentos.map((seg) => (
                          <SelectItem key={seg} value={seg}>
                            {seg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Micro-epifanias deste setor
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {setorSelecionado.microEpifanias.map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep && (
            <div className="space-y-4">
              {currentStep.tipo === 'pilar' && (
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{nomePilares[currentStep.pilar!]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Setor: {setorSelecionado?.nome} · {currentStep.perguntas.length} perguntas
                  </span>
                </div>
              )}
              {currentStep.perguntas.map((p, idx) => (
                <PerguntaField
                  key={`${currentStep.key}-${idx}`}
                  pergunta={p}
                  index={idx}
                  stepKey={currentStep.key}
                  value={respostas[`${currentStep.key}-${idx}`] || ''}
                  onChange={(v) => setResposta(currentStep.key, idx, v)}
                />
              ))}
            </div>
          )}

          {isReviewStep && setorSelecionado && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Setor / Segmento:</span>{' '}
                {setorSelecionado.nome} — {segmento}
              </div>
              {steps.map((step) => {
                const perguntasInput = step.perguntas
                  .map((p, idx) => ({ p, idx }))
                  .filter(({ p }) => (p.tipo || 'escala') !== 'display')
                const respondidas = perguntasInput.filter(
                  ({ idx }) => !!respostas[`${step.key}-${idx}`],
                ).length
                return (
                  <div key={step.key} className="flex items-center justify-between border-b pb-2">
                    <span>{step.titulo}</span>
                    <Badge
                      variant={respondidas === perguntasInput.length ? 'default' : 'secondary'}
                    >
                      {respondidas}/{perguntasInput.length}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={back} disabled={stepIdx === 0} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Button>
        {isReviewStep ? (
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? 'Enviando...' : 'Enviar Diagnóstico'}
          </Button>
        ) : (
          <Button onClick={next} disabled={!canProceed()} className="gap-2">
            Próximo <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

function PerguntaField({
  pergunta,
  index,
  stepKey,
  value,
  onChange,
}: {
  pergunta: PerguntaSecao
  index: number
  stepKey: string
  value: string
  onChange: (v: string) => void
}) {
  const tipo = pergunta.tipo || 'escala'
  const chave = `${stepKey}-${index}`

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Label className="text-sm font-medium leading-relaxed block">
        {index + 1}. {pergunta.texto}
      </Label>

      {tipo === 'escala' && (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
          {escalaOpcoes.map((opt, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 rounded-md hover:bg-secondary/40 transition-colors p-2 cursor-pointer"
            >
              <RadioGroupItem value={opt} id={`${chave}-${i}`} />
              <Label htmlFor={`${chave}-${i}`} className="cursor-pointer font-normal text-sm">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {tipo === 'select' && pergunta.opcoes && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={pergunta.placeholder || 'Selecione...'} />
          </SelectTrigger>
          <SelectContent>
            {pergunta.opcoes.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {tipo === 'texto' && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={pergunta.placeholder || 'Sua resposta...'}
        />
      )}

      {tipo === 'numero' && (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={pergunta.placeholder || 'Sua resposta...'}
        />
      )}

      {tipo === 'textarea' && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={pergunta.placeholder || 'Sua resposta...'}
          rows={4}
        />
      )}

      {tipo === 'display' && (
        <div className="rounded-md bg-primary/5 border border-primary/20 p-3 text-sm text-muted-foreground flex items-start gap-2">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <span>{pergunta.texto}</span>
        </div>
      )}
    </div>
  )
}
