const githubEventsOpenedPullRequestFixture = {
  github_event: 'pull_request',
  action: 'opened',
  number: 241,
  pull_request: {
    state: 'open',
    merge_commit_sha: '6d19e42bae822f41f8ce007623a3194ce937662a',
    merged: false
  },
  repository: {
    name: 'cdp-app-config'
  }
}

export { githubEventsOpenedPullRequestFixture }
