import Joi from 'joi'
import {
  templateBranchNameValidation,
  zoneValidation,
  entityTypeValidation,
  entitySubTypeValidation,
  scopes,
  entityTypes,
  entitySubTypes
} from '@defra/cdp-validation-kit'

const tenantTemplateSchema = Joi.object({
  repositoryName: Joi.string().required(), // repositoryNameValidation doesn't apply here as its not a tenant repo.
  zone: zoneValidation,
  mongo: Joi.boolean().required(),
  redis: Joi.boolean().required(),
  templateName: Joi.string().required(),
  language: Joi.string().required(),
  defaultBranch: templateBranchNameValidation,
  requiredScope: Joi.string().optional(),
  id: Joi.string().required(),
  entityType: entityTypeValidation,
  entitySubType: entitySubTypeValidation
})

const tenantTemplateLookupSchema = Joi.object().pattern(
  Joi.string(),
  tenantTemplateSchema
)

/**
 *
 * @typedef TenantTemplate
 * @property {string} id
 * @property {string} repositoryName
 * @property {string} zone
 * @property {boolean} mongo
 * @property {boolean} redis
 * @property {string} templateName
 * @property {string|null} defaultBranch
 * @property {string} language
 * @property {string} entityType
 * @property {string} entitySubType
 * @property {string|null} requiredScope
 * @export { TenantTemplate }
 */

/**
 * Available template for the platform
 * @type {Object.<string, TenantTemplate>}
 */
const tenantTemplates = {
  'cdp-node-frontend-template': {
    id: 'cdp-node-frontend-template',
    repositoryName: 'cdp-node-frontend-template',
    zone: 'public',
    mongo: false,
    redis: true,
    templateName: 'Node.js Frontend',
    language: 'node',
    entityType: entityTypes.microservice,
    entitySubType: entitySubTypes.frontend
  },
  'cdp-node-backend-template': {
    id: 'cdp-node-backend-template',
    repositoryName: 'cdp-node-backend-template',
    zone: 'protected',
    mongo: true,
    redis: false,
    templateName: 'Node.js Backend',
    language: 'node',
    entityType: entityTypes.microservice,
    entitySubType: entitySubTypes.backend
  },
  'cdp-node-backend-template-minimal': {
    id: 'cdp-node-backend-template-minimal',
    repositoryName: 'cdp-node-backend-template',
    zone: 'protected',
    mongo: false,
    redis: false,
    templateName: 'Node.js Backend - Minimal',
    language: 'node',
    defaultBranch: 'minimal',
    entityType: entityTypes.microservice,
    entitySubType: entitySubTypes.backend
  },
  'cdp-dotnet-backend-template': {
    id: 'cdp-dotnet-backend-template',
    repositoryName: 'cdp-dotnet-backend-template',
    zone: 'protected',
    mongo: true,
    redis: false,
    templateName: 'DotNet Backend',
    language: 'dotnet',
    entityType: entityTypes.microservice,
    entitySubType: entitySubTypes.backend
  },
  'cdp-node-prototype-template': {
    id: 'cdp-node-prototype-template',
    repositoryName: 'cdp-node-prototype-template',
    zone: 'public',
    mongo: false,
    redis: false,
    templateName: 'GOVUK Prototype Kit',
    language: 'node',
    entityType: entityTypes.prototype,
    entitySubType: entitySubTypes.frontend
  },
  'cdp-python-backend-template': {
    id: 'cdp-python-backend-template',
    repositoryName: 'cdp-python-backend-template',
    zone: 'protected',
    mongo: true,
    redis: false,
    templateName: 'Python Backend',
    language: 'python',
    requiredScope: scopes.restrictedTechPython,
    entityType: entityTypes.microservice,
    entitySubType: entitySubTypes.backend
  },
  'cdp-perf-test-suite-template': {
    id: 'cdp-perf-test-suite-template',
    repositoryName: 'cdp-perf-test-suite-template',
    zone: 'public',
    mongo: false,
    redis: false,
    templateName: 'Performance Test Suite',
    language: 'jmeter',
    entityType: entityTypes.testSuite,
    entitySubType: entitySubTypes.performance
  },
  'cdp-node-journey-test-suite-template': {
    id: 'cdp-node-journey-test-suite-template',
    repositoryName: 'cdp-node-journey-test-suite-template',
    zone: 'public',
    mongo: false,
    redis: false,
    templateName: 'Journey Test Suite',
    language: 'node',
    entityType: entityTypes.testSuite,
    entitySubType: entitySubTypes.journey
  }
}

Joi.assert(tenantTemplates, tenantTemplateLookupSchema)

function filterTemplates({ scopes = null, type = null, subtype = null }) {
  return Object.values(tenantTemplates).filter((template) => {
    if (scopes && template.requiredScope) {
      if (!scopes.includes(template.requiredScope)) return false
    }

    if (type && template.entityType !== type) {
      return false
    } else if (subtype && template.entitySubType !== subtype) {
      return false
    }

    return true
  })
}

export {
  tenantTemplates,
  tenantTemplateSchema,
  tenantTemplateLookupSchema,
  filterTemplates
}
