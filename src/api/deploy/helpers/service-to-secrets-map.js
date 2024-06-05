function redisSecrets(serviceName) {
  return {
    REDIS_USERNAME: `cdp/services/${serviceName}:REDIS_USERNAME`,
    REDIS_PASSWORD: `cdp/services/${serviceName}:REDIS_PASSWORD`,
    REDIS_KEY_PREFIX: `cdp/services/${serviceName}:REDIS_KEY_PREFIX`
  }
}

function squidSecrets(serviceName) {
  return {
    SQUID_USERNAME: `cdp/services/${serviceName}:SQUID_USERNAME`,
    SQUID_PASSWORD: `cdp/services/${serviceName}:SQUID_PASSWORD`
  }
}

const serviceToSecretsMap = {
  'cdp-portal-frontend': {
    'infra-dev': {
      SESSION_COOKIE_PASSWORD:
        'cdp/services/cdp-portal-frontend:SESSION_COOKIE_PASSWORD',
      AZURE_CLIENT_SECRET:
        'cdp/services/cdp-portal-frontend:AZURE_CLIENT_SECRET',
      ...redisSecrets('cdp-portal-frontend')
    },
    management: {
      SESSION_COOKIE_PASSWORD:
        'cdp/services/cdp-portal-frontend:SESSION_COOKIE_PASSWORD',
      AZURE_CLIENT_SECRET:
        'cdp/services/cdp-portal-frontend:AZURE_CLIENT_SECRET',
      ...redisSecrets('cdp-portal-frontend')
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
      ...redisSecrets('cdp-defra-id-demo'),
      DEFRA_ID_CLIENT_SECRET:
        'cdp/services/cdp-defra-id-demo:DEFRA_ID_CLIENT_SECRET'
    },
    test: {
      SESSION_COOKIE_PASSWORD:
        'cdp/services/cdp-defra-id-demo:SESSION_COOKIE_PASSWORD',
      ...redisSecrets('cdp-defra-id-demo'),
      DEFRA_ID_CLIENT_SECRET:
        'cdp/services/cdp-defra-id-demo:DEFRA_ID_CLIENT_SECRET'
    }
  },
  'forms-designer': {
    dev: {
      SESSION_COOKIE_PASSWORD:
        'cdp/services/forms-designer:SESSION_COOKIE_PASSWORD',
      ...redisSecrets('forms-designer'),
      ...squidSecrets('forms-designer'),
      AZURE_CLIENT_ID: 'cdp/services/forms-designer:AZURE_CLIENT_ID',
      AZURE_CLIENT_SECRET: 'cdp/services/forms-designer:AZURE_CLIENT_SECRET'
    },
    test: {
      SESSION_COOKIE_PASSWORD:
        'cdp/services/forms-designer:SESSION_COOKIE_PASSWORD',
      ...redisSecrets('forms-designer'),
      ...squidSecrets('forms-designer'),
      AZURE_CLIENT_ID: 'cdp/services/forms-designer:AZURE_CLIENT_ID',
      AZURE_CLIENT_SECRET: 'cdp/services/forms-designer:AZURE_CLIENT_SECRET'
    },
    'perf-test': {
      ...redisSecrets('forms-designer'),
      ...squidSecrets('forms-designer'),
      AZURE_CLIENT_ID: 'cdp/services/forms-designer:AZURE_CLIENT_ID',
      AZURE_CLIENT_SECRET: 'cdp/services/forms-designer:AZURE_CLIENT_SECRET'
    },
    prod: {
      ...redisSecrets('forms-designer'),
      ...squidSecrets('forms-designer')
    }
  },
  'forms-runner': {
    dev: {
      ...redisSecrets('forms-runner'),
      ...squidSecrets('forms-runner')
    },
    test: {
      ...redisSecrets('forms-runner'),
      ...squidSecrets('forms-runner')
    },
    'perf-test': {
      ...redisSecrets('forms-runner'),
      ...squidSecrets('forms-runner')
    },
    prod: {
      ...redisSecrets('forms-runner'),
      ...squidSecrets('forms-runner')
    }
  },
  'forms-manager': {
    dev: {
      ...squidSecrets('forms-manager')
    },
    test: {
      ...squidSecrets('forms-manager')
    },
    'perf-test': {
      ...squidSecrets('forms-manager')
    },
    prod: {
      ...squidSecrets('forms-manager')
    }
  },
  'cdp-example-node-frontend': {
    dev: {
      ...squidSecrets('cdp-example-node-frontend'),
      ...redisSecrets('cdp-example-node-frontend')
    },
    test: {
      ...squidSecrets('cdp-example-node-frontend'),
      ...redisSecrets('cdp-example-node-frontend')
    },
    'perf-test': {
      ...squidSecrets('cdp-example-node-frontend'),
      ...redisSecrets('cdp-example-node-frontend')
    },
    prod: {
      ...squidSecrets('cdp-example-node-frontend'),
      ...redisSecrets('cdp-example-node-frontend')
    },
    'infra-dev': {
      ...squidSecrets('cdp-example-node-frontend'),
      ...redisSecrets('cdp-example-node-frontend')
    }
  },
  'marine-licensing-backend-demo': {
    dev: {
      ENTRA_CLIENT_SECRET:
        'cdp/services/marine-licensing-backend-demo:ENTRA_CLIENT_SECRET'
    },
    test: {
      ENTRA_CLIENT_SECRET:
        'cdp/services/marine-licensing-backend-demo:ENTRA_CLIENT_SECRET'
    },
    'perf-test': {
      ENTRA_CLIENT_SECRET:
        'cdp/services/marine-licensing-backend-demo:ENTRA_CLIENT_SECRET'
    },
    prod: {
      ENTRA_CLIENT_SECRET:
        'cdp/services/marine-licensing-backend-demo:ENTRA_CLIENT_SECRET'
    }
  },
  'cdp-uploader': {
    dev: {
      ...redisSecrets('cdp-uploader')
    },
    test: {
      ...redisSecrets('cdp-uploader')
    },
    'perf-test': {
      ...redisSecrets('cdp-uploader')
    },
    prod: {
      ...redisSecrets('cdp-uploader')
    },
    'infra-dev': {
      ...redisSecrets('cdp-uploader')
    }
  },
  'aqie-front-end': {
    dev: {
      OS_PLACES_API_KEY: 'cdp/services/aqie-front-end:OS_PLACES_API_KEY',
      DAQIE_PASSWORD: 'cdp/services/aqie-front-end:DAQIE_PASSWORD',
      ...redisSecrets('aqie-front-end'),
      ...squidSecrets('aqie-front-end')
    },
    test: {
      OS_PLACES_API_KEY: 'cdp/services/aqie-front-end:OS_PLACES_API_KEY',
      DAQIE_PASSWORD: 'cdp/services/aqie-front-end:DAQIE_PASSWORD',
      ...redisSecrets('aqie-front-end'),
      ...squidSecrets('aqie-front-end')
    },
    'pref-test': {
      OS_PLACES_API_KEY: 'cdp/services/aqie-front-end:OS_PLACES_API_KEY',
      DAQIE_PASSWORD: 'cdp/services/aqie-front-end:DAQIE_PASSWORD',
      ...redisSecrets('aqie-front-end'),
      ...squidSecrets('aqie-front-end')
    },
    prod: {
      OS_PLACES_API_KEY: 'cdp/services/aqie-front-end:OS_PLACES_API_KEY',
      DAQIE_PASSWORD: 'cdp/services/aqie-front-end:DAQIE_PASSWORD',
      ...redisSecrets('aqie-front-end'),
      ...squidSecrets('aqie-front-end')
    }
  },
  'aqie-back-end': {
    dev: {
      ...squidSecrets('aqie-back-end')
    },
    test: {
      ...squidSecrets('aqie-back-end')
    },
    'pref-test': {
      ...squidSecrets('aqie-back-end')
    },
    prod: {
      ...squidSecrets('aqie-back-end')
    }
  }
}

export { serviceToSecretsMap }
