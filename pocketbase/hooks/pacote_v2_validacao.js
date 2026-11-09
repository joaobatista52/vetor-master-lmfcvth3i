var CODIGOS = {
  JSON_INVALIDO: 'PACOTE_V2_JSON_INVALIDO_401',
  SCHEMA: 'PACOTE_V2_SCHEMA_INVALIDO_402',
  FASES: 'PACOTE_V2_FASES_INVALIDAS_403',
  DRE: 'PACOTE_V2_DRE_INVALIDA_404',
  EREC: 'PACOTE_V2_EREC_INVALIDO_405',
  GABARITO: 'PACOTE_V2_GABARITO_INVALIDO_406',
  NAOTRAFEGA: 'PACOTE_V2_NAOTRAFEGA_INVALIDO_407',
  PRJ: 'PACOTE_V2_PRJ_INVALIDO_408',
  PAC: 'PACOTE_V2_PAC_INVALIDO_409',
  ETAPAS: 'PACOTE_V2_ETAPAS_INVALIDAS_410',
  W2H: 'PACOTE_V2_5W2H_INCOMPLETO_411',
  FK: 'PACOTE_V2_FK_INVALIDA_412',
  DESDOBRAMENTO: 'PACOTE_V2_DESDOBRAMENTO_INVALIDO_413',
  MULTIBLOCO: 'PACOTE_V2_MULTIBLOCO_414',
  PARTE_INDETERMINADA: 'PACOTE_V2_PARTE_INDETERMINADA_415',
}

/**
 * ETAPA E2-C — MÓDULO PURO DE VALIDAÇÃO DO PACOTE V2.0 (LEGADO/MANTIDO POR
 * REFERÊNCIA). Este módulo NÃO é carregado em runtime por pacote_v2.js: a
 * lógica viva foi INLINADA no próprio pacote_v2.js porque o require() dentro
 * do callback falhava no JSVM ("Invalid module") — módulo sem `module.exports`
 * visível ao carregador do handler. Mantenha o módulo sem rotas/persistência
 * (apenas funções puras + CODIGOS): ele continua documentando as códigos das
 * 11 regras e é a referência de paridade do validador inline.
 *
 * MODO DE AUDITORIA (contrato E2-C): toda divergência estrutural devolve
 * { encontrado, esperado } no detalhe do erro; toda regra é defensiva
 * (null/undefined/estrutura inesperada → { ok:false, codigo, mensagem },
 * NUNCA throw). R3 (novo): conta apenas LINHAS DE CONTA da DRE (ignora
 * subtotais e cabeçalhos); aceita 15 a 18 linhas de conta com AVISO, exigindo
 * "fonte" em cada linha.
 */
