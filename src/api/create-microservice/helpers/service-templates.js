const serviceTemplates = {
  'cdp-node-frontend-template': {
    zone: 'public',
    templateName: 'CDP Node.js Frontend Template',
    language: 'node',
    type: 'frontend'
  },
  'cdp-node-backend-template': {
    zone: 'protected',
    templateName: 'CDP Node.js Backend Template',
    language: 'node',
    type: 'backend'
  },
  'cdp-dotnet-backend-template': {
    zone: 'protected',
    templateName: 'CDP C# ASP.NET Backend Template',
    language: 'dotnet',
    type: 'backend'
  }
}

export { serviceTemplates }
