/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // 0078_criar_copia_teste_beatek.js
    // PASSO 1 DO PROTOCOLO DE TESTE (22/10/2026):
    // Criar a CÓPIA do dossiê Beatek (id: 6e8y7ju5owgfpsl) marcada como status 'teste'
    // O lead REAL '6e8y7ju5owgfpsl' permanece rigorosamente INTOCADO.

    const leadRealId = '6e8y7ju5owgfpsl'
    const leadReal = app.findRecordById('leads', leadRealId)
    if (!leadReal) {
      console.log('Lead real Beatek não encontrado para cópia')
      return
    }

    const copiaId = 'beatekteste2026'
    let copiaRecord = null
    try {
      copiaRecord = app.findRecordById('leads', copiaId)
    } catch (_) {
      const leadsCol = app.findCollectionByNameOrId('leads')
      copiaRecord = new Record(leadsCol)
      copiaRecord.set('id', copiaId)
    }

    // Copiar dados cadastrais e respostas
    copiaRecord.set('nome_completo', leadReal.getString('nome_completo'))
    copiaRecord.set('email', leadReal.getString('email'))
    copiaRecord.set('whatsapp', leadReal.getString('whatsapp'))
    copiaRecord.set('cargo', leadReal.getString('cargo'))
    copiaRecord.set('empresa', leadReal.getString('empresa') || leadReal.getString('razao_social'))
    copiaRecord.set(
      'razao_social',
      'BEATEK INDÚSTRIA E COMÉRCIO DE ELETRO-ELTRÔNICOS LTDA - EPP (TESTE)',
    )
    copiaRecord.set('cnpj', leadReal.getString('cnpj'))
    copiaRecord.set('setor', leadReal.getString('setor'))
    copiaRecord.set('segmento', leadReal.getString('segmento'))
    copiaRecord.set('faturamento_mensal', leadReal.getString('faturamento_mensal'))
    copiaRecord.set('formato_interesse', leadReal.getString('formato_interesse'))
    copiaRecord.set('autorizacao_devolutiva', leadReal.getString('autorizacao_devolutiva'))
    copiaRecord.set('origem', 'Parceiro RGS (Cópia Homologação Protocolo 22out26)')
    copiaRecord.set('origem_tipo', 'parceiro')
    copiaRecord.set('origem_parceiro', 'RGS')
    copiaRecord.set('parceiro_email', leadReal.getString('parceiro_email'))
    copiaRecord.set('parceiro_confirmou', false)
    copiaRecord.set('membro_fundador', false)
    copiaRecord.set('consentimento_lgpd', true)

    // Clonar payload do dossiê JSON integral e respostas
    copiaRecord.set('respostas', leadReal.get('respostas') || {})

    // Assegurar que os nomes dos anexos estejam catalogados nos dados_completos da cópia
    const dadosCompletosClonados = JSON.parse(JSON.stringify(leadReal.get('dados_completos') || {}))
    copiaRecord.set('dados_completos', dadosCompletosClonados)

    // Protocolo exclusivo de teste
    copiaRecord.set('protocolo', '#VM-TESTE-BEATEK-22OUT26')

    // Estado inicial de teste para acionamento pelo worker
    copiaRecord.set('status', 'teste')

    app.save(copiaRecord)
    console.log('Cópia de teste Beatek criada com sucesso:', copiaRecord.id)
  },
  (app) => {
    try {
      const rec = app.findRecordById('leads', 'beatekteste2026')
      if (rec) app.delete(rec)
    } catch (_) {}
  },
)
