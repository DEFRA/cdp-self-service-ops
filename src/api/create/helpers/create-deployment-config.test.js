import { octokit } from '~/src/helpers/oktokit'
import { createDeploymentConfig } from '~/src/api/create/helpers/create-deployment-config'
import frontendServicesFixture from '~/src/__fixtures__/frontend_services.json'

jest.mock('~/src/helpers/oktokit', () => ({
  octokit: {
    rest: {
      repos: {
        getContent: jest.fn()
      }
    }
  }
}))

describe('#createDeploymentConfig', () => {
  test('Should add new service', async () => {
    octokit.rest.repos.getContent.mockImplementation(() => ({
      data: JSON.stringify(frontendServicesFixture)
    }))

    const [filePath, servicesJson] = await createDeploymentConfig(
      'cdp-mock-frontend',
      'frontend',
      'infra-dev'
    )

    expect(filePath).toEqual(
      'environments/infra-dev/services/frontend_services.json'
    )
    expect(servicesJson).toEqual(
      JSON.stringify(
        [
          {
            container_image: 'cdp-portal-frontend',
            container_port: 3000,
            container_version: '0.64.0',
            desired_count: 2,
            env_vars: {
              PORT: 3000,
              TEAMS_AND_REPOSITORIES_API_URL:
                'http://internal-alb-snd-cluster-backend-14162363.eu-west-2.elb.amazonaws.com/cdp-teams-and-repositories',
              SELF_SERVICE_OPS_API_URL:
                'http://internal-alb-snd-cluster-backend-14162363.eu-west-2.elb.amazonaws.com/cdp-self-service-ops',
              DEPLOYMENTS_API_URL:
                'http://internal-alb-snd-cluster-backend-14162363.eu-west-2.elb.amazonaws.com/cdp-deployments',
              DEPLOYABLES_API_URL:
                'http://internal-alb-snd-cluster-backend-14162363.eu-west-2.elb.amazonaws.com/cdp-portal-deployables-backend'
            },
            healthcheck: '/cdp-portal-frontend/health',
            name: 'cdp-portal-frontend',
            secrets: {
              SESSION_COOKIE_PASSWORD:
                'cdp/services/cdp-portal-frontend:SESSION_COOKIE_PASSWORD',
              BASIC_AUTH_USER:
                'cdp/services/cdp-portal-frontend:BASIC_AUTH_USER',
              BASIC_AUTH_PASSWORD:
                'cdp/services/cdp-portal-frontend:BASIC_AUTH_PASSWORD'
            },
            task_cpu: 1024,
            task_memory: 2048,
            deploy_metrics: false
          },
          {
            container_image: 'cdp-mock-frontend',
            container_port: 8085,
            container_version: '0.1.0',
            desired_count: 0,
            healthcheck: '/cdp-mock-frontend/health',
            name: 'cdp-mock-frontend',
            task_cpu: 1024,
            task_memory: 2048,
            env_files: [
              {
                value:
                  'arn:aws:s3:::cdp-snd-service-configs/global/global_frontend_fixed.env',
                type: 's3'
              },
              {
                value:
                  'arn:aws:s3:::cdp-snd-service-configs/services/cdp-mock-frontend/infra-dev/cdp-mock-frontend.env',
                type: 's3'
              },
              {
                value:
                  'arn:aws:s3:::cdp-snd-service-configs/services/cdp-mock-frontend/defaults.env',
                type: 's3'
              },
              {
                value:
                  'arn:aws:s3:::cdp-snd-service-configs/environments/infra-dev/defaults.env',
                type: 's3'
              }
            ]
          }
        ],
        null,
        2
      )
    )
  })

  test('Should not add already existing service', async () => {
    octokit.rest.repos.getContent.mockImplementation(() => ({
      data: JSON.stringify(frontendServicesFixture)
    }))

    const [filePath, servicesJson] = await createDeploymentConfig(
      'cdp-portal-frontend',
      'frontend',
      'infra-dev'
    )

    expect(filePath).toEqual(
      'environments/infra-dev/services/frontend_services.json'
    )
    expect(servicesJson).toBeUndefined()
  })
})