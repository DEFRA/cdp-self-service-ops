/**
 * @type {Config}
 */
export default {
  rootDir: '.',
  verbose: true,
  resetModules: true,
  clearMocks: true,
  silent: false,
  preset: '@shelf/jest-mongodb',
  testMatch: ['**/src/**/*.test.js'],
  reporters: ['default', ['github-actions', { silent: false }], 'summary'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.server',
    '<rootDir>/src/__fixtures__',
    '<rootDir>/src/server/common/test-helpers'
  ],
  coverageDirectory: '<rootDir>/coverage',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // @octokit/graphql is ESM only, ignore related ESM imports
  transformIgnorePatterns: [
    '/node_modules(?!/(@octokit|universal-user-agent|@defra/hapi-tracing))'
  ]
}
/**
 * @import { Config } from 'jest'
 */
