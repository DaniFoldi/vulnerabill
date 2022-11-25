import { program } from 'commander'
import { hasTTY } from 'std-env'
import packageJson from '../package.json'
import { i18n } from './locale'


export async function getOptions(args = process.argv) {
  let _site

  program
    .version(packageJson.version)
    .option('-n, --non-interactive', i18n.help.nonInteractive, !hasTTY)
    .option('--accept-terms <string>', i18n.help.acceptTerms)
    .option('-p, --plugin <string>', i18n.help.plugin)
    .option('--no-builtins', i18n.help.noBuiltins)
    .argument('<site>', i18n.help.site)
    .action(site => _site = site)
    // .allowUnknownOption()
    .showSuggestionAfterError()
    .showHelpAfterError(i18n.help.onerror)
    .helpOption('-h, --help', i18n.help.help)

  await program.parseAsync(args)

  return { ...program.opts(), site: _site as unknown as string }
}
