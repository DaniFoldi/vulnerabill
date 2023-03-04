import { defineConfig } from 'vitest/config'


export default defineConfig({
  test: {
    coverage: {
      all: true,
      excludeNodeModules: true,
      include: [ 'src/**' ]
    },
    include: [ 'src/**' ],
    exclude: [ 'src/cli.ts', 'src/parser.ts' ]
  }
})
