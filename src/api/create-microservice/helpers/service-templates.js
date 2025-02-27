const serviceTemplates = {
  'cdp-node-frontend-template': {
    repositoryName: 'cdp-node-frontend-template',
    zone: 'public',
    templateName: 'CDP Node.js Frontend Template',
    language: 'node',
    type: 'frontend'
  },
  'cdp-node-backend-template': {
    repositoryName: 'cdp-node-backend-template',
    zone: 'protected',
    templateName: 'CDP Node.js Backend Template',
    language: 'node',
    type: 'backend'
  },
  'cdp-dotnet-backend-template': {
    repositoryName: 'cdp-dotnet-backend-template',
    zone: 'protected',
    templateName: 'CDP C# ASP.NET Backend Template',
    language: 'dotnet',
    type: 'backend'
  },
  'cdp-python-backend-template': {
    repositoryName: 'cdp-python-backend-template',
    zone: 'protected',
    templateName: 'CDP Python Backend Template',
    language: 'python',
    type: 'backend',
    requiredScope: 'restrictedTechPython'
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
