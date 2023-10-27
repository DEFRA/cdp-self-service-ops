import { octokit } from '~/src/helpers/oktokit'
import { createLogger } from '~/src/helpers/logging/logger'

async function createServiceFromTemplate(
  org,
  repoName,
  teamName,
  templateRepo,
  templateName
) {
  const logger = createLogger()

  // TODO: put these as arguments
  // const templateName = 'CDP C# ASP.NET Backend Template'
  // const repoName = 'template-repo-test-dotnet-backend'
  // const teamName = 'cdp-platform'

  logger.info(
    `Creating ${org}/${repoName} from template ${org}/${templateRepo}`
  )
  const repoResult = await createRepoUsingTemplate(org, templateRepo, repoName)
  logger.info(`createService ${repoName} - waiting on repo`)
  await waitForRepo(org, repoName)
  logger.info(`createService ${repoName} - disabling workflows`)
  await disableWorkflows(org, repoName)
  logger.info(`createService ${repoName} - canceling workflows`)
  await cancelWorkflows(org, repoName)
  logger.info(`createService ${repoName} - configuring repo`)
  await configureRepo(org, repoName, teamName)
  logger.info(`createService ${repoName} - dynamic templating`)
  await dynamicTemplateRepo(org, repoName, templateRepo, templateName)
  logger.info(`createService ${repoName} - enabling workflows`)
  await enableWorkflows(org, repoName)
  logger.info(`Successfully created service ${org}/${repoName}`)

  return repoResult
}

async function createRepoUsingTemplate(org, templateRepo, repoName) {
  try {
    return await octokit.rest.repos.createUsingTemplate({
      template_owner: org,
      template_repo: templateRepo,
      owner: org,
      name: repoName,
      description: `Git repository for ${repoName}`
    })
  } catch (error) {
    const newError = new Error(
      `Failed while creating ${org}/${repoName} from ${org}/${templateRepo}`
    )
    newError.stack = error
    throw newError
  }
}

async function disableWorkflows(org, repoName) {
  const logger = createLogger()
  const maxAttempts = 10
  const delayMs = 2000
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await octokit.rest.actions.disableWorkflow({
        owner: org,
        repo: repoName,
        workflow_id: 'publish.yml'
      })
      await octokit.rest.actions.disableWorkflow({
        owner: org,
        repo: repoName,
        workflow_id: 'check-pull-request.yml'
      })
      return
    } catch (error) {
      logger.info(
        `Workflows not ready, attempt ${attempt}/${maxAttempts}. Waiting ${
          delayMs / 1000
        } seconds...`
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  throw new Error(`Failed while disabling actions for ${org}/${repoName}`)
}

async function cancelWorkflows(org, repoName) {
  const maxAttempts = 10
  const delayMs = 2000
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const runs = await octokit.rest.actions.listWorkflowRuns({
        owner: org,
        repo: repoName,
        workflow_id: 'publish.yml'
      })
      await octokit.rest.actions.cancelWorkflowRun({
        owner: org,
        repo: repoName,
        run_id: runs.data.workflow_runs[0].id
      })
      return
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

async function enableWorkflows(org, repoName) {
  try {
    await octokit.rest.actions.enableWorkflow({
      owner: org,
      repo: repoName,
      workflow_id: 'publish.yml'
    })
    await octokit.rest.actions.enableWorkflow({
      owner: org,
      repo: repoName,
      workflow_id: 'check-pull-request.yml'
    })
  } catch (error) {
    const newError = new Error(
      `Failed while enabling actions for ${org}/${repoName}`
    )
    newError.stack = error
    throw newError
  }
}

async function configureRepo(org, repoName, teamName) {
  try {
    // adding team permissions
    await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
      org,
      team_slug: teamName,
      owner: org,
      repo: repoName,
      permission: 'maintain'
    })

    // adding branch protection
    const branchInfo = await octokit.rest.repos.getBranch({
      owner: org,
      repo: repoName,
      branch: 'main'
    })

    await octokit.rest.repos.updateBranchProtection({
      owner: org,
      repo: repoName,
      branch: 'main',
      required_status_checks: branchInfo.data?.required_status_checks ?? null,
      enforce_admins: branchInfo.data?.enforce_admins ?? null,
      required_pull_request_reviews:
        branchInfo.data?.required_pull_request_reviews ?? null,
      restrictions: branchInfo.data?.restrictions ?? null,
      allow_deletions: true
    })
  } catch (error) {
    const newError = new Error(`Failed while configuring ${org}/${repoName}`)
    newError.stack = error
    throw newError
  }
}

