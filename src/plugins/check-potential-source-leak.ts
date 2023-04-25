import { withHttps } from '../util/url'
import { customFetch } from '../util/custom-fetch'
import type { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-potential-source-leak',
  type: 'check',
  version: 1,
  description: 'Check if certain paths are present on the site',
  run: async (options, saveResult, _saveError) => {
    const potentialSources = [ '/.git', '/src', '/lib', '/.env', '.htaccess', 'nginx.conf', 'default.conf' ]

    let found = false
    for (const source of potentialSources) {
      const response = await customFetch(new URL(source, withHttps(options.site)))
      if (response.status < 300) {
        found = true
        saveResult({
          confidence: 3,
          message: `Your site contains potential source code in ${new URL(source, withHttps(options.site))}`,
          title: 'Potential source code found',
          description: 'The site contains potential source code that can be used by attackers to find vulnerabilities in your site.'
              + 'These files should be removed from the site.',
          severity: 3
        })
      }
    }

    if (!found) {
      saveResult({
        confidence: 2,
        message: 'No potential source code found',
        title: 'No potential source code found',
        description: 'No potential source code was found on the site.',
        severity: 0
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
