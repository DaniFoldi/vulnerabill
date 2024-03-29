// From named.root
export const rootServers4 = {
  a: '198.41.0.4',
  b: '199.9.14.201',
  c: '192.33.4.12',
  d: '199.7.91.13',
  e: '192.203.230.10',
  f: '192.5.5.241',
  g: '192.112.36.4',
  h: '198.97.190.53',
  i: '192.36.148.17',
  j: '192.58.128.30',
  k: '193.0.14.129',
  l: '199.7.83.42',
  m: '202.12.27.33'
}

export const rootServers6 = {
  a: '2001:503:ba3e::2:30',
  b: '2001:500:200::b',
  c: '2001:500:2::c',
  d: '2001:500:2d::d',
  e: '2001:500:a8::e',
  f: '2001:500:2f::f',
  g: '2001:500:12::d0d',
  h: '2001:500:1::53',
  i: '2001:7fe::53',
  j: '2001:503:c27::2:30',
  k: '2001:7fd::1',
  l: '2001:500:9f::42',
  m: '2001:dc3::35'
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should have 13 root servers', () => {
    expect(Object.keys(rootServers4)).toHaveLength(13)
    expect(Object.keys(rootServers6)).toHaveLength(13)
  })
}
