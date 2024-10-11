/**
 *
 * @param {{environment: string, service: string, token: string, user: {id: string, displayName: string} }} payload
 * @returns {{environment: *, zone: string, token: string, role: string, deployed_by: {displayName: string, id: string}}}
 */
export function deployWebShellPayload(payload) {
  return {
    environment: payload.environment,
    zone: 'ops',
    token: payload.token,
    role: payload.service,
    deployed_by: payload.user
  }
}
