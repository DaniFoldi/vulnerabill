import { customFetch } from '../util/custom-fetch'
import { withHttps } from '../util/url'
import { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-headers',
  description: 'Check if the site has recommended headers set',
  type: 'check',
  run: async (options, saveResult, saveError) => {
    const response = await customFetch(withHttps(options.site))
    if (response.headers['x-frame-options'] !== 'SAMEORIGIN' && response.headers['x-frame-options'] !== 'DENY' && !response.headers['x-frame-options'].startsWith('ALLOW-FROM')) {
      saveResult({
        confidence: 5,
        title: 'X-Frame-Options header not set',
        message: 'Your site does not have the X-Frame-Options header set',
        severity: 5,
        description: 'The X-Frame-Options header should be set to SAMEORIGIN to prevent clickjacking attacks.'
      })
    }

    if (response.headers['x-xss-protection'] !== '1; mode=block') {
      saveResult({
        confidence: 5,
        title: 'X-XSS-Protection header not set',
        message: 'Your site does not have the X-XSS-Protection header set',
        severity: 5,
        description: 'The X-XSS-Protection header should be set to 1; mode=block to prevent XSS attacks.'
      })
    }

    if (response.headers['x-content-type-options'] !== 'nosniff') {
      saveResult({
        confidence: 5,
        title: 'X-Content-Type-Options header not set',
        message: 'Your site does not have the X-Content-Type-Options header set',
        severity: 5,
        description: 'The X-Content-Type-Options header should be set to nosniff to prevent MIME type confusion attacks.'
      })
    }

    if (!response.headers['strict-transport-security']) {
      saveResult({
        confidence: 5,
        title: 'Strict-Transport-Security header not set',
        message: 'Your site does not have the Strict-Transport-Security header set',
        severity: 5,
        description: 'The Strict-Transport-Security header should be set to prevent SSL stripping attacks.'
      })
    }

    if (response.headers['referrer-policy'] !== 'no-referrer-when-downgrade' && response.headers['referrer-policy'] !== 'origin-when-cross-origin') {
      saveResult({
        confidence: 5,
        title: 'Referrer-Policy header not set',
        message: 'Your site does not have the Referrer-Policy header set',
        severity: 5,
        description: 'The Referrer-Policy header should be set to no-referrer-when-downgrade to prevent information leakage.'
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
