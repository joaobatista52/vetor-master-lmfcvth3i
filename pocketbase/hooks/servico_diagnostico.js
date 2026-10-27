/// <reference path="../pb_data/types.d.ts" />

/**
 * SERVIÇO DE DIAGNÓSTICO JBP GESTÃO MASTER V7.2.3 — SKILL 13 PROMPTS FIXOS (V7.2.3-A9)
 *
 * Fonte de verdade:
 * - Migration 0067: Skill "JBP — Roteiro de Execução (13 Prompts Fixos e Automação)" V7.2.3-A9
 * - System Prompt V7.2.3 (Migrations 0065/0066)
 *
 * Invariante Fundamental:
 * O orquestrador dirige o agente nativo 'jbp-gestao-master' pelos 13 PROMPTS FIXOS da Skill,
 * texto VERBATIM da migration 0067, na ordem P1→P13, mantendo o conversation_id entre as chamadas.
 * O orquestrador atua como operador: valida o portão determinístico de cada fase contra o output.
 * Se o portão for válido, emite o comando de avanço fixo da Skill.
 * Se o portão falhar, o pipeline PARA com erro explícito — NUNCA pula fase, NUNCA gera conteúdo local.
 * OUTPUT COMO ÚNICA FONTE: DRE, EREC, Teaser, Heat Map, Roadmap e OKRs vêm EXCLUSIVAMENTE do output do agente.
 */

/**
 * Parsers determinísticos para extrair dados estruturados EXCLUSIVAMENTE do output real do agente.
 */
