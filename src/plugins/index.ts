import { plugin as checkCertificateRevocation } from './check-certificate-revocation'
import { plugin as checkConfigFiles } from './check-config-files'
import { plugin as checkCors } from './check-cors'
import { plugin as checkCsp } from './check-csp'
import { plugin as checkDns } from './check-dns'
import { plugin as checkDnssec } from './check-dnssec'
import { plugin as checkEmailAddress } from './check-email-address'
import { plugin as checkHeaders } from './check-headers'
import { plugin as checkHsts } from './check-hsts'
import { plugin as checkHttpRedirect } from './check-http-redirect'
import { plugin as checkMixedContent } from './check-mixed-content'
import { plugin as checkPotentialSourceLeak } from './check-potential-source-leak'
import { plugin as checkTlsCertificate } from './check-tls-certificate'
import { plugin as checkTlsSupport } from './check-tls-support'
import { plugin as outputGitHubActions } from './output-github-actions'
import { plugin as outputStdout } from './output-stdout'
import type { Options } from '../parser'


export default [
  checkCertificateRevocation,
  checkConfigFiles,
  checkCors,
  checkCsp,
  checkDns,
  checkDnssec,
  checkEmailAddress,
  checkHeaders,
  checkHsts,
  checkHttpRedirect,
  checkMixedContent,
  checkPotentialSourceLeak,
  checkTlsCertificate,
  checkTlsSupport,

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

if (import.meta.vitest) {
  const { describe } = import.meta.vitest
  describe.skip('plugins are not unit tested')
}
