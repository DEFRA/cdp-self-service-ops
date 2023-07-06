const memRange = (x, y, inc = 1) => {
  const out = []
  for (let i = x; i <= y; i += inc) {
    out.push(i * 1024)
  }
  return out
}

// based on ECS docs: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html
const ecsCpuAndMemorySizes = {
  256: memRange(1, 2), // 512 not usable due to sidecar
  512: memRange(1, 4),
  1024: memRange(2, 8),
  2048: memRange(4, 16),
  4096: memRange(8, 30),
  8192: memRange(16, 60, 4)
}

export { ecsCpuAndMemorySizes }
