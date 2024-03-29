import { crawl, getAllCrawledAssets } from '../util/crawl'
import { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-mixed-content',
  description: 'Check if the site is using mixed content',
  type: 'check',
  version: 1,
  run: async (options, saveResult, _saveError) => {
    await crawl(options.site)
    await Promise.allSettled(Object.entries(getAllCrawledAssets()).map(async ([ _, httpsResponse ]) => {
      for (const email of httpsResponse.body.matchAll(/(?<url>http:\/\/[\w+.-_]+)/gi)) {
        if (email.groups?.url === 'http://www.w3.org/2000/svg') {
          // ignore svg namespace URL
          continue
        }
        saveResult({
          confidence: 3,
          title: 'Mixed-content resource found',
          message: `Your site loads a resource "${email.groups?.url}" via plain-text HTTP`,
          severity: 3,
          description: `Your site loads a resource "${email.groups?.url}" via plain-text HTTP. This is a security risk as it can be intercepted and modified by a third party.`
        })
      }
    }))
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
