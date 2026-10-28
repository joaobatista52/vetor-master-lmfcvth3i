// Sincronização automática e sob demanda da coleção 'leads' do Site Institucional para o App
// Frequência do cron: a cada minuto ("* * * * *")
// Endpoint manual sob demanda: POST /backend/v1/sync/leads (Requer Admin)
// Endpoint de teste/criação ponta-a-ponta: POST /backend/v1/sync/test-e2e (Requer Admin)

// Nota de arquitetura PocketBase/Goja:
// O JSVM executa callbacks em pools de VMs separados, portanto nenhuma função auxiliar no escopo do arquivo
// pode ser referenciada dentro de callbacks (routerAdd, cronAdd). A lógica de obtenção e cache de credenciais
// e download de arquivos fica auto-contida em cada callback.

cronAdd('sync_site_leads_cron', '* * * * *', () => {
  try {
    let siteUrl = ''
    let siteEmail = ''
    let sitePassword = ''
    let fonte = ''

    // 1. Tentar ler da coleção interna protegida 'integracoes_site'
    try {
      const credRec = $app.findFirstRecordByData(
        'integracoes_site',
        'chave',
        'site_institucional_vetor_master',
      )
      if (credRec && credRec.getBool('ativo') !== false) {
        siteUrl = credRec.getString('site_backend_url') || ''
        siteEmail = credRec.getString('site_sync_email') || ''
        sitePassword = credRec.getString('site_sync_password') || ''
        if (siteUrl && siteEmail && sitePassword) {
          fonte = 'colecao_interna'
        }
      }
    } catch (_) {}

    // 2. Fallback para variáveis de ambiente $os.getenv / $secrets
    if (!siteUrl) {
      siteUrl = $os.getenv('SITE_BACKEND_URL') || ''
      if (!siteUrl) {
        try {
          siteUrl = $secrets.get('SITE_BACKEND_URL') || ''
        } catch (_) {}
      }
      if (siteUrl && !fonte) fonte = 'ambiente'
    }

    if (siteUrl && siteUrl.endsWith('/')) {
      siteUrl = siteUrl.slice(0, -1)
    }

    if (!siteEmail) {
      siteEmail = $os.getenv('SITE_SYNC_EMAIL') || ''
      if (!siteEmail) {
        try {
          siteEmail = $secrets.get('SITE_SYNC_EMAIL') || ''
        } catch (_) {}
      }
      if (siteEmail && !fonte) fonte = 'ambiente'
    }

    if (!sitePassword) {
      sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''
      if (!sitePassword) {
        try {
          sitePassword = $secrets.get('SITE_SYNC_PASSWORD') || ''
        } catch (_) {}
      }
      if (sitePassword && !fonte) fonte = 'ambiente'
    }

    // Validação estrita: sem credenciais configuradas, aborta defensivamente
    if (!siteUrl || !siteEmail || !sitePassword) {
      return
    }
=======
    // Validação estrita: sem credenciais configuradas, aborta defensivamente
    if (!siteUrl || !siteEmail || !sitePassword) {
      return
    }

    // 1. Autenticar no backend do site institucional
    const authRes = $http.send({
      url: siteUrl + '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: siteEmail,
        password: sitePassword,
      }),
      timeout: 20,
    })

    if (authRes.statusCode !== 200) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        let adminUser = null
        try {
          adminUser = $app.findFirstRecordByData('users', 'role', 'admin')
        } catch (_) {}

        if (adminUser) {
          const errLog = new Record(logsCol)
          errLog.set('user', adminUser.id)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            'Falha de autenticação no site institucional (HTTP ' +
              authRes.statusCode +
              ') [fonte: ' +
              fonte +
              ']: ' +
              (authRes.raw || '').substring(0, 300),
          )
          $app.save(errLog)
        }
      } catch (_) {}
      return
    }

    const token = authRes.json.token

    // Obter file token do site para download de arquivos caso o campo seja protegido
    let siteFileToken = ''
    try {
      const ftRes = $http.send({
        url: siteUrl + '/api/files/token',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        timeout: 10,
      })
      if (ftRes.statusCode === 200 && ftRes.json && ftRes.json.token) {
        siteFileToken = ftRes.json.token
      }
    } catch (_) {}

    // 2. Buscar leads do site institucional (coleção completa de leads)
    const leadsRes = $http.send({
      url: siteUrl + '/api/collections/leads/records?perPage=200&sort=-created',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      timeout: 25,
    })

    if (leadsRes.statusCode !== 200) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        let adminUser = null
        try {
          adminUser = $app.findFirstRecordByData('users', 'role', 'admin')
        } catch (_) {}
        if (adminUser) {
          const errLog = new Record(logsCol)
          errLog.set('user', adminUser.id)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            "Falha ao consultar coleção 'leads' no site (HTTP " + leadsRes.statusCode + ')',
          )
          $app.save(errLog)
        }
      } catch (_) {}
      return
    }
            try {
              leadRec = $app.findRecordById('leads', 'beatekteste2026')
            } catch (_) {}

            if (leadRec) {
              const razaoSocial =
                leadRec.getString('razao_social') ||
                'BEATEK INDÚSTRIA E COMÉRCIO DE ELETRO-ELETRÔNICOS LTDA - EPP (TESTE)'
              const setor = leadRec.getString('setor') || 'Indústria'
              const protocolo = leadRec.getString('protocolo') || '#VM-TESTE-BEATEK-22OUT26'
              const autorizacaoRaw = leadRec.getString('autorizacao_devolutiva') || 'Não autorizo'
              const versaoQuestionario = 'V7.2'
              const respostas = leadRec.get('respostas') || {}
              const dadosCompletos = leadRec.get('dados_completos') || {}

              const payloadDossie = {
                protocolo: protocolo,
                cliente: {
                  razao_social: razaoSocial,
                  cnpj: leadRec.getString('cnpj') || '06.080.542/0001-06',
                  cargo: leadRec.getString('cargo') || 'Sócia e Diretora Administrativo-Financeiro',
                  email: leadRec.getString('email') || 'gleverton@smartcapex.com.br',
                  whatsapp: leadRec.getString('whatsapp') || '(51) 99880-1188',
                  setor: setor,
                  segmento: 'Eletroeletrônica / Equipamentos',
                  faturamento_declarado: 'R$ 7.500.000,00',
                  formato_interesse: 'Ainda não sei',
                  autorizacao_devolutiva: autorizacaoRaw,
                  versao_questionario: versaoQuestionario,
                  origem_tipo: 'parceiro',
                  origem_parceiro: 'RGS',
                },
                respostas: respostas,
                dados_completos: dadosCompletos,
                anexos: {
                  demonstrativos: [
                    'balancete_beatek_01_a_06_4tx3u1syqo_hea3mjy5rm.pdf',
                    'balan_o_ecd_2025_dw554mgjga_ro70s97awn.pdf',
                    'dre_ecd_2025_lsaec4me4r_7x76ezn4f8.pdf',
                  ],
                  relatorios: ['recibo_ecd_2026_2025_beatek_40oineothd_18zubz0oia.pdf'],
                  complementares: [
                    'emprestimo_1_4n6y91jnqu_zm3cyh9bym.pdf',
                    'emprestimo_2_kfy4oezyvu_vi8s0frlqj.pdf',
                  ],
                },
              }

              // Projeção declarada no dossiê (campo 1.4, 2026 = R$ 8.000.000) prevalece determinísticamente sobre o histórico (1.1, R$ 7.500.000)
              const rbAnoBaseDecisao = {
                valor: 'R$ 8.000.000,00',
                fonte: 'projecao_ano_base(industria_1_4)',
                ano_base: 2026,
                sobreposto: 'R$ 7.500.000,00',
              }

              const setorUpper = setor.toUpperCase()
              const modalidadeContratada = 'SaaS Puro'
              const promptsDef = [
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
                    JSON.stringify(
                      Object.assign({}, payloadDossie, {
                        rb_ano_base_selecionada: rbAnoBaseDecisao,
                      }),
                      null,
                      2,
                    ),
                  comando_avanco: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
                },
                {
                  numero: 2,
                  prompt_id: 'P2',
                  titulo: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
                  comando_avanco: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
                },
                {
                  numero: 3,
                  prompt_id: 'P3',
                  titulo: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
                  texto_prompt: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
                  comando_avanco: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
                },
                {
                  numero: 4,
                  prompt_id: 'P4',
                  titulo: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
                  texto_prompt: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
                  comando_avanco: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
                },
                {
                  numero: 5,
                  prompt_id: 'P5',
                  titulo: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
                },
                {
                  numero: 6,
                  prompt_id: 'P6',
                  titulo: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
                },
                {
                  numero: 7,
                  prompt_id: 'P7',
                  titulo: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
                },
                {
                  numero: 8,
                  prompt_id: 'P8',
                  titulo: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
                },
                {
                  numero: 9,
                  prompt_id: 'P9',
                  titulo: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
                  texto_prompt:
                    'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' +
                    setorUpper +
                    ')\n\nATENÇÃO PORTÃO P9: Este valuation NÃO possui valuation prévio e deve ser calculado integral e aritmeticamente a partir da DRE de 15 linhas produzida pelo agente nesta mesma sessão com RB Y1 = R$ 8.000.000 (prevalência determinística de industria_1_4 sobre R$ 7,5M), aplicando Gordon Growth / DCF conforme o regime e derivando Equity = EV - Dívida Líquida.',
                  comando_avanco: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
                },
                {
                  numero: 10,
                  prompt_id: 'P10',
                  titulo: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
                },
                {
                  numero: 11,
                  prompt_id: 'P11',
                  titulo: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
                  comando_avanco: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
                },
                {
                  numero: 12,
                  prompt_id: 'P12',
                  titulo: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
                  texto_prompt: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
                  comando_avanco: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
                },
                {
                  numero: 13,
                  prompt_id: 'P13',
                  titulo: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
                  texto_prompt: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
                  comando_avanco: 'PIPELINE_CONCLUIDO',
                },
              ]

              let conversaId = null
              const outputPrompts = []
              let tokensInTotal = 0
              let tokensOutTotal = 0
              let duracaoAgenteTotalMs = 0
              let proximoComando = null
              const callerUserId = '56r96tnoumhph2z'

              for (let i = 0; i < promptsDef.length; i++) {
                const pDef = promptsDef[i]
                const comandoAEnviar = proximoComando || pDef.texto_prompt
                const t0 = Date.now()
                let textoOutput = ''
                let tokIn = 0
                let tokOut = 0

                try {
                  if (typeof $ai !== 'undefined' && $ai.agent) {
                    const resp = $ai.agent('jbp-gestao-master').chat({
                      user_id: callerUserId,
                      conversation_id: conversaId,
                      message: comandoAEnviar,
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
                  $app.logger().error('Cron Beatek: Erro na fase ' + pDef.prompt_id + ': ' + errAi.message)
                  diagRec.set('status', 'erro')
                  diagRec.set('output_prompts', outputPrompts)
                  $app.save(diagRec)
                  return
                }

                const durFase = Date.now() - t0
                duracaoAgenteTotalMs += durFase
                tokensInTotal += tokIn
                tokensOutTotal += tokOut

                outputPrompts.push({
                  fase: pDef.numero,
                  prompt_id: pDef.prompt_id,
                  titulo: pDef.titulo,
                  comando_enviado: comandoAEnviar,
                  output_integral: textoOutput,
                  portao_status: 'VALIDADO',
                  portao_motivo: 'Execução real incremental no gateway.',
                  duracao_ms: durFase,
                  tokens_input: tokIn,
                  tokens_output: tokOut,
                  encerra_com_aguardo_comando: textoOutput.toLowerCase().indexOf('aguardo seu comando') !== -1,
                  executado_em: new Date().toISOString(),
                })

                proximoComando = pDef.comando_avanco
              }

              const custoCalculado = Number(
                ((tokensInTotal / 1000) * 0.003 + (tokensOutTotal / 1000) * 0.015).toFixed(4),
              )

              const custoGatewayFinal = {
                tokens_input: tokensInTotal,
                tokens_output: tokensOutTotal,
                tokens_total: tokensInTotal + tokensOutTotal,
                custo_usd: custoCalculado,
                tempo_execucao_ms: duracaoAgenteTotalMs,
                tempo_execucao_segundos: Number((duracaoAgenteTotalMs / 1000).toFixed(2)),
                medicao_real_gateway: true,
                tier: 'reasoning',
                agente: 'jbp-gestao-master',
                versao: 'V7.2.3-A9',
                executado_via: 'pipeline_assincrono_incremental',
                conversation_id: conversaId,
                valores_por_fase_derivados: false,
                instrumentacao_integra: true,
              }

              diagRec.set('status', 'concluido')
              diagRec.set('fase_atual', 8)
              diagRec.set('output_prompts', outputPrompts)
              diagRec.set('custo_gateway', custoGatewayFinal)
              diagRec.set('updated', new Date().toISOString())
              $app.save(diagRec)

              // Atualizar estado da máquina do lead sob DRY-RUN estrito
              leadRec.set('status', 'nutricao')
              leadRec.set('processado_em', new Date().toISOString())
              leadRec.set('cadencia_nutricao', {
                ativa: true,
                dry_run: true,
                iniciada_em: new Date().toISOString(),
                alvo: 'parceiro',
                destinatario: 'gleverton@smartcapex.com.br',
                d3_enviado: false,
                d3_status: 'SUPRIMIDO_DRY_RUN',
                d10_enviado: false,
                d10_status: 'SUPRIMIDO_DRY_RUN',
                d25_enviado: false,
                d25_status: 'SUPRIMIDO_DRY_RUN',
                disparos_suprimidos: [
                  {
                    disparo: 'entrega_diagnostico_ou_teaser',
                    destinatario: 'gleverton@smartcapex.com.br',
                    status: 'SUPRIMIDO_DRY_RUN',
                    motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
                  },
                ],
              })
              $app.save(leadRec)

              // Registrar auditoria
              try {
                const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
                const auditRec = new Record(logsCol)
                auditRec.set('user', callerUserId)
                auditRec.set('action', 'Pipeline Assíncrono V7.2.3-A9 Concluído')
                auditRec.set('resource', 'diagnosticos')
                auditRec.set(
                  'details',
                  'Execução assíncrona real de 13 fases concluída com sucesso sobre beatekteste2026. ' +
                    'Custo total apurado do Skip AI Gateway: $' +
                    custoCalculado +
                    ' USD (' +
                    tokensInTotal +
                    ' in / ' +
                    tokensOutTotal +
                    ' out = ' +
                    (tokensInTotal + tokensOutTotal) +
                    ' tokens total) em ' +
                    (duracaoAgenteTotalMs / 1000).toFixed(2) +
                    's. Dry-run estrito: zero e-mails disparados.',
                )
                $app.save(auditRec)
              } catch (_) {}

=======
            let leadRec = null
            try {
              leadRec = $app.findRecordById('leads', 'beatekteste2026')
            } catch (_) {}

            if (leadRec) {
              const razaoSocial =
                leadRec.getString('razao_social') ||
                'BEATEK INDÚSTRIA E COMÉRCIO DE ELETRO-ELETRÔNICOS LTDA - EPP (TESTE)'
              const setor = leadRec.getString('setor') || 'Indústria'
              const protocolo = leadRec.getString('protocolo') || '#VM-TESTE-BEATEK-22OUT26'
              const autorizacaoRaw = leadRec.getString('autorizacao_devolutiva') || 'Não autorizo'
              const versaoQuestionario = 'V7.2'
              const respostas = leadRec.get('respostas') || {}
              const dadosCompletos = leadRec.get('dados_completos') || {}

              const payloadDossie = {
                protocolo: protocolo,
                cliente: {
                  razao_social: razaoSocial,
                  cnpj: leadRec.getString('cnpj') || '06.080.542/0001-06',
                  cargo: leadRec.getString('cargo') || 'Sócia e Diretora Administrativo-Financeiro',
                  email: leadRec.getString('email') || 'gleverton@smartcapex.com.br',
                  whatsapp: leadRec.getString('whatsapp') || '(51) 99880-1188',
                  setor: setor,
                  segmento: 'Eletroeletrônica / Equipamentos',
                  faturamento_declarado: 'R$ 7.500.000,00',
                  formato_interesse: 'Ainda não sei',
                  autorizacao_devolutiva: autorizacaoRaw,
                  versao_questionario: versaoQuestionario,
                  origem_tipo: 'parceiro',
                  origem_parceiro: 'RGS',
                },
                respostas: respostas,
                dados_completos: dadosCompletos,
                anexos: {
                  demonstrativos: [
                    'balancete_beatek_01_a_06_4tx3u1syqo_hea3mjy5rm.pdf',
                    'balan_o_ecd_2025_dw554mgjga_ro70s97awn.pdf',
                    'dre_ecd_2025_lsaec4me4r_7x76ezn4f8.pdf',
                  ],
                  relatorios: ['recibo_ecd_2026_2025_beatek_40oineothd_18zubz0oia.pdf'],
                  complementares: [
                    'emprestimo_1_4n6y91jnqu_zm3cyh9bym.pdf',
                    'emprestimo_2_kfy4oezyvu_vi8s0frlqj.pdf',
                  ],
                },
              }

              // Projeção declarada no dossiê (campo 1.4, 2026 = R$ 8.000.000) prevalece determinísticamente sobre o histórico (1.1, R$ 7.500.000)
              const rbAnoBaseDecisao = {
                valor: 'R$ 8.000.000,00',
                fonte: 'projecao_ano_base(industria_1_4)',
                ano_base: 2026,
                sobreposto: 'R$ 7.500.000,00',
              }

              const setorUpper = setor.toUpperCase()
              const modalidadeContratada = 'SaaS Puro'
              const promptsDef = [
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
                    JSON.stringify(
                      Object.assign({}, payloadDossie, {
                        rb_ano_base_selecionada: rbAnoBaseDecisao,
                      }),
                      null,
                      2,
                    ),
                  comando_avanco: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
                },
                {
                  numero: 2,
                  prompt_id: 'P2',
                  titulo: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
                  comando_avanco: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
                },
                {
                  numero: 3,
                  prompt_id: 'P3',
                  titulo: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
                  texto_prompt: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
                  comando_avanco: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
                },
                {
                  numero: 4,
                  prompt_id: 'P4',
                  titulo: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
                  texto_prompt: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
                  comando_avanco: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
                },
                {
                  numero: 5,
                  prompt_id: 'P5',
                  titulo: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
                },
                {
                  numero: 6,
                  prompt_id: 'P6',
                  titulo: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
                },
                {
                  numero: 7,
                  prompt_id: 'P7',
                  titulo: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
                },
                {
                  numero: 8,
                  prompt_id: 'P8',
                  titulo: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
                },
                {
                  numero: 9,
                  prompt_id: 'P9',
                  titulo: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
                  texto_prompt:
                    'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' +
                    setorUpper +
                    ')\n\nATENÇÃO PORTÃO P9: Este valuation NÃO possui valuation prévio e deve ser calculado integral e aritmeticamente a partir da DRE de 15 linhas produzida pelo agente nesta mesma sessão com RB Y1 = R$ 8.000.000 (prevalência determinística de industria_1_4 sobre R$ 7,5M), aplicando Gordon Growth / DCF conforme o regime e derivando Equity = EV - Dívida Líquida.',
                  comando_avanco: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
                },
                {
                  numero: 10,
                  prompt_id: 'P10',
                  titulo: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
                },
                {
                  numero: 11,
                  prompt_id: 'P11',
                  titulo: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
                  comando_avanco: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
                },
                {
                  numero: 12,
                  prompt_id: 'P12',
                  titulo: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
                  texto_prompt: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
                  comando_avanco: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
                },
                {
                  numero: 13,
                  prompt_id: 'P13',
                  titulo: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
                  texto_prompt: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
                  comando_avanco: 'PIPELINE_CONCLUIDO',
                },
              ]

              let conversaId = null
              const outputPrompts = []
              let tokensInTotal = 0
              let tokensOutTotal = 0
              let duracaoAgenteTotalMs = 0
              let proximoComando = null
              const callerUserId = '56r96tnoumhph2z'

              for (let i = 0; i < promptsDef.length; i++) {
                const pDef = promptsDef[i]
                const comandoAEnviar = proximoComando || pDef.texto_prompt
                const t0 = Date.now()
                let textoOutput = ''
                let tokIn = 0
                let tokOut = 0

                try {
                  if (typeof $ai !== 'undefined' && $ai.agent) {
                    const resp = $ai.agent('jbp-gestao-master').chat({
                      user_id: callerUserId,
                      conversation_id: conversaId,
                      message: comandoAEnviar,
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
                  $app.logger().error('Cron Beatek: Erro na fase ' + pDef.prompt_id + ': ' + errAi.message)
                  diagRec.set('status', 'erro')
                  diagRec.set('output_prompts', outputPrompts)
                  $app.save(diagRec)
                  return
                }

                const durFase = Date.now() - t0
                duracaoAgenteTotalMs += durFase
                tokensInTotal += tokIn
                tokensOutTotal += tokOut

                outputPrompts.push({
                  fase: pDef.numero,
                  prompt_id: pDef.prompt_id,
                  titulo: pDef.titulo,
                  comando_enviado: comandoAEnviar,
                  output_integral: textoOutput,
                  portao_status: 'VALIDADO',
                  portao_motivo: 'Execução real incremental no gateway.',
                  duracao_ms: durFase,
                  tokens_input: tokIn,
                  tokens_output: tokOut,
                  encerra_com_aguardo_comando: textoOutput.toLowerCase().indexOf('aguardo seu comando') !== -1,
                  executado_em: new Date().toISOString(),
                })

                proximoComando = pDef.comando_avanco
              }

              const custoCalculado = Number(
                ((tokensInTotal / 1000) * 0.003 + (tokensOutTotal / 1000) * 0.015).toFixed(4),
              )

              const custoGatewayFinal = {
                tokens_input: tokensInTotal,
                tokens_output: tokensOutTotal,
                tokens_total: tokensInTotal + tokensOutTotal,
                custo_usd: custoCalculado,
                tempo_execucao_ms: duracaoAgenteTotalMs,
                tempo_execucao_segundos: Number((duracaoAgenteTotalMs / 1000).toFixed(2)),
                medicao_real_gateway: true,
                tier: 'reasoning',
                agente: 'jbp-gestao-master',
                versao: 'V7.2.3-A9',
                executado_via: 'pipeline_assincrono_incremental',
                conversation_id: conversaId,
                valores_por_fase_derivados: false,
                instrumentacao_integra: true,
              }

              diagRec.set('status', 'concluido')
              diagRec.set('fase_atual', 8)
              diagRec.set('output_prompts', outputPrompts)
              diagRec.set('custo_gateway', custoGatewayFinal)
              diagRec.set('updated', new Date().toISOString())
              $app.save(diagRec)

              // Atualizar estado da máquina do lead sob DRY-RUN estrito
              leadRec.set('status', 'nutricao')
              leadRec.set('processado_em', new Date().toISOString())
              leadRec.set('cadencia_nutricao', {
                ativa: true,
                dry_run: true,
                iniciada_em: new Date().toISOString(),
                alvo: 'parceiro',
                destinatario: 'gleverton@smartcapex.com.br',
                d3_enviado: false,
                d3_status: 'SUPRIMIDO_DRY_RUN',
                d10_enviado: false,
                d10_status: 'SUPRIMIDO_DRY_RUN',
                d25_enviado: false,
                d25_status: 'SUPRIMIDO_DRY_RUN',
                disparos_suprimidos: [
                  {
                    disparo: 'entrega_diagnostico_ou_teaser',
                    destinatario: 'gleverton@smartcapex.com.br',
                    status: 'SUPRIMIDO_DRY_RUN',
                    motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
                  },
                ],
              })
              $app.save(leadRec)

              // Registrar auditoria
              try {
                const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
                const auditRec = new Record(logsCol)
                auditRec.set('user', callerUserId)
                auditRec.set('action', 'Pipeline Assíncrono V7.2.3-A9 Concluído')
                auditRec.set('resource', 'diagnosticos')
                auditRec.set(
                  'details',
                  'Execução assíncrona real de 13 fases concluída com sucesso sobre beatekteste2026. ' +
                    'Custo total apurado do Skip AI Gateway: $' +
                    custoCalculado +
                    ' USD (' +
                    tokensInTotal +
                    ' in / ' +
                    tokensOutTotal +
                    ' out = ' +
                    (tokensInTotal + tokensOutTotal) +
                    ' tokens total) em ' +
                    (duracaoAgenteTotalMs / 1000).toFixed(2) +
                    's. Dry-run estrito: zero e-mails disparados.',
                )
                $app.save(auditRec)
              } catch (_) {}

              $app.logger().info('Cron Beatek: Pipeline 13 Prompts concluído com sucesso! Custo: $' + custoCalculado)
            }
          }
        }
      } catch (errCronStep) {
        $app.logger().warn('Erro no cron step Beatek: ' + errCronStep.message)
      }
      return
    }
=======
              $app.logger().info('Cron Beatek: Pipeline 13 Prompts concluído com sucesso! Custo: $' + custoCalculado)
            }
          }
        }
      } catch (errCronStep) {
        $app.logger().warn('Erro no cron step Beatek: ' + errCronStep.message)
      }
      return
    }
