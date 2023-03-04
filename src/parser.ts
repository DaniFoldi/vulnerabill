import { program } from 'commander'
import { hasTTY } from 'std-env'
import packageJson from '../package.json'


export async function getOptions(args = process.argv) {
  let _site = ''

  program
    .version(packageJson.version)
    .option('-n, --non-interactive', 'Run in non-interactive mode, useful for CI', !hasTTY)
    .option('--accept-terms <string>', 'Enter the special ToS code for a website to skip the confirmation prompt')
    .option('--output <string>', 'Specify the output mode to use for writing the results', hasTTY ? 'output' : 'github')
    .option('--builtin-crypto', 'Use runtime-native cryptographic libraries')
    .option('--builtin-dns', 'Use runtime-native DNS client')
    .option('--builtin-fetch', 'Use runtime-native fetch instead')
    .option('--builtin-rng', 'Use runtime-native random number generator')
    .argument('<site>', 'Hostname of website to run vulnerabill on')
    .action(site => _site = site)
    .showSuggestionAfterError()
    .showHelpAfterError(true)
    .helpOption('-h, --help', 'Show this lovely help message')

  await program.parseAsync(args)

  return {
    ...program.opts(),
    site: _site
  } as {
    acceptTerms: string
    builtinCrypto: boolean
    builtinDns: boolean
    builtinFetch: boolean
    builtinRng: boolean
    nonInteractive: boolean
    output: string
    site: string
  }
}

export type Options = Awaited<ReturnType<typeof getOptions>>
