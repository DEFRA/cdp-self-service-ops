import convict from 'convict'
import path from 'path'

import { version } from '~/package.json'

const appConfig = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
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
  appPathPrefix: {
    doc: 'Application url path prefix this is needed only until we have host based routing',
    format: String,
    default: '/cdp-self-service-ops',
    env: 'APP_PATH_PREFIX'
  },
  azureTenantId: {
    doc: 'Azure Active Directory Tenant ID',
    format: String,
    env: 'AZURE_TENANT_ID',
    default: '6f504113-6b64-43f2-ade9-242e05780007'
  },
  azureSSOClientId: {
    doc: 'Azure App SSO Client ID',
    format: String,
    env: 'AZURE_SSO_CLIENT_ID',
    default: '63983fc2-cfff-45bb-8ec2-959e21062b9a'
  },
  azureAdminGroupId: {
    doc: 'Azure Active Directory Admin Group',
    format: String,
    env: 'AZURE_ADMIN_GROUP_ID',
    default: 'aabe63e7-87ef-4beb-a596-c810631fc474'
  },
  gitHubAppId: {
    doc: 'GitHub Api authentication App Id',
    format: String,
    default: '344866'
  },
  gitHubAppInstallationId: {
    doc: 'GitHub Api authentication App Installation Id',
    format: String,
    default: '38398116'
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
    default: 'defra-cdp-sandpit',
    env: 'GITHUB_ORG'
  },
  gitHubApiVersion: {
    doc: 'GitHub Api Version',
    format: String,
    default: '2022-11-28'
  },
  githubRepoTfServiceInfra: {
    doc: 'Terraform GitHub Service Infrastructure repository',
    format: String,
    default: 'tf-svc-infra'
  },
  githubRepoTfService: {
    doc: 'Terraform GitHub Service repository',
    format: String,
    default: 'tf-svc'
  },
  githubRepoServicePermissions: {
    doc: 'github repo to update the service permissions in',
    format: String,
    default: 'tf-core',
    env: 'GITHUB_REPO_SERVICE_PERMISSIONS'
  },
  githubRepoAppConfig: {
    doc: 'github repo to create the application config in',
    format: String,
    default: 'cdp-app-config',
    env: 'GITHUB_REPO_APP_CONFIG'
  },
  githubRepoNginx: {
    doc: 'github repo to create the nginx config in',
    format: String,
    default: 'cdp-nginx-upstreams',
    env: 'GITHUB_REPO_NGINX'
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'production'
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: process.env.NODE_ENV !== 'production'
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'test'
  },
  logLevel: {
    doc: 'Logging level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'info',
    env: 'LOG_LEVEL'
  },
  mongoUri: {
    doc: 'URI for mongodb',
    format: '*',
    default: 'mongodb://127.0.0.1:27017/',
    env: 'MONGO_URI'
  },
  mongoDatabase: {
    doc: 'database for mongodb',
    format: '*',
    default: 'cdp-self-service-ops',
    env: 'MONGO_DATABASE'
  },
  sqsRegion: {
    doc: 'AWS region of sqs queue',
    format: String,
    default: 'us-east-1',
    env: 'SQS_REGION'
  },
  sqsEndpoint: {
    doc: 'SQS endpoint',
    format: String,
    default: 'http://127.0.0.1:4566',
    env: 'SQS_ENDPOINT'
  },
  sqsGithubQueue: {
    doc: 'URL of sqs queue providing github events',
    format: String,
    default: 'http://127.0.0.1:4566/000000000000/github-events',
    env: 'SQS_GITHUB_QUEUE'
  },
  sqsGithubEnabled: {
    doc: 'Should the service listen for github webhook events?',
    format: Boolean,
    default: true,
    env: 'SQS_GITHUB_ENABLED'
  }
})

appConfig.validate({ allowed: 'strict' })

export { appConfig }
