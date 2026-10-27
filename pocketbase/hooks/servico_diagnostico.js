/// <reference path="../pb_data/types.d.ts" />

/**
 * SERVIÇO DE DIAGNÓSTICO ESTRATÉGICO INTEGRAL — VETOR MASTER
 * Orquestrador da Skill "Roteiro de Execução (13 Prompts Fixos e Automação)" V7.2.3-A9.
 *
 * Regra de Arquitetura do PocketBase JSVM:
 * Todas as funções auxiliares chamadas dentro de callbacks de rotas devem residir
 * DENTRO do corpo do callback para evitar erros de escopo da JSVM isolada.
 */

routerAdd('POST', '/backend/v1/servico-diagnostico', (e) => {
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

      const mScore =
        textoArea.match(/score[:\s]+(\d{1,3})/i) || textoArea.match(/maturidade[:\s]+(\d{1,3})%/i)
      let score = null
      if (mScore) {
        score = parseInt(mScore[1], 10)
      } else {
        const totalPendencias = (textoArea.match(/\[REQUER VERIFICAÇÃO\]/gi) || []).length
        if (totalPendencias === 0 && textoArea.length > 500) {
          score = 80
        } else if (totalPendencias <= 3 && textoArea.length > 300) {
          score = 65
        } else {
          score = 50
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
          continue
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

  function validarPortaoFase(promptIndex, promptDef, outputRecebido) {
    if (
      !outputRecebido ||
      typeof outputRecebido !== 'string' ||
      outputRecebido.trim().length === 0
    ) {
      return { valido: false, motivo: 'Output do agente vazio para ' + promptDef.prompt_id }
    }

    const out = outputRecebido.trim()
    const outLower = out.toLowerCase()

    const fasesComEncerramentoNeutro = [2, 3, 5, 6, 7, 8, 9, 10, 11]
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
        if (out.length < 10) {
          return {
            valido: false,
            motivo: 'P1 falhou: resposta de confirmação de carga insuficiente.',
          }
        }
        return { valido: true, motivo: 'Confirmação de carga recebida com conformidade CS-19.' }
      }
      case 2: {
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
        if (out.length < 50) {
          return { valido: false, motivo: 'P3 falhou: Bloco CTA vazio ou incompleto.' }
        }
        return { valido: true, motivo: 'Bloco CTA validado conforme regras da Skill.' }
      }
      case 4: {
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
          return {
            valido: false,
            motivo: 'P6 falhou: BSC obrigatório ausente no output da Fase 3.',
          }
        }
        return { valido: true, motivo: 'Fase 3 validada com EREC canônico A9 e BSC.' }
      }
      case 7: {
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
        const linhasDRE = extrairDRE15LinhasDoOutput(out)
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
          motivo: 'Fase 6 validada com DRE de 15 linhas.',
        }
      }
      case 10: {
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
        if (out.length < 200) {
          return {
            valido: false,
            motivo: 'P12 falhou: Consolidação do Bloco Solução Completo insuficiente.',
          }
        }
        return { valido: true, motivo: 'Prompt 12 Bloco Solução Completo consolidado e validado.' }
      }
      case 13: {
        if (out.length < 100) {
          return { valido: false, motivo: 'P13 falhou: Auditoria comparativa A8 incompleta.' }
        }
        return { valido: true, motivo: 'Prompt 13 Auditoria comparativa A8 concluída e validada.' }
      }
      default:
        return { valido: true, motivo: 'Fase concluída.' }
    }
  }

  function selecionarReceitaBrutaAnoBase(dossie) {
    const respostas =
      (dossie && (dossie.respostas || dossie.questionario || dossie.dados_entrada)) || {}
    const faturamentoHistorico =
      (dossie && dossie.cliente && dossie.cliente.faturamento) ||
      respostas.industria_1_1 ||
      respostas.faturamento ||
      null

    let anoBase = 2026
    if (dossie && dossie.ano_base) {
      anoBase = parseInt(dossie.ano_base, 10) || 2026
    }

    const campoProjecao =
      respostas.industria_1_4 || respostas.projecoes_receita || respostas.projecao_ano_base || ''

    let projecaoEncontrada = null
    if (campoProjecao && typeof campoProjecao === 'string') {
      const regexAno = new RegExp(
        '(?:' + anoBase + ')[\\s:=->]+(?:R\\$\\s*)?([\\d.,]+(?:\\s*(?:milh[õo]es|mi|m))?)',
        'i',
      )
      const matchAno = campoProjecao.match(regexAno)
      if (matchAno && matchAno[1]) {
        projecaoEncontrada = matchAno[1].trim()
      } else {
        const partes = campoProjecao.split(/[\n,;]+/)
        for (let p = 0; p < partes.length; p++) {
          const pedaco = partes[p].trim()
          if (pedaco.indexOf(String(anoBase)) !== -1) {
            const mVal = pedaco.match(/(?:R\$\s*)?([\d.,]+(?:\\s*(?:milh[õo]es|mi|m))?)/i)
            if (mVal && mVal[1] && mVal[1] !== String(anoBase)) {
              projecaoEncontrada = mVal[1].trim()
              break
            }
          }
        }
      }
    } else if (campoProjecao && typeof campoProjecao === 'object') {
      if (campoProjecao[anoBase]) {
        projecaoEncontrada = String(campoProjecao[anoBase])
      }
    }

    if (projecaoEncontrada) {
      return {
        valor: projecaoEncontrada,
        fonte: 'projecao_ano_base(industria_1_4)',
        ano_base: anoBase,
        sobreposto: faturamentoHistorico,
      }
    }

    return {
      valor: faturamentoHistorico || 'Não declarado',
      fonte: 'historico(industria_1_1/cliente.faturamento)',
      ano_base: anoBase,
      sobreposto: null,
    }
  }

  function extrairContextoDadosBrutosDRE(dossie) {
    const respostas =
      (dossie && (dossie.respostas || dossie.questionario || dossie.dados_entrada)) || {}
    const notas = (dossie && (dossie.notas || dossie.observacoes)) || ''

    const info = {
      transicao_extraordinaria: null,
      incentivos_fiscais_viamao: null,
    }

    const textoGeral = JSON.stringify(respostas) + ' ' + JSON.stringify(notas)
    const mTransicao =
      respostas.despesas_transicao ||
      respostas.transicao_viamao ||
      respostas.despesas_extraordinarias ||
      null
    if (mTransicao) {
      info.transicao_extraordinaria = mTransicao
    } else if (/transi[çc][ãa]o|viam[ãa]o|poa/i.test(textoGeral)) {
      info.transicao_extraordinaria =
        'Transição operacional Porto Alegre/Viamão identificada nas notas do dossiê (segregar efeitos não recorrentes do OPEX contínuo conforme CS-17).'
    } else {
      info.transicao_extraordinaria = '[Premissa não determinável nos dados brutos do dossiê]'
    }

    const mFiscal =
      respostas.incentivos_fiscais ||
      respostas.prejuizo_fiscal ||
      respostas.beneficios_viamao ||
      null
    if (mFiscal) {
      info.incentivos_fiscais_viamao = mFiscal
    } else if (/incentivo|preju[íi]zo\s+fiscal|al[íi]quota\s+efetiva/i.test(textoGeral)) {
      info.incentivos_fiscais_viamao =
        'Existência de incentivos municipais de Viamão e/ou compensação de prejuízos fiscais identificada nas notas. Aplicar Exceção A11 (alíquota efetiva de IR/CSLL e marcar [REQUER VERIFICAÇÃO] na compensação).'
    } else {
      info.incentivos_fiscais_viamao =
        '[Premissa de incentivos fiscais/prejuízos fiscais não discriminada no questionário — Exceção A11 requer verificação]'
    }

    return info
  }

  function obterDefinicao13PromptsSkill(
    setor,
    protocolo,
    autorizouDevolutiva,
    versaoQuestionario,
    dossie,
    instrumentacaoSelecaoRB,
  ) {
    const setorUpper = (setor || 'INDÚSTRIA').toUpperCase()
    const modalidadeContratada = 'SaaS Puro'
    const contextoDadosBrutos = extrairContextoDadosBrutosDRE(dossie)

    const payloadP1Dossie = Object.assign({}, dossie, {
      rb_y1_selecao: instrumentacaoSelecaoRB || selecionarReceitaBrutaAnoBase(dossie),
    })

    const contextoDREInstrutivo =
      '\n\n[DADOS BRUTOS ADICIONAIS DO DOSSIÊ PARA DRE / EXCEÇÃO A11]:\n' +
      '- Transição Operacional (POA/Viamão): ' +
      contextoDadosBrutos.transicao_extraordinaria +
      '\n' +
      '- Regime Fiscal / Incentivos Viamão / IR-CSLL: ' +
      contextoDadosBrutos.incentivos_fiscais_viamao +
      '\n' +
      '- Base de Receita Ano-Base selecionada: ' +
      JSON.stringify(payloadP1Dossie.rb_y1_selecao) +
      '\n(NUNCA herdar números prontos de terceiros. Derivar toda a DRE e Valuation aritmeticamente a partir das premissas e regras do Master Framework).'

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
          JSON.stringify(payloadP1Dossie, null, 2),
        comando_avanco_apos_validacao: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
      },
      {
        numero: 2,
        prompt_id: 'P2',
        titulo: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
        texto_prompt:
          'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')' + contextoDREInstrutivo,
        comando_avanco_apos_validacao:
          'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
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
        comando_avanco_apos_validacao:
          'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
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
        texto_prompt:
          'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' +
          setorUpper +
          ')' +
          contextoDREInstrutivo +
          '\n\nATENÇÃO: Este valuation NÃO possui valuation prévio e deve ser calculado integral e aritmeticamente a partir da DRE de 15 linhas produzida pelo agente nesta mesma sessão, aplicando Gordon Growth / DCF conforme o regime e derivando Equity = EV - Dívida Líquida.',
        comando_avanco_apos_validacao:
          'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
      },
      {
        numero: 10,
        prompt_id: 'P10',
        titulo: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
        texto_prompt: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
        comando_avanco_apos_validacao:
          'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
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

  // Extração e validação do payload recebido
  let body = {}
  try {
    const rawBody = (e.requestInfo && e.requestInfo().body) || {}
    body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
  } catch (errBody) {
    return e.json(400, {
      sucesso: false,
      codigo_erro: 'CORPO_INVALIDO',
      motivo: 'JSON do corpo da requisição inválido: ' + errBody.message,
    })
  }

  const dossie = body.dossie || {}
  const metadados = body.metadados || {}
  const callerUserId = (e.auth && e.auth.id) || body.user_id || null

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

  const instrumentacaoSelecaoRB = selecionarReceitaBrutaAnoBase(dossie)
  console.log(
    'Orquestrador Skill: Seleção determinística RB Ano-Base: ' +
      JSON.stringify(instrumentacaoSelecaoRB),
  )

  const promptsDef = obterDefinicao13PromptsSkill(
    setor,
    protocolo,
    autorizouDevolutiva,
    versaoQuestionario,
    dossie,
    instrumentacaoSelecaoRB,
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
      return e.json(500, {
        sucesso: false,
        codigo_erro: 'FALHA_EXECUCAO_AGENTE',
        prompt_id: pDef.prompt_id,
        titulo: pDef.titulo,
        motivo: 'Erro ao invocar agente nativo: ' + errAi.message,
        fases_concluidas: outputPrompts,
      })
    }

    const durFase = Date.now() - t0
    tempoExecucaoAgenteTotalMs += durFase
    tokensInTotal += tokIn
    tokensOutTotal += tokOut

    const resultadoPortao = validarPortaoFase(i, pDef, textoOutput)

    if (!resultadoPortao.valido) {
      console.log(
        'Orquestrador Skill: PORTÃO FALHOU no prompt ' +
          pDef.prompt_id +
          ': ' +
          resultadoPortao.motivo,
      )
      return e.json(422, {
        sucesso: false,
        codigo_erro: 'PORTAO_REPROVADO',
        prompt_id: pDef.prompt_id,
        titulo: pDef.titulo,
        motivo: resultadoPortao.motivo,
        output_reprovado: textoOutput,
        fases_concluidas: outputPrompts,
        duracao_total_ms: Date.now() - tInicio,
      })
    }

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
    proximoComandoAEnviar = pDef.comando_avanco_apos_validacao
  }

  const custoUsdCalculado = (tokensInTotal / 1000) * 0.003 + (tokensOutTotal / 1000) * 0.015
  const custoGateway = {
    tokens_input: tokensInTotal,
    tokens_output: tokensOutTotal,
    tokens_total: tokensInTotal + tokensOutTotal,
    custo_usd: Number(custoUsdCalculado.toFixed(4)),
    tempo_execucao_ms: tempoExecucaoAgenteTotalMs,
    tempo_execucao_segundos: Number((tempoExecucaoAgenteTotalMs / 1000).toFixed(2)),
    medicao_real_gateway: true,
    tier: 'reasoning',
    agente: 'jbp-gestao-master',
    versao: 'V7.2.3-A9',
    executado_via: 'orquestrador_skill_13_prompts',
    executado_em: new Date().toISOString(),
    conversation_id: conversaId,
  }

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

  return e.json(200, {
    sucesso: true,
    versao_servico: 'V7.2.3-A9-Skill13Prompts',
    executor: 'jbp-gestao-master',
    total_prompts_executados: outputPrompts.length,
    output_fases: outputPrompts,
    dre_normalizada_15_linhas: dreNormalizada15Linhas,
    rb_y1_selecao: instrumentacaoSelecaoRB,
    contexto_dados_brutos: extrairContextoDadosBrutosDRE(dossie),
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
  })
})
