import { statuses } from '~/src/constants/statuses.js'
import { dontOverwriteStatus } from '~/src/listeners/github/helpers/dont-overwrite-status.js'

async function findByRepoName(db, repoName) {
  return db.collection('status').findOne({ repositoryName: repoName })
}

/**
 * @param {*} db        - mongodb database
 * @param {string} repo - status record to update
 * @param {string} workflow  - workflow step to update (e.g. cdp-tf-svc-infra)
 * @param {'main'|'pr'} branch    - is this update related to the PR or the main branch
 * @param {string} status    - status of this step
 * @param {{path, updated_at, html_url, name, created_at, id}} workflowPayload - extra data to store against this step
 */
async function updateWorkflowStatus(
  db,
  repo,
  workflow,
  branch,
  status,
  workflowPayload
) {
  const filter = {
    repositoryName: repo,
    [`${workflow}.status`]: { $nin: dontOverwriteStatus(status) }
  }
  const update = {
    $set: {
      [`${workflow}.status`]: status,
      [`${workflow}.${branch}.workflow`]: workflowPayload
    }
  }

  return db.collection('status').updateOne(filter, update)
}

async function findAllInProgressOrFailed(db) {
  return await db
    .collection('status')
    .find(
      {
        status: { $in: [statuses.inProgress, statuses.failure] }
      },
      {
        projection: { _id: 0, repositoryName: 1 }
      }
    )
    .toArray()
}

export { findAllInProgressOrFailed, findByRepoName, updateWorkflowStatus }
