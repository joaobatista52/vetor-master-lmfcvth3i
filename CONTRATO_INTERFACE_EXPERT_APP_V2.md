# CONTRATO DE INTERFACE E FLUXO MANUAL DE INTERCÂMBIO — VETOR MASTER

**Versão:** 2.0.0 (26/10/2026)  
**Documento Oficial de Engenharia — Trilha de Ajustes V2 (Ata nº 001/2026)**  
**Status:** Oficial / Versionado no Repositório  
**Partes:** Expert (Adapta ONE / JBP Gestão Master V7.2) ↔ Consultor Humano ↔ App Vetor Master (Skip Cloud)

---

## 1. Contexto e Divisão de Papéis

1. **O Expert é o motor determinístico:** Núcleo de cálculo JBP GM V7.2 operando em ambiente externo (Adapta ONE). É a única fonte de verdade para causa raiz, micro-epifanias, vazamentos, cenários STEEP/Cone/SWOT, EREC canônica A9, DRE 15 linhas (CS-17), WACC Regime B, valuation, governança e inovação.
2. **O App é a casca gestora transacional:** Gerencia o cliente e o consultor, fluxos de leads, cofre LGPD de documentos, visualização de dashboards, portal de cliente e faturamento. O App **NÃO gera conteúdo analítico próprio** nem mantém literais hardcoded.
3. **Intercâmbio Humano-Manual:** Não há integração API ponto-a-ponto nesta fase. O consultor atua como operador soberano: exporta o dossiê `.json` no App, submete ao Expert, recebe o pacote `.json` de output e o registra no App.

---

## 2. JSON de Entrada (Dossiê Estruturado + Metadados)

Exportado pelo App via interface do Consultor (ou endpoint `/backend/v1/dossie/exportar/:leadId`).

```json
{
  "$schema": "https://vetormaster.com.br/schemas/contrato-entrada-v2.json",
  "versao_contrato": "2.0.0",
  "metadados": {
    "lead_id": "beatekteste2026",
    "protocolo": "#VM-TESTE-BEATEK-22OUT26",
    "gerado_em": "2026-10-26T23:00:00.000Z",
    "versao_questionario": "V7.2",
    "autorizacao_devolutiva": "Não autorizo",
    "origem_tipo": "parceiro",
    "origem_parceiro": "RGS",
    "nivel_contratado": "MaaS Híbrido",
    "operador": {
      "nome": "Consultor Gestor",
      "email": "consultor@vetormaster.com.br"
    }
  },
  "dossie": {
    "cliente": {
      "razao_social": "BEATEK INDÚSTRIA E COMÉRCIO DE ELETRO-ELTRÔNICOS LTDA - EPP",
      "cnpj": "06.080.542/0001-06",
      "setor": "Indústria",
      "segmento": "Eletroeletrônicos Industriais",
      "faturamento_declarado": "R$ 7.500.000,00",
      "cargo": "Sócia e Diretora Administrativo-Financeiro",
      "email": "gleverton@smartcapex.com.br",
      "whatsapp": "(51) 99880-1188",
      "formato_interesse": "Ainda não sei"
    },
    "respostas_questionario": {
      "industria_1_1": "R$ 7.500.000,00",
      "industria_1_2": "1 fábrica em Porto Alegre-RS, prédio alugado. 1 fábrica sendo construída em terreno adquirido em Viamão-RS.",
      "industria_1_3": "20",
      "industria_1_4": "2"
    },
    "inventario_documentos": [
      {
        "nome": "balancete_beatek_01_a_06.pdf",
        "grupo": "demonstrativos_contabeis",
        "tamanho_bytes": 1048576,
        "md5": "e2fc714c4727ee9395f324cd2e7f331f"
      },
      {
        "nome": "balanco_ecd_2025.pdf",
        "grupo": "demonstrativos_contabeis",
        "tamanho_bytes": 2097152,
        "md5": "7d5b1285493b8216cb4c8f59196d2b33"
      }
    ],
    "conteudo_anexos_texto": [
      {
        "nome": "balancete_beatek_01_a_06.pdf",
        "tipo": "balancete",
        "markdown_extraido": "Receita Bruta: R$ 7.500.000,00..."
      }
    ]
  }
}
```

---

## 3. JSON de Saída (Output Integral do Expert V7.2)

