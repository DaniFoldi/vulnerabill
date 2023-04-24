/* eslint-disable unicorn/numeric-separators-style */
import { createSocket } from 'node:dgram'
import { randomBytes } from 'node:crypto'
import { rootServers4, rootServers6 } from './root-dns'
import { choose } from './random'
import { trustAnchors } from './trust-anchors'


export type DnsRecord = {
  ttl: number
} & (
  | {type: 'A'; address: string}
  | {type: 'AAAA'; address: string}
  | {type: 'CAA'; flags: number; tag: string; value: string}
  | {type: 'CNAME'; hostname: string}
  | {type: 'DNSKEY'; flags: number; protocol: number; algorithm: number; publicKey: string}
  | {type: 'DS'; tag: number; algorithm: number; digestType: number; digest: string}
  | {type: 'MX'; priority: number; hostname: string}
  | {type: 'NS'; hostname: string}
  | {type: 'PTR'; hostname: string}
  | {type: 'RRSIG'; typeCovered: number; algorithm: number; labels: number; originalTTL: number; signatureExpiration: number; signatureInception: number; keyTag: number; signerName: string; signature: string}
  | {type: 'SOA'; mname: string; rname: string; serial: number; refresh: number; retry: number; expire: number; minTTL: number}
  | {type: 'SRV'; hostname: string; priority: number; weight: number; port: number}
  | {type: 'TXT'; data: string}
 )

const recordTypes = {
  A: 1,
  AAAA: 28,
  CAA: 257,
  CNAME: 5,
  DNSKEY: 48,
  DS: 43,
  MX: 15,
  NS: 2,
  PTR: 12,
  RRSIG: 46,
  SOA: 6,
  SRV: 33,
  TXT: 16
} as const

const dnsCache: {
  [T in keyof typeof recordTypes as `${T}+${string}`]: Array<SpecificDnsRecord<T>>
} = {}

export type SpecificDnsRecord<T extends keyof typeof recordTypes> = DnsRecord & { type: T }

// For the purpose of this tool, we ignore DNS cache expiration - unless we query something with a TTL of 1
// This should be unnoticeable, as all queries are repeated when rerunning the tool

cacheRootServers()


export async function getDnsRecords<T extends keyof typeof recordTypes>(zone: string, type: T):
  Promise<Array<SpecificDnsRecord<T>>> {
  const response = dnsCache[`${type}+${zone}`]
  if (response && response.length > 0) {
    // @ts-expect-error TypeScript can't infer this
    return response
  }
  try {
    // @ts-expect-error TypeScript can't infer this
    await queryDnsServer(zone, type, getNameServer('').address)
    const zones = zone.split('.').filter(Boolean)
    for (let i = 0; i < zones.length; i++) {
      const subzone = zones.slice(zones.length - i - 1).join('.')
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await queryDnsServer(zone, type, getNameServer(subzone)!.address)
    }

    // @ts-expect-error TypeScript can't infer this
    return dnsCache[`${type}+${zone}`] ?? []
  } catch {
    // Mitigate packet loss, malformed responses, etc. by retrying
    return getDnsRecords(zone, type)
  }
}

function getNameServer(zone: string): SpecificDnsRecord<'A'> | undefined {
  const ns = dnsCache[`NS+${zone}`]
  if (ns && ns.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return choose(dnsCache[`A+${choose(ns).hostname}`]!)
  }
}

function queryDnsServer(zone: string, type: keyof typeof recordTypes, server: string): Promise<void> {
  return new Promise(resolve => {
    zone = zone.replace(/\.+$/, '')
    const socket = createSocket(server.includes(':') ? 'udp6' : 'udp4')
    socket.connect(53, server)
    socket.addListener('connect', () => {
      const buffer = Buffer.alloc(512)
      const tid = randomBytes(2).readUInt16BE(0)
      buffer.writeUInt16BE(tid, 0)
      // QUERY, RD
      buffer.writeUInt16BE(0b0_0000_0_0_1_0_000_0000, 2)
      // QDCOUNT
      buffer.writeUInt16BE(0b0000_0000_0000_0001, 4)
      // ANCOUNT
      buffer.writeUInt16BE(0b0000_0000_0000_0000, 6)
      // NSCOUNT
      buffer.writeUInt16BE(0b0000_0000_0000_0000, 8)
      // ARCOUNT
      buffer.writeUInt16BE(0b0000_0000_0000_0000, 10)
      let offset = 0
      for (const part of zone.split('.')) {
        buffer.writeUInt8(part.length, 12 + offset)
        buffer.write(part, 13 + offset, 512, 'ascii')
        offset += part.length + 1
      }

      buffer.writeUInt16BE(recordTypes[type], 13 + offset)
      buffer.writeUInt16BE(0b0000_0000_0000_0001, 15 + offset)
      const trimmed_buffer = Buffer.alloc(offset + 17)
      buffer.copy(trimmed_buffer, 0, 0, offset + 17)
      socket.send(trimmed_buffer)
    })
    socket.addListener('message', message => {
      try {
        for (const [ key, records ] of Object.entries(parseDnsResponse(message))) {
          if (!records) {
            continue
          }

          for (const record of records) {
            // @ts-expect-error TypeScript can't infer this
            (dnsCache[key] ??= []).push(record)
          }
        }
      } catch (error) {
        throw new Error(`Error during DNS response parsing ${zone} ${type}: ${(error as Error).cause}`)
      }
      socket.close()
      resolve()
    })
  })
}

