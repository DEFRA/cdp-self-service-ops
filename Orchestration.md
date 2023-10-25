# Orchestration

Create a service requires a number of action to be done in a specific order.
The majority of these are managed by creating github pull requests, merging/aut-merging them
and waiting for the workflow triggered by the commit to main to complete before starting the next step.

# Order of execution

- Validate create-a-service request
- Raise PR against `tf-svc-infra` which:
  - adds repo to github oidc list, allowing the repos build action to work
  - adds repo the tenants.json for each environment, creating role, ECR repo, mongo/redis dbs etc
- Enables auto-merge on `tf-svc-infra`
- Raises (but does not auto-merge) pr for `cdp-app-config`
- Raises (but does not auto-merge) pr for `cdp-nginx-upstreams`
- Waits for message from github saying the PR for `tf-svc-infra` has been merged (recording the head commit SHA)
- Waits for message from github saying the workflow for `tf-svc-infra` has run on main and completed (using the commit SHA from above to identify it)
- Raises pr for `tf-svc`
- Triggers auto-merge on:
  - `cdp-app-config`
  - `tf-svc`
  - `cdp-nginx-upstream`
- Triggers creation of the github repo and commits the template via `cdp-boilerplate` workflow
- Newly created and templated repo triggers the first build
- ECR event is sent to portal backend recording the presence of a new service

## Why we need the ordering

The ECR repo must exist before the new repo has its template applied, so the first build is able to publish

The tf-svc pull request creates the service definition, but requires a role created in the `tf-svc-infra` stage.

`cdp-app-config` and `cdp-nginx-upstream` Arent required for the initial creation, but are required for the first deployment.
Also if the `tf-svc-infra` stage fails, there's no reason to commit these since they'd only have to be cleaned up etc.

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
    'tf-svc': {
      status: 'raised',
      pr: {
        number: 540,
        sha: 'fb1cb158d305cca536352f9b8a5732eab51d50e9',
        ref: 'deploy-ct-sso-test-2-0.1.0-1695303447036',
        html_url: 'https://github.com/DEFRA/tf-svc/pull/540',
        node_id: 'PR_kwDOI7fMPc5a5CD7'
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
