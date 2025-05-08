/**
 *
 * @param {{environment: string, zone: string, role: string, token: string, useDDL: boolean, user: {id: string, displayName: string} }} payload
 * @returns {{environment: *, zone: string, token: string, role: string, deployed_by: {displayName: string, id: string}}}
 */
export function deployTerminalPayload(payload) {
  let role = payload.role
  if (payload.useDDL) {
    role = role + '-ddl'
  }

  return {
    environment: payload.environment,
    zone: payload.zone,
    token: payload.token,
    role,
    deployed_by: payload.user
  }
}