function parseDomainName(buffer: Buffer, offset: number): string {
  return readDnsName(buffer, offset)[0].join('.')
}

function parseDnsResponse(buffer: Buffer): typeof dnsCache {
  const records: typeof dnsCache = {}
  const qdcount = buffer.readUInt16BE(4)
  const ancount = buffer.readUInt16BE(6)
  const nscount = buffer.readUInt16BE(8)
  const arcount = buffer.readUInt16BE(10)
  let offset = 12

  for (let i = 0; i < qdcount; i++) {
    // parse questions to know skip length
    const [ _name, _offset ] = readDnsName(buffer, offset)
    offset = _offset + 4 // ignore classes
  }

  for (let i = 0; i < ancount; i++) {
    const [ zone, record, _offset ] = parseDnsRecord(buffer, offset);
    // @ts-expect-error TypeScript can't infer this
    (records[`${record.type}+${zone}`] ??= []).push(record)
    offset = _offset
  }

  for (let i = 0; i < nscount; i++) {
    const [ zone, record, _offset ] = parseDnsRecord(buffer, offset);
    // @ts-expect-error TypeScript can't infer this
    (records[`${record.type}+${zone}`] ??= []).push(record)
    offset = _offset
  }

  for (let i = 0; i < arcount; i++) {
    const [ zone, record, _offset ] = parseDnsRecord(buffer, offset);
    // @ts-expect-error TypeScript can't infer this
    (records[`${record.type}+${zone}`] ??= []).push(record)
    offset = _offset
  }

  return records
}

// @ts-expect-error the default case catches everything
function parseDnsRecord(buffer: Buffer, offset: number): [string, DnsRecord, number] {
  const [ _zone, _offset ] = readDnsName(buffer, offset)
  const zone = _zone.join('.')
  offset = _offset
  const type = buffer.readUInt16BE(offset)
  // ignore class
  offset += 4
  const ttl = buffer.readUint32BE(offset)
  offset += 4
  const rdlength = buffer.readUInt16BE(offset)
  offset += 2
  // const data = buffer.toString('ascii', offset, offset + rdlength)

  const z = Object.entries(recordTypes).find(([ _, v ]) => v === type)?.[0]
  switch (z) {
    case 'A':
      return [ zone, { type: 'A', ttl, address: readipv4(buffer, offset) }, offset + rdlength ]
    case 'AAAA':
      return [ zone, { type: 'AAAA', ttl, address: readipv6(buffer, offset) }, offset + rdlength ]
    case 'CAA':
      // TODO
      break
    case 'CNAME':
      return [ zone, { type: 'CNAME', ttl, hostname: parseDomainName(buffer, offset) }, offset + rdlength ]
    case 'DNSKEY':
      // @ts-expect-error TODO fix
      return [ zone, { type: 'DNSKEY', ttl, flags: buffer.readUInt16BE(offset), protocol: buffer.readUInt8(offset + 2), algorithm: buffer.readUInt8(offset + 3), key: buffer.toString('hex', offset + 4, offset + rdlength) }, offset + rdlength ]
    case 'DS':
      return [ zone, { type: 'DS', ttl, tag: buffer.readUInt16BE(offset), algorithm: buffer.readUInt8(offset + 2), digestType: buffer.readUInt8(offset + 3), digest: buffer.toString('hex', offset + 4, offset + rdlength) }, offset + rdlength ]
    case 'MX':
      return [ zone, { type: 'MX', ttl, priority: buffer.readUInt16BE(offset), hostname: parseDomainName(buffer, offset + 2) }, offset + rdlength ]
    case 'NS':
      return [ zone, { type: 'NS', ttl, hostname: parseDomainName(buffer, offset) }, offset + rdlength ]
    case 'PTR':
      return [ zone, { type: 'PTR', ttl, hostname: parseDomainName(buffer, offset) }, offset + rdlength ]
    case 'RRSIG':
      // @ts-expect-error TODO fix
      return [ zone, { type: 'RRSIG', ttl, keyTag: buffer.readUInt16BE(offset), algorithm: buffer.readUInt8(offset + 2), digestType: buffer.readUInt8(offset + 3), digest: buffer.toString('hex', offset + 4, offset + rdlength) }, offset + rdlength ]
    case 'SOA':
      // @ts-expect-error TODO fix
      return [ zone, { type: 'SOA', ttl, mname: parseDomainName(buffer, offset), rname: parseDomainName(buffer, offset + 2), serial: buffer.readUInt32BE(offset + 4), refresh: buffer.readUInt32BE(offset + 8), retry: buffer.readUInt32BE(offset + 12), expire: buffer.readUInt32BE(offset + 16), minimum: buffer.readUInt32BE(offset + 20) }, offset + rdlength ]
    case 'SRV':
      // @ts-expect-error TODO fix
      return [ zone, { type: 'SRV', ttl, priority: buffer.readUInt16BE(offset), weight: buffer.readUInt16BE(offset + 2), port: buffer.readUInt16BE(offset + 4), target: parseDomainName(buffer, offset + 6) }, offset + rdlength ]
    case 'TXT':
      return [ zone, { type: 'TXT', ttl, data: buffer.toString('ascii', offset, offset + rdlength) }, offset + rdlength ]
    default:
      throw new Error(`Unknown record type ${type}`)
  }
}

