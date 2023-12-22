import {
  inProgressController,
  unfinishedController,
  inProgressByRepositoryController,
  unfinishedRepositoryController,
  finishByRepositoryController
} from '~/src/api/status/controllers'

const status = {
  plugin: {
    name: 'status',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/status/in-progress',
          ...inProgressController
        },
        {
          method: 'GET',
          path: '/status/in-progress/{repositoryName}',
          ...inProgressByRepositoryController
        },
        {
          method: 'GET',
          path: '/status/unfinished',
          ...unfinishedController
        },
        {
          method: 'GET',
          path: '/status/unfinished/{repositoryName}',
          ...unfinishedRepositoryController
        },
        {
          method: 'GET',
          path: '/status/finish/{repositoryName}',
          ...finishByRepositoryController
        }
      ])
    }
  }
}

export { status }
