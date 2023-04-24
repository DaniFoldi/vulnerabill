import { CheckPlugin } from '../plugins'
import { withHttp } from '../util/url'
import { customFetch } from '../util/custom-fetch'
import { crawl, getAllCrawledAssets } from '../util/crawl'


export const plugin: CheckPlugin = {
  name: 'check-http-redirect',
  type: 'check',
  description: 'Check if HTTP requests are redirected to HTTPS',
  version: 1,
  run: async (options, saveResult) => {
    let found = false
    await crawl(withHttp(options.site).href)
    await Promise.allSettled(Object.entries(getAllCrawledAssets())
      .filter(([ url, response ]) => response.headers['content-type'] === 'text/html')
      .map(([ url, response ]) => url)
      .map(async url => {
        const response = await customFetch(withHttp(url))
        if (response.status !== 301) {
          found = true
          saveResult({
            confidence: 3,
            title: 'HTTP request not redirected to HTTPS',
            message: `Your site does not redirect HTTP request to ${withHttp(url)} to HTTPS`,
            severity: 3,
            description: 'HTTP requests should be redirected to HTTPS to prevent information leakage.'
          })
        }
      }))

    if (!found) {
      saveResult({
        confidence: 3,
        title: 'HTTP requests are redirected to HTTPS',
        message: 'Your site redirects HTTP requests to HTTPS',
        severity: 0,
        description: 'HTTP requests should be redirected to HTTPS to prevent information leakage.'
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
