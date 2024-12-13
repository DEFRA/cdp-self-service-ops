import { removeAppConfig } from '~/src/helpers/remove/workflows/remove-app-config.js'
import { removeDashboard } from '~/src/helpers/remove/workflows/remove-dashboard.js'
import { removeNginxUpstreams } from '~/src/helpers/remove/workflows/remove-nginx-upstreams.js'
import { removeSquidConfig } from '~/src/helpers/remove/workflows/remove-squid-config.js'
import { removeTenantInfrastructure } from '~/src/helpers/remove/workflows/remove-tenant-infrastructure.js'
import { triggerWorkflow } from '~/src/helpers/github/trigger-workflow.js'

export {
  removeAppConfig,
  removeDashboard,
  removeNginxUpstreams,
  removeSquidConfig,
  removeTenantInfrastructure,
  triggerWorkflow
}
