import { getServiceTemplates } from '~/src/api/create-microservice/helpers/service-templates.js'

describe('#getServiceTemplates', () => {
  test('Should provide python template when correct scope is present', () => {
    expect(getServiceTemplates(['restrictedTechPython'])).toEqual([
      {
        language: 'node',
        repositoryName: 'cdp-node-frontend-template',
        templateName: 'CDP Node.js Frontend Template',
        type: 'frontend',
        zone: 'public'
      },
      {
        language: 'node',
        repositoryName: 'cdp-node-backend-template',
        templateName: 'CDP Node.js Backend Template',
        type: 'backend',
        zone: 'protected'
      },
      {
        language: 'dotnet',
        repositoryName: 'cdp-dotnet-backend-template',
        templateName: 'CDP C# ASP.NET Backend Template',
        type: 'backend',
        zone: 'protected'
      },
      {
        language: 'python',
        repositoryName: 'cdp-python-backend-template',
        requiredScope: 'restrictedTechPython',
        templateName: 'CDP Python Backend Template',
        type: 'backend',
        zone: 'protected'
      }
    ])
  })
})

test('Should not provide python template when python scope is not present', () => {
  expect(getServiceTemplates([])).toEqual([
    {
      language: 'node',
      repositoryName: 'cdp-node-frontend-template',
      templateName: 'CDP Node.js Frontend Template',
      type: 'frontend',
      zone: 'public'
    },
    {
      language: 'node',
      repositoryName: 'cdp-node-backend-template',
      templateName: 'CDP Node.js Backend Template',
      type: 'backend',
      zone: 'protected'
    },
    {
      language: 'dotnet',
      repositoryName: 'cdp-dotnet-backend-template',
      templateName: 'CDP C# ASP.NET Backend Template',
      type: 'backend',
      zone: 'protected'
    }
  ])
})
