import { customFetch } from '../util/custom-fetch'
import { withHttps } from '../util/url'
import { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-tls-support',
  description: 'Check if the site is only accepting secure TLS connections',
  type: 'check',
  version: 1,
  run: async (options, saveResult, saveError) => {
    try {
      await customFetch(withHttps(options.site), { tls: '1.0' })
      saveResult({
        confidence: 3,
        title: 'TLS 1.0 is supported',
        message: 'Your site supports TLS 1.0, which is insecure and should be disabled',
        severity: 3,
        description: 'TLS 1.0 is insecure and should be disabled to prevent information leakage.'
      })
    } catch {
      saveResult({
        confidence: 3,
        title: 'TLS 1.0 is not supported',
        message: 'Your site does not support TLS 1.0',
        severity: 0,
        description: 'TLS 1.0 is insecure and should be disabled to prevent information leakage.'
      })
    }
    try {
      await customFetch(withHttps(options.site), { tls: '1.1' })
      saveResult({
        confidence: 3,
        title: 'TLS 1.0 is supported',
        message: 'Your site supports TLS 1.0, which is insecure and should be disabled',
        severity: 3,
        description: 'TLS 1.0 is insecure and should be disabled to prevent information leakage.'
      })
    } catch {
      saveResult({
        confidence: 3,
        title: 'TLS 1.1 is supported',
        message: 'Your site supports TLS 1.1, which is insecure and should be disabled',
        severity: 3,
        description: 'TLS 1.1 is insecure and should be disabled to prevent information leakage.'
      })
    }
    try {
      await customFetch(withHttps(options.site))
      saveResult({
        confidence: 3,
        title: 'TLS 1.2 is supported',
        message: 'Your site supports TLS 1.2, which is secure with certain cipher suites',
        severity: 1,
        description: 'TLS 1.2 is secure with certain cipher suites, but should be upgraded to TLS 1.3 to prevent information leakage.'
      })
    } catch {
      saveResult({
        confidence: 3,
        title: 'TLS 1.2 is not supported',
        message: 'Your site does not support TLS 1.2',
        severity: 0,
        description: 'TLS 1.2 is secure with certain cipher suites, but should be upgraded to TLS 1.3 to prevent information leakage.'
      })
    }
    try {
      await customFetch(withHttps(options.site), { tls: '1.3' })
      saveResult({
        confidence: 3,
        title: 'TLS 1.3 is supported',
        message: 'Your site supports TLS 1.3, which is secure',
        severity: 0,
        description: 'TLS 1.3 is secure, and required to prevent information leakage.'
      })
    } catch {
      saveResult({
        confidence: 3,
        title: 'TLS 1.3 is not supported',
        message: 'Your site does not support TLS 1.3',
        severity: 2,
        description: 'TLS 1.3 is secure, and required to prevent information leakage.'
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
