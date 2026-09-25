# VETOR MASTER — Configuração de Variáveis de Ambiente

Este documento descreve as variáveis de ambiente opcionais suportadas pela aplicação Vetor Master SaaS.

## Backend do Site Institucional (PocketBase Unificado - Opção B)

Quando configurado, o app sincroniza diretamente submissões de novos questionários e da lista de prioridade com a coleção `leads` do backend do site institucional.

```bash
# URL do PocketBase do site institucional
VITE_POCKETBASE_URL=https://site-institucional-vetor-master-165d3--preview.goskip.app

# Credenciais administrativas para gravação na coleção 'leads' (opcional)
VITE_LEADS_USER=admin@vetormaster.com.br
VITE_LEADS_PASS=sua_senha_segura
```

### Modo Resiliente / Fallback Automático

Se `VITE_POCKETBASE_URL` ou as credenciais não forem fornecidas, o app funciona 100% de forma local e resiliente:

- Armazena as submissões com segurança em `localStorage` (`vm_leads_queue`, `vm_ultimo_dossie`, `vm_ultimo_protocolo`).
- Gera protocolos imutáveis no formato `#VM-<TIMESTAMP>-<RAND>`.
- Preserva a experiência do usuário sem falhas de conexão.
