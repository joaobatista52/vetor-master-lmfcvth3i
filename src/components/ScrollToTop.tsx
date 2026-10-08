import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop: Rola a janela ao topo (0, 0) a cada mudança de pathname.
 * Garante que navegações entre páginas públicas (ex.: rodapé -> /privacidade ou
 * /privacidade -> home) sempre abram no topo da página de destino.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
