// Cases Reais e Faixa de Autoridade — Vetor Master V1.3
// Fonte: Seção 8.4 do Documento de Alinhamento Visual V1.3 (24/09/2026)

export interface CaseReal {
  empresa: string
  setor: string
  dor: string
  intervencao: string
  resultado: string
  destaque?: string
}

export const CASES_REAIS_OFICIAIS: CaseReal[] = [
  {
    empresa: 'Sab Company',
    setor: 'Comércio Internacional – Trading',
    dor: 'Dependência estrutural e escala limitada',
    intervencao: 'C-Level as a Service + estruturação fiscal/M&A, Governança Corporativa',
    resultado:
      '15x crescimento em 5 anos; ~US$ 800M/ano; GPTW Top 150 Brasil; entre as 10 maiores tradings; Escola de Negócios.',
    destaque: '15x em 5 anos',
  },
  {
    empresa: 'Grupo União Autopeças (Atacarejo União)',
    setor: 'Varejo e Logística (distribuição de autopeças)',
    dor: 'Dificuldades com processos e critérios de registros no ERP, e-commerce, falta de processos/sistemas no armazém',
    intervencao:
      'Reestruturação do ERP, Projeto WMS + Governança Operacional, Mapeamento de Processos (BPMN)',
    resultado: 'WMS implantado, ERP reestruturado, ganho de 30% na eficiência de distribuição',
    destaque: '+30% eficiência de distribuição',
  },
  {
    empresa: 'OtorrinoDF',
    setor: 'Saúde',
    dor: 'Escala e governança para expansão',
    intervencao: 'M&A/Hospital Dia + estruturação estratégica e operacional',
    resultado:
      '−70% nas glosas; +40% taxa de ocupação; expansão via Hospital Dia; ampliação e M&A.',
    destaque: '−70% glosas',
  },
  {
    empresa: 'APC',
    setor: 'Facilities',
    dor: 'Margem apertada e gestão de contratos',
    intervencao: 'Turnaround operacional + precificação e Governança',
    resultado: '+100% de faturamento em 2 anos; abertura de filiais e novos mercados.',
    destaque: '+100% faturamento',
  },
]

export interface FaixaAutoridadeItem {
  nome: string
  credencial: string
}

export const FAIXA_AUTORIDADE_OFICIAL: FaixaAutoridadeItem[] = [
  {
    nome: 'Coimex/Cisa Trading',
    credencial:
      'M&A, Turnaround, Planejamento Estratégico; Governança e Sucessão Familiar; 12x receita em 8 anos',
  },
  {
    nome: 'Sainte Marie Trading',
    credencial: '+35% Receitas via Planejamento Estratégico/BSC e Governança',
  },
  {
    nome: 'Gocil Facilities e Segurança',
    credencial:
      'Inovação e Tecnologia; OKRs + Oceano Azul; Planejamento Estratégico e Inovação de Valor (Venda de SLA e não de homem/hora)',
  },
  {
    nome: 'Huawei do Brasil',
    credencial:
      'Estruturação de operações de importação no Brasil, Planejamento tributário/fiscal em importações, Logística internacional, Interface com escritórios de advocacia',
  },
  {
    nome: 'Mannesmann/Acesita',
    credencial:
      'Planejamento Estratégico, Turnaround, Contabilidade Gerencial e Reestruturação Financeira de Filiais',
  },
  {
    nome: 'Lorenzetti S/A',
    credencial:
      'Implantação de ERP e Gestão Industrial, Planejamento Estratégico, Growth Marketing, Implantação de Processos (BPMN), Sucessão Familiar',
  },
]

export interface FAQItem {
  id?: string
  numero: string
  pergunta: string
  resposta: string
  origem: 'home' | 'metodo'
  categoria?: string
}

