import fetch from 'node-fetch'
import { appConfig } from '~/src/config'

async function fetchGithubFileRaw(fileName) {
  const org = appConfig.get('gitHubOrg')
  const repo = appConfig.get('githubRepoDeployments')
  const githubToken = appConfig.get('gitHubToken')
  const githubEndpoint = `https://raw.githubusercontent.com/${org}/${repo}/main/${fileName}`

  const response = await fetch(githubEndpoint, {
    method: 'get',
    headers: {
      Authorization: 'token ' + githubToken,
      'Content-Type': 'application/json'
    }
  })

  if (response.status === 200) {
    return await response.json()
  }

  const err = await response.text()
  throw new Error(`Failed to fetch ${fileName}: ${response.status}: ${err}`)
}

export { fetchGithubFileRaw }
