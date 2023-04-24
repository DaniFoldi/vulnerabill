import { OutputPlugin } from '../plugins'


export const plugin: OutputPlugin = {
  name: 'output-github-actions',
  type: 'output',
  version: 1,
  description: 'Output errors and warnings as GitHub Actions results',
  run: async (options, results, errors) => {
    // TODO implement
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
