import { customFetch } from './custom-fetch'
import { withHttps } from './url'


export async function getServer(website: string): Promise<'cloudflare' | 'apache' | 'nginx' | string> {
  const response = await customFetch(withHttps(website), { tls: '1.2' })
  return response.headers.server.toLowerCase()
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should get server cloudflare', async () => {
    const server = await getServer('https://www.cloudflare.com')
    expect(server).toBe('cloudflare')
  })

  it('should get server apache', async () => {
    const server = await getServer('https://www.apache.org')
    expect(server).toBe('apache')
  })

  it('should get server nginx', async () => {
    const server = await getServer('https://www.nginx.com')
    expect(server).toBe('nginx')
  })
}
