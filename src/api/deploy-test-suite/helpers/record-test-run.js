import { config } from '~/src/config/index.js'

import { createLogger } from '~/src/helpers/logging/logger.js'
import { fetcher } from '~/src/helpers/fetcher.js'

async function createRecordTestRun(imageName, runId, environment, user) {
  const logger = createLogger()

  const url = `${config.get('portalBackendUrl')}/test-run`

  logger.info(
    `Recording  test-run for ${imageName} run ${runId} by ${user.displayName}`
  )
  return await fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      testSuite: imageName,
      runId,
      environment,
      user
    })
  })
}

export { createRecordTestRun }