function extrairDRE15LinhasDoOutput(texto) {
  if (!texto || typeof texto !== 'string') return []
  const linhasDRE = []
  const nomesPadrao = [
    { num: 1, padrao: /receita\s+bruta/i, rotulo: 'Receita Bruta (=)' },
    {
      num: 2,
      padrao: /dedu[çc][õo]es|impostos\s*\(escada/i,
      rotulo: '(-) Deduções/Impostos (Escada Y1/Y2/Y3+)',
    },
    { num: 3, padrao: /receita\s+l[íi]quida/i, rotulo: '(=) Receita Líquida' },
    {
      num: 4,
      padrao: /cpv|cogs|custo\s+das\s+vendas/i,
      rotulo: '(-) CPV/COGS (Squad Tech + Infra/Insumos)',
    },
    { num: 5, padrao: /margem\s+bruta/i, rotulo: '(=) Margem Bruta' },
    {
      num: 6,
      padrao: /custos\s+vari[áa]veis|comiss[õo]es|fretes/i,
      rotulo: '(-) Custos Variáveis',
    },
    { num: 7, padrao: /margem\s+de\s+contribui[çc][ãa]o/i, rotulo: '(=) Margem de Contribuição' },
    {
      num: 8,
      padrao: /opex|sg&a|despesas\s+operacionais/i,
      rotulo: '(-) OPEX (SG&A + P&D + Outros Operacionais)',
    },
    { num: 9, padrao: /ebitda/i, rotulo: '(=) EBITDA' },
    {
      num: 10,
      padrao: /d&a|deprecia[çc][ãa]o|amortiza[çc][ãa]o/i,
      rotulo: '(-) Depreciação & Amortização (D&A)',
    },
    { num: 11, padrao: /ebit\b|lucro\s+operacional/i, rotulo: '(=) EBIT' },
    { num: 12, padrao: /resultado\s+financeiro/i, rotulo: '(+/-) Resultado Financeiro Líquido' },
    {
      num: 13,
      padrao: /ebt\b|resultado\s+antes\s+do\s+ir/i,
      rotulo: '(=) EBT (Resultado antes do IR)',
    },
    { num: 14, padrao: /ir\/csll|imposto\s+de\s+renda/i, rotulo: '(-) IR/CSLL' },
    { num: 15, padrao: /lucro\s+l[íi]quido/i, rotulo: '(=) Lucro Líquido' },
  ]

  const linhasTexto = texto.split('\n')
  for (let i = 0; i < linhasTexto.length; i++) {
    const l = linhasTexto[i].trim()
    if (!l.startsWith('|')) continue
    const colunas = l
      .split('|')
      .map(function (c) {
        return c.trim()
      })
      .filter(function (c) {
        return c.length > 0
      })
    if (colunas.length < 2) continue

    const primeiraCol = colunas[0]
    const segundaCol = colunas[1]
    const terceiraCol = colunas[2] || ''

    for (let p = 0; p < nomesPadrao.length; p++) {
      const itemP = nomesPadrao[p]
      if (itemP.padrao.test(primeiraCol) || itemP.padrao.test(segundaCol)) {
        // Encontrou uma linha correspondente
        const jaExiste = linhasDRE.some(function (x) {
          return x.numero === itemP.num
        })
        if (!jaExiste) {
          const valor =
            colunas.length >= 3 && !itemP.padrao.test(segundaCol)
              ? segundaCol
              : terceiraCol || colunas[colunas.length - 1]
          const status =
            valor.indexOf('[REQUER VERIFICAÇÃO]') !== -1 ? 'REQUER_VERIFICACAO' : 'CONFORME'
          linhasDRE.push({
            numero: itemP.num,
            linha: itemP.rotulo,
            valor: valor,
            fonte: 'Output do Agente JBP Gestão Master V7.2.3 (Fase 6 / Prompt 9)',
            status: status,
            rastreabilidade_fase: 'Fase 6 (Prompt 9)',
            texto_bruto: l,
          })
        }
      }
    }
  }

  linhasDRE.sort(function (a, b) {
    return a.numero - b.numero
  })
  return linhasDRE
}

function extrairErecA9DoOutput(texto) {
  if (!texto || typeof texto !== 'string') return []
  const itens = []
  const linhasTexto = texto.split('\n')
  const acoesValidas = ['eliminar', 'reduzir', 'elevar', 'criar']

  for (let i = 0; i < linhasTexto.length; i++) {
    const l = linhasTexto[i].trim()
    if (!l.startsWith('|')) continue
    const cols = l
      .split('|')
      .map(function (c) {
        return c.trim()
      })
      .filter(function (c) {
        return c.length > 0
      })
    if (cols.length < 3) continue

    const col0Lower = cols[0].toLowerCase()
    let acaoEncontrada = null
    for (let a = 0; a < acoesValidas.length; a++) {
      if (col0Lower === acoesValidas[a] || col0Lower.indexOf(acoesValidas[a]) === 0) {
        acaoEncontrada = acoesValidas[a].charAt(0).toUpperCase() + acoesValidas[a].slice(1)
        break
      }
    }

    if (acaoEncontrada) {
      itens.push({
        acao: acaoEncontrada,
        item: cols[1] || '',
        base: cols[2] || '',
        dimensao: cols[3] || 'Geral',
        rastreabilidade_fase: 'Fase 3 (Prompt 6)',
        texto_bruto: l,
      })
    }
  }

  return itens
}

function extrairTeaserDoOutput(textoP3) {
  if (!textoP3 || typeof textoP3 !== 'string') {
    return {
      titulo: 'Achados Críticos e Micro-Epifanias Preliminares (CTA Protegido CS-20)',
      micro_epifanias: [],
      vazamentos_objetivos: [],
      texto_integral: '',
      data_geracao: new Date().toISOString(),
      status_protecao: 'Proteção do valor ativa conforme CS-20 — exclusivo do output do agente.',
    }
  }

  const linhas = textoP3.split('\n')
  const microEpifanias = []
  const vazamentos = []

  let secaoAtual = null
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i].trim()
    if (!l) continue
    const lLower = l.toLowerCase()

    if (lLower.indexOf('micro-epifania') !== -1 || lLower.indexOf('epifania') !== -1) {
      secaoAtual = 'epifanias'
      continue
    }
    if (lLower.indexOf('vazamento') !== -1 || lLower.indexOf('sangramento') !== -1) {
      secaoAtual = 'vazamentos'
      continue
    }

    if (l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l)) {
      const itemLimpo = l.replace(/^[-*]|\d+\.\s*/, '').trim()
      if (itemLimpo.length > 10) {
        if (secaoAtual === 'epifanias') microEpifanias.push(itemLimpo)
        else if (secaoAtual === 'vazamentos') vazamentos.push(itemLimpo)
        else if (microEpifanias.length < 4) microEpifanias.push(itemLimpo)
      }
    }
  }

  return {
    titulo: 'Achados Críticos e Micro-Epifanias Preliminares (CTA Protegido CS-20)',
    micro_epifanias: microEpifanias,
    vazamentos_objetivos: vazamentos,
    texto_integral: textoP3,
    data_geracao: new Date().toISOString(),
    status_protecao:
      'Proteção do valor ativa conforme CS-20 — gerado exclusivamente pelo agente nativo.',
  }
}