Entregue pelo Expert e registrado pelo Consultor no App.

```json
{
  "$schema": "https://vetormaster.com.br/schemas/contrato-saida-v2.json",
  "versao_contrato": "2.0.0",
  "identificador_execucao": "EXP-V72-20261026-9812",
  "executado_em": "2026-10-26T23:15:00.000Z",
  "motor": {
    "versao_motor": "JBP GM V7.2.3",
    "ambiente": "Adapta ONE / Expert Externo",
    "validador_externo": "auditoria_humana_banca_2026"
  },
  "confirmacao_carga_cs19": {
    "versao_questionario": "V7.2",
    "gate_cs20_autorizado": false,
    "texto_confirmacao": "Carga de dados confirmada para BEATEK sob questionário V7.2. Gate CS-20: Não autorizo (Nutrição e Teaser)."
  },
  "fases_p1_p13": [
    {
      "fase": 1,
      "prompt_id": "P1_P2",
      "titulo": "Fase 1 — Carga de Dados e Diagnóstico Profundo",
      "slot_aplicado": "Slot 1 + Slot 5",
      "output_integral": "Texto completo gerado pelo motor...",
      "evidencias_usadas": ["Dossiê Cadastral", "Questionário Indústria", "Balancete 01 a 06"],
      "duracao_ms": 3840,
      "tokens_input": 3200,
      "tokens_output": 1150
    }
  ],
  "dre_normalizada_15_linhas": [
    {
      "numero": 1,
      "linha": "Receita Bruta (=)",
      "valor": "R$ 7.500.000,00",
      "fonte": "Questionário Seção 1.1 (projeção do cliente)",
      "status": "CONFORME"
    },
    {
      "numero": 2,
      "linha": "(-) Deduções/Impostos (Escada Y1/Y2/Y3+)",
      "valor": "R$ 975.000,00",
      "fonte": "DRE ECD 2025 / Balancete jan-jun (Exceção A11)",
      "status": "CONFORME"
    },
    {
      "numero": 14,
      "linha": "(-) IR/CSLL",
      "valor": "[REQUER VERIFICAÇÃO]",
      "fonte": "DCTF/DAS pendente de conferência",
      "status": "REQUER_VERIFICACAO"
    }
  ],
  "estrutura_erec_a9": [
    {
      "acao": "Eliminar",
      "item": "Dependência de linhas de capital de giro de curto prazo",
      "base": "DRE Linha 12 Resultado Financeiro (-R$ 410k)",
      "dimensao": "Financeiro"
    }
  ],
  "gabarito_auditoria_a8": {
    "item1_identificacao": {
      "status": "CONFORME",
      "evidencia": "Protocolo #VM-TESTE-BEATEK-22OUT26"
    },
    "item2_confirmacao_carga": {
      "status": "CONFORME",
      "evidencia": "Versão V7.2 em 2 linhas (CS-19)"
    },
    "item3_causa_raiz": { "status": "CONFORME", "evidencia": "Canvas As Is 9 blocos na Fase 1" },
    "item4_micro_epifanias": { "status": "CONFORME", "evidencia": "Bloco Setorial Indústria V7.2" },
    "item5_vazamentos": { "status": "CONFORME", "evidencia": "Dossiê financeiro quantificado" },
    "item6_triangulacao": {
      "status": "CONFORME",
      "evidencia": "Cruzamento balancetes com faturamento"
    },
    "item7_dre_15l": { "status": "CONFORME", "evidencia": "15 linhas integrais sem omissões" },
    "item8_erec_a9": {
      "status": "CONFORME",
      "evidencia": "Tabela quadrivalente com 13 intervenções"
    },
    "item9_gate_cs20": {
      "status": "CONFORME",
      "evidencia": "Gate Não autorizo -> Teaser protegido"
    },
    "item10_fechamento": {
      "status": "CONFORME",
      "evidencia": "Aguardo seu comando em todas as fases"
    },
    "validador": "auditoria_humana_externa_consultor",
    "auditado_em": "2026-10-26T23:15:00.000Z"
  },
  "bloco_solucao_completo": {
    "anexo_a_dre": { "total_linhas": 15 },
    "anexo_b_erec": { "total_intervencoes": 13 },
    "anexo_c_valuation": { "wacc": "21,75%", "regime": "Regime B" },
    "anexo_d_governanca": { "modelo": "PME em 2 Etapas", "alçadas": true },
    "anexo_e_capacidade": { "hackman": true, "tiers_abc": true },
    "anexo_f_roadmap": { "regra_camaleao": true, "horizontes": ["0-90d", "90-180d", "180-360d"] },
    "anexo_g_inovacao": { "erp_mes": true, "moat_tecnologico": true }
  },
  "custo_gateway": {
    "tokens_input": 28450,
    "tokens_output": 8920,
    "custo_usd": 0.2192,
    "tempo_execucao_ms": 36800,
    "medicao_real_gateway": true,
    "tier": "reasoning",
    "agente": "jbp-gestao-master"
  },
  "timestamps": {
    "iniciado_em": "2026-10-26T23:14:23.000Z",
    "concluido_em": "2026-10-26T23:15:00.000Z",
    "duracao_total_ms": 37000
  }
}
```

