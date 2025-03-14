// jest.config.js
module.exports = {
    testEnvironment: 'node',
    testTimeout: 10000,
    // We need to tell Jest to ignore the node_modules folder
    testPathIgnorePatterns: ['/node_modules/'],
    // Run tests in parallel to speed up execution
    maxWorkers: '50%',
    // Add verbose output
    verbose: true,
    // Let's create a coverage report
    collectCoverage: true,
    coverageDirectory: './coverage',
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
    // We'll use our own reporters
    reporters: ['default']
  };