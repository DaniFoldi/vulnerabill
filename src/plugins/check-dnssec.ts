import { getDnsRecords, superdomain } from '../util/dns'
import type { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-dnssec',
  description: 'Check if the site is using DNSSEC',
  type: 'check',
  run: async (options, saveResult, saveError) => {
    const dnskey = await getDnsRecords(options.site, 'DNSKEY')
    const ds = await getDnsRecords(superdomain(options.site), 'DS')

    if (dnskey.length > 0 && ds.length > 0) {

    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
