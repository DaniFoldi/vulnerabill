import { customFetch } from '../util/custom-fetch'
import { withHttps } from '../util/url'
import { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-hsts',
  description: 'Check if the site is using HSTS',
  type: 'check',
  version: 1,
  run: async (options, saveResult, _saveError) => {
    const response = await customFetch(withHttps(options.site))
    const hsts = response.headers['strict-transport-security']
    if (!hsts) {
      saveResult({
        confidence: 3,
        title: 'HSTS not set',
        message: 'Your site does not have HSTS set',
        severity: 3,
        description: 'HSTS should be set to prevent downgrade attacks.'
      })
      return
    }

    if (!hsts.includes('max-age')) {
      saveResult({
        confidence: 3,
        title: 'HSTS max-age not set',
        message: 'Your site does not have HSTS max-age set',
        severity: 3,
        description: 'HSTS max-age should be set to prevent downgrade attacks.'
      })
    }

    if (!hsts.includes('includeSubDomains')) {
      saveResult({
        confidence: 3,
        title: 'HSTS includeSubDomains not set',
        message: 'Your site does not have HSTS includeSubDomains set',
        severity: 3,
        description: 'HSTS includeSubDomains should be set to prevent downgrade attacks against subdomains such as "www.".'
      })
    }
  }
}


if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
