import { createHash } from 'node:crypto'
import inquirer from 'inquirer'
import type { Options } from './parser'


export function correctCode(site: string) {
  // this is just a function that is annoying enough to compute without
  // this tool so users will just run the tool once, see the message,
  // and copy the result into their invocation, accepting the terms
  return [ ...createHash('sha256').update(site).digest('hex').replace(site[0], '') ].reverse().join('').slice(0, 8)
}

export async function ensureTermsAccepted(options: Options) {
  const accepted = options.acceptTerms && correctCode(options.site) === options.acceptTerms
  if (accepted) {
    return true
  }

  if (options.nonInteractive) {
    return false
  }

  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'accept',
      default: false,
      message: 'By using this tool you agree to the terms of service.'
    }
  ])
  return answer.accept
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should return the correct code', () => {
    expect(correctCode('https://www.cl.cam.ac.uk')).toBe('45fd837c')
    expect(correctCode('https://www.example.org')).toBe('09d9c5b1')
  })
}
