import type { SpecificDnsRecord } from './dns'


export const trustAnchors: SpecificDnsRecord<'DS'>[] = [
  {
    type: 'DS',
    ttl: 172800,
    tag: 256,
    algorithm: 8,
    digestType: 2,
    digest: '49AAC11D7B6F6446702E54A1607371607A1A41855200FD2CE1CDDE32F24E8FB5'
  },
  {
    type: 'DS',
    ttl: 172800,
    tag: 257,
    algorithm: 8,
    digestType: 2,
    digest: 'E06D44B80B8F1D39A95C0B0D7C65D08458E880409BBC683457104237C7F8EC8D'
  }
]


if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should have 2 trust anchor keys', () => {
    expect(Object.keys(trustAnchors)).toHaveLength(2)
  })
}
