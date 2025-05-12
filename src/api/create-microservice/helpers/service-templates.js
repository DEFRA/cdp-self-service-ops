import Joi from 'joi'

const serviceTemplateSchema = Joi.object({
  repositoryName: Joi.string().required(),
  zone: Joi.string().valid('public', 'protected').required(),
  mongo: Joi.boolean().required(),
  redis: Joi.boolean().required(),
  templateName: Joi.string().required(),
  language: Joi.string().required(),
  type: Joi.string().required(),
  defaultBranch: Joi.string().optional(),
  requiredScope: Joi.string().optional(),
  id: Joi.string().required()
})

const serviceTemplates = {
  'cdp-node-frontend-template': {
    repositoryName: 'cdp-node-frontend-template',
    zone: 'public',
    mongo: false,
    redis: true,
    templateName: 'Node.js Frontend',
    language: 'node',
    type: 'frontend',
    id: 'cdp-node-frontend-template'
  },
  'cdp-node-backend-template': {
    repositoryName: 'cdp-node-backend-template',
    zone: 'protected',
    mongo: true,
    redis: false,
    templateName: 'Node.js Backend',
    language: 'node',
    type: 'backend',
    id: 'cdp-node-backend-template'
  },
  'cdp-node-backend-template-minimal': {
    repositoryName: 'cdp-node-backend-template',
    zone: 'protected',
    mongo: false,
    redis: false,
    templateName: 'Node.js Backend - Minimal',
    language: 'node',
    type: 'backend',
    defaultBranch: 'minimal',
    id: 'cdp-node-backend-template-minimal'
  },
  'cdp-dotnet-backend-template': {
    repositoryName: 'cdp-dotnet-backend-template',
    zone: 'protected',
    mongo: true,
    redis: false,
    templateName: 'DotNet Backend',
    language: 'dotnet',
    type: 'backend',
    id: 'cdp-dotnet-backend-template'
  },
  'cdp-python-backend-template': {
    repositoryName: 'cdp-python-backend-template',
    zone: 'protected',
    mongo: true,
    redis: false,
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

export { serviceTemplates, serviceTemplateSchema, getServiceTemplates }
