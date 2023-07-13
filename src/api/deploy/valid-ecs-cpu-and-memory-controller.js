import { ecsCpuAndMemorySizes } from '~/src/api/deploy/helpers/ecs-cpu-and-memory-settings'

const validEcsCpuAndMemoryController = {
  options: {},
  handler: async (request, h) => {
    return h.response(ecsCpuAndMemorySizes).code(200)
  }
}

export { validEcsCpuAndMemoryController }
