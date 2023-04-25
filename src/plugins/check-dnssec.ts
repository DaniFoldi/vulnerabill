import { getDnsRecords, superdomain } from '../util/dns'
import type { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-dnssec',
  description: 'Check if the site is using DNSSEC',
  type: 'check',
  version: 1,
  run: async (options, saveResult, _saveError) => {
    const dnskey = await getDnsRecords(options.site, 'DNSKEY')
    const ds = await getDnsRecords(superdomain(options.site), 'DS')

    // The implementation temporarily contained a full RRset validation against the signature and RSK/KSK,
    // but it was removed as it was too brittle and fixing it is beyond the scope of this project.
    // The best case was _matching_ the behaviour of DNSSEC implementaions in browsers and operating systems.
    // These would yell if validation failed, so users would likely notice without using Vulnerabill.
    if (dnskey.length > 0 && ds.length > 0) {
      saveResult({
        confidence: 3,
        title: 'DNSSEC is enabled',
        message: 'Your site is using DNSSEC',
        severity: 0,
        description: 'DNSSEC is a security protocol that authenticates DNS responses and prevents DNS spoofing.'
      })
    } else {
      saveResult({
        confidence: 3,
        title: 'DNSSEC is not enabled',
        message: 'Your site is not using DNSSEC',
        severity: 2,
        description: 'DNSSEC is a security protocol that authenticates DNS responses and prevents DNS spoofing.'
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
