import { customFetch } from '../util/custom-fetch'
import { withHttps } from '../util/url'
import { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-csp',
  description: 'Check if the site has a Content Security Policy',
  type: 'check',
  run: async (options, saveResult, saveError) => {
    const response = await customFetch(withHttps(options.site))
    const csp = response.headers['content-security-policy']
    if (!csp) {
      saveResult({
        confidence: 5,
        title: 'Content Security Policy not set',
        message: 'Your site does not have a Content Security Policy set',
        severity: 5,
        description: 'A Content Security Policy should be set to prevent XSS attacks.'
      })
      return
    }

    if (!csp.includes('upgrade-insecure-requests')) {
      saveResult({
        confidence: 5,
        title: 'Content Security Policy does not upgrade insecure requests',
        message: 'Your site does not have a Content Security Policy that upgrades insecure requests',
        severity: 3,
        description: 'A Content Security Policy should be set to upgrade insecure requests to prevent downgrade attacks.'
      })
    }

    if (!csp.includes('block-all-mixed-content')) {
      saveResult({
        confidence: 5,
        title: 'Content Security Policy does not block mixed content',
        message: 'Your site does not have a Content Security Policy that blocks mixed content',
        severity: 3,
        description: 'A Content Security Policy should be set to block mixed content to prevent downgrade attacks.'
      })
    }

    if (!csp.includes('default-src \'none\'')) {
      saveResult({
        confidence: 5,
        title: 'Content Security Policy does not set a default source',
        message: 'Your site does not have a Content Security Policy that sets a default source',
        severity: 2,
        description: 'A Content Security Policy should be set to set a default source to prevent XSS attacks.'
      })
    }

    if (csp.includes('unsafe-inline')) {
      saveResult({
        confidence: 5,
        title: 'Content Security Policy allows inline scripts',
        message: 'Your site does not have a Content Security Policy that allows inline scripts',
        severity: 3,
        description: 'A Content Security Policy should be set to not allow inline scripts to prevent XSS attacks.'
      })
    }

    if (csp.includes('unsafe-eval')) {
      saveResult({
        confidence: 5,
        title: 'Content Security Policy allows eval',
        message: 'Your site does not have a Content Security Policy that allows eval',
        severity: 4,
        description: 'A Content Security Policy should be set to not allow eval to prevent XSS attacks.'
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