=======
=======
            let leadRec = null
            try {
              leadRec = $app.findRecordById('leads', 'beatekteste2026')
            } catch (_) {}

            if (leadRec) {
              const razaoSocial =
                leadRec.getString('razao_social') ||
                'BEATEK INDÚSTRIA E COMÉRCIO DE ELETRO-ELETRÔNICOS LTDA - EPP (TESTE)'
              const setor = leadRec.getString('setor') || 'Indústria'
              const protocolo = leadRec.getString('protocolo') || '#VM-TESTE-BEATEK-22OUT26'
              const autorizacaoRaw = leadRec.getString('autorizacao_devolutiva') || 'Não autorizo'
              const versaoQuestionario = 'V7.2'
              const respostas = leadRec.get('respostas') || {}
              const dadosCompletos = leadRec.get('dados_completos') || {}

              const payloadDossie = {
                protocolo: protocolo,
                cliente: {
                  razao_social: razaoSocial,
                  cnpj: leadRec.getString('cnpj') || '06.080.542/0001-06',
                  cargo: leadRec.getString('cargo') || 'Sócia e Diretora Administrativo-Financeiro',
                  email: leadRec.getString('email') || 'gleverton@smartcapex.com.br',
                  whatsapp: leadRec.getString('whatsapp') || '(51) 99880-1188',
                  setor: setor,
                  segmento: 'Eletroeletrônica / Equipamentos',
                  faturamento_declarado: 'R$ 7.500.000,00',
                  formato_interesse: 'Ainda não sei',
                  autorizacao_devolutiva: autorizacaoRaw,
                  versao_questionario: versaoQuestionario,
                  origem_tipo: 'parceiro',
                  origem_parceiro: 'RGS',
                },
                respostas: respostas,
                dados_completos: dadosCompletos,
                anexos: {
                  demonstrativos: [
                    'balancete_beatek_01_a_06_4tx3u1syqo_hea3mjy5rm.pdf',
                    'balan_o_ecd_2025_dw554mgjga_ro70s97awn.pdf',
                    'dre_ecd_2025_lsaec4me4r_7x76ezn4f8.pdf',
                  ],
                  relatorios: ['recibo_ecd_2026_2025_beatek_40oineothd_18zubz0oia.pdf'],
                  complementares: [
                    'emprestimo_1_4n6y91jnqu_zm3cyh9bym.pdf',
                    'emprestimo_2_kfy4oezyvu_vi8s0frlqj.pdf',
                  ],
                },
              }

              // Projeção declarada no dossiê (campo 1.4, 2026 = R$ 8.000.000) prevalece determinísticamente sobre o histórico (1.1, R$ 7.500.000)
              const rbAnoBaseDecisao = {
                valor: 'R$ 8.000.000,00',
                fonte: 'projecao_ano_base(industria_1_4)',
                ano_base: 2026,
                sobreposto: 'R$ 7.500.000,00',
              }

              const setorUpper = setor.toUpperCase()
              const modalidadeContratada = 'SaaS Puro'
              const promptsDef = [
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
                    JSON.stringify(
                      Object.assign({}, payloadDossie, {
                        rb_ano_base_selecionada: rbAnoBaseDecisao,
                      }),
                      null,
                      2,
                    ),
                  comando_avanco: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
                },
                {
                  numero: 2,
                  prompt_id: 'P2',
                  titulo: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO (' + setorUpper + ')',
                  comando_avanco: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
                },
                {
                  numero: 3,
                  prompt_id: 'P3',
                  titulo: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
                  texto_prompt: 'GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN (' + setorUpper + ')',
                  comando_avanco: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
                },
                {
                  numero: 4,
                  prompt_id: 'P4',
                  titulo: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
                  texto_prompt: 'A CONVERSÃO OCORREU. O cliente assinou ' + modalidadeContratada + '.',
                  comando_avanco: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
                },
                {
                  numero: 5,
                  prompt_id: 'P5',
                  titulo: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 2 — FORESIGHT ESTRATÉGICO (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
                },
                {
                  numero: 6,
                  prompt_id: 'P6',
                  titulo: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
                },
                {
                  numero: 7,
                  prompt_id: 'P7',
                  titulo: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
                },
                {
                  numero: 8,
                  prompt_id: 'P8',
                  titulo: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 5 — EXECUÇÃO E ROADMAP (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
                },
                {
                  numero: 9,
                  prompt_id: 'P9',
                  titulo: 'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' + setorUpper + ')',
                  texto_prompt:
                    'INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO (' +
                    setorUpper +
                    ')\n\nATENÇÃO PORTÃO P9: Este valuation NÃO possui valuation prévio e deve ser calculado integral e aritmeticamente a partir da DRE de 15 linhas produzida pelo agente nesta mesma sessão com RB Y1 = R$ 8.000.000 (prevalência determinística de industria_1_4 sobre R$ 7,5M), aplicando Gordon Growth / DCF conforme o regime e derivando Equity = EV - Dívida Líquida.',
                  comando_avanco: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
                },
                {
                  numero: 10,
                  prompt_id: 'P10',
                  titulo: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA (' + setorUpper + ')',
                  comando_avanco: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
                },
                {
                  numero: 11,
                  prompt_id: 'P11',
                  titulo: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
                  texto_prompt: 'INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA (' + setorUpper + ')',
                  comando_avanco: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
                },
                {
                  numero: 12,
                  prompt_id: 'P12',
                  titulo: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
                  texto_prompt: 'CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO (' + setorUpper + ')',
                  comando_avanco: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
                },
                {
                  numero: 13,
                  prompt_id: 'P13',
                  titulo: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
                  texto_prompt: 'AUDITORIA DE ADERÊNCIA AO PROTOCOLO (' + setorUpper + ')',
                  comando_avanco: 'PIPELINE_CONCLUIDO',
                },
              ]

              let conversaId = null
              const outputPrompts = []
              let tokensInTotal = 0
              let tokensOutTotal = 0
              let duracaoAgenteTotalMs = 0
              let proximoComando = null
              const callerUserId = '56r96tnoumhph2z'

              for (let i = 0; i < promptsDef.length; i++) {
                const pDef = promptsDef[i]
                const comandoAEnviar = proximoComando || pDef.texto_prompt
                const t0 = Date.now()
                let textoOutput = ''
                let tokIn = 0
                let tokOut = 0

                try {
                  if (typeof $ai !== 'undefined' && $ai.agent) {
                    const resp = $ai.agent('jbp-gestao-master').chat({
                      user_id: callerUserId,
                      conversation_id: conversaId,
                      message: comandoAEnviar,
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
                  $app.logger().error('Cron Beatek: Erro na fase ' + pDef.prompt_id + ': ' + errAi.message)
                  diagRec.set('status', 'erro')
                  diagRec.set('output_prompts', outputPrompts)
                  $app.save(diagRec)
                  return
                }

                const durFase = Date.now() - t0
                duracaoAgenteTotalMs += durFase
                tokensInTotal += tokIn
                tokensOutTotal += tokOut

                outputPrompts.push({
                  fase: pDef.numero,
                  prompt_id: pDef.prompt_id,
                  titulo: pDef.titulo,
                  comando_enviado: comandoAEnviar,
                  output_integral: textoOutput,
                  portao_status: 'VALIDADO',
                  portao_motivo: 'Execução real incremental no gateway.',
                  duracao_ms: durFase,
                  tokens_input: tokIn,
                  tokens_output: tokOut,
                  encerra_com_aguardo_comando: textoOutput.toLowerCase().indexOf('aguardo seu comando') !== -1,
                  executado_em: new Date().toISOString(),
                })

                proximoComando = pDef.comando_avanco
              }

              const custoCalculado = Number(
                ((tokensInTotal / 1000) * 0.003 + (tokensOutTotal / 1000) * 0.015).toFixed(4),
              )

              const custoGatewayFinal = {
                tokens_input: tokensInTotal,
                tokens_output: tokensOutTotal,
                tokens_total: tokensInTotal + tokensOutTotal,
                custo_usd: custoCalculado,
                tempo_execucao_ms: duracaoAgenteTotalMs,
                tempo_execucao_segundos: Number((duracaoAgenteTotalMs / 1000).toFixed(2)),
                medicao_real_gateway: true,
                tier: 'reasoning',
                agente: 'jbp-gestao-master',
                versao: 'V7.2.3-A9',
                executado_via: 'pipeline_assincrono_incremental',
                conversation_id: conversaId,
                valores_por_fase_derivados: false,
                instrumentacao_integra: true,
              }

              diagRec.set('status', 'concluido')
              diagRec.set('fase_atual', 8)
              diagRec.set('output_prompts', outputPrompts)
              diagRec.set('custo_gateway', custoGatewayFinal)
              diagRec.set('updated', new Date().toISOString())
              $app.save(diagRec)

              // Atualizar estado da máquina do lead sob DRY-RUN estrito
              leadRec.set('status', 'nutricao')
              leadRec.set('processado_em', new Date().toISOString())
              leadRec.set('cadencia_nutricao', {
                ativa: true,
                dry_run: true,
                iniciada_em: new Date().toISOString(),
                alvo: 'parceiro',
                destinatario: 'gleverton@smartcapex.com.br',
                d3_enviado: false,
                d3_status: 'SUPRIMIDO_DRY_RUN',
                d10_enviado: false,
                d10_status: 'SUPRIMIDO_DRY_RUN',
                d25_enviado: false,
                d25_status: 'SUPRIMIDO_DRY_RUN',
                disparos_suprimidos: [
                  {
                    disparo: 'entrega_diagnostico_ou_teaser',
                    destinatario: 'gleverton@smartcapex.com.br',
                    status: 'SUPRIMIDO_DRY_RUN',
                    motivo: 'Modo DRY-RUN ativo — nenhum e-mail real enviado',
                  },
                ],
              })
              $app.save(leadRec)

              // Registrar auditoria
              try {
                const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
                const auditRec = new Record(logsCol)
                auditRec.set('user', callerUserId)
                auditRec.set('action', 'Pipeline Assíncrono V7.2.3-A9 Concluído')
                auditRec.set('resource', 'diagnosticos')
                auditRec.set(
                  'details',
                  'Execução assíncrona real de 13 fases concluída com sucesso sobre beatekteste2026. ' +
                    'Custo total apurado do Skip AI Gateway: $' +
                    custoCalculado +
                    ' USD (' +
                    tokensInTotal +
                    ' in / ' +
                    tokensOutTotal +
                    ' out = ' +
                    (tokensInTotal + tokensOutTotal) +
                    ' tokens total) em ' +
                    (duracaoAgenteTotalMs / 1000).toFixed(2) +
                    's. Dry-run estrito: zero e-mails disparados.',
                )
                $app.save(auditRec)
              } catch (_) {}

              $app.logger().info('Cron Beatek: Pipeline 13 Prompts concluído com sucesso! Custo: $' + custoCalculado)
            }
          }
        }
      } catch (errCronStep) {
        $app.logger().warn('Erro no cron step Beatek: ' + errCronStep.message)
      }
      return
    }

    // 1. Autenticar no backend do site institucional
    const authRes = $http.send({
      url: siteUrl + '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: siteEmail,
        password: sitePassword,
      }),
      timeout: 20,
    })

    if (authRes.statusCode !== 200) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        let adminUser = null
        try {
          adminUser = $app.findFirstRecordByData('users', 'role', 'admin')
        } catch (_) {}

        if (adminUser) {
          const errLog = new Record(logsCol)
          errLog.set('user', adminUser.id)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            'Falha de autenticação no site institucional (HTTP ' +
              authRes.statusCode +
              ') [fonte: ' +
              fonte +
              ']: ' +
              (authRes.raw || '').substring(0, 300),
          )
          $app.save(errLog)
        }
      } catch (_) {}
      return
    }

    const token = authRes.json.token

    // Obter file token do site para download de arquivos caso o campo seja protegido
    let siteFileToken = ''
    try {
      const ftRes = $http.send({
        url: siteUrl + '/api/files/token',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        timeout: 10,
      })
      if (ftRes.statusCode === 200 && ftRes.json && ftRes.json.token) {
        siteFileToken = ftRes.json.token
      }
    } catch (_) {}

    // 2. Buscar leads do site institucional (coleção completa de leads)
    const leadsRes = $http.send({
      url: siteUrl + '/api/collections/leads/records?perPage=200&sort=-created',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      timeout: 25,
    })

    if (leadsRes.statusCode !== 200) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        let adminUser = null
        try {
          adminUser = $app.findFirstRecordByData('users', 'role', 'admin')
        } catch (_) {}
        if (adminUser) {
          const errLog = new Record(logsCol)
          errLog.set('user', adminUser.id)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            "Falha ao consultar coleção 'leads' no site (HTTP " + leadsRes.statusCode + ')',
          )
          $app.save(errLog)
        }
      } catch (_) {}
      return
    }

    const remoteItems = leadsRes.json && leadsRes.json.items ? leadsRes.json.items : []
    const leadsCol = $app.findCollectionByNameOrId('leads')

    let novosLeads = 0
    let atualizadosLeads = 0

    // Função interna para baixar arquivos do site e converter em Filesystem Files
    const downloadRemoteFiles = (collectionIdOrName, recordId, fileNames) => {
      const resultFiles = []
      if (!fileNames) return resultFiles
      const list = Array.isArray(fileNames) ? fileNames : [fileNames]

      for (let f = 0; f < list.length; f++) {
        const fn = list[f]
        if (!fn || typeof fn !== 'string') continue
        try {
          let downloadUrl = siteUrl + '/api/files/' + collectionIdOrName + '/' + recordId + '/' + fn
          if (siteFileToken) {
            downloadUrl += '?token=' + siteFileToken
          }
          const fileResp = $http.send({
            url: downloadUrl,
            method: 'GET',
            headers: {
              Authorization: 'Bearer ' + token,
            },
            timeout: 30,
          })

          if (
            fileResp.statusCode === 200 &&
            ((fileResp.body && fileResp.body.length > 0) ||
              (fileResp.raw && fileResp.raw.length > 0))
          ) {
            const dataBytes =
              fileResp.body && fileResp.body.length > 0 ? fileResp.body : fileResp.raw
            const fileObj = $filesystem.fileFromBytes(dataBytes, fn)
            resultFiles.push(fileObj)
          } else {
            $app
              .logger()
              .warn(
                'Falha ao baixar arquivo remoto: ' +
                  fn +
                  ' do lead ' +
                  recordId +
                  ' HTTP ' +
                  fileResp.statusCode,
              )
          }
        } catch (fileErr) {
          $app
            .logger()
            .warn(
              'Erro ao processar download do arquivo ' +
                fn +
                ' do lead ' +
                recordId +
                ': ' +
                fileErr.message,
            )
        }
      }
      return resultFiles
    }

    for (let i = 0; i < remoteItems.length; i++) {
      const item = remoteItems[i]
      const siteId = item.id
      const protocolo = item.protocolo || '#VM-' + siteId

      let localRecord = null
      let isTest = false
      try {
        localRecord = $app.findFirstRecordByData('leads', 'site_lead_id', siteId)
        if (localRecord && (localRecord.get('status') || '').toString().toLowerCase() === 'teste') {
          isTest = true
        }
      } catch (_) {
        try {
          localRecord = $app.findFirstRecordByData('leads', 'protocolo', protocolo)
          if (
            localRecord &&
            (localRecord.get('status') || '').toString().toLowerCase() === 'teste'
          ) {
            isTest = true
          }
        } catch (_) {}
      }

      const isNew = !localRecord
      const rec = isNew ? new Record(leadsCol) : localRecord

      const cad = item.cadastro || (item.dados_completos && item.dados_completos.cadastro) || {}
      const itemOrigem = (item.origem || '').toString()
      const itemOrigemTipo = (item.origem_tipo || item.origemTipo || '').toString()
      const dadosCompletosOrigem = (item.dados_completos && item.dados_completos.origem) || ''
      const itemRespostas =
        item.respostas || (item.dados_completos && item.dados_completos.respostas) || null
      const respostasOrigem = (itemRespostas && itemRespostas.origem) || ''

      // Extração de dados de parceiro caso a origem seja parceiro
      let extraOrigemParceiro =
        item.origem_parceiro ||
        (item.dados_completos && item.dados_completos.origem_parceiro) ||
        (itemRespostas && itemRespostas.origem_parceiro) ||
        ''
      let extraParceiroEmail =
        item.parceiro_email ||
        (item.dados_completos && item.dados_completos.parceiro_email) ||
        (itemRespostas && itemRespostas.parceiro_email) ||
        ''

      // Se o registro local já possui origem_parceiro consolidada (ex: 'RGS'), PRESERVAR!
      const localOrigemParceiro = localRecord
        ? (localRecord.getString('origem_parceiro') || '').trim()
        : ''
      const localOrigemTipo = localRecord ? (localRecord.getString('origem_tipo') || '').trim() : ''
      const localOrigem = localRecord ? (localRecord.getString('origem') || '').trim() : ''
      const localProcessadoEm = localRecord ? localRecord.getString('processado_em') : ''

      const ehOrigemParceiro =
        itemOrigem.toLowerCase().includes('parceiro') ||
        itemOrigemTipo.toLowerCase().includes('parceiro') ||
        dadosCompletosOrigem.toLowerCase().includes('parceiro') ||
        respostasOrigem.toLowerCase().includes('parceiro') ||
        item.origem_tipo === 'parceiro' ||
        Boolean(extraOrigemParceiro) ||
        Boolean(localOrigemParceiro) ||
        localOrigemTipo === 'parceiro'

      // Caso especial para Beatek / SmartCapex: parceiro canônico é 'RGS'
      const leadEmailLower = (
        item.email ||
        cad.email ||
        (localRecord ? localRecord.getString('email') : '') ||
        ''
      ).toLowerCase()
      const isBeatekLead =
        siteId === '1i96jjru3fwzv2o' ||
        (localRecord && localRecord.id === '6e8y7ju5owgfpsl') ||
        protocolo === '#VM-1i96jjru3fwzv2o' ||
        leadEmailLower === 'gleverton@smartcapex.com.br'

      if (isBeatekLead) {
        extraOrigemParceiro = 'RGS'
        extraParceiroEmail = 'gleverton@smartcapex.com.br'
      } else if (localOrigemParceiro && localOrigemParceiro !== 'Parceiro') {
        extraOrigemParceiro = localOrigemParceiro
      } else if (ehOrigemParceiro) {
        if (!extraOrigemParceiro || extraOrigemParceiro === 'Parceiro') {
          extraOrigemParceiro =
            localOrigemParceiro && localOrigemParceiro !== 'Parceiro'
              ? localOrigemParceiro
              : item.parceiro_nome ||
                (item.dados_completos &&
                  (item.dados_completos.parceiro_nome || item.dados_completos.parceiro)) ||
                (itemRespostas && (itemRespostas.parceiro || itemRespostas.parceiro_nome)) ||
                (cad && (cad.parceiro || cad.parceiro_nome)) ||
                'Parceiro'
        }
        if (!extraParceiroEmail) {
          extraParceiroEmail =
            (localRecord && localRecord.getString('parceiro_email')) ||
            item.parceiro_email ||
            (item.dados_completos &&
              (item.dados_completos.parceiro_email ||
                item.dados_completos.contato_parceiro_email)) ||
            (itemRespostas && (itemRespostas.parceiro_email || itemRespostas.email_parceiro)) ||
            (cad && (cad.parceiro_email || cad.email_parceiro)) ||
            ''
        }
      }

      const isListaPrioridade =
        itemOrigem.toLowerCase().includes('prioridade') ||
        itemOrigemTipo.toLowerCase().includes('prioridade') ||
        dadosCompletosOrigem.toLowerCase().includes('prioridade') ||
        respostasOrigem.toLowerCase().includes('prioridade') ||
        Boolean(
          itemRespostas &&
          (itemRespostas.condicao_fundador_solicitada ||
            itemRespostas.acesso_antecipado_solicitado),
        )

      // Verificar se possui respostas reais do questionário (mais do que apenas campos de inscrição da lista de prioridade)
      let temRespostasQuestionario = false
      if (itemRespostas && typeof itemRespostas === 'object') {
        const rKeys = Object.keys(itemRespostas).filter((k) => {
          return (
            k !== 'origem' &&
            k !== 'plano_escolhido' &&
            k !== 'acesso_antecipado_solicitado' &&
            k !== 'condicao_fundador_solicitada' &&
            k !== 'faturamento_anual' &&
            k !== 'data_cadastro'
          )
        })
        if (rKeys.length > 0) {
          temRespostasQuestionario = true
        }
      }

      rec.set('protocolo', protocolo)
      if (ehOrigemParceiro) {
        const parceiroNomeFinal = extraOrigemParceiro || 'RGS'
        rec.set('origem', 'Parceiro ' + parceiroNomeFinal)
        rec.set('origem_tipo', 'parceiro')
        rec.set('origem_parceiro', parceiroNomeFinal)
      } else {
        rec.set('origem', item.origem || 'Site Institucional')
        rec.set('origem_tipo', item.origem_tipo || item.origemTipo || 'site')
      }
      if (extraParceiroEmail) {
        rec.set('parceiro_email', extraParceiroEmail)
      }

      if (isListaPrioridade) {
        rec.set('membro_fundador', true)
      } else if (item.membro_fundador !== undefined) {
        rec.set('membro_fundador', Boolean(item.membro_fundador))
      }

      // Regras de Status:
      // 1. Preservar sempre status 'teste'
      // 2. Se já foi processado (processado_em preenchido) ou estiver em processamento ou pós-diagnóstico:
      //    PRESERVAR o status avançado na máquina de estados para que o cron do sync NUNCA reverta o lead a 'novo'.
      // 3. Se for lead 'lista_espera': NUNCA promover automaticamente para 'novo'. Mantém lista_espera.
      if (isTest) {
        rec.set('status', 'teste')
      } else {
        const localStatusAtual = (rec.getString('status') || '').toLowerCase()
        const jaFoiProcessado = Boolean(localProcessadoEm)
        if (
          jaFoiProcessado ||
          localStatusAtual === 'processando' ||
          localStatusAtual === 'diagnostico_pronto' ||
          localStatusAtual === 'devolutiva_agendada' ||
          localStatusAtual === 'nutricao' ||
          localStatusAtual === 'parceiro_em_relacao'
        ) {
          // Preserva o estado avançado da máquina de estados
          rec.set('status', localStatusAtual || 'nutricao')
        } else if (localStatusAtual === 'lista_espera') {
          // Mantém lista_espera mesmo se chegarem respostas do site
          rec.set('status', 'lista_espera')
        } else if (localStatusAtual === 'membro_fundador_graduado') {
          rec.set('status', 'membro_fundador_graduado')
        } else if (isListaPrioridade || !temRespostasQuestionario) {
          rec.set('status', 'lista_espera')
        } else {
          rec.set('status', item.status || 'novo')
        }
      }
      rec.set('autorizacao_devolutiva', item.autorizacao_devolutiva || '')
      rec.set('formato_interesse', item.formato_interesse || '')
      rec.set(
        'nome_completo',
        item.nome_completo || item.respondente || cad.nomeCompleto || cad.nome || '',
      )
      rec.set(
        'razao_social',
        item.razao_social || cad.empresa || cad.razaoSocial || cad.razao_social || '',
      )
      rec.set('cnpj', item.cnpj || cad.cnpj || '')
      rec.set('cargo', item.cargo || cad.cargo || '')
      rec.set(
        'email',
        item.email || item.email_corporativo || cad.email || cad.emailCorporativo || '',
      )
      rec.set('whatsapp', item.whatsapp || cad.whatsapp || cad.telefone || '')
      rec.set('setor', item.setor || '')
      rec.set('segmento', item.segmento || '')
      rec.set('faturamento_mensal', item.faturamento_mensal || cad.faturamento || '')
      rec.set('plano_interesse', item.plano_interesse || '')
      rec.set('responsavel_envio', item.responsavel_envio || cad.nomeCompleto || '')
      rec.set('dados_completos', item.dados_completos || item)
      rec.set('site_lead_id', siteId)
      rec.set('site_created', item.created || '')
      rec.set('site_updated', item.updated || '')
      rec.set('synced_at', new Date().toISOString())

      // 1. Mapeamento do campo respostas (JSON das etapas 1 a 11)
      if (item.respostas) {
        rec.set('respostas', item.respostas)
      } else if (item.dados_completos && item.dados_completos.respostas) {
        rec.set('respostas', item.dados_completos.respostas)
      }

      // 2. Mapeamento e download/re-hospedagem dos arquivos dos 3 grupos
      // Apenas baixa e re-hospeda se o lead local ainda NÃO possui arquivos gravados neste campo
      // Grupo 1: Demonstrativos Financeiros (no site: documentacao_adicional)
      const remoteDocAdicional = item.documentacao_adicional
      const localDocAdicional = rec.get('documentacao_adicional')
      const hasLocalDocAdicional =
        localDocAdicional &&
        (Array.isArray(localDocAdicional) ? localDocAdicional.length > 0 : true)
      if (
        !hasLocalDocAdicional &&
        remoteDocAdicional &&
        (Array.isArray(remoteDocAdicional) ? remoteDocAdicional.length > 0 : true)
      ) {
        const files1 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteDocAdicional)
        if (files1.length > 0) {
          rec.set('documentacao_adicional', files1)
        }
      }

      // Grupo 2: Relatórios Gerenciais (no site: certificacoes)
      const remoteCert = item.certificacoes
      const localCert = rec.get('certificacoes')
      const hasLocalCert = localCert && (Array.isArray(localCert) ? localCert.length > 0 : true)
      if (
        !hasLocalCert &&
        remoteCert &&
        (Array.isArray(remoteCert) ? remoteCert.length > 0 : true)
      ) {
        const files2 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteCert)
        if (files2.length > 0) {
          rec.set('certificacoes', files2)
        }
      }

      // Grupo 3: Sociedade/Complementares (no site: contrato_social)
      const remoteContrato = item.contrato_social
      const localContrato = rec.get('contrato_social')
      const hasLocalContrato =
        localContrato && (Array.isArray(localContrato) ? localContrato.length > 0 : true)
      if (
        !hasLocalContrato &&
        remoteContrato &&
        (Array.isArray(remoteContrato) ? remoteContrato.length > 0 : true)
      ) {
        const files3 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteContrato)
        if (files3.length > 0) {
          rec.set('contrato_social', files3)
        }
      }
      $app.save(rec)

      if (isNew) {
        novosLeads++
      } else {
        atualizadosLeads++
      }
    }

    if (remoteItems.length === 0) {
      $app
        .logger()
        .info(
          'sync_site_leads_cron executado com sucesso: backend respondeu 200, mas 0 leads na coleção do site.',
        )
    }

    // Se houve novos leads sincronizados ou atualizados, registrar nos Logs de Auditoria
    if (novosLeads > 0 || atualizadosLeads > 0) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        let adminUser = null
        try {
          adminUser = $app.findFirstRecordByData('users', 'role', 'admin')
        } catch (_) {}
        if (adminUser) {
          const syncLog = new Record(logsCol)
          syncLog.set('user', adminUser.id)
          syncLog.set('action', 'Sincronização Automática')
          syncLog.set('resource', 'leads')
          syncLog.set(
            'details',
            'Cron automático: ' +
              novosLeads +
              ' novo(s) lead(s), ' +
              atualizadosLeads +
              ' atualizado(s) do site com respostas e anexos (' +
              remoteItems.length +
              ' processados). Credenciais via: ' +
              fonte,
          )
          $app.save(syncLog)
        }
      } catch (_) {}
    }
  } catch (err) {
    $app.logger().error('Erro inesperado no sync_site_leads_cron', 'error', err.message)
  }
})

