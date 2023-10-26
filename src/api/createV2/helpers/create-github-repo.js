import { octokit } from '~/src/helpers/oktokit'
import { config } from '~/src/config'
import { createLogger } from '~/src/helpers/logging/logger'

async function createGithubRepo({ repositoryName, owningTeam }) {
  const logger = createLogger()
  const org = config.get('gitHubOrg')

  const payload = {
    org,
    name: repositoryName,
    private: true
  }

  try {
    const teamResponse = await octokit.rest.teams.getByName({
      org,
      team_slug: owningTeam
    })

    payload.team_id = teamResponse?.data?.id
    logger.info(`team id of ${owningTeam} is ${teamResponse?.data?.id}`)
  } catch (e) {
    logger.info(`team ${owningTeam} could not be looked up! ${e}`)
  }

  logger.info(`creating repo ${org}/${repositoryName}`)
  const createResult = await octokit.rest.repos.createInOrg(payload)

  // TODO: set other bits here like branch protection and webhooks

  return createResult
}

export { createGithubRepo }