async function waitForRepo(owner, repo) {
  const logger = createLogger()
  const maxAttempts = 10
  const delayMs = 1000

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await octokit.rest.repos.getContent({ owner, repo, path: '' })
      return
    } catch (error) {
      if (error.status === 404) {
        logger.info(
          `Repository ${owner}/${repo} not ready, attempt ${attempt}/${maxAttempts}. Waiting ${
            delayMs / 1000
          } seconds...`
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      } else {
        const newError = new Error(
          `Timed-out while waiting for ${owner}/${repo} creation`
        )
        newError.stack = error
        throw newError
      }
    }
  }
  throw new Error(
    `Repository ${owner}/${repo} not accessible after ${maxAttempts} attempts.`
  )
}

async function dynamicTemplateRepo(org, repoName, templateRepo, templateName) {
  try {
    // get the sha for head
    const { data: headRef } = await octokit.rest.git.getRef({
      owner: org,
      repo: repoName,
      ref: 'heads/main'
    })

    // create a template branch
    await octokit.rest.git.createRef({
      owner: org,
      repo: repoName,
      ref: 'refs/heads/template',
      sha: headRef.object.sha
    })

    // get file tree
    const { data: tree } = await octokit.rest.git.getTree({
      owner: org,
      repo: repoName,
      tree_sha: 'HEAD',
      recursive: 'true'
    })

    const repoNamePascalCase = kebabCaseToPascalCase(repoName)
    const templateRepoPascalCase = kebabCaseToPascalCase(templateRepo)
    const dotnetPrefix = 'Backend.Api'

    // search and replace
    for (const file of tree.tree) {
      if (file.type === 'blob') {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner: org,
          repo: repoName,
          path: file.path
        })

        const fileContent = Buffer.from(fileData.content, 'base64').toString(
          'utf-8'
        )

        let updatedFilePath = file.path.replaceAll(templateRepo, repoName)
        let updatedContent = fileContent
          .replaceAll(templateRepo, repoName)
          .replaceAll(templateName, repoName)

        if (templateRepo.toLowerCase().includes('dotnet')) {
          updatedFilePath = updatedFilePath
            .replaceAll(dotnetPrefix, repoNamePascalCase)
            .replaceAll(templateRepoPascalCase, repoNamePascalCase)

          updatedContent = updatedContent
            .replaceAll(dotnetPrefix, repoNamePascalCase)
            .replaceAll(templateRepoPascalCase, repoNamePascalCase)
        }

        if (fileContent !== updatedContent || file.path !== updatedFilePath) {
          await octokit.rest.repos.createOrUpdateFileContents({
            owner: org,
            repo: repoName,
            path: updatedFilePath,
            message: `Update ${updatedFilePath}`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: fileData.sha,
            branch: 'template'
          })
          if (file.path !== updatedFilePath) {
            await octokit.rest.repos.deleteFile({
              owner: org,
              repo: repoName,
              path: file.path,
              message: `Delete ${file.path}`,
              sha: fileData.sha,
              branch: 'template'
            })
          }
        }
      }
    }

    // raise a PR
    const {
      data: { number: prNum }
    } = await octokit.rest.pulls.create({
      owner: org,
      repo: repoName,
      title: 'Template PR',
      head: 'refs/heads/template',
      base: 'main'
    })

    // merge the PR squashing all commits
    await octokit.rest.pulls.merge({
      owner: org,
      repo: repoName,
      pull_number: prNum,
      commit_title: 'Templating',
      commit_message: '',
      merge_method: 'squash'
    })

    // try deleting template branch
    try {
      await octokit.rest.git.deleteRef({
        owner: org,
        repo: repoName,
        ref: 'heads/template'
      })
    } catch (error) {
      if (error.status === 404) {
        return Promise.resolve()
      }
      throw error
    }
  } catch (error) {
    const newError = new Error(`Failed while templating ${org}/${repoName}`)
    newError.stack = error
    throw newError
  }
}

function kebabCaseToPascalCase(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

export { createServiceFromTemplate }
