import { appConfig } from '~/src/config'

let authStrategy = {
  strategy: 'azure-oidc',
  access: {
    scope: [appConfig.get('azureAdminGroupId')]
  }
}

if (!appConfig.get('authEnabled')) {
  authStrategy = null
}

export { authStrategy }
