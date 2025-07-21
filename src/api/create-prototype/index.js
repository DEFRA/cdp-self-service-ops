import { createPrototypeController } from '~/src/api/create-prototype/controller.js'

const createPrototype = {
  plugin: {
    name: 'create-prototype',
    register: (server) => {
      server.route([
        {
          method: 'POST',
          path: '/create-prototype',
          ...createPrototypeController
        }
      ])
    }
  }
}

export { createPrototype }
