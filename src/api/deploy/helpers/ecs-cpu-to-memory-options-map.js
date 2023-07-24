import { memoryRange } from '~/src/api/deploy/helpers/memory-range'

// Based on ECS docs: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html
const ecsCpuToMemoryOptionsMap = {
  256: memoryRange(1, 2), // 512 not included as it is not usable due to sidecar
  512: memoryRange(1, 4),
  1024: memoryRange(2, 8),
  2048: memoryRange(4, 16),
  4096: memoryRange(8, 30),
  8192: memoryRange(16, 60, 4)
}

export { ecsCpuToMemoryOptionsMap }
