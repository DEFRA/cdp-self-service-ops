import { statuses } from '~/src/constants/statuses'

/**
 * Finds all records that haven't been completed yet.
 * We use this to match successful tf-svc-infra runs to pending statuses.
 * (There were issues with re-running failed jobs never updating their status record,
 * Now, if the service is in tf-svc-infra's tenants.json and it has a pending/failed status,
 * we match and update it.
 * @param db
 * @returns {Promise<*>}
 */
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

export { findAllInProgressOrFailed }
