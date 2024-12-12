import { dontOverwriteStatus } from '~/src/listeners/github/helpers/dont-overwrite-status.js'
import { statuses } from '~/src/constants/statuses.js'

describe('#dont-overwrite-status', () => {
  test('returns empty list when unknown status is given', () => {
    expect(dontOverwriteStatus('an-unknown-status-cdoe')).toEqual([])
  })

  test('returns a list of statuses that cant be overwritten for a given status', () => {
    expect(dontOverwriteStatus(statuses.success).sort()).toEqual([])
    expect(dontOverwriteStatus(statuses.failure).sort()).toEqual([])
    expect(dontOverwriteStatus(statuses.inProgress).sort()).toEqual(
      [statuses.success, statuses.failure].sort()
    )
    expect(dontOverwriteStatus(statuses.merged).sort()).toEqual(
      [statuses.inProgress, statuses.success, statuses.failure].sort()
    )

    expect(dontOverwriteStatus(statuses.queued).sort()).toEqual(
      [
        statuses.merged,
        statuses.inProgress,
        statuses.success,
        statuses.failure
      ].sort()
    )

    expect(dontOverwriteStatus(statuses.raised).sort()).toEqual(
      [
        statuses.queued,
        statuses.merged,
        statuses.inProgress,
        statuses.success,
        statuses.failure
      ].sort()
    )

    expect(dontOverwriteStatus(statuses.requested).sort()).toEqual(
      [
        statuses.queued,
        statuses.merged,
        statuses.inProgress,
        statuses.success,
        statuses.failure
      ].sort()
    )

    expect(dontOverwriteStatus(statuses.notRequested).sort()).toEqual(
      [
        statuses.raised,
        statuses.requested,
        statuses.queued,
        statuses.merged,
        statuses.inProgress,
        statuses.success,
        statuses.failure
      ].sort()
    )
  })
})
