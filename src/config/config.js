import convict from 'convict'
import path from 'path'

import { version } from '~/package.json'
import { environments } from '~/src/config/environments'

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
  version: {
    doc: 'Api version',
    format: String,
    default: version
  },
  serviceName: {
    doc: 'Api Service Name',
    format: String,
    default: 'CDP Self-Service Ops'
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.normalize(path.join(__dirname, '..', '..'))
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
  oidcWellKnownConfigurationUrl: {
    doc: 'OIDC .well-known configuration URL',
    format: String,
    env: 'OIDC_WELL_KNOWN_CONFIGURATION_URL',
    default:
      'https://login.microsoftonline.com/6f504113-6b64-43f2-ade9-242e05780007/v2.0/.well-known/openid-configuration'
  },
  oidcAudience: {
    doc: 'OIDC Audience for verification',
    format: String,
    env: 'OIDC_AUDIENCE',
    default: '63983fc2-cfff-45bb-8ec2-959e21062b9a'
  },
  oidcAdminGroupId: {
    doc: 'OIDC Admin Group ID',
    format: String,
    env: 'OIDC_ADMIN_GROUP_ID',
    default: 'aabe63e7-87ef-4beb-a596-c810631fc474'
  },
  gitHubAppId: {
    doc: 'GitHub Api authentication App Id',
    format: String,
    env: 'GITHUB_APP_ID',
    default: '407916'
  },
  gitHubAppInstallationId: {
    doc: 'GitHub Api authentication App Installation Id',
    format: String,
    env: 'GITHUB_APP_INSTALLATION_ID',
    default: '43275761'
  },
  gitHubAppPrivateKey: {
    doc: 'GitHub Api authentication App Private Key. This key is a base64 encoded secret',
    format: '*',
    default: '',
    sensitive: true,
    env: 'GITHUB_API_AUTH_APP_PRIVATE_KEY'
  },
  gitHubOrg: {
    doc: 'GitHub Organisation',
    format: String,
    default: 'DEFRA',
    env: 'GITHUB_ORG'
  },
  gitHubApiVersion: {
    doc: 'GitHub Api Version',
    format: String,
    default: '2022-11-28'
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: isProduction
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: isDevelopment
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: isTest
  },
  logLevel: {
    doc: 'Logging level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: isDevelopment ? 'debug' : 'info',
    env: 'LOG_LEVEL'
  },
  mongoUri: {
    doc: 'URI for mongodb',
    format: String,
    default: 'mongodb://127.0.0.1:27017/',
    env: 'MONGO_URI'
  },
  mongoDatabase: {
    doc: 'database for mongodb',
    format: String,
    default: 'cdp-self-service-ops',
    env: 'MONGO_DATABASE'
  },
  snsDeployTopicArn: {
    doc: 'SNS Deploy Topic ARN',
    format: String,
    default: 'arn:aws:sns:eu-west-2:000000000000:deploy-topic',
    env: 'SNS_DEPLOY_TOPIC_ARN'
  },
  snsCdpNotificationArn: {
    doc: 'SNS CDP Notification Topic ARN',
    format: String,
    default: 'arn:aws:sns:eu-west-2:000000000000:cdp-notification',
    env: 'SNS_CDP_NOTIFICATION_TOPIC_ARN'
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
  snsRunWebShellTopicArn: {
    doc: 'SNS Run WebShell Topic ARN',
    format: String,
    default: 'arn:aws:sns:eu-west-2:000000000000:run-webshell-topic',
    env: 'SNS_RUN_WEBSHELL_TOPIC_ARN'
  },
  sendFailedActionNotification: {
    doc: 'Send notification for failed GitHub Action',
    format: Boolean,
    default: true,
    env: 'SEND_FAILED_ACTION_NOTIFICATION'
  },
  platformGlobalSecretKeys: {
    doc: 'Global Platform level secret keys. These keys are not to be overridden',
    format: Array,
    default:
      'SQUID_USERNAME,SQUID_PASSWORD,REDIS_USERNAME,REDIS_PASSWORD,REDIS_KEY_PREFIX,CDP_HTTP_PROXY,CDP_HTTPS_PROXY,HTTP_PROXY,HTTPS_PROXY',
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
      default: true,
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
    env: 'CDP_HTTP_PROXY'
  },
  httpsProxy: {
    doc: 'HTTPS Proxy',
    format: String,
    default: '',
    env: 'CDP_HTTPS_PROXY'
  },
  serviceInfraCreateEvent: {
    doc: 'Event for service infra create',
    format: String,
    default: 'service.infra.create',
    env: 'SERVICE_INFRA_CREATE_EVENT'
  },
  github: {
    org: {
      doc: 'GitHub Organisation',
      format: String,
      default: 'DEFRA',
      env: 'GITHUB_ORG'
    },
    baseUrl: {
      doc: 'Override the gitHub base url for local testing',
      format: '*',
      env: 'GITHUB_BASE_URL',
      default: null
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
      }
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
      doc: 'Github workflow to trigger when tenant service infrastructure',
      format: String,
      default: 'create-service.yml',
      env: 'WORKFLOWS_CREATE_TENANT_SERVICE'
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
    createJourneyTest: {
      doc: 'Name of workflow to trigger when creating a repository',
      format: String,
      default: 'create_journey_tests.yml',
      env: 'CREATE_JOURNEY_TESTS_WORKFLOW'
    },
    createEnvTestSuite: {
      doc: 'Name of workflow to trigger when creating a repository',
      format: String,
      default: 'create_env_test_suite.yml',
      env: 'CREATE_ENV_TEST_SUITE_WORKFLOW'
    },
    createPerfTestSuite: {
      doc: 'Name of workflow to trigger when creating a perf test repository',
      format: String,
      default: 'create_perf_test_suite.yml',
      env: 'CREATE_PERF_TEST_SUITE_WORKFLOW'
    },
    createSmokeTestSuite: {
      doc: 'Name of workflow to trigger when creating a perf test repository',
      format: String,
      default: 'create_smoke_test_suite.yml',
      env: 'CREATE_SMOKE_TEST_SUITE_WORKFLOW'
    }
  },
  deployFromFileEnvironments: {
    doc: 'list of environments where we should deploy from file',
    format: 'environment-array',
    default: [],
    env: 'DEPLOY_FROM_FILE_ENVIRONMENTS'
  },
  enableSecureContext: {
    doc: 'Enable Secure Context',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_SECURE_CONTEXT'
  },
  platformAlertSlackChannel: {
    doc: 'Slack Channel for alerts',
    format: String,
    default: 'cdp-platform-alerts',
    env: 'PLATFORM_ALERT_SLACK_CHANNEL'
  }
})

config.validate({ allowed: 'strict' })

export { config }
