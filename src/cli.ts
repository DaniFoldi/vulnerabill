import builtinPlugins, { outputStdout } from './plugins'
import { getOptions } from './parser'
import { ensureTermsAccepted, correctCode } from './terms'
import type { CheckResult, OutputPlugin } from './plugins'


;


// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  const options = await getOptions()
  if (!await ensureTermsAccepted(options)) {
    console.error('You must accept the terms of service by passing the correct code')
    console.error(`For ${options.site} use --accept-terms ${correctCode(options.site)}`)
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  }

  const outputPlugin = (builtinPlugins
    .filter(plugin => plugin.type === 'output') as OutputPlugin[])
    .find(plugin => plugin.name.endsWith(options.output)) ?? outputStdout
  const results: CheckResult[] = []
  const errors: string[] = []

  for (const plugin of builtinPlugins) {
    if (plugin.type === 'check') {
      switch (plugin.version) {
        case 1:
          console.log('Running', plugin.name)
          try {
            await plugin.run(options, results.push.bind(results), errors.push.bind(errors))
          } catch (error) {
            errors.push(`Plugin ${plugin.name} failed with error ${error}`)
          }
          break
        default:
          errors.push(`Plugin ${plugin.name} has an unsupported version ${plugin.version}`)
      }
    }
  }
  switch (outputPlugin.version) {
    case 1:
      await outputPlugin.run(options, results.sort((a, b) => b.severity - a.severity), errors)
      break
    default:
      throw new Error(`Plugin ${outputPlugin.name} has an unsupported version ${outputPlugin.version}`)
  }
})()
