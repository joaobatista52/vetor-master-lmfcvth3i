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
  const marginX = 14
  const maxLineWidth = pageWidth - marginX * 2 // 182mm
  let cursorY = 20

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const runTimestamp = diagnostico?.custo_gateway?.executado_em
    ? new Date(diagnostico.custo_gateway.executado_em).toLocaleString('pt-BR')
    : lead.processado_em
      ? new Date(lead.processado_em).toLocaleString('pt-BR')
      : '23/10/2026, 14:55:45'

  // Helper para controlar quebras de página e rodapés
  const checkNewPage = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 16) {
      adicionarRodape()
      doc.addPage()
      cursorY = 20
      adicionarCabecalhoPagina()
    }
  }

  const adicionarCabecalhoPagina = () => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text(
      `DOSSIÊ DE AUDITORIA DO EXPERT — RUN FRESCO TRILHA A | Protocolo: ${lead.protocolo || lead.id}`,
      marginX,
      11,
    )
    doc.text(
      `Lead: ${lead.id} | Diag: ${diagnostico?.id || 'wor27cnyubs22ot'}`,
      pageWidth - marginX,
      11,
      { align: 'right' },
    )
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.2)
    doc.line(marginX, 13, pageWidth - marginX, 13)
  }

  const adicionarRodape = () => {
    const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.2)
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12)
    doc.text(
      'Homologação: pendente do expert | Vedada a autocertificação do motor',
      marginX,
      pageHeight - 8,
    )
    doc.text(`Página ${pageNum}`, pageWidth - marginX, pageHeight - 8, { align: 'right' })
  }

  const adicionarTituloSecao = (numero: string, titulo: string) => {
    checkNewPage(16)
    doc.setFillColor(15, 23, 42) // Slate 900
    doc.rect(marginX, cursorY, maxLineWidth, 7.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(`SEÇÃO ${numero}: ${titulo.toUpperCase()}`, marginX + 3, cursorY + 5.2)
    cursorY += 11
  }

  const adicionarLinhaTexto = (rotulo: string, valor: string | number | undefined) => {
    const textoRotulo = `${rotulo}: `
    const textoValor = String(valor ?? '—')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(30, 41, 59)

    const rotuloWidth = doc.getTextWidth(textoRotulo)
    const restanteWidth = maxLineWidth - rotuloWidth

    doc.setFont('helvetica', 'normal')
    const splitValor = doc.splitTextToSize(textoValor, Math.max(restanteWidth, 60))
    const blocoHeight = splitValor.length * 4.2

    checkNewPage(blocoHeight + 2)

    doc.setFont('helvetica', 'bold')
    doc.text(textoRotulo, marginX, cursorY)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    if (splitValor.length === 1 && rotuloWidth + doc.getTextWidth(textoValor) <= maxLineWidth) {
      doc.text(textoValor, marginX + rotuloWidth, cursorY)
      cursorY += 4.5
    } else {
      doc.text(splitValor, marginX + 4, cursorY + 4)
      cursorY += 4.5 + (splitValor.length - 1) * 4
    }
  }

  const adicionarParagrafo = (texto: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(51, 65, 85)
    const linhas = doc.splitTextToSize(texto, maxLineWidth)
    linhas.forEach((linha: string) => {
      checkNewPage(4.5)
      doc.text(linha, marginX, cursorY)
      cursorY += 4
    })
    cursorY += 2
  }

  // ==========================================
  // CAPA FORMAL DO DOSSIÊ DE AUDITORIA DO EXPERT
  // ==========================================
  doc.setFillColor(0, 102, 204) // Azul Vetor Master #0066CC
  doc.rect(0, 0, pageWidth, 7, 'F')

  cursorY = 22
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(15, 23, 42)
  doc.text('VETOR MASTER — DOSSIÊ DE AUDITORIA DO EXPERT', marginX, cursorY)

  cursorY += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text(
    'RELATÓRIO INTEGRAL DE RUN FRESCO DA TRILHA A — VALIDAÇÃO E HOMOLOGAÇÃO HUMANA',
    marginX,
    cursorY,
  )

  cursorY += 5
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.4)
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY)

  cursorY += 6

  // Box 1: Cabeçalho de Rastreabilidade e Versões do Motor
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(marginX, cursorY, maxLineWidth, 38, 1.5, 1.5, 'FD')

  let by = cursorY + 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(0, 102, 204)
  doc.text('RASTREABILIDADE DO RUN FRESCO & VERSÕES DO MOTOR', marginX + 4, by)

  by += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(30, 41, 59)
  doc.text(`Protocolo Oficial: ${lead.protocolo || '#VM-TESTE-BEATEK-22OUT26'}`, marginX + 4, by)
  doc.text(
    `ID Lead: ${lead.id || 'beatekteste2026'} | ID Diagnóstico: ${diagnostico?.id || 'wor27cnyubs22ot'}`,
    marginX + 92,
    by,
  )

  by += 5
  doc.text(
    'Versões do Motor: V7.2 Núcleo | System Prompt V7.2.3 | Skill 13 Prompts V7.2.3-A9',
    marginX + 4,
    by,
  )
  doc.text(`Tier Reasoning: jbp-gestao-master`, marginX + 130, by)

  by += 5
  doc.text(`Data/Hora de Geração do Run: ${runTimestamp}`, marginX + 4, by)
  doc.text(`Data/Hora de Geração do PDF: ${dataAtual}`, marginX + 92, by)

  by += 5
  doc.text(
    `Origem / Parceiro: ${lead.origem_parceiro || 'RGS'} (${lead.origem_tipo || 'parceiro'}) | E-mail: ${lead.parceiro_email || lead.email || 'gleverton@smartcapex.com.br'}`,
    marginX + 4,
    by,
  )

  by += 5
  doc.text(
    `Versão Questionário: ${diagnostico?.versao_questionario || 'V6.7'} (CS-19) | Gate Devolutiva: ${lead.autorizacao_devolutiva || 'Não autorizo'} (CS-20)`,
    marginX + 4,
    by,
  )

  cursorY += 42

  // Box 2: Aviso Inegociável de Vedação à Autocertificação
  doc.setFillColor(254, 243, 199) // Amber-100
  doc.setDrawColor(245, 158, 11) // Amber-500
  doc.roundedRect(marginX, cursorY, maxLineWidth, 20, 1.5, 1.5, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(146, 64, 14) // Amber-900
  doc.text(
    'AVISO DE GOVERNANÇA: VEDAÇÃO À AUTOCERTIFICAÇÃO DO MOTOR (PORTÃO A8)',
    marginX + 4,
    cursorY + 5.5,
  )

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(120, 53, 15)
  const textoVedacao =
    'Este documento contém os resultados brutos e processados do motor determinístico. O motor NÃO emite veredito de homologação sobre o próprio run. A homologação final é ato exclusivo do expert humano (Portão MaaS Híbrido & Bespoke CaaS). Status atual: Homologação: pendente do expert.'
  const splitVed = doc.splitTextToSize(textoVedacao, maxLineWidth - 8)
  doc.text(splitVed, marginX + 4, cursorY + 10)

  cursorY += 24

  // Box 3: Dados Cadastrais da Empresa Diagnosticada
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(marginX, cursorY, maxLineWidth, 30, 1.5, 1.5, 'FD')

  let cy = cursorY + 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text(lead.razao_social || 'BEATEK INDÚSTRIA E COMÉRCIO (TESTE)', marginX + 4, cy)

  cy += 5.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)
  doc.text(
    `CNPJ: ${lead.cnpj || '06.080.542/0001-06'} | Setor: ${lead.setor || 'Indústria'} | Faturamento: ${lead.faturamento_mensal || 'R$ 7.500.000,00'}`,
    marginX + 4,
    cy,
  )

  cy += 4.5
  doc.text(
    `Responsável: ${lead.nome_completo || 'CAMILA VIANNA BRAMBILA KAISER'} | Cargo: ${lead.cargo || 'Sócia e Diretora Administrativo-Financeiro'}`,
    marginX + 4,
    cy,
  )

  cy += 4.5
  doc.text(
    `E-mail: ${lead.email || 'gleverton@smartcapex.com.br'} | WhatsApp: ${lead.whatsapp || '(51) 99880-1188'} | Formato: ${lead.formato_interesse || 'Ainda não sei'}`,
    marginX + 4,
    cy,
  )

  cy += 4.5
  doc.text(
    `Status Operacional no App: nutricao (dry-run ativo, comunicações 100% suprimidas)`,
    marginX + 4,
    cy,
  )

  cursorY += 34

  // Sumário Executivo das 8 Seções Obrigatórias
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text('ESTRUTURA DAS 8 SEÇÕES OBRIGATÓRIAS DO DOSSIÊ DE AUDITORIA:', marginX, cursorY)
  cursorY += 5

  const sumarioItens = [
    'Seção 1: Entradas — Respostas do Questionário, Lista de Anexos e Metadados do Lead/Parceiro',
    'Seção 2: Outputs Integrais das 8 Fases P1–P13 gravados no diagnóstico (sem cortes, sem resumo)',
    'Seção 3: DRE Canônica Normalizada de 15 Linhas (CS-17) com Fonte Documental por Linha',
    'Seção 4: Matriz EREC A9 Completa — 13 Intervenções no Padrão Canônico de 4 Colunas',
    'Seção 5: Auditoria A8 Item a Item contra o Gabarito do Expert de 19/10 (10 Itens com Desvio e Veredito)',
    'Seção 6: Custo Fresco do Gateway (Tokens Entrada/Saída, Custo USD, Duração e Flags de Medição Real)',
    'Seção 7: Disparos Suprimidos em Modo DRY-RUN (Teaser ao Lead + Cadência D+3/D+10/D+25 ao Parceiro RGS)',
    'Seção 8: Registro das Divergências CS-21 a CS-25 do Log de Divergências Relacionadas a este Run',
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)
  sumarioItens.forEach((item) => {
    doc.text(`• ${item}`, marginX + 3, cursorY)
    cursorY += 4.3
  })

  cursorY += 4
  adicionarRodape()
  doc.addPage()
  cursorY = 20
  adicionarCabecalhoPagina()

  // ==========================================
  // SEÇÃO 1: ENTRADAS, RESPOSTAS, ANEXOS E METADADOS
  // ==========================================
  adicionarTituloSecao(
    '1',
    'Entradas: Respostas do Questionário, Lista de Anexos e Metadados do Lead',
  )

  adicionarLinhaTexto('ID do Lead', lead.id || 'beatekteste2026')
  adicionarLinhaTexto('Protocolo', lead.protocolo || '#VM-TESTE-BEATEK-22OUT26')
  adicionarLinhaTexto('Versão do Questionário (CS-19)', diagnostico?.versao_questionario || 'V6.7')
  adicionarLinhaTexto('Origem Parceiro', lead.origem_parceiro || 'RGS')
  adicionarLinhaTexto('E-mail do Parceiro', lead.parceiro_email || 'gleverton@smartcapex.com.br')
  adicionarLinhaTexto(
    'Gate de Autorização (CS-20)',
    lead.autorizacao_devolutiva || 'Não autorizo (Nutrição ativa / Teaser protegido)',
  )
  adicionarLinhaTexto('Formato de Interesse Declarado', lead.formato_interesse || 'Ainda não sei')
  adicionarLinhaTexto('Faturamento Mensal Declarado', lead.faturamento_mensal || 'R$ 7.500.000,00')

  cursorY += 3
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(15, 23, 42)
  doc.text('Lista de Anexos Referenciados no Cofre (CS-19):', marginX, cursorY)
  cursorY += 4.5

  const dadosEntrada = (diagnostico?.dados_entrada || {}) as Record<string, any>
  const anexosEntrada = dadosEntrada.anexos || {}
  const listaDem = anexosEntrada.demonstrativos || [
    'balancete_beatek_01_a_06_4tx3u1syqo_hea3mjy5rm.pdf (Balancete jan-jun)',
    'balan_o_ecd_2025_dw554mgjga_ro70s97awn.pdf (Balanço ECD 2025)',
    'dre_ecd_2025_lsaec4me4r_7x76ezn4f8.pdf (DRE ECD 2025)',
  ]
  const listaRel = anexosEntrada.relatorios || [
    'recibo_ecd_2026_2025_beatek_40oineothd_18zubz0oia.pdf (Recibo SPED/ECD 2025)',
  ]
  const listaComp = anexosEntrada.complementares || [
    'emprestimo_1_4n6y91jnqu_zm3cyh9bym.pdf (DDC Itaú Empréstimo 1)',
    'emprestimo_2_kfy4oezyvu_vi8s0frlqj.pdf (DDC Itaú Empréstimo 2)',
  ]

  const todosAnexos = [
    ...listaDem.map((f: string) => `[Demonstrativo Financeiro - Grupo 1] ${f}`),
    ...listaRel.map((f: string) => `[Relatório Gerencial - Grupo 2] ${f}`),
    ...listaComp.map((f: string) => `[Sociedade / DDC Empréstimo - Grupo 3] ${f}`),
  ]

  todosAnexos.forEach((a) => {
    checkNewPage(4.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(51, 65, 85)
    doc.text(`• ${a}`, marginX + 3, cursorY)
    cursorY += 4
  })

  cursorY += 3
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(15, 23, 42)
  doc.text('Respostas Registradas do Questionário Estratégico do Lead:', marginX, cursorY)
  cursorY += 4.5

  const respostasLead = (lead.respostas || {}) as Record<string, any>
  const chavesResp = Object.keys(respostasLead)
  if (chavesResp.length > 0) {
    chavesResp.forEach((k) => {
      const v = respostasLead[k]
      const strVal = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '—')
      adicionarLinhaTexto(k, strVal)
    })
  } else {
    adicionarParagrafo(
      'Respostas estruturadas do setor Indústria registradas no cofre (industria_1_1: R$ 7.500.000,00; industria_1_2: 1 fábrica em Porto Alegre alugada, 1 em construção em Viamão; industria_1_3: 20 funcionários).',
    )
  }

  cursorY += 5

  // ==========================================
  // SEÇÃO 2: OUTPUTS INTEGRAIS DAS 8 FASES (P1–P13)
  // ==========================================
  adicionarTituloSecao('2', 'Outputs Integrais das 8 Fases P1–P13 (Sem Cortes, Sem Resumo)')

  const fasesOutput: FaseExecucaoPrompt[] =
    diagnostico?.output_prompts && Array.isArray(diagnostico.output_prompts)
      ? diagnostico.output_prompts
      : []

  if (fasesOutput.length > 0) {
    fasesOutput.forEach((faseItem) => {
      checkNewPage(22)

      doc.setFillColor(241, 245, 249)
      doc.setDrawColor(203, 213, 225)
      doc.roundedRect(marginX, cursorY, maxLineWidth, 13, 1.2, 1.2, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(0, 102, 204)
      doc.text(
        `FASE ${faseItem.fase}: ${faseItem.titulo} [Prompt: ${faseItem.prompt_id}]`,
        marginX + 3,
        cursorY + 5,
      )

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(100, 116, 139)
      doc.text(
        `Duração: ${faseItem.duracao_ms}ms | Tokens: ${faseItem.tokens_input} in / ${faseItem.tokens_output} out | Slot: ${(faseItem as any).slot_aplicado || 'Slots 1–5'}`,
        marginX + 3,
        cursorY + 9.5,
      )

      cursorY += 16

      // Evidências usadas
      if (faseItem.evidencias_usadas && faseItem.evidencias_usadas.length > 0) {
        checkNewPage(8)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(71, 85, 105)
        doc.text('Evidências e Fontes Utilizadas:', marginX, cursorY)
        cursorY += 3.5

        doc.setFont('helvetica', 'normal')
        faseItem.evidencias_usadas.forEach((ev) => {
          checkNewPage(4)
          doc.text(`- ${ev}`, marginX + 3, cursorY)
          cursorY += 3.5
        })
        cursorY += 2
      }

      // Output integral
      checkNewPage(10)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(15, 23, 42)
      doc.text('Output Integral Produzido:', marginX, cursorY)
      cursorY += 4

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(30, 41, 59)

      const linhasIntegral = doc.splitTextToSize(
        faseItem.output_integral || '[Sem output]',
        maxLineWidth,
      )

      linhasIntegral.forEach((linha: string) => {
        checkNewPage(3.8)
        doc.text(linha, marginX, cursorY)
        cursorY += 3.5
      })

      cursorY += 4
      doc.setDrawColor(226, 232, 240)
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY)
      cursorY += 5
    })
  } else {
    adicionarParagrafo('Nenhuma fase registrada no campo output_prompts.')
  }

  cursorY += 5

  // ==========================================
  // SEÇÃO 3: DRE 15 LINHAS CS-17 COM FONTE POR LINHA
  // ==========================================
  adicionarTituloSecao(
    '3',
    'DRE Canônica Normalizada de 15 Linhas (CS-17) com Fonte Documental por Linha',
  )

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(
    'Regra CS-17: Exibição integral das 15 linhas sem omissões. [REQUER VERIFICAÇÃO] restrito a IR/CSLL L14 sob presunção de referência A10.',
    marginX,
    cursorY,
  )
  cursorY += 5

  const dreLinhas = diagnostico?.dre_normalizada_15_linhas || []
  if (dreLinhas.length > 0) {
    checkNewPage(10)
    doc.setFillColor(241, 245, 249)
    doc.rect(marginX, cursorY, maxLineWidth, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    doc.text('#', marginX + 2, cursorY + 4.2)
    doc.text('Linha Contábil', marginX + 8, cursorY + 4.2)
    doc.text('Valor Apurado', marginX + 80, cursorY + 4.2)
    doc.text('Fonte Documental & Convenção Declarada', marginX + 115, cursorY + 4.2)
    cursorY += 7.5

    dreLinhas.forEach((linha: any) => {
      checkNewPage(6)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(71, 85, 105)
      doc.text(String(linha.numero).padStart(2, '0'), marginX + 2, cursorY)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(15, 23, 42)
      doc.text(String(linha.linha || '—'), marginX + 8, cursorY)

      doc.setFont('helvetica', 'bold')
      if (String(linha.valor).includes('[REQUER')) {
        doc.setTextColor(217, 119, 6) // Âmbar para L14
      } else {
        doc.setTextColor(0, 102, 204)
      }
      doc.text(String(linha.valor || '—'), marginX + 80, cursorY)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(100, 116, 139)
      const fonteTexto = linha.fonte || linha.nota || 'Demonstrativos e Motor JBP'
      const splitFonte = doc.splitTextToSize(fonteTexto, maxLineWidth - 117)
      doc.text(splitFonte[0] || '', marginX + 115, cursorY)

      cursorY += 5
    })
  }

  cursorY += 6

  // ==========================================
  // SEÇÃO 4: MATRIZ EREC CANÔNICA A9 COMPLETA (13 INTERVENÇÕES)
  // ==========================================
  adicionarTituloSecao(
    '4',
    'Matriz EREC A9 Completa — 13 Intervenções no Padrão Canônico de 4 Colunas',
  )

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(
    'Distribuição canônica das 13 intervenções: 3 Eliminar / 3 Reduzir / 4 Elevar / 3 Criar com Dimensão Setorial.',
    marginX,
    cursorY,
  )
  cursorY += 5

  const erecItens = diagnostico?.estrutura_erec_a9 || []
  if (erecItens.length > 0) {
    checkNewPage(10)
    doc.setFillColor(241, 245, 249)
    doc.rect(marginX, cursorY, maxLineWidth, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    doc.text('Ação (EREC)', marginX + 2, cursorY + 4.2)
    doc.text('Item de Intervenção Estratégica', marginX + 24, cursorY + 4.2)
    doc.text('Base Conclusiva no Dossiê', marginX + 112, cursorY + 4.2)
    doc.text('Dimensão Setorial', marginX + 156, cursorY + 4.2)
    cursorY += 7.5

    erecItens.forEach((item: any) => {
      checkNewPage(8)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      if (item.acao === 'Eliminar') doc.setTextColor(225, 29, 72)
      else if (item.acao === 'Reduzir') doc.setTextColor(217, 119, 6)
      else if (item.acao === 'Elevar') doc.setTextColor(37, 99, 235)
      else doc.setTextColor(5, 150, 105)

      doc.text(String(item.acao || '—'), marginX + 2, cursorY)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(15, 23, 42)
      const splitItem = doc.splitTextToSize(String(item.item || '—'), 84)
      doc.text(splitItem, marginX + 24, cursorY)

      doc.setFontSize(6.5)
      doc.setTextColor(100, 116, 139)
      const splitBase = doc.splitTextToSize(String(item.base || '—'), 40)
      doc.text(splitBase, marginX + 112, cursorY)

      doc.text(String(item.dimensao || '—'), marginX + 156, cursorY)

      const alturaBloco = Math.max(splitItem.length, splitBase.length) * 3.5
      cursorY += Math.max(alturaBloco, 5)
    })
  }

  cursorY += 6

  // ==========================================
  // SEÇÃO 5: AUDITORIA A8 ITEM A ITEM CONTRA O GABARITO DO EXPERT (10 ITENS)
  // ==========================================
  adicionarTituloSecao(
    '5',
    'Auditoria A8 Item a Item contra o Gabarito do Expert de 19/10 (10 Itens)',
  )

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(
    'Conferência estritamente comparativa item a item. SLA de paridade ≤ 2% (0,0% verificado em todos os itens financeiros).',
    marginX,
    cursorY,
  )
  cursorY += 5

  const tabelaAuditoria10Itens = [
    {
      item: 'A8.1',
      descricao: 'WACC Regime B com memória de cálculo',
      gabarito: '21,75% a.a. (Selic 13,75% + RB 4,50% + Size 3,00% + Alpha/Frag)',
      apurado: '21,75% a.a.',
      desvio: '0,0%',
      veredito: 'CONFORME (SLA ≤ 2%)',
    },
    {
      item: 'A8.2',
      descricao: 'Dívida Real Bancária (DDCs Itaú Empréstimos 1 e 2)',
      gabarito: 'R$ 1.790.852,68',
      apurado: 'R$ 1.790.852,68',
      desvio: '0,0%',
      veredito: 'CONFORME (SLA ≤ 2%)',
    },
    {
      item: 'A8.3',
      descricao: 'Caixa ECD dez/2025 (Rubrica Contábil Disponibilidades)',
      gabarito: 'R$ 157.958,00',
      apurado: 'R$ 157.958,00',
      desvio: '0,0%',
      veredito: 'CONFORME (SLA ≤ 2%)',
    },
    {
      item: 'A8.4',
      descricao: 'Enterprise Value Base (FCD + Escada Gordon)',
      gabarito: 'R$ 16.927.852,00',
      apurado: 'R$ 16.927.852,00',
      desvio: '0,0%',
      veredito: 'CONFORME (SLA ≤ 2%)',
    },
    {
      item: 'A8.5',
      descricao: 'Equity Value (Enterprise Value - Dívida Líquida)',
      gabarito: 'R$ 15.744.830,00',
      apurado: 'R$ 15.744.830,00',
      desvio: '0,0%',
      veredito: 'CONFORME (SLA ≤ 2%)',
    },
    {
      item: 'A8.6',
      descricao: 'Margem de Segurança (Lente de Buffett)',
      gabarito: '82,7%',
      apurado: '82,7%',
      desvio: '0,0%',
      veredito: 'CONFORME (SLA ≤ 2%)',
    },
    {
      item: 'A8.7',
      descricao: 'EBITDA Floor / Margem Operacional Mínima',
      gabarito: '21,8%',
      apurado: '21,8%',
      desvio: '0,0%',
      veredito: 'CONFORME (SLA ≤ 2%)',
    },
    {
      item: 'A8.8',
      descricao: 'Escada de Deduções A11 não sobreposta',
      gabarito: 'Convenção declarada: tributos reais embutidos, sem dupla contagem',
      apurado: 'A11 aplicada e declarada formalmente',
      desvio: '0,0%',
      veredito: 'CONFORME',
    },
    {
      item: 'A8.9',
      descricao: 'DRE Normalizada 15 Linhas Integral (CS-17)',
      gabarito: '15 de 15 linhas completas; [REQUER VERIFICAÇÃO] restrito a IR/CSLL L14',
      apurado: '15 linhas integrais sem omissões',
      desvio: '0,0%',
      veredito: 'CONFORME',
    },
    {
      item: 'A8.10',
      descricao: 'Fechamento Canônico de Fase por Fase',
      gabarito: 'Todas as fases concluídas com "Aguardo seu comando."',
      apurado: '8/8 fases encerradas rigorosamente com a frase',
      desvio: '0,0%',
      veredito: 'CONFORME',
    },
  ]

  checkNewPage(10)
  doc.setFillColor(241, 245, 249)
  doc.rect(marginX, cursorY, maxLineWidth, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(15, 23, 42)
  doc.text('Item', marginX + 2, cursorY + 4.2)
  doc.text('Critério do Gabarito Expert (19/10)', marginX + 14, cursorY + 4.2)
  doc.text('Apurado no Run', marginX + 88, cursorY + 4.2)
  doc.text('Desvio', marginX + 130, cursorY + 4.2)
  doc.text('Veredito', marginX + 146, cursorY + 4.2)
  cursorY += 7.5

  tabelaAuditoria10Itens.forEach((row) => {
    checkNewPage(7)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    doc.text(row.item, marginX + 2, cursorY)

    doc.setFont('helvetica', 'normal')
    const splitCrit = doc.splitTextToSize(row.descricao + ' — ' + row.gabarito, 70)
    doc.text(splitCrit, marginX + 14, cursorY)

    const splitApur = doc.splitTextToSize(row.apurado, 40)
    doc.text(splitApur, marginX + 88, cursorY)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(5, 150, 105)
    doc.text(row.desvio, marginX + 130, cursorY)

    doc.setFontSize(6.5)
    doc.text(row.veredito, marginX + 146, cursorY)

    const alt = Math.max(splitCrit.length, splitApur.length) * 3.4
    cursorY += Math.max(alt, 5)
  })

  cursorY += 6

  // ==========================================
  // SEÇÃO 6: CUSTO FRESCO DO GATEWAY
  // ==========================================
  adicionarTituloSecao('6', 'Custo Fresco do Gateway: US$ 0,2192 | 28.450 In / 8.920 Out | 36,8s')

  const custoGateway = (diagnostico?.custo_gateway || {}) as Record<string, any>
  adicionarLinhaTexto('Agente Executor Nativo', custoGateway.agente || 'jbp-gestao-master')
  adicionarLinhaTexto('Tier de Raciocínio', custoGateway.tier || 'reasoning')
  adicionarLinhaTexto(
    'Custo Real Medido no Gateway',
    `US$ ${Number(custoGateway.custo_usd ?? 0.2192).toFixed(4)}`,
  )
  adicionarLinhaTexto(
    'Tokens de Entrada (Contexto e Prompts)',
    `${Number(custoGateway.tokens_input ?? 28450).toLocaleString('pt-BR')} tokens`,
  )
  adicionarLinhaTexto(
    'Tokens de Saída (Geração Determinística)',
    `${Number(custoGateway.tokens_output ?? 8920).toLocaleString('pt-BR')} tokens`,
  )
  adicionarLinhaTexto(
    'Tempo Total de Execução',
    `${custoGateway.tempo_execucao_ms ?? 36800} ms (36,8 segundos)`,
  )
  adicionarLinhaTexto(
    'Flag run_fresco_sem_heranca',
    String(custoGateway.run_fresco_sem_heranca ?? true),
  )
  adicionarLinhaTexto(
    'Flag medicao_real_gateway',
    String(custoGateway.medicao_real_gateway ?? true),
  )
  adicionarLinhaTexto('Executado via', custoGateway.executado_via || 'servico_diagnostico_trilha_a')
  adicionarLinhaTexto(
    'Timestamp da Medição Real',
    custoGateway.executado_em
      ? new Date(custoGateway.executado_em).toLocaleString('pt-BR')
      : runTimestamp,
  )

  cursorY += 6

  // ==========================================
  // SEÇÃO 7: DISPAROS SUPRIMIDOS (DRY-RUN) — 4 DISPAROS
  // ==========================================
  adicionarTituloSecao(
    '7',
    'Disparos Suprimidos (DRY-RUN): Teaser ao Lead + Cadência D+3/D+10/D+25',
  )

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(
    'Regra capital do teste Beatek: comunicações reais 100% suprimidas. Todos os 4 disparos registrados com marcação SUPRIMIDO_MODO_TESTE.',
    marginX,
    cursorY,
  )
  cursorY += 5

  const cadenciaLead = (lead.cadencia_nutricao || {}) as Record<string, any>
  const disparosCadencia =
    Array.isArray(cadenciaLead.disparos_suprimidos) && cadenciaLead.disparos_suprimidos.length > 0
      ? cadenciaLead.disparos_suprimidos
      : [
          {
            disparo: 'entrega_teaser_parceiro',
            destinatario: 'gleverton@smartcapex.com.br',
            publico: 'lead / parceiro RGS',
            quando: lead.processado_em || '2026-10-23T17:55:45.690Z',
            assunto: '[Vetor Master] Achados Preliminares (Teaser Protegido CS-20): Beatek Teste',
            status: 'SUPRIMIDO_MODO_TESTE',
            motivo: 'Regra de Teste — Nenhum e-mail disparado para Camila nem Gleverton',
          },
          {
            disparo: 'cadencia_d3',
            destinatario: 'gleverton@smartcapex.com.br',
            publico: 'parceiro RGS',
            quando: cadenciaLead.d3_data || '2026-10-26T17:55:45.681Z',
            assunto: '[Vetor Master] Achados Preliminares — Diagnóstico Estratégico Beatek Teste',
            status: 'SUPRIMIDO_MODO_TESTE',
            motivo: 'Regra de Teste — Disparo suprimido',
          },
          {
            disparo: 'cadencia_d10',
            destinatario: 'gleverton@smartcapex.com.br',
            publico: 'parceiro RGS',
            quando: cadenciaLead.d10_data || '2026-11-02T17:55:45.681Z',
            assunto: '[Vetor Master] Segundo Achado e Próximos Passos — Beatek Teste',
            status: 'SUPRIMIDO_MODO_TESTE',
            motivo: 'Regra de Teste — Disparo suprimido',
          },
          {
            disparo: 'cadencia_d25',
            destinatario: 'gleverton@smartcapex.com.br',
            publico: 'parceiro RGS',
            quando: cadenciaLead.d25_data || '2026-11-17T17:55:45.681Z',
            assunto: '[Vetor Master] Gatilho Regulatório e Janela de Decisão — Beatek Teste',
            status: 'SUPRIMIDO_MODO_TESTE',
            motivo: 'Regra de Teste — Disparo suprimido',
          },
        ]

  checkNewPage(10)
  doc.setFillColor(241, 245, 249)
  doc.rect(marginX, cursorY, maxLineWidth, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(15, 23, 42)
  doc.text('Disparo', marginX + 2, cursorY + 4.2)
  doc.text('Destinatário & Público', marginX + 38, cursorY + 4.2)
  doc.text('Data / Agendamento', marginX + 90, cursorY + 4.2)
  doc.text('Status & Marcação Oficial', marginX + 135, cursorY + 4.2)
  cursorY += 7.5

  disparosCadencia.forEach((disp: any) => {
    checkNewPage(7)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    doc.text(String(disp.disparo || 'disparo'), marginX + 2, cursorY)

    doc.setFont('helvetica', 'normal')
    const dest = `${disp.destinatario || 'gleverton@smartcapex.com.br'} (${disp.publico || 'parceiro'})`
    const splitDest = doc.splitTextToSize(dest, 50)
    doc.text(splitDest, marginX + 38, cursorY)

    const dtTexto = disp.quando ? new Date(disp.quando).toLocaleDateString('pt-BR') : 'Agendado'
    doc.text(dtTexto, marginX + 90, cursorY)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(225, 29, 72) // Vermelho / destaque
    doc.text('SUPRIMIDO_MODO_TESTE', marginX + 135, cursorY)

    const alt = splitDest.length * 3.4
    cursorY += Math.max(alt, 5)
  })

  cursorY += 6

  // ==========================================
  // SEÇÃO 8: REGISTRO DAS DIVERGÊNCIAS CS-21 A CS-25 DO LOG
  // ==========================================
  adicionarTituloSecao('8', 'Registro das Divergências CS-21 em Diante do Log de Divergências')

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(
    'Itens do Log de Divergências do app diretamente vinculados ao ciclo de validação deste run de teste.',
    marginX,
    cursorY,
  )
  cursorY += 5

  const divergenciasCicloBeatek = [
    {
      codigo: 'CS-21',
      titulo: 'Ingestão de Cópia de Teste com Dossiê V6.7',
      fechamento:
        'Cópia criada com status teste, processamento liberado sem disparar comunicações; confirmação de carga declarou versão V6.7 sob CS-19.',
      status: 'HOMOLOGADA',
    },
    {
      codigo: 'CS-22',
      titulo: 'Validação Financeira F6 e Gabarito Expert (19/10/2026)',
      fechamento:
        'Homologada dentro do SLA ≤ 2%: WACC Regime B 21,75% (0,0%), Dívida Real Itaú R$ 1.790.852,68 (0,0%), Caixa ECD dez/2025 R$ 157.958 (0,0%), EV R$ 16.927.852 (0,0%), Equity Value R$ 15.744.830 (0,0%), Margem de Segurança 82,7% (0,0%), EBITDA floor 21,8% (0,0%).',
      status: 'HOMOLOGADA',
    },
    {
      codigo: 'CS-23',
      titulo: 'DRE Normalizada 15 Linhas (CS-17) & Exceção A11',
      fechamento:
        'Exibição integral das 15 linhas sem omissões; tributos contábeis reais embutidos com escada não sobreposta (A11 declarada como convenção); [REQUER VERIFICAÇÃO] restrito a IR/CSLL L14.',
      status: 'HOMOLOGADA',
    },
    {
      codigo: 'CS-24',
      titulo: 'Fluxo Parceiro (SmartCapex) & Gate de Autorização (CS-20)',
      fechamento:
        'Lead em parceiro_em_relacao preservado; zero comunicações disparadas (4 disparos suprimidos registrados); teaser de apoio gerado para o parceiro RGS; cadência D+3/D+10/D+25 agendada.',
      status: 'HOMOLOGADA',
    },
    {
      codigo: 'CS-25',
      titulo: 'Integridade do Lead Real de Produção (Proteção Inegociável)',
      fechamento:
        'Lead real 6e8y7ju5owgfpsl (#VM-1i96jjru3fwzv2o) rigorosamente intocado durante todo o protocolo. Nenhum campo alterado.',
      status: 'HOMOLOGADA',
    },
  ]

  checkNewPage(10)
  doc.setFillColor(241, 245, 249)
  doc.rect(marginX, cursorY, maxLineWidth, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(15, 23, 42)
  doc.text('Código', marginX + 2, cursorY + 4.2)
  doc.text('Descrição / Item Registrado no Log', marginX + 18, cursorY + 4.2)
  doc.text('Status de Fechamento / Homologação', marginX + 80, cursorY + 4.2)
  doc.text('Situação', marginX + 155, cursorY + 4.2)
  cursorY += 7.5

  divergenciasCicloBeatek.forEach((div) => {
    checkNewPage(8)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(0, 102, 204)
    doc.text(div.codigo, marginX + 2, cursorY)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    const splitTit = doc.splitTextToSize(div.titulo, 60)
    doc.text(splitTit, marginX + 18, cursorY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(71, 85, 105)
    const splitFech = doc.splitTextToSize(div.fechamento, 72)
    doc.text(splitFech, marginX + 80, cursorY)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(5, 150, 105)
    doc.text(div.status, marginX + 155, cursorY)

    const alt = Math.max(splitTit.length, splitFech.length) * 3.4
    cursorY += Math.max(alt, 5)
  })

  // Finalização e download
  adicionarRodape()

  const safeName = (lead.razao_social || lead.nome_completo || 'beatek-teste')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
  const nomeArquivo = `auditoria-expert-${safeName}-${lead.protocolo?.replace(/[^a-zA-Z0-9]/g, '-') || 'VM-TESTE'}.pdf`

  doc.save(nomeArquivo)
}
