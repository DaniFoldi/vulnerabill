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

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest

  it('should add http', () => {
    expect(withHttp('example.com').href).toBe('http://example.com/')
    expect(withHttp('http://example.com').href).toBe('http://example.com/')
    expect(withHttp('https://example.com').href).toBe('https://example.com/')
    expect(withHttp('https://example.com', true).href).toBe('https://example.com/')
    expect(withHttp('https://example.com', false).href).toBe('https://example.com/')
    expect(withHttp('https://example.com', false, 'https://example.org').href).toBe('https://example.com/')
  })

  it('should add https', () => {
    expect(withHttps('example.com').href).toBe('https://example.com/')
    expect(withHttps('http://example.com').href).toBe('http://example.com/')
    expect(withHttps('https://example.com').href).toBe('https://example.com/')
    expect(withHttps('http://example.com', true).href).toBe('http://example.com/')
    expect(withHttps('http://example.com', false).href).toBe('http://example.com/')
    expect(withHttps('http://example.com', false, 'https://example.org').href).toBe('http://example.com/')
  })
}
