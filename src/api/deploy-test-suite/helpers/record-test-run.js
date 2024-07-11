import { config } from '~/src/config'

import { createLogger } from '~/src/helpers/logging/logger'

async function createRecordTestRun(imageName, runId, environment, user) {
  const logger = createLogger()

  const url = `${config.get('portalBackendUrl')}/test-run`

  logger.info(`Recording  test-run for ${imageName} run ${runId} by ${user}`)
  return await fetch(url, {
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
