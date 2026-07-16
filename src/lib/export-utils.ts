import type { NotaProjeto } from '@/services/notas_projeto'

export function exportAsText(notas: NotaProjeto[]): void {
  const header = `NOTAS E TAREFAS DO PROJETO\n${'='.repeat(50)}\nGerado em: ${new Date().toLocaleString('pt-BR')}\nTotal de registros: ${notas.length}\n${'='.repeat(50)}\n\n`

  const body = notas
    .map((nota, i) => {
      const tags = nota.tags?.length ? nota.tags.join(', ') : 'Nenhuma'
      return `${i + 1}. ${nota.title}\n   Prioridade: ${nota.priority || 'Média'}\n   Status: ${nota.status || 'A Fazer'}\n   Tags: ${tags}\n   Criado em: ${new Date(nota.created).toLocaleDateString('pt-BR')}\n   Conteúdo:\n   ${nota.content}\n${'-'.repeat(50)}`
    })
    .join('\n\n')

  const content = header + body
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `notas-projeto-${Date.now()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportAsPDF(notas: NotaProjeto[]): void {
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return

  const items = notas
    .map(
      (nota, i) => `
        <div class="note-item">
          <h3>${i + 1}. ${escapeHtml(nota.title)}</h3>
          <div class="meta">
            <span class="badge priority-${(nota.priority || 'Média').toLowerCase().replace(/\s/g, '')}">${nota.priority || 'Média'}</span>
            <span class="badge status-${(nota.status || 'A Fazer').toLowerCase().replace(/\s/g, '').replace('í', 'i')}">${nota.status || 'A Fazer'}</span>
          </div>
          <p class="tags">Tags: ${nota.tags?.length ? nota.tags.join(', ') : 'Nenhuma'}</p>
          <p class="content">${escapeHtml(nota.content)}</p>
          <p class="date">Criado em: ${new Date(nota.created).toLocaleDateString('pt-BR')}</p>
        </div>
      `,
    )
    .join('')

  win.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Notas do Projeto</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #1e293b; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .note-item { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
        .note-item h3 { font-size: 16px; margin-bottom: 8px; }
        .meta { display: flex; gap: 8px; margin-bottom: 8px; }
        .badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
        .priority-alta { background: #fef2f2; color: #dc2626; }
        .priority-média { background: #fffbeb; color: #d97706; }
        .priority-baixa { background: #eff6ff; color: #2563eb; }
        .status-afazer { background: #f1f5f9; color: #475569; }
        .status-emprogresso { background: #fffbeb; color: #d97706; }
        .status-concluído { background: #f0fdf4; color: #16a34a; }
        .tags { font-size: 12px; color: #64748b; margin-bottom: 8px; }
        .content { font-size: 14px; white-space: pre-wrap; line-height: 1.5; margin-bottom: 8px; }
        .date { font-size: 11px; color: #94a3b8; }
        @media print { body { padding: 20px; } .note-item { break-inside: avoid; } }
      </style>
    </head>
    <body>
      <h1>Notas e Tarefas do Projeto</h1>
      <p class="subtitle">Gerado em ${new Date().toLocaleString('pt-BR')} — ${notas.length} registro(s)</p>
      ${items}
      <script>window.onload = () => window.print();</script>
    </body>
    </html>
  `)
  win.document.close()
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
