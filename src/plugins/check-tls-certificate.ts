import { customFetch } from '../util/custom-fetch'
import { withHttps } from '../util/url'
import type { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-tls-certificate',
  description: 'Check properties of the certificate returned',
  type: 'check',
  version: 1,
  run: async (options, saveResult, _saveError) => {
    const response = await customFetch(withHttps(options.site))
    if (response.certificate?.valid_from && Date.parse(response.certificate?.valid_from) < Date.now()) {
      saveResult({
        confidence: 3,
        title: 'Certificate not yet valid',
        message: 'The period of validity of the certificate returned by your site has not yet started.',
        severity: 3,
        description: 'Certificates should only be served after they become valid.'
      })
    }
    if (response.certificate?.valid_to && Date.parse(response.certificate?.valid_to) > Date.now()) {
      saveResult({
        confidence: 3,
        title: 'Certificate expired',
        message: 'The certificate returned by your site has expired.',
        severity: 3,
        description: 'Certificates should be renewed before they expire.'
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
