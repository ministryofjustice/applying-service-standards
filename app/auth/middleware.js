const expressSession = require('express-session')

const session = expressSession({
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
