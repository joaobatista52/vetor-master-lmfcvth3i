/// <reference path="../pb_data/types.d.ts" />

/**
 * REPROCESSAMENTO POR FASE — VETOR MASTER (FASE 4 CaaS)
 * Rota restrita ao consultor / admin com parâmetro de cascata.
 *
 * Rota: POST /backend/v1/diagnostico/reprocessar-fase/{leadId}/{fase}
 *
 * Corpo esperado (JSON):
 * - cascata: obrigatório ('total' | 'seletiva' | 'nenhuma')
 * - fases_afetadas: array de inteiros 1–13 (obrigatório se cascata === 'seletiva')
 * - motivo: texto obrigatório com a justificativa do reprocessamento
 */

routerAdd('POST', '/backend/v1/diagnostico/reprocessar-fase/{leadId}/{fase}', (e) => {
  // 1. Autenticação e autorização: verificação do usuário autenticado (papel admin / consultor)
  let authUser = null
  try {
    authUser = e.auth || (e.requestInfo && e.requestInfo().auth)
  } catch (_) {}

  let isAdmin = false
  if (authUser) {
    if (authUser.role === 'admin' || authUser.getString?.('role') === 'admin') {
      isAdmin = true
    }
  }

  if (!isAdmin) {
    return e.json(403, { erro: 'NAO_AUTORIZADO' })
  }

  const consultorId = (authUser && authUser.id) || (authUser && authUser.getString?.('id')) || ''

  // 2. Validação de entrada
  const faseParamRaw = e.request.pathValue('fase')
  const faseNum = Number(faseParamRaw)
  if (!Number.isInteger(faseNum) || faseNum < 1 || faseNum > 13) {
    return e.json(400, { erro: 'FASE_INVALIDA' })
  }

  let body = {}
  try {
    const rawBody = (e.requestInfo && e.requestInfo().body) || {}
    body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
  } catch (_) {
    return e.json(400, { erro: 'JSON_INVALIDO' })
  }

  const cascata = body ? body.cascata : null
  if (cascata !== 'total' && cascata !== 'seletiva' && cascata !== 'nenhuma') {
    return e.json(400, { erro: 'CASCATA_INVALIDA' })
  }

  const fasesAfetadas = body ? body.fases_afetadas : null
  if (cascata === 'seletiva') {
    if (
      !Array.isArray(fasesAfetadas) ||
      fasesAfetadas.length === 0 ||
      !fasesAfetadas.every((f) => Number.isInteger(Number(f)) && Number(f) >= 1 && Number(f) <= 13)
    ) {
      return e.json(400, { erro: 'FASES_AFETADAS_OBRIGATORIAS' })
    }
  }

  const motivo = body ? body.motivo : null
  if (!motivo || typeof motivo !== 'string' || motivo.trim().length === 0) {
    return e.json(400, { erro: 'MOTIVO_OBRIGATORIO' })
  }

  const leadId = e.request.pathValue('leadId')
  if (!leadId) {
    return e.json(404, { erro: 'DIAGNOSTICO_NAO_ENCONTRADO' })
  }

  // 3. Leitura do diagnóstico e do lead correspondente
  let diagRec = null
  try {
    diagRec = $app.findFirstRecordByData('diagnosticos', 'lead', leadId)
  } catch (_) {
    return e.json(404, { erro: 'DIAGNOSTICO_NAO_ENCONTRADO' })
  }

  let leadRec = null
  try {
    leadRec = $app.findRecordById('leads', leadId)
  } catch (_) {
    return e.json(404, { erro: 'DIAGNOSTICO_NAO_ENCONTRADO' })
  }

  // 4. Cálculo da próxima versão para (diagnostico, fase)
  // Consulta diagnostico_fases filtrando por diagnostico e fase, ordenando decrescente por versao
  let novaVersao = 1
  try {
    const registrosFaseAnteriores = $app.findRecordsByFilter(
      'diagnostico_fases',
      "diagnostico = '" + diagRec.id + "' && fase = " + faseNum,
      '-versao',
      1,
      0,
    )
    if (registrosFaseAnteriores && registrosFaseAnteriores.length > 0) {
      const maiorVersao = registrosFaseAnteriores[0].getInt('versao') || 0
      novaVersao = maiorVersao + 1
    }
  } catch (_) {
    novaVersao = 1
  }

  // 5. Chamada ao motor: POST para /backend/v1/servico-diagnostico
  let servicoUrl = 'http://127.0.0.1:8090'
  try {
    const pbUrlEnv = $os.getenv('PB_INSTANCE_URL') || $os.getenv('VITE_POCKETBASE_URL')
    if (pbUrlEnv) servicoUrl = pbUrlEnv.replace(/\/+$/, '')
  } catch (_) {}

  const razaoSocial =
    leadRec.getString('razao_social') || leadRec.getString('nome_completo') || 'Cliente'
  const setor = leadRec.getString('setor') || diagRec.getString('setor') || 'Indústria'
  const protocolo = leadRec.getString('protocolo') || '#VM-' + leadId
  const autorizacaoRaw =
    leadRec.getString('autorizacao_devolutiva') ||
    diagRec.getString('autorizacao_devolutiva') ||
    'Não autorizo'
  const versaoQuestionario =
    leadRec.getString('versao_questionario') || diagRec.getString('versao_questionario') || 'V7.2'
  const origemTipo = (leadRec.getString('origem_tipo') || 'direto').toLowerCase()
  const origemParceiro = leadRec.getString('origem_parceiro') || ''
  const isParceiro = origemTipo === 'parceiro' || !!origemParceiro

  const payloadDossie = {
    protocolo: protocolo,
    cliente: {
      razao_social: razaoSocial,
      cnpj: leadRec.getString('cnpj') || '',
      cargo: leadRec.getString('cargo') || '',
      email: leadRec.getString('email') || '',
      whatsapp: leadRec.getString('whatsapp') || '',
      setor: setor,
      segmento: leadRec.getString('segmento') || '',
      faturamento_declarado: leadRec.getString('faturamento_mensal') || '',
      formato_interesse: leadRec.getString('formato_interesse') || '',
      autorizacao_devolutiva: autorizacaoRaw,
      versao_questionario: versaoQuestionario,
      origem_tipo: isParceiro ? 'parceiro' : 'direto',
      origem_parceiro: origemParceiro,
    },
    respostas: leadRec.get('respostas') || {},
    dados_completos: leadRec.get('dados_completos') || {},
    anexos: {
      demonstrativos: leadRec.get('contrato_social') || [],
      relatorios: leadRec.get('certificacoes') || [],
      complementares: leadRec.get('documentacao_adicional') || [],
    },
  }

  const payloadMotor = {
    dossie: payloadDossie,
    metadados: {
      lead_id: leadId,
      versao_questionario: versaoQuestionario,
      autorizacao_devolutiva: autorizacaoRaw,
      origem_tipo: isParceiro ? 'parceiro' : 'direto',
      origem_parceiro: origemParceiro,
    },
    fase_unica: faseNum,
    user_id: consultorId,
  }

  let respostaMotor = null
  let statusHttp = 0

  try {
    const resHttp = $http.send({
      url: servicoUrl + '/backend/v1/servico-diagnostico',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadMotor),
      timeout: 300,
    })

    statusHttp = resHttp ? resHttp.statusCode : 0
    if (resHttp && resHttp.raw) {
      respostaMotor = JSON.parse(resHttp.raw)
    }
  } catch (errHttp) {
    const errMsg = errHttp.message || String(errHttp)
    $app.logger().error('Reprocessar Fase: Erro HTTP ao conectar ao motor: ' + errMsg)
    return e.json(500, {
      sucesso: false,
      erro: 'FALHA_CONEXAO_MOTOR',
      motivo: errMsg,
    })
  }

  // 6. Tratamento da resposta do motor
  // Falha do motor ou PORTAO_REPROVADO: retorne o erro sem gravar em diagnostico_fases
  if (statusHttp === 422 || (respostaMotor && respostaMotor.codigo_erro === 'PORTAO_REPROVADO')) {
    return e.json(422, {
      sucesso: false,
      erro: 'PORTAO_REPROVADO',
      motivo:
        (respostaMotor && respostaMotor.motivo) ||
        'Portão reprovado durante reprocessamento da fase.',
      prompt_id: respostaMotor && respostaMotor.prompt_id,
      titulo: respostaMotor && respostaMotor.titulo,
      output_reprovado: respostaMotor && respostaMotor.output_reprovado,
    })
  }

  if (statusHttp !== 200 || !respostaMotor || !respostaMotor.sucesso) {
    const erroDesc =
      (respostaMotor &&
        (respostaMotor.motivo || respostaMotor.erro || respostaMotor.codigo_erro)) ||
      'Falha na execução do motor de diagnóstico.'
    return e.json(500, {
      sucesso: false,
      erro: 'FALHA_MOTOR',
      motivo: erroDesc,
    })
  }

  // Sucesso: extrai o output da fase reprocessada
  const fasesRetornadas = respostaMotor.output_fases || []
  let outputDaFase = null
  for (let idx = 0; idx < fasesRetornadas.length; idx++) {
    const f = fasesRetornadas[idx]
    if (f && f.fase === faseNum) {
      outputDaFase = f
      break
    }
  }
  if (!outputDaFase && fasesRetornadas.length > 0) {
    outputDaFase = fasesRetornadas[0]
  }
  if (!outputDaFase) {
    outputDaFase = { fase: faseNum, reprocessado_em: new Date().toISOString() }
  }

  // Gravar novo registro em diagnostico_fases
  const colDiagFases = $app.findCollectionByNameOrId('diagnostico_fases')
  const novoRegistroFase = new Record(colDiagFases)

  novoRegistroFase.set('diagnostico', diagRec.id)
  novoRegistroFase.set('lead', leadId)
  novoRegistroFase.set('fase', faseNum)
  novoRegistroFase.set('versao', novaVersao)
  novoRegistroFase.set('output', outputDaFase)
  novoRegistroFase.set('status', 'reprocessada')
  novoRegistroFase.set('consultor_id', consultorId)
  novoRegistroFase.set('motivo_reprocessamento', motivo.trim())
  novoRegistroFase.set('cascata_aplicada', cascata)
  novoRegistroFase.set('executado_via', 'reprocessamento_consultor')
  novoRegistroFase.set('custo_gateway', respostaMotor.custo_gateway || null)

  $app.save(novoRegistroFase)

  // 7. Aplicação da cascata
  const fasesMarcadasDesatualizadas = []

  if (cascata === 'total') {
    // Marcar como 'desatualizada' todos os registros de diagnostico_fases do mesmo diagnóstico
    // com fase maior que a fase reprocessada, na versão mais recente de cada fase
    for (let fPosterior = faseNum + 1; fPosterior <= 13; fPosterior++) {
      try {
        const registrosPosteriores = $app.findRecordsByFilter(
          'diagnostico_fases',
          "diagnostico = '" + diagRec.id + "' && fase = " + fPosterior,
          '-versao',
          1,
          0,
        )
        if (registrosPosteriores && registrosPosteriores.length > 0) {
          const maisRecente = registrosPosteriores[0]
          if (maisRecente.getString('status') !== 'desatualizada') {
            maisRecente.set('status', 'desatualizada')
            $app.save(maisRecente)
            fasesMarcadasDesatualizadas.push(fPosterior)
          }
        }
      } catch (_) {}
    }
  } else if (cascata === 'seletiva') {
    // Marcar como 'desatualizada' apenas os registros das fases listadas em fases_afetadas,
    // na versão mais recente de cada uma
    const fasesAfetadasNumeros = fasesAfetadas.map((f) => Number(f))
    for (let idxF = 0; idxF < fasesAfetadasNumeros.length; idxF++) {
      const fAlvo = fasesAfetadasNumeros[idxF]
      try {
        const registrosAlvo = $app.findRecordsByFilter(
          'diagnostico_fases',
          "diagnostico = '" + diagRec.id + "' && fase = " + fAlvo,
          '-versao',
          1,
          0,
        )
        if (registrosAlvo && registrosAlvo.length > 0) {
          const maisRecente = registrosAlvo[0]
          if (maisRecente.getString('status') !== 'desatualizada') {
            maisRecente.set('status', 'desatualizada')
            $app.save(maisRecente)
            fasesMarcadasDesatualizadas.push(fAlvo)
          }
        }
      } catch (_) {}
    }
  }
  // Se cascata === 'nenhuma', fasesMarcadasDesatualizadas permanece vazio e nenhum outro registro é alterado

  // 8. Retorno
  return e.json(200, {
    sucesso: true,
    fase: faseNum,
    versao: novaVersao,
    cascata_aplicada: cascata,
    fases_marcadas_desatualizadas: fasesMarcadasDesatualizadas,
  })
})
