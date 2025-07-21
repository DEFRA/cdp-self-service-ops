import { getContent } from '../../../helpers/github/get-content.js'

export async function getExistingDeployment(owner, repo, filePath) {
  try {
    const data = await getContent(owner, repo, filePath)
    return JSON.parse(data)
  } catch (error) {
    if (error.status === 404) {
      return null
    }
    throw error
  }
}
