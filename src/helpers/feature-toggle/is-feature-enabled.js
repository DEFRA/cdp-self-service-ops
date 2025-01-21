import { findFeatureToggle } from '~/src/helpers/feature-toggle/find-feature-toggle.js'

function isFeatureEnabled(toggleName) {
  if (!toggleName) {
    throw new Error('toggleName is required')
  }
  const toggle = findFeatureToggle(toggleName)
  if (!toggle) {
    return false
  }
  const enabled = toggle?.enabled
  if (enabled === undefined) {
    return toggle
  }
  return enabled
}

export { isFeatureEnabled }
