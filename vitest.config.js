const { defineConfig } = require('vitest/config')

module.exports = defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    setupFiles: ['test/setup.js'],
    testTimeout: 10000,
    globals: true,
  },
})
