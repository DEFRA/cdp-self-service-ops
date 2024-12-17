const environments = {
  management: 'management',
  infraDev: 'infra-dev',
  dev: 'dev',
  test: 'test',
  perfTest: 'perf-test',
  extTest: 'ext-test',
  prod: 'prod'
}
const orderedEnvironments = [
  environments.infraDev,
  environments.management,
  environments.dev,
  environments.test,
  environments.perfTest,
  environments.extTest,
  environments.prod
]

export { environments, orderedEnvironments }
