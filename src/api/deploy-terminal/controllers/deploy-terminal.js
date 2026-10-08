import Boom from '@hapi/boom'
import { UTCDate } from '@date-fns/utc'
import { differenceInSeconds, addMinutes, min } from 'date-fns'
import { statusCodes } from '@defra/cdp-validation-kit'
import { getEntity } from '../../../helpers/portal-backend/get-entity.js'
import { config } from '#config/config.js'
import { deployTerminalValidation } from '../helpers/deploy-terminal-validation.js'
import { sendSnsMessage } from '../../../helpers/sns/send-sns-message.js'
import { generateTerminalToken } from '../helpers/generate-terminal-token.js'
import { recordTerminalSession } from '../helpers/record-terminal-session.js'
import {
  hasBreakGlassScope,
  isAllowedTerminalEnvironment
} from '../helpers/is-allowed-terminal-environment.js'
import { toolConfig, getMaxLifetimeMinutes } from '../helpers/tool-config.js'
import { environments } from '../../../config/index.js'

// Owning teams come from the entity, never from the request, so a caller cannot claim another team's service.
const ownerTeamIds = (entity) =>
  entity?.teams?.map(({ teamId }) => teamId) ?? []

/**
 * Queues the SQS tool can redrive: only those with both a queue arn and a dead letter queue.
 * @param {object[]|null|undefined} queues
 * @param {object} payload
 * @param {object} logger
 */
function redrivableQueues(queues, payload, logger) {
  return (queues ?? []).filter((queue) => {
    const isRedrivable = Boolean(queue.arn && queue.deadletter_queue_arn)
    if (!isRedrivable) {
      logger.warn(
        `Skipping queue ${queue.name} for ${payload.service} in ${payload.environment} because arn or deadletter_queue_arn is missing`
      )
    }
    return isRedrivable
  })
}

export const deployTerminalController = {
  options: {
    auth: {
      strategy: 'azure-oidc'
    },
    validate: {
      payload: deployTerminalValidation
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
    const entity = await getEntity(payload.service, logger)

    if (
      !isAllowedTerminalEnvironment({
        userScopes: scope,
        environment: payload.environment,
        teamIds: ownerTeamIds(entity),
        tool: payload.tool
      })
    ) {
      throw Boom.forbidden(
        'Insufficient permissions to launch a terminal in this environment'
      )
    }

    const response = await deployTerminal(
      payload,
      entity,
      user,
      logger,
      snsClient,
      scope
    )

    return h.response(response).code(statusCodes.ok)
  }
}

/**
 * @param {object} payload
 * @param {object} entity The service's portal-backend entity
 * @param {{id: string, displayName: string}} user
 * @param {object} logger
 * @param {object} snsClient
 * @param {string[]} [scope] The launching user's scopes at launch time. Sent on `deployed_by` so the
 * webshell-proxy can store them alongside the shell's owner.
 */
export const deployTerminal = async function (
  payload,
  entity,
  user,
  logger,
  snsClient,
  scope = []
) {
  const envConfig = entity?.environments?.[payload.environment]
  const zone = envConfig?.tenant_config?.zone
  if (!zone) {
    logger.error(
      `failed to find zone for ${payload.service} in ${payload.environment}`
    )
    throw Boom.forbidden('Failed to lookup service in this environment')
  }

  const token = generateTerminalToken(64)

  const tool = toolConfig[payload.tool]
  if (!tool) {
    throw Boom.forbidden(`Unknown tool ${payload.tool}`)
  }

  const now = new UTCDate()
  const maxExpiry = addMinutes(now, getMaxLifetimeMinutes(payload.environment))
  const expiresDate = min([payload.expiresAt ?? maxExpiry, maxExpiry])
  const timeoutInSeconds = Math.max(0, differenceInSeconds(expiresDate, now))
  const idleTimeoutInSeconds = tool.idle_timeout_minutes * 60
  const hasPostgres = envConfig.sql_database != null
  const postgres = tool.usesPostgresRole === false ? false : hasPostgres

  const sqsQueues = tool.sqs
    ? redrivableQueues(envConfig.sqs_queues, payload, logger)
    : []
  if (tool.sqs && sqsQueues.length === 0) {
    throw Boom.badRequest(
      `No queues with a dead letter queue for ${payload.service} in ${payload.environment}`
    )
  }
  const showMessageContent =
    tool.sqs === true &&
    (payload.environment !== environments.prod ||
      hasBreakGlassScope({ userScopes: scope, teamIds: ownerTeamIds(entity) }))

  const runMessage = {
    environment: payload.environment,
    deployed_by: { ...user, scope },
    zone,
    token,
    role: payload.service,
    service: payload.service,
    postgres,
    timeout: timeoutInSeconds,
    idle_timeout_seconds: idleTimeoutInSeconds,
    image: tool.image,
    image_version: tool.image_version,
    show_message_content: showMessageContent,
    resources: envConfig
  }

  const { resources, ...loggedMessage } = runMessage
  logger.info(
    `Terminal requested ${JSON.stringify(loggedMessage)} by ${user.displayName}`
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
      tool: payload.tool,
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
