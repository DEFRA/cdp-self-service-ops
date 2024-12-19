import Boom from '@hapi/boom'

import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams.js'

export async function getScopedUser(imageName, auth, targetScope) {
  const user = {
    id: auth?.credentials?.id,
    displayName: auth?.credentials?.displayName
  }
  const scope = auth?.credentials?.scope
  if (!scope) {
    throw Boom.forbidden('No scope found')
  }
  const isAdmin = scope.includes(targetScope)
  if (!isAdmin) {
    const repoTeams = await getRepoTeams(imageName)
    const isTeamMember = repoTeams.some((team) => scope.includes(team.teamId))
    if (!isTeamMember) {
      throw Boom.forbidden('Insufficient scope')
    }
  }

  return user
}
