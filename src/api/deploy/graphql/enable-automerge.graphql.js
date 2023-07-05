const enableAutoMergeGraphQl = `mutation($pullRequestId: ID!) {
  enablePullRequestAutoMerge(input: {
    pullRequestId: $pullRequestId,
    mergeMethod: REBASE
  }) {
  clientMutationId
  pullRequest {
    id
    state
    autoMergeRequest {
      enabledAt
      enabledBy {
        login
      }
    }
  }
}
}`

export { enableAutoMergeGraphQl }
