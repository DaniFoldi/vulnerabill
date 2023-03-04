import chalk from 'chalk'
import { getServer } from '../util/server'
import type { OutputPlugin } from './index'


const splitLines = (text: string) => {
  let l = ''
  const lines: string[] = []

  for (const word of text.split(' ')) {
    if (l.length + word.length > 68) {
      lines.push(l.trim())
      l = ''
    }
    l += `${word} `
  }

  if (l.length > 0) {
    lines.push(l)
  }

  return lines
}
const fancyLog = (value: string) => splitLines(value).forEach(line => console.log(`⏐     ${line.padEnd(68, ' ')}     ⏐`))
const emptyLine = '⏐                                                                              ⏐'
const divider = '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯'
const insertDivider = () => {
  console.log(emptyLine)
  fancyLog(divider)
  console.log(emptyLine)
}


export const plugin: OutputPlugin = {
  name: 'output-stdout',
  type: 'output',
  run: async (options, results, errors) => {
    console.log('⎾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾⏋')
    console.log(emptyLine)
    console.log(`⏐     ${chalk.blue('▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄')}     ⏐`)
    console.log(`⏐     ${chalk.blue('██ ███ ██ ██ ██ █████ ▀██ ██ ▄▄▄██ ▄▄▀██▀▄▄▀██ ▄▄▀█▄ ▄██ █████ █████')}     ⏐`)
    console.log(`⏐     ${chalk.blue('███ █ ███ ██ ██ █████ █ █ ██ ▄▄▄██ ▀▀▄██ ▀▀ ██ ▄▄▀██ ███ █████ █████')}     ⏐`)
    console.log(`⏐     ${chalk.blue('███▄▀▄███▄▀▀▄██ ▀▀ ██ ██▄ ██ ▀▀▀██ ██ ██ ██ ██ ▀▀ █▀ ▀██ ▀▀ ██ ▀▀ ██')}     ⏐`)
    console.log(`⏐     ${chalk.blue('▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀')}     ⏐`)
    console.log(emptyLine)
    fancyLog(`${chalk.dim('Report for')} ${options.site} ${chalk.dim('scanned at')} ${new Date().toLocaleString()}`)
    console.log(emptyLine)
    fancyLog(`${chalk.green('✔︎')} Terms accepted`)
    fancyLog(`${chalk.green('>')} ${chalk.dim('Crypto:')} ${options.builtinCrypto ? chalk.white('built-in') : chalk.cyan('custom')}`)
    fancyLog(`${chalk.green('>')} ${chalk.dim('Dns:')}    ${options.builtinDns ? chalk.white('built-in') : chalk.cyan('custom')}`)
    fancyLog(`${chalk.green('>')} ${chalk.dim('Fetch:')}  ${options.builtinFetch ? chalk.white('built-in') : chalk.cyan('custom')}`)
    fancyLog(`${chalk.green('>')} ${chalk.dim('Rng:')}    ${options.builtinRng ? chalk.white('built-in') : chalk.cyan('custom')}`)
    insertDivider()

    for (const result of results) {
      fancyLog(`${result.severity === 0 ? chalk.green('✔︎') : chalk.red('✕')} ${chalk.bold(result.title)}`)
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
    fancyLog(`Server: ${await getServer(options.site)}`)
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

    console.log('⎿______________________________________________________________________________⏌')
  }
}