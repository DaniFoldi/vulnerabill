import { URL } from 'node:url'


export function withHttp(url: string, keepHttps = false, baseUrl?: string): URL {
  if (url.startsWith('/')) {
    url = `${baseUrl}${url}`
  }
  if (!url.startsWith('http')) {
    url = `http://${url}`
  }
  const setHttps = keepHttps && url.startsWith('https:')
  const newUrl = new URL(url, baseUrl)
  if (setHttps) {
    newUrl.protocol = 'https:'
  }
  return newUrl
}

export function withHttps(url: string, keepHttp = false, baseUrl?: string): URL {
  if (url.startsWith('/')) {
    url = `${baseUrl}${url}`
  }
  if (!url.startsWith('http')) {
    url = `https://${url}`
  }

  const setHttp = keepHttp && url.startsWith('http:')
  const newUrl = new URL(url, baseUrl)
  if (setHttp) {
    newUrl.protocol = 'http:'
  }
  return newUrl
}