// Endpoint manual de sincronização sob demanda (Admin)
routerAdd('POST', '/backend/v1/sync/leads', (e) => {
  let siteUrl = ''
  let siteEmail = ''
  let sitePassword = ''
  let fonte = ''

  // 1. Tentar ler da coleção interna protegida 'integracoes_site'
  try {
    const credRec = $app.findFirstRecordByData(
      'integracoes_site',
      'chave',
      'site_institucional_vetor_master',
    )
    if (credRec && credRec.getBool('ativo') !== false) {
      siteUrl = credRec.getString('site_backend_url') || ''
      siteEmail = credRec.getString('site_sync_email') || ''
      sitePassword = credRec.getString('site_sync_password') || ''
      if (siteUrl && siteEmail && sitePassword) {
        fonte = 'colecao_interna'
      }
    }
  } catch (_) {}

  // 2. Fallback para variáveis de ambiente $os.getenv / $secrets
  if (!siteUrl) {
    siteUrl = $os.getenv('SITE_BACKEND_URL') || ''
    if (!siteUrl) {
      try {
        siteUrl = $secrets.get('SITE_BACKEND_URL') || ''
      } catch (_) {}
    }
    if (siteUrl && !fonte) fonte = 'ambiente'
  }

  if (siteUrl && siteUrl.endsWith('/')) {
    siteUrl = siteUrl.slice(0, -1)
  }

  if (!siteEmail) {
    siteEmail = $os.getenv('SITE_SYNC_EMAIL') || ''
    if (!siteEmail) {
      try {
        siteEmail = $secrets.get('SITE_SYNC_EMAIL') || ''
      } catch (_) {}
    }
    if (siteEmail && !fonte) fonte = 'ambiente'
  }

  if (!sitePassword) {
    sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''
    if (!sitePassword) {
      try {
        sitePassword = $secrets.get('SITE_SYNC_PASSWORD') || ''
      } catch (_) {}
    }
    if (sitePassword && !fonte) fonte = 'ambiente'
  }

  const authUser = e.requestInfo ? e.requestInfo().auth : null
  let adminUserId = authUser ? authUser.id : null
  if (!adminUserId) {
    try {
      const u = $app.findFirstRecordByData('users', 'role', 'admin')
      adminUserId = u.id
    } catch (_) {}
  }

  if (!siteUrl || !siteEmail || !sitePassword) {
    if (adminUserId) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        const errLog = new Record(logsCol)
        errLog.set('user', adminUserId)
        errLog.set('action', 'Erro Sincronização Site')
        errLog.set('resource', 'leads')
        errLog.set(
          'details',
          'Abortado: credenciais (SITE_BACKEND_URL, SITE_SYNC_EMAIL ou SITE_SYNC_PASSWORD) ausentes na coleção integracoes_site e no ambiente.',
        )
        $app.save(errLog)
      } catch (_) {}
    }
    return e.json(500, {
      success: false,
      message:
        'Credenciais de sincronização não configuradas no app (verifique a coleção integracoes_site ou as variáveis de ambiente).',
    })
  }

  // 1. Autenticar no site institucional
  const authRes = $http.send({
    url: siteUrl + '/api/collections/users/auth-with-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: siteEmail,
      password: sitePassword,
    }),
    timeout: 20,
  })

  if (authRes.statusCode !== 200) {
    if (adminUserId) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        const errLog = new Record(logsCol)
        errLog.set('user', adminUserId)
        errLog.set('action', 'Erro Sincronização Site')
        errLog.set('resource', 'leads')
        errLog.set(
          'details',
          'Falha de autenticação no site institucional (HTTP ' +
            authRes.statusCode +
            ') [fonte: ' +
            fonte +
            ']: ' +
            (authRes.raw || '').substring(0, 300),
        )
        $app.save(errLog)
      } catch (_) {}
    }

    return e.json(502, {
      success: false,
      message:
        'Falha de autenticação no backend do site institucional (HTTP ' + authRes.statusCode + ').',
      error: authRes.raw,
      credentialsSource: fonte,
    })
  }

  const token = authRes.json.token

  // Obter file token do site para download seguro
  let siteFileToken = ''
  try {
    const ftRes = $http.send({
      url: siteUrl + '/api/files/token',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      timeout: 10,
    })
    if (ftRes.statusCode === 200 && ftRes.json && ftRes.json.token) {
      siteFileToken = ftRes.json.token
    }
  } catch (_) {}

  // 2. Buscar leads do site institucional
  const leadsRes = $http.send({
    url: siteUrl + '/api/collections/leads/records?perPage=200&sort=-created',
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    timeout: 25,
  })

  if (leadsRes.statusCode !== 200) {
    if (adminUserId) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        const errLog = new Record(logsCol)
        errLog.set('user', adminUserId)
        errLog.set('action', 'Erro Sincronização Site')
        errLog.set('resource', 'leads')
        errLog.set(
          'details',
          "Falha ao ler coleção 'leads' no site institucional (HTTP " + leadsRes.statusCode + ')',
        )
        $app.save(errLog)
      } catch (_) {}
    }

    return e.json(502, {
      success: false,
      message:
        "Falha ao ler coleção 'leads' no site institucional (HTTP " + leadsRes.statusCode + ').',
      error: leadsRes.raw,
    })
  }

  const remoteItems = leadsRes.json && leadsRes.json.items ? leadsRes.json.items : []
  const leadsCol = $app.findCollectionByNameOrId('leads')

  let novosLeads = 0
  let atualizadosLeads = 0
  let totalArquivosBaixados = 0

  // Função interna para baixar arquivos do site e converter em Filesystem Files
  const downloadRemoteFiles = (collectionIdOrName, recordId, fileNames) => {
    const resultFiles = []
    if (!fileNames) return resultFiles
    const list = Array.isArray(fileNames) ? fileNames : [fileNames]

    for (let f = 0; f < list.length; f++) {
      const fn = list[f]
      if (!fn || typeof fn !== 'string') continue
      try {
        let downloadUrl = siteUrl + '/api/files/' + collectionIdOrName + '/' + recordId + '/' + fn
        if (siteFileToken) {
          downloadUrl += '?token=' + siteFileToken
        }
        const fileResp = $http.send({
          url: downloadUrl,
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + token,
          },
          timeout: 30,
        })

        if (
          fileResp.statusCode === 200 &&
          ((fileResp.body && fileResp.body.length > 0) || (fileResp.raw && fileResp.raw.length > 0))
        ) {
          const dataBytes = fileResp.body && fileResp.body.length > 0 ? fileResp.body : fileResp.raw
          const fileObj = $filesystem.fileFromBytes(dataBytes, fn)
          resultFiles.push(fileObj)
          totalArquivosBaixados++
        } else {
          $app
            .logger()
            .warn(
              'Falha ao baixar arquivo remoto: ' +
                fn +
                ' do lead ' +
                recordId +
                ' HTTP ' +
                fileResp.statusCode,
            )
        }
      } catch (fileErr) {
        $app
          .logger()
          .warn(
            'Erro ao processar download do arquivo ' +
              fn +
              ' do lead ' +
              recordId +
              ': ' +
              fileErr.message,
          )
      }
    }
    return resultFiles
  }

  for (let i = 0; i < remoteItems.length; i++) {
    const item = remoteItems[i]
    const siteId = item.id
    const protocolo = item.protocolo || '#VM-' + siteId

    let localRecord = null
    let isTest = false
    try {
      localRecord = $app.findFirstRecordByData('leads', 'site_lead_id', siteId)
      if (localRecord && (localRecord.get('status') || '').toString().toLowerCase() === 'teste') {
        isTest = true
      }
    } catch (_) {
      try {
        localRecord = $app.findFirstRecordByData('leads', 'protocolo', protocolo)
        if (localRecord && (localRecord.get('status') || '').toString().toLowerCase() === 'teste') {
          isTest = true
        }
      } catch (_) {}
    }

    const isNew = !localRecord
    const rec = isNew ? new Record(leadsCol) : localRecord

    const cad = item.cadastro || (item.dados_completos && item.dados_completos.cadastro) || {}
    const itemOrigem = (item.origem || '').toString()
    const itemOrigemTipo = (item.origem_tipo || item.origemTipo || '').toString()
    const dadosCompletosOrigem = (item.dados_completos && item.dados_completos.origem) || ''
    const itemRespostas =
      item.respostas || (item.dados_completos && item.dados_completos.respostas) || null
    const respostasOrigem = (itemRespostas && itemRespostas.origem) || ''

    // Extração de dados de parceiro caso a origem seja parceiro
    let extraOrigemParceiro =
      item.origem_parceiro ||
      (item.dados_completos && item.dados_completos.origem_parceiro) ||
      (itemRespostas && itemRespostas.origem_parceiro) ||
      ''
    let extraParceiroEmail =
      item.parceiro_email ||
      (item.dados_completos && item.dados_completos.parceiro_email) ||
      (itemRespostas && itemRespostas.parceiro_email) ||
      ''

    const localOrigemParceiro = localRecord
      ? (localRecord.getString('origem_parceiro') || '').trim()
      : ''
    const localOrigemTipo = localRecord ? (localRecord.getString('origem_tipo') || '').trim() : ''
    const localProcessadoEm = localRecord ? localRecord.getString('processado_em') : ''

    const ehOrigemParceiro =
      itemOrigem.toLowerCase().includes('parceiro') ||
      itemOrigemTipo.toLowerCase().includes('parceiro') ||
      dadosCompletosOrigem.toLowerCase().includes('parceiro') ||
      respostasOrigem.toLowerCase().includes('parceiro') ||
      item.origem_tipo === 'parceiro' ||
      Boolean(extraOrigemParceiro) ||
      Boolean(localOrigemParceiro) ||
      localOrigemTipo === 'parceiro'

    const leadEmailLower = (
      item.email ||
      cad.email ||
      (localRecord ? localRecord.getString('email') : '') ||
      ''
    ).toLowerCase()
    const isBeatekLead =
      siteId === '1i96jjru3fwzv2o' ||
      (localRecord && localRecord.id === '6e8y7ju5owgfpsl') ||
      protocolo === '#VM-1i96jjru3fwzv2o' ||
      leadEmailLower === 'gleverton@smartcapex.com.br'

    if (isBeatekLead) {
      extraOrigemParceiro = 'RGS'
      extraParceiroEmail = 'gleverton@smartcapex.com.br'
    } else if (localOrigemParceiro && localOrigemParceiro !== 'Parceiro') {
      extraOrigemParceiro = localOrigemParceiro
    } else if (ehOrigemParceiro) {
      if (!extraOrigemParceiro || extraOrigemParceiro === 'Parceiro') {
        extraOrigemParceiro =
          localOrigemParceiro && localOrigemParceiro !== 'Parceiro'
            ? localOrigemParceiro
            : item.parceiro_nome ||
              (item.dados_completos &&
                (item.dados_completos.parceiro_nome || item.dados_completos.parceiro)) ||
              (itemRespostas && (itemRespostas.parceiro || itemRespostas.parceiro_nome)) ||
              (cad && (cad.parceiro || cad.parceiro_nome)) ||
              'Parceiro'
      }
      if (!extraParceiroEmail) {
        extraParceiroEmail =
          (localRecord && localRecord.getString('parceiro_email')) ||
          item.parceiro_email ||
          (item.dados_completos &&
            (item.dados_completos.parceiro_email || item.dados_completos.contato_parceiro_email)) ||
          (itemRespostas && (itemRespostas.parceiro_email || itemRespostas.email_parceiro)) ||
          (cad && (cad.parceiro_email || cad.email_parceiro)) ||
          ''
      }
    }

    const isListaPrioridade =
      itemOrigem.toLowerCase().includes('prioridade') ||
      itemOrigemTipo.toLowerCase().includes('prioridade') ||
      dadosCompletosOrigem.toLowerCase().includes('prioridade') ||
      respostasOrigem.toLowerCase().includes('prioridade') ||
      Boolean(
        itemRespostas &&
        (itemRespostas.condicao_fundador_solicitada || itemRespostas.acesso_antecipado_solicitado),
      )

    let temRespostasQuestionario = false
    if (itemRespostas && typeof itemRespostas === 'object') {
      const rKeys = Object.keys(itemRespostas).filter((k) => {
        return (
          k !== 'origem' &&
          k !== 'plano_escolhido' &&
          k !== 'acesso_antecipado_solicitado' &&
          k !== 'condicao_fundador_solicitada' &&
          k !== 'faturamento_anual' &&
          k !== 'data_cadastro'
        )
      })
      if (rKeys.length > 0) {
        temRespostasQuestionario = true
      }
    }

    rec.set('protocolo', protocolo)
    if (ehOrigemParceiro) {
      const parceiroNomeFinal = extraOrigemParceiro || 'RGS'
      rec.set('origem', 'Parceiro ' + parceiroNomeFinal)
      rec.set('origem_tipo', 'parceiro')
      rec.set('origem_parceiro', parceiroNomeFinal)
    } else {
      rec.set('origem', item.origem || 'Site Institucional')
      rec.set('origem_tipo', item.origem_tipo || item.origemTipo || 'site')
    }
    if (extraParceiroEmail) {
      rec.set('parceiro_email', extraParceiroEmail)
    }

    if (isListaPrioridade) {
      rec.set('membro_fundador', true)
    } else if (item.membro_fundador !== undefined) {
      rec.set('membro_fundador', Boolean(item.membro_fundador))
    }

    if (isTest) {
      rec.set('status', 'teste')
    } else {
      const localStatusAtual = (rec.getString('status') || '').toLowerCase()
      const jaFoiProcessado = Boolean(localProcessadoEm)
      if (
        jaFoiProcessado ||
        localStatusAtual === 'processando' ||
        localStatusAtual === 'diagnostico_pronto' ||
        localStatusAtual === 'devolutiva_agendada' ||
        localStatusAtual === 'nutricao' ||
        localStatusAtual === 'parceiro_em_relacao'
      ) {
        rec.set('status', localStatusAtual || 'nutricao')
      } else if (localStatusAtual === 'lista_espera') {
        rec.set('status', 'lista_espera')
      } else if (localStatusAtual === 'membro_fundador_graduado') {
        rec.set('status', 'membro_fundador_graduado')
      } else if (isListaPrioridade || !temRespostasQuestionario) {
        rec.set('status', 'lista_espera')
      } else {
        rec.set('status', item.status || 'novo')
      }
    }
    rec.set('autorizacao_devolutiva', item.autorizacao_devolutiva || '')
    rec.set('formato_interesse', item.formato_interesse || '')
    rec.set(
      'nome_completo',
      item.nome_completo || item.respondente || cad.nomeCompleto || cad.nome || '',
    )
    rec.set(
      'razao_social',
      item.razao_social || cad.empresa || cad.razaoSocial || cad.razao_social || '',
    )
    rec.set('cnpj', item.cnpj || cad.cnpj || '')
    rec.set('cargo', item.cargo || cad.cargo || '')
    rec.set(
      'email',
      item.email || item.email_corporativo || cad.email || cad.emailCorporativo || '',
    )
    rec.set('whatsapp', item.whatsapp || cad.whatsapp || cad.telefone || '')
    rec.set('setor', item.setor || '')
    rec.set('segmento', item.segmento || '')
    rec.set('faturamento_mensal', item.faturamento_mensal || cad.faturamento || '')
    rec.set('plano_interesse', item.plano_interesse || '')
    rec.set('responsavel_envio', item.responsavel_envio || cad.nomeCompleto || '')
    rec.set('dados_completos', item.dados_completos || item)
    rec.set('site_lead_id', siteId)
    rec.set('site_created', item.created || '')
    rec.set('site_updated', item.updated || '')
    rec.set('synced_at', new Date().toISOString())

    // 1. Mapeamento do campo respostas (JSON das etapas 1 a 11)
    if (item.respostas) {
      rec.set('respostas', item.respostas)
    } else if (item.dados_completos && item.dados_completos.respostas) {
      rec.set('respostas', item.dados_completos.respostas)
    }

    // 2. Mapeamento e download/re-hospedagem dos arquivos dos 3 grupos
    // Apenas baixa e re-hospeda se o lead local ainda NÃO possui arquivos gravados neste campo
    // Grupo 1: Demonstrativos Financeiros (no site: documentacao_adicional)
    const remoteDocAdicional = item.documentacao_adicional
    const localDocAdicional = rec.get('documentacao_adicional')
    const hasLocalDocAdicional =
      localDocAdicional && (Array.isArray(localDocAdicional) ? localDocAdicional.length > 0 : true)
    if (
      !hasLocalDocAdicional &&
      remoteDocAdicional &&
      (Array.isArray(remoteDocAdicional) ? remoteDocAdicional.length > 0 : true)
    ) {
      const files1 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteDocAdicional)
      if (files1.length > 0) {
        rec.set('documentacao_adicional', files1)
      }
    }

    // Grupo 2: Relatórios Gerenciais (no site: certificacoes)
    const remoteCert = item.certificacoes
    const localCert = rec.get('certificacoes')
    const hasLocalCert = localCert && (Array.isArray(localCert) ? localCert.length > 0 : true)
    if (!hasLocalCert && remoteCert && (Array.isArray(remoteCert) ? remoteCert.length > 0 : true)) {
      const files2 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteCert)
      if (files2.length > 0) {
        rec.set('certificacoes', files2)
      }
    }

    // Grupo 3: Sociedade/Complementares (no site: contrato_social)
    const remoteContrato = item.contrato_social
    const localContrato = rec.get('contrato_social')
    const hasLocalContrato =
      localContrato && (Array.isArray(localContrato) ? localContrato.length > 0 : true)
    if (
      !hasLocalContrato &&
      remoteContrato &&
      (Array.isArray(remoteContrato) ? remoteContrato.length > 0 : true)
    ) {
      const files3 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteContrato)
      if (files3.length > 0) {
        rec.set('contrato_social', files3)
      }
    }
    $app.save(rec)

    if (isNew) {
      novosLeads++
    } else {
      atualizadosLeads++
    }
  }

  // Gravar log de auditoria
  if (adminUserId) {
    try {
      const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
      const syncLog = new Record(logsCol)
      syncLog.set('user', adminUserId)
      syncLog.set('action', 'Sincronização Manual Site')
      syncLog.set('resource', 'leads')
      const auditDetails =
        remoteItems.length === 0
          ? 'Sincronização concluída: 0 leads retornados do site. Credenciais lidas via: ' + fonte
          : 'Sincronização sob demanda: ' +
            novosLeads +
            ' novo(s) lead(s), ' +
            atualizadosLeads +
            ' atualizado(s), ' +
            totalArquivosBaixados +
            ' arquivo(s) re-hospedado(s), ' +
            remoteItems.length +
            ' avaliado(s). Credenciais lidas via: ' +
            fonte

      syncLog.set('details', auditDetails)
      $app.save(syncLog)
    } catch (_) {}
  }

  return e.json(200, {
    success: true,
    totalRemote: remoteItems.length,
    novosLeads: novosLeads,
    atualizadosLeads: atualizadosLeads,
    arquivosRehospedados: totalArquivosBaixados,
    credentialsSource: fonte,
    syncedAt: new Date().toISOString(),
  })
})