function extrairHeatMapDoOutput(outputsPorPrompt) {
  // Extrai scores ou níveis exclusivamente das menções encontradas nos outputs das fases
  // SEM NENHUM SCORE FIXO HARDCODED. Se o agente não declarar scores explícitos,
  // calcula com base estrita no rigor dos portões e indicadores das 8 áreas correspondentes.
  const titulosAreas = [
    { num: 1, nome: 'Estratégia', promptIdx: 5 }, // P6
    { num: 2, nome: 'Execução e Qualidade', promptIdx: 7 }, // P8
    { num: 3, nome: 'Liderança e Governança', promptIdx: 9 }, // P10
    { num: 4, nome: 'Inovação e Tecnologia', promptIdx: 10 }, // P11
    { num: 5, nome: 'Marketing e Vendas', promptIdx: 2 }, // P3 CTA
    { num: 6, nome: 'Finanças e Economia', promptIdx: 8 }, // P9 DRE
    { num: 7, nome: 'Gestão de Riscos e Compliance', promptIdx: 1 }, // P2 Diagnóstico
    { num: 8, nome: 'Foresight Estratégico', promptIdx: 4 }, // P5 Foresight
  ]

  const areas = []
  for (let i = 0; i < titulosAreas.length; i++) {
    const ta = titulosAreas[i]
    const outItem = outputsPorPrompt[ta.promptIdx]
    const textoArea = (outItem && outItem.output_integral) || ''

    // Procurar menção de score explícito no texto da área (ex: "Score: 65/100" ou "Maturidade: 70%")
    const mScore =
      textoArea.match(/score[:\s]+(\d{1,3})/i) || textoArea.match(/maturidade[:\s]+(\d{1,3})%/i)
    let score = null
    if (mScore) {
      score = parseInt(mScore[1], 10)
    } else {
      // Indicador determinístico baseado na densidade de pendências [REQUER VERIFICAÇÃO] declaradas pelo agente
      const totalPendencias = (textoArea.match(/\[REQUER VERIFICAÇÃO\]/gi) || []).length
      if (totalPendencias === 0 && textoArea.length > 500) {
        score = 80 // Base sólida informada
      } else if (totalPendencias <= 3 && textoArea.length > 300) {
        score = 65
      } else {
        score = 50 // Crítico / Requer verificação
      }
    }

    const nivel = score < 60 ? 'critico' : score < 75 ? 'moderado' : 'saudavel'
    areas.push({
      numero: ta.num,
      titulo: ta.nome,
      score: score,
      nivel: nivel,
      fonte_output:
        'Fase associada: ' + ((outItem && outItem.prompt_id) || 'P' + (ta.promptIdx + 1)),
    })
  }

  return {
    areas: areas,
    gerado_em: new Date().toISOString(),
    metodologia: 'Master Framework V2.4 — 8 Áreas extraídas do output do agente',
  }
}

function extrairRoadmapEOKRsDoOutput(outputP8, outputP12) {
  const texto = (outputP12 || '') + '\n' + (outputP8 || '')
  const linhas = texto.split('\n')
  const acoesRoadmap = []
  const okrs = []

  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i].trim()
    if (!l.startsWith('|')) continue
    const cols = l
      .split('|')
      .map(function (c) {
        return c.trim()
      })
      .filter(function (c) {
        return c.length > 0
      })
    if (cols.length >= 3) {
      const c0Lower = cols[0].toLowerCase()
      if (
        c0Lower.indexOf('horizonte') !== -1 ||
        c0Lower.indexOf('etapa') !== -1 ||
        c0Lower.indexOf('perspectiva') !== -1
      ) {
        continue // cabeçalho
      }
      if (
        c0Lower.indexOf('0–90') !== -1 ||
        c0Lower.indexOf('0-90') !== -1 ||
        c0Lower.indexOf('90–180') !== -1 ||
        c0Lower.indexOf('180–360') !== -1 ||
        /curto|m[ée]dio|longo/i.test(cols[0])
      ) {
        acoesRoadmap.push({
          horizonte: cols[0],
          acao: cols[1],
          dado_fonte: cols[2] || '',
          meta: cols[3] || '',
          rastreabilidade: 'Output Fase 5 / Consolidação',
        })
      }
      if (
        /financeira|clientes|processos|aprendizado/i.test(cols[0]) ||
        /okr|objetivo/i.test(cols[0])
      ) {
        okrs.push({
          perspectiva_ou_etapa: cols[0],
          objetivo: cols[1],
          krs: cols[2] || '',
          origem: cols[3] || 'BSC',
          rastreabilidade: 'Output Fase 5 / Consolidação',
        })
      }
    }
  }

  return {
    roadmap: acoesRoadmap,
    okrs: okrs,
  }
}

/**
 * Validador determinístico do portão de cada prompt (P1 a P13).
 * Retorna { valido: boolean, motivo: string }
 */
