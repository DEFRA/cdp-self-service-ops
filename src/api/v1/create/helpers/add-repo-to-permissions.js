function addRepoToPermissionList(repository, content) {
  let lines = content.split('\n')
  let insertAt = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('  gh_action_repos = [')) {
      while (i++ < lines.length && !lines[i].endsWith(']')) {
        let serviceName = lines[i].trim()

        // return early if the repo has already been added.
        // TODO: maybe regex this, we have to consider quotes and trailing commas"
        if (serviceName == `"${repository}",`) {
          return content
        }
      }
      insertAt = i
      break
    }
  }

  // note: ensure whitespace is unchanged so as not to break the tf-fmt check
  lines[insertAt] = `    "${repository}",\n  ]`

  return lines.join('\n')
}

export { addRepoToPermissionList }
