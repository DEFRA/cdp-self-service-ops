import Joi from 'joi'

import { createLogger } from '~/src/helpers/logger'

function addRepoName({
  repositories,
  fileRepository,
  filePath,
  repositoryName,
  zone
}) {
  const logger = createLogger()

  const parsedRepositories = JSON.parse(repositories)
  const repositoriesSchema = Joi.array().items(
    Joi.object().pattern(
      /^/,
      Joi.object({
        zone: Joi.string().valid('protected', 'public').required(),
        mongo: Joi.bool().default(false),
        redis: Joi.bool().default(false)
      })
    )
  )

  const preAdditionValidationResult = repositoriesSchema.validate(
    parsedRepositories,
    {
      abortEarly: false
    }
  )

  if (preAdditionValidationResult?.error) {
    logger.error(
      `Tenant Services file '${filePath}' from '${fileRepository} failed schema validation`
    )

    throw new Error('File failed schema validation')
  }

  parsedRepositories[0][repositoryName] = {
    zone,
    mongo: zone === 'protected',
    redis: zone === 'public'
  }

  const postAdditionValidationResult = repositoriesSchema.validate(
    parsedRepositories,
    {
      abortEarly: false
    }
  )

  if (postAdditionValidationResult?.error) {
    logger.error(
      `Addition of '${repositoryName}' to '${filePath}' from '${fileRepository} failed schema validation`
    )

    throw new Error(
      'Post repository name addition, file failed schema validation'
    )
  }

  return JSON.stringify(parsedRepositories, null, 2)
}

export { addRepoName }