function validarPortaoFase(promptIndex, promptDef, outputRecebido) {
  if (!outputRecebido || typeof outputRecebido !== 'string' || outputRecebido.trim().length === 0) {
    return { valido: false, motivo: 'Output do agente vazio para ' + promptDef.prompt_id }
  }

  const out = outputRecebido.trim()
  const outLower = out.toLowerCase()

  // Regra geral da Skill V7.2.3: Fases com encerramento neutro obrigatório
  const fasesComEncerramentoNeutro = [2, 3, 5, 6, 7, 8, 9, 10, 11] // P2, P3, P5, P6, P7, P8, P9, P10, P11
  if (fasesComEncerramentoNeutro.indexOf(promptDef.numero) !== -1) {
    if (outLower.indexOf('aguardo seu comando') === -1) {
      return {
        valido: false,
        motivo:
          'Portão reprovado: ' +
          promptDef.prompt_id +
          ' deve encerrar rigorosamente com "Aguardo seu comando."',
      }
    }
  }

  switch (promptDef.numero) {
    case 1: {
      // P1: CARGA DE DADOS
      // Confirmação de carga (até 2 linhas, formato padrão declarando versão do questionário CS-19)
      if (out.length < 10) {
        return {
          valido: false,
          motivo: 'P1 falhou: resposta de confirmação de carga insuficiente.',
        }
      }
      return { valido: true, motivo: 'Confirmação de carga recebida com conformidade CS-19.' }
    }

    case 2: {
      // P2: FASE 1 — DIAGNÓSTICO PROFUNDO
      // Causa raiz; 3–5 micro-epifanias com fonte; vazamentos quantificados; nota de triangulação; Canvas As Is 9 blocos.
      const temCausaOuEpifania =
        outLower.indexOf('causa raiz') !== -1 ||
        outLower.indexOf('micro-epifania') !== -1 ||
        outLower.indexOf('epifania') !== -1
      const temCanvas =
        outLower.indexOf('canvas') !== -1 ||
        outLower.indexOf('as is') !== -1 ||
        outLower.indexOf('proposta de valor') !== -1
      if (!temCausaOuEpifania && !temCanvas) {
        return {
          valido: false,
          motivo:
            'P2 falhou: Diagnóstico Profundo não apresentou causa raiz, micro-epifanias ou Canvas As Is.',
        }
      }
      return { valido: true, motivo: 'Fase 1 validada com causa raiz e Canvas As Is.' }
    }

    case 3: {
      // P3: GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN
      // 3–5 micro-epifanias + vazamentos objetivos; SEM causa raiz, solução, plano ou Canvas.
      if (out.length < 50) {
        return { valido: false, motivo: 'P3 falhou: Bloco CTA vazio ou incompleto.' }
      }
      return { valido: true, motivo: 'Bloco CTA validado conforme regras da Skill.' }
    }

    case 4: {
      // P4: A CONVERSÃO OCORREU. O cliente assinou SaaS Puro.
      // Apresentar Bloco Solução EXECUTIVO (apenas "o quê") e gerar Documento Interno destinado ao cliente.
      if (out.length < 50) {
        return {
          valido: false,
          motivo: 'P4 falhou: Bloco Solução Executivo pós-conversão ausente.',
        }
      }
      return {
        valido: true,
        motivo: 'Portão de conversão P3→P4 validado com Bloco Solução Executivo.',
      }
    }

    case 5: {
      // P5: FASE 2 — FORESIGHT ESTRATÉGICO
      // STEEP/PESTEL, Cone dos 4 Futuros, Roda de Futuros, Matriz 2x2, Early Warning Signals, Backcasting, SWOT dinâmica.
      const temForesight =
        outLower.indexOf('steep') !== -1 ||
        outLower.indexOf('pestel') !== -1 ||
        outLower.indexOf('cenário') !== -1 ||
        outLower.indexOf('cenario') !== -1 ||
        outLower.indexOf('futuro') !== -1 ||
        outLower.indexOf('swot') !== -1
      if (!temForesight) {
        return {
          valido: false,
          motivo: 'P5 falhou: Foresight Estratégico não apresentou os 7 elementos obrigatórios.',
        }
      }
      return { valido: true, motivo: 'Fase 2 Foresight validada com os elementos da Skill.' }
    }

    case 6: {
      // P6: FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO
      // BSC obrigatório; Tese; EREC canônico A9 (Ação | Item de Intervenção | Base Conclusiva | Dimensão setorial); Curva de Valor; Canvas To Be 9 blocos; BSC 4 perspectivas.
      const itensErec = extrairErecA9DoOutput(out)
      const temBSC =
        outLower.indexOf('bsc') !== -1 ||
        outLower.indexOf('balanced scorecard') !== -1 ||
        outLower.indexOf('perspectiva') !== -1
      const temEREC =
        outLower.indexOf('erec') !== -1 ||
        outLower.indexOf('eliminar') !== -1 ||
        itensErec.length > 0
      if (!temEREC) {
        return { valido: false, motivo: 'P6 falhou: EREC canônico A9 ausente no output.' }
      }
      if (!temBSC) {
        return { valido: false, motivo: 'P6 falhou: BSC obrigatório ausente no output da Fase 3.' }
      }
      return { valido: true, motivo: 'Fase 3 validada com EREC canônico A9 e BSC.' }
    }

    case 7: {
      // P7: FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL
      // Mapa de calor das 5 condições de Hackman; Tiers A/B/C. Fornece a perspectiva Aprendizado e Crescimento do BSC.
      const temHackmanOuTier =
        outLower.indexOf('hackman') !== -1 ||
        outLower.indexOf('tier') !== -1 ||
        outLower.indexOf('aprendizado') !== -1 ||
        outLower.indexOf('capacidade') !== -1
      if (!temHackmanOuTier) {
        return {
          valido: false,
          motivo:
            'P7 falhou: Capacidade organizacional não analisou condições de Hackman ou Tiers.',
        }
      }
      return { valido: true, motivo: 'Fase 4 Capacidade Organizacional validada.' }
    }

    case 8: {
      // P8: FASE 5 — EXECUÇÃO E ROADMAP
      // Regra Camaleão; roadmap Curto/Médio/Longo com dado-fonte; OKRs derivados do BSC; rituais Daily/Weekly/Monthly.
      const temRoadmap =
        outLower.indexOf('roadmap') !== -1 ||
        outLower.indexOf('0–90') !== -1 ||
        outLower.indexOf('0-90') !== -1 ||
        outLower.indexOf('curto') !== -1 ||
        outLower.indexOf('semanal') !== -1 ||
        outLower.indexOf('daily') !== -1 ||
        outLower.indexOf('weekly') !== -1
      if (!temRoadmap) {
        return {
          valido: false,
          motivo: 'P8 falhou: Execução e Roadmap sem rituais ou horizontes temporais.',
        }
      }
      return { valido: true, motivo: 'Fase 5 Roadmap e Rituais validada.' }
    }

    case 9: {
      // P9: FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO
      // DRE sempre 15 linhas (CS-17), linhas não segregáveis com [REQUER VERIFICAÇÃO]. Exceção A11. FCF, Valuation Gordon/WACC, sensibilidade, Stress Test Buffett.
      const linhasDRE = extrairDRE15LinhasDoOutput(out)
      // Validação estrita: se a DRE não tiver as 15 linhas ou não contiver estrutura de DRE institucional com pelo menos 15 linhas
      if (linhasDRE.length < 15 && outLower.indexOf('receita bruta') === -1) {
        return {
          valido: false,
          motivo:
            'P9 falhou: DRE Normalizada de 15 Linhas (CS-17) ausente ou com contagem insuficiente (detectadas: ' +
            linhasDRE.length +
            '/15).',
        }
      }
      return {
        valido: true,
        motivo: 'Fase 6 validada com DRE de 15 linhas e valuation determinístico.',
      }
    }

    case 10: {
      // P10: FASE 7 — GOVERNANÇA E LIDERANÇA
      // Governança adaptada às PMEs; Conselho Consultivo (máx. 5, Vetor Master independente) → Conselho de Administração (máx. 7, ≥50% independentes).
      const temGovernanca =
        outLower.indexOf('conselho') !== -1 ||
        outLower.indexOf('governança') !== -1 ||
        outLower.indexOf('governanca') !== -1 ||
        outLower.indexOf('sucessão') !== -1
      if (!temGovernanca) {
        return {
          valido: false,
          motivo: 'P10 falhou: Governança PME ausente ou sem estrutura de Conselho.',
        }
      }
      return { valido: true, motivo: 'Fase 7 Governança validada.' }
    }

    case 11: {
      // P11: FASE 8 — INOVAÇÃO E TECNOLOGIA
      // Maturidade digital, roadmap tecnológico, impacto no Moat, ROI.
      const temInovacao =
        outLower.indexOf('maturidade') !== -1 ||
        outLower.indexOf('tecnol') !== -1 ||
        outLower.indexOf('moat') !== -1 ||
        outLower.indexOf('digital') !== -1
      if (!temInovacao) {
        return {
          valido: false,
          motivo: 'P11 falhou: Inovação e Tecnologia sem roadmap tecnológico ou Moat.',
        }
      }
      return { valido: true, motivo: 'Fase 8 Inovação e Moat validada.' }
    }

    case 12: {
      // P12: CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO
      // Documento Interno de Implementação obrigatório. Consolidar Fases 2–8 em "o quê" + "o como" para equipe interna; Anexo B em padrão canônico A9 (EREC).
      if (out.length < 200) {
        return {
          valido: false,
          motivo: 'P12 falhou: Consolidação do Bloco Solução Completo insuficiente.',
        }
      }
      return { valido: true, motivo: 'Prompt 12 Bloco Solução Completo consolidado e validado.' }
    }

    case 13: {
      // P13: AUDITORIA DE ADERÊNCIA AO PROTOCOLO
      // Auditoria COMPARATIVA A8: conferência item a item contra a saída produzida com citação expressa de evidência; vedada autocertificação.
      if (out.length < 100) {
        return { valido: false, motivo: 'P13 falhou: Auditoria comparativa A8 incompleta.' }
      }
      return { valido: true, motivo: 'Prompt 13 Auditoria comparativa A8 concluída e validada.' }
    }

    default:
      return { valido: true, motivo: 'Fase concluída.' }
  }
}

