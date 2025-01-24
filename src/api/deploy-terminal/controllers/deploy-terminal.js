import Boom from '@hapi/boom'

import { config } from '~/src/config/index.js'
import { deployTerminalValidation } from '~/src/api/deploy-terminal/helpers/deploy-terminal-validation.js'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message.js'
import { canRunTerminalInEnvironment } from '~/src/api/deploy-terminal/helpers/can-run-terminal-in-environment.js'
import { generateTerminalToken } from '~/src/api/deploy-terminal/helpers/generate-terminal-token.js'
import { deployTerminalPayload } from '~/src/api/deploy-terminal/helpers/deploy-terminal-payload.js'
import { lookupTenantService } from '~/src/helpers/portal-backend/lookup-tenant-service.js'

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

    const service = await lookupTenantService(
      payload.service,
      payload.environment,
      logger
    )

    if (!service?.zone) {
      logger.error(
        `failed to find zone for ${payload.service} in ${payload.environment}`
      )
      throw Boom.forbidden('Failed to lookup service in this environment')
    }

    logger.info(
      `Terminal requested ${JSON.stringify(payload)} by ${user.displayName}`
    )

    const token = generateTerminalToken(64)

    const runMessage = deployTerminalPayload({
      user,
      token,
      environment: payload.environment,
      zone: service.zone,
      service: payload.service
    })

    const snsResponse = await sendSnsMessage({
      snsClient,
      topic: config.get('snsRunTerminalTopicArn'),
      message: runMessage,
      logger
    })

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
