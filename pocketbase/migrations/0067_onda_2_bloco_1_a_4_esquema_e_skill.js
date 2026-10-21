/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // 1. ATUALIZAR SKILL 'roteiro-execucao-13-prompts' COM ANEXO B CANÔNICO A9
    const skillsCol = app.findCollectionByNameOrId('skills')
    let skillRec
    try {
      skillRec = app.findFirstRecordByData('skills', 'slug', 'roteiro-execucao-13-prompts')
    } catch (_) {
      skillRec = new Record(skillsCol)
      skillRec.set('slug', 'roteiro-execucao-13-prompts')
      skillRec.set('nome', 'JBP — Roteiro de Execução (13 Prompts Fixos e Automação)')
    }

    const historicoRaw = skillRec.getString('historico_versoes')
    let historico = []
    if (historicoRaw && historicoRaw !== 'null' && historicoRaw !== '') {
      try {
        historico = JSON.parse(historicoRaw) || []
      } catch (_) {
        historico = []
      }
    }

    historico.push({
      versao_anterior: skillRec.getString('versao') || 'V7.2.2-A5-A10',
      conteudo_anterior: skillRec.getString('conteudo'),
      atualizado_em: new Date().toISOString(),
      motivo:
        'Onda 2 — Bloco 1.2: Atualização do Anexo B para o padrão canônico A9 (tabela EREC com colunas Ação | Item de Intervenção | Base Conclusiva + Dimensão setorial adicional), conforme calibração de 16/10/2026.',
    })

    const NOVO_CONTEUDO_SKILL_ROTEIRO = `# JBP — Roteiro de Execução (13 Prompts Fixos e Automação)

Playbook operacional do expert JBP Gestão Master V7.2.3. Acionar no início de cada sessão de cliente (Prompt 1 — Ingestão) e entre as fases da sequência oficial. Os 13 prompts são FIXOS e INVARIANTES; a automação atua apenas no disparo, nunca no conteúdo.

## Disparo e regras de automação

1. Disparar o próximo prompt SOMENTE após o encerramento neutro da fase corrente ("Aguardo seu comando.") e a validação do portão correspondente.
2. Nenhuma fase subsequente inicia sem o comando de avanço. Não antecipar, não nomear e não pular etapas.
3. O texto dos 13 prompts permanece fixo; a automação atua exclusivamente no disparo.
4. Ajustes no meio de uma fase: redirecionamento explícito (ex.: "corrige o item 3 da Fase 3 e reemite"), sem quebrar a sequência oficial F2→F8.
5. Após qualquer ajuste ou aplicação de pendência, os padrões de comando permanecem os mesmos.
6. O Prompt 1 (Ingestão) é sempre o ponto de partida de cada novo cliente, após o carregamento dos arquivos fixos de contexto e do dossiê JSON.

## Sequência dos 13 prompts (comando padrão → portão)

1. CARGA DE DADOS — DOSSIÊ [SETOR] [ID] → Confirmação de carga (até 2 linhas, formato padrão declarando versão do questionário CS-19) antes da Fase 1. Processar blocos dossie/cliente/secoes/anexos; status nao_respondido → [REQUER VERIFICAÇÃO]; sem inferência setorial. DRE referenciada como anexo sem slot dedicado no app (decisão 16/10). Se autorizacao_devolutiva = "Não autorizo", sinalizar gate CS-20.

2. INICIAR FASE 1 — DIAGNÓSTICO PROFUNDO ([SETOR]) → Encerra com "Aguardo seu comando." Entregar causa raiz; 3–5 micro-epifanias com fonte; vazamentos quantificados só com dados do dossiê; nota de triangulação; Canvas As Is 9 blocos.

3. GERAR BLOCO CTA — DEVOLUTIVA DE 45 MIN ([SETOR]) → Encerra com "Aguardo seu comando." — sem nomear a sequência seguinte. 3–5 micro-epifanias + vazamentos objetivos; SEM causa raiz, solução, plano ou Canvas. Se autorizacao_devolutiva = "Não autorizo", não emitir CTA integral (CS-20) e acionar trilha de nutrição/teaser assíncrono. FONTE OBRIGATÓRIA: consultar as micro-epifanias-gatilho específicas do setor no Contexto Estratégico Global V7.2, Seção 6 antes de provocar o CTA. Para Comércio Internacional, aplicar adicionalmente o gatilho de modalidade A1.

4. A CONVERSÃO OCORREU. O cliente assinou [MODALIDADE_CONTRATADA]. → Portão de conversão P3→P4. Apresentar Bloco Solução EXECUTIVO (apenas "o quê") e gerar Documento Interno destinado ao cliente — vedada entrega apenas em chat. Não iniciar a Fase 2 sem comando.

5. INICIAR FASE 2 — FORESIGHT ESTRATÉGICO ([SETOR]) → Encerra com "Aguardo seu comando." Entregar os 7 elementos: STEEP/PESTEL; Cone dos 4 Futuros; Roda de Futuros; Matriz 2x2 (4 cenários + impacto + decisão); Early Warning Signals (medida, gatilho, ação); Backcasting até a "primeira tarefa de amanhã"; SWOT dinâmica.

6. INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO ([SETOR]) → BSC obrigatório; encerra com "Aguardo seu comando." Entregar Tese; EREC canônico A9 (Ação | Item de Intervenção | Base Conclusiva | Dimensão setorial); Curva de Valor; Canvas To Be 9 blocos; BSC 4 perspectivas + causa e efeito; Objetivos Estratégicos e OKRs derivados do BSC.

7. INICIAR FASE 4 — CAPACIDADE E DESIGN ORGANIZACIONAL ([SETOR]) → Encerra com "Aguardo seu comando." Mapa de calor das 5 condições de Hackman; Tiers A/B/C. Fornece a perspectiva Aprendizado e Crescimento do BSC.

8. INICIAR FASE 5 — EXECUÇÃO E ROADMAP ([SETOR]) → Encerra com "Aguardo seu comando." Regra Camaleão; roadmap Curto/Médio/Longo com dado-fonte; OKRs derivados do BSC; rituais Daily/Weekly/Monthly. Entregar "o quê" e o prazo — nunca o "como".

9. INICIAR FASE 6 — VALIDAÇÃO FINANCEIRA E ALOCAÇÃO ([SETOR]) → Motor Determinístico; encerra com "Aguardo seu comando." [COM DOCS] rodar o Motor com dados reais, normalizar e declarar o Mapa de Conversão A3. DRE sempre 15 linhas (CS-17), linhas não segregáveis com [REQUER VERIFICAÇÃO]. Exceção A11 quando tributos embutidos. [SEM DOCS] registrar ausência; se Seção 6 não bastar, manter [REQUER VERIFICAÇÃO] e Motor Bloqueado A4. Entregar DRE 15 linhas, FCF, Valuation Gordon/WACC (Regimes A/B), sensibilidade, Stress Test Buffett, triangulação.

10. INICIAR FASE 7 — GOVERNANÇA E LIDERANÇA ([SETOR]) → Governança adaptada às PMEs; encerra com "Aguardo seu comando." Conselho Consultivo (máx. 5, Vetor Master independente) → Conselho de Administração (máx. 7, ≥50% independentes); limiar R$ 60M/ano avaliado pela RB normalizada F6 (A7).

11. INICIAR FASE 8 — INOVAÇÃO E TECNOLOGIA ([SETOR]) → Encerra com "Aguardo seu comando." Maturidade digital, roadmap tecnológico, impacto no Moat, ROI.

12. CONSOLIDAR O BLOCO SOLUÇÃO COMPLETO ([SETOR]) → Documento Interno de Implementação obrigatório. Consolidar Fases 2–8 em "o quê" + "o como" para equipe interna; Anexo B em padrão canônico A9 (EREC).

13. AUDITORIA DE ADERÊNCIA AO PROTOCOLO ([SETOR]) → Auditoria COMPARATIVA A8: conferência item a item contra a saída produzida com citação expressa de evidência; vedada autocertificação e "X/X conformes" sem prova.

## Padrão Canônico de Anexos do Bloco Solução Completo (A9)

Os anexos A–G seguem estrutura TABULAR uniforme, sem caracteres de desenho de caixa (┌ ┐ └ ┘ │), garantindo renderização consistente em qualquer editor e exportação:

- Anexo A — BSC: colunas # | Perspectiva | Âncora | Objetivos Estratégicos | Cadeia de Causa e Efeito. Perspectiva Financeira no topo; fluxo causal de baixo para cima (Aprendizado e Crescimento → Processos Internos → Clientes → Financeira).

- Anexo B — EREC (PADRÃO CANÔNICO A9 — CORREÇÃO 16/10/2026):
  Tabela estruturada obrigatoriamente com as seguintes colunas:
  | Ação (Eliminar / Reduzir / Elevar / Criar) | Item de Intervenção | Base Conclusiva | Dimensão setorial |
  *Regra A9:* A coluna "Ação" classifica a intervenção estritamente em uma das 4 categorias da matriz Oceano Azul (Eliminar, Reduzir, Elevar, Criar). A "Dimensão setorial" (Estratégia, Financeiro, Organizacional, Comercial, Operacional, Tributário, etc.) é SEMPRE uma COLUNA ADICIONAL, nunca um substituto da coluna "Ação". A coluna "Base Conclusiva" referencia a evidência empírica ou a seção do dossiê que justifica a decisão. Vedada qualquer matriz genérica rotulada de EREC sem esta estrutura tabular quádrupla.

- Anexo C — Curva de Valor: colunas Fator Crítico | Empresa (Atual) | Concorrência | Empresa (Alvo).

- Anexo D — Canvas To Be: ordem canônica dos 9 pilares, colunas # | Pilar | As Is (Atual) | To Be (Proposto).

- Anexos E (OKRs), F (Roadmap) e G (Rituais): estrutura tabular conforme especificação.

## Padrão de comando de continuidade

Após "Aguardo seu comando." da Fase 1 → "INICIAR FASE 2 — FORESIGHT ESTRATÉGICO ([SETOR])"; após F2 → "INICIAR FASE 3 — ESTRATÉGIA E DIFERENCIAÇÃO ([SETOR])"; e assim sucessivamente até o Prompt 13.`

    skillRec.set('conteudo', NOVO_CONTEUDO_SKILL_ROTEIRO)
    skillRec.set('versao', 'V7.2.3-A9')
    skillRec.set(
      'descricao',
      '13 prompts fixos e automação por portão do expert JBP Gestão Master V7.2.3. Inclui Anexo B canônico A9 (tabela EREC com Ação | Item | Base Conclusiva + Dimensão setorial) e auditoria comparativa A8.',
    )
    skillRec.set('historico_versoes', historico)
    skillRec.set('ativo', true)
    app.save(skillRec)

    // 2. NOVOS CAMPOS NA COLEÇÃO 'leads'
    const leadsCol = app.findCollectionByNameOrId('leads')
    const leadCamposNovos = [
      { name: 'origem_parceiro', type: 'text' },
      { name: 'parceiro_confirmou', type: 'bool' },
      { name: 'parceiro_confirmou_em', type: 'text' },
      { name: 'parceiro_email', type: 'text' },
      { name: 'processado_em', type: 'text' },
      { name: 'data_devolutiva', type: 'text' },
      { name: 'teaser_gerado', type: 'json' },
      { name: 'cadencia_nutricao', type: 'json' },
      { name: 'consentimento_lgpd', type: 'bool' },
    ]

    for (let i = 0; i < leadCamposNovos.length; i++) {
      const c = leadCamposNovos[i]
      if (!leadsCol.fields.getByName(c.name)) {
        leadsCol.fields.add(new Field(c))
      }
    }
    app.save(leadsCol)

    // 3. NOVOS CAMPOS NA COLEÇÃO 'diagnosticos'
    const diagCol = app.findCollectionByNameOrId('diagnosticos')
    const diagCamposNovos = [
      { name: 'status', type: 'text' }, // 'processando' | 'concluido' | 'erro'
      { name: 'autorizacao_devolutiva', type: 'text' },
      { name: 'versao_questionario', type: 'text' }, // CS-19
      { name: 'lead', type: 'relation', collectionId: leadsCol.id, maxSelect: 1 },
      { name: 'output_prompts', type: 'json' }, // P1–P13 estruturados
      { name: 'dre_normalizada_15_linhas', type: 'json' }, // CS-17
      { name: 'estrutura_erec_a9', type: 'json' }, // A9
      { name: 'gabarito_auditoria', type: 'json' }, // A8
      { name: 'custo_gateway', type: 'json' }, // { tokens_input, tokens_output, custo_estimado_usd, tempo_ms }
      { name: 'origem_tipo', type: 'text' }, // 'direto' | 'parceiro'
      { name: 'origem_parceiro', type: 'text' },
    ]

    for (let j = 0; j < diagCamposNovos.length; j++) {
      const cd = diagCamposNovos[j]
      if (!diagCol.fields.getByName(cd.name)) {
        diagCol.fields.add(new Field(cd))
      }
    }
    app.save(diagCol)

    // 4. VÍNCULOS NOVOS EM 'okrs' E 'planos_acao' (pautados por Etapas)
    const okrsCol = app.findCollectionByNameOrId('okrs')
    if (!okrsCol.fields.getByName('etapa')) {
      okrsCol.fields.add(new Field({ name: 'etapa', type: 'number' }))
    }
    if (!okrsCol.fields.getByName('etapa_nome')) {
      okrsCol.fields.add(new Field({ name: 'etapa_nome', type: 'text' }))
    }
    app.save(okrsCol)

    const planosCol = app.findCollectionByNameOrId('planos_acao')
    if (!planosCol.fields.getByName('etapa')) {
      planosCol.fields.add(new Field({ name: 'etapa', type: 'number' }))
    }
    if (!planosCol.fields.getByName('etapa_nome')) {
      planosCol.fields.add(new Field({ name: 'etapa_nome', type: 'text' }))
    }
    app.save(planosCol)
  },
  (app) => {
    // Reverter campos e skill se necessário
  },
)
