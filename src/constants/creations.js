/**
 * Note! when adding a new creation type, make sure you also update `getStatusKeys` in `init-creation-status.js`
 * If you don't then it won't track creation state of things like tf-svc-infra updates.
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
