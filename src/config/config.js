import convict from 'convict'
import { cwd } from 'node:process'
import { environments } from '@defra/cdp-validation-kit'

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'
const isDevelopment = process.env.NODE_ENV === 'development'

convict.addFormat({
  name: 'environment-array',
  validate: function (values) {
    const envs = Object.values(environments)
    const validEnvs = values.every((value) => envs.includes(value))
    if (!validEnvs) {
      throw new Error(
        `DEPLOY_FROM_FILE_ENVIRONMENTS environment variable contained unknown environments`
      )
    }
  },
  coerce: function (val) {
    return val.split(',')
  }
})

const config = convict({
  service: {
    name: {
      doc: 'Api Service Name',
      format: String,
      default: 'CDP Self-Service Ops'
    },
    version: {
      doc: 'The service version, this variable is injected into your docker container in CDP environments',
      format: String,
      nullable: true,
      default: null,
      env: 'SERVICE_VERSION'
    },
    environment: {
      doc: 'The environment the app is running in',
      format: String,
      nullable: true,
      default: null,
      env: 'ENVIRONMENT'
    }
  },
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  environment: {
    doc: 'The environment the application is running in',
    format: String,
    default: 'local',
    env: 'ENVIRONMENT'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3009,
    env: 'PORT'
  },
  log: {
    enabled: {
      doc: 'Is logging enabled',
      format: Boolean,
      default: !isTest,
      env: 'LOG_ENABLED'
    },
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: isProduction ? 'info' : 'debug',
      env: 'LOG_LEVEL'
    },
    format: {
      doc: 'Format to output logs in.',
      format: ['ecs', 'pino-pretty'],
      default: isProduction ? 'ecs' : 'pino-pretty',
      env: 'LOG_FORMAT'
    },
    redact: {
      doc: 'Log paths to redact',
      format: Array,
      default: isProduction
        ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
        : ['req', 'res', 'responseTime']
    }
  },
  root: {
    doc: 'Project root',
    format: String,
    default: cwd()
  },
  awsRegion: {
    doc: 'AWS region',
    format: String,
    default: 'eu-west-2',
    env: 'AWS_REGION'
  },
  sqsEndpoint: {
    doc: 'AWS SQS endpoint',
    format: String,
    default: 'http://127.0.0.1:4566',
    env: 'SQS_ENDPOINT'
  },
  snsEndpoint: {
    doc: 'AWS SNS endpoint',
    format: String,
    default: 'http://127.0.0.1:4566',
    env: 'SNS_ENDPOINT'
  },
  oidc: {
    wellKnownConfigurationUrl: {
      doc: 'OIDC .well-known configuration URL',
      format: String,
      env: 'OIDC_WELL_KNOWN_CONFIGURATION_URL',
      default:
        'http://cdp.127.0.0.1.sslip.io:3939/6f504113-6b64-43f2-ade9-242e05780007/v2.0/.well-known/openid-configuration'
    },
    audience: {
      doc: 'OIDC Audience for verification',
      format: String,
      env: 'OIDC_AUDIENCE',
      default: '26372ac9-d8f0-4da9-a17e-938eb3161d8e'
    }
  },
  isProduction: {
    doc: 'Is this application running in the production environment',
    format: Boolean,
    default: isProduction
  },
  isDevelopment: {
    doc: 'Is this application running in the development environment',
    format: Boolean,
    default: isDevelopment
  },
  isTest: {
    doc: 'Is this application running in the test environment',
    format: Boolean,
    default: isTest
  },
  mongo: {
    mongoUrl: {
      doc: 'URL for mongodb',
      format: String,
      default: 'mongodb://127.0.0.1:27017/?replicaSet=rs0',
      env: 'MONGO_URI'
    },
    databaseName: {
      doc: 'database for mongodb',
      format: String,
      default: 'cdp-self-service-ops',
      env: 'MONGO_DATABASE'
    },
    mongoOptions: {
      retryWrites: {
        doc: 'enable mongo write retries',
        format: Boolean,
        default: false
      },
      readPreference: {
        doc: 'mongo read preference',
        format: [
          'primary',
          'primaryPreferred',
          'secondary',
          'secondaryPreferred',
          'nearest'
        ],
        default: 'primary'
      }
    }
  },
  snsDeployTopicArn: {
    doc: 'SNS Deploy Topic ARN',
    format: String,
    default: 'arn:aws:sns:eu-west-2:000000000000:deploy-topic',
    env: 'SNS_DEPLOY_TOPIC_ARN'
  },
  snsRunTestTopicArn: {
    doc: 'SNS Run Test Topic ARN',
    format: String,
    default: 'arn:aws:sns:eu-west-2:000000000000:run-test-topic',
    env: 'SNS_RUN_TEST_TOPIC_ARN'
  },
  snsStopTestTopicArn: {
    doc: 'SNS Run Test Topic ARN',
    format: String,
    default: 'arn:aws:sns:eu-west-2:000000000000:stop-test-topic',
    env: 'SNS_STOP_TEST_TOPIC_ARN'
  },
  snsSecretsManagementTopicArn: {
    doc: 'SNS Secrets Management Topic ARN',
    format: String,
    default: 'arn:aws:sns:eu-west-2:000000000000:secret_management',
    env: 'SNS_SECRETS_MANAGEMENT_TOPIC_ARN'
  },
  snsRunTerminalTopicArn: {
    doc: 'SNS Run Terminal Topic ARN',
    format: String,
    default: 'arn:aws:sns:eu-west-2:000000000000:run-webshell-topic',
    env: 'SNS_RUN_WEBSHELL_TOPIC_ARN'
  },
  snsRunDatabaseMigrationTopicArn: {
    doc: 'SNS Run Database Migrations ARN',
    format: String,
    default: 'arn:aws:sns:eu-west-2:000000000000:run-migrations-topic',
    env: 'SNS_RUN_DATABASE_MIGRATION_TOPIC_ARN'
  },
  platformGlobalSecretKeys: {
    doc: 'Global Platform level secret keys. These keys are not to be overridden',
    format: Array,
    default: [
      'SQUID_USERNAME,SQUID_PASSWORD,REDIS_USERNAME,REDIS_PASSWORD,REDIS_KEY_PREFIX,CDP_HTTP_PROXY,CDP_HTTPS_PROXY,HTTP_PROXY,HTTPS_PROXY'
    ],
    env: 'PLATFORM_GLOBAL_SECRET_KEYS'
  },
  sqsGitHubEvents: {
    queueUrl: {
      doc: 'URL of sqs queue providing gitHub events',
      format: String,
      default: 'github-events',
      env: 'SQS_GITHUB_QUEUE'
    },
    waitTimeSeconds: {
      doc: 'The duration for which the call will wait for a message to arrive in the queue before returning',
      format: Number,
      default: 10,
      env: 'SQS_GITHUB_WAIT_TIME_SECONDS'
    },
    visibilityTimeout: {
      doc: 'The duration (in seconds) that the received messages are hidden from subsequent retrieve requests after being retrieved by a ReceiveMessage request.',
      format: Number,
      default: 400,
      env: 'SQS_GITHUB_VISIBILITY_TIMEOUT'
    },
    pollingWaitTimeMs: {
      doc: 'The duration to wait before repolling the queue',
      format: Number,
      default: 0,
      env: 'SQS_GITHUB_POLLING_WAIT_TIME_MS'
    },
    enabled: {
      doc: 'Should the service listen for gitHub webhook events?',
      format: Boolean,
      default: false,
      env: 'SQS_GITHUB_ENABLED'
    }
  },
  userServiceBackendUrl: {
    doc: 'User Service Backend url',
    format: String,
    default: 'http://localhost:3001',
    env: 'USER_SERVICE_BACKEND_URL'
  },
  portalBackendUrl: {
    doc: 'Portal Backend url',
    format: String,
    default: 'http://localhost:5094',
    env: 'PORTAL_BACKEND_URL'
  },
  httpProxy: {
    doc: 'HTTP Proxy',
    format: String,
    default: '',
    env: 'HTTP_PROXY'
  },
  serviceInfraCreateEvent: {
    doc: 'Event for service infra create',
    format: String,
    default: 'service.infra.create',
    env: 'SERVICE_INFRA_CREATE_EVENT'
  },
  github: {
    app: {
      id: {
        doc: 'GitHub Api authentication App Id',
        format: String,
        env: 'GITHUB_APP_ID',
        default: '407916'
      },
      installationId: {
        doc: 'GitHub Api authentication App Installation Id',
        format: String,
        env: 'GITHUB_APP_INSTALLATION_ID',
        default: '43275761'
      },
      privateKey: {
        doc: 'GitHub Api authentication App Private Key. This key is a base64 encoded secret',
        format: '*',
        default: '',
        sensitive: true,
        env: 'GITHUB_API_AUTH_APP_PRIVATE_KEY'
      }
    },
    apiVersion: {
      doc: 'GitHub Api Version',
      format: String,
      default: '2022-11-28'
    },
    org: {
      doc: 'GitHub Organisation',
      format: String,
      default: 'DEFRA',
      env: 'GITHUB_ORG'
    },
    baseUrl: {
      doc: 'Override the gitHub base url for local testing',
      format: String,
      nullable: true,
      default: null,
      env: 'GITHUB_BASE_URL'
    },
    repos: {
      cdpAppConfig: {
        doc: 'GitHub repo for cdp-app-config',
        format: String,
        default: 'cdp-app-config',
        env: 'GITHUB_REPO_APP_CONFIG'
      },
      cdpNginxUpstreams: {
        doc: 'GitHub repo for cdp-nginx-upstreams',
        format: String,
        default: 'cdp-nginx-upstreams',
        env: 'GITHUB_REPO_NGINX_UPSTREAMS'
      },
      cdpTfSvcInfra: {
        doc: 'GitHub repo for cdp-tf-svc-infra',
        format: String,
        default: 'cdp-tf-svc-infra',
        env: 'GITHUB_REPO_TF_SVC_INFRA'
      },
      cdpGrafanaSvc: {
        doc: 'GitHub repo to create default dashboard config in',
        format: String,
        default: 'cdp-grafana-svc',
        env: 'GITHUB_REPO_DASHBOARDS'
      },
      cdpSquidProxy: {
        doc: 'GitHub repo to create default dashboard config in',
        format: String,
        default: 'cdp-squid-proxy',
        env: 'GITHUB_REPO_SQUID_PROXY'
      },
      createWorkflows: {
        doc: 'GitHub repository containing the create workflows',
        format: String,
        default: 'cdp-create-workflows',
        env: 'GITHUB_REPO_CREATE_WORKFLOWS'
      },
      appDeployments: {
        doc: 'Repository to store deployment state for services on CDP',
        format: String,
        default: 'cdp-app-deployments'
      },
      cdpWaf: {
        doc: 'Repository for CDP Web Application Firewall (WAF)',
        format: String,
        default: 'cdp-tf-waf'
      }
    }
  },
  tracing: {
    header: {
      doc: 'Which header to track',
      format: String,
      default: 'x-cdp-request-id',
      env: 'TRACING_HEADER'
    }
  },
  workflows: {
    createAppConfig: {
      doc: 'Github workflow to trigger when creating placeholder config',
      format: String,
      default: 'create-service.yml',
      env: 'WORKFLOWS_CREATE_APP_CONFIG'
    },
    createNginxUpstreams: {
      doc: 'Github workflow to trigger when creating nginx upstream config',
      format: String,
      default: 'create-service.yml',
      env: 'WORKFLOWS_CREATE_NGINX_UPSTREAMS'
    },
    createTenantService: {
      doc: 'Github workflow to trigger when creating tenant service infrastructure',
      format: String,
      default: 'create-service.yml',
      env: 'WORKFLOWS_CREATE_TENANT_SERVICE'
    },
    deleteEcrImages: {
      doc: 'Github workflow to trigger when deleting ECR images',
      format: String,
      default: 'remove-ecr.yml',
      env: 'WORKFLOWS_DELETE_ECR_IMAGES'
    },
    deleteDockerHubImages: {
      doc: 'Github workflow to trigger when deleting DockerHub images',
      format: String,
      default: 'remove-dockerhub.yml',
      env: 'WORKFLOWS_DELETE_DOCKERHUB_IMAGES'
    },
    removeAppConfig: {
      doc: 'Github workflow to trigger when removing placeholder config',
      format: String,
      default: 'remove-service.yml',
      env: 'WORKFLOWS_REMOVE_APP_CONFIG'
    },
    removeDeploymentFiles: {
      doc: 'Github workflow to trigger when removing deployment files',
      format: String,
      default: 'remove-service.yml',
      env: 'WORKFLOWS_REMOVE_DEPLOYMENT_FILES'
    },
    removeEcsService: {
      doc: 'Github workflow to trigger when removing ECS service',
      format: String,
      default: 'remove-ecs.yml',
      env: 'WORKFLOWS_REMOVE_ECS_SERVICE'
    },
    removeNginxUpstreams: {
      doc: 'Github workflow to trigger when removing nginx upstream config',
      format: String,
      default: 'remove-service.yml',
      env: 'WORKFLOWS_REMOVE_NGINX_UPSTREAMS'
    },
    removeTenantService: {
      doc: 'Github workflow to trigger when removing tenant service infrastructure',
      format: String,
      default: 'remove-service.yml',
      env: 'WORKFLOWS_CREATE_TENANT_SERVICE'
    },
    removeDashboard: {
      doc: 'Github workflow to trigger when removing dashboard',
      format: String,
      default: 'remove-service.yml',
      env: 'WORKFLOWS_REMOVE_DASHBOARDS'
    },
    removeSquidConfig: {
      doc: 'Name of workflow to trigger when removing squid config',
      format: String,
      default: 'remove-service.yml',
      env: 'WORKFLOWS_REMOVE_SQUID_CONFIG'
    },
    applyTenantService: {
      doc: 'Github workflow triggered by merges to cdp-tf-svc-infra. Used for recovering failed create runs.',
      format: String,
      default: 'apply.yml'
    },
    manualApplyTenantService: {
      doc: 'Github workflow for manually applying cdp-tf-svc-infra. Used for recovering failed create runs.',
      format: String,
      default: 'manual.yml'
    },
    createDashboard: {
      doc: 'Github workflow to trigger when creating dashboard',
      format: String,
      default: 'create-service.yml',
      env: 'WORKFLOWS_CREATE_DASHBOARDS'
    },
    createSquidConfig: {
      doc: 'Name of workflow to trigger when creating squid config',
      format: String,
      default: 'create-service.yml',
      env: 'WORKFLOWS_CREATE_SQUID_CONFIG'
    },
    createMicroService: {
      doc: 'Name of workflow to trigger when creating a microservice',
      format: String,
      default: 'create_microservice.yml',
      env: 'CREATE_MICROSERVICE_WORKFLOW'
    },
    createRepository: {
      doc: 'Name of workflow to trigger when creating a repository',
      format: String,
      default: 'create_repository.yml',
      env: 'CREATE_REPOSITORY_WORKFLOW'
    },
    createJourneyTestSuite: {
      doc: 'Name of workflow to trigger when creating a journey test suite',
      format: String,
      default: 'create_journey_test_suite.yml',
      env: 'CREATE_JOURNEY_TEST_SUITE_WORKFLOW'
    },
    createPerfTestSuite: {
      doc: 'Name of workflow to trigger when creating a perf test repository',
      format: String,
      default: 'create_perf_test_suite.yml',
      env: 'CREATE_PERF_TEST_SUITE_WORKFLOW'
    },
    archiveGithubRepoWorkflow: {
      doc: 'Name of workflow to trigger when archiving a GitHub repository',
      format: String,
      default: 'archive_repository.yml',
      env: 'ARCHIVE_GITHUB_REPOSITORY_WORKFLOW'
    },
    addShutterWorkflow: {
      doc: 'Name of workflow to trigger when enabling shuttering for a url',
      format: String,
      default: 'shuttering-add.yml',
      env: 'ADD_SHUTTER_URL_WORKFLOW'
    },
    removeShutterWorkflow: {
      doc: 'Name of workflow to trigger when removing shuttering for a url',
      format: String,
      default: 'shuttering-remove.yml',
      env: 'REMOVE_SHUTTER_URL_WORKFLOW'
    }
  },
  enableSecureContext: {
    doc: 'Enable Secure Context',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_SECURE_CONTEXT'
  },
  portalBackendSharedSecret: {
    doc: 'Shared secret for portal backend',
    format: String,
    default: '',
    env: 'PORTAL_BACKEND_SHARED_SECRET'
  }
})

config.validate({ allowed: 'strict' })

export { config }
