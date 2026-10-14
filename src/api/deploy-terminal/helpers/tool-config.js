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

const dbgateBase = {
  image: 'cdp-dbgate',
  idle_timeout_minutes: idleTimeoutMinutes,
  usesPostgresRole: false
}

/**
 * Expands out the selected tool to a image + image tag + the webshell-proxy tool id, plus optional capability flags:
 * - usesPostgresRole: false forces the service role even when the service has postgres (DbGate mongo, SQS).
 * - sqs: the tool is sent the service's redrivable queues.
 * - redis: the service must have Redis in the environment.
 * - allowInProdWithoutBreakGlass: service owners may launch it in prod without break glass.
 * - extra_env: additional environment variables passed to the launched tool.
 * @type {Object.<string, {image:string, image_version: string, tool: 'terminal'|'pgweb'|'dbgate_mongo'|'dbgate_redis'|'sqs_tool', idle_timeout_minutes: int, usesPostgresRole?: boolean, sqs?: boolean, redis?: boolean, allowInProdWithoutBreakGlass?: boolean, extra_env?: Record<string, string>}>}
 */
export const toolConfig = {
  terminal: {
    tool: 'terminal',
    image: 'cdp-webshell',
    image_version: 'stable',
    idle_timeout_minutes: idleTimeoutMinutes
  },
  terminal_latest: {
    tool: 'terminal',
    image: 'cdp-webshell',
    image_version: 'latest',
    idle_timeout_minutes: idleTimeoutMinutes
  },
  pgweb: {
    tool: 'pgweb',
    image: 'cdp-pgweb',
    image_version: 'stable',
    idle_timeout_minutes: idleTimeoutMinutes
  },
  pgweb_latest: {
    tool: 'pgweb',
    image: 'cdp-pgweb',
    image_version: 'latest',
    idle_timeout_minutes: idleTimeoutMinutes
  },
  dbgate: {
    tool: 'dbgate_mongo',
    ...dbgateBase,
    image_version: 'stable',
    extra_env: { DBGATE_ENGINE: 'mongo' }
  },
  dbgate_latest: {
    tool: 'dbgate_mongo',
    ...dbgateBase,
    image_version: 'latest',
    extra_env: { DBGATE_ENGINE: 'mongo' }
  },
  dbgate_redis: {
    tool: 'dbgate_redis',
    ...dbgateBase,
    image_version: 'stable',
    redis: true,
    extra_env: { DBGATE_ENGINE: 'redis' }
  },
  dbgate_redis_latest: {
    tool: 'dbgate_redis',
    ...dbgateBase,
    image_version: 'latest',
    redis: true,
    extra_env: { DBGATE_ENGINE: 'redis' }
  },
  sqs_tool: {
    tool: 'sqs_tool',
    image: 'cdp-aws-tools',
    image_version: 'stable',
    idle_timeout_minutes: idleTimeoutMinutes,
    usesPostgresRole: false,
    sqs: true,
    allowInProdWithoutBreakGlass: true
  },
  sqs_tool_latest: {
    tool: 'sqs_tool',
    image: 'cdp-aws-tools',
    image_version: 'latest',
    idle_timeout_minutes: idleTimeoutMinutes,
    usesPostgresRole: false,
    sqs: true,
    allowInProdWithoutBreakGlass: true
  }
}
