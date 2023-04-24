import { defineConfig } from 'vitest/config'


export default defineConfig({
  test: {
    coverage: {
      all: true,
      excludeNodeModules: true,
      include: [ 'src/**' ],
      provider: 'c8'
    },
    include: [ 'src/**' ],
    exclude: [ 'src/cli.ts', 'src/parser.ts', 'src/util/named.root', 'src/util/root-anchors.xml' ],
    passWithNoTests: true
  }
})
