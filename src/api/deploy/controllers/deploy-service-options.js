import { ecsCpuToMemoryOptionsMap } from '~/src/api/deploy/helpers/ecs-cpu-to-memory-options-map.js'

const deployServiceOptionsController = {
  handler: (request, h) => {
    return h
      .response({
        message: 'success',
        cpuOptions: [
          { value: 512, text: '512 (.5 vCPU)' },
          { value: 1024, text: '1024 (1 vCPU)' },
          { value: 2048, text: '2048 (2 vCPU)' },
          { value: 4096, text: '4096 (4 vCPU)' },
          { value: 8192, text: '8192 (8 vCPU)' }
        ],
        ecsCpuToMemoryOptionsMap
      })
      .code(200)
  }
}

export { deployServiceOptionsController }
