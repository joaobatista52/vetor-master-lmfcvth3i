/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // Ajuste do lead Beatek (id: 6e8y7ju5owgfpsl)
    // (4) Corrigir o lead Beatek (id 6e8y7ju5owgfpsl): origem parceiro 'RGS', parceiro_email 'gleverton@smartcapex.com.br', celular do parceiro conforme questionário.
    try {
      const lead = app.findRecordById('leads', '6e8y7ju5owgfpsl')
      if (lead) {
        lead.set('origem', 'Parceiro RGS')
        lead.set('origem_tipo', 'parceiro')
        lead.set('origem_parceiro', 'RGS')
        lead.set('parceiro_email', 'gleverton@smartcapex.com.br')

        const dados = lead.get('dados_completos') || {}
        dados.origem = 'Parceiro RGS'
        dados.origem_tipo = 'parceiro'
        dados.origem_parceiro = 'RGS'
        dados.parceiro_email = 'gleverton@smartcapex.com.br'
        dados.parceiro_nome = 'Gleverton / RGS'

        if (dados.cadastro) {
          dados.cadastro.origem = 'Parceiro RGS'
          dados.cadastro.origem_parceiro = 'RGS'
          dados.cadastro.parceiro_email = 'gleverton@smartcapex.com.br'
        }

        lead.set('dados_completos', dados)
        app.save(lead)
      }
    } catch (err) {}
  },
  (app) => {},
)
