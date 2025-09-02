import Boom from '@hapi/boom'
import { differenceInSeconds, addHours } from 'date-fns'

import { config } from '../../../config/index.js'
import { deployTerminalValidation } from '../helpers/deploy-terminal-validation.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import { canRunTerminalInEnvironment } from '../helpers/can-run-terminal-in-environment.js'
import { generateTerminalToken } from '../helpers/generate-terminal-token.js'
import { lookupTenantService } from '../../../helpers/portal-backend/lookup-tenant-service.js'
import { recordTerminalSession } from '../helpers/record-terminal-session.js'
import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

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

    const response = await deployTerminal(payload, user, logger, snsClient)

    return h.response(response).code(statusCodes.ok)
  }
}

const deployTerminal = async function (payload, user, logger, snsClient) {
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

  // Default terminal expires after 2 hours
  const now = new Date()
  const expiresAt = addHours(now, 2)
  const timeout = Math.abs(differenceInSeconds(expiresAt, now))

  const runMessage = {
    environment: payload.environment,
    deployed_by: user,
    zone,
    token,
    role: payload.service,
    service: payload.service,
    postgres: tenantService?.postgres === true,
    timeout
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

  try {
    await recordTerminalSession({
      service: payload.service,
      environment: payload.environment,
      user,
      token
    })
  } catch (e) {
    logger.error(
      e,
      `Failed to record terminal session request for ${payload.environment}/${payload.service} by ${user.displayName}`,
      e
    )
  }

  logger.info(
    `SNS Deploy Terminal response: ${JSON.stringify(snsResponse, null, 2)}`
  )

  return {
    token,
    environment: payload.environment,
    service: payload.service
  }
}

export { deployTerminalController, deployTerminal }