export const FAQ_OFICIAL_V13: FAQItem[] = [
  // --- FAQ HOME (14 itens) ---
  {
    numero: '1',
    pergunta: 'Em quais regiões vocês atuam?',
    resposta:
      'Atendimento presencial prioritário em São Paulo e Distrito Federal — válido para o plano Bespoke/CaaS. Demais regiões do Sudeste e Sul: sob consulta — retorno em até 5 dias.',
    origem: 'home',
  },
  {
    numero: '2',
    pergunta: 'Isso é um curso ou mentoria?',
    resposta:
      'Não é um curso e nem uma mentoria — é um serviço de diagnóstico. O VETOR MASTER analisa os dados reais do seu negócio e devolve um plano de ação aplicado à sua operação. O aprendizado de conceitos e ferramentas de gestão acontece como consequência: dentro do seu negócio, sobre os seus números — não em sala de aula.',
    origem: 'home',
  },
  {
    numero: '3',
    pergunta: 'O que é um Diagnóstico Estratégico determinístico com zero alucinação?',
    resposta:
      'Ao contrário de IAs generativas abertas que inventam cenários e premissas (risco de alucinação), o motor do Vetor Master é determinístico: codifica mais de 40 anos de decisões executivas reais e uma base de 138 obras de referência. Cada recomendação possui rastreabilidade lógica, rigor analítico e zero especulação.',
    origem: 'home',
  },
  {
    numero: '4',
    pergunta: 'O diagnóstico fica pronto em quanto tempo?',
    resposta:
      'O Diagnóstico Estratégico é entregue em até 72h após a consolidação das respostas e dos dados necessários. O retorno inicial da equipe com o plano de ação ocorre em até 5 dias.',
    origem: 'home',
  },
  {
    numero: '5',
    pergunta: 'Qual é o perfil e porte de empresa atendido?',
    resposta:
      'O Vetor Master é desenhado especificamente para PMEs brasileiras com faturamento anual de R$ 400 mil a R$ 150 milhões, com foco em destravar a sobrecarga decisória do fundador e destravar o crescimento sustentável em 12 setores da economia.',
    origem: 'home',
  },
  {
    numero: '5A',
    pergunta: 'Meu setor não está na lista. Vocês atendem?',
    resposta:
      'O questionário estratégico está disponível hoje para 12 setores da economia, de Saúde a Academias de Ginástica. Se o seu segmento não está na grade, sua empresa ainda pode ser atendida: pelo plano Bespoke/CaaS, o diagnóstico é desenhado sob medida para o seu contexto. Fale conosco pelo e-mail contato.comercial@vetormaster.com.br e avaliaremos o seu caso.',
    origem: 'home',
  },
  {
    numero: '6',
    pergunta: 'Qual é o investimento inicial?',
    resposta:
      'As soluções partem de R$ 1.190/mês no modelo SaaS, com opções híbridas (MaaS Híbrido a R$ 3.290/mês) e personalizadas (Bespoke/CaaS a R$ 15.750/mês) conforme a maturidade e a complexidade da sua operação.',
    origem: 'home',
  },
  {
    numero: '6A',
    pergunta: 'Como funciona a Lista de Prioridade do SaaS?',
    resposta:
      'O SaaS está em fase final de preparação e as vagas iniciais são limitadas. Ao se inscrever na Lista de Prioridade, você garante sua posição na ordem de convocação e, como membro fundador, condições especiais no lançamento. Não há compromisso: sua inscrição apenas reserva o lugar. Quando sua vaga abrir, avisaremos pelo e-mail cadastrado — e, se quiser antecipar o valor da inteligência executiva, o MaaS Híbrido já está disponível hoje.',
    origem: 'home',
  },
  {
    numero: '6B',
    pergunta: 'Preciso de fidelidade? Posso cancelar?',
    resposta:
      'No SaaS e no MaaS Híbrido, não há fidelidade: os planos são mensais e você pode cancelar a qualquer momento, sem multa — a decisão de continuar deve nascer do valor entregue, não de cláusula de retenção. No Bespoke/CaaS, o período mínimo é de 3 meses: os planos de ação envolvem objetivos e problemas que demandam mais tempo para entrega (6 a 12 meses, em geral), e esse ciclo mínimo assegura a remuneração adequada do diagnóstico e do plano de ação elaborado.',
    origem: 'home',
  },
  {
    numero: '6C',
    pergunta: 'O que está incluído no acompanhamento dos planos?',
    resposta:
      'Depende do formato. No SaaS, inteligência sob demanda: monitoramento contínuo das variáveis do seu setor, com as recomendações do motor determinístico sempre disponíveis para aplicação imediata pela sua equipe. No MaaS Híbrido, o algoritmo determinístico gera o diagnóstico e a supervisão executiva de C-level valida e orienta a aplicação — incluindo a devolutiva de 45 minutos. No Bespoke/CaaS, o acompanhamento é personalizado: profundidade maior na análise, desdobramento do plano de ação com a sua equipe e presença executiva contínua ao longo do ciclo contratado.',
    origem: 'home',
  },
  {
    numero: '6D',
    pergunta: 'Qual plano é o ideal para a minha empresa?',
    resposta:
      'Como regra prática: quando o empresário precisa de monitoramento contínuo — acompanhar as variáveis do setor e reagir rápido, aplicando as recomendações com a própria equipe —, o SaaS (a partir de R$ 1.190/mês) é o ponto de entrada. Se você quer o diagnóstico completo com supervisão executiva de C-level conduzindo a leitura, o MaaS Híbrido (R$ 3.290/mês). Se o momento pede profundidade máxima — turnaround, expansão, reestruturação —, o Bespoke/CaaS (R$ 15.750/mês). Na dúvida, comece pelo questionário estratégico do seu setor: ele nos dá o contexto para recomendar o formato certo, sem compromisso.',
    origem: 'home',
  },
  {
    numero: '7',
    pergunta: 'Como o Vetor Master se compara a uma Big Four ou a uma IA genérica?',
    resposta:
      'As Big Four são precisas, mas custam dezenas de milhares de reais e exigem meses de consultoria. As IAs genéricas são rápidas e baratas, porém superficiais e alucinam sem entender o contexto das PMEs brasileiras. O Vetor Master é o meio inteligente: rigor executivo determinístico de C-Level, entrega em 72h, zero alucinação e preço acessível de software.',
    origem: 'home',
  },
  {
    numero: '7A',
    pergunta: 'Quem conduz a devolutiva de 45 minutos?',
    resposta:
      'Um executivo sênior — não um atendente e não um robô. As devolutivas são conduzidas por profissionais com trajetória de C-level, os mesmos que orientam o rigor analítico do motor determinístico. É uma sessão prática: você recebe as recomendações, entende o raciocínio por trás de cada uma e sai com o caminho claro para aplicar.',
    origem: 'home',
  },
  {
    numero: '7B',
    pergunta: 'Quem já utilizou o método?',
    resposta:
      'O método nasceu de mais de 40 anos de decisões executivas reais — entre elas transformações mensuráveis em trading companies, indústria, varejo e facilities (como a estruturação que multiplicou por 12 a receita de uma trading em 8 anos). Na página inicial, a seção Cases Reais mostra como cada intervenção funcionou, com os resultados de cada uma.',
    origem: 'home',
  },

  // --- FAQ O MÉTODO (4 itens) ---
  {
    numero: '1',
    pergunta: 'Preciso entender de tecnologia para usar?',
    resposta:
      'Não, de forma alguma. O método foi desenhado exatamente para que você não precise lidar com termos técnicos ou ferramentas complexas. Você só responde perguntas práticas sobre o seu dia a dia, como faturamento aproximado, principais dificuldades e equipe. O restante é conduzido de forma simples pelo nosso sistema.',
    origem: 'metodo',
  },
  {
    numero: '2',
    pergunta: 'Quanto tempo leva o diagnóstico?',
    resposta:
      'Preencher o questionário inicial leva cerca de 15 minutos. A partir do envio dos dados, o diagnóstico estruturado da sua empresa fica pronto em 72 horas.',
    origem: 'metodo',
  },
  {
    numero: '3',
    pergunta: 'O que acontece depois que eu envio o questionário?',
    resposta:
      'Nossa equipe avalia as informações da sua empresa e entra em contato em até 5 dias para agendar a sua Sessão de Devolutiva de 45 minutos com um especialista, na qual você recebe as recomendações práticas e o caminho mais adequado.',
    origem: 'metodo',
  },
  {
    numero: '4',
    pergunta: 'Meus dados ficam protegidos?',
    resposta:
      'Sim, integralmente. As informações financeiras, operacionais e cadastrais da sua empresa são confidenciais, protegidas por padrões rígidos de segurança e tratadas em total conformidade com a Lei Geral de Proteção de Dados (LGPD).',
    origem: 'metodo',
  },
]
