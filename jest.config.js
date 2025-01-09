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
  transformIgnorePatterns: [
    `node_modules/(?!${[
      '@defra/hapi-tracing', // Supports ESM only
      'node-fetch', // Supports ESM only
      'universal-user-agent',
      'universal-github-app-jwt',
      '@octokit',
      'octokit-plugin-create-pull-request',
      'before-after-hook'
    ].join('|')}/)`
  ]
}
/**
 * @import { Config } from 'jest'
 */
