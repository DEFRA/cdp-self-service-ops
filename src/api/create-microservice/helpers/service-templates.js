import Joi from 'joi'
import {
  templateBranchNameValidation,
  zoneValidation,
  templateTypeValidation,
  entityTypeValidation,
  entitySubTypeValidation,
  repositoryNameValidation
} from '@defra/cdp-validation-kit/src/validations.js'

const serviceTemplateSchema = Joi.object({
  repositoryName: repositoryNameValidation,
  zone: zoneValidation,
  mongo: Joi.boolean().required(),
  redis: Joi.boolean().required(),
  templateName: Joi.string().required(),
  language: Joi.string().required(),
  type: templateTypeValidation,
  defaultBranch: templateBranchNameValidation,
  requiredScope: Joi.string().optional(),
  id: Joi.string().required(),
  entityType: entityTypeValidation,
  entitySubType: entitySubTypeValidation
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
    id: 'cdp-node-frontend-template',
    entityType: 'Microservice',
    entitySubType: 'Frontend'
  },
  'cdp-node-backend-template': {
    repositoryName: 'cdp-node-backend-template',
    zone: 'protected',
    mongo: true,
    redis: false,
    templateName: 'Node.js Backend',
    language: 'node',
    type: 'backend',
    id: 'cdp-node-backend-template',
    entityType: 'Microservice',
    entitySubType: 'Backend'
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
    id: 'cdp-node-backend-template-minimal',
    entityType: 'Microservice',
    entitySubType: 'Backend'
  },
  'cdp-dotnet-backend-template': {
    repositoryName: 'cdp-dotnet-backend-template',
    zone: 'protected',
    mongo: true,
    redis: false,
    templateName: 'DotNet Backend',
    language: 'dotnet',
    type: 'backend',
    id: 'cdp-dotnet-backend-template',
    entityType: 'Microservice',
    entitySubType: 'Backend'
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
    id: 'cdp-python-backend-template',
    entityType: 'Microservice',
    entitySubType: 'Backend'
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
