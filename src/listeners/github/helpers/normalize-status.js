const normalizeStatus = (action, conclusion) => {
  switch (action) {
    case 'completed':
      switch (conclusion) {
        case 'success':
          return 'success'
        case 'skipped':
          return 'success'
        default:
          return 'failure'
      }
    case 'in_progress':
      return 'in-progress'
    case 'in-progress':
      return 'in-progress'
    case 'requested':
      return 'requested'
    default:
      return 'requested'
  }
}

export { normalizeStatus }