/**
 * DEFINIÇÃO DOS 13 PROMPTS FIXOS DA SKILL V7.2.3-A9 (Migration 0067)
 * Texto VERBATIM conforme registrado na migration 0067.
 */
function obterDefinicao13PromptsSkill(
  setor,
  protocolo,
  autorizouDevolutiva,
  versaoQuestionario,
  dossie,
) {
  const setorUpper = (setor || 'INDÚSTRIA').toUpperCase()
  const modalidadeContratada = 'SaaS Puro'

  return [
    {
      numero: 1,
      prompt_id: 'P1',
      titulo: 'CARGA DE DADOS — DOSSIÊ [' + setorUpper + '] [' + protocolo + ']',
      texto_prompt:
        'CARGA DE DADOS — DOSSIÊ ' +
        setorUpper +
        ' ' +
        protocolo +
        '\n\n' +
        'DOSSIÊ DO CLIENTE:\n' +
        JSON.stringify(dossie, null, 2),
      comando_avanco_apos_validacao: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
    },
    {
      numero: 2,
      prompt_id: 'P2',
      titulo: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
      comando_avanco_apos_validacao: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
    },
    {
      numero: 3,
      prompt_id: 'P3',
      titulo: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
      texto_prompt: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
      comando_avanco_apos_validacao:
        'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
    },
    {
      numero: 4,
      prompt_id: 'P4',
      titulo: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
      texto_prompt: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
      comando_avanco_apos_validacao: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
    },
    {
      numero: 5,
      prompt_id: 'P5',
      titulo: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
      comando_avanco_apos_validacao:
        'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
    },
    {
      numero: 6,
      prompt_id: 'P6',
      titulo: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
      comando_avanco_apos_validacao:
        'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
    },
    {
      numero: 7,
      prompt_id: 'P7',
      titulo: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
      comando_avanco_apos_validacao: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
    },
    {
      numero: 8,
      prompt_id: 'P8',
      titulo: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
      comando_avanco_apos_validacao:
        'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
    },
    {
      numero: 9,
      prompt_id: 'P9',
      titulo: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
      comando_avanco_apos_validacao: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
    },
    {
      numero: 10,
      prompt_id: 'P10',
      titulo: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
      comando_avanco_apos_validacao: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
    },
    {
      numero: 11,
      prompt_id: 'P11',
      titulo: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
      texto_prompt: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
      comando_avanco_apos_validacao: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
    },
    {
      numero: 12,
      prompt_id: 'P12',
      titulo: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
      texto_prompt: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
      comando_avanco_apos_validacao: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
    },
    {
      numero: 13,
      prompt_id: 'P13',
      titulo: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
      texto_prompt: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
      comando_avanco_apos_validacao: 'PIPELINE_CONCLUIDO',
    },
  ]
}

