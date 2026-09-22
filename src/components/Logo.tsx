import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Símbolo Oficial VETOR MASTER em SVG vetorial:
 * Estrutura rigorosa de hexágonos e nós de rede interconectados
 * convergindo em uma seta ascendente com gradiente linear fluido do Azul (#0066CC) para o Verde (#22B14C).
 * Suporta modo monocromático negativo (branco) para fundos escuros.
 */
export function VetorSymbol({
  className,
  monochromeNegative = false,
  size = 40,
}: {
  className?: string
  monochromeNegative?: boolean
  size?: number | string
}) {
  const gradientId = React.useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="18"
          y1="98"
          x2="104"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0066CC" />
          <stop offset="55%" stopColor="#0080B0" />
          <stop offset="100%" stopColor="#22B14C" />
        </linearGradient>
      </defs>

      {/* Hexágonos e malha de rede convergindo para a seta */}
      <g
        stroke={monochromeNegative ? '#FFFFFF' : `url(#${gradientId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Hexágono base 1 (inferior esquerdo) */}
        <polygon points="26,72 36,66 46,72 46,84 36,90 26,84" fill="none" />
        {/* Hexágono base 2 (meio inferior) */}
        <polygon points="46,84 56,78 66,84 66,96 56,102 46,96" fill="none" />
        {/* Hexágono intermediário (centro) */}
        <polygon points="46,60 56,54 66,60 66,72 56,78 46,72" fill="none" />
        {/* Hexágono superior esquerdo */}
        <polygon points="36,48 46,42 56,48 56,60 46,66 36,60" fill="none" />
        {/* Hexágono superior centro */}
        <polygon points="56,36 66,30 76,36 76,48 66,54 56,48" fill="none" />
        {/* Hexágono avançado (conecta com a seta) */}
        <polygon points="66,48 76,42 86,48 86,60 76,66 66,60" fill="none" />

        {/* Linhas de conexão da rede neural / convergência determinística */}
        <line x1="36" y1="66" x2="46" y2="60" />
        <line x1="56" y1="48" x2="66" y2="48" />
        <line x1="66" y1="36" x2="76" y2="42" />
        <line x1="76" y1="36" x2="88" y2="30" />
        <line x1="86" y1="48" x2="96" y2="42" />
        <line x1="66" y1="60" x2="78" y2="72" />
        <line x1="78" y1="72" x2="90" y2="64" />
        <line x1="90" y1="64" x2="96" y2="42" />

        {/* Conexão para a seta ascendente */}
        <line x1="88" y1="30" x2="104" y2="18" strokeWidth="2.8" />
        <line x1="96" y1="42" x2="104" y2="18" strokeWidth="2.8" />
      </g>

      {/* Seta Ascendente no ápice */}
      <path
        d="M104 16 L76 32 L88 36 L84 56 L104 16 Z"
        fill={monochromeNegative ? '#FFFFFF' : '#22B14C'}
        stroke={monochromeNegative ? '#FFFFFF' : '#22B14C'}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Nós de rede (círculos nos vértices e nós de convergência) */}
      <g fill={monochromeNegative ? '#FFFFFF' : `url(#${gradientId})`}>
        <circle cx="26" cy="72" r="2.4" />
        <circle cx="36" cy="66" r="2.8" />
        <circle cx="46" cy="60" r="3" />
        <circle cx="56" cy="48" r="3.2" />
        <circle cx="66" cy="36" r="3.4" />
        <circle cx="76" cy="42" r="3.2" />
        <circle cx="86" cy="48" r="3" />
        <circle cx="66" cy="72" r="2.6" />
        <circle cx="56" cy="78" r="2.8" />
        <circle cx="46" cy="84" r="2.6" />
        <circle cx="36" cy="90" r="2.2" />
        <circle cx="78" cy="72" r="2.6" />
        <circle cx="90" cy="64" r="2.8" />
        <circle cx="96" cy="42" r="3.4" />
        <circle cx="88" cy="30" r="3.6" />
        {/* Partículas satélite esquerdas (dispersão controlada como no manual) */}
        <circle cx="18" cy="76" r="1.8" />
        <circle cx="14" cy="86" r="2.0" />
        <circle cx="20" cy="94" r="2.2" />
      </g>
    </svg>
  )
}

export type LogoVariant = 'horizontal' | 'vertical' | 'icon'

interface LogoProps {
  className?: string
  variant?: LogoVariant
  showTagline?: boolean
  showVersion?: boolean
  versionText?: string
  negative?: boolean // Modo escuro / fundo escuro (monocromático negativo ou adaptado)
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean // compatibilidade legada
}

export function Logo({
  className,
  variant = 'horizontal',
  showTagline = true,
  showVersion = false,
  versionText = 'V7.2',
  negative = false,
  size = 'md',
  showText = true,
}: LogoProps) {
  // Se explicitamente showText for false, renderiza apenas o símbolo
  const effectiveVariant = !showText ? 'icon' : variant

  const symbolSize = size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 48 : 64

  if (effectiveVariant === 'icon') {
    return (
      <div className={cn('inline-flex items-center justify-center', className)}>
        <VetorSymbol size={symbolSize} monochromeNegative={negative} />
      </div>
    )
  }

  if (effectiveVariant === 'vertical') {
    return (
      <div className={cn('inline-flex flex-col items-center text-center select-none', className)}>
        <VetorSymbol
          size={size === 'xl' ? 72 : size === 'lg' ? 56 : 44}
          monochromeNegative={negative}
          className="mb-2"
        />
        <div className="flex items-center justify-center gap-1.5 leading-none">
          <span
            className={cn(
              'font-["Michroma"] uppercase tracking-wider',
              size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-xl' : 'text-lg',
              negative ? 'text-white' : 'text-[#0066CC]',
            )}
          >
            VETOR
          </span>
          <span
            className={cn(
              'font-["Michroma"] uppercase tracking-wider',
              size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-xl' : 'text-lg',
              negative ? 'text-[#22B14C]' : 'text-[#22B14C]',
            )}
          >
            MASTER
          </span>
          {showVersion && (
            <span
              className={cn(
                'ml-1 text-[10px] font-semibold tracking-normal px-1.5 py-0.5 rounded',
                negative ? 'bg-white/15 text-white' : 'bg-[#0066CC]/10 text-[#0066CC]',
              )}
            >
              {versionText}
            </span>
          )}
        </div>
        {showTagline && (
          <span
            className={cn(
              'text-[9px] tracking-[0.2em] uppercase mt-1 font-medium',
              negative ? 'text-white/70' : 'text-[#333333]',
            )}
          >
            DIREÇÃO • CONEXÃO • CRESCIMENTO
          </span>
        )}
      </div>
    )
  }

  // Horizontal (versão padrão para cabeçalhos e barras de navegação)
  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      <VetorSymbol size={symbolSize} monochromeNegative={negative} />
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'font-["Michroma"] uppercase tracking-wider',
              size === 'sm'
                ? 'text-sm'
                : size === 'md'
                  ? 'text-base'
                  : size === 'lg'
                    ? 'text-xl'
                    : 'text-2xl',
              negative ? 'text-white' : 'text-[#0066CC]',
            )}
          >
            VETOR
          </span>
          <span
            className={cn(
              'font-["Michroma"] uppercase tracking-wider',
              size === 'sm'
                ? 'text-sm'
                : size === 'md'
                  ? 'text-base'
                  : size === 'lg'
                    ? 'text-xl'
                    : 'text-2xl',
              'text-[#22B14C]',
            )}
          >
            MASTER
          </span>
          {showVersion && (
            <span
              className={cn(
                'ml-1 text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded-[3px]',
                negative ? 'bg-white/20 text-white' : 'bg-[#0066CC]/10 text-[#0066CC]',
              )}
            >
              {versionText}
            </span>
          )}
        </div>
        {showTagline && (
          <span
            className={cn(
              'text-[8px] tracking-[0.18em] uppercase mt-1 font-medium',
              negative ? 'text-white/70' : 'text-[#333333]',
            )}
          >
            DIREÇÃO • CONEXÃO • CRESCIMENTO
          </span>
        )}
      </div>
    </div>
  )
}

export default Logo
