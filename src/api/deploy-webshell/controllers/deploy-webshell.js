import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { deployWebShellValidation } from '~/src/api/deploy-webshell/helpers/deploy-webshell-validation.js'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message.js'
import { canRunShellInEnvironment } from '~/src/api/deploy-webshell/helpers/can-run-shell-in-environment.js'
import { generateWebShellToken } from '~/src/api/deploy-webshell/helpers/generate-webshell-token.js'
import { deployWebShellPayload } from '~/src/api/deploy-webshell/helpers/deploy-webshell-payload.js'
import { lookupTenantService } from '~/src/api/deploy/helpers/lookup-tenant-service.js'

const deployWebShellController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: deployWebShellValidation()
    },
    payload: {
      output: 'data',
      parse: true,
      allow: 'application/json'
    }
  },
  handler: async (request, h) => {
    const { payload, logger, auth, snsClient } = request

    const user = {
      id: auth?.credentials?.id,
      displayName: auth?.credentials?.displayName
    }

    const scope = auth?.credentials?.scope

    if (!canRunShellInEnvironment(payload.environment, scope)) {
      throw Boom.forbidden(
        'Insufficient permissions to launch a web-shell in this environment'
      )
    }

    const tenant = await lookupTenantService(
      payload.service,
      payload.environment,
      logger
    )

    if (!tenant?.zone) {
      logger.error(
        `failed to find zone for ${payload.service} in ${payload.environment}`
      )
      throw Boom.forbidden('Failed to lookup service in this environment')
    }

    logger.info(
      `WebShell requested ${JSON.stringify(payload)} by ${user.displayName}`
    )

    const token = generateWebShellToken(64)

    const runMessage = deployWebShellPayload({
      user,
      token,
      environment: payload.environment,
      zone: tenant.zone,
      service: payload.service
    })

    const snsResponse = await sendSnsMessage({
      snsClient,
      topic: config.get('snsRunWebShellTopicArn'),
      message: runMessage,
      logger
    })

    logger.info(
      `SNS Deploy WebShell response: ${JSON.stringify(snsResponse, null, 2)}`
    )

    const responsePayload = {
      message: 'success',
      token,
      environment: payload.environment,
      service: payload.service
    }

    return h.response(responsePayload).code(200)
  }
}

export { deployWebShellController }
