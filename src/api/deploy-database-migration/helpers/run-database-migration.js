import { randomUUID } from 'node:crypto'

import { config } from '~/src/config/index.js'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message.js'
import { recordDatabaseMigration } from '~/src/api/deploy-database-migration/helpers/record-database-migration.js'
import Joi from 'joi'
import {
  environmentValidation,
  repositoryNameValidation,
  userWithIdValidation,
  migrationVersionValidation,
  migrationIdValidation
} from '~/src/api/helpers/schema/common-validations.js'

const runMigrationValidation = Joi.object({
  cdpMigrationId: migrationIdValidation,
  service: repositoryNameValidation,
  version: migrationVersionValidation,
  environment: environmentValidation,
  user: userWithIdValidation
})

const snsRunTestTopic = config.get('snsRunDatabaseMigrationTopicArn')

async function runDatabaseMigration({
  service,
  environment,
  version,
  user,
  snsClient,
  logger
}) {
  const cdpMigrationId = randomUUID()

  const runMessage = {
    cdpMigrationId,
    service,
    environment,
    version,
    user
  }

  Joi.assert(runMessage, runMigrationValidation)

  await sendSnsMessage(snsClient, snsRunTestTopic, runMessage, logger)

  await recordDatabaseMigration({
    cdpMigrationId,
    service,
    version,
    environment,
    user
  })

  logger.info(
    `Ran database migration ${cdpMigrationId} ${service}:${version} in ${environment}`
  )

  return cdpMigrationId
}

export { runDatabaseMigration }
