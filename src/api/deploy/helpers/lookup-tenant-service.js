import { createLogger } from '~/src/helpers/logging/logger'

const { octokit } = require('~/src/helpers/oktokit')
const { config } = require('~/src/config')

async function lookupTenantService(environment, service) {
  const logger = createLogger()
  const filePath = `environments/${environment}/resources/tenant_services.json`

  try {
    const { data } = await octokit.rest.repos.getContent({
      mediaType: { format: 'raw' },
      owner: config.get('gitHubOrg'),
      repo: config.get('githubRepoTfServiceInfra'),
      path: filePath,
      ref: 'main'
    })

    const services = JSON.parse(data)

    return services[0][service]
  } catch (error) {
    logger.error(error)
    return undefined
  }
}

export { lookupTenantService }
