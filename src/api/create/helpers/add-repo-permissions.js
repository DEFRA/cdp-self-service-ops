import Joi from 'joi'

import { createLogger } from '~/src/helpers/logger'

function addRepoPermissions({
  permissions,
  fileRepository,
  filePath,
  org,
  repositoryName
}) {
  const logger = createLogger()

  const parsedPermissions = JSON.parse(permissions)
  const permissionsSchema = Joi.array().items(
    Joi.string().pattern(
      /^[a-zA-Z0-9][\w-]*[a-zA-Z0-9]\/[a-zA-Z0-9][\w-]*[a-zA-Z0-9]$/
    )
  )

  const preAdditionValidationResult = permissionsSchema.validate(
    parsedPermissions,
    {
      abortEarly: false
    }
  )

  if (preAdditionValidationResult?.error) {
    logger.error(
      `Permissions file '${filePath}' from '${fileRepository}' failed schema validation`
    )

    throw new Error('Permissions file failed schema validation')
  }

  const entry = `${org}/${repositoryName}`

  // TODO: should we throw an error if its already created or just go with it?
  if (parsedPermissions.find((r) => r === entry) === undefined) {
    parsedPermissions.push(entry)
  }

  const postAdditionValidationResult = permissionsSchema.validate(
    parsedPermissions,
    {
      abortEarly: false
    }
  )

  if (postAdditionValidationResult?.error) {
    logger.error(
      `Permissions addition of '${entry}' to '${filePath}' from '${fileRepository} failed schema validation`
    )

    throw new Error(
      'Post permissions name addition, file failed schema validation'
    )
  }

  return JSON.stringify(parsedPermissions, null, 2)
}

export { addRepoPermissions }
