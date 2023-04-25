import { domain } from 'whoiser'
import { type CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-whois',
  description: 'Check if the domain has WHOIS privacy',
  type: 'check',
  version: 1,
  run: async (options, saveResult, saveError) => {

    // the only thing ignorePrivacy does is remove field values like "redacted for privacy"
    const whois = await domain(options.site, { ignorePrivacy: false })
    let hidden = 0
    let visible = 0
    for (const [ _, value ] of Object.entries(whois)) {
      if (typeof value === 'string') {
        if (value.toLowerCase().includes('privacy') || value.toLowerCase().includes('redacted') || value.trim().length === 0) {
          hidden++
        } else {
          visible++
        }
      } else if (Array.isArray(value)) {
        for (const line of value) {
          if (line.toLowerCase().includes('privacy') || line.toLowerCase().includes('redacted') || line.trim().length === 0) {
            hidden++
          } else {
            visible++
          }
        }
      } else {
        for (const [ __, line ] of Object.entries(value)) {
          if (typeof line === 'string') {
            if (line.toLowerCase().includes('privacy') || line.toLowerCase().includes('redacted') || line.trim().length === 0) {
              hidden++
            } else {
              visible++
            }
          } else if (Array.isArray(line)) {
            for (const l of line) {
              if (l.toLowerCase().includes('privacy') || l.toLowerCase().includes('redacted') || l.trim().length === 0) {
                hidden++
              } else {
                visible++
              }
            }
          }
        }
      }
    }

    // Magic number obtained from reading 30 domains WHOIS records
    if (visible > hidden * 2) {
      saveResult({
        confidence: 2,
        title: 'WHOIS privacy is not used',
        message: 'Your registrar does not use WHOIS privacy',
        severity: 2,
        description: 'WHOIS privacy is not used for your website, anyone can find out details about the registrant. Some TLDs do not support WHOIS privacy'
      })
    } else {
      saveResult({
        confidence: 2,
        title: 'WHOIS privacy is used',
        message: 'Your registrar uses WHOIS privacy',
        severity: 0,
        description: 'WHOIS privacy is used for your website, your details are hidden from the public. Some TLDs do not support WHOIS privacy'
      })
    }
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
