import { statuses } from '~/src/constants/statuses.js'

const normalizeStatus = (action, conclusion) => {
  switch (action) {
    case statuses.completed:
      switch (conclusion) {
        case statuses.success:
        case statuses.skipped:
          return statuses.success
        case statuses.cancelled:
          return statuses.inProgress
        default:
          return statuses.failure
      }
    case 'in_progress':
    case statuses.inProgress:
      return statuses.inProgress
    case statuses.queued:
      return statuses.queued
    case statuses.requested:
      return statuses.requested
    default:
      return statuses.requested
  }
}

export { normalizeStatus }
