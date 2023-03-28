import { withHttps } from '../util/url'
import { customFetch } from '../util/custom-fetch'
import type { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-potential-source-leak',
  type: 'check',
  description: 'Check if certain paths are present on the site',
  run: async (options, saveResult, saveError) => {
    const potentialSources = [ '/.git', '/src', '/lib', '/.env', '.htaccess', 'nginx.conf', 'default.conf' ]

    for (const source of potentialSources) {
      const response = await customFetch(new URL(source, withHttps(options.site)))
      if (response.status < 300) {
        saveResult({
          confidence: 5,
          message: `Your site contains potential source code in ${new URL(source, withHttps(options.site))}`,
          title: 'Potential source code found',
          description: 'The site contains potential source code that can be used by attackers to find vulnerabilities in your site.' +
              'These files should be removed from the site.',
          severity: 5
        })
      }
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
