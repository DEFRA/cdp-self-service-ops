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
    doc: 'GitHub Api authentication App Private Key',
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
  }
})

appConfig.validate({ allowed: 'strict' })

export { appConfig }
