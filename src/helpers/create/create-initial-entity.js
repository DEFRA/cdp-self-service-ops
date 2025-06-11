import { entityValidation } from '~/src/api/helpers/schema/common-validations.js'
import { createEntity } from '~/src/helpers/portal-backend/create-entity.js'

/**
 *
 * @param {{ repositoryName: string, entityType: string, entitySubType: string, team: {teamId: string, name}, user: {id: string, displayName: string}}} params
 * @returns {Promise<{creator, org, zone, kind, started: Date, team: {teamId: (string|*), name}, repositoryName, serviceTypeTemplate, portalVersion: number, status: string}>}
 */
async function createInitialEntity({
  repositoryName,
  entityType,
  entitySubType,
  team,
  user
}) {
  const entity = {
    name: repositoryName,
    type: entityType,
    subType: entitySubType,
    created: new Date().toISOString(),
    creator: {
      id: user?.id,
      displayName: user?.displayName
    },
    teams: [
      {
        teamId: team.teamId,
        name: team.name
      }
    ],
    status: 'Creating',
    decommissioned: null
  }

  const validatedEntity = await entityValidation.validateAsync(entity)

  await createEntity(validatedEntity)

  return validatedEntity
}

export { createInitialEntity }
