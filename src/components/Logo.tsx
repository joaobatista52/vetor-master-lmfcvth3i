import React from 'react'
import { cn } from '@/lib/utils'
import logo5aUrl from '@/assets/logo-5a.svg'
import logo5eUrl from '@/assets/logo-5e.svg'

/**
 * VetorSymbol:
 * Exibe o símbolo do vetor oficial VETOR MASTER a partir do SVG oficial mestre.
 * Usa o logo-5a.svg focado no símbolo vetorial através do viewBox '100 400 1300 1300',
 * preservando todas as curvas, nós e gradientes exatos da marca master.
 * Suporta modo negativo/invertido para fundos escuros.
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
  return (
    <svg
      width={size}
      height={size}
      viewBox="100 400 1300 1300"
      className={cn(
        'shrink-0 select-none object-contain transition-all',
        monochromeNegative && 'brightness-0 invert',
        className,
      )}
      aria-label="Símbolo Vetor Master"
    >
      <use href={`${logo5aUrl}#master-logo`} xlinkHref={logo5aUrl} />
      <image href={logo5aUrl} x="0" y="0" width="2400" height="2400" />
    </svg>
  )
}

export type LogoVariant = 'horizontal' | 'vertical' | 'icon'

export interface LogoProps {
  className?: string
  variant?: LogoVariant
  showTagline?: boolean
  showVersion?: boolean
  versionText?: string
  negative?: boolean // Modo escuro / fundo escuro (sidebar, etc.)
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean // compatibilidade legada
}

/**
 * Componente oficial de Logomarca VETOR MASTER
 * Utiliza diretamente os vetores SVG oficiais mestre:
 * - logo-5e.svg: Versão horizontal oficial (1536x864) com símbolo e tipografia MASTER
 * - logo-5a.svg: Versão quadrada oficial (2400x2400) para vertical / ícone
 */
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
  const effectiveVariant = !showText ? 'icon' : variant

  // Dimensões proporcionais por tamanho
  const iconPixelSize = size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 48 : 64
  const horizontalHeight = size === 'sm' ? 34 : size === 'md' ? 44 : size === 'lg' ? 56 : 72
  const verticalHeight = size === 'sm' ? 52 : size === 'md' ? 72 : size === 'lg' ? 96 : 130

  if (effectiveVariant === 'icon') {
    return (
      <div className={cn('inline-flex items-center justify-center shrink-0', className)}>
        <img
          src={logo5aUrl}
          alt="Vetor Master"
          width={iconPixelSize}
          height={iconPixelSize}
          className={cn(
            'shrink-0 object-contain select-none transition-all',
            negative && 'brightness-0 invert',
          )}
          style={{ width: iconPixelSize, height: iconPixelSize }}
          loading="eager"
        />
      </div>
    )
  }

  if (effectiveVariant === 'vertical') {
    return (
      <div
        className={cn(
          'inline-flex flex-col items-center text-center select-none shrink-0',
          className,
        )}
      >
        <div className="relative flex items-center justify-center">
          <img
            src={logo5aUrl}
            alt="VETOR MASTER"
            className={cn(
              'object-contain select-none transition-all',
              negative && 'brightness-0 invert',
            )}
            style={{ height: verticalHeight, width: 'auto' }}
            loading="eager"
          />
          {showVersion && (
            <span
              className={cn(
                'absolute -bottom-1.5 right-0 text-[10px] font-bold tracking-tight px-1.5 py-0.5 rounded-[3px] shadow-sm',
                negative
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-[#0066CC]/10 text-[#0066CC] border border-[#0066CC]/20',
              )}
            >
              {versionText}
            </span>
          )}
        </div>
        {showTagline && (
          <span
            className={cn(
              'text-[8px] md:text-[9px] tracking-[0.2em] uppercase mt-2 font-semibold',
              negative ? 'text-white/80' : 'text-[#333333]',
            )}
          >
            DIREÇÃO • CONEXÃO • CRESCIMENTO
          </span>
        )}
      </div>
    )
  }

  // Versão Horizontal (padrão para Header, Sidebar, Landing, etc.)
  // Usa o vetor oficial logo-5e.svg (1536x864, formato master horizontal oficial)
  return (
    <div className={cn('inline-flex items-center select-none shrink-0 gap-1.5', className)}>
      <img
        src={logo5eUrl}
        alt="VETOR MASTER"
        className={cn(
          'object-contain select-none transition-all',
          negative && 'brightness-0 invert',
        )}
        style={{ height: horizontalHeight, width: 'auto' }}
        loading="eager"
      />
      {showVersion && (
        <span
          className={cn(
            'text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded-[3px] shrink-0 self-center',
            negative
              ? 'bg-white/20 text-white border border-white/30'
              : 'bg-[#0066CC]/10 text-[#0066CC] border border-[#0066CC]/20',
          )}
        >
          {versionText}
        </span>
      )}
    </div>
  )
}

export default Logo
