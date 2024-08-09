import { createLogger } from '~/src/helpers/logging/logger'
import { config } from '~/src/config'
import path from 'path'
import { handleTriggeredWorkflow } from '~/src/listeners/github/handlers/handle-triggered-workflow'
import { handleTfSvcInfraWorkflow } from '~/src/listeners/github/handlers/handle-tf-svc-infra-workflow'

const logger = createLogger()
const cfg = config.getProperties()

const shouldWorkflowBeProcessed = (repo, workflow) => {
  switch (repo) {
    case cfg.github.repos.cdpAppConfig:
      return workflow === cfg.workflows.createAppConfig
    case cfg.github.repos.cdpNginxUpstreams:
      return workflow === cfg.workflows.createNginxUpstreams
    case cfg.github.repos.cdpSquidProxy:
      return workflow === cfg.workflows.createSquidConfig
    case cfg.github.repos.cdpGrafanaSvc:
      return workflow === cfg.workflows.createDashboard
    case cfg.github.repos.cdpTfSvcInfra:
      return [
        cfg.workflows.createTenantService,
        'manual.yml', // we also want to trigger the handler off apply and manual
        'apply.yml'
      ].includes(workflow)
    case cfg.github.repos.createWorkflows:
      return [
        cfg.workflows.createMicroService,
        cfg.workflows.createRepository,
        cfg.workflows.createJourneyTest,
        cfg.workflows.createEnvTestSuite,
        cfg.workflows.createPerfTestSuite,
        cfg.workflows.createSmokeTestSuite
      ].includes(workflow)
    default:
      return false
  }
}

const workflowRunHandlerV2 = async (server, message) => {
  const db = server.db
  const workflowRepo = message.repository?.name
  const headBranch = message.workflow_run?.head_branch
  const headSHA = message.workflow_run?.head_sha
  const workflowPath = path.basename(message.workflow_run?.path)

  if (headBranch !== 'main') {
    logger.info(
      `Not processing workflow run ${workflowRepo}/${workflowPath}, not running on main branch`
    )
    return
  }

  // Are we interested in handling the event?
  if (shouldWorkflowBeProcessed(workflowRepo, workflowPath)) {
    logger.info(
      `Processing workflow_run message for ${workflowRepo}, ${headBranch}/${headSHA}, action: ${message.action}`
    )
    switch (workflowRepo) {
      case config.get('github.repos.cdpTfSvcInfra'):
        // cdp-tf-svc-infra has its own handler
        await handleTfSvcInfraWorkflow(db, logger, message)
        break
      default:
        await handleTriggeredWorkflow(db, logger, message)
        break
    }
  } else {
    logger.info(`Not processing ${workflowRepo}/${workflowPath}`)
  }
}

export { workflowRunHandlerV2, shouldWorkflowBeProcessed }
