const serviceToSecretsMap = {
  'cdp-portal-frontend': {
    'infra-dev': {
      SESSION_COOKIE_PASSWORD:
        'cdp/services/cdp-portal-frontend:SESSION_COOKIE_PASSWORD',
      AZURE_CLIENT_SECRET:
        'cdp/services/cdp-portal-frontend:AZURE_CLIENT_SECRET',
      REDIS_PASSWORD: 'cdp/services/cdp-portal-frontend:REDIS_PASSWORD'
    },
    management: {
      SESSION_COOKIE_PASSWORD:
        'cdp/services/cdp-portal-frontend:SESSION_COOKIE_PASSWORD',
      AZURE_CLIENT_SECRET:
        'cdp/services/cdp-portal-frontend:AZURE_CLIENT_SECRET',
      REDIS_PASSWORD: 'cdp/services/cdp-portal-frontend:REDIS_PASSWORD'
    }
  },
  'cdp-portal-backend': {
    'infra-dev': {
      Github__AppKey:
        'cdp/services/cdp-portal-backend:DEFRA_GITHUB_API_AUTH_APP_PRIVATE_KEY'
    },
    management: {
      Github__AppKey:
        'cdp/services/cdp-portal-backend:DEFRA_GITHUB_API_AUTH_APP_PRIVATE_KEY'
    }
  },
  'cdp-self-service-ops': {
    'infra-dev': {
      GITHUB_API_AUTH_APP_PRIVATE_KEY:
        'cdp/services/cdp-self-service-ops:DEFRA_GITHUB_API_AUTH_APP_PRIVATE_KEY'
    },
    management: {
      GITHUB_API_AUTH_APP_PRIVATE_KEY:
        'cdp/services/cdp-self-service-ops:DEFRA_GITHUB_API_AUTH_APP_PRIVATE_KEY'
    }
  },
  'cdp-user-service-backend': {
    'infra-dev': {
      AZURE_CLIENT_SECRET:
        'cdp/services/cdp-user-service-backend:AZURE_CLIENT_SECRET',
      GITHUB_APP_PRIVATE_KEY:
        'cdp/services/cdp-user-service-backend:DEFRA_GITHUB_APP_PRIVATE_KEY'
    },
    management: {
      AZURE_CLIENT_SECRET:
        'cdp/services/cdp-user-service-backend:AZURE_CLIENT_SECRET',
      GITHUB_APP_PRIVATE_KEY:
        'cdp/services/cdp-user-service-backend:DEFRA_GITHUB_APP_PRIVATE_KEY'
    }
  },
  'cdp-defra-id-demo': {
    dev: {
      SESSION_COOKIE_PASSWORD:
        'cdp/services/cdp-defra-id-demo:SESSION_COOKIE_PASSWORD',
      REDIS_PASSWORD: 'cdp/services/cdp-defra-id-demo:REDIS_PASSWORD',
      DEFRA_ID_CLIENT_SECRET:
        'cdp/services/cdp-defra-id-demo:DEFRA_ID_CLIENT_SECRET'
    },
    test: {
      SESSION_COOKIE_PASSWORD:
        'cdp/services/cdp-defra-id-demo:SESSION_COOKIE_PASSWORD',
      REDIS_PASSWORD: 'cdp/services/cdp-defra-id-demo:REDIS_PASSWORD',
      DEFRA_ID_CLIENT_SECRET:
        'cdp/services/cdp-defra-id-demo:DEFRA_ID_CLIENT_SECRET'
    }
  }
}

export { serviceToSecretsMap }
