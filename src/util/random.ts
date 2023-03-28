import { hrtime } from 'node:process'

// this is not a secure random number generator, DO NOT USE anywhere
function customRandom() {
  const now = BigInt(Date.now()) + hrtime.bigint()
  const a = now.toString().replace(/\D/g, '')
  const b = [ ...a ].reverse().filter((el, i) => i % 2 === 0)
  const c = [ ...a ].filter((el, i) => i % 3 !== 0).sort()
  const d = [ ...a ].filter((el, i) => i % 4 !== 3).reverse()
  return (Math.abs(Number((BigInt(d.join('')) * BigInt(c.join('')) + BigInt(b.join('')) * 7n - BigInt(now) + BigInt(2 ** 40)) % BigInt(2 ** 32))) / 2 ** 32)
}

function random(custom: boolean): number {
  return custom ? customRandom() : Math.random()
}

export function choose<T>(elements: T[], customRandom = true): T {
  return elements[Math.floor(random(customRandom) * elements.length)]
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should choose a random element', () => {
    const elements = [ 1, 2, 3, 4, 5 ]
    const chosen = choose(elements)
    expect(elements).toContain(chosen)
    const chosen2 = choose(elements)
    expect(elements).toContain(chosen2)
    const chosen3 = choose(elements)
    expect(elements).toContain(chosen3)
  })

  it('should return a unique number between 0 and 1', () => {
    const values = new Set()
    for (let i = 0; i < 1000000; i++) {
      const r = customRandom()
      values.add(r)
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThan(1)
    }
    expect(values.size).toBeGreaterThanOrEqual(1000000 * 0.99)
  })
}
