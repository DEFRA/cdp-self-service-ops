import { config } from '#config/config.js'

/**
 * Temporary, remove when we enable direct deploys for all environments
 * @param {string} env
 * @return {boolean}
 */
export function shouldDirectDeploy(env) {
  const allowedEnvs = config.get('directDeployments').split(',') // remove once fully switched over
  return (allowedEnvs ?? []).includes(env)
}