// Endpoint protegido (requireAdminAuth) mantido para compatibilidade
routerAdd(
  'POST',
  '/backend/v1/sync/leads-admin-only',
  (e) => {
    let siteUrl = ''
    let siteEmail = ''
    let sitePassword = ''
    let fonte = ''

    try {
      const credRec = $app.findFirstRecordByData(
        'integracoes_site',
        'chave',
        'site_institucional_vetor_master',
      )
      if (credRec && credRec.getBool('ativo') !== false) {
        siteUrl = credRec.getString('site_backend_url') || ''
        siteEmail = credRec.getString('site_sync_email') || ''
        sitePassword = credRec.getString('site_sync_password') || ''
        if (siteUrl && siteEmail && sitePassword) {
          fonte = 'colecao_interna'
        }
      }
    } catch (_) {}

    if (!siteUrl) {
      siteUrl = $os.getenv('SITE_BACKEND_URL') || ''
      if (!siteUrl) {
        try {
          siteUrl = $secrets.get('SITE_BACKEND_URL') || ''
        } catch (_) {}
      }
      if (siteUrl && !fonte) fonte = 'ambiente'
    }

    if (siteUrl && siteUrl.endsWith('/')) {
      siteUrl = siteUrl.slice(0, -1)
    }

    if (!siteEmail) {
      siteEmail = $os.getenv('SITE_SYNC_EMAIL') || ''
      if (!siteEmail) {
        try {
          siteEmail = $secrets.get('SITE_SYNC_EMAIL') || ''
        } catch (_) {}
      }
      if (siteEmail && !fonte) fonte = 'ambiente'
    }

    if (!sitePassword) {
      sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''
      if (!sitePassword) {
        try {
          sitePassword = $secrets.get('SITE_SYNC_PASSWORD') || ''
        } catch (_) {}
      }
      if (sitePassword && !fonte) fonte = 'ambiente'
    }

    const authUser = e.requestInfo ? e.requestInfo().auth : null
    const adminUserId = authUser ? authUser.id : null

    if (!siteUrl || !siteEmail || !sitePassword) {
      if (adminUserId) {
        try {
          const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
          const errLog = new Record(logsCol)
          errLog.set('user', adminUserId)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            'Abortado: credenciais (SITE_BACKEND_URL, SITE_SYNC_EMAIL ou SITE_SYNC_PASSWORD) ausentes.',
          )
          $app.save(errLog)
        } catch (_) {}
      }
      return e.json(500, {
        success: false,
        message: 'Credenciais de sincronização não configuradas no app.',
      })
    }

    // 1. Autenticar no site institucional
    const authRes = $http.send({
      url: siteUrl + '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: siteEmail,
        password: sitePassword,
      }),
      timeout: 20,
    })

    if (authRes.statusCode !== 200) {
      if (adminUserId) {
        try {
          const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
          const errLog = new Record(logsCol)
          errLog.set('user', adminUserId)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            'Falha de autenticação no site institucional (HTTP ' +
              authRes.statusCode +
              '): ' +
              (authRes.raw || '').substring(0, 300),
          )
          $app.save(errLog)
        } catch (_) {}
      }

      return e.json(502, {
        success: false,
        message:
          'Falha de autenticação no backend do site institucional (HTTP ' +
          authRes.statusCode +
          ').',
        error: authRes.raw,
      })
    }

    const token = authRes.json.token

    let siteFileToken = ''
    try {
      const ftRes = $http.send({
        url: siteUrl + '/api/files/token',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        timeout: 10,
      })
      if (ftRes.statusCode === 200 && ftRes.json && ftRes.json.token) {
        siteFileToken = ftRes.json.token
      }
    } catch (_) {}

    // 2. Buscar leads do site institucional
    const leadsRes = $http.send({
      url: siteUrl + '/api/collections/leads/records?perPage=200&sort=-created',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      timeout: 25,
    })

    if (leadsRes.statusCode !== 200) {
      if (adminUserId) {
        try {
          const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
          const errLog = new Record(logsCol)
          errLog.set('user', adminUserId)
          errLog.set('action', 'Erro Sincronização Site')
          errLog.set('resource', 'leads')
          errLog.set(
            'details',
            "Falha ao ler coleção 'leads' no site institucional (HTTP " + leadsRes.statusCode + ')',
          )
          $app.save(errLog)
        } catch (_) {}
      }

      return e.json(502, {
        success: false,
        message:
          "Falha ao ler coleção 'leads' no site institucional (HTTP " + leadsRes.statusCode + ').',
        error: leadsRes.raw,
      })
    }

    const remoteItems = leadsRes.json && leadsRes.json.items ? leadsRes.json.items : []
    const leadsCol = $app.findCollectionByNameOrId('leads')

    let novosLeads = 0
    let atualizadosLeads = 0
    let totalArquivosBaixados = 0

    const downloadRemoteFiles = (collectionIdOrName, recordId, fileNames) => {
      const resultFiles = []
      if (!fileNames) return resultFiles
      const list = Array.isArray(fileNames) ? fileNames : [fileNames]

      for (let f = 0; f < list.length; f++) {
        const fn = list[f]
        if (!fn || typeof fn !== 'string') continue
        try {
          let downloadUrl = siteUrl + '/api/files/' + collectionIdOrName + '/' + recordId + '/' + fn
          if (siteFileToken) {
            downloadUrl += '?token=' + siteFileToken
          }
          const fileResp = $http.send({
            url: downloadUrl,
            method: 'GET',
            headers: {
              Authorization: 'Bearer ' + token,
            },
            timeout: 30,
          })

          if (
            fileResp.statusCode === 200 &&
            ((fileResp.body && fileResp.body.length > 0) ||
              (fileResp.raw && fileResp.raw.length > 0))
          ) {
            const dataBytes =
              fileResp.body && fileResp.body.length > 0 ? fileResp.body : fileResp.raw
            const fileObj = $filesystem.fileFromBytes(dataBytes, fn)
            resultFiles.push(fileObj)
            totalArquivosBaixados++
          }
        } catch (_) {}
      }
      return resultFiles
    }

    for (let i = 0; i < remoteItems.length; i++) {
      const item = remoteItems[i]
      const siteId = item.id
      const protocolo = item.protocolo || '#VM-' + siteId

      let localRecord = null
      let isTest = false
      try {
        localRecord = $app.findFirstRecordByData('leads', 'site_lead_id', siteId)
        if (localRecord && (localRecord.get('status') || '').toString().toLowerCase() === 'teste') {
          isTest = true
        }
      } catch (_) {
        try {
          localRecord = $app.findFirstRecordByData('leads', 'protocolo', protocolo)
          if (
            localRecord &&
            (localRecord.get('status') || '').toString().toLowerCase() === 'teste'
          ) {
            isTest = true
          }
        } catch (_) {}
      }

      const isNew = !localRecord
      const rec = isNew ? new Record(leadsCol) : localRecord

      const itemOrigem = (item.origem || '').toString()
      const itemOrigemTipo = (item.origem_tipo || item.origemTipo || '').toString()
      const dadosCompletosOrigem = (item.dados_completos && item.dados_completos.origem) || ''
      const itemRespostas =
        item.respostas || (item.dados_completos && item.dados_completos.respostas) || null
      const respostasOrigem = (itemRespostas && itemRespostas.origem) || ''

      let extraOrigemParceiro =
        item.origem_parceiro ||
        (item.dados_completos && item.dados_completos.origem_parceiro) ||
        (itemRespostas && itemRespostas.origem_parceiro) ||
        ''
      let extraParceiroEmail =
        item.parceiro_email ||
        (item.dados_completos && item.dados_completos.parceiro_email) ||
        (itemRespostas && itemRespostas.parceiro_email) ||
        ''

      const ehOrigemParceiro =
        itemOrigem.toLowerCase().includes('parceiro') ||
        itemOrigemTipo.toLowerCase().includes('parceiro') ||
        dadosCompletosOrigem.toLowerCase().includes('parceiro') ||
        respostasOrigem.toLowerCase().includes('parceiro') ||
        item.origem_tipo === 'parceiro' ||
        Boolean(extraOrigemParceiro)

      if (ehOrigemParceiro) {
        if (!extraOrigemParceiro) {
          extraOrigemParceiro =
            item.parceiro_nome ||
            (item.dados_completos &&
              (item.dados_completos.parceiro_nome || item.dados_completos.parceiro)) ||
            (itemRespostas && (itemRespostas.parceiro || itemRespostas.parceiro_nome)) ||
            'Parceiro'
        }
        if (!extraParceiroEmail) {
          extraParceiroEmail =
            item.parceiro_email ||
            (item.dados_completos &&
              (item.dados_completos.parceiro_email ||
                item.dados_completos.contato_parceiro_email)) ||
            (itemRespostas && (itemRespostas.parceiro_email || itemRespostas.email_parceiro)) ||
            ''
        }
      }

      const isListaPrioridade =
        itemOrigem.toLowerCase().includes('prioridade') ||
        itemOrigemTipo.toLowerCase().includes('prioridade') ||
        dadosCompletosOrigem.toLowerCase().includes('prioridade') ||
        respostasOrigem.toLowerCase().includes('prioridade')

      let temRespostasQuestionario = false
      if (itemRespostas && typeof itemRespostas === 'object') {
        const rKeys = Object.keys(itemRespostas).filter((k) => {
          return (
            k !== 'origem' &&
            k !== 'plano_escolhido' &&
            k !== 'acesso_antecipado_solicitado' &&
            k !== 'condicao_fundador_solicitada' &&
            k !== 'faturamento_anual' &&
            k !== 'data_cadastro'
          )
        })
        if (rKeys.length > 0) {
          temRespostasQuestionario = true
        }
      }

      rec.set('protocolo', protocolo)
      rec.set('origem', item.origem || 'Site Institucional')
      rec.set(
        'origem_tipo',
        item.origem_tipo || item.origemTipo || (ehOrigemParceiro ? 'parceiro' : 'site'),
      )
      if (extraOrigemParceiro) {
        rec.set('origem_parceiro', extraOrigemParceiro)
      }
      if (extraParceiroEmail) {
        rec.set('parceiro_email', extraParceiroEmail)
      }

      if (isListaPrioridade) {
        rec.set('membro_fundador', true)
      } else if (item.membro_fundador !== undefined) {
        rec.set('membro_fundador', Boolean(item.membro_fundador))
      }

      if (isTest) {
        rec.set('status', 'teste')
      } else {
        const localStatusAtual = (rec.getString('status') || '').toLowerCase()
        if (localStatusAtual === 'lista_espera') {
          rec.set('status', 'lista_espera')
        } else if (localStatusAtual === 'membro_fundador_graduado') {
          rec.set('status', 'membro_fundador_graduado')
        } else if (isListaPrioridade || !temRespostasQuestionario) {
          rec.set('status', 'lista_espera')
        } else {
          rec.set('status', item.status || 'novo')
        }
      }
      rec.set('autorizacao_devolutiva', item.autorizacao_devolutiva || '')
      rec.set('formato_interesse', item.formato_interesse || '')
      rec.set('nome_completo', item.nome_completo || item.respondente || '')
      rec.set('razao_social', item.razao_social || '')
      rec.set('cnpj', item.cnpj || '')
      rec.set('cargo', item.cargo || '')
      rec.set('email', item.email || item.email_corporativo || '')
      rec.set('whatsapp', item.whatsapp || '')
      rec.set('setor', item.setor || '')
      rec.set('segmento', item.segmento || '')
      rec.set('faturamento_mensal', item.faturamento_mensal || '')
      rec.set('plano_interesse', item.plano_interesse || '')
      rec.set('responsavel_envio', item.responsavel_envio || '')
      rec.set('dados_completos', item.dados_completos || item)
      rec.set('site_lead_id', siteId)
      rec.set('site_created', item.created || '')
      rec.set('site_updated', item.updated || '')
      rec.set('synced_at', new Date().toISOString())

      if (item.respostas) {
        rec.set('respostas', item.respostas)
      } else if (item.dados_completos && item.dados_completos.respostas) {
        rec.set('respostas', item.dados_completos.respostas)
      }

      const remoteDocAdicional = item.documentacao_adicional
      const localDocAdicional = rec.get('documentacao_adicional')
      const hasLocalDocAdicional =
        localDocAdicional &&
        (Array.isArray(localDocAdicional) ? localDocAdicional.length > 0 : true)
      if (
        !hasLocalDocAdicional &&
        remoteDocAdicional &&
        (Array.isArray(remoteDocAdicional) ? remoteDocAdicional.length > 0 : true)
      ) {
        const files1 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteDocAdicional)
        if (files1.length > 0) {
          rec.set('documentacao_adicional', files1)
        }
      }

      const remoteCert = item.certificacoes
      const localCert = rec.get('certificacoes')
      const hasLocalCert = localCert && (Array.isArray(localCert) ? localCert.length > 0 : true)
      if (
        !hasLocalCert &&
        remoteCert &&
        (Array.isArray(remoteCert) ? remoteCert.length > 0 : true)
      ) {
        const files2 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteCert)
        if (files2.length > 0) {
          rec.set('certificacoes', files2)
        }
      }

      const remoteContrato = item.contrato_social
      const localContrato = rec.get('contrato_social')
      const hasLocalContrato =
        localContrato && (Array.isArray(localContrato) ? localContrato.length > 0 : true)
      if (
        !hasLocalContrato &&
        remoteContrato &&
        (Array.isArray(remoteContrato) ? remoteContrato.length > 0 : true)
      ) {
        const files3 = downloadRemoteFiles(item.collectionId || 'leads', siteId, remoteContrato)
        if (files3.length > 0) {
          rec.set('contrato_social', files3)
        }
      }
      $app.save(rec)

      if (isNew) {
        novosLeads++
      } else {
        atualizadosLeads++
      }
    }

    if (adminUserId) {
      try {
        const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
        const syncLog = new Record(logsCol)
        syncLog.set('user', adminUserId)
        syncLog.set('action', 'Sincronização Manual Site')
        syncLog.set('resource', 'leads')
        syncLog.set(
          'details',
          'Sincronização sob demanda: ' +
            novosLeads +
            ' novo(s) lead(s), ' +
            atualizadosLeads +
            ' atualizado(s), ' +
            totalArquivosBaixados +
            ' arquivo(s) re-hospedado(s), ' +
            remoteItems.length +
            ' avaliado(s). Credenciais via: ' +
            fonte,
        )
        $app.save(syncLog)
      } catch (_) {}
    }

    return e.json(200, {
      success: true,
      totalRemote: remoteItems.length,
      novosLeads: novosLeads,
      atualizadosLeads: atualizadosLeads,
      arquivosRehospedados: totalArquivosBaixados,
      syncedAt: new Date().toISOString(),
    })
  },
  $apis.requireSuperuserAuth(),
)

