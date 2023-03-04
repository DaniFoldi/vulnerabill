import { withHttp } from '../util/url'
import { crawl, getAllCrawledAssets } from '../util/crawl'
import type { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-http-redirect',
  type: 'check',
  description: 'Check if HTTP requests are redirected to HTTPS',
  run: async (options, saveResult) => {
    await crawl(withHttp(options.site).href)
    await Promise.allSettled(Object.entries(getAllCrawledAssets()).map(async ([ url, httpsResponse ]) => {
      for (const email of httpsResponse.body.matchAll(/(?<email>[\w+.-_]+@[\w+.-_]+)/gi)) {
        if (email.groups?.email.startsWith('http')) {
          continue
        }
        saveResult({
          confidence: 4,
          title: 'Bot-readable email address found',
          message: `Your site contains an email address "${email.groups?.email}" that can be found by bots`,
          severity: 4,
          description: 'Email addresses are often used by bots to send spam. '
            + 'To prevent this, you should use a JavaScript snippet to hide your email address from bots.'
        })
      }
    }))
  }
}
