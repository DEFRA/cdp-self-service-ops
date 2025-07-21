import Boom from '@hapi/boom'

import { config } from '../../../config/index.js'
import { deployTerminalValidation } from '../helpers/deploy-terminal-validation.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import { canRunTerminalInEnvironment } from '../helpers/can-run-terminal-in-environment.js'
import { generateTerminalToken } from '../helpers/generate-terminal-token.js'
import { lookupTenantService } from '../../../helpers/portal-backend/lookup-tenant-service.js'

const deployTerminalController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: deployTerminalValidation()
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

    const scope = auth?.credentials?.scope ?? []

    if (!canRunTerminalInEnvironment(payload.environment, scope)) {
      throw Boom.forbidden(
        'Insufficient permissions to launch a terminal in this environment'
      )
    }

    const tenantService = await lookupTenantService(
      payload.service,
      payload.environment,
      logger
    )

    const zone = tenantService?.zone
    if (!zone) {
      logger.error(
        `failed to find zone for ${payload.service} in ${payload.environment}`
      )
      throw Boom.forbidden('Failed to lookup service in this environment')
    }

    const token = generateTerminalToken(64)

    const runMessage = {
      environment: payload.environment,
      deployed_by: user,
      zone,
      token,
      role: payload.service,
      service: payload.service,
      postgres: tenantService?.postgres === true
    }

    logger.info(
      `Terminal requested ${JSON.stringify(runMessage)} by ${user.displayName}`
    )

    const snsResponse = await sendSnsMessage(
      snsClient,
      config.get('snsRunTerminalTopicArn'),
      runMessage,
      logger
    )

    logger.info(
      `SNS Deploy Terminal response: ${JSON.stringify(snsResponse, null, 2)}`
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

export { deployTerminalController }
