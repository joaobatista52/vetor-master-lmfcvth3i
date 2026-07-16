import { cn } from '@/lib/utils'

const LOGO_FULL = 'https://i.postimg.cc/6Th25DtR/Logo-5-VETOR-MASTER-06jul26.png'
const LOGO_ICON = 'https://i.postimg.cc/vcH113Zh/Logo-5-Favicon-VETOR-MASTER-14jul26.png'

type LogoVariant = 'full' | 'icon'

export function Logo({
  className,
  variant = 'full',
  showText = true,
}: {
  className?: string
  variant?: LogoVariant
  showText?: boolean
}) {
  const src = variant === 'icon' || !showText ? LOGO_ICON : LOGO_FULL
  return (
    <img
      src={src}
      alt="Vetor Master"
      className={cn(
        'shrink-0 object-contain',
        variant === 'icon' || !showText ? 'w-12' : 'w-auto',
        className,
      )}
    />
  )
}
