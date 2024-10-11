import { deployWebShellValidation } from '~/src/api/deploy-webshell/helpers/deploy-webshell-validation'
import { sendSnsMessage } from '~/src/helpers/sns/send-sns-message'
import { canRunShellInEnvironment } from '~/src/api/deploy-webshell/helpers/can-run-shell-in-environment'
import { generateWebShellToken } from '~/src/api/deploy-webshell/helpers/generate-webshell-token'
import { config } from '~/src/config'

import Boom from '@hapi/boom'
import { deployWebShellPayload } from '~/src/api/deploy-webshell/helpers/deploy-webshell-payload'

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
    const payload = request.payload

    const user = {
      id: request.auth?.credentials?.id,
      displayName: request.auth?.credentials?.displayName
    }

    const scope = request.auth?.credentials?.scope

    if (!canRunShellInEnvironment(payload.environment, scope)) {
      throw Boom.forbidden(
        'Insufficient permissions to launch a web-shell in this environment'
      )
    }

    request.logger.info(
      `WebShell requested ${JSON.stringify(payload)} by ${user.displayName}`
    )

    const token = generateWebShellToken(64)

    const runMessage = deployWebShellPayload({
      user,
      token,
      environment: payload.environment,
      service: payload.service
    })

    const snsResponse = await sendSnsMessage({
      snsClient: request.snsClient,
      topic: config.get('snsRunWebShellTopicArn'),
      message: runMessage,
      logger: request.logger
    })

    request.logger.info(
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
