export interface DossiContratoEntrada {
  versao_contrato: string
  metadados: {
    lead_id: string
    protocolo: string
    gerado_em: string
    versao_questionario: string
    autorizacao_devolutiva: string
    origem_tipo: 'direto' | 'parceiro'
    origem_parceiro?: string
    nivel_contratado?: 'SaaS Assistido' | 'MaaS Híbrido' | 'Bespoke CaaS'
    operador?: {
      nome?: string
      email?: string
    }
  }
  dossie: {
    cliente: {
      razao_social: string
      cnpj?: string
      setor: string
      segmento?: string
      faturamento_declarado?: string
      cargo?: string
      email?: string
      whatsapp?: string
      formato_interesse?: string
    }
    respostas_questionario: Record<string, any>
    inventario_documentos?: Array<{
      nome: string
      grupo: string
      tamanho_bytes?: number
      md5?: string
    }>
    conteudo_anexos_texto?: Array<{
      nome: string
      tipo: string
      markdown_extraido: string
    }>
  }
}

export interface LinhaDRE15 {
  numero: number
  linha: string
  valor: string
  fonte: string
  status: 'CONFORME' | 'REQUER_VERIFICACAO' | 'REQUER_VERIFICACAO_A10'
}

export interface IntervencaoEREC {
  acao: 'Eliminar' | 'Reduzir' | 'Elevar' | 'Criar'
  item: string
  base: string
  dimensao: string
}

export interface ItemAuditoriaA8 {
  status: 'CONFORME' | 'NAO_ATENDE' | 'CONDICIONADO'
  criterio: string
  evidencia: string
}

export interface ExpertOutputContratoSaida {
  versao_contrato: string
  identificador_execucao: string
  executado_em: string
  motor: {
    versao_motor: string
    ambiente: string
    validador_externo: string
  }
  confirmacao_carga_cs19: {
    versao_questionario: string
    gate_cs20_autorizado: boolean
    texto_confirmacao: string
  }
  fases_p1_p13: Array<{
    fase: number
    prompt_id: string
    titulo: string
    slot_aplicado?: string
    output_integral: string
    evidencias_usadas?: string[]
    duracao_ms?: number
    tokens_input?: number
    tokens_output?: number
  }>
  dre_normalizada_15_linhas: LinhaDRE15[]
  estrutura_erec_a9: IntervencaoEREC[]
  gabarito_auditoria_a8: Record<string, any>
  bloco_solucao_completo?: {
    anexo_a_dre?: any
    anexo_b_erec?: any
    anexo_c_valuation?: any
    anexo_d_governanca?: any
    anexo_e_capacidade?: any
    anexo_f_roadmap?: any
    anexo_g_inovacao?: any
    lente_buffett_metricas?: Array<{
      indicador: string
      valor: string
      status: string
      fonte: string
    }>
    roadmap_etapas?: Array<{
      etapa: number
      nome: string
      janela: string
      dono: string
    }>
    okrs_estrategicos?: Array<{
      etapa: number
      objetivo: string
      kr1: string
      kr2: string
    }>
  }
  custo_gateway?: {
    tokens_input: number
    tokens_output: number
    custo_usd: number
    tempo_execucao_ms: number
    medicao_real_gateway: boolean
    tier: string
    agente: string
    versao?: string
    executado_via?: string
    executado_em?: string
  }
  timestamps: {
    iniciado_em: string
    concluido_em: string
    duracao_total_ms: number
  }
}

export type CodigoErroTipado =
  | 'MOTOR_BLOQUEADO_AUSENCIA_DADOS_A4'
  | 'SCHEMA_OUTPUT_INVALIDO_A2'
  | 'AUTOCERTIFICACAO_DETECTADA_A5'
  | 'VERSAO_QUESTIONARIO_INCOMPATIVEL_CS19'
  | 'GATE_CS20_VIOLADO'
  | 'TIMEOUT_EXECUCAO_EXPERT'
  | 'CONVERSAO_CONTABIL_NAO_DECLARADA_A3'

export interface ValidacaoOutputResult {
  valido: boolean
  erros: string[]
  codigo_erro?: CodigoErroTipado
}

/**
 * Validador estrito de schema do output do Expert V7.2 (Fase A2.2 e A5.3)
 */
export function validarOutputExpert(output: any): ValidacaoOutputResult {
  const erros: string[] = []

  if (!output || typeof output !== 'object') {
    return {
      valido: false,
      codigo_erro: 'SCHEMA_OUTPUT_INVALIDO_A2',
      erros: ['Output recebido não é um objeto JSON válido.'],
    }
  }

  // 1. Verificar chaves estruturais
  if (!output.fases_p1_p13 && !output.output_fases) {
    erros.push('Array de fases executadas (fases_p1_p13 ou output_fases) é obrigatório.')
  }

  const fases = output.fases_p1_p13 || output.output_fases || []
  if (!Array.isArray(fases) || fases.length === 0) {
    erros.push('Output deve conter no mínimo 1 fase processada.')
  }

  // 2. Verificar DRE 15 linhas (CS-17)
  const dre = output.dre_normalizada_15_linhas
  if (!dre || !Array.isArray(dre) || dre.length < 15) {
    erros.push(
      `DRE Normalizada deve conter rigorosamente 15 linhas (recebidas: ${dre?.length || 0}).`,
    )
  }

  // 3. Verificar EREC A9
  const erec = output.estrutura_erec_a9
  if (!erec || !Array.isArray(erec) || erec.length < 4) {
    erros.push('Matriz EREC Canônica A9 deve conter intervenções estruturadas.')
  }

  // 4. Verificar Gabarito A8 e Vedação de Autocertificação (A5.3)
  const gab = output.gabarito_auditoria_a8 || output.gabarito_auditoria
  if (!gab || typeof gab !== 'object') {
    erros.push('Gabarito de auditoria A8 ausente no output.')
  } else {
    const validador = String(gab.validador || '').toLowerCase()
    if (validador.includes('servico_diagnostico_trilha_a_a8')) {
      return {
        valido: false,
        codigo_erro: 'AUTOCERTIFICACAO_DETECTADA_A5',
        erros: [
          'Autocertificação vedada: o validador "servico_diagnostico_trilha_a_a8" foi reprovado pela banca.',
          'A auditoria deve apontar para o validador humano ou externo do Expert.',
        ],
      }
    }
  }

  if (erros.length > 0) {
    return {
      valido: false,
      codigo_erro: 'SCHEMA_OUTPUT_INVALIDO_A2',
      erros,
    }
  }

  return { valido: true, erros: [] }
}
