import { config } from '~/src/config/index.js'

/**
 * @param {string} toggleName
 */
function findFeatureToggle(toggleName) {
  return config.get(`features.${toggleName}`)
}

export { findFeatureToggle }
