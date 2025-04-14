import { statuses } from '~/src/constants/statuses.js'
import { createLegacyStatus } from '~/src/helpers/portal-backend/legacy-status/create-legacy-status.js'

/**
 *
 * @param {string} org                              - GitHub org
 * @param {string} kind                             - what kind of resource is it (set in creations.js)
 * @param {string} repositoryName                   - name of resource being created
 * @param {string} serviceTypeTemplate              - what template is it made from
 * @param {"public" | "protected" | undefined} zone - what zone does this run in, if applicable
 * @param {{teamId: string, name: string}} team     - which team owns the resource
 * @param {{id: string, displayName: string}} user  - who requested the creation of it
 * @param {string[]} workflows                      - which GitHub repos to track statuses from
 * @returns {Promise<{creator, org, zone, kind, started: Date, team: {teamId: (string|*), name}, repositoryName, serviceTypeTemplate, portalVersion: number, status: string}>}
 */
async function initCreationStatus(
  org,
  kind,
  repositoryName,
  serviceTypeTemplate,
  zone,
  team,
  user,
  workflows
) {
  const status = {
    org,
    repositoryName,
    portalVersion: 2,
    kind,
    status: statuses.inProgress,
    started: new Date(),
    serviceTypeTemplate,
    team: {
      teamId: team.teamId,
      name: team.name
    },
    creator: {
      id: user?.id,
      displayName: user?.displayName
    },
    zone
  }

  for (const workflow of workflows) {
    status[workflow] = { status: statuses.notRequested }
  }

  await createLegacyStatus(status)
  return status
}

export { initCreationStatus }
