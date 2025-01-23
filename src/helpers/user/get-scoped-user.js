import Boom from '@hapi/boom'

import { getRepoTeams } from '~/src/api/deploy/helpers/get-repo-teams.js'

export async function getScopedUser(imageName, auth) {
  const credentials = auth?.credentials
  const user = {
    id: credentials?.id,
    displayName: credentials?.displayName
  }
  if (!credentials.scopeFlags?.isAdmin) {
    const scope = credentials?.scope
    if (!scope) {
      throw Boom.forbidden('No scope found')
    }
    const repoTeams = await getRepoTeams(imageName)
    const isTeamMember = repoTeams.some((team) => scope.includes(team.teamId))
    if (!isTeamMember) {
      throw Boom.forbidden('Insufficient scope')
    }
  }

  return user
}
