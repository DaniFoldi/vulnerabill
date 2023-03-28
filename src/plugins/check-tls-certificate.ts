import { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-tls-certificate',
  description: 'Check if the site is using a valid TLS certificate',
  type: 'check',
  run: async (options, saveResult, saveError) => {

  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}