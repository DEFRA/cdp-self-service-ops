import { getContent } from '../../../helpers/github/get-content.js'
import { statusCodes } from '../../../constants/status-codes.js'

export async function getExistingDeployment(owner, repo, filePath) {
  try {
    const data = await getContent(owner, repo, filePath)
    return JSON.parse(data)
  } catch (error) {
    if (error.status === statusCodes.notFound) {
      return null
    }
    throw error
  }
}
