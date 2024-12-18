import { deleteDockerImagesController } from '~/src/api/delete-docker-images/controllers/delete-docker-images.js'

const deleteDockerImages = {
  plugin: {
    name: 'delete-docker-images',
    register: async (server) => {
      await server.route([
        {
          method: 'DELETE',
          path: '/delete-docker-images/{imageName}',
          ...deleteDockerImagesController
        }
      ])
    }
  }
}

export { deleteDockerImages }
