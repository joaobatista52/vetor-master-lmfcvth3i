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
  Layers,
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
import { faturamentoOptions, funcionariosOptions, prazoOptions } from '@/lib/strategic-areas'
import { setores, nomePilares, getPerguntasPorPilar } from '@/data/setores-questionario'

// V6.5 — Questionário com Bloco Setorial Parametrizável (3 Pilares, ~18 perguntas por setor)
// Fluxo: Sua Empresa → Setor → 3 Pilares → Objetivos → Revisão

const stepTitles = [
  'Sua Empresa',
  'Setor de Atuação',
  'Pilar 1 — Prisão do Fundador',
  'Pilar 2 — Ineficiência Invisível',
  'Pilar 3 — Abismo Estratégia vs. Execução',
  'Objetivos',
  'Revisão',
]
const stepIcons = [Building2, Layers, AlertTriangle, AlertTriangle, AlertTriangle, Target, Check]

type Resposta = Record<string, string> // chave: indice da pergunta -> valor

export default function Questionario() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [empresa, setEmpresa] = useState({
    nome: '',
    faturamento: '',
    funcionarios: '',
  })
  const [setorId, setSetorId] = useState<string>('')
  const [segmento, setSegmento] = useState<string>('')
  const [respostas, setRespostas] = useState<Resposta>({})
  const [objetivos, setObjetivos] = useState({ descricao: '', prazo: '' })

  const setorSelecionado = setores.find((s) => s.id === setorId) || null

  const totalSteps = stepTitles.length

  const canProceed = () => {
    if (step === 0) return empresa.nome.trim() !== ''
    if (step === 1) return setorId !== '' && segmento !== ''
    if (step === 2 || step === 3 || step === 4) {
      if (!setorSelecionado) return false
      const pilar = step - 1 // step 2 -> pilar 1, step 3 -> pilar 2, step 4 -> pilar 3
      const perguntas = getPerguntasPorPilar(setorSelecionado, pilar as 1 | 2 | 3)
      return perguntas.every((_, idx) => !!respostas[`${pilar}-${idx}`])
    }
    if (step === 5) return objetivos.descricao.trim().length > 0 && objetivos.prazo !== ''
    return true
  }

  const setResposta = (pilar: number, idx: number, valor: string) => {
    setRespostas((p) => ({ ...p, [`${pilar}-${idx}`]: valor }))
  }

  const allPerguntasRespostas = () => {
    if (!setorSelecionado) return []
    return setorSelecionado.perguntas.map((p, idx) => {
      // idx global na lista de perguntas do setor (0..17)
      return {
        pilar: p.pilar,
        texto: p.texto,
        resposta:
          respostas[`${p.pilar}-${idxGlobalParaPilar(setorSelecionado, idx)}`] || 'Não respondida',
      }
    })
  }

  const handleSubmit = async () => {
    if (!user || !setorSelecionado) return
    setSubmitting(true)
    try {
      await createDiagnostico({
        user: user.id,
        setor: setorSelecionado.id,
        dados_entrada: {
          empresa: {
            nome: empresa.nome,
            segmento,
            setor: setorSelecionado.nome,
            faturamento: empresa.faturamento,
            funcionarios: empresa.funcionarios,
          },
          setor_id: setorSelecionado.id,
          setor_slug: setorSelecionado.slug,
          micro_epifanias: setorSelecionado.microEpifanias,
          respostas_3_pilares: allPerguntasRespostas(),
          objetivos: { descricao: objetivos.descricao, prazo: objetivos.prazo },
          questionario_version: '6.5',
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

  const renderPilarStep = (pilar: 1 | 2 | 3) => {
    if (!setorSelecionado) return null
    const perguntas = getPerguntasPorPilar(setorSelecionado, pilar)
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{nomePilares[pilar]}</Badge>
          <span className="text-xs text-muted-foreground">
            Setor: {setorSelecionado.nome} · {perguntas.length} perguntas
          </span>
        </div>
        {perguntas.map((p, idx) => {
          const chave = `${pilar}-${idx}`
          return (
            <div key={chave} className="border rounded-lg p-4 space-y-3">
              <Label className="text-sm font-medium leading-relaxed block">
                {idx + 1}. {p.texto}
              </Label>
              <RadioGroup
                value={respostas[chave] || ''}
                onValueChange={(v) => setResposta(pilar, idx, v)}
                className="space-y-2"
              >
                {[
                  'Sim, totalmente.',
                  'Parcialmente, com ressalvas.',
                  'Raramente / com dificuldade.',
                  'Não / não sei informar.',
                ].map((opt, i) => (
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
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico Estratégico Setorial</h1>
        <p className="text-muted-foreground mt-1">
          JBP Gestão Master V 6.5 — Etapa {step + 1} de {totalSteps}
        </p>
      </div>
      <Progress value={((step + 1) / totalSteps) * 100} className="h-2 mb-6" />

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
                  value={empresa.nome}
                  onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })}
                  placeholder="Ex: Minha Empresa Ltda."
                />
              </div>
              <div>
                <Label>Faturamento Mensal</Label>
                <Select
                  value={empresa.faturamento}
                  onValueChange={(v) => setEmpresa({ ...empresa, faturamento: v })}
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
                  value={empresa.funcionarios}
                  onValueChange={(v) => setEmpresa({ ...empresa, funcionarios: v })}
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
            <div className="space-y-4">
              <div>
                <Label>Setor de Atuação *</Label>
                <Select
                  value={setorId}
                  onValueChange={(v) => {
                    setSetorId(v)
                    setSegmento('')
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

          {step === 2 && renderPilarStep(1)}
          {step === 3 && renderPilarStep(2)}
          {step === 4 && renderPilarStep(3)}

          {step === 5 && (
            <>
              <div>
                <Label htmlFor="objetivos">Seus Objetivos Estratégicos *</Label>
                <Textarea
                  id="objetivos"
                  value={objetivos.descricao}
                  onChange={(e) => setObjetivos({ ...objetivos, descricao: e.target.value })}
                  placeholder="Descreva onde você quer chegar nos próximos meses. Ex: Sair da operação, dobrar faturamento, delegar gestão..."
                  rows={5}
                />
              </div>
              <div>
                <Label>Horizonte de Tempo *</Label>
                <Select
                  value={objetivos.prazo}
                  onValueChange={(v) => setObjetivos({ ...objetivos, prazo: v })}
                >
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

          {step === 6 && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Empresa:</span> {empresa.nome}
              </div>
              {setorSelecionado && (
                <div>
                  <span className="text-muted-foreground">Setor / Segmento:</span>{' '}
                  {setorSelecionado.nome} — {segmento}
                </div>
              )}
              {empresa.faturamento && (
                <div>
                  <span className="text-muted-foreground">Faturamento:</span> {empresa.faturamento}
                </div>
              )}
              {empresa.funcionarios && (
                <div>
                  <span className="text-muted-foreground">Colaboradores:</span>{' '}
                  {empresa.funcionarios}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Objetivos:</span> {objetivos.descricao}
              </div>
              <div>
                <span className="text-muted-foreground">Prazo:</span> {objetivos.prazo}
              </div>
              {setorSelecionado && (
                <div className="pt-2">
                  <span className="text-muted-foreground">Respostas dos 3 Pilares:</span>{' '}
                  <Badge variant="secondary">
                    {setorSelecionado.perguntas.length} perguntas respondidas
                  </Badge>
                </div>
              )}
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
        {step < totalSteps - 1 ? (
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

// Helper: mapeia o índice global da pergunta (dentro da lista setor.perguntas)
// para o índice local dentro do pilar correspondente.
function idxGlobalParaPilar(setor: (typeof setores)[number], idxGlobal: number): number {
  const p = setor.perguntas[idxGlobal]
  if (!p) return idxGlobal
  return setor.perguntas.filter((q) => q.pilar === p.pilar).indexOf(p)
}
