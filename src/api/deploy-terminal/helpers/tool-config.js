import { environments } from '../../../config/index.js'

const idleTimeoutMinutes = 60
const prodMaxLifetimeMinutes = 60 * 2
const nonProdMaxLifetimeMinutes = 60 * 8

/**
 * Max lifetime (TTL) of the task. Prod is kept short, non-prod gets a full working day.
 * @param {string} environment
 * @returns {number} minutes
 */
export function getMaxLifetimeMinutes(environment) {
  return environment === environments.prod
    ? prodMaxLifetimeMinutes
    : nonProdMaxLifetimeMinutes
}

/**
 * Expands out the selected tool to a image + image tag, plus optional capability flags:
 * - usesPostgresRole: false forces the service role even when the service has postgres (DbGate mongo, SQS).
 * - sqs: the tool is sent the service's redrivable queues.
 * - allowInProdWithoutBreakGlass: service owners may launch it in prod without break glass.
 * @type {Object.<string, {image:string, image_version: string, idle_timeout_minutes: int, usesPostgresRole?: boolean, sqs?: boolean, allowInProdWithoutBreakGlass?: boolean}>}
 */
export const toolConfig = {
  terminal: {
    image: 'cdp-webshell',
    image_version: 'stable',
    idle_timeout_minutes: idleTimeoutMinutes
  },
  terminal_latest: {
    image: 'cdp-webshell',
    image_version: 'latest',
    idle_timeout_minutes: idleTimeoutMinutes
  },
  pgweb: {
    image: 'cdp-pgweb',
    image_version: 'stable',
    idle_timeout_minutes: idleTimeoutMinutes
  },
  pgweb_latest: {
    image: 'cdp-pgweb',
    image_version: 'latest',
    idle_timeout_minutes: idleTimeoutMinutes
  },
  dbgate: {
    image: 'cdp-dbgate',
    image_version: 'stable',
    idle_timeout_minutes: idleTimeoutMinutes,
    usesPostgresRole: false
  },
  dbgate_latest: {
    image: 'cdp-dbgate',
    image_version: 'latest',
    idle_timeout_minutes: idleTimeoutMinutes,
    usesPostgresRole: false
  },
  sqs_tool: {
    image: 'cdp-aws-tools',
    image_version: 'stable',
    idle_timeout_minutes: idleTimeoutMinutes,
    usesPostgresRole: false,
    sqs: true,
    allowInProdWithoutBreakGlass: true
  },
  sqs_tool_latest: {
    image: 'cdp-aws-tools',
    image_version: 'latest',
    idle_timeout_minutes: idleTimeoutMinutes,
    usesPostgresRole: false,
    sqs: true,
    allowInProdWithoutBreakGlass: true
  }
}
