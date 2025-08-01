import { ecsCpuToMemoryOptionsMap } from '../helpers/ecs-cpu-to-memory-options-map.js'

const deployServiceOptionsController = {
  handler: (request, h) => {
    return h
      .response({
        message: 'success',
        cpuOptions: [
          { value: 512, text: '0.5 vCPU' },
          { value: 1024, text: '1 vCPU' },
          { value: 2048, text: '2 vCPU' },
          { value: 4096, text: '4 vCPU' },
          { value: 8192, text: '8 vCPU' }
        ],
        ecsCpuToMemoryOptionsMap
      })
      .code(200)
  }
}

export { deployServiceOptionsController }
