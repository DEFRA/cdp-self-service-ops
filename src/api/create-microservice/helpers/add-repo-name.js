import Joi from 'joi'

import { createLogger } from '~/src/helpers/logging/logger'

const repositoriesSchema = Joi.array()
  .items(
    Joi.object().pattern(
      Joi.string().pattern(/^[a-zA-Z0-9][\w-]*[a-zA-Z0-9]$/),
      Joi.object()
        .keys({
          zone: Joi.string().valid('protected', 'public').required(),
          mongo: Joi.bool().default(false),
          redis: Joi.bool().default(false),
          queues: Joi.array().items(Joi.string()),
          topics: Joi.array().items(Joi.string()),
          ecr: Joi.array().items(Joi.string()),
          s3: Joi.array().items(Joi.string()),
          buckets: Joi.array().items(Joi.string()),
          test_suite: Joi.string()
        })
        .unknown(true)
        .required()
    )
  )
  .length(1)
  .message('problem with outer array')

function addRepoName({
  repositories,
  fileRepository,
  filePath,
  repositoryName,
  zone
}) {
  const logger = createLogger()

  const parsedRepositories = JSON.parse(repositories)

  const preAdditionValidationResult = repositoriesSchema.validate(
    parsedRepositories,
    {
      abortEarly: false,
      allowUnknown: true
    }
  )

  if (preAdditionValidationResult?.error) {
    logger.error(
      `Tenant Services file '${filePath}' from '${fileRepository} failed schema validation`
    )
    throw new Error('File failed schema validation')
  }

  // This guard probably isn't needed, but on the off-chance we get here, dont overwrite
  // existing entries in the tenant_services.json file.
  if (parsedRepositories[0][repositoryName] === undefined) {
    parsedRepositories[0][repositoryName] = {
      zone,
      mongo: zone === 'protected',
      redis: zone === 'public'
    }
  } else {
    logger.warn(
      `There's already and entry for '${repositoryName} in cdp-tf-svc-infra! We wont overwrite it.`
    )
  }

  const postAdditionValidationResult = repositoriesSchema.validate(
    parsedRepositories,
    {
      abortEarly: false
    }
  )

  if (postAdditionValidationResult?.error) {
    logger.error(
      `Addition of '${repositoryName}' to '${filePath}' from '${fileRepository}' failed schema validation`
    )

    throw new Error(
      'Post repository name addition, file failed schema validation'
    )
  }

  return JSON.stringify(parsedRepositories, null, 2)
}

export { addRepoName }
