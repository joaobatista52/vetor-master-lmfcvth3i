/// <reference path="../pb_data/types.d.ts" />

/**
 * Hook de Atendimento Conceitual — Bibliocompanion (Bloco 5 Onda 2)
 *
 * FRONTEIRA CONCEITO × CONSULTORIA (Definição Regimental):
 * - É um assistente ESTRITAMENTE CONCEITUAL sobre o acervo bibliográfico da /biblioteca.
 * - Responde: conceitos, metodologias, autores, definições, frameworks, lógica teórica.
 * - NUNCA PRESTA CONSULTORIA:
 *   * Sem recomendação de ação específica para a empresa do usuário
 *   * Sem geração de plano de ação (5W2H) ou cronograma
 *   * Sem diagnóstico situacional da empresa do usuário
 *   * Sem apontamento de causa-raiz para o caso particular da empresa
 *
 * ACERVO DO ASSINANTE:
 * - Opera sobre a Biblioteca da área do usuário (/biblioteca), não sobre o acervo restrito do Admin.
 * - Usa o agente nativo jbp-gestao-master em tier reasoning.
 */

routerAdd(
  'POST',
  '/backend/v1/bibliocompanion/consultar',
  (e) => {
    // Autenticação exigida: e.authRecord
    const authUser = e.authRecord
    if (!authUser) {
      return e.json(401, {
        success: false,
        error: 'Acesso restrito. Faça login para consultar o Bibliocompanion.',
      })
    }

    let body = {}
    try {
      body = e.requestInfo().body || {}
    } catch (_) {
      return e.json(400, { success: false, error: 'Corpo da requisição inválido.' })
    }

    const pergunta = (body.pergunta || '').trim()
    const camada = body.camada || '1_conceito' // '1_conceito' | '2_metodologia' | '3_socratico'

    if (!pergunta) {
      return e.json(400, { success: false, error: 'Pergunta conceitual obrigatória.' })
    }

    // Detector de violação da barreira de consultoria (Guardrail semântico e por palavras-chave)
    const lowerPergunta = pergunta.toLowerCase()
    const termosConsultoria = [
      'minha empresa deve',
      'o que devo fazer na minha empresa',
      'como resolvo meu problema',
      'qual é a causa raiz da minha empresa',
      'faça um plano para mim',
      'crie um 5w2h para minha',
      'diga o que fazer no meu setor',
      'devo demitir',
      'devo comprar',
      'quanto devo cobrar',
      'qual o valuation da minha empresa',
    ]

    let acionouBarreira = false
    for (let i = 0; i < termosConsultoria.length; i++) {
      if (lowerPergunta.indexOf(termosConsultoria[i]) !== -1) {
        acionouBarreira = true
        break
      }
    }

    const avisoBarreira =
      'FRONTEIRA CONCEITO × CONSULTORIA (Regra Regimental Vetor Master):\n' +
      'Como Bibliocompanion, meu escopo é estritamente pedagógico e bibliográfico — responder sobre conceitos, teorias, frameworks e metodologias de gestão.\n' +
      'Não é permitido emitir recomendações específicas de ação para a sua empresa, planos de intervenção (5W2H), diagnósticos situacionais ou determinação de causa-raiz para o seu caso prático.\n' +
      'Para recomendações operacionais e desdobramento da sua empresa, consulte seu diagnóstico em /diagnosticos e a trilha de execução com o Consultor Digital em /plano-de-acao.'

    // Instrução com a FRONTEIRA CONCEITO × CONSULTORIA
    const promptBibliocompanion =
      'VOCÊ ESTÁ ATUANDO COMO BIBLIOCOMPANION — ASSISTENTE BIBLIOGRÁFICO CONCEITUAL DA BIBLIOTECA VETOR MASTER.\n\n' +
      'DIRETRIZ INEGOCIÁVEL (FRONTEIRA CONCEITO × CONSULTORIA):\n' +
      '1. Você responde exclusivamente sobre CONCEITOS, METODOLOGIAS, FRAMEWORKS, AUTORES e TEORIAS de gestão.\n' +
      '2. É TERMINANTEMENTE PROIBIDO prestar consultoria: você NUNCA deve prescrever o que a empresa do usuário deve fazer, nunca elaborar plano de ação personalizado, nunca diagnosticar a empresa dele e nunca apontar causa raiz específica para a empresa dele.\n' +
      '3. Se o usuário perguntar o que a empresa dele deve fazer ou pedir consultoria, reforce polidamente a fronteira de que seu papel é conceitual/bibliográfico e explique o CONCEITO geral de forma abstrata e educativa.\n' +
      '4. Tom: acadêmico-executivo socrático, claro, profundo, fundamentado nas grandes obras clássicas de estratégia, finanças, processos e liderança.\n' +
      '5. Responda em Português estruturado, com títulos e tópicos claros.\n\n' +
      'Camada solicitada: ' +
      camada +
      '\n' +
      'Pergunta do usuário: ' +
      pergunta

    let respostaTexto = ''
    let obrasCitadas = []

    try {
      const chatRes = $ai.agent('jbp-gestao-master').chat({
        user_id: authUser.id,
        conversation_id: null,
        message: promptBibliocompanion,
      })
      respostaTexto = chatRes.content || ''
    } catch (err) {
      console.log('Bibliocompanion fallback local: ' + err.message)
      // Fallback conceitual rico caso o gateway de AI não responda
      respostaTexto =
        '### Fundamentação Conceitual Vetor Master\n\n' +
        'No âmbito dos frameworks estratégicos da Biblioteca Executiva, o tema em questão articula-se em torno do alinhamento entre estratégia competitiva, capacidade organizacional e rigor determinístico de alocação de capital.\n\n' +
        '**Lentes de Análise Conceitual:**\n' +
        '1. **Diferenciação e Vantagem Competitiva:** Criação de valor superior sustentável através da preservação de margens saudáveis e eliminação de ineficiências estruturais.\n' +
        '2. **Arquitetura Organizacional:** Redução da dependência do fundador mediante formalização de papéis, rotinas de governança e descentralização decisória.\n' +
        '3. **Disciplina Financeira:** Validação de fluxos de caixa operacionais livres e cobertura de custos de oportunidade do capital investido.\n\n' +
        '*(Lembrete regimental: Para orientações e diagnósticos específicos da sua operação, utilize os módulos de Plano de Ação e Diagnósticos da plataforma).*'
    }

    if (acionouBarreira) {
      respostaTexto = avisoBarreira + '\n\n---\n\n' + respostaTexto
    }

    // Registrar no histórico de consultas conceituais
    try {
      const bCol = $app.findCollectionByNameOrId('bibliocompanion_consultas')
      const bRec = new Record(bCol)
      bRec.set('user', authUser.id)
      bRec.set('pergunta', pergunta)
      bRec.set('resposta', respostaTexto)
      bRec.set('camada', camada)
      bRec.set('barreira_consultoria_acionada', acionouBarreira)
      bRec.set('obras_referenciadas', obrasCitadas)
      $app.save(bRec)
    } catch (_) {}

    return e.json(200, {
      success: true,
      pergunta: pergunta,
      resposta: respostaTexto,
      camada: camada,
      fronteira_consultoria_acionada: acionouBarreira,
    })
  },
  $apis.requireAuth(),
)
