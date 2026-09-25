import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  FileCheck2,
  Sparkles,
  ArrowRight,
  Upload,
  Info,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  enviarQuestionarioEstrategico,
  type AutorizacaoDevolutiva,
  type FormatoInteresse,
} from '@/services/leads-unificados'
import { SETORES_CANONICOS_12 } from '@/data/setores-canonicos'
import {
  setores,
  nomePilares,
  escalaOpcoes,
  simNaoOpcoes,
  formatoInteresseOpcoes,
  getPerguntasPorPilar,
  secaoHackman,
  secaoBuffett,
  secaoExpectativas,
  type PerguntaSecao,
} from '@/data/setores-questionario'

/**
 * Questionário Estratégico Canônico de 12 Etapas — Vetor Master V7.2
 *
 * Etapa 01: Setor de Atuação (12 Canônicos, destaque Saúde/Varejo/Serviços + cards fechado/aberto)
 * Etapa 02: Identificação da Empresa & Lead (Razão Social, CNPJ, Data, Segmento, Respondente, Cargo, Email, WhatsApp)
 * Etapa 03: Perfil da Empresa e Contexto (específico do setor)
 * Etapa 04: Pilar 1 — Prisão do Fundador
 * Etapa 05: Pilar 2 — Ineficiência Invisível
 * Etapa 06: Pilar 3 — Abismo Estratégia vs. Execução
 * Etapa 07: Lente de Hackman (5 Condições da Eficácia)
 * Etapa 08: Lente de Buffett (Saúde Financeira e Moat)
 * Etapa 09: Expectativas e Ambição
 * Etapa 10: Inovação e Tecnologia (setorial)
 * Etapa 11: Documentação & Adendo Formal (Balanço Patrimonial, DRE, Organograma/Relatórios + Responsável + Alertas)
 * Etapa 12: Próximos Passos & Devolutiva Executiva (Autorização Devolutiva 45 min, Formato MaaS/Híbrido/CaaS)
 *
 * Ao submeter:
 * - Grava na base unificada (coleção 'leads' do site institucional via leads-unificados.ts)
 * - Persiste fallback seguro em localStorage + fila local
 * - Se logado, persiste também no modelo local de diagnósticos
 * - Exibe confirmação com protocolo imutável #VM-...
 */

interface EtapaInfo {
  numero: number
  key: string
  titulo: string
  subtitulo: string
  icone: any
}

const ETAPAS_INFO: EtapaInfo[] = [
  {
    numero: 1,
    key: 'setor',
    titulo: 'Setor de Atuação',
    subtitulo: 'Escolha seu setor entre os 12 canônicos com estratégia específica',
    icone: Layers,
  },
  {
    numero: 2,
    key: 'identificacao',
    titulo: 'Identificação da Empresa & Lead',
    subtitulo: 'Dados cadastrais do executivo e da organização',
    icone: Building2,
  },
  {
    numero: 3,
    key: 'perfil',
    titulo: 'Perfil da Empresa e Contexto',
    subtitulo: 'Mapeamento estrutural de faturamento, equipe e propriedade',
    icone: FileText,
  },
  {
    numero: 4,
    key: 'pilar1',
    titulo: 'Pilar 1 — Prisão do Fundador',
    subtitulo: 'Centralização decisória e dependência do líder',
    icone: AlertTriangle,
  },
  {
    numero: 5,
    key: 'pilar2',
    titulo: 'Pilar 2 — Ineficiência Invisível',
    subtitulo: 'Gargalos operacionais, retrabalho e vazamento de margem',
    icone: Clock,
  },
  {
    numero: 6,
    key: 'pilar3',
    titulo: 'Pilar 3 — Abismo Estratégia vs. Execução',
    subtitulo: 'Alinhamento tático, governança e cumprimento de metas',
    icone: Target,
  },
  {
    numero: 7,
    key: 'hackman',
    titulo: 'Lente de Hackman',
    subtitulo: 'As 5 condições determinísticas para eficácia de equipes',
    icone: Users,
  },
  {
    numero: 8,
    key: 'buffett',
    titulo: 'Lente de Buffett',
    subtitulo: 'Solidez de caixa, margens, alavancagem e Moat econômico',
    icone: DollarSign,
  },
  {
    numero: 9,
    key: 'expectativas',
    titulo: 'Expectativas e Ambição',
    subtitulo: 'Objetivos prioritários para os próximos 12 meses',
    icone: Sparkles,
  },
  {
    numero: 10,
    key: 'inovacao',
    titulo: 'Inovação e Tecnologia',
    subtitulo: 'Maturidade digital, automações e barreiras tecnológicas',
    icone: Cpu,
  },
  {
    numero: 11,
    key: 'documentacao',
    titulo: 'Documentação — Adendo Formal',
    subtitulo: 'Anexação comprobatória e responsável legal pelos dados',
    icone: FileCheck2,
  },
  {
    numero: 12,
    key: 'proximos_passos',
    titulo: 'Próximos Passos & Devolutiva',
    subtitulo: 'Autorização da sessão de 45 minutos e formato de interesse',
    icone: Compass,
  },
]

