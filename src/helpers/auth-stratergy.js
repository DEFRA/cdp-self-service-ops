import { appConfig } from '~/src/config'

const authStrategy = {
  strategy: 'azure-oidc',
  access: {
    scope: [appConfig.get('azureAdminGroupId')]
  }
}

export { authStrategy }
