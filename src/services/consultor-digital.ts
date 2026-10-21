/**
 * Serviço de Integração do Consultor Digital V7.2.3 — Onda 2
 * Consome o agente nativo 'jbp-gestao-master' via endpoint backend com auth de sessão.
 */

import pb from '@/lib/pocketbase/client'

export interface ConsultorChatMessage {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created?: string
  citations?: Array<{ file_id?: string; title?: string; snippet?: string }>
}

export interface SendMessageParams {
  message: string
  conversationId?: string | null
  promptAtivo?: string | null
}

export interface SendMessageResult {
  success: boolean
  conversation_id?: string
  message_id?: string
  content?: string
  citations?: Array<{ file_id?: string; title?: string; snippet?: string }>
  error?: string
}

export const PROMPTS_CANONICOS_13 = [
  {
    id: 'P01',
    numero: 1,
    portao: 'Gate 1 (Abertura)',
    titulo: 'Recepção e Validação do Setor e Faturamento',
    descricao:
      'Confirmação dos dados de entrada declarados e enquadramento nos 12 setores canônicos.',
    sugestao:
      'Olá, Consultor. Gostaria de iniciar a análise da minha empresa com base no meu questionário V7.2.',
  },
  {
    id: 'P02',
    numero: 2,
    portao: 'Etapa 01 (Diagnóstico)',
    titulo: 'Leitura dos 3 Maiores Gargalos Invisíveis',
    descricao: 'Mapeamento de rupturas, vazamentos operacionais e alçadas sem governança.',
    sugestao: 'Quais são os 3 maiores vazamentos invisíveis identificados na minha operação?',
  },
  {
    id: 'P03',
    numero: 3,
    portao: 'Etapa 02 (Dossiê)',
    titulo: 'Auditoria da DRE e Segregação Contábil (CS-17)',
    descricao:
      'Análise das 15 linhas canônicas e identificação de campos pendentes [REQUER VERIFICAÇÃO].',
    sugestao:
      'Analise a DRE de 15 linhas e os pontos críticos de segregação contábil da minha empresa.',
  },
  {
    id: 'P04',
    numero: 4,
    portao: 'Etapa 03 (Margem Buffett)',
    titulo: 'Thresholds de Margem de Segurança e Blindagem',
    descricao: 'Avaliação da Margem Bruta (>40%), Lucro Líquido (>20%) e Ponto de Equilíbrio.',
    sugestao:
      'Como estão os meus indicadores de margem em relação aos critérios de Warren Buffett?',
  },
  {
    id: 'P05',
    numero: 5,
    portao: 'Etapa 04 (Estrutura EREC)',
    titulo: 'Eliminar, Reduzir, Elevar e Criar (A9)',
    descricao: 'Matriz estratégica EREC focada na desoneração do fundador e diferenciação.',
    sugestao: 'Apresente a matriz EREC recomendada para o meu modelo de negócio.',
  },
  {
    id: 'P06',
    numero: 6,
    portao: 'Etapa 05 (Roadmap)',
    titulo: 'Priorização 5W2H e Ações Rápidas (Quick Wins)',
    descricao: 'Trilha cronológica das primeiras ações com prazos e responsáveis definidos.',
    sugestao: 'Quais ações de curto prazo (primeiros 30 dias) devo priorizar no formato 5W2H?',
  },
  {
    id: 'P07',
    numero: 7,
    portao: 'Etapa 06 (WACC & Finanças)',
    titulo: 'Custo de Capital e Alavancagem Saudável',
    descricao: 'Avaliação de dívida onerosa vs capital próprio e memória de cálculo do WACC.',
    sugestao: 'Qual é o diagnóstico sobre a estrutura de capital e taxa de desconto aplicável?',
  },
  {
    id: 'P08',
    numero: 8,
    portao: 'Etapa 07 (Governança & Rituais)',
    titulo: 'Rituais de Gestão e Descentralização do Fundador',
    descricao: 'Reuniões semanais, alçadas formais e liberação da agenda da liderança.',
    sugestao:
      'Como estruturar os rituais semanais para não depender das minhas decisões operacionais?',
  },
  {
    id: 'P09',
    numero: 9,
    portao: 'Etapa 08 (Hoshin Kanri)',
    titulo: 'Desdobramento de Metas e OKRs Vivos',
    descricao: 'Conexão entre o plano estratégico e os Resultados-Chave acompanhados no painel.',
    sugestao: 'Como desdobrar meus objetivos estratégicos em OKRs vivos para a equipe?',
  },
  {
    id: 'P10',
    numero: 10,
    portao: 'Gate P3→P4 (SaaS Puro)',
    titulo: 'Transição da Devolutiva para o Plano de Ação',
    descricao: 'Validação da assinatura SaaS Puro ou MaaS Híbrido para execução contínua.',
    sugestao: 'Quero validar o próximo passo do meu plano de ação contratado.',
  },
  {
    id: 'P11',
    numero: 11,
    portao: 'MaaS Híbrido',
    titulo: 'Preparação para Sessão Estratégica com Especialista',
    descricao: 'Geração de pauta prévia com dúvidas e gargalos mapeados para o consultor humano.',
    sugestao: 'Gere a pauta estruturada para a minha próxima sessão com o consultor humano.',
  },
  {
    id: 'P12',
    numero: 12,
    portao: 'Revisão Trimestral',
    titulo: 'Auditoria de Metas e Repactuação do Roadmap',
    descricao: 'Fechamento do trimestre e atualização do diagnóstico com novos números contábeis.',
    sugestao: 'Vamos revisar o atingimento dos OKRs deste trimestre e planejar o próximo ciclo.',
  },
  {
    id: 'P13',
    numero: 13,
    portao: 'Encerramento de Ciclo',
    titulo: 'Validação de Valor Gerado e Escala de Valor',
    descricao: 'Medição do ROI obtido com a implementação do plano de ação Vetor Master.',
    sugestao: 'Consolide o valor gerado e a evolução da maturidade da empresa neste ciclo.',
  },
]

export async function enviarMensagemConsultor(
  params: SendMessageParams,
): Promise<SendMessageResult> {
  const token = pb.authStore.token
  if (!token) {
    return {
      success: false,
      error: 'Sessão expirada ou não autenticada. Faça login para continuar.',
    }
  }

  const baseUrl = import.meta.env.VITE_POCKETBASE_URL || ''
  const response = await fetch(`${baseUrl}/backend/v1/consultor/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: params.message,
      conversation_id: params.conversationId || undefined,
      prompt_ativo: params.promptAtivo || undefined,
    }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    return {
      success: false,
      error: errData.error || `Erro HTTP ${response.status} ao consultar o Consultor Digital.`,
    }
  }

  const data = await response.json()
  return data
}
