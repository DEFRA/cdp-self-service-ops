import { randomUUID } from 'node:crypto'

import { config } from '#config/config.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import Joi from 'joi'
import {
  environmentValidation,
  userWithIdValidation,
  migrationIdValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit'

const runImportValidation = Joi.object({
  cdpMigrationId: migrationIdValidation,
  service: repositoryNameValidation,
  environment: environmentValidation,
  user: userWithIdValidation,
  version: Joi.string(),
  overrides: Joi.object({
    imageOverride: Joi.string(),
    sourceLocationOverride: Joi.string(),
    environmentTypeOverride: Joi.string(),
    buildspecOverride: Joi.string()
  }).unknown(true)
})

const snsRunMigrationTopic = config.get('snsRunDatabaseMigrationTopicArn')

const defaultImportImage = 'cdp-webshell:stable'

export async function runDatabaseImport({
  service,
  environment,
  user,
  dataFolder,
  commands,
  snsClient,
  logger
}) {
  const cdpMigrationId = randomUUID()

  const buildSpec = `version: 0.2

  phases:
  build:
    commands:
       ${commands.map((c) => `       - ${c}\n`)}
  `

  const overrides = {
    imageOverride: defaultImportImage,
    sourceLocationOverride: dataFolder,
    environmentTypeOverride: 'LINUX_CONTAINER',
    buildspecOverride: buildSpec
  }

  const runMessage = {
    cdpMigrationId,
    service,
    version: '0.0.0',
    environment,
    user,
    overrides
  }

  Joi.assert(runMessage, runImportValidation)

  await sendSnsMessage(snsClient, snsRunMigrationTopic, runMessage, logger)

  // TODO: track import in PBE (maybe extend migration?)

  logger.info(
    `Ran database import ${cdpMigrationId} ${service}:/${dataFolder} in ${environment}`
  )

  logger.info(`importId: ${cdpMigrationId} buildspec: ${buildSpec}`)

  return cdpMigrationId
}
