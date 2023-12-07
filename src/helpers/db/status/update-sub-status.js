import { createLogger } from '~/src/helpers/logging/logger'
import { updateOverallStatus } from '~/src/helpers/db/status/update-overall-status'

/**
 * Update the status of a subsection (e.g. repo creation or app config creation)
 * Also allows for addition info to be set (e.g. workflow output, pr numbers etc)
 * @param db
 * @param repo
 * @param section which section of the status we updating
 * @param status status for that section
 * @param extraFields a map of other fields that should be updated, e.g. {'merged_sha': 'aabbccdd'}, these will be prefixed with the section value
 * @returns {Promise<void>}
 */

const logger = createLogger()

async function updateSubStatus(db, repo, section, status, extraFields) {
  const prefixedExtraFields = {}

  Object.keys(extraFields ?? {}).forEach(
    (k) => (prefixedExtraFields[`${section}.${k}`] = extraFields[k])
  )

  logger.info(
    `updating sub-status, ${repo}, ${section} ${status} ${JSON.stringify(
      prefixedExtraFields
    )}`
  )
  await db
    .collection('status')
    .updateOne(
      { repositoryName: repo },
      { $set: { [`${section}.status`]: status, ...prefixedExtraFields } }
    )

  // update the overall status

  await updateOverallStatus(db, repo)
}

export { updateSubStatus }
