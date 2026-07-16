import type { NotaProjeto } from '@/services/notas_projeto'

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

export function exportAsText(notas: NotaProjeto[]) {
  const lines = notas.map((n, i) => {
    const tags = (n.tags || []).join(', ')
    return [
      `${i + 1}. ${n.title}`,
      `   Prioridade: ${n.priority || 'N/A'}`,
      `   Status: ${n.status || 'N/A'}`,
      tags ? `   Tags: ${tags}` : null,
      `   Conteúdo:`,
      `   ${n.content}`,
      '',
      '   ' + '─'.repeat(50),
      '',
    ]
      .filter(Boolean)
      .join('\n')
  })

  const header = `NOTAS DO PROJETO - VETOR MASTER\nExportado em: ${new Date().toLocaleString('pt-BR')}\n${'═'.repeat(60)}\n\n`
  const content = header + lines.join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notas-vetor-master-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportAsPDF(notas: NotaProjeto[]) {
  const dateStr = new Date().toLocaleString('pt-BR')
  const cardsHtml = notas
    .map((n, i) => {
      const tags = (n.tags || []).join(', ') || '—'
      return `
      <div class="note-card">
        <div class="note-header">
          <span class="note-number">${i + 1}</span>
          <h2>${escapeHtml(n.title)}</h2>
        </div>
        <div class="note-meta">
          <span class="meta-item"><strong>Prioridade:</strong> ${escapeHtml(n.priority || 'N/A')}</span>
          <span class="meta-item"><strong>Status:</strong> ${escapeHtml(n.status || 'N/A')}</span>
          <span class="meta-item"><strong>Tags:</strong> ${escapeHtml(tags)}</span>
        </div>
        <div class="note-content">${escapeHtml(n.content).replace(/\n/g, '<br>')}</div>
      </div>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Notas do Projeto - Vetor Master</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #1E293B; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #3B82F6; }
    .header h1 { color: #3B82F6; font-size: 24px; }
    .header p { color: #64748B; font-size: 12px; margin-top: 5px; }
    .note-card { border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
    .note-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .note-number { background: #3B82F6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; }
    .note-header h2 { font-size: 16px; color: #1E293B; }
    .note-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 8px; font-size: 12px; color: #64748B; }
    .note-content { font-size: 13px; color: #475569; line-height: 1.5; }
    @media print { body { padding: 20px; } .note-card { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Notas do Projeto — Vetor Master</h1>
    <p>Exportado em: ${dateStr} • ${notas.length} nota(s)</p>
  </div>
  ${cardsHtml}
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    const a = document.createElement('a')
    a.href = url
    a.download = `notas-vetor-master-${new Date().toISOString().split('T')[0]}.html`
    a.click()
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
