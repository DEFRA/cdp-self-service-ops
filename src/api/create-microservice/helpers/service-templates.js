const serviceTemplates = {
  'cdp-node-frontend-template': {
    repositoryName: 'cdp-node-frontend-template',
    zone: 'public',
    templateName: 'Node.js Frontend',
    language: 'node',
    type: 'frontend'
  },
  'cdp-node-backend-template': {
    repositoryName: 'cdp-node-backend-template',
    zone: 'protected',
    templateName: 'Node.js Backend',
    language: 'node',
    type: 'backend'
  },
  'cdp-dotnet-backend-template': {
    repositoryName: 'cdp-dotnet-backend-template',
    zone: 'protected',
    templateName: 'DotNet Backend',
    language: 'dotnet',
    type: 'backend'
  },
  'cdp-python-backend-template': {
    repositoryName: 'cdp-python-backend-template',
    zone: 'protected',
    templateName: 'Python Backend',
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
