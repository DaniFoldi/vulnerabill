import { EOL } from 'node:os'
import { appendFile } from 'node:fs/promises'
import { getServer } from '../util/server'
import { toText } from './output-stdout'
import type { OutputPlugin } from './index'


export const plugin: OutputPlugin = {
  name: 'output-github-actions',
  type: 'output',
  version: 1,
  description: 'Output errors and warnings as GitHub Actions results',
  run: async (options, results, errors) => {
    const lines: string[] = []
    lines.push(
      '# Vulnerabill',
      `Report for **${options.site}** scanned at ${new Date().toLocaleString()}`,
      '',
      ':white_check_mark: Terms accepted',
      `> Crypto: ${options.builtinCrypto ? 'built-in' : 'custom'}`,
      `> DNS: ${options.builtinDns ? 'built-in' : 'custom'}`,
      `> Fetch: ${options.builtinFetch ? 'built-in' : 'custom'}`,
      `Rng: ${options.builtinRng ? 'built-in' : 'custom'}`,
      '---'
    )

    for (const result of results) {
      lines.push(
        `## ${result.severity === 0 ? ':white_check_mark:' : ':x:'} ${result.title}`,
        '',
        `- Confidence: **${toText(result.confidence)}**`,
        `- Severity: **${toText(result.severity)}**`,
        `- ${result.message}`,
        `- _${result.description}_`,
        ''
      )
    }

    lines.push(
      '',
      '---',
      `Detected server: ${await getServer(options.site)}`,
      '',
      '---'
    )

    if (errors.length === 0) {
      lines.push('No errors encountered during scanning.')
    } else {
      lines.push(
        `There were ${errors.length} errors encountered during testing.`,
        '## Errors'
      )
      for (const error of errors) {
        lines.push(`- ${error}`)
      }
    }

    await appendFile(process.env.GITHUB_STEP_SUMMARY as string, lines.join(EOL) + EOL, {
      encoding: 'utf8'
    })
  }
}

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
