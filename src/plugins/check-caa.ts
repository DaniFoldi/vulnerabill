import { getDnsRecords } from '../util/dns'
import { withHttps } from '../util/url'
import { customFetch } from '../util/custom-fetch'
import type { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-caa',
  description: 'Check if the site has a CAA record',
  type: 'check',
  version: 1,
  run: async (options, saveResult, saveError) => {
    const caa = await getDnsRecords(options.site, 'CAA')
    if (caa.length === 0) {
      saveResult({
        title: 'No CAA record',
        description: 'The site does not have a CAA record',
        message: 'The site does not have a CAA record',
        confidence: 3,
        severity: 3
      })
    }

    const issuers: Record<string, string | undefined> = {
      'Let\'s Encrypt': 'letsencrypt.org',
      'DigiCert': 'digicert.com',
      'GlobalSign': 'globalsign.com',
      'GoDaddy': 'godaddy.com',
      'Entrust': 'entrust.net',
      'Comodo': 'comodo.com',
      'Certum': 'certum.pl',
      'IdenTrust': 'identrust.com',
      'VeriSign': 'verisign.com',
      'Amazon': 'amazon.com',
      'Google': 'pki.goog',
      'Cloudflare': 'cloudflare.com'
    }

    const { certificate } = await customFetch(withHttps(options.site))
    if (!certificate) {
      saveError('Could not get certificate')
      return
    }
    if (!caa.some(record => record.value === issuers[certificate.issuer.O.split(';')[0]])) {
      saveResult({
        title: 'Certificate issuer not allowed by CAA',
        description: 'The CAA records do not match the certificate issuer',
        message: `The certificate issuer is ${certificate.issuer.O} but the CAA record does not allow it`,
        confidence: 3,
        severity: 3
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
