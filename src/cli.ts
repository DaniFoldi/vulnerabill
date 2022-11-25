import { getOptions } from 'parser'
import { ensureTermsAccepted, correctCode } from 'terms'
import { getLogger } from 'logger'
import { i18n } from 'locale';


const logger = getLogger('cli')


// eslint-disable-next-line unicorn/prefer-top-level-await
;(async () => {
  logger.log(i18n.header.logo)
  const options = await getOptions()
  if (!await ensureTermsAccepted(options)) {
    // TODO use i18n
    logger.error('You must accept the terms of service by passing the correct code')
    logger.info(`For ${options.site} use --accept-terms ${correctCode(options.site)}`)
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  }
})()
