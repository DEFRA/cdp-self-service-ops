import { dontOverwriteStatus } from '~/src/listeners/github/helpers/dont-overwrite-status'
import { statuses } from '~/src/constants/statuses'

describe('#dont-overwrite-status', () => {
  test('in progress cant overwrite complete and finished', () => {
    expect(dontOverwriteStatus(statuses.inProgress)).toContain(statuses.success)
    expect(dontOverwriteStatus(statuses.inProgress)).toContain(statuses.failure)
  })

  test('success and failure can overwrite everything', () => {
    expect(dontOverwriteStatus(statuses.success)).toEqual([])
    expect(dontOverwriteStatus(statuses.failure)).toEqual([])
  })

  test('requested cant overwrite in-progress, success or failure', () => {
    expect(dontOverwriteStatus(statuses.requested)).toContain(statuses.failure)
    expect(dontOverwriteStatus(statuses.requested)).toContain(statuses.success)
    expect(dontOverwriteStatus(statuses.requested)).toContain(
      statuses.inProgress
    )
  })
})
