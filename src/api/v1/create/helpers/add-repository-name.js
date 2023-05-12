import Joi from 'joi'

import { createLogger } from '~/src/helpers/logger'

function addRepositoryName({
  repositories,
  fileRepository,
  filePath,
  repositoryName
}) {
  const logger = createLogger()

  const parsedRepositories = JSON.parse(repositories)
  const repositoriesSchema = Joi.array().items(
    Joi.string().pattern(/^[a-zA-Z0-9][\w-]*[a-zA-Z0-9]$/)
  )

  const preAdditionValidationResult = repositoriesSchema.validate(
    parsedRepositories,
    {
      abortEarly: false
    }
  )

  if (preAdditionValidationResult?.error) {
    logger.error(
      `File '${filePath}' from '${fileRepository} failed schema validation`
    )

    throw new Error('File failed schema validation')
  }

  parsedRepositories.push(repositoryName)

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

export { addRepositoryName }
