# Orchestration

Create a service requires a number of action to be done in a specific order.
The majority of these are managed by creating github pull requests, merging/aut-merging them
and waiting for the workflow triggered by the commit to main to complete before starting the next step.

# Order of execution

- Validate create-a-service request
- triggers create repository worklflow in cdp-boilerplate
  - workflow will trigger the templating action on the newly created repository
- Raise PR against `tf-svc-infra` which:
  - adds repo to github oidc list, allowing the repos build action to work
  - adds repo the tenants.json for each environment, creating role, ECR repo, mongo/redis dbs etc
- Enables auto-merge on `tf-svc-infra`
- Raises/auto-merges pr for `cdp-app-config`
- Raises/auto-merges pr for `cdp-nginx-upstreams`
- Waits for message from github saying the PR for `tf-svc-infra` has been merged (recording the head commit SHA)
- Waits for message from github saying the workflow for `tf-svc-infra` has run on main and completed (using the commit SHA from above to identify it)
- Creates a 0.0.0 placeholder artifact in cdp-portal-backend

## How we track things

Internally we have a mongo collection called `status`.
When a new repo is created, a record is inserted into the collection which has the repo name, and info on the pull requests raised (i.e. pr id, commit sha etc)

```bson
  {
    _id: ObjectId("650c470f3c29d8fc4347ed35"),
    repositoryName: 'ct-sso-test-2',
    started: ISODate("2023-09-21T13:37:19.352Z"),
    createRepository: {
      status: 'not-requested',
      payload: {
        repositoryName: 'ct-sso-test-2',
        serviceType: 'cdp-node-backend-template',
        owningTeam: 'fisheries'
      }
    },
    'tf-svc-infra': {
      status: 'workflow_completed',
      pr: {
        number: 225,
        sha: '523efa0ccb344b9a7ae057fb7f0bb9a2edda39a3',
        ref: 'add-ct-sso-test-2-to-tenant-services-1695303440080',
        html_url: 'https://github.com/DEFRA/tf-svc-infra/pull/225',
        node_id: 'PR_kwDOJVWcQM5a5CAy'
      },
      merged_sha: '7081cc038ec7050fe4e25f8c0544420a01f43e79',
      workflow: {
        name: 'Terraform - env',
        id: 6262496892,
        html_url: 'https://github.com/DEFRA/tf-svc-infra/actions/runs/6262496892',
        created_at: '2023-09-21T13:39:14Z',
        updated_at: '2023-09-21T13:41:16Z',
        path: '.github/workflows/env-terraform.yml'
      }
    },
    'cdp-app-config': {
      status: 'raised',
      pr: {
        number: 104,
        sha: '05129eae0a11464d5c3a6bd3839b67a2e7f9c933',
        ref: 'add-ct-sso-test-2-config-1695303443430',
        html_url: 'https://github.com/DEFRA/cdp-app-config/pull/104',
        node_id: 'PR_kwDOJ1mq8M5a5CCZ'
      }
    }
  }

```

We record the original commit id (the `sha` field in the `pr` section) to tie the actions back to the original pull request.
However, when merging into main the head SHA gets changed, so we need to watch for the pull request merged event for the
original PR id and record the new sha as `merged_sha`.
This allows us to tie the workflow run (which runs off main, not the branch the PR was raised on) back to the original pull request
and the new service that triggered it.
