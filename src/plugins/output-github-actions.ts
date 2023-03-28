import { OutputPlugin } from '../plugins'


export const plugin: OutputPlugin = {
  name: 'output-github-actions',
  type: 'output',
  run: async (options, results, errors) => {

  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
