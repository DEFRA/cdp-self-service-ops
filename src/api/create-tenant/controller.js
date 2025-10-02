import Boom from '@hapi/boom'
import { statusCodes, scopes as cdpScopes } from '@defra/cdp-validation-kit'

import { tenantTemplates } from './helpers/templates.js'
import { fetchTeam } from '../../helpers/fetch-team.js'
import { triggerCreateTenantWorkflow } from '../../helpers/create/workflows/trigger-create-tenant-workflow.js'
import { createInitialEntity } from '../../helpers/create/create-initial-entity.js'
import { createTenantValidationSchema } from './helpers/create-tenant-validation-schema.js'

const createTenantController = {
  options: {
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [cdpScopes.admin, 'team:{payload.teamId}']
      }
    },
    validate: {
      payload: createTenantValidationSchema(),
      failAction: () => Boom.boomify(Boom.badRequest())
    }
  },
  handler: async (request, h) => {
    const user = request.auth?.credentials
    const scopes = request.auth.credentials?.scope ?? []

    const payload = request.payload
    const name = payload?.repositoryName
    const teamId = payload.teamId

    const team = await fetchTeam(teamId)
    if (!team?.github) {
      throw Boom.badData(
        `Team ${team.name} does not have a link to a Github team`
      )
    }

    const templateId = payload.serviceTypeTemplate
    const templateTag = payload.templateTag
    const template = tenantTemplates[templateId]

    if (!template) {
      throw Boom.badData(`Invalid service template: '${templateId}'`)
    }

    if (template.requiredScope && !scopes?.includes(template.requiredScope)) {
      throw Boom.unauthorized(
        `User does not have permissions to create ${templateId}, requires ${template.requiredScope}`
      )
    }

    request.logger.info(
      `Creating ${template.entityType} ${name} from ${templateId}`
    )

    // register entity
    await createInitialEntity({
      repositoryName: name,
      entityType: template.entityType,
      entitySubType: template.entitySubType,
      team,
      user
    })

    // trigger create workflow
    await triggerCreateTenantWorkflow(
      request,
      name,
      team,
      template,
      templateTag
    )

    return h
      .response({
        message: 'Service creation has started',
        repositoryName: name,
        template: template.id,
        statusUrl: `/status/${name}`
      })
      .code(statusCodes.ok)
  }
}

export { createTenantController }
