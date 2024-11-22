/**
 * Note! when adding a new creation type, make sure you also update `getStatusKeys` in `init-creation-status.js`
 * If you don't then it won't track creation state of things like tf-svc-infra updates.
 */
const creations = {
  microservice: 'microservice',
  repository: 'repository',
  envTestsuite: 'env-testsuite', // TODO This is now creating "Journey tests" rename to journeyTestSuite
  perfTestsuite: 'perf-testsuite'
}

export { creations }
