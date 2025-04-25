const serviceTemplates = {
  'cdp-node-frontend-template': {
    repositoryName: 'cdp-node-frontend-template',
    zone: 'public',
    templateName: 'Node.js Frontend',
    language: 'node',
    type: 'frontend',
    id: 'cdp-node-frontend-template'
  },
  'cdp-node-backend-template': {
    repositoryName: 'cdp-node-backend-template',
    zone: 'protected',
    templateName: 'Node.js Backend',
    language: 'node',
    type: 'backend',
    id: 'cdp-node-backend-template'
  },
  'cdp-node-backend-template-minimal': {
    repositoryName: 'cdp-node-backend-template',
    zone: 'protected',
    templateName: 'Node.js Backend - Minimal',
    language: 'node',
    type: 'backend',
    defaultBranch: 'minimal',
    requiredScope: 'restrictedTechPostgres',
    id: 'cdp-node-backend-template-minimal'
  },
  'cdp-dotnet-backend-template': {
    repositoryName: 'cdp-dotnet-backend-template',
    zone: 'protected',
    templateName: 'DotNet Backend',
    language: 'dotnet',
    type: 'backend',
    id: 'cdp-dotnet-backend-template'
  },
  'cdp-python-backend-template': {
    repositoryName: 'cdp-python-backend-template',
    zone: 'protected',
    templateName: 'Python Backend',
    language: 'python',
    type: 'backend',
    requiredScope: 'restrictedTechPython',
    id: 'cdp-python-backend-template'
  }
}

function getServiceTemplates(scopes = []) {
  return Object.values(serviceTemplates).filter(({ requiredScope }) => {
    if (!requiredScope) {
      return true
    } else {
      return scopes.includes(requiredScope)
    }
  })
}

export { serviceTemplates, getServiceTemplates }