function readipv4(buffer: Buffer, offset: number): string {
  return `${buffer.readUInt8(offset)}.${buffer.readUInt8(offset + 1)}.${buffer.readUInt8(offset + 2)}.${buffer.readUInt8(offset + 3)}`
}

function readipv6(buffer: Buffer, offset: number): string {
  return `${buffer.readUInt16BE(offset).toString(16)}:${buffer.readUInt16BE(offset + 2).toString(16)}:${buffer.readUInt16BE(offset + 4).toString(16)}:${buffer.readUInt16BE(offset + 6).toString(16)}:${buffer.readUInt16BE(offset + 8).toString(16)}:${buffer.readUInt16BE(offset + 10).toString(16)}:${buffer.readUInt16BE(offset + 12).toString(16)}:${buffer.readUInt16BE(offset + 14).toString(16)}`
}

function readDnsName(buffer: Buffer, offset: number): [string[], number] {
  const name: string[] = []
  while (buffer.readUint8(offset) !== 0) {
    if (buffer.readUInt8(offset) >= 0b1100_0000) {
      return [[ ...name, ...readDnsName(buffer, buffer.readUint8(offset + 1))[0] ], offset + 2 ]
    }

    name.push(buffer.toString('ascii', offset + 1, offset + 1 + buffer.readUInt8(offset)))
    offset += buffer.readUInt8(offset) + 1
  }
  return [ name, offset + 1 ]
}

function cacheRootServers() {
  dnsCache['NS+'] = []

  for (const [ key, value ] of Object.entries(rootServers4)) {
    dnsCache[`A+${key}.root-servers.net`] = [{ ttl: 3600000, type: 'A', address: value }]
    dnsCache['NS+'].push({ ttl: 3600000, type: 'NS', hostname: `${key}.root-servers.net` })
  }
  for (const [ key, value ] of Object.entries(rootServers6)) {
    dnsCache[`AAAA+${key}.root-servers.net`] = [{ ttl: 3600000, type: 'AAAA', address: value }]
  }

  dnsCache['DS+'] = []

  for (const record of trustAnchors) {
    dnsCache['DS+'].push(record)
  }
}

export function superdomain(domain: string) {
  const parts = domain.split('.')
  return parts.slice(1).join('.')
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should return the correct domain', () => {
    expect(superdomain('sub.example.com')).toBe('example.com')
    expect(superdomain('example.com')).toBe('com')
    expect(superdomain('example.co.uk')).toBe('co.uk')
  })

  it('should contain the root servers', () => {
    expect(dnsCache['NS+']).toBeDefined()
    expect(dnsCache['NS+'].length).toBe(13)
  })

  it('should contain the root servers A records', () => {
    expect(Object.entries(dnsCache).filter(([ key ]) => key.startsWith('A+'))).toHaveLength(13)
  })

  it('should contain the root servers AAAA records', () => {
    expect(Object.entries(dnsCache).filter(([ key ]) => key.startsWith('AAAA+'))).toHaveLength(13)
  })

  it('should contain two root DS records', () => {
    expect(Object.entries(dnsCache).filter(([ key ]) => key.startsWith('DS+')).flat()).toHaveLength(2)
  })
}
