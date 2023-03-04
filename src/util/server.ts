import { customFetch } from './custom-fetch'
import { withHttps } from './url'


export async function getServer(website: string): Promise<'cloudflare' | 'apache' | 'nginx' | string> {
  const response = await customFetch(withHttps(website))
  return response.headers.server
}
