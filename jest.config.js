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
  setupFiles: ['<rootDir>/.jest/setup-env-vars.js'],
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
    '^.+\\.js$': [
      'babel-jest',
      {
        plugins: ['babel-plugin-transform-import-meta']
      }
    ]
  },
  transformIgnorePatterns: [
    `node_modules/(?!${[
      '@defra/hapi-tracing',
      '@defra/cdp-validation-kit',
      'node-fetch',
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
