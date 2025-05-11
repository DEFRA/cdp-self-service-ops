import { getServiceTemplates } from '~/src/api/create-microservice/helpers/service-templates.js'

describe('#getServiceTemplates', () => {
  test('Should provide python template when correct scope is present', () => {
    expect(getServiceTemplates(['restrictedTechPython'])).toEqual([
      {
        repositoryName: 'cdp-node-frontend-template',
        zone: 'public',
        templateName: 'Node.js Frontend',
        language: 'node',
        type: 'frontend',
        id: 'cdp-node-frontend-template'
      },
      {
        repositoryName: 'cdp-node-backend-template',
        zone: 'protected',
        templateName: 'Node.js Backend',
        language: 'node',
        type: 'backend',
        id: 'cdp-node-backend-template'
      },
      {
        repositoryName: 'cdp-node-backend-template',
        zone: 'protected',
        templateName: 'Node.js Backend - Minimal',
        language: 'node',
        type: 'backend',
        defaultBranch: 'minimal',
        id: 'cdp-node-backend-template-minimal'
      },
      {
        repositoryName: 'cdp-dotnet-backend-template',
        zone: 'protected',
        templateName: 'DotNet Backend',
        language: 'dotnet',
        type: 'backend',
        id: 'cdp-dotnet-backend-template'
      },
      {
        repositoryName: 'cdp-python-backend-template',
        zone: 'protected',
        templateName: 'Python Backend',
        language: 'python',
        type: 'backend',
        requiredScope: 'restrictedTechPython',
        id: 'cdp-python-backend-template'
      }
    ])
  })

  test('Should not provide restricted technology templates when no scopes are present', () => {
    expect(getServiceTemplates([])).toEqual([
      {
        repositoryName: 'cdp-node-frontend-template',
        zone: 'public',
        templateName: 'Node.js Frontend',
        language: 'node',
        type: 'frontend',
        id: 'cdp-node-frontend-template'
      },
      {
        repositoryName: 'cdp-node-backend-template',
        zone: 'protected',
        templateName: 'Node.js Backend',
        language: 'node',
        type: 'backend',
        id: 'cdp-node-backend-template'
      },
      {
        repositoryName: 'cdp-node-backend-template',
        zone: 'protected',
        templateName: 'Node.js Backend - Minimal',
        language: 'node',
        type: 'backend',
        defaultBranch: 'minimal',
        id: 'cdp-node-backend-template-minimal'
      },
      {
        repositoryName: 'cdp-dotnet-backend-template',
        zone: 'protected',
        templateName: 'DotNet Backend',
        language: 'dotnet',
        type: 'backend',
        id: 'cdp-dotnet-backend-template'
      }
    ])
  })
})
