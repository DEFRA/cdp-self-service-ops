/**
 * Note! when adding a new creation type, make sure you also update `getStatusKeys` in `save-status.js`
 * If you dont then it wont track creation state of things like tf-svc-infra updates.
 */
const creations = {
  microservice: 'microservice',
  repository: 'repository',
  testsuite: 'testsuite',
  envTestsuite: 'env-testsuite',
  smokeTestSuite: 'smoke-testsuite',
  perfTestsuite: 'perf-testsuite'
}

export { creations }
