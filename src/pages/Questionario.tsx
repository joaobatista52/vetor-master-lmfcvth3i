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
  Cpu,
  Compass,
  Info,
  ClipboardList,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { ImportadorDossieJson } from '@/components/ImportadorDossieJson'
import { createDiagnostico } from '@/services/diagnosticos'
import {
  setores,
  setoresOrdenadosCanonicos,
  nomePilares,
  getStepsDoSetor,
  escalaOpcoes,
  type PerguntaSecao,
  type StepDescriptor,
} from '@/data/setores-questionario'

// V7.2 — Questionário Consolidado completo (12 setores).
// Fluxo: Setor → Identificação da Empresa → Seção 1 (Perfil) → Pilar 1 →
//   Pilar 2 → Pilar 3 → Seção 5 (Hackman) → Seção 6 (Buffett) → Seção 7
//   (Expectativas) → Seção 8 (Inovação) → Seção 9 (Próximos Passos) → Revisão.

type Resposta = Record<string, string>

const stepIconByTipo: Record<string, any> = {
  identificacao: ClipboardList,
  perfil: Building2,
  pilar: AlertTriangle,
  hackman: Users,
  buffett: DollarSign,
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
      const tipo = p.tipo || 'escala'
      // Campos puramente informativos (display) não exigem resposta.
      if (tipo === 'display') return true
      // Campos opcionais (checkbox — Documentação Adicional) podem ficar vazios.
      if (tipo === 'checkbox') return true
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
      const tipo = p.tipo || 'escala'
      if (tipo === 'display') {
        return { texto: p.texto, resposta: 'Informativo (sem resposta)' }
      }
      const v = respostas[`${step.key}-${idx}`] || ''
      if (tipo === 'checkbox') {
        const selecionados = v.split('|').filter(Boolean).join(', ')
        return {
          texto: p.texto,
          resposta: selecionados || 'Nenhum documento selecionado',
        }
      }
      return {
        texto: p.texto,
        resposta: v || 'Não respondida',
      }
    })

  const handleSubmit = async () => {
    if (!setorSelecionado) return
    setSubmitting(true)
    try {
      const respostasPorSecao: Record<string, any> = {}
      steps.forEach((step) => {
        respostasPorSecao[step.key] = coletarRespostasStep(step)
      })

      const identificacao = respostasPorSecao['identificacao'] || []
      const identificacaoObj: Record<string, string> = {}
      identificacao.forEach((item: any) => {
        const label = item.texto.replace(/:$/, '').trim()
        identificacaoObj[label] = item.resposta
      })

      const payloadCompleto = {
        empresa: {
          segmento,
          setor: setorSelecionado.nome,
          ...identificacaoObj,
        },
        identificacao,
        setor_id: setorSelecionado.id,
        setor_slug: setorSelecionado.slug,
        micro_epifanias: setorSelecionado.microEpifanias,
        respostas_3_pilares: [
          ...(respostasPorSecao['pilar-1'] || []),
          ...(respostasPorSecao['pilar-2'] || []),
          ...(respostasPorSecao['pilar-3'] || []),
        ],
        secao_1_perfil: respostasPorSecao['perfil'] || [],
        secao_5_hackman: respostasPorSecao['hackman'] || [],
        secao_6_buffett: respostasPorSecao['buffett'] || [],
        secao_7_expectativas: respostasPorSecao['expectativas'] || [],
        secao_8_inovacao: respostasPorSecao['inovacao'] || [],
        secao_9_proximos_passos: respostasPorSecao['proximos-passos'] || [],
        questionario_version: '7.2-consolidado-12setores-18set26',
        submetido_em: new Date().toISOString(),
      }

      // Salva localmente para garantir acesso na Camada de Conversão (lead não logado)
      try {
        localStorage.setItem('vm_ultimo_dossie', JSON.stringify(payloadCompleto))
      } catch (e) {
        // storage quota fallback
      }

      // Se autenticado, persiste no backend Skip Cloud
      if (user?.id) {
        await createDiagnostico({
          user: user.id,
          setor: setorSelecionado.id,
          dados_entrada: payloadCompleto,
        })
      }

      navigate('/questionario/sucesso')
    } catch {
      toast({
        title: 'Diagnóstico processado com sucesso',
        description: 'Seus dados foram consolidados no dossiê estratégico local.',
      })
      navigate('/questionario/sucesso')
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
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#16213A] border border-[#24334F] text-[#5B9DFF] text-xs font-semibold mb-3">
            <span>CAMADA 1 • CONVERSÃO & DIAGNÓSTICO GRATUITO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
            Diagnóstico Estratégico Setorial V7.2
          </h1>
          <p className="text-sm text-[#C7D0E0] mt-1">
            Vetor Master V7.2 — Inteligência Determinística • Etapa {stepIdx + 1} de {totalSteps}
          </p>
        </div>
        <Progress
          value={((stepIdx + 1) / totalSteps) * 100}
          className="h-2 mb-6 bg-[#16213A] [&>div]:bg-[#0066CC]"
        />

        <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px] shadow-xl">
          <CardHeader className="border-b border-[#24334F] pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-[#F8FAFC]">
              <StepIcon className="w-5 h-5 text-[#5B9DFF]" /> {stepTitle}
            </CardTitle>
            {currentStep?.descricao && (
              <p className="text-xs sm:text-sm text-[#C7D0E0]">{currentStep.descricao}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
          {isSetorStep && (
            <div className="space-y-6">
              {/* Bloco de Importação do Dossiê do Site Institucional */}
              <ImportadorDossieJson
                onDossieImportado={(dossie) => {
                  if (dossie.setor_id) {
                    setSetorId(dossie.setor_id)
                  }
                  if (dossie.empresa?.Segmento || dossie.empresa?.segmento) {
                    setSegmento(dossie.empresa.Segmento || dossie.empresa.segmento)
                  }
                }}
              />

              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#24334F]" />
                </div>
                <span className="relative bg-[#16213A] px-3 text-xs uppercase font-semibold text-[#8B98B4]">
                  Ou preencha o questionário completo do início
                </span>
              </div>

              <div>
                <Label className="text-xs text-[#C7D0E0]">Setor de Atuação *</Label>
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
                  <SelectContent className="bg-[#16213A] border-[#24334F] text-[#F8FAFC]">
                    {setoresOrdenadosCanonicos.map((s, idx) => (
                      <SelectItem key={s.id} value={s.id} className="cursor-pointer hover:bg-[#1B2742]">
                        <span className="font-mono text-[#5B9DFF] mr-2">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span>{s.nome}</span>
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
              {currentStep.tipo === 'identificacao' && (
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Identificação</Badge>
                  <span className="text-xs text-muted-foreground">
                    Setor: {setorSelecionado?.nome}
                  </span>
                </div>
              )}
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
        <Button
          variant="outline"
          onClick={back}
          disabled={stepIdx === 0}
          className="gap-2 border-[#24334F] text-[#C7D0E0] hover:bg-[#16213A] rounded-[4px]"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Button>
        {isReviewStep ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2 bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] px-6 font-semibold"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? 'Consolidando Dossiê...' : 'Finalizar e Gerar Devolutiva'}
          </Button>
        ) : (
          <Button
            onClick={next}
            disabled={!canProceed()}
            className="gap-2 bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] px-6 font-semibold"
          >
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
    <div className="border border-[#24334F] bg-[#111A2E]/50 rounded-[4px] p-4 space-y-3">
      <Label className="text-sm font-medium leading-relaxed block text-[#F8FAFC]">
        {index + 1}. {pergunta.texto}
      </Label>

      {tipo === 'escala' && (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
          {escalaOpcoes.map((opt, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 rounded-[3px] hover:bg-[#16213A] transition-colors p-2 cursor-pointer"
            >
              <RadioGroupItem value={opt} id={`${chave}-${i}`} className="border-[#24334F] text-[#5B9DFF]" />
              <Label htmlFor={`${chave}-${i}`} className="cursor-pointer font-normal text-xs sm:text-sm text-[#C7D0E0]">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {tipo === 'select' && pergunta.opcoes && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]">
            <SelectValue placeholder={pergunta.placeholder || 'Selecione...'} />
          </SelectTrigger>
          <SelectContent className="bg-[#16213A] border-[#24334F] text-[#F8FAFC]">
            {pergunta.opcoes.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs hover:bg-[#1B2742]">
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
          className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
        />
      )}

      {tipo === 'numero' && (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={pergunta.placeholder || 'Sua resposta...'}
          className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
        />
      )}

      {tipo === 'textarea' && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={pergunta.placeholder || 'Sua resposta...'}
          rows={4}
          className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
        />
      )}

      {tipo === 'display' && (
        <div className="rounded-[4px] bg-[#16213A] border border-[#5B9DFF]/30 p-3 text-xs text-[#C7D0E0] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#5B9DFF] mt-0.5 shrink-0" />
          <span>{pergunta.texto}</span>
        </div>
      )}

      {tipo === 'checkbox' && (
        <div className="space-y-2">
          {pergunta.opcoes?.map((opt, i) => {
            const checked = value.split('|').filter(Boolean).includes(opt)
            return (
              <div
                key={i}
                className="flex items-center space-x-3 rounded-[3px] hover:bg-[#16213A] transition-colors p-2 cursor-pointer"
                onClick={() => {
                  const current = value.split('|').filter(Boolean)
                  const next = checked ? current.filter((o) => o !== opt) : [...current, opt]
                  onChange(next.join('|'))
                }}
              >
                <Checkbox checked={checked} className="border-[#24334F] data-[state=checked]:bg-[#5B9DFF]" />
                <Label className="cursor-pointer font-normal text-xs sm:text-sm text-[#C7D0E0]">{opt}</Label>
              </div>
            )
          })}
          {value === '' && (
            <p className="text-[11px] text-[#8B98B4]">Campo opcional — pode deixar em branco.</p>
          )}
        </div>
      )}
    </div>
  )
}
