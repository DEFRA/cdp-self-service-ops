import { createTenantController } from './controller.js'
import { tenantTemplatesController } from './tenant-templates-controller.js'

const createTenant = {
  plugin: {
    name: 'create-tenant',
    register: async (server) => {
      await server.route([
        {
          method: 'POST',
          path: '/create-tenant',
          ...createTenantController
        },
        {
          method: 'GET',
          path: '/tenant-templates',
          ...tenantTemplatesController
        }
      ])
    }
  }
}

export { createTenant }
