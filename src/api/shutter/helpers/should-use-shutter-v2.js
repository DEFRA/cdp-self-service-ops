import { config } from '#config/config.js'

/**
 * Temporary, remove when shutter v2 is fully enabled
 * @param {string} env
 * @returns {boolean}
 */
export function shouldUseShutterV2(env) {
  const allowedEnvs = config.get('shutterV2Environments').split(',')
  return (allowedEnvs ?? []).includes(env)
}
