import { cn } from '@/lib/utils'

const LOGO_URL = 'https://i.postimg.cc/6Th25DtR/Logo-5-VETOR-MASTER-06jul26.png'

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <img
      src={LOGO_URL}
      alt="Vetor Master"
      className={cn('shrink-0 object-contain', showText ? 'w-auto' : 'w-8', className)}
    />
  )
}
