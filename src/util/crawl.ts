import { customFetch, CustomResponse } from './custom-fetch'
import { withHttps } from './url'


const URL_REGEX = /(open|fetch|(action|href|src|location)=)(["'])(.*?)(["'])/gi

const cache: Record<string, CustomResponse> = {}

export function addCrawled(url: string, response: {body: string; status: number; headers: {[key: string]: string}}) {
  cache[url.toString()] = response
}

export function sameOriginLinks(hostname: string, content: string): string[] {
  const urls = []
  for (const match of content.matchAll(URL_REGEX)) {
    const url = match[4]
    try {
      if (withHttps(url, true, hostname).origin === withHttps(hostname).origin) {
        urls.push(withHttps(url, true, hostname).href)
      }
    } catch {
      // some matches are invalid URLs, which we can ignore
    }
  }
  return urls
}

export async function crawl(site: string) {
  const queue = [ site ]
  while (queue.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const url = queue.shift()!
    if (cache[url]) {
      continue
    }
    const response = await customFetch(url)
    sameOriginLinks(withHttps(site).origin, response.body)
      .forEach(url => queue.push(url))
  }
}

export function getAllCrawledAssets(): Record<string, CustomResponse> {
  return Object.fromEntries(Object.entries(cache)
    .filter(([ _url, response ]) => response.status >= 200 && response.status <= 299))
}

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest

  it('should only return same-origin links', async () => {
    const links = sameOriginLinks('https://example.com', `
      <a href="https://example.com/https">same</a>
      <a href="https://example.org/https">different</a>
      <a href=http://example.com/http>same http</a>
      <a href=http://example.org/nttp>different http</a>
      <a href='/relative'>relative</a>
      <a href='https://example.org/relative'>different tld</a>
    `)

    expect(links).toEqual([
      'https://example.com/https',
      'https://example.com/relative'
    ])
  })

  it('overrides cache entries', async () => {
    addCrawled('https://example.com', { body: '1', status: 200, headers: {} })
    addCrawled('https://example.com', { body: '2', status: 200, headers: {} })
    expect(Object.keys(cache)).toEqual([ 'https://example.com' ])
    expect(cache['https://example.com'].body).toEqual('2')
  })
}