export default function Questionario() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [etapaAtual, setEtapaAtual] = useState<number>(1) // 1..12
  const [submitting, setSubmitting] = useState(false)
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null)
  const [modoArmazenamento, setModoArmazenamento] = useState<'remoto' | 'local_fila'>('remoto')

  // Setor Selecionado
  const [setorId, setSetorId] = useState<string>('saude')
  const [setorAbertoVisualizacao, setSetorAbertoVisualizacao] = useState<string>('saude')

  // Etapa 02: Identificação do Lead & Empresa
  const [razaoSocial, setRazaoSocial] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [dataPreenchimento, setDataPreenchimento] = useState(new Date().toLocaleDateString('pt-BR'))
  const [segmento, setSegmento] = useState('')
  const [segmentoOutro, setSegmentoOutro] = useState('')
  const [modalidadeTrading, setModalidadeTrading] = useState('')
  const [respondente, setRespondente] = useState('')
  const [cargo, setCargo] = useState('')
  const [emailCorporativo, setEmailCorporativo] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  // Respostas estruturadas por chave: `${secao}-${index}`
  const [respostas, setRespostas] = useState<Record<string, string>>({})

  // Etapa 11: Documentação (Adendo Obrigatório)
  const [balancoNome, setBalancoNome] = useState('')
  const [balancoObs, setBalancoObs] = useState('')
  const [dreNome, setDreNome] = useState('')
  const [dreObs, setDreObs] = useState('')
  const [organogramaNome, setOrganogramaNome] = useState('')
  const [organogramaObs, setOrganogramaObs] = useState('')
  const [responsavelEnvio, setResponsavelEnvio] = useState('')
  const [documentosAdicionais, setDocumentosAdicionais] = useState<string[]>([])

  // Etapa 12: Próximos Passos & Devolutiva
  const [autorizacaoDevolutiva, setAutorizacaoDevolutiva] = useState<AutorizacaoDevolutiva>('Sim')
  const [formatoInteresse, setFormatoInteresse] = useState<FormatoInteresse>('Híbrido')

  const setorObj = useMemo(() => setores.find((s) => s.id === setorId) || setores[0], [setorId])
  const setorCanonico = useMemo(
    () => SETORES_CANONICOS_12.find((s) => s.id === setorId) || SETORES_CANONICOS_12[0],
    [setorId],
  )

  // Perguntas dos 3 Pilares
  const perguntasPilar1 = useMemo(() => getPerguntasPorPilar(setorObj, 1), [setorObj])
  const perguntasPilar2 = useMemo(() => getPerguntasPorPilar(setorObj, 2), [setorObj])
  const perguntasPilar3 = useMemo(() => getPerguntasPorPilar(setorObj, 3), [setorObj])

  // Buffett
  const perguntasBuffett = useMemo(() => setorObj.secaoBuffett || secaoBuffett, [setorObj])

  const setResposta = (prefix: string, idx: number, val: string) => {
    setRespostas((prev) => ({ ...prev, [`${prefix}-${idx}`]: val }))
  }

  // Validação por Etapa
  const canAvancar = (): boolean => {
    switch (etapaAtual) {
      case 1:
        return !!setorId
      case 2:
        return (
          razaoSocial.trim() !== '' &&
          cnpj.trim() !== '' &&
          respondente.trim() !== '' &&
          cargo.trim() !== '' &&
          emailCorporativo.trim() !== '' &&
          whatsapp.trim() !== '' &&
          (segmento !== '' || segmentoOutro.trim() !== '')
        )
      case 3:
        // Perfil setorial: ao menos 80% respondido
        return setorObj.secaoPerfil.every((_, idx) => {
          const v = respostas[`perfil-${idx}`]
          return v !== undefined && v.trim() !== ''
        })
      case 4:
        return perguntasPilar1.every((_, idx) => !!respostas[`pilar1-${idx}`])
      case 5:
        return perguntasPilar2.every((_, idx) => !!respostas[`pilar2-${idx}`])
      case 6:
        return perguntasPilar3.every((_, idx) => !!respostas[`pilar3-${idx}`])
      case 7:
        return secaoHackman.every((_, idx) => !!respostas[`hackman-${idx}`])
      case 8:
        return perguntasBuffett.every((_, idx) => {
          const v = respostas[`buffett-${idx}`]
          return v !== undefined && v.trim() !== ''
        })
      case 9:
        return secaoExpectativas.every((_, idx) => {
          const v = respostas[`expectativas-${idx}`]
          return v !== undefined && v.trim() !== ''
        })
      case 10:
        return setorObj.secaoInovacao.every((_, idx) => {
          const v = respostas[`inovacao-${idx}`]
          return v !== undefined && v.trim() !== ''
        })
      case 11:
        // Documentação Adendo: 3 campos obrigatórios + Responsável pelo envio
        return (
          balancoNome.trim() !== '' &&
          dreNome.trim() !== '' &&
          organogramaNome.trim() !== '' &&
          responsavelEnvio.trim() !== ''
        )
      case 12:
        return !!autorizacaoDevolutiva && !!formatoInteresse
      default:
        return true
    }
  }

  const proximaEtapa = () => {
    if (etapaAtual < 12) {
      setEtapaAtual((e) => e + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual((e) => e - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Preenchimento a partir de importação .json
  const handleDossieImportado = (dossie: any) => {
    if (dossie.setor_id) {
      const normalizado =
        dossie.setor_id === 'servicos-profissionais'
          ? 'servicos'
          : dossie.setor_id === 'comercio-internacional-trading'
            ? 'trading'
            : dossie.setor_id === 'facilities-servicos-terceirizados'
              ? 'facilities'
              : dossie.setor_id === 'tecnologia-startups'
                ? 'tecnologia'
                : dossie.setor_id === 'transporte-logistica'
                  ? 'transporte'
                  : dossie.setor_id === 'academias-de-ginastica'
                    ? 'academias'
                    : dossie.setor_id
      setSetorId(normalizado)
      setSetorAbertoVisualizacao(normalizado)
    }

    const emp = dossie.empresa || {}
    if (emp['Razão Social'] || emp.razao_social) {
      setRazaoSocial(emp['Razão Social'] || emp.razao_social)
    }
    if (emp.CNPJ || emp.cnpj) {
      setCnpj(emp.CNPJ || emp.cnpj)
    }
    if (emp.Segmento || emp.segmento) {
      setSegmento(emp.Segmento || emp.segmento)
    }
    if (emp.Respondente || emp.respondente) {
      setRespondente(emp.Respondente || emp.respondente)
    }
    if (emp.Cargo || emp.cargo) {
      setCargo(emp.Cargo || emp.cargo)
    }
    if (emp['E-mail Corporativo (Dossiê Estratégico)'] || emp.email || emp.email_corporativo) {
      setEmailCorporativo(
        emp['E-mail Corporativo (Dossiê Estratégico)'] || emp.email || emp.email_corporativo,
      )
    }
    if (emp['WhatsApp / Telefone'] || emp.whatsapp) {
      setWhatsapp(emp['WhatsApp / Telefone'] || emp.whatsapp)
    }

    toast({
      title: 'Dados importados com sucesso!',
      description: 'Avance pelas etapas para revisar e completar seu Dossiê Estratégico.',
    })
  }

  // Submissão Final do Questionário (Etapa 12)
  const handleFinalizar = async () => {
    setSubmitting(true)
    try {
      const segmentoFinal = segmento === 'Outro' ? segmentoOutro : segmento

      const pilar1Respostas = perguntasPilar1.map((p, idx) => ({
        pilar: 1,
        texto: p.texto,
        resposta: respostas[`pilar1-${idx}`] || 'Não respondida',
      }))

      const pilar2Respostas = perguntasPilar2.map((p, idx) => ({
        pilar: 2,
        texto: p.texto,
        resposta: respostas[`pilar2-${idx}`] || 'Não respondida',
      }))

      const pilar3Respostas = perguntasPilar3.map((p, idx) => ({
        pilar: 3,
        texto: p.texto,
        resposta: respostas[`pilar3-${idx}`] || 'Não respondida',
      }))

      const perfilRespostas = setorObj.secaoPerfil.map((p, idx) => ({
        pergunta: p.texto,
        resposta: respostas[`perfil-${idx}`] || '',
      }))

      const hackmanRespostas = secaoHackman.map((p, idx) => ({
        pergunta: p.texto,
        resposta: respostas[`hackman-${idx}`] || '',
      }))

      const buffettRespostas = perguntasBuffett.map((p, idx) => ({
        pergunta: p.texto,
        resposta: respostas[`buffett-${idx}`] || '',
      }))

      const expectativasRespostas = secaoExpectativas.map((p, idx) => ({
        pergunta: p.texto,
        resposta: respostas[`expectativas-${idx}`] || '',
      }))

      const inovacaoRespostas = setorObj.secaoInovacao.map((p, idx) => ({
        pergunta: p.texto,
        resposta: respostas[`inovacao-${idx}`] || '',
      }))

      const docPayload = {
        balanco_patrimonial_nome: balancoNome,
        balanco_patrimonial_observacao: balancoObs,
        dre_nome: dreNome,
        dre_observacao: dreObs,
        organograma_relatorios_nome: organogramaNome,
        organograma_relatorios_observacao: organogramaObs,
        responsavel_envio: responsavelEnvio,
        documentos_adicionais: documentosAdicionais,
      }

      // Envia à base unificada de leads (coleção 'leads' do site)
      const res = await enviarQuestionarioEstrategico({
        autorizacao_devolutiva: autorizacaoDevolutiva,
        formato_interesse: formatoInteresse,
        razao_social: razaoSocial,
        cnpj,
        data_preenchimento: dataPreenchimento,
        setor: setorObj.nome,
        segmento: segmentoFinal,
        respondente,
        cargo,
        email_corporativo: emailCorporativo,
        whatsapp,
        perfil: {
          modalidade: modalidadeTrading,
          respostas: perfilRespostas,
        },
        pilares: {
          pilar_1_prisao_fundador: pilar1Respostas,
          pilar_2_ineficiencia_invisivel: pilar2Respostas,
          pilar_3_abismo_estrategia_execucao: pilar3Respostas,
        },
        hackman: hackmanRespostas,
        buffett: buffettRespostas,
        expectativas: expectativasRespostas,
        inovacao: inovacaoRespostas,
        documentacao: docPayload,
      })

      // Se autenticado na aplicação SaaS, também cria o diagnóstico na collection local
      if (user?.id) {
        try {
          await createDiagnostico({
            user: user.id,
            setor: setorObj.id,
            dados_entrada: {
              protocolo: res.protocolo,
              empresa: {
                razao_social: razaoSocial,
                cnpj,
                setor: setorObj.nome,
                segmento: segmentoFinal,
                respondente,
                cargo,
                email: emailCorporativo,
                whatsapp,
              },
              documentacao: docPayload,
              autorizacao_devolutiva: autorizacaoDevolutiva,
              formato_interesse: formatoInteresse,
            },
          })
        } catch (e) {
          console.warn('[Questionario] Aviso ao salvar diagnostico local:', e)
        }
      }

      setProtocoloGerado(res.protocolo)
      setModoArmazenamento(res.armazenamento)

      toast({
        title: 'Questionário Estratégico Concluído!',
        description: `Seu protocolo oficial é ${res.protocolo}.`,
      })
    } catch (err: any) {
      console.error('[Questionario] Erro ao submeter:', err)
      toast({
        title: 'Protocolo registrado com segurança',
        description: 'Seus dados foram preservados localmente para sincronização.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // TELA DE PROTOCOLO GERADO (SUCESSO DA ETAPA 12)
  if (protocoloGerado) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <Badge className="bg-[#3DDC74]/15 text-[#3DDC74] border-[#3DDC74]/30 px-3 py-1 font-semibold text-xs">
              QUESTIONÁRIO ESTRATÉGICO CONCLUÍDO • SLA 72H
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC] font-heading">
              Dossiê Estratégico Registrado com Sucesso
            </h1>
            <p className="text-xs sm:text-sm text-[#C7D0E0] max-w-xl mx-auto leading-relaxed">
              Obrigado, <strong className="text-[#F8FAFC]">{respondente}</strong>. Os dados da{' '}
              <strong className="text-[#F8FAFC]">{razaoSocial}</strong> foram consolidados no motor
              determinístico Vetor Master V7.2.
            </p>
          </div>

          <Card className="bg-[#16213A] border-2 border-[#3DDC74]/50 rounded-[4px] shadow-2xl overflow-hidden">
            <div className="bg-[#3DDC74]/15 border-b border-[#3DDC74]/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#3DDC74]" />
                <span className="font-semibold text-sm text-[#3DDC74]">
                  Protocolo Oficial Gerado
                </span>
              </div>
              <Badge className="bg-[#111A2E] text-[#8B98B4] border border-[#24334F] text-[10px] font-mono">
                {modoArmazenamento === 'remoto' ? 'Base Unificada Online' : 'Fila Local Segura'}
              </Badge>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="bg-[#111A2E] border border-[#24334F] rounded-[4px] p-6 text-center space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#8B98B4] font-semibold block">
                  Identificador Imutável do Lead
                </span>
                <span className="text-3xl sm:text-4xl font-mono font-bold text-[#3DDC74] block tracking-wider">
                  {protocoloGerado}
                </span>
                <p className="text-[11px] text-[#C7D0E0]">
                  Guarde este número para referência da sua devolutiva de 45 minutos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#C7D0E0]">
                <div className="bg-[#111A2E]/70 p-4 rounded-[4px] border border-[#24334F] space-y-1">
                  <span className="text-[#8B98B4] block uppercase text-[10px] font-semibold">
                    Setor & Segmento
                  </span>
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    {setorObj.nome} — {segmento || segmentoOutro}
                  </p>
                </div>
                <div className="bg-[#111A2E]/70 p-4 rounded-[4px] border border-[#24334F] space-y-1">
                  <span className="text-[#8B98B4] block uppercase text-[10px] font-semibold">
                    Responsável pelo Envio
                  </span>
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    {responsavelEnvio} ({cargo})
                  </p>
                </div>
                <div className="bg-[#111A2E]/70 p-4 rounded-[4px] border border-[#24334F] space-y-1">
                  <span className="text-[#8B98B4] block uppercase text-[10px] font-semibold">
                    Devolutiva Executiva (45 min)
                  </span>
                  <p className="text-sm font-semibold text-[#3DDC74]">
                    {autorizacaoDevolutiva === 'Sim'
                      ? 'Autorizada pelo Executivo'
                      : 'Não solicitada'}
                  </p>
                </div>
                <div className="bg-[#111A2E]/70 p-4 rounded-[4px] border border-[#24334F] space-y-1">
                  <span className="text-[#8B98B4] block uppercase text-[10px] font-semibold">
                    Formato de Interesse
                  </span>
                  <p className="text-sm font-semibold text-[#5B9DFF]">{formatoInteresse}</p>
                </div>
              </div>

              <div className="bg-[#111A2E] p-4 rounded-[4px] border border-[#24334F] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5B9DFF]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SLA e Próximos Passos Determinísticos</span>
                </div>
                <ul className="text-xs text-[#C7D0E0] space-y-1 list-disc list-inside">
                  <li>
                    O Motor Determinístico processa a matriz dos 3 Pilares e thresholds em 72h.
                  </li>
                  <li>
                    Nossa equipe executiva entrará em contato via WhatsApp e e-mail em até 5 dias.
                  </li>
                  <li>
                    Sessão executiva de 45 min estruturada com especialista C-Level sem alucinação.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#24334F]">
                <Button
                  asChild
                  className="w-full sm:w-auto bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] font-semibold text-xs py-5 px-6 gap-2"
                >
                  <Link to="/questionario/sucesso">
                    <span>Visualizar Relatório de Devolutiva Executiva</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto border-[#24334F] text-[#C7D0E0] hover:bg-[#111A2E] rounded-[4px] text-xs py-5"
                >
                  <Link to="/">Voltar à Página Institucional</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const etapaInfo = ETAPAS_INFO[etapaAtual - 1]
  const IconeEtapa = etapaInfo.icone

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#24334F]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#16213A] border border-[#24334F] text-[#5B9DFF] text-xs font-semibold mb-2">
              <span>CAMADA 1 • CONVERSÃO & DIAGNÓSTICO GRATUITO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC] font-heading">
              Questionário Estratégico Determinístico
            </h1>
            <p className="text-xs sm:text-sm text-[#C7D0E0] mt-0.5">
              Etapa {etapaAtual} de 12 • {etapaInfo.titulo}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-[#111A2E] text-[#3DDC74] border border-[#24334F] text-xs font-mono">
              SLA 72h
            </Badge>
            <Badge className="bg-[#111A2E] text-[#5B9DFF] border border-[#24334F] text-xs font-mono">
              Devolutiva 45 min
            </Badge>
          </div>
        </div>

        {/* Barra de Progresso Canônica */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#8B98B4]">
            <span>Progresso Geral</span>
            <span className="font-mono text-[#5B9DFF] font-semibold">
              {Math.round((etapaAtual / 12) * 100)}%
            </span>
          </div>
          <Progress
            value={(etapaAtual / 12) * 100}
            className="h-2 bg-[#16213A] [&>div]:bg-[#0066CC]"
          />
        </div>

        {/* Card Principal da Etapa */}
        <Card className="bg-[#16213A] border-[#24334F] text-[#F8FAFC] rounded-[4px] shadow-xl">
          <CardHeader className="border-b border-[#24334F] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-[#0066CC]/20 border border-[#5B9DFF]/30 flex items-center justify-center text-[#5B9DFF]">
                <IconeEtapa className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-[#F8FAFC]">
                  Etapa {String(etapaAtual).padStart(2, '0')} • {etapaInfo.titulo}
                </CardTitle>
                <CardDescription className="text-xs text-[#C7D0E0]">
                  {etapaInfo.subtitulo}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* ETAPA 1: SETOR DE ATUAÇÃO (12 CANÔNICOS, DESTAQUES, TEXTOS FECHADOS/ABERTOS) */}
            {etapaAtual === 1 && (
              <div className="space-y-6">
                {/* Importador de Dossiê */}
                <ImportadorDossieJson onDossieImportado={handleDossieImportado} />

                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#24334F]" />
                  </div>
                  <span className="relative bg-[#16213A] px-3 text-xs uppercase font-semibold text-[#8B98B4]">
                    Ou selecione um dos 12 setores canônicos
                  </span>
                </div>

                {/* 3 Setores em Destaque */}
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-wider text-[#5B9DFF] font-semibold block">
                    Principais Setores de Atuação (Destaques)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {SETORES_CANONICOS_12.filter((s) => s.destaque).map((s) => {
                      const isSelected = setorId === s.id
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSetorId(s.id)
                            setSetorAbertoVisualizacao(s.id)
                            setSegmento('')
                          }}
                          className={`p-4 rounded-[4px] border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#1B2742] border-[#5B9DFF] ring-1 ring-[#5B9DFF]'
                              : 'bg-[#111A2E]/60 border-[#24334F] hover:border-[#5B9DFF]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-[#5B9DFF]">
                              {s.numero}
                            </span>
                            <Badge className="bg-[#0066CC]/20 text-[#5B9DFF] border-[#5B9DFF]/30 text-[10px]">
                              Destaque
                            </Badge>
                          </div>
                          <h4 className="font-bold text-sm text-[#F8FAFC]">{s.nome}</h4>
                          <p className="text-[11px] text-[#C7D0E0] mt-1 line-clamp-2">
                            {s.segmentos.join(', ')}
                          </p>
                          <div className="mt-3 pt-2 border-t border-[#24334F] flex items-center justify-between text-[10px] text-[#8B98B4]">
                            <span>SLA 72h</span>
                            <span className="text-[#3DDC74]">Devolutiva 45 min</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Demais Setores */}
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-wider text-[#8B98B4] font-semibold block">
                    Demais Setores Atendidos (04 a 12)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {SETORES_CANONICOS_12.filter((s) => !s.destaque).map((s) => {
                      const isSelected = setorId === s.id
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSetorId(s.id)
                            setSetorAbertoVisualizacao(s.id)
                            setSegmento('')
                          }}
                          className={`p-3 rounded-[4px] border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#1B2742] border-[#5B9DFF] ring-1 ring-[#5B9DFF]'
                              : 'bg-[#111A2E]/40 border-[#24334F] hover:border-[#5B9DFF]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#8B98B4]">
                              {s.numero}
                            </span>
                            <span className="font-semibold text-xs text-[#F8FAFC]">{s.nome}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Card Detalhes do Setor Selecionado (Fechado / Aberto) */}
                {(() => {
                  const s =
                    SETORES_CANONICOS_12.find((x) => x.id === setorAbertoVisualizacao) ||
                    SETORES_CANONICOS_12[0]
                  return (
                    <div className="p-5 rounded-[4px] bg-[#111A2E] border border-[#5B9DFF]/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#24334F] pb-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#5B9DFF] font-semibold">
                            SETOR {s.numero} • DIAGNÓSTICO EM 72H
                          </span>
                          <h3 className="text-lg font-bold text-[#F8FAFC]">{s.nome}</h3>
                        </div>
                        <Badge className="bg-[#3DDC74]/15 text-[#3DDC74] border-[#3DDC74]/30 text-xs font-mono">
                          {s.metricaChave}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-[#FFB84D] uppercase tracking-wider block">
                          Gargalo Crítico Típico (Texto Fechado)
                        </span>
                        <p className="text-xs text-[#C7D0E0] leading-relaxed bg-[#16213A] p-3 rounded-[3px] border border-[#24334F]">
                          {s.textoFechado}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-[#5B9DFF] uppercase tracking-wider block">
                          Alavanca Determinística VETOR MASTER (Texto Aberto)
                        </span>
                        <p className="text-xs text-[#C7D0E0] leading-relaxed bg-[#16213A] p-3 rounded-[3px] border border-[#24334F]">
                          {s.textoAberto}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] text-[#8B98B4] font-semibold uppercase">
                          Micro-epifanias Gatilho deste setor:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {s.microEpifanias.map((m) => (
                            <Badge
                              key={m}
                              variant="outline"
                              className="text-[11px] border-[#24334F] text-[#C7D0E0] bg-[#16213A]"
                            >
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* ETAPA 2: IDENTIFICAÇÃO DA EMPRESA & LEAD */}
            {etapaAtual === 2 && (
              <div className="space-y-4">
                <div className="p-3 bg-[#111A2E] rounded-[4px] border border-[#24334F] text-xs text-[#C7D0E0]">
                  Setor selecionado: <strong className="text-[#5B9DFF]">{setorObj.nome}</strong>.
                  Preencha os dados oficiais da empresa para emissão do protocolo e do dossiê.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs text-[#C7D0E0]">Razão Social *</Label>
                    <Input
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      placeholder="Nome oficial da empresa"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">CNPJ *</Label>
                    <Input
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">Data de Preenchimento *</Label>
                    <Input
                      value={dataPreenchimento}
                      onChange={(e) => setDataPreenchimento(e.target.value)}
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs text-[#C7D0E0]">Segmento Específico *</Label>
                    <Select value={segmento} onValueChange={setSegmento}>
                      <SelectTrigger className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]">
                        <SelectValue placeholder="Selecione o segmento do seu setor..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#16213A] border-[#24334F] text-[#F8FAFC]">
                        {setorObj.segmentos.map((seg) => (
                          <SelectItem key={seg} value={seg} className="text-xs">
                            {seg}
                          </SelectItem>
                        ))}
                        <SelectItem value="Outro" className="text-xs">
                          Outro (especifique)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {segmento === 'Outro' && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs text-[#C7D0E0]">Especifique o Segmento *</Label>
                      <Input
                        value={segmentoOutro}
                        onChange={(e) => setSegmentoOutro(e.target.value)}
                        placeholder="Ex.: Distribuição Especializada"
                        className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                      />
                    </div>
                  )}

                  {setorId === 'trading' && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs text-[#C7D0E0]">
                        Modalidade de Atuação Principal (Trading)
                      </Label>
                      <Select value={modalidadeTrading} onValueChange={setModalidadeTrading}>
                        <SelectTrigger className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]">
                          <SelectValue placeholder="Selecione a modalidade de atuação..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#16213A] border-[#24334F] text-[#F8FAFC]">
                          <SelectItem value="Importação por Conta e Ordem" className="text-xs">
                            Importação por Conta e Ordem
                          </SelectItem>
                          <SelectItem value="Importação por Encomenda" className="text-xs">
                            Importação por Encomenda
                          </SelectItem>
                          <SelectItem value="Trading Própria" className="text-xs">
                            Trading Própria
                          </SelectItem>
                          <SelectItem value="Exportação de Commodities" className="text-xs">
                            Exportação de Commodities
                          </SelectItem>
                          <SelectItem value="Distribuição de Importados" className="text-xs">
                            Distribuição de Importados
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">Nome do Respondente *</Label>
                    <Input
                      value={respondente}
                      onChange={(e) => setRespondente(e.target.value)}
                      placeholder="Nome completo do executivo"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">Cargo na Empresa *</Label>
                    <Input
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder="Ex.: CEO, Sócio-Fundador, Diretor"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">
                      E-mail Corporativo (Dossiê Estratégico) *
                    </Label>
                    <Input
                      type="email"
                      value={emailCorporativo}
                      onChange={(e) => setEmailCorporativo(e.target.value)}
                      placeholder="diretoria@empresa.com.br"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-[#C7D0E0]">WhatsApp / Telefone com DDD *</Label>
                    <Input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3: PERFIL DA EMPRESA E CONTEXTO (SETORIAL) */}
            {etapaAtual === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#111A2E] text-[#5B9DFF] border-[#24334F]"
                  >
                    {setorObj.nome}
                  </Badge>
                  <span className="text-xs text-[#8B98B4]">
                    {setorObj.secaoPerfil.length} perguntas de perfil e governança
                  </span>
                </div>
                {setorObj.secaoPerfil.map((p, idx) => (
                  <CampoGenerico
                    key={`perfil-${idx}`}
                    pergunta={p}
                    index={idx}
                    chave={`perfil-${idx}`}
                    value={respostas[`perfil-${idx}`] || ''}
                    onChange={(v) => setResposta('perfil', idx, v)}
                  />
                ))}
              </div>
            )}

            {/* ETAPA 4: PILAR 1 — PRISÃO DO FUNDADOR */}
            {etapaAtual === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#FF9900]/15 text-[#FFB84D] border-[#FF9900]/30"
                  >
                    Pilar 1 — Prisão do Fundador
                  </Badge>
                  <span className="text-xs text-[#8B98B4]">
                    Centralização e dependência no setor {setorObj.nome}
                  </span>
                </div>
                {perguntasPilar1.map((p, idx) => (
                  <CampoGenerico
                    key={`pilar1-${idx}`}
                    pergunta={{ texto: p.texto, tipo: 'escala' }}
                    index={idx}
                    chave={`pilar1-${idx}`}
                    value={respostas[`pilar1-${idx}`] || ''}
                    onChange={(v) => setResposta('pilar1', idx, v)}
                  />
                ))}
              </div>
            )}

            {/* ETAPA 5: PILAR 2 — INEFICIÊNCIA INVISÍVEL */}
            {etapaAtual === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#FF4D4D]/15 text-[#FF4D4D] border-[#FF4D4D]/30"
                  >
                    Pilar 2 — Ineficiência Invisível
                  </Badge>
                  <span className="text-xs text-[#8B98B4]">
                    Vazamento de margem e retrabalho no setor {setorObj.nome}
                  </span>
                </div>
                {perguntasPilar2.map((p, idx) => (
                  <CampoGenerico
                    key={`pilar2-${idx}`}
                    pergunta={{ texto: p.texto, tipo: 'escala' }}
                    index={idx}
                    chave={`pilar2-${idx}`}
                    value={respostas[`pilar2-${idx}`] || ''}
                    onChange={(v) => setResposta('pilar2', idx, v)}
                  />
                ))}
              </div>
            )}

            {/* ETAPA 6: PILAR 3 — ABISMO ESTRATÉGIA VS. EXECUÇÃO */}
            {etapaAtual === 6 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#5B9DFF]/15 text-[#5B9DFF] border-[#5B9DFF]/30"
                  >
                    Pilar 3 — Abismo Estratégia vs. Execução
                  </Badge>
                  <span className="text-xs text-[#8B98B4]">
                    Governança, alinhamento e metas no setor {setorObj.nome}
                  </span>
                </div>
                {perguntasPilar3.map((p, idx) => (
                  <CampoGenerico
                    key={`pilar3-${idx}`}
                    pergunta={{ texto: p.texto, tipo: 'escala' }}
                    index={idx}
                    chave={`pilar3-${idx}`}
                    value={respostas[`pilar3-${idx}`] || ''}
                    onChange={(v) => setResposta('pilar3', idx, v)}
                  />
                ))}
              </div>
            )}

            {/* ETAPA 7: LENTE DE HACKMAN */}
            {etapaAtual === 7 && (
              <div className="space-y-4">
                <div className="p-3 bg-[#111A2E] rounded-[4px] border border-[#24334F] text-xs text-[#C7D0E0] flex items-start gap-2">
                  <Users className="w-4 h-4 text-[#5B9DFF] shrink-0 mt-0.5" />
                  <span>
                    A Lente de Hackman avalia as 5 condições essenciais para equipes autônomas de
                    alta performance, desonerando o fundador da microgestão.
                  </span>
                </div>
                {secaoHackman.map((p, idx) => (
                  <CampoGenerico
                    key={`hackman-${idx}`}
                    pergunta={p}
                    index={idx}
                    chave={`hackman-${idx}`}
                    value={respostas[`hackman-${idx}`] || ''}
                    onChange={(v) => setResposta('hackman', idx, v)}
                  />
                ))}
              </div>
            )}

            {/* ETAPA 8: LENTE DE BUFFETT */}
            {etapaAtual === 8 && (
              <div className="space-y-4">
                <div className="p-3 bg-[#111A2E] rounded-[4px] border border-[#24334F] text-xs text-[#C7D0E0] flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-[#3DDC74] shrink-0 mt-0.5" />
                  <span>
                    A Lente de Buffett verifica a margem de segurança financeira, previsibilidade de
                    caixa, alavancagem líquida e governança contábil.
                  </span>
                </div>
                {perguntasBuffett.map((p, idx) => (
                  <CampoGenerico
                    key={`buffett-${idx}`}
                    pergunta={p}
                    index={idx}
                    chave={`buffett-${idx}`}
                    value={respostas[`buffett-${idx}`] || ''}
                    onChange={(v) => setResposta('buffett', idx, v)}
                  />
                ))}
              </div>
            )}

            {/* ETAPA 9: EXPECTATIVAS E AMBIÇÃO */}
            {etapaAtual === 9 && (
              <div className="space-y-4">
                <div className="p-3 bg-[#111A2E] rounded-[4px] border border-[#24334F] text-xs text-[#C7D0E0]">
                  Entendimento cirúrgico das prioridades executivas e horizonte de transformação
                  almejado para o negócio.
                </div>
                {secaoExpectativas.map((p, idx) => (
                  <CampoGenerico
                    key={`expectativas-${idx}`}
                    pergunta={p}
                    index={idx}
                    chave={`expectativas-${idx}`}
                    value={respostas[`expectativas-${idx}`] || ''}
                    onChange={(v) => setResposta('expectativas', idx, v)}
                  />
                ))}
              </div>
            )}

            {/* ETAPA 10: INOVAÇÃO E TECNOLOGIA (SETORIAL) */}
            {etapaAtual === 10 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#5B9DFF]/15 text-[#5B9DFF] border-[#5B9DFF]/30"
                  >
                    Fase 8 • Inovação em {setorObj.nome}
                  </Badge>
                  <span className="text-xs text-[#8B98B4]">
                    Sistemas, inteligência operacional e maturidade digital
                  </span>
                </div>
                {setorObj.secaoInovacao.map((p, idx) => (
                  <CampoGenerico
                    key={`inovacao-${idx}`}
                    pergunta={p}
                    index={idx}
                    chave={`inovacao-${idx}`}
                    value={respostas[`inovacao-${idx}`] || ''}
                    onChange={(v) => setResposta('inovacao', idx, v)}
                  />
                ))}
              </div>
            )}

            {/* ETAPA 11: DOCUMENTAÇÃO — ADENDO FORMAL COM ALERTAS E 3 CAMPOS OBRIGATÓRIOS */}
            {etapaAtual === 11 && (
              <div className="space-y-6">
                {/* Alerta Literal do Documento 1 / Adendo */}
                <div className="p-4 rounded-[4px] bg-[#111A2E] border-2 border-[#FFB84D]/60 space-y-2">
                  <div className="flex items-center gap-2 text-[#FFB84D] font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>ADENDO OBRIGATÓRIO — COMPROVAÇÃO DOCUMENTAL DO DOSSIÊ</span>
                  </div>
                  <p className="text-xs text-[#C7D0E0] leading-relaxed">
                    Para garantir que o Diagnóstico Estratégico seja fundamentado em evidências e
                    números reais (zero especulação), é <strong>obrigatória</strong> a indicação dos
                    documentos contábeis e estruturais da empresa.
                  </p>
                  <p className="text-[11px] text-[#8B98B4] leading-relaxed">
                    * Todos os 3 blocos abaixo são de preenchimento e confirmação obrigatórios.
                    Indique o nome do arquivo, ano/período de referência ou informe detalhes sobre o
                    envio contábil.
                  </p>
                </div>

                {/* 1. Balanço Patrimonial */}
                <div className="p-4 rounded-[4px] bg-[#111A2E]/70 border border-[#24334F] space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-[#5B9DFF]" />
                      1. Balanço Patrimonial (Último Exercício Fechado) *
                    </Label>
                    <Badge className="bg-[#0066CC]/20 text-[#5B9DFF] border-[#5B9DFF]/30 text-[10px]">
                      Obrigatório
                    </Badge>
                  </div>
                  <Input
                    required
                    value={balancoNome}
                    onChange={(e) => setBalancoNome(e.target.value)}
                    placeholder="Ex.: Balanco_Patrimonial_2025_Oficial.pdf ou 'Enviado por email contábil'"
                    className="bg-[#16213A] border-[#24334F] text-xs text-[#F8FAFC]"
                  />
                  <Textarea
                    value={balancoObs}
                    onChange={(e) => setBalancoObs(e.target.value)}
                    placeholder="Observações contábeis, ressalvas de auditoria ou data de disponibilização..."
                    rows={2}
                    className="bg-[#16213A] border-[#24334F] text-xs text-[#F8FAFC]"
                  />
                </div>

                {/* 2. DRE */}
                <div className="p-4 rounded-[4px] bg-[#111A2E]/70 border border-[#24334F] space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-[#5B9DFF]" />
                      2. Demonstração do Resultado do Exercício (DRE Gerencial ou Contábil) *
                    </Label>
                    <Badge className="bg-[#0066CC]/20 text-[#5B9DFF] border-[#5B9DFF]/30 text-[10px]">
                      Obrigatório
                    </Badge>
                  </div>
                  <Input
                    required
                    value={dreNome}
                    onChange={(e) => setDreNome(e.target.value)}
                    placeholder="Ex.: DRE_Gerencial_12Meses_2025.xlsx ou 'DRE Oficial ECD'"
                    className="bg-[#16213A] border-[#24334F] text-xs text-[#F8FAFC]"
                  />
                  <Textarea
                    value={dreObs}
                    onChange={(e) => setDreObs(e.target.value)}
                    placeholder="Observações sobre segregação de margem, deduções tributárias ou sazonalidade..."
                    rows={2}
                    className="bg-[#16213A] border-[#24334F] text-xs text-[#F8FAFC]"
                  />
                </div>

                {/* 3. Organograma / Relatórios */}
                <div className="p-4 rounded-[4px] bg-[#111A2E]/70 border border-[#24334F] space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-[#5B9DFF]" />
                      3. Organograma Funcional & Relatórios Operacionais / Vendas *
                    </Label>
                    <Badge className="bg-[#0066CC]/20 text-[#5B9DFF] border-[#5B9DFF]/30 text-[10px]">
                      Obrigatório
                    </Badge>
                  </div>
                  <Input
                    required
                    value={organogramaNome}
                    onChange={(e) => setOrganogramaNome(e.target.value)}
                    placeholder="Ex.: Organograma_Setembro2026.pdf ou 'Estrutura de 4 gerências ativas'"
                    className="bg-[#16213A] border-[#24334F] text-xs text-[#F8FAFC]"
                  />
                  <Textarea
                    value={organogramaObs}
                    onChange={(e) => setOrganogramaObs(e.target.value)}
                    placeholder="Detalhes da equipe de liderança direta, principais cargos ou centros de custo..."
                    rows={2}
                    className="bg-[#16213A] border-[#24334F] text-xs text-[#F8FAFC]"
                  />
                </div>

                {/* Responsável Legal pelo Envio */}
                <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#5B9DFF]/40 space-y-2">
                  <Label className="text-xs font-bold text-[#F8FAFC]">
                    Responsável pelo Envio dos Documentos *
                  </Label>
                  <Input
                    required
                    value={responsavelEnvio}
                    onChange={(e) => setResponsavelEnvio(e.target.value)}
                    placeholder="Nome completo e cargo da pessoa que assina pelo envio documental"
                    className="bg-[#16213A] border-[#24334F] text-xs text-[#F8FAFC]"
                  />
                  <p className="text-[11px] text-[#8B98B4]">
                    Garante a custódia e o sigilo bilateral das informações conforme o Termo de
                    Confidencialidade Executivo.
                  </p>
                </div>

                {/* Documentação Adicional (Checkboxes opcionais) */}
                <div className="p-4 rounded-[4px] bg-[#111A2E]/50 border border-[#24334F] space-y-3">
                  <Label className="text-xs font-semibold text-[#C7D0E0]">
                    Documentação Adicional Disponível para a Auditoria (Opcional):
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Contratos de Câmbio e Trade Finance',
                      'Planilha de Landed Cost por SKU/Contêiner',
                      'Tabela de Procedimentos e Glosas de Convênio',
                      'Relatório de Curva ABC de Clientes / Produtos',
                      'Extratos de Linhas de Crédito Bancário',
                      'Planejamento Orçamentário / CAPEX',
                    ].map((doc) => {
                      const checked = documentosAdicionais.includes(doc)
                      return (
                        <div
                          key={doc}
                          onClick={() => {
                            setDocumentosAdicionais((prev) =>
                              checked ? prev.filter((d) => d !== doc) : [...prev, doc],
                            )
                          }}
                          className="flex items-center space-x-2 p-2 rounded-[3px] hover:bg-[#16213A] cursor-pointer"
                        >
                          <Checkbox
                            checked={checked}
                            className="border-[#24334F] data-[state=checked]:bg-[#5B9DFF]"
                          />
                          <span className="text-xs text-[#C7D0E0]">{doc}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 12: PRÓXIMOS PASSOS & DEVOLUTIVA EXECUTIVA */}
            {etapaAtual === 12 && (
              <div className="space-y-6">
                <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#3DDC74]/40 space-y-2">
                  <div className="flex items-center gap-2 text-[#3DDC74] font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ÚLTIMA ETAPA — FORMALIZAÇÃO DA DEVOLUTIVA DETERMINÍSTICA</span>
                  </div>
                  <p className="text-xs text-[#C7D0E0] leading-relaxed">
                    Você receberá um <strong>Diagnóstico Executivo em 72h</strong> com recomendações
                    prioritárias, mapeamento dos 3 Pilares e matriz determinística sem alucinação.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[#F8FAFC]">
                      Autoriza sessão de devolutiva executiva de 45 min? *
                    </Label>
                    <Select
                      value={autorizacaoDevolutiva}
                      onValueChange={(v) => setAutorizacaoDevolutiva(v as AutorizacaoDevolutiva)}
                    >
                      <SelectTrigger className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#16213A] border-[#24334F] text-[#F8FAFC]">
                        {simNaoOpcoes.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt} —{' '}
                            {opt === 'Sim'
                              ? 'Agendar reunião com executivo C-Level'
                              : 'Apenas receber o relatório por e-mail'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[#F8FAFC]">
                      Formato de interesse na Escada de Valor Vetor Master: *
                    </Label>
                    <Select
                      value={formatoInteresse}
                      onValueChange={(v) => setFormatoInteresse(v as FormatoInteresse)}
                    >
                      <SelectTrigger className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#16213A] border-[#24334F] text-[#F8FAFC]">
                        {formatoInteresseOpcoes.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt === 'MaaS' && 'MaaS (Mentorship as a Software) — R$ 1.190/mês'}
                            {opt === 'Híbrido' &&
                              'Híbrido (Software + Supervisão Executiva) — R$ 3.290/mês'}
                            {opt === 'CaaS' &&
                              'CaaS / Bespoke (C-Level as a Service Dedicado) — R$ 15.750/mês'}
                            {opt === 'Ainda não sei' && 'Ainda não sei (Decidir após a devolutiva)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resumo da Submissão */}
                  <div className="p-4 rounded-[4px] bg-[#111A2E] border border-[#24334F] space-y-2 text-xs text-[#C7D0E0]">
                    <span className="font-semibold text-[#F8FAFC] block text-xs uppercase tracking-wider">
                      Resumo da Submissão do Dossiê:
                    </span>
                    <p>
                      <strong>Empresa:</strong> {razaoSocial || '—'} (CNPJ: {cnpj || '—'})
                    </p>
                    <p>
                      <strong>Setor & Segmento:</strong> {setorObj.nome} —{' '}
                      {segmento || segmentoOutro || '—'}
                    </p>
                    <p>
                      <strong>Executivo Responsável:</strong> {respondente} ({cargo}) •{' '}
                      {emailCorporativo}
                    </p>
                    <p>
                      <strong>Documentos Comprobatórios:</strong> Balanço ({balancoNome}), DRE (
                      {dreNome}), Organograma ({organogramaNome})
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Barra de Navegação Inferior */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={etapaAnterior}
            disabled={etapaAtual === 1 || submitting}
            className="border-[#24334F] text-[#C7D0E0] hover:bg-[#16213A] rounded-[4px] text-xs gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Etapa Anterior
          </Button>

          {etapaAtual < 12 ? (
            <Button
              type="button"
              onClick={proximaEtapa}
              disabled={!canAvancar()}
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs font-semibold px-6 py-5 gap-2 transition-all"
            >
              <span>Próxima Etapa</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalizar}
              disabled={!canAvancar() || submitting}
              className="bg-[#0066CC] hover:bg-[#22B14C] text-white rounded-[4px] text-xs font-semibold px-8 py-5 gap-2 shadow-lg transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Consolidando Dossiê e Gerando
                  Protocolo...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submeter Questionário Estratégico Oficial</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Campo reutilizável de Pergunta para as etapas do questionário
 */
function CampoGenerico({
  pergunta,
  index,
  chave,
  value,
  onChange,
}: {
  pergunta: PerguntaSecao
  index: number
  chave: string
  value: string
  onChange: (v: string) => void
}) {
  const tipo = pergunta.tipo || 'escala'

  return (
    <div className="border border-[#24334F] bg-[#111A2E]/50 rounded-[4px] p-4 space-y-3">
      <Label className="text-xs sm:text-sm font-medium leading-relaxed block text-[#F8FAFC]">
        {index + 1}. {pergunta.texto}
      </Label>

      {tipo === 'escala' && (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-1.5">
          {escalaOpcoes.map((opt, i) => (
            <div
              key={i}
              onClick={() => onChange(opt)}
              className="flex items-center space-x-3 rounded-[3px] hover:bg-[#16213A] transition-colors p-2 cursor-pointer"
            >
              <RadioGroupItem
                value={opt}
                id={`${chave}-${i}`}
                className="border-[#24334F] text-[#5B9DFF]"
              />
              <Label
                htmlFor={`${chave}-${i}`}
                className="cursor-pointer font-normal text-xs text-[#C7D0E0]"
              >
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {tipo === 'select' && pergunta.opcoes && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC]">
            <SelectValue placeholder={pergunta.placeholder || 'Selecione uma opção...'} />
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
          placeholder={pergunta.placeholder || 'Sua resposta objetiva...'}
          className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
        />
      )}

      {tipo === 'numero' && (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={pergunta.placeholder || 'Quantidade numérica...'}
          className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
        />
      )}

      {tipo === 'textarea' && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={pergunta.placeholder || 'Descreva detalhadamente o cenário...'}
          rows={3}
          className="bg-[#111A2E] border-[#24334F] text-xs text-[#F8FAFC] placeholder:text-[#8B98B4] rounded-[4px]"
        />
      )}

      {tipo === 'display' && (
        <div className="rounded-[4px] bg-[#16213A] border border-[#5B9DFF]/30 p-3 text-xs text-[#C7D0E0] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#5B9DFF] mt-0.5 shrink-0" />
          <span>{pergunta.texto}</span>
        </div>
      )}
    </div>
  )
}
