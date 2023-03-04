import { plugin as checkDns } from './check-dns'
import { plugin as checkDnssec } from './check-dnssec'
import { plugin as checkEmailAddress } from './check-email-address'
import { plugin as checkMixedContent } from './check-mixed-content'
import { plugin as checkHttpRedirect } from './check-http-redirect'
import { plugin as checkPotentialSourceLeak } from './check-potential-source-leak'
import { plugin as outputGitHubActions } from './output-github-actions'
import { plugin as outputStdout } from './output-stdout'
import type { Options } from '../parser'


export default [
  checkDns,
  checkDnssec,
  checkEmailAddress,
  checkHttpRedirect,
  checkMixedContent,
  checkPotentialSourceLeak,
  outputGitHubActions,
  outputStdout
]

export { plugin as outputStdout } from './output-stdout'

export type CheckResult = {
  confidence: 1 | 2 | 3 | 4 | 5
  description: string
  message: string
  severity: 0 | 1 | 2 | 3 | 4 | 5
  title: string
}

export type CheckPlugin = {
  description: string
  name: string
  run: (options: Options,
        saveResult: (result: CheckResult) => void,
        saveError: (error: string) => void
  ) => Promise<void>
  type: 'check'
}

export type OutputPlugin = {
  name: string
  run: (options: Options, results: CheckResult[], errors: string[]) => Promise<void>
  type: 'output'
}
