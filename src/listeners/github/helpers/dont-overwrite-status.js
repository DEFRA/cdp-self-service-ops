import { statuses } from '~/src/constants/statuses.js'

// Status precedence from lowest (0) to highest.
// Lower statuses should not override higher ones.
const statusPrecedence = [
  [statuses.notRequested],
  [statuses.raised, statuses.requested],
  [statuses.queued],
  [statuses.merged],
  [statuses.inProgress],
  [statuses.success, statuses.failure]
]

function dontOverwriteStatus(s) {
  const idx = statusPrecedence.findIndex((t) => t.includes(s))
  if (idx === -1) return []
  return statusPrecedence.slice(idx + 1).flat()
}

export { dontOverwriteStatus }