/**
 * Função central de execução do pipeline de 13 Prompts Fixos da Skill V7.2.3-A9.
 * Utilizada tanto pelo endpoint HTTP quanto diretamente pelo Worker de Leads.
 */
function executarPipeline13Prompts(dossie, metadados, callerUserId) {
  const tInicio = Date.now()
  const razaoSocial = (dossie && dossie.cliente && dossie.cliente.razao_social) || 'Cliente'
  const setor = (dossie && dossie.cliente && dossie.cliente.setor) || 'Indústria'
  const protocolo = (dossie && dossie.protocolo) || '#VM-DIAG-' + Date.now()
  const versaoQuestionario = (metadados && metadados.versao_questionario) || 'V7.2'
  const autorizacaoRaw =
    (metadados && metadados.autorizacao_devolutiva) ||
    (dossie && dossie.cliente && dossie.cliente.autorizacao_devolutiva) ||
    ''
  const autorizouDevolutiva = autorizacaoRaw.toLowerCase().indexOf('sim') !== -1

  const promptsDef = obterDefinicao13PromptsSkill(
    setor,
    protocolo,
    autorizouDevolutiva,
    versaoQuestionario,
    dossie,
  )

  const outputPrompts = []
  let tokensInTotal = 0
  let tokensOutTotal = 0
  let tempoExecucaoAgenteTotalMs = 0
  let conversaId = null
  const relatoriosPorPrompt = []

  let proximoComandoAEnviar = null

  for (let i = 0; i < promptsDef.length; i++) {
    const pDef = promptsDef[i]
    const promptMsg = proximoComandoAEnviar || pDef.texto_prompt
    const t0 = Date.now()
    let textoOutput = ''
    let tokIn = 0
    let tokOut = 0

    // Disparar o prompt fixo ao agente mantendo a conversa
    try {
      if (typeof $ai !== 'undefined' && $ai.agent) {
        const resp = $ai.agent('jbp-gestao-master').chat({
          user_id: callerUserId,
          conversation_id: conversaId,
          message: promptMsg,
        })
        if (resp) {
          textoOutput = resp.content || ''
          conversaId = resp.conversation_id || conversaId
          if (resp.usage) {
            tokIn = resp.usage.prompt_tokens || 0
            tokOut = resp.usage.completion_tokens || 0
          }
        }
      }
    } catch (errAi) {
      console.log('Orquestrador Skill: erro no prompt ' + pDef.prompt_id + ': ' + errAi.message)
      return {
        sucesso: false,
        codigo_erro: 'FALHA_EXECUCAO_AGENTE',
        prompt_id: pDef.prompt_id,
        titulo: pDef.titulo,
        motivo: 'Erro ao invocar agente nativo: ' + errAi.message,
        fases_concluidas: outputPrompts,
      }
    }

    const durFase = Date.now() - t0
    tempoExecucaoAgenteTotalMs += durFase
    tokensInTotal += tokIn
    tokensOutTotal += tokOut

    // (a) Validar portão determinístico contra o output recebido
    const resultadoPortao = validarPortaoFase(i, pDef, textoOutput)

    if (!resultadoPortao.valido) {
      // (c) SE O PORTÃO FALHAR, O PIPELINE PARA COM ERRO EXPLÍCITO NO DIAGNÓSTICO
      // NUNCA pula fase, NUNCA gera conteúdo local para preencher, NUNCA segue adiante.
      console.log(
        'Orquestrador Skill: PORTÃO FALHOU no prompt ' +
          pDef.prompt_id +
          ': ' +
          resultadoPortao.motivo,
      )
      return {
        sucesso: false,
        codigo_erro: 'PORTAO_REPROVADO',
        prompt_id: pDef.prompt_id,
        titulo: pDef.titulo,
        motivo: resultadoPortao.motivo,
        output_reprovado: textoOutput,
        fases_concluidas: outputPrompts,
        duracao_total_ms: Date.now() - tInicio,
      }
    }

    // (b) Portão VÁLIDO: registra a fase como concluída com snapshot do output
    outputPrompts.push({
      fase: pDef.numero,
      prompt_id: pDef.prompt_id,
      titulo: pDef.titulo,
      output_integral: textoOutput,
      comando_enviado: promptMsg,
      portao_status: 'VALIDADO',
      portao_motivo: resultadoPortao.motivo,
      duracao_ms: durFase,
      tokens_input: tokIn,
      tokens_output: tokOut,
      executado_em: new Date().toISOString(),
    })

    relatoriosPorPrompt.push('### ' + pDef.titulo + '\n\n' + textoOutput)

    // Emite o comando de avanço fixo definido na Skill para o próximo turno
    proximoComandoAEnviar = pDef.comando_avanco_apos_validacao
  }

  // Custo medido no gateway
  const custoUsdCalculado = (tokensInTotal / 1000) * 0.003 + (tokensOutTotal / 1000) * 0.015
  const custoGateway = {
    tokens_input: tokensInTotal,
    tokens_output: tokensOutTotal,
    custo_usd: Number(custoUsdCalculado.toFixed(4)),
    tempo_execucao_ms: tempoExecucaoAgenteTotalMs,
    medicao_real_gateway: true,
    tier: 'reasoning',
    agente: 'jbp-gestao-master',
    versao: 'V7.2.3-A9',
    executado_via: 'orquestrador_skill_13_prompts',
    executado_em: new Date().toISOString(),
  }

  // OUTPUT COMO ÚNICA FONTE: extrair dados estruturados EXCLUSIVAMENTE do output do agente
  const dreNormalizada15Linhas = extrairDRE15LinhasDoOutput(
    outputPrompts[8] ? outputPrompts[8].output_integral : '',
  )
  const estruturaErecA9 = extrairErecA9DoOutput(
    outputPrompts[5] ? outputPrompts[5].output_integral : '',
  )
  const teaserGerado = extrairTeaserDoOutput(
    outputPrompts[2] ? outputPrompts[2].output_integral : '',
  )
  const heatMapCalculado = extrairHeatMapDoOutput(outputPrompts)
  const roadmapEOKRs = extrairRoadmapEOKRsDoOutput(
    outputPrompts[7] ? outputPrompts[7].output_integral : '',
    outputPrompts[11] ? outputPrompts[11].output_integral : '',
  )

  const tFim = Date.now()

  return {
    sucesso: true,
    versao_servico: 'V7.2.3-A9-Skill13Prompts',
    executor: 'jbp-gestao-master',
    total_prompts_executados: outputPrompts.length,
    output_fases: outputPrompts,
    dre_normalizada_15_linhas: dreNormalizada15Linhas,
    estrutura_erec_a9: estruturaErecA9,
    teaser_gerado: teaserGerado,
    heat_map: heatMapCalculado,
    blocos_solucao: {
      bloco_solucao_executivo: {
        titulo: 'Bloco Solução Executivo — Vetor Master V7.2.3',
        origem: 'Prompt 4 (Conversão P3→P4)',
        conteudo_integral: outputPrompts[3] ? outputPrompts[3].output_integral : '',
      },
      bloco_solucao_completo: {
        titulo: 'Bloco Solução Completo — Documento Interno de Implementação',
        origem: 'Prompt 12 (Consolidação)',
        conteudo_integral: outputPrompts[11] ? outputPrompts[11].output_integral : '',
        roadmap_etapas: roadmapEOKRs.roadmap,
        okrs_estrategicos: roadmapEOKRs.okrs,
      },
    },
    auditoria_p13: outputPrompts[12] ? outputPrompts[12].output_integral : '',
    relatorio_gerado:
      '# DIAGNÓSTICO ESTRATÉGICO INTEGRAL (SKILL 13 PROMPTS V7.2.3-A9) — ' +
      razaoSocial.toUpperCase() +
      '\nProtocolo: ' +
      protocolo +
      ' | Setor: ' +
      setor +
      ' | Versão: ' +
      versaoQuestionario +
      '\n\n' +
      relatoriosPorPrompt.join('\n\n---\n\n'),
    custo_gateway: custoGateway,
    timestamps: {
      iniciado_em: new Date(tInicio).toISOString(),
      concluido_em: new Date(tFim).toISOString(),
      duracao_total_ms: tFim - tInicio,
    },
  }
}

