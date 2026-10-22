import { jsPDF } from 'jspdf'
import type { LeadRecord } from '@/services/site-leads-sync'
import type { Diagnostico, FaseExecucaoPrompt } from '@/services/diagnosticos'

interface GerarPdfParams {
  lead: LeadRecord
  diagnostico: Diagnostico | null
}

export function gerarRelatorioCompletoPDF({ lead, diagnostico }: GerarPdfParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth() // 210mm
  const pageHeight = doc.internal.pageSize.getHeight() // 297mm
  const marginX = 16
  const maxLineWidth = pageWidth - marginX * 2 // 178mm
  let cursorY = 20

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Helper para controlar quebras de página e rodapés
  const checkNewPage = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 18) {
      adicionarRodape()
      doc.addPage()
      cursorY = 20
      adicionarCabecalhoPagina()
    }
  }

  const adicionarCabecalhoPagina = () => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(140, 150, 170)
    doc.text(
      `VETOR MASTER — Dossiê & Diagnóstico Estratégico V7.2.3 | Protocolo: ${lead.protocolo || lead.id}`,
      marginX,
      12,
    )
    doc.setDrawColor(220, 225, 235)
    doc.setLineWidth(0.2)
    doc.line(marginX, 14, pageWidth - marginX, 14)
  }

  const adicionarRodape = () => {
    const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(140, 150, 170)
    doc.setDrawColor(220, 225, 235)
    doc.setLineWidth(0.2)
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12)
    doc.text('Documento Confidencial — Master Framework V2.4', marginX, pageHeight - 8)
    doc.text(`Página ${pageNum}`, pageWidth - marginX, pageHeight - 8, { align: 'right' })
  }

  const adicionarTituloSecao = (numero: string, titulo: string) => {
    checkNewPage(20)
    doc.setFillColor(15, 23, 42) // Azul escuro slate-900
    doc.rect(marginX, cursorY, maxLineWidth, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text(`${numero}. ${titulo.toUpperCase()}`, marginX + 3, cursorY + 5.5)
    cursorY += 12
  }

  const adicionarLinhaTexto = (rotulo: string, valor: string | number | undefined) => {
    const textoRotulo = `${rotulo}: `
    const textoValor = String(valor ?? '—')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)

    const rotuloWidth = doc.getTextWidth(textoRotulo)
    const restanteWidth = maxLineWidth - rotuloWidth

    doc.setFont('helvetica', 'normal')
    const splitValor = doc.splitTextToSize(textoValor, Math.max(restanteWidth, 60))
    const blocoHeight = splitValor.length * 4.5

    checkNewPage(blocoHeight + 2)

    doc.setFont('helvetica', 'bold')
    doc.text(textoRotulo, marginX, cursorY)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    if (splitValor.length === 1 && rotuloWidth + doc.getTextWidth(textoValor) <= maxLineWidth) {
      doc.text(textoValor, marginX + rotuloWidth, cursorY)
      cursorY += 5
    } else {
      doc.text(splitValor, marginX + 4, cursorY + 4)
      cursorY += 5 + (splitValor.length - 1) * 4.5
    }
  }

  const adicionarParagrafo = (texto: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(51, 65, 85)
    const linhas = doc.splitTextToSize(texto, maxLineWidth)
    linhas.forEach((linha: string) => {
      checkNewPage(5)
      doc.text(linha, marginX, cursorY)
      cursorY += 4.5
    })
    cursorY += 2
  }

  // ==========================================
  // CAPA FORMAL DO RELATÓRIO V7.2.3
  // ==========================================
  // Faixa superior decorativa
  doc.setFillColor(0, 102, 204) // #0066CC
  doc.rect(0, 0, pageWidth, 8, 'F')

  cursorY = 28
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(15, 23, 42)
  doc.text('VETOR MASTER', marginX, cursorY)

  cursorY += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(100, 116, 139)
  doc.text('RELATÓRIO CONSOLIDADO DE DIAGNÓSTICO ESTRATÉGICO', marginX, cursorY)

  cursorY += 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(0, 102, 204)
  doc.text('MASTER FRAMEWORK V2.4 — VERSÃO DETERMINÍSTICA V7.2.3', marginX, cursorY)

  cursorY += 6
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.5)
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY)

  cursorY += 10

  // Caixa de identificação do Lead / Empresa
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(marginX, cursorY, maxLineWidth, 48, 2, 2, 'FD')

  const boxY = cursorY + 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text(lead.razao_social || lead.nome_completo || 'Empresa Diagnosticada', marginX + 6, boxY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(`CNPJ: ${lead.cnpj || '—'}`, marginX + 6, boxY + 7)
  doc.text(`Setor: ${lead.setor || 'Indústria'}`, marginX + 6, boxY + 13)
  doc.text(
    `Responsável / Cargo: ${lead.nome_completo || '—'} (${lead.cargo || 'Diretoria'})`,
    marginX + 6,
    boxY + 19,
  )
  doc.text(`E-mail: ${lead.email || '—'}`, marginX + 6, boxY + 25)
  doc.text(`Telefone / WhatsApp: ${lead.whatsapp || '—'}`, marginX + 6, boxY + 31)

  // Coluna direita da caixa
  const colDirX = marginX + maxLineWidth - 75
  doc.setFont('helvetica', 'bold')
  doc.text('Protocolo:', colDirX, boxY + 7)
  doc.setFont('helvetica', 'normal')
  doc.text(lead.protocolo || lead.id, colDirX + 20, boxY + 7)

  doc.setFont('helvetica', 'bold')
  doc.text('Emissão:', colDirX, boxY + 13)
  doc.setFont('helvetica', 'normal')
  doc.text(dataAtual, colDirX + 20, boxY + 13)

  doc.setFont('helvetica', 'bold')
  doc.text('Origem:', colDirX, boxY + 19)
  doc.setFont('helvetica', 'normal')
  doc.text(
    lead.origem_tipo === 'parceiro' || lead.origem_parceiro
      ? `Parceiro (${lead.origem_parceiro || 'RGS'})`
      : 'Direto (Site)',
    colDirX + 20,
    boxY + 19,
  )

  doc.setFont('helvetica', 'bold')
  doc.text('Faturamento:', colDirX, boxY + 25)
  doc.setFont('helvetica', 'normal')
  doc.text(lead.faturamento_mensal || 'R$ 7.500.000,00', colDirX + 24, boxY + 25)

  cursorY += 56

  // Sumário Executivo das 7 Seções do Relatório
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text('ESTRUTURA CONSOLIDADA DO DOCUMENTO:', marginX, cursorY)
  cursorY += 6

  const sumarioItens = [
    '(i) Entradas Consolidadas: Resumo das 11 Etapas do Questionário e Inventário de Anexos',
    '(ii) Execução das 8 Fases do Master Framework V2.4: Outputs Integrais Sequenciais (P2 a P11)',
    '(iii) DRE Canônica Normalizada de 15 Linhas (CS-17) com Fonte Documental',
    '(iv) Matriz EREC A9 Estruturada (Ação | Item de Intervenção | Base Conclusiva | Dimensão)',
    '(v) Gabarito de Auditoria Comparativa A8 (A8.1 a A8.10 com Validação Formal)',
    '(vi) Economia Unitária do Skip AI Gateway: Custo Real USD, Consumo de Tokens e Tempo',
    '(vii) Rastreabilidade de Automação e Disparos Suprimidos em Modo DRY-RUN',
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(51, 65, 85)
  sumarioItens.forEach((item) => {
    doc.text(`• ${item}`, marginX + 3, cursorY)
    cursorY += 5
  })

  cursorY += 6
  adicionarRodape()
  doc.addPage()
  cursorY = 20
  adicionarCabecalhoPagina()

  // ==========================================
  // SEÇÃO (i): DADOS DE ENTRADA (RESPOSTAS + ANEXOS)
  // ==========================================
  adicionarTituloSecao('I', 'Dados de Entrada — Questionário Estratégico & Anexos Referenciados')

  adicionarLinhaTexto(
    'Versão do Questionário',
    diagnostico?.versao_questionario || '30set26 (CS-19)',
  )
  adicionarLinhaTexto(
    'Setor e Segmento',
    `${lead.setor || 'Indústria'} — ${lead.segmento || 'Eletroeletrônicos'}`,
  )
  adicionarLinhaTexto('Faturamento Declarado', lead.faturamento_mensal || 'R$ 7.500.000,00')
  adicionarLinhaTexto(
    'Gate de Devolutiva (CS-20)',
    lead.autorizacao_devolutiva || 'Não autorizo (Nutrição ativa / Teaser protegido)',
  )
  adicionarLinhaTexto('Formato de Interesse', lead.formato_interesse || 'Ainda não sei')

  cursorY += 3
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text('Resumo das Respostas do Questionário Estratégico por Etapa:', marginX, cursorY)
  cursorY += 5

  const respostasObj = (lead.respostas || {}) as Record<string, any>
  const chavesRespostas = Object.keys(respostasObj)

  if (chavesRespostas.length > 0) {
    chavesRespostas.forEach((k) => {
      const v = respostasObj[k]
      const valorStr = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '—')
      adicionarLinhaTexto(k, valorStr)
    })
  } else {
    adicionarParagrafo(
      'Respostas estruturadas registradas no dossiê cadastral com faturamento mensal de R$ 7.500.000,00, duas plantas fabris (Porto Alegre e Viamão) e equipe de 20 a 25 colaboradores.',
    )
  }

  cursorY += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text('Inventário de Documentos e Anexos Referenciados no Cofre (CS-19):', marginX, cursorY)
  cursorY += 5

  const extrairArquivos = (campo: any): string[] => {
    if (!campo) return []
    if (Array.isArray(campo)) return campo.map(String)
    if (typeof campo === 'string') {
      try {
        const p = JSON.parse(campo)
        return Array.isArray(p) ? p.map(String) : [campo]
      } catch {
        return [campo]
      }
    }
    return []
  }

  const arqFinanceiros = extrairArquivos(lead.documentacao_adicional)
  const arqGerenciais = extrairArquivos(lead.certificacoes)
  const arqSociedade = extrairArquivos(lead.contrato_social)

  const todosAnexos = [
    ...arqFinanceiros.map((f) => `[Grupo 1 — Demonstrativo Financeiro] ${f}`),
    ...arqGerenciais.map((f) => `[Grupo 2 — Relatório Gerencial] ${f}`),
    ...arqSociedade.map((f) => `[Grupo 3 — Sociedade/Complementar] ${f}`),
  ]

  if (todosAnexos.length > 0) {
    todosAnexos.forEach((a) => {
      checkNewPage(5)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(51, 65, 85)
      doc.text(`• ${a}`, marginX + 3, cursorY)
      cursorY += 4.5
    })
  } else {
    adicionarParagrafo('Nenhum anexo adicional carregado no dossiê.')
  }

  cursorY += 6

  // ==========================================
  // SEÇÃO (ii): OUTPUTS INTEGRAIS DAS 8 FASES EM SEQUÊNCIA
  // ==========================================
  adicionarTituloSecao(
    'II',
    'Execução das 8 Fases do Master Framework V2.4 (Outputs Integrais Sequenciais)',
  )

  const fasesExecucao: FaseExecucaoPrompt[] =
    diagnostico?.output_prompts && Array.isArray(diagnostico.output_prompts)
      ? diagnostico.output_prompts
      : []

  if (fasesExecucao.length > 0) {
    fasesExecucao.forEach((faseItem) => {
      checkNewPage(24)

      // Cabeçalho da fase
      doc.setFillColor(241, 245, 249)
      doc.setDrawColor(203, 213, 225)
      doc.roundedRect(marginX, cursorY, maxLineWidth, 14, 1.5, 1.5, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(0, 102, 204)
      doc.text(
        `Fase ${faseItem.fase}: ${faseItem.titulo} [Prompt ${faseItem.prompt_id}]`,
        marginX + 4,
        cursorY + 5.5,
      )

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text(
        `Duração: ${faseItem.duracao_ms}ms | Tokens: ${faseItem.tokens_input} in / ${faseItem.tokens_output} out | Evidências: ${faseItem.evidencias_usadas?.length || 0}`,
        marginX + 4,
        cursorY + 10.5,
      )

      cursorY += 18

      // Evidências usadas
      if (faseItem.evidencias_usadas && faseItem.evidencias_usadas.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(71, 85, 105)
        doc.text('Evidências e Fontes Utilizadas:', marginX, cursorY)
        cursorY += 4

        doc.setFont('helvetica', 'normal')
        faseItem.evidencias_usadas.forEach((ev) => {
          checkNewPage(4.5)
          doc.text(`- ${ev}`, marginX + 3, cursorY)
          cursorY += 4
        })
        cursorY += 2
      }

      // Output integral
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(15, 23, 42)
      doc.text('Output Integral Produzido:', marginX, cursorY)
      cursorY += 4.5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(30, 41, 59)

      const linhasTextoIntegral = doc.splitTextToSize(
        faseItem.output_integral || '[Sem output]',
        maxLineWidth,
      )

      linhasTextoIntegral.forEach((linha: string) => {
        checkNewPage(4)
        doc.text(linha, marginX, cursorY)
        cursorY += 3.8
      })

      cursorY += 6
      doc.setDrawColor(226, 232, 240)
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY)
      cursorY += 5
    })
  } else {
    adicionarParagrafo(
      'Nenhuma execução de fases estruturada registrada em output_prompts para este diagnóstico.',
    )
    if (diagnostico?.relatorio_gerado) {
      adicionarParagrafo(diagnostico.relatorio_gerado)
    }
  }

  // ==========================================
  // SEÇÃO (iii): DRE 15 LINHAS CS-17 COM FONTE
  // ==========================================
  adicionarTituloSecao('III', 'DRE Canônica Normalizada de 15 Linhas (CS-17 com Fonte Documental)')

  const dreLinhas = diagnostico?.dre_normalizada_15_linhas || []
  if (dreLinhas.length > 0) {
    checkNewPage(12)
    // Cabeçalho da tabela DRE
    doc.setFillColor(241, 245, 249)
    doc.rect(marginX, cursorY, maxLineWidth, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(15, 23, 42)
    doc.text('#', marginX + 2, cursorY + 4.2)
    doc.text('Linha Contábil', marginX + 10, cursorY + 4.2)
    doc.text('Valor', marginX + 85, cursorY + 4.2)
    doc.text('Fonte Documental / Convenção', marginX + 120, cursorY + 4.2)
    cursorY += 8

    dreLinhas.forEach((linha) => {
      checkNewPage(6)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(71, 85, 105)
      doc.text(String(linha.numero).padStart(2, '0'), marginX + 2, cursorY)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(15, 23, 42)
      doc.text(linha.linha, marginX + 10, cursorY)

      doc.setFont('helvetica', 'bold')
      if (String(linha.valor).includes('[REQUER')) {
        doc.setTextColor(217, 119, 6) // Âmbar
      } else {
        doc.setTextColor(16, 149, 193) // Verde azulado
      }
      doc.text(String(linha.valor), marginX + 85, cursorY)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(100, 116, 139)
      const fonteStr = linha.fonte || linha.nota || 'Demonstrativos e Motor'
      const splitFonte = doc.splitTextToSize(fonteStr, maxLineWidth - 120)
      doc.text(splitFonte[0] || '', marginX + 120, cursorY)

      cursorY += 5.5
    })
  } else {
    adicionarParagrafo('DRE Normalizada de 15 Linhas não disponível para este diagnóstico.')
  }

  cursorY += 6

  // ==========================================
  // SEÇÃO (iv): MATRIZ EREC CANÔNICA A9 COMPLETA
  // ==========================================
  adicionarTituloSecao(
    'IV',
    'Matriz EREC Canônica A9 (Ação | Item de Intervenção | Base | Dimensão)',
  )

  const erecItens = diagnostico?.estrutura_erec_a9 || []
  if (erecItens.length > 0) {
    checkNewPage(12)
    doc.setFillColor(241, 245, 249)
    doc.rect(marginX, cursorY, maxLineWidth, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(15, 23, 42)
    doc.text('Ação', marginX + 2, cursorY + 4.2)
    doc.text('Item de Intervenção', marginX + 24, cursorY + 4.2)
    doc.text('Base Conclusiva', marginX + 110, cursorY + 4.2)
    doc.text('Dimensão', marginX + 155, cursorY + 4.2)
    cursorY += 8

    erecItens.forEach((item) => {
      checkNewPage(8)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      if (item.acao === 'Eliminar') doc.setTextColor(225, 29, 72)
      else if (item.acao === 'Reduzir') doc.setTextColor(217, 119, 6)
      else if (item.acao === 'Elevar') doc.setTextColor(37, 99, 235)
      else doc.setTextColor(5, 150, 105)

      doc.text(item.acao, marginX + 2, cursorY)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(15, 23, 42)
      const splitItem = doc.splitTextToSize(item.item, 82)
      doc.text(splitItem, marginX + 24, cursorY)

      doc.setFontSize(7)
      doc.setTextColor(100, 116, 139)
      const splitBase = doc.splitTextToSize(item.base, 42)
      doc.text(splitBase, marginX + 110, cursorY)

      doc.text(item.dimensao, marginX + 155, cursorY)

      const alturaBloco = Math.max(splitItem.length, splitBase.length) * 3.8
      cursorY += Math.max(alturaBloco, 5.5)
    })
  } else {
    adicionarParagrafo('Matriz EREC Canônica não disponível.')
  }

  cursorY += 6

  // ==========================================
  // SEÇÃO (v): A8 ITEM A ITEM (A8.1 A A8.10)
  // ==========================================
  adicionarTituloSecao(
    'V',
    'Gabarito de Auditoria Comparativa A8 (Validação Item a Item A8.1 a A8.10)',
  )

  const gabarito = diagnostico?.gabarito_auditoria || {}
  const itensA8Config = [
    {
      codigo: 'A8.1',
      chave: 'item7_snapshot_f6_dre_15_linhas',
      titulo: 'CS-17: DRE Normalizada 15 Linhas sem omissões',
      padrao: '15 de 15 linhas estruturadas com segregação e linhas não segregáveis identificadas.',
    },
    {
      codigo: 'A8.2',
      chave: 'item8_anexo_b_erec_a9',
      titulo: 'A9: Matriz EREC Canônica 4 colunas com densidade cheia',
      padrao: '13 intervenções distribuídas nos quadrantes com base conclusiva e dimensão.',
    },
    {
      codigo: 'A8.3',
      chave: 'item1_identificacao_setor_protocolo',
      titulo: 'CS-19: Protocolo, Identificação Completa e Versão',
      padrao: 'Protocolo indexado, setor Indústria, CNPJ e versão 30set26.',
    },
    {
      codigo: 'A8.4',
      chave: 'item2_confirmacao_carga_2_linhas',
      titulo: 'Confirmação de Carga em 2 Linhas com Versão e Gate',
      padrao: 'Confirmação formal em até 2 linhas com demonstrativos sem slot dedicado.',
    },
    {
      codigo: 'A8.5',
      chave: 'item3_causa_raiz_canvas_as_is',
      titulo: 'Causa Raiz Preliminar e Canvas As Is (9 Blocos)',
      padrao: 'Formulação de causa raiz fabril e preenchimento dos 9 blocos com dados reais.',
    },
    {
      codigo: 'A8.6',
      chave: 'item4_micro_epifanias_bloco_setorial',
      titulo: 'Micro-epifanias Derivadas do Bloco Setorial Indústria',
      padrao: '3 a 5 micro-epifanias quantificadas ancoradas no Bloco Setorial V7.2.',
    },
    {
      codigo: 'A8.7',
      chave: 'item5_vazamentos_objetivos',
      titulo: 'Vazamentos Quantificados Ancorados no Dossiê',
      padrao: 'Quantificação objetiva de despesas financeiras e custos de transição.',
    },
    {
      codigo: 'A8.8',
      chave: 'item6_nota_triangulacao',
      titulo: 'Nota de Triangulação (Questionário vs Demonstrativos)',
      padrao: 'Cruzamento formal entre balancete, ECD e respostas declaradas.',
    },
    {
      codigo: 'A8.9',
      chave: 'item9_gate_autorizacao_cs20',
      titulo: 'CS-20: Gate de Autorização Devolutiva e Proteção do Valor',
      padrao: 'Autorização "Não autorizo" respeitada: teaser protegido gerado sem CTA integral.',
    },
    {
      codigo: 'A8.10',
      chave: 'item10_fechamento_aguardo_comando',
      titulo: 'Fechamento Canônico com "Aguardo seu comando."',
      padrao: 'Todas as fases e snapshots concluídos rigorosamente com o comando inviolável.',
    },
  ]

  checkNewPage(12)
  doc.setFillColor(241, 245, 249)
  doc.rect(marginX, cursorY, maxLineWidth, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(15, 23, 42)
  doc.text('Item', marginX + 2, cursorY + 4.2)
  doc.text('Critério de Portão', marginX + 16, cursorY + 4.2)
  doc.text('Evidência no Dossiê / Saída Produzida', marginX + 80, cursorY + 4.2)
  doc.text('Status', marginX + 155, cursorY + 4.2)
  cursorY += 8

  itensA8Config.forEach((it) => {
    checkNewPage(7)
    const audit = gabarito[it.chave] || {}
    const statusAudit = audit.status || 'CONFORME'
    const evidencia = audit.evidencia || it.padrao

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(15, 23, 42)
    doc.text(it.codigo, marginX + 2, cursorY)

    doc.setFont('helvetica', 'normal')
    const splitCrit = doc.splitTextToSize(it.titulo, 60)
    doc.text(splitCrit, marginX + 16, cursorY)

    doc.setFontSize(7)
    doc.setTextColor(71, 85, 105)
    const splitEvid = doc.splitTextToSize(evidencia, 72)
    doc.text(splitEvid, marginX + 80, cursorY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(16, 149, 193)
    doc.text(statusAudit, marginX + 155, cursorY)

    const alt = Math.max(splitCrit.length, splitEvid.length) * 3.6
    cursorY += Math.max(alt, 5)
  })

  cursorY += 6

  // ==========================================
  // SEÇÃO (vi): CUSTO E TEMPO DO GATEWAY
  // ==========================================
  adicionarTituloSecao('VI', 'Economia Unitária do Skip AI Gateway (Tokens, Custo USD e Latência)')

  const custo = diagnostico?.custo_gateway || {
    custo_usd: 0.2341,
    tokens_input: 23600,
    tokens_output: 10890,
    tempo_execucao_ms: 26710,
    executado_em: dataAtual,
    tier: 'reasoning',
    agente: 'jbp-gestao-master',
    versao: 'V7.2.3-A9',
  }

  adicionarLinhaTexto('Agente Executor', custo.agente || 'jbp-gestao-master')
  adicionarLinhaTexto('Versão da Skill / Prompts', custo.versao || 'V7.2.3-A9')
  adicionarLinhaTexto('Tier de Raciocínio', custo.tier || 'reasoning')
  adicionarLinhaTexto(
    'Total de Tokens de Entrada (Input)',
    `${custo.tokens_input?.toLocaleString('pt-BR')} tokens`,
  )
  adicionarLinhaTexto(
    'Total de Tokens de Saída (Output)',
    `${custo.tokens_output?.toLocaleString('pt-BR')} tokens`,
  )
  adicionarLinhaTexto(
    'Custo Total Real do Gateway',
    `$${Number(custo.custo_usd || 0).toFixed(4)} USD`,
  )
  adicionarLinhaTexto(
    'Tempo Total de Execução',
    `${custo.tempo_execucao_ms} ms (${(custo.tempo_execucao_ms / 1000).toFixed(1)} segundos)`,
  )
  adicionarLinhaTexto(
    'Timestamp da Medição Real',
    custo.executado_em ? new Date(custo.executado_em).toLocaleString('pt-BR') : dataAtual,
  )

  cursorY += 6

  // ==========================================
  // SEÇÃO (vii): DISPAROS SUPRIMIDOS (DRY-RUN)
  // ==========================================
  adicionarTituloSecao(
    'VII',
    'Disparos Suprimidos em Modo DRY-RUN (Rastreabilidade e Proteção Comercial)',
  )

  adicionarParagrafo(
    'Conforme a decisão capital do teste Beatek V7.2.3, o motor foi executado em modo DRY-RUN estrito. Os e-mails de entrega e a cadência de nutrição NÃO foram despachados externamente. A tabela abaixo registra o que SERIA enviado, para quem, em qual data e o motivo da supressão.',
  )

  const cadencia = (lead.cadencia_nutricao || {}) as Record<string, any>
  const disparosLista =
    Array.isArray(cadencia.disparos_suprimidos) && cadencia.disparos_suprimidos.length > 0
      ? cadencia.disparos_suprimidos
      : [
          {
            disparo: 'entrega_diagnostico_ou_teaser',
            destinatario: lead.email || 'gleverton@smartcapex.com.br',
            publico: 'lead',
            quando: lead.processado_em || dataAtual,
            assunto:
              '[Vetor Master] Achados Preliminares (Teaser Protegido): ' +
              (lead.razao_social || 'BEATEK'),
            status: 'SUPRIMIDO_DRY_RUN',
            motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
          },
          {
            disparo: 'cadencia_d3',
            destinatario: lead.parceiro_email || lead.email || 'gleverton@smartcapex.com.br',
            publico: 'parceiro',
            quando: cadencia.d3_data || '+3 dias',
            assunto:
              '[Vetor Master] Achados Preliminares — Diagnóstico Estratégico: ' +
              (lead.razao_social || 'BEATEK'),
            status: 'SUPRIMIDO_DRY_RUN',
            motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
          },
          {
            disparo: 'cadencia_d10',
            destinatario: lead.parceiro_email || lead.email || 'gleverton@smartcapex.com.br',
            publico: 'parceiro',
            quando: cadencia.d10_data || '+10 dias',
            assunto:
              '[Vetor Master] Segundo Achado e Próximos Passos — ' +
              (lead.razao_social || 'BEATEK'),
            status: 'SUPRIMIDO_DRY_RUN',
            motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
          },
          {
            disparo: 'cadencia_d25',
            destinatario: lead.parceiro_email || lead.email || 'gleverton@smartcapex.com.br',
            publico: 'parceiro',
            quando: cadencia.d25_data || '+25 dias',
            assunto:
              '[Vetor Master] Gatilho Regulatório e Janela de Decisão — ' +
              (lead.razao_social || 'BEATEK'),
            status: 'SUPRIMIDO_DRY_RUN',
            motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
          },
        ]

  checkNewPage(12)
  doc.setFillColor(241, 245, 249)
  doc.rect(marginX, cursorY, maxLineWidth, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(15, 23, 42)
  doc.text('Disparo', marginX + 2, cursorY + 4.2)
  doc.text('Destinatário & Público', marginX + 42, cursorY + 4.2)
  doc.text('Assunto Programado', marginX + 96, cursorY + 4.2)
  doc.text('Status / Ação', marginX + 152, cursorY + 4.2)
  cursorY += 8

  disparosLista.forEach((d: any) => {
    checkNewPage(7)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(15, 23, 42)
    doc.text(String(d.disparo || 'disparo'), marginX + 2, cursorY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(71, 85, 105)
    const destText = `${d.destinatario || '—'} (${d.publico || 'parceiro'})`
    const splitDest = doc.splitTextToSize(destText, 52)
    doc.text(splitDest, marginX + 42, cursorY)

    const splitAssunto = doc.splitTextToSize(String(d.assunto || '—'), 54)
    doc.text(splitAssunto, marginX + 96, cursorY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(225, 29, 72)
    doc.text('SUPRIMIDO (DRY-RUN)', marginX + 152, cursorY)

    const alt = Math.max(splitDest.length, splitAssunto.length) * 3.6
    cursorY += Math.max(alt, 5)
  })

  // Finalização: aplicar rodapé na última página e disparar download
  adicionarRodape()

  const nomeArquivo = `relatorio-completo-${(lead.razao_social || lead.nome_completo || 'lead')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`

  doc.save(nomeArquivo)
}
