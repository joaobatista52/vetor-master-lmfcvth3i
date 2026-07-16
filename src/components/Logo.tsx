import { cn } from '@/lib/utils'

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2', className)} role="img" aria-label="Vetor Master">
      <svg
        viewBox="0 0 40 40"
        className="h-full w-auto shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="vm-logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(217, 91%, 60%)" />
            <stop offset="100%" stopColor="hsl(217, 91%, 45%)" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#vm-logo-grad)" />
        <path
          d="M10 14 L20 34 L30 14"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span className="font-bold text-lg leading-none text-foreground whitespace-nowrap">
          Vetor Master
        </span>
      )}
    </div>
  )
}
