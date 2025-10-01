import { triggerWorkflow } from '../../github/trigger-workflow.js'
import { config } from '../../../config/index.js'

/**
 * @import {TenantTemplate} from "./templates.js"
 * @param {{}} request
 * @param {string} name - name of tenant service or test suite to create
 * @param {{ teamId: string, serviceCodes: string|null }} team - CDP Team record
 * @param {TenantTemplate} template - template object
 * @param {string|null} templateTag - overrides branch or tag used to template the repo
 * @returns {Promise<void>}
 */
async function triggerCreateTenantWorkflow(
  request,
  name,
  team,
  template,
  templateTag = null
) {
  const org = config.get('github.org')
  const repo = config.get('github.repos.cdpTenantConfig')
  const workflowId = config.get('workflows.createTenantService')

  const tenantConfig = {
    zone: template.zone,
    mongo_enabled: template.mongo,
    redis_enabled: template.redis,
    type: template.entityType,
    subtype: template.entitySubType ?? '',
    team: team.teamId,
    service_code: team.serviceCodes?.at(0)
  }

  const tagOrBranch = templateTag ?? template.defaultBranch ?? 'main'
  const templateRepo = `${template.repositoryName}@${tagOrBranch}`

  const inputs = {
    service: name,
    template_repo: templateRepo,
    config: JSON.stringify(tenantConfig)
  }

  await triggerWorkflow(org, repo, workflowId, inputs, name, request.logger)
}

export { triggerCreateTenantWorkflow }
