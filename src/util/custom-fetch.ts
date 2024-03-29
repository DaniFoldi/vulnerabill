
import { Socket } from 'node:net'
import { URL } from 'node:url'
import { connect, TLSSocket, PeerCertificate } from 'node:tls'
import { getDnsRecords } from './dns'
import { choose } from './random'
import { withHttps } from './url'
import { addCrawled } from './crawl'


export interface CustomRequest {
  body?: string
  headers?: { [key: string]: string }
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'TRACE'
  tls: '1.0' | '1.1' | '1.2' | '1.3'
}

export interface CustomResponse {
  body: string
  headers: { [key: string]: string }
  status: number
  alpn?: string
  certificate?: PeerCertificate
  cipher?: string
}

function getSocket(protocol: string, ip: string, host: string, tls: CustomRequest['tls'] = '1.3'): [Socket | TLSSocket, () => void] {
  const tcpClient = new Socket()
  if (protocol === 'http') {
    return [ tcpClient, () => tcpClient.connect(80, ip) ]
  }
  const client = connect(443, host, { socket: tcpClient, servername: host,

    minVersion: tls === '1.0' ? 'TLSv1' : (tls === '1.1' ? 'TLSv1.1' : tls === '1.2' ? 'TLSv1.2' : 'TLSv1.3'),

    maxVersion: tls === '1.0' ? 'TLSv1' : (tls === '1.1' ? 'TLSv1.1' : tls === '1.2' ? 'TLSv1.2' : 'TLSv1.3') })

  return [ client, () => tcpClient.connect(443, ip) ]
}

export async function customFetch(_url: string | URL, options?: CustomRequest): Promise<CustomResponse> {
  const url = typeof _url === 'string' ? withHttps(_url, true) : _url
  const protocol = url.protocol.replace(':', '')
  const ip = choose(await getDnsRecords(url.hostname, 'A') ?? await getDnsRecords(url.hostname, 'AAAA'))?.address
  if (!ip) {
    throw new Error(`Could not resolve ${url.hostname}`)
  }
  const [ socket, doConnect ] = getSocket(protocol, ip, url.hostname, options?.tls ?? '1.3')


  return new Promise((resolve, reject) => {

    socket.on('error', reject)

    socket.once(protocol === 'https' ? 'secureConnect' : 'connect', () => {
      const defaultHeaders = {
        'Accept': '*/*',
        'Connection': 'close',
        'Content-Length': options?.body?.length ?? 0,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'fetch/vulnerabill, like curl',
        ...(options?.method === 'POST' ? {
          'Origin': url.origin,
          'Referer': url.origin
        } : {})
      }
      const request = [
        `${options?.method ?? 'GET'} ${url.pathname ?? '/'} HTTP/1.1`,
        `Host: ${url.hostname}`,
        ...(Object.entries({ ...defaultHeaders, ...(options?.headers) }).map(([ key, value ]) => `${key}: ${value}`)), '\r\n'
      ].join('\r\n')
      socket.write(request)
    })
    let response: string[] = []
    socket.on('data', (data: Buffer) => {
      response = [ ...response, ...data.toString().split('\r\n') ]
    })
    socket.on('end', () => {
      socket.end()
      const headers: { [key: string]: string } = {}
      let body = ''
      let isBody = false
      if (response.length === 0) {
        throw new Error(`Received empty response while fetching ${url}`)
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const firstLine = response.shift()!
      const status = Number.parseInt(firstLine.split(' ')[1])
      for (const line of response) {
        if (isBody) {
          body += line
          continue
        }
        if (line === '') {
          isBody = true
          continue
        }
        const [ key, value ] = line.split(': ')
        headers[key.toLowerCase()] = value
      }

      addCrawled(url.toString(), { status, headers, body })

      resolve({
        body, status, headers,
        alpn: socket instanceof TLSSocket && socket.alpnProtocol ? socket.alpnProtocol : undefined,
        certificate: socket instanceof TLSSocket ? socket.getPeerCertificate() : undefined,
        cipher: socket instanceof TLSSocket ? socket.getCipher().name : undefined
      })
    })
    doConnect()
  })
}

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest

  it('should return tls socket', () => {
    const [ socket ] = getSocket('https', '0.0.0.0', 'example.com')

    expect(socket).toBeInstanceOf(TLSSocket)
  })

  it('should return tcp socket', () => {
    const [ socket ] = getSocket('http', '0.0.0.0', 'example.com')

    expect(socket).toBeInstanceOf(Socket)
  })
}
