import {
  getServiceTemplates,
  microserviceTemplates,
  serviceTemplateSchema
} from './microservice-templates.js'
import Joi from 'joi'
import { scopes } from '@defra/cdp-validation-kit'

describe('#getServiceTemplates', () => {
  test('Should provide python template when correct scope is present', () => {
    expect(getServiceTemplates([scopes.restrictedTechPython])).toEqual([
      microserviceTemplates['cdp-node-frontend-template'],
      microserviceTemplates['cdp-node-backend-template'],
      microserviceTemplates['cdp-node-backend-template-minimal'],
      microserviceTemplates['cdp-dotnet-backend-template'],
      microserviceTemplates['cdp-python-backend-template']
    ])
  })

  test('Should not provide restricted technology templates when no scopes are present', () => {
    expect(getServiceTemplates([])).toEqual([
      microserviceTemplates['cdp-node-frontend-template'],
      microserviceTemplates['cdp-node-backend-template'],
      microserviceTemplates['cdp-node-backend-template-minimal'],
      microserviceTemplates['cdp-dotnet-backend-template']
    ])
  })
})

describe('#serviceTemplates', () => {
  test('Should conform to the schema', () => {
    Object.values(microserviceTemplates).forEach((template) => {
      expect(() => Joi.assert(template, serviceTemplateSchema)).not.toThrow()
    })

    expect.assertions(Object.values(microserviceTemplates).length)
  })
})
