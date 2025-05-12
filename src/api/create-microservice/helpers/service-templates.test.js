import {
  getServiceTemplates,
  serviceTemplates,
  serviceTemplateSchema
} from '~/src/api/create-microservice/helpers/service-templates.js'
import Joi from 'joi'

describe('#getServiceTemplates', () => {
  test('Should provide python template when correct scope is present', () => {
    expect(getServiceTemplates(['restrictedTechPython'])).toEqual([
      serviceTemplates['cdp-node-frontend-template'],
      serviceTemplates['cdp-node-backend-template'],
      serviceTemplates['cdp-node-backend-template-minimal'],
      serviceTemplates['cdp-dotnet-backend-template'],
      serviceTemplates['cdp-python-backend-template']
    ])
  })

  test('Should not provide restricted technology templates when no scopes are present', () => {
    expect(getServiceTemplates([])).toEqual([
      serviceTemplates['cdp-node-frontend-template'],
      serviceTemplates['cdp-node-backend-template'],
      serviceTemplates['cdp-node-backend-template-minimal'],
      serviceTemplates['cdp-dotnet-backend-template']
    ])
  })
})

describe('#serviceTemplates', () => {
  test('Should conform to the schema', () => {
    Object.values(serviceTemplates).forEach((template) => {
      expect(() => Joi.assert(template, serviceTemplateSchema)).not.toThrow()
    })
  })
})
