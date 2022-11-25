import consolaGlobalInstance from 'consola'
import { CheckResult } from './plugin'


const logger = consolaGlobalInstance.create({
  async: true
})

const results: CheckResult[] = []

export function getLogger(prefix: string) {
  return logger.withScope(prefix)
}

export function addResult(result: CheckResult) {
  results.push(result)
}

export async function outputResults() {
  logger.success('Done!')
  logger.info('Results:')
  for (const result of results) {
    logger.info(`  ${result.score} - ${result.message}`)
  }
}
