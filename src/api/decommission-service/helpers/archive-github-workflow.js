import { isFeatureEnabled } from '~/src/helpers/feature-toggle/is-feature-enabled.js'
import { featureToggles } from '~/src/helpers/feature-toggle/feature-toggles.js'
import { archiveGithubRepo } from '~/src/helpers/remove/workflows/archive-github-repo.js'

/**
 * Calls archive GitHub workflow for specified repository.
 * @param {string} serviceName
 * @param {import("pino").Logger} logger
 */
async function triggerArchiveGithubWorkflow(serviceName, logger) {
  logger.info(`Triggering archive GitHub repo workflow for: ${serviceName}`)

  if (isFeatureEnabled(featureToggles.archiveGitHubWorkflow)) {
    await archiveGithubRepo(serviceName, logger)
  } else {
    logger.info('Archiving GitHub repo feature is disabled')
  }
}

export { triggerArchiveGithubWorkflow }
