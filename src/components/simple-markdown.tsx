import { cn } from '@/lib/utils'

export function SimpleMarkdown({ content, className }: { content: string; className?: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="list-disc pl-6 space-y-1 my-3">
          {listItems.map((item, i) => (
            <li key={i} className="text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>,
      )
      listItems = []
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) {
      flushList(`list-${i}`)
      elements.push(
        <h1 key={i} className="text-2xl font-bold tracking-tight mt-6 mb-3">
          {trimmed.slice(2)}
        </h1>,
      )
    } else if (trimmed.startsWith('## ')) {
      flushList(`list-${i}`)
      elements.push(
        <h2 key={i} className="text-xl font-semibold mt-5 mb-2">
          {trimmed.slice(3)}
        </h2>,
      )
    } else if (trimmed.startsWith('### ')) {
      flushList(`list-${i}`)
      elements.push(
        <h3 key={i} className="text-lg font-medium mt-4 mb-2">
          {trimmed.slice(4)}
        </h3>,
      )
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2))
    } else if (trimmed === '') {
      flushList(`list-${i}`)
    } else {
      flushList(`list-${i}`)
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g)
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={j} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return part
      })
      elements.push(
        <p key={i} className="text-muted-foreground leading-relaxed mb-3">
          {rendered}
        </p>,
      )
    }
  })
  flushList('list-final')

  return <div className={cn(className)}>{elements}</div>
}
