module.exports = {
  rootDir: '.',
  verbose: true,
  resetModules: true,
  clearMocks: true,
  silent: true,
  preset: '@shelf/jest-mongodb',
  testMatch: ['**/src/**/*.test.js'],
  reporters: ['default', ['github-actions', { silent: false }], 'summary'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.server',
    '<rootDir>/src/__fixtures__',
    'index.js'
  ],
  coverageDirectory: '<rootDir>/coverage'
}
