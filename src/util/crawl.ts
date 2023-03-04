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
    .filter(([ url, response ]) => response.status >= 200 && response.status <= 299))
}
