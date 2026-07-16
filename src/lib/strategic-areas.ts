import { Target, DollarSign, Settings, Users, TrendingUp, Cpu, Shield } from 'lucide-react'

export const strategicAreas = [
  {
    numero: 1,
    titulo: 'Estratégia & Visão',
    icon: Target,
    dor: 'Sua estratégia sobrevive a 3 cenários adversos?',
    epifania: 'A maioria dos fundadores confunde otimismo com estratégia.',
    cor: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    numero: 2,
    titulo: 'Finanças & Resultados',
    icon: DollarSign,
    dor: 'Sua empresa sobrevive 90 dias sem receita?',
    epifania: 'Previsibilidade financeira é o que separa negócios de hobbies.',
    cor: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    numero: 3,
    titulo: 'Operações & Processos',
    icon: Settings,
    dor: 'O que acontece com 20% mais demanda amanhã?',
    epifania: 'Processos não documentados são dependência disfarçada.',
    cor: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    numero: 4,
    titulo: 'Pessoas & Liderança',
    icon: Users,
    dor: 'E se 2 líderes-chave saírem amanhã?',
    epifania: 'Sua empresa não pode depender de pessoas insubstituíveis.',
    cor: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    numero: 5,
    titulo: 'Vendas & Crescimento',
    icon: TrendingUp,
    dor: 'Sua máquina de vendas é previsível e independente?',
    epifania: 'Crescimento sem previsibilidade é uma prisão dourada.',
    cor: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    numero: 6,
    titulo: 'Tecnologia & Inovação',
    icon: Cpu,
    dor: 'Quanto você perde com 48h de indisponibilidade?',
    epifania: 'Tecnologia é alavanca estratégica, não centro de custo.',
    cor: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    numero: 7,
    titulo: 'Governança & Compliance',
    icon: Shield,
    dor: 'Sua empresa sobreviveria a uma auditoria regulatória?',
    epifania: 'Governança protege o patrimônio que você construiu.',
    cor: 'text-red-600',
    bg: 'bg-red-50',
  },
]

export const faturamentoOptions = [
  'Até R$ 50 mil/mês',
  'R$ 50k - R$ 200k/mês',
  'R$ 200k - R$ 500k/mês',
  'R$ 500k - R$ 1 milhão/mês',
  'Acima de R$ 1 milhão/mês',
]

export const funcionariosOptions = [
  '1 a 5 colaboradores',
  '6 a 20 colaboradores',
  '21 a 50 colaboradores',
  '51 a 100 colaboradores',
  'Acima de 100 colaboradores',
]

export const prazoOptions = ['3 meses', '6 meses', '12 meses', '24 meses']
