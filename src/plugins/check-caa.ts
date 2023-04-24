import { CheckPlugin } from './index'


export const plugin: CheckPlugin = {
  name: 'check-caa',
  description: 'Check if the site has a CAA record',
  type: 'check',
  version: 1,
  run: async (options, saveResult, saveError) => {
    // TODO check
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
