import { addRepoToPermissionList } from './add-repo-to-permissions'

const testData = `
locals {
  gh_action_role_name = "github-actions-role"
  gh_action_role_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonECS_FullAccess",
  ]
  gh_action_repos = [
    "defra-cdp-sandpit/foo",
    "defra-cdp-sandpit/baz",
    "defra-cdp-sandpit/bar",
  ]
}

# for docDB
statement {
  sid       = ""
  effect    = "Allow"
  resources = ["arn:aws:iam::*:role/aws-service-role/rds.amazonaws.com/AWSServiceRoleForRDS"]
  condition {
  }
}
`

const expectedData = `
locals {
  gh_action_role_name = "github-actions-role"
  gh_action_role_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonECS_FullAccess",
  ]
  gh_action_repos = [
    "defra-cdp-sandpit/foo",
    "defra-cdp-sandpit/baz",
    "defra-cdp-sandpit/bar",
    "defra-cdp-sandpit/test",
  ]
}

# for docDB
statement {
  sid       = ""
  effect    = "Allow"
  resources = ["arn:aws:iam::*:role/aws-service-role/rds.amazonaws.com/AWSServiceRoleForRDS"]
  condition {
  }
}
`

describe('add repo to permissions terraform', () => {
  test('it inserts a new repo in the correct possition', () => {
    expect(addRepoToPermissionList('defra-cdp-sandpit/test', testData)).toBe(
      expectedData
    )
  })

  test('it does NOT inserts a repo into the list if it already exists', () => {
    expect(addRepoToPermissionList('defra-cdp-sandpit/baz', testData)).toBe(
      testData
    )
  })
})
