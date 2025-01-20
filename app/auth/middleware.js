const expressSession = require('express-session')
const IORedis = require('ioredis')
const { RedisStore } = require('connect-redis')

const redisClient = new IORedis({
  host: process.env.REDIS_HOST || 'redis',
  // Settings for AWS Elasticache.
  ...(process.env.REDIS_PASSWORD && {
    password: process.env.REDIS_PASSWORD,
    tls: {},
  }),
})

const redisStore = new RedisStore({ client: redisClient })

const session = expressSession({
  store: redisStore,
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.BASE_URL.startsWith('https://'),
  },
})

const isAuthenticated = (req, res, next) => {
  if (req.path.startsWith('/auth/')) {
    return next()
  }

  if (!req.session.isAuthenticated) {
    return res.redirect('/auth/login-screen') // redirect to sign-in route
  }

  next()
}

module.exports = { session, isAuthenticated }
