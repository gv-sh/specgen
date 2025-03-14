// jest.config.js
module.exports = {
    testEnvironment: 'node',
    testTimeout: 100000,
    testPathIgnorePatterns: ['/node_modules/'],
    maxWorkers: '25%',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: './coverage',
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
    reporters: ['default']
  };