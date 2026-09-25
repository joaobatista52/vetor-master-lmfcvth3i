import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  User,
  Phone,
  Briefcase,
  DollarSign,
  Loader2,
  Copy,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/Logo'
import { SETORES_CANONICOS_12 } from '@/data/setores-canonicos'
import { enviarListaPrioridade, type SendResult } from '@/services/leads-unificados'

const FAIXAS_FATURAMENTO = [
  'Até R$ 50 mil / mês (Até R$ 600 mil / ano)',
  'R$ 50 mil a R$ 150 mil / mês (R$ 600 mil a R$ 1,8M / ano)',
  'R$ 150 mil a R$ 500 mil / mês (R$ 1,8M a R$ 6M / ano)',
  'R$ 500 mil a R$ 1,5 milhão / mês (R$ 6M a R$ 18M / ano)',
  'R$ 1,5 milhão a R$ 5 milhões / mês (R$ 18M a R$ 60M / ano)',
  'Acima de R$ 5 milhões / mês (> R$ 60M / ano)',
]

export default function ListaPrioridade() {
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [emailCorporativo, setEmailCorporativo] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [setor, setSetor] = useState('')
  const [faturamentoMensal, setFaturamentoMensal] = useState('')
  const [cargoFuncao, setCargoFuncao] = useState('')

  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<SendResult | null>(null)
  const [copiado, setCopiado] = useState(false)

  const isFormValido =
    nomeCompleto.trim().length >= 3 &&
    emailCorporativo.includes('@') &&
    whatsapp.trim().length >= 8 &&
    empresa.trim().length >= 2 &&
    setor !== '' &&
    faturamentoMensal !== '' &&
    cargoFuncao.trim().length >= 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValido) return

    setLoading(true)
    try {
      const res = await enviarListaPrioridade({
        nome_completo: nomeCompleto.trim(),
        email_corporativo: emailCorporativo.trim(),
        whatsapp: whatsapp.trim(),
        empresa: empresa.trim(),
        setor,
        faturamento_mensal: faturamentoMensal,
        cargo_funcao: cargoFuncao.trim(),
      })
      setResultado(res)
    } finally {
      setLoading(false)
    }
  }

  const copiarProtocolo = () => {
    if (!resultado?.protocolo) return
    navigator.clipboard.writeText(resultado.protocolo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC]">
      {/* Barra Superior / Logo */}
      <header className="border-b border-[#24334F] bg-[#0B1120]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo variant="horizontal" size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-[#24334F] text-[#C7D0E0] hover:bg-[#16213A] rounded-[4px] text-xs"
            >
              <Link to="/questionario">Fazer Diagnóstico em 72h</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[#8B98B4] hover:text-[#F8FAFC] rounded-[4px] text-xs hidden sm:inline-flex"
            >
              <Link to="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
        {/* Cabeçalho */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge className="bg-[#5B9DFF]/15 text-[#5B9DFF] border-[#5B9DFF]/30 text-xs font-semibold uppercase tracking-wider">
            Documento 2 • Lista de Prioridade SaaS
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
            Garanta Sua Vaga no Plano SaaS Puro
          </h1>
          <p className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
            Tenha acesso prioritário à plataforma determinística com Consultor Digital V7.2,
            dashboards setoriais e desdobramentos 5W2H por R$ 1.190,00/mês. As vagas são liberadas
            em lotes controlados para garantir o SLA determinístico de atendimento.
          </p>
        </div>

        {resultado ? (
          /* Tela de Confirmação com Protocolo Imediato */
          <Card className="bg-[#16213A] border-2 border-[#3DDC74]/50 rounded-[4px] shadow-2xl overflow-hidden">
            <div className="bg-[#3DDC74]/15 border-b border-[#3DDC74]/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#3DDC74]" />
                <span className="font-semibold text-sm text-[#3DDC74]">
                  Inscrição Confirmada com Sucesso
                </span>
              </div>
              <Badge className="bg-[#111A2E] text-[#8B98B4] border border-[#24334F] text-[10px] font-mono">
                {resultado.armazenamento === 'remoto'
                  ? 'Base Unificada Online'
                  : 'Fila Local Segura'}
              </Badge>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-[#F8FAFC]">
                  Você está oficialmente na Lista de Prioridade SaaS!
                </h2>
                <p className="text-xs sm:text-sm text-[#C7D0E0] leading-relaxed">
                  Guardamos sua solicitação para a empresa{' '}
                  <strong className="text-[#F8FAFC]">{empresa}</strong> no setor{' '}
                  <strong className="text-[#5B9DFF]">{setor}</strong>. Nossa equipe entrará em
                  contato via WhatsApp e e-mail assim que o próximo lote de licenças for liberado.
                </p>
              </div>

              {/* Box de Protocolo */}
              <div className="bg-[#111A2E] border border-[#24334F] rounded-[4px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-[#8B98B4] uppercase tracking-wider block font-semibold">
                    Número de Protocolo Oficial
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#3DDC74]">
                    {resultado.protocolo}
                  </span>
                </div>
                <Button
                  onClick={copiarProtocolo}
                  variant="outline"
                  className="gap-2 border-[#24334F] text-[#C7D0E0] hover:bg-[#16213A] rounded-[4px] text-xs"
                >
                  {copiado ? (
                    <>
                      <Check className="w-4 h-4 text-[#3DDC74]" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#5B9DFF]" /> Copiar Protocolo
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-[#16213A] border border-[#24334F] rounded-[4px] p-4 text-xs text-[#C7D0E0] space-y-1">
                <p>
                  <strong>Contato registrado:</strong> {nomeCompleto} ({cargoFuncao}) •{' '}
                  {emailCorporativo} • {whatsapp}
                </p>
                <p>
                  <strong>Plano solicitado:</strong> SaaS Puro — R$ 1.190,00/mês
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#24334F]">
                <Button
                  asChild
                  className="w-full sm:w-auto bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-semibold text-xs py-5 px-6 gap-2"
                >
                  <Link to="/questionario">
                    <span>Iniciar Diagnóstico Estratégico Gratuito (72h)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="text-[#8B98B4] hover:text-[#F8FAFC] text-xs"
                >
                  <Link to="/">Voltar à Página Inicial</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Formulário de Inscrição */
          <Card className="bg-[#16213A] border border-[#24334F] rounded-[4px] shadow-xl">
            <CardHeader className="border-b border-[#24334F] pb-4">
              <CardTitle className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#3DDC74]" /> Dados do Solicitante e da Empresa
              </CardTitle>
              <CardDescription className="text-xs text-[#C7D0E0]">
                Preencha todos os campos obrigatórios (*) para validar sua inscrição na lista.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[#C7D0E0] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#5B9DFF]" /> Nome Completo *
                    </Label>
                    <Input
                      required
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      placeholder="Ex.: Carlos Mendes"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
                    />
                  </div>

                  {/* Cargo / Função */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[#C7D0E0] flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-[#5B9DFF]" /> Cargo / Função *
                    </Label>
                    <Input
                      required
                      value={cargoFuncao}
                      onChange={(e) => setCargoFuncao(e.target.value)}
                      placeholder="Ex.: CEO, Diretor Executivo, Sócio-Fundador"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
                    />
                  </div>

                  {/* E-mail Corporativo */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[#C7D0E0] flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#5B9DFF]" /> E-mail Corporativo *
                    </Label>
                    <Input
                      type="email"
                      required
                      value={emailCorporativo}
                      onChange={(e) => setEmailCorporativo(e.target.value)}
                      placeholder="diretoria@empresa.com.br"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
                    />
                  </div>

                  {/* WhatsApp com DDD */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[#C7D0E0] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#5B9DFF]" /> WhatsApp com DDD *
                    </Label>
                    <Input
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
                    />
                  </div>

                  {/* Nome da Empresa / Razão Social */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs text-[#C7D0E0] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#5B9DFF]" /> Nome da Empresa / Razão
                      Social *
                    </Label>
                    <Input
                      required
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      placeholder="Ex.: Grupo Soluções Médicas Ltda"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
                    />
                  </div>

                  {/* Setor de Atuação (12 Canônicos) */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[#C7D0E0]">
                      Setor de Atuação (12 Canônicos) *
                    </Label>
                    <Select value={setor} onValueChange={setSetor}>
                      <SelectTrigger className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]">
                        <SelectValue placeholder="Selecione o setor..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#16213A] border-[#24334F] text-[#F8FAFC]">
                        {SETORES_CANONICOS_12.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.nome}
                            className="text-xs cursor-pointer hover:bg-[#1B2742]"
                          >
                            <span className="font-mono text-[#5B9DFF] mr-2">{s.numero}.</span>
                            <span>{s.nome}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Faixa de Faturamento Mensal */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[#C7D0E0] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#3DDC74]" /> Faixa de Faturamento
                      Mensal *
                    </Label>
                    <Select value={faturamentoMensal} onValueChange={setFaturamentoMensal}>
                      <SelectTrigger className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]">
                        <SelectValue placeholder="Selecione a faixa..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#16213A] border-[#24334F] text-[#F8FAFC]">
                        {FAIXAS_FATURAMENTO.map((f) => (
                          <SelectItem
                            key={f}
                            value={f}
                            className="text-xs cursor-pointer hover:bg-[#1B2742]"
                          >
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-[#111A2E] p-4 rounded-[4px] border border-[#24334F] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#3DDC74]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Benefícios Garantidos ao Entrar na Lista</span>
                  </div>
                  <ul className="text-xs text-[#C7D0E0] space-y-1.5 list-disc list-inside">
                    <li>
                      Congelamento do valor de lançamento (R$ 1.190,00/mês sem reajuste por 12
                      meses)
                    </li>
                    <li>Onboarding assistido com equipe técnica da Vetor Master</li>
                    <li>Notificação prévia de 48h antes da abertura pública do lote</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={!isFormValido || loading}
                  className="w-full bg-[#0066CC] hover:bg-[#22B14C] text-white font-semibold rounded-[4px] py-6 text-sm gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Registrando sua vaga...
                    </>
                  ) : (
                    <>
                      <span>Entrar na Lista de Prioridade SaaS</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
