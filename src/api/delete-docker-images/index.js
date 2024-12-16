const deleteDockerImages = {
  plugin: {
    name: 'undeploy',
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
