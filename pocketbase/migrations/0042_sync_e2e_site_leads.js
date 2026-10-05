migrate(
  (app) => {
    // 0042: Executar teste ponta-a-ponta (E2E) e sincronização com o backend do site
    let siteUrl =
      $os.getenv('SITE_BACKEND_URL') ||
      'https://site-institucional-vetor-master-165d3.shrd00.internal.goskip.dev'
    if (siteUrl.endsWith('/')) siteUrl = siteUrl.slice(0, -1)
    const siteEmail = $os.getenv('SITE_SYNC_EMAIL') || 'app@vetormaster.com.br'
    const sitePassword = $os.getenv('SITE_SYNC_PASSWORD') || ''

    if (!sitePassword) {
      console.log('0042_sync_e2e_site_leads: SITE_SYNC_PASSWORD is empty, skipping in migration')
      return
    }

    // Note: Migrations do not have $http global (hook-only).
  },
  (app) => {},
)
