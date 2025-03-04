import Boom from '@hapi/boom'

import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams.js'

/**
 * @param {string} serviceName
 * @param {{credentials: {scopeFlags: {isAdmin: boolean, isTenant: boolean}, displayName: string, scope: string[], id: string}}} auth
 * @returns {Promise<{id: string, displayName: string}>}
 */
export async function getScopedUser(serviceName, auth) {
  const { id, displayName, scope, scopeFlags } = auth?.credentials
  const user = { id, displayName }
  if (!scopeFlags?.isAdmin) {
    if (!scope) {
      throw Boom.forbidden('No scope found')
    }
    const repoTeams = await getRepoTeams(serviceName)
    const isTeamMember = repoTeams.some((team) => scope.includes(team.teamId))
    if (!isTeamMember) {
      throw Boom.forbidden('Insufficient scope')
    }
  }

  return user
}
