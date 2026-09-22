import React from 'react'
import { cn } from '@/lib/utils'
import logo5aPng from '@/assets/logo-5a-vetor-master-14jul26-25ac8.png'
import logo5ePng from '@/assets/logo-5e-vetor-master-14jul26-04e42.png'

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
        src={logo5aPng}
        alt="Vetor Master"
        className={cn(
          'w-full h-full object-contain select-none',
          monochromeNegative && 'brightness-0 invert',
        )}
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
  negative?: boolean // Modo escuro / fundo escuro (sidebar, etc.)
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean // compatibilidade legada
}

/**
 * Componente oficial de Logomarca VETOR MASTER
 * Utiliza diretamente os PNGs oficiais mestre (Plano B aprovado e garantido em dev e produção):
 * - logo-5e PNG: Versão horizontal oficial (1536x864) com símbolo e tipografia MASTER
 * - logo-5a PNG: Versão quadrada oficial (2400x2400) para vertical / ícone
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

  // Dimensões proporcionais atualizadas:
  // - horizontal: ~56–64px no padrão/sm e maior conforme escala
  // - ícone: ~48px
  // - vertical: maior no Login (xl: ~160-180px)
  const iconPixelSize = size === 'sm' ? 40 : size === 'md' ? 48 : size === 'lg' ? 56 : 64
  const horizontalHeight = size === 'sm' ? 56 : size === 'md' ? 64 : size === 'lg' ? 72 : 88
  const verticalHeight = size === 'sm' ? 72 : size === 'md' ? 96 : size === 'lg' ? 128 : 170

  if (effectiveVariant === 'icon') {
    return (
      <div className={cn('inline-flex items-center justify-center shrink-0', className)}>
        <img
          src={logo5aPng}
          alt="Vetor Master"
          width={iconPixelSize}
          height={iconPixelSize}
          className="shrink-0 object-contain select-none transition-all"
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
            src={logo5aPng}
            alt="VETOR MASTER"
            className="object-contain select-none transition-all"
            style={{ height: verticalHeight, width: 'auto' }}
            loading="eager"
          />
          {showVersion && (
            <span
              className={cn(
                'absolute -bottom-1.5 right-0 text-[10px] font-bold tracking-tight px-1.5 py-0.5 rounded-[3px] shadow-sm',
                negative
                  ? 'bg-[#0066CC] text-white border border-white/20'
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
  // Exibe o logo COLORIDO sobre fundo claro ou escuro (sem brightness-0 invert)
  return (
    <div className={cn('inline-flex items-center select-none shrink-0 gap-2', className)}>
      <img
        src={logo5ePng}
        alt="VETOR MASTER"
        className="object-contain select-none transition-all"
        style={{ height: horizontalHeight, width: 'auto' }}
        loading="eager"
      />
      {showVersion && (
        <span
          className={cn(
            'text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded-[3px] shrink-0 self-center',
            negative
              ? 'bg-[#0066CC] text-white border border-white/20'
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
