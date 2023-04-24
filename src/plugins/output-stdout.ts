import chalk from 'chalk'
import { getServer } from '../util/server'
import type { OutputPlugin } from './index'


const lineLength = 68
// eslint-disable-next-line no-control-regex
const sanitizeColorChars = (text: string): string => text.replace(/\u001B\[.*?m/gi, '')
const sanitizedPad = (text: string, length: number): string => {
  const sanitizedLength = sanitizeColorChars(text).length
  return `${text}${' '.repeat(Math.max(length - sanitizedLength, 0))}`
}

const splitLines = (text: string): string[] => {
  let l = ''
  const lines: string[] = []

  for (const word of text.split(' ')) {
    if (l.length + sanitizeColorChars(word).length > lineLength) {
      lines.push(l.trim())
      l = ''
    }
    l += `${word} `
  }

  if (l.length > 0) {
    lines.push(l.trim())
  }

  return lines
}
const fancyLog = (value: string) => splitLines(value.replaceAll(/(^\||\|$)/g, chalk.reset('|')).replaceAll(/(\|\n\||^\||\|$)/g, `${chalk.reset('|')}\n${chalk.reset('|')}`)).forEach(line => console.log(`${chalk.reset('⏐')}     ${sanitizedPad(line, lineLength)}     ${chalk.reset('⏐')}`))
const emptyLine = `${chalk.reset('|')}     ${sanitizedPad('', lineLength)}     ${chalk.reset('|')}`
const divider = chalk.reset('⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯')
const insertDivider = () => {
  console.log(emptyLine)
  fancyLog(divider)
  console.log(emptyLine)
}


export const plugin: OutputPlugin = {
  name: 'output-stdout',
  type: 'output',
  version: 1,
  description: 'Output results to standard output',
  run: async (options, results, errors) => {
    console.log(chalk.reset('⎾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⏋'))
    console.log(emptyLine)
    console.log(`${chalk.reset('|')}     ${chalk.blue('▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄')}     ${chalk.reset('|')}`)
    console.log(`${chalk.reset('|')}     ${chalk.blue('██ ███ ██ ██ ██ █████ ▀██ ██ ▄▄▄██ ▄▄▀██▀▄▄▀██ ▄▄▀█▄ ▄██ █████ █████')}     ${chalk.reset('|')}`)
    console.log(`${chalk.reset('|')}     ${chalk.blue('███ █ ███ ██ ██ █████ █ █ ██ ▄▄▄██ ▀▀▄██ ▀▀ ██ ▄▄▀██ ███ █████ █████')}     ${chalk.reset('|')}`)
    console.log(`${chalk.reset('|')}     ${chalk.blue('███▄▀▄███▄▀▀▄██ ▀▀ ██ ██▄ ██ ▀▀▀██ ██ ██ ██ ██ ▀▀ █▀ ▀██ ▀▀ ██ ▀▀ ██')}     ${chalk.reset('|')}`)
    console.log(`${chalk.reset('|')}     ${chalk.blue('▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀')}     ${chalk.reset('|')}`)
    console.log(emptyLine)
    fancyLog(`${chalk.dim('Report for')} ${options.site} ${chalk.dim('scanned at')} ${new Date().toLocaleString()}`)
    console.log(emptyLine)
    fancyLog(`${chalk.green('✔')} Terms accepted`)
    fancyLog(`${chalk.green('>')} ${chalk.dim('Crypto:')} ${options.builtinCrypto ? chalk.white('built-in') : chalk.cyan('custom')}`)
    fancyLog(`${chalk.green('>')} ${chalk.dim('Dns:')}    ${options.builtinDns ? chalk.white('built-in') : chalk.cyan('custom')}`)
    fancyLog(`${chalk.green('>')} ${chalk.dim('Fetch:')}  ${options.builtinFetch ? chalk.white('built-in') : chalk.cyan('custom')}`)
    fancyLog(`${chalk.green('>')} ${chalk.dim('Rng:')}    ${options.builtinRng ? chalk.white('built-in') : chalk.cyan('custom')}`)
    insertDivider()

    for (const result of results) {
      fancyLog(`${result.severity === 0 ? chalk.green('✔') : chalk.red('✕')} ${chalk.bold(result.title)}`)
      // TODO replace with keywords
      fancyLog(`${chalk.dim('Severity:')} ${chalk.black.bgRed('[]'.repeat(result.severity))}${chalk.red('[]'.repeat(5 - result.severity))}     ${chalk.dim('Confidence:')} ${chalk.black.bgCyan('[]'.repeat(result.confidence))}${chalk.cyan('[]'.repeat(5 - result.confidence))}`)
      console.log(emptyLine)
      fancyLog(result.message)
      if (result.severity > 0) {
        fancyLog(chalk.dim(result.description))
      }
      console.log(emptyLine)
      console.log(emptyLine)
    }

    insertDivider()
    // TODO add IP addresses, subdomains, crawled files
    fancyLog(`Detected server: ${await getServer(options.site)}`)
    insertDivider()

    if (errors.length === 0) {
      fancyLog(chalk.green('No errors encountered during scanning.'))
      console.log(emptyLine)
    } else {
      fancyLog(chalk.red(`There were ${errors.length} errors encountered during testing.`))
      console.log(emptyLine)
      errors.forEach(error => fancyLog(`${chalk.bold.red('!')} ${chalk.red(error)}`))
      console.log(emptyLine)
    }

    console.log(chalk.reset('⎿______________________________________________________________________________⏌'))
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