---

## 4. Fluxo Operacional Manual de Intercâmbio

1. **Geração no App:** O consultor acessa o lead em `/admin/leads`, confere as respostas e clica em **"Exportar Dossiê JSON (.json)"**.
2. **Envio ao Expert:** O consultor faz o upload do `.json` no ambiente Adapta/Expert ONE.
3. **Execução no Expert:** O motor determinístico processa as 8 fases (P1–P13) aplicando os 5 Slots de Contexto e gera o pacote de diagnóstico estruturado.
4. **Recepção e Registro no App:** O consultor copia o output `.json` do Expert, volta ao App e clica em **"Registrar Output do Expert"** na ficha do lead (ou via endpoint de serviço seguro).
5. **Gravação e Auditoria:** O App valida o schema e a integridade, grava o diagnóstico no cofre do lead, atualiza o status na máquina de estados (respeitando o gate CS-20) e disponibiliza para o Dashboard/Painel A8.
6. **Preservação de Cofre:** Nenhum documento sensível (ECD, balancetes) trafega para armazenamento permanente fora do App; o Expert atua apenas como motor de inferência efêmero.

---

## 5. Tabela de Erros Tipados (Catálogo de Exceções)

| Código de Erro                          | Fase          | Descrição / Condição                                                                            | Ação Requerida                                                                                  |
| --------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `MOTOR_BLOQUEADO_AUSENCIA_DADOS_A4`     | P1_CARGA      | Ausência total de demonstrativos e dados insuficientes na Seção 6.                              | Consultor solicita balancete/ECD ao cliente; vedada geração analítica sem base.                 |
| `SCHEMA_OUTPUT_INVALIDO_A2`             | RECEPCAO      | JSON do Expert com chaves obrigatórias ausentes (`fases_p1_p13`, `dre_normalizada_15_linhas`).  | Rejeitar pacote e solicitar reprocessamento ao Expert.                                          |
| `AUTOCERTIFICACAO_DETECTADA_A5`         | VALIDACAO_A8  | Assinatura de auditoria emitida pelo próprio serviço local (`servico_diagnostico_trilha_a_a8`). | Bloquear liberação do diagnóstico; exigir assinatura humana ou do validador externo homologado. |
| `VERSAO_QUESTIONARIO_INCOMPATIVEL_CS19` | P1_CARGA      | Versão informada diferente da versão cadastrada no questionário.                                | Registrar divergência e compatibilizar premissas de mapeamento.                                 |
| `GATE_CS20_VIOLADO`                     | WORKER        | Tentativa de envio de CTA completo para lead com `autorizacao_devolutiva = "Não autorizo"`.     | Interromper envio imediatamente; manter teaser protegido no cofre.                              |
| `TIMEOUT_EXECUCAO_EXPERT`               | PROCESSAMENTO | Processamento excedeu a janela máxima de 180s no gateway.                                       | Registrar tentativa, acionar retry com limpeza de contexto ou processamento manual.             |
| `CONVERSAO_CONTABIL_NAO_DECLARADA_A3`   | FASE_6        | DRE emitida com contas arbitrárias sem o Mapa de Conversão Obrigatório A3.                      | Marcar linhas não mapeadas como `[REQUER VERIFICAÇÃO]`.                                         |

---

_Aprovado em conformidade com o Plano de Ajustes — Versão 2 (26/10/2026)._