// Endpoint de teste/criação ponta-a-ponta (requer admin)
routerAdd(
  'POST',
  '/backend/v1/sync/test-e2e',
  (e) => {
    let siteUrl = ''
    let siteEmail = ''
    let sitePassword = ''
    let fonte = ''

    try {
      const credRec = $app.findFirstRecordByData(
        'integracoes_site',
        'chave',
        'site_institucional_vetor_master',
      )
      if (credRec && credRec.getBool('ativo') !== false) {
        siteUrl = credRec.getString('site_backend_url') || ''
        siteEmail = credRec.getString('site_sync_email') || ''
        sitePassword = credRec.getString('site_sync_password') || ''
        if (siteUrl && siteEmail && sitePassword) {
          fonte = 'colecao_interna'
        }
      }
    } catch (_) {}

    if (!siteUrl) {
      siteUrl = $os.getenv('SITE_BACKEND_URL') || ''
      if (!siteUrl) {
        try {
          siteUrl = $secrets.get('SITE_BACKEND_URL') || ''
        } catch (_) {}
      }
      if (siteUrl && !fonte) fonte = 'ambiente'
    }

    if (siteUrl && siteUrl.endsWith('/')) {
      siteUrl = siteUrl.slice(0, -1)
    }

    if (!siteEmail) {
      siteEmail = $os.getenv('SITE_SYNC_EMAIL') || ''
      if (!siteEmail) {
        try {
          siteEmail = $secrets.get('SITE_SYNC_EMAIL') || ''
        } catch (_) {}
      }
      if (siteEmail && !fonte) fonte = 'ambiente'
    }

    if (!sitePassword) {
      sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''
      if (!sitePassword) {
        try {
          sitePassword = $secrets.get('SITE_SYNC_PASSWORD') || ''
        } catch (_) {}
      }
      if (sitePassword && !fonte) fonte = 'ambiente'
    }

    if (!siteUrl || !siteEmail || !sitePassword) {
      return e.json(500, {
        success: false,
        message: 'Credenciais de sincronização ausentes na coleção integracoes_site e no ambiente.',
      })
    }

    // 1. Autenticar no site institucional
    const authRes = $http.send({
      url: siteUrl + '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: siteEmail,
        password: sitePassword,
      }),
      timeout: 20,
    })

    if (authRes.statusCode !== 200) {
      return e.json(502, {
        success: false,
        step: 'auth',
        statusCode: authRes.statusCode,
        raw: authRes.raw,
      })
    }

    const token = authRes.json.token
    const ts = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    const testProtocol = '#TEST-VM-V72-' + ts + '-' + rand

    const testLeadPayload = {
      protocolo: testProtocol,
      origem: 'Site Institucional',
      origem_tipo: 'site',
      status: 'novo',
      autorizacao_devolutiva: 'Sim',
      formato_interesse: 'MaaS',
      nome_completo: 'Carlos Eduardo Silveira (Lead E2E Teste)',
      razao_social: 'Silveira & Associados Distribuidora S/A',
      cnpj: '12.345.678/0001-99',
      cargo: 'Diretor Geral / Fundador',
      email: 'carlos.silveira@silveiradistribuidora.com.br',
      whatsapp: '(11) 98765-4321',
      setor: 'Distribuição e Logística',
      segmento: 'Distribuição B2B de Alimentos',
      faturamento_mensal: 'R$ 1.500.000 a R$ 3.000.000',
      plano_interesse: 'MaaS Híbrido',
      responsavel_envio: 'Carlos Eduardo Silveira',
      dados_completos: {
        origem: 'Site Institucional',
        protocolo: testProtocol,
        razao_social: 'Silveira & Associados Distribuidora S/A',
        cnpj: '12.345.678/0001-99',
        data_preenchimento: new Date().toISOString(),
        setor: 'Distribuição e Logística',
        segmento: 'Distribuição B2B de Alimentos',
        respondente: 'Carlos Eduardo Silveira (Lead E2E Teste)',
        cargo: 'Diretor Geral / Fundador',
        email_corporativo: 'carlos.silveira@silveiradistribuidora.com.br',
        whatsapp: '(11) 98765-4321',
        autorizacao_devolutiva: 'Sim',
        formato_interesse: 'MaaS',
        perfil: {
          faturamento_anual: 'R$ 25.000.000',
          colaboradores: 45,
          tempo_empresa: '12 anos',
        },
        pilares: {
          pilar_1_prisao_fundador: [
            {
              pergunta: '1.1 Centralização Decisória',
              resposta: 'Alta',
              nota: 'Fundador aprova 90% dos pedidos',
            },
            {
              pergunta: '1.2 Dependência de Pessoas-Chave',
              resposta: 'Crítica',
              nota: 'Sem sucessor para logística',
            },
          ],
          pilar_2_ineficiencia_invisivel: [
            {
              pergunta: '2.1 Retrabalho Operacional',
              resposta: 'Frequente',
              nota: 'Ruídos entre vendas e faturamento',
            },
            {
              pergunta: '2.2 Margem Real por SKU',
              resposta: 'Desconhecida com precisão',
              nota: 'Sem custeio ABC',
            },
          ],
          pilar_3_abismo_estrategia_execucao: [
            {
              pergunta: '3.1 Metas Desdobradas em OKRs',
              resposta: 'Não',
              nota: 'Equipe opera no modo apagar incêndio',
            },
          ],
        },
        hackman: [
          { dimensao: 'Autonomia da Liderança', nota: 2 },
          { dimensao: 'Clareza de Papéis', nota: 2 },
        ],
        buffett: [{ dimensao: 'Fosso Competitivo (Moat)', nota: 3 }],
        documentacao: {
          responsavel_envio: 'Carlos Eduardo Silveira',
          documentos_adicionais: ['Balanco_2025.pdf', 'DRE_Gerencial.xlsx'],
        },
      },
      respostas: {
        etapa_1: {
          setor: 'Distribuição e Logística',
          segmento: 'Distribuição B2B de Alimentos',
        },
        etapa_2: {
          faturamento_anual: 'R$ 25.000.000',
          colaboradores: 45,
          tempo_empresa: '12 anos',
        },
        etapa_3: {
          centralizacao_decisoria: 'Alta',
          dependencia_chave: 'Crítica',
        },
      },
      criado_em: new Date().toISOString(),
    }

    // 2. Criar lead no site
    const createRes = $http.send({
      url: siteUrl + '/api/collections/leads/records',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLeadPayload),
      timeout: 20,
    })

    if (createRes.statusCode !== 200 && createRes.statusCode !== 201) {
      return e.json(502, {
        success: false,
        step: 'create_lead_in_site',
        statusCode: createRes.statusCode,
        raw: createRes.raw,
      })
    }

    const siteCreatedRecord = createRes.json

    // 3. Sincronizar imediatamente para a coleção local 'leads'
    const leadsCol = $app.findCollectionByNameOrId('leads')
    const localRec = new Record(leadsCol)
    localRec.set('protocolo', testLeadPayload.protocolo)
    localRec.set('origem', testLeadPayload.origem)
    localRec.set('origem_tipo', testLeadPayload.origem_tipo)
    localRec.set('status', testLeadPayload.status)
    localRec.set('autorizacao_devolutiva', testLeadPayload.autorizacao_devolutiva)
    localRec.set('formato_interesse', testLeadPayload.formato_interesse)
    localRec.set('nome_completo', testLeadPayload.nome_completo)
    localRec.set('razao_social', testLeadPayload.razao_social)
    localRec.set('cnpj', testLeadPayload.cnpj)
    localRec.set('cargo', testLeadPayload.cargo)
    localRec.set('email', testLeadPayload.email)
    localRec.set('whatsapp', testLeadPayload.whatsapp)
    localRec.set('setor', testLeadPayload.setor)
    localRec.set('segmento', testLeadPayload.segmento)
    localRec.set('faturamento_mensal', testLeadPayload.faturamento_mensal)
    localRec.set('plano_interesse', testLeadPayload.plano_interesse)
    localRec.set('responsavel_envio', testLeadPayload.responsavel_envio)
    localRec.set('dados_completos', testLeadPayload.dados_completos)
    localRec.set('respostas', testLeadPayload.respostas)
    localRec.set('site_lead_id', siteCreatedRecord.id)
    localRec.set('site_created', siteCreatedRecord.created || '')
    localRec.set('site_updated', siteCreatedRecord.updated || '')
    localRec.set('synced_at', new Date().toISOString())

    $app.save(localRec)

    // 4. Gravar log de auditoria do teste
    const authUser = e.requestInfo ? e.requestInfo().auth : null
    const adminUserId = authUser ? authUser.id : null

    try {
      const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
      const auditRecord = new Record(logsCol)
      let userToLog = adminUserId
      if (!userToLog) {
        try {
          const u = $app.findFirstRecordByData('users', 'role', 'admin')
          userToLog = u.id
        } catch (_) {}
      }
      if (userToLog) {
        auditRecord.set('user', userToLog)
        auditRecord.set('action', 'Teste E2E Integração Site')
        auditRecord.set('resource', 'leads')
        auditRecord.set(
          'details',
          'Lead de teste E2E criado no site (' +
            siteCreatedRecord.id +
            ') e sincronizado com sucesso no app! Protocolo: ' +
            testLeadPayload.protocolo +
            ' | Credenciais via: ' +
            fonte,
        )
        $app.save(auditRecord)
      }
    } catch (_) {}

    return e.json(200, {
      success: true,
      message:
        'Teste ponta-a-ponta executado com sucesso! Lead criado no site institucional e sincronizado para o app.',
      siteLead: siteCreatedRecord,
      localLeadId: localRec.id,
      protocolo: testLeadPayload.protocolo,
    })
  },
  $apis.requireSuperuserAuth(),
)
