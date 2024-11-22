import { config } from '~/src/config/index.js'
import { statuses } from '~/src/constants/statuses.js'
import { creations } from '~/src/constants/creations.js'

const cdpTfSvcInfra = config.get('github.repos.cdpTfSvcInfra')
const cdpAppConfig = config.get('github.repos.cdpAppConfig')
const cdpNginxUpstream = config.get('github.repos.cdpNginxUpstreams')
const cdpSquidConfig = config.get('github.repos.cdpSquidProxy')
const cdpDashboards = config.get('github.repos.cdpGrafanaSvc')
const cdpCreateWorkflows = config.get('github.repos.createWorkflows')

function getStatusKeys(statusRecord) {
  switch (statusRecord?.kind) {
    case creations.repository:
    case creations.testsuite:
      return [cdpCreateWorkflows]

    case creations.envTestsuite:
    case creations.smokeTestSuite:
    case creations.perfTestsuite:
      return [cdpCreateWorkflows, cdpTfSvcInfra, cdpSquidConfig]

    case creations.microservice:
      return [
        cdpCreateWorkflows,
        cdpNginxUpstream,
        cdpAppConfig,
        cdpTfSvcInfra,
        cdpSquidConfig,
        cdpDashboards
      ]
    default:
      return []
  }
}

function calculateOverallStatus(
  statusRecord,
  statusKeys = getStatusKeys(statusRecord)
) {
  const allSuccess = statusKeys.every(
    (key) => statusRecord[key]?.status === statuses.success
  )
  const anyFailed = statusKeys.some(
    (key) => statusRecord[key]?.status === statuses.failure
  )

  if (allSuccess) {
    return statuses.success
  }

  if (anyFailed) {
    return statuses.failure
  }

  return statuses.inProgress
}

/**
 *
 * @param { import('mongodb').Db } db               - mongodb client
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
  db,
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

  await db.collection('status').insertOne(status)
  return status
}

/**
 *
 * @param {object} db
 * @param {string} repo
 * @param {string} field - The name of the field/workflow being updated
 * @param {{status: string, trigger: {org: string, repo: string, workflow: string, inputs: object}, result: object|undefined }} status
 * @returns {Promise<*>}
 */
async function updateCreationStatus(db, repo, field, status) {
  return await db.collection('status').updateOne(
    { repositoryName: repo },
    {
      $set: {
        [`${field}.status`]: status.status,
        [`${field}.trigger`]: status.trigger,
        [`${field}.result`]: status.result
      }
    }
  )
}

async function updateOverallStatus(db, repositoryName) {
  const statusRecord = await db.collection('status').findOne({ repositoryName })

  if (statusRecord) {
    const overallStatus = calculateOverallStatus(statusRecord)

    await db
      .collection('status')
      .updateOne({ repositoryName }, { $set: { status: overallStatus } })
  }
}

export {
  initCreationStatus,
  updateCreationStatus,
  updateOverallStatus,
  calculateOverallStatus
}
