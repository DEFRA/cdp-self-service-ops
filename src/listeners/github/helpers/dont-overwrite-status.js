import { statuses } from '~/src/constants/statuses'

const dontOverwriteStatus = (workflowStatus) => {
  switch (workflowStatus) {
    case statuses.notRequested:
      return Object.values(statuses)
    case statuses.raised:
    case statuses.open:
    case statuses.closed:
    case statuses.requested:
      return [
        statuses.queued,
        statuses.success,
        statuses.failure,
        statuses.inProgress,
        statuses.closed,
        statuses.merged
      ]
    case statuses.queued:
      return [
        statuses.success,
        statuses.failure,
        statuses.inProgress,
        statuses.closed,
        statuses.merged
      ]
    case statuses.merged:
      return [statuses.success, statuses.failure, statuses.inProgress]
    case statuses.inProgress:
      return [statuses.success, statuses.failure]
    case statuses.success:
    case statuses.failure:
    default:
      return []
  }
}

export { dontOverwriteStatus }
