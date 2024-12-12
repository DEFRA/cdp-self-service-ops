/**
 *
 * @param {{environment: string, zone: string, service: string, token: string, user: {id: string, displayName: string} }} payload
 * @returns {{environment: *, zone: string, token: string, role: string, deployed_by: {displayName: string, id: string}}}
 */
export function deployTerminalPayload(payload) {
  return {
    environment: payload.environment,
    zone: payload.zone,
    token: payload.token,
    role: payload.service,
    deployed_by: payload.user
  }
}
