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
import { recordDataImport } from './record-database-import.js'

const runImportValidation = Joi.object({
  cdpMigrationId: migrationIdValidation,
  service: repositoryNameValidation,
  environment: environmentValidation,
  user: userWithIdValidation,
  version: Joi.string(),
  overrides: Joi.object({
    imageOverride: Joi.string(),
    sourceTypeOverride: Joi.string().valid('S3', 'NO_SOURCE'),
    sourceLocationOverride: Joi.string().description(
      'S3 path inc bucket but without s3:// prefix'
    ),
    environmentTypeOverride: Joi.string(),
    buildspecOverride: Joi.string().description(
      'coebuild buildspec in yaml format'
    )
  }).unknown(true)
})

const snsRunMigrationTopic = config.get('snsRunDatabaseMigrationTopicArn')
const defaultImportImage = config.get('dataImportDefaultImage')

export async function runDatabaseImport({
  service,
  environment,
  path,
  user,
  target,
  dataFolder,
  commands,
  snsClient,
  logger
}) {
  const cdpImportId = randomUUID()

  const buildSpec = generateBuildSpec(commands)

  const runMessage = {
    cdpMigrationId: cdpImportId,
    service,
    version: '0.0.0',
    environment,
    user,
    overrides: {
      imageOverride: defaultImportImage,
      sourceTypeOverride: 'S3',
      sourceLocationOverride: dataFolder,
      environmentTypeOverride: 'LINUX_CONTAINER',
      buildspecOverride: buildSpec
    }
  }

  Joi.assert(runMessage, runImportValidation)

  await sendSnsMessage(snsClient, snsRunMigrationTopic, runMessage, logger)

  await recordDataImport({
    cdpImportId,
    service,
    environment,
    path,
    target,
    user
  })

  logger.info(
    `Ran database import ${cdpImportId} ${service}:/${path} in ${environment}`
  )

  logger.info(`importId: ${cdpImportId} buildspec: ${buildSpec}`)

  return cdpImportId
}

export function generateBuildSpec(commands) {
  let spec = 'version: 0.2\n\n'
  spec += 'phases:\n'
  spec += `  build:\n`
  spec += `    commands:\n`
  commands.forEach((c) => {
    spec += `      - ${c}\n`
  })

  return spec
}
