// Test setup - environment variables and common configuration
// This file is loaded before each test file via vitest.config.js setupFiles

process.env.BASE_URL = 'http://localhost:3052'
process.env.OAUTH_SKIP_AUTH = 'true'
process.env.CONTENTFUL_SPACE_ID = 'test-space'
process.env.CONTENTFUL_DELIVERY_API_TOKEN = 'test-token'
process.env.GOV_NOTIFY_API_KEY = 'test-notify-key'
process.env.FEEDBACK_TEMPLATE_ID = 'test-template-id'
process.env.REDIS_HOST = 'localhost'
