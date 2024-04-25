import { statuses } from '~/src/constants/statuses'

const dontOverwriteStatus = (workflowStatus) => {
  switch (workflowStatus) {
    case statuses.notRequested:
      return [
        statuses.raised,
        statuses.requested,
        statuses.success,
        statuses.failure,
        statuses.inProgress
      ]
    case statuses.raised:
    case statuses.requested:
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
