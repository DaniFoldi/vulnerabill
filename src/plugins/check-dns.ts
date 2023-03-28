import { getDnsRecords } from '../util/dns'
import type { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-dns',
  description: 'Check if the site resolves to the same address via all nameservers',
  type: 'check',
  run: async (options, saveResult, saveError) => {
    const ipv4 = await getDnsRecords(options.site, 'A')
    const ipv6 = await getDnsRecords(options.site, 'AAAA')
    const ipv4Present = ipv4.length > 0
    const ipv6Present = ipv6.length > 0

    saveResult({
      confidence: 5,
      title: ipv4Present ? 'Has A Record' : 'Missing A Record',
      message: ipv4Present ? 'Your website address resolves to at least one IPv4 address' : 'Your website address does not resolve to an IPv4 address',
      severity: ipv4Present ? 0 : 3,
      description: 'An A record is used for mapping a domain name to an IP address. Specifically, an A record is a type of DNS (Domain Name System) record that associates a domain name with the IP address of the server hosting the website or service associated with that domain. When someone enters a domain name in a web browser or other application, the system uses DNS to look up the corresponding IP address associated with the domain\'s A record. This IP address is then used to establish a connection with the server hosting the website or service. A records are a fundamental component of how the internet works, enabling users to access websites and services by domain name rather than having to memorize and type in the IP address.'
    })

    saveResult({
      confidence: 5,
      title: ipv6Present ? 'Has AAAA Record' : 'Missing AAAA Record',
      message: ipv6Present ? 'Your website address resolves to at least one IPv6 address' : 'Your website address does not resolve to an IPv6 address',
      severity: ipv6Present ? 0 : 3,
      description: 'An AAAA record is used for mapping a domain name to an IP address. Specifically, an AAAA record is a type of DNS (Domain Name System) record that associates a domain name with the IP address of the server hosting the website or service associated with that domain. When someone enters a domain name in a web browser or other application, the system uses DNS to look up the corresponding IP address associated with the domain\'s AAAA record. This IP address is then used to establish a connection with the server hosting the website or service. AAAA records are a fundamental component of how the internet works, enabling users to access websites and services by domain name rather than having to memorize and type in the IP address.'
    })

    if (!ipv4Present && !ipv6Present) {
      saveResult({
        confidence: 5,
        title: 'Missing A and AAAA Record',
        message: 'Your website address does not resolve to an IP address',
        severity: 5,
        description: 'An A or AAAA record is used for mapping a domain name to an IP address. Specifically, an A or AAAA record is a type of DNS (Domain Name System) record that associates a domain name with the IP address of the server hosting the website or service associated with that domain. When someone enters a domain name in a web browser or other application, the system uses DNS to look up the corresponding IP address associated with the domain\'s A or AAAA record. This IP address is then used to establish a connection with the server hosting the website or service. A and AAAA records are a fundamental component of how the internet works, enabling users to access websites and services by domain name rather than having to memorize and type in the IP address.'
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
