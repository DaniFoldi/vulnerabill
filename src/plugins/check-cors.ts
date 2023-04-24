import { customFetch } from '../util/custom-fetch'
import { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-cors',
  description: 'Check if the site has CORS enabled',
  type: 'check',
  version: 1,
  run: async (options, saveResult, saveError) => {
    const response = await customFetch(options.site)
    const acao = response.headers['access-control-allow-origin']
    if (acao && acao.includes('*')) {
      saveResult({
        confidence: 3,
        title: 'CORS enabled',
        message: 'Your site has CORS enabled for any origin',
        severity: 3,
        description: 'CORS should be restricted to specific origins to prevent information leakage.'
      })
    } else if (acao) {
      saveResult({
        confidence: 3,
        title: 'CORS enabled',
        message: 'Your site has CORS enabled for some origins',
        severity: 0,
        description: 'CORS should be restricted to specific origins to prevent information leakage.'
      })
    } else {
      saveResult({
        confidence: 3,
        title: 'CORS not enabled',
        message: 'Your site does not have CORS enabled',
        severity: 0,
        description: 'CORS should be enabled only when cross-origin requests are required (for example, an API).'
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
