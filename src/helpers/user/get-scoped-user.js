import Boom from '@hapi/boom'
import { getEntity } from '../portal-backend/get-entity.js'

/**
 * @param {string} serviceName
 * @param {{credentials: {scopeFlags: {isAdmin: boolean, isTenant: boolean}, displayName: string, scope: string[], id: string}}} auth
 * @param {import('pino').Logger} logger
 * @returns {Promise<{id: string, displayName: string}>}
 */
export async function getScopedUser(serviceName, auth, logger) {
  const { id, displayName, scope, scopeFlags } = auth?.credentials
  const user = { id, displayName }

  if (!scopeFlags?.isAdmin) {
    if (!scope) {
      throw Boom.forbidden('No scope found')
    }

    const entity = await getEntity(serviceName, logger)

    const isTeamMember = entity?.teams?.some((team) =>
      scope.includes(`team:${team.teamId}`)
    )

    if (!isTeamMember) {
      throw Boom.forbidden('Insufficient scope')
    }
  }

  return user
}
