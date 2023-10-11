import { config } from '~/src/config'

const authStrategy = {
  strategy: 'azure-oidc',
  access: {
    scope: [config.get('azureAdminGroupId')]
  }
}

export { authStrategy }
