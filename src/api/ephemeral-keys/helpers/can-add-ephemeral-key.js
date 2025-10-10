import {
  adminOnlyEnvironments,
  environments,
  scopes
} from '@defra/cdp-validation-kit'

function canAddEphemeralKey(environment, scope) {
  if (environment === environments.prod) {
    return scope.some((s) => s.startsWith(scopes.breakGlass))
  } else if (scope.includes(scopes.admin)) {
    return true
  } else if (
    !adminOnlyEnvironments.includes(environment) &&
    scope.includes(scopes.tenant)
  ) {
    return true
  }

  return false
}

export { canAddEphemeralKey }
