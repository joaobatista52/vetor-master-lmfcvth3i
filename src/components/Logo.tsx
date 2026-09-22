import React from 'react'
import { cn } from '@/lib/utils'
import logo5aClean from '@/assets/logo-5a-clean.png'
import logo5eClean from '@/assets/logo-5e-clean.png'

/**
 * VetorSymbol:
 * Exibe o símbolo do vetor oficial VETOR MASTER usando a versão limpa e recortada (logo-5a-clean.png).
 * Mantém as cores originais da marca em fundos claros e escuros.
 */
export function VetorSymbol({
  className,
  size = 48,
}: {
  className?: string
  monochromeNegative?: boolean
  size?: number | string
}) {
  return (
    <div
      className={cn(
        'shrink-0 select-none inline-flex items-center justify-center transition-all',
        className,
      )}
      style={{ width: size, height: size }}
      aria-label="Símbolo Vetor Master"
    >
      <img
        src={logo5aClean}
        alt="Vetor Master"
        className="w-full h-full object-contain select-none"
      />
    </div>
  )
}

export type LogoVariant = 'horizontal' | 'vertical' | 'icon'

export interface LogoProps {
  className?: string
  variant?: LogoVariant
  showTagline?: boolean
  showVersion?: boolean
  versionText?: string
  negative?: boolean // compatibilidade de tipagem para fundo escuro
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean // compatibilidade legada
}

/**
 * Componente oficial de Logomarca VETOR MASTER
 * Utiliza as versões limpas e com fundo transparente recortado:
 * - logo-5e-clean.png: Versão horizontal oficial (~72–80px no cabeçalho e menu lateral)
 * - logo-5a-clean.png: Versão vertical / ícone (~48px ícone, ~170px vertical no Login)
 * Logo SEMPRE COLORIDO (cores oficiais da marca) tanto em fundo claro quanto escuro, SEM brightness-0 invert.
 * Sem badge/selo "V7.2".
 */
export function Logo({
  className,
  variant = 'horizontal',
  showTagline = true,
  negative = false,
  size = 'md',
  showText = true,
}: LogoProps) {
  const effectiveVariant = !showText ? 'icon' : variant

  // Alturas calibradas conforme especificação:
  // - horizontal: ~56–60px no cabeçalho do menu lateral (cabeçalho h-24)
  // - ícone: ~48px
  // - vertical: ~170px no Login
  const iconPixelSize = size === 'sm' ? 40 : size === 'md' ? 48 : size === 'lg' ? 56 : 64
  const horizontalHeight = size === 'sm' ? 56 : size === 'md' ? 58 : size === 'lg' ? 60 : 64
  const verticalHeight = size === 'xl' ? 170 : size === 'lg' ? 150 : size === 'md' ? 120 : 96

  if (effectiveVariant === 'icon') {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden',
          className,
        )}
        style={{ width: iconPixelSize, height: iconPixelSize }}
      >
        <img
          src={logo5aClean}
          alt="Vetor Master"
          width={iconPixelSize}
          height={iconPixelSize}
          className="w-full h-full object-contain select-none transition-all p-0.5"
          loading="eager"
        />
      </div>
    )
  }

  if (effectiveVariant === 'vertical') {
    return (
      <div
        className={cn(
          'inline-flex flex-col items-center text-center select-none shrink-0 max-w-full',
          className,
        )}
      >
        <div
          className="relative flex items-center justify-center overflow-hidden max-w-full"
          style={{ height: verticalHeight, width: 'auto' }}
        >
          <img
            src={logo5aClean}
            alt="VETOR MASTER"
            className="w-auto h-full object-contain select-none transition-all p-1"
            loading="eager"
          />
        </div>
        {showTagline && (
          <span
            className={cn(
              'text-[9px] md:text-[10px] tracking-[0.2em] uppercase mt-2 font-semibold',
              negative ? 'text-white/90' : 'text-[#333333]',
            )}
          >
            DIREÇÃO • CONEXÃO • CRESCIMENTO
          </span>
        )}
      </div>
    )
  }

  // Versão Horizontal (padrão para Header, Sidebar, Landing, etc.)
  // Sempre COLORIDO com as cores oficiais da marca em qualquer fundo
  // Enquadramento via container overflow-hidden com object-contain + padding e object-position para garantir
  // que nenhuma letra (especialmente o "R" final de "MASTER") seja cortada.
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center select-none shrink-0 overflow-hidden max-w-full',
        className,
      )}
      style={{ height: horizontalHeight, width: 'auto' }}
    >
      <img
        src={logo5eClean}
        alt="VETOR MASTER"
        className="h-full w-auto max-w-full object-contain object-center px-1.5 py-0.5 select-none transition-all"
        loading="eager"
      />
    </div>
  )
}

export default Logo
