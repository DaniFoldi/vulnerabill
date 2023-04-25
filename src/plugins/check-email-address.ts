import { withHttp } from '../util/url'
import { crawl, getAllCrawledAssets } from '../util/crawl'
import type { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-http-redirect',
  type: 'check',
  version: 1,
  description: 'Check if HTTP requests are redirected to HTTPS',
  run: async (options, saveResult, _saveError) => {
    await crawl(withHttp(options.site).href)
    await Promise.allSettled(Object.entries(getAllCrawledAssets()).map(async ([ _url, httpsResponse ]) => {
      for (const email of httpsResponse.body.matchAll(/(?<email>[\w+.-_]+@[\w+.-_]+)/gi)) {
        if (email.groups?.email.startsWith('http')) {
          continue
        }
        saveResult({
          confidence: 2,
          title: 'Bot-readable email address found',
          message: `Your site contains an email address "${email.groups?.email}" that can be found by bots`,
          severity: 2,
          description: 'Email addresses are often used by bots to send spam. '
            + 'To prevent this, you should use a JavaScript snippet to hide your email address from bots.'
        })
      }
    }))
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
