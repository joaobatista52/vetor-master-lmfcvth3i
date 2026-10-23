onRecordAfterCreateSuccess((e) => {
  // Se o registro já possui status concluído ou output_prompts gerados por outro hook/worker (ex.: Trilha A), não sobrescrever
  if (e.record.getString('status') === 'concluido' || e.record.get('output_prompts')) {
    return e.next()
  }

  var dados = e.record.get('dados_entrada')
  if (!dados) return e.next()

  var userId = e.record.getString('user')
  var dadosStr = typeof dados === 'string' ? dados : JSON.stringify(dados)

  // V6.5 — Instrui o agente a usar o Bloco Setorial parametrizavel (3 Pilares)
  // e as micro-epifanias do setor selecionado pelo lead.
  var messageText =
    'Contexto: JBP Gestao Master V6.5. Analise os dados de diagnostico abaixo (incluindo o setor e as respostas do Questionario Estrutural dos 3 Pilares) e gere o Diagnostico Executivo Estrategico com Heat Map das 8 areas, conforme o formato JSON especificado. Use as micro-epifanias do setor para gerar urgencia. Lembre-se: diagnostico gratuito = apenas dores + heat map + teaser (sem 5W2H/OKRs/financas detalhadas).\n\n' +
    dadosStr

  try {
    var result = $ai.agent('jbp-gestao-master').chat({
      user_id: userId,
      conversation_id: null,
      message: messageText,
    })

    var content = result.content || ''
    var relatorio = content
    var heatMap = null

    var jsonStart = content.indexOf('{')
    var jsonEnd = content.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      var jsonStr = content.substring(jsonStart, jsonEnd + 1)
      try {
        var parsed = JSON.parse(jsonStr)
        if (parsed.relatorio) relatorio = parsed.relatorio
        if (parsed.heat_map) heatMap = parsed.heat_map
      } catch (_) {}
    }

    var record = $app.findRecordById('diagnosticos', e.record.id)
    record.set('relatorio_gerado', relatorio)
    record.set('fase_atual', 1)

    if (heatMap) {
      var existingDados = record.get('dados_entrada')
      if (!existingDados || typeof existingDados !== 'object' || Array.isArray(existingDados)) {
        existingDados = {}
      }
      try {
        existingDados.heat_map = heatMap
        record.set('dados_entrada', existingDados)
      } catch (_) {}
    }

    $app.save(record)
  } catch (err) {
    var fallbackRecord = $app.findRecordById('diagnosticos', e.record.id)
    fallbackRecord.set(
      'relatorio_gerado',
      '## Diagnóstico em Processamento\n\nSeu diagnóstico estratégico V7.2.3 está sendo processado pela equipe especializada.',
    )
    $app.save(fallbackRecord)
    console.log('diagnosis report generation failed for record ' + e.record.id + ': ' + err.message)
  }

  return e.next()
}, 'diagnosticos')