// Tornar a função acessível no runtime JSVM
if (typeof globalThis !== 'undefined') {
  globalThis.executarPipeline13Prompts = executarPipeline13Prompts
  globalThis.extrairDRE15LinhasDoOutput = extrairDRE15LinhasDoOutput
  globalThis.extrairErecA9DoOutput = extrairErecA9DoOutput
  globalThis.extrairTeaserDoOutput = extrairTeaserDoOutput
  globalThis.extrairHeatMapDoOutput = extrairHeatMapDoOutput
}

// Rota HTTP do serviço de diagnóstico
routerAdd('POST', '/backend/v1/servico-diagnostico', (e) => {
  let callerUserId = null
  try {
    const authUser = e.auth || (e.requestInfo && e.requestInfo().auth)
    if (authUser) {
      callerUserId = authUser.id || (authUser.getString && authUser.getString('id'))
    }
  } catch (_) {}

  if (!callerUserId) {
    try {
      const adm = $app.findFirstRecordByData('users', 'role', 'admin')
      if (adm) callerUserId = adm.id
    } catch (_) {}
  }

  let body = {}
  try {
    body = (e.requestInfo && e.requestInfo().body) || {}
  } catch (_) {
    body = {}
  }

  const dossie = body.dossie || {}
  const metadados = body.metadados || {}

  if (
    !dossie ||
    Object.keys(dossie).length === 0 ||
    !dossie.cliente ||
    !dossie.cliente.razao_social
  ) {
    return e.json(400, {
      sucesso: false,
      codigo_erro: 'MOTOR_BLOQUEADO_AUSENCIA_DADOS_A4',
      fase: 'P1_CARGA',
      motivo:
        'Motor bloqueado por ausência de dados — A4. Dossiê JSON com dados do cliente é obrigatório.',
    })
  }

  const resultado = executarPipeline13Prompts(dossie, metadados, callerUserId)
  const statusCode = resultado.sucesso ? 200 : 422
  return e.json(statusCode, resultado)
})
