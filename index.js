// node packages
const path = require('node:path')

// npm packages
const express = require('express')
const nunjucks = require('nunjucks')
const dateFilter = require('nunjucks-date-filter')
const markdown = require('nunjucks-markdown')
const marked = require('marked')
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const { NotifyClient } = require('notifications-node-client')

// Configuration
const config = require('./app/config')
const { skipAuth } = require('./app/auth-config')

// Middleware
const { session, isAuthenticated } = require('./app/auth/middleware')
// To rename, this is not middleware.
const PageIndex = require('./middleware/pageIndex')

// Routes
const authRouter = require('./app/routes/auth')
const contentfulRouter = require('./app/routes/contentful')

const pageIndex = new PageIndex(config)
const notify = new NotifyClient(process.env.GOV_NOTIFY_API_KEY)

const app = express()

// Use express-session to manage user sessions - i.e. login via Entra.
skipAuth || app.use(session)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(favicon(path.join(__dirname, 'public/assets/images', 'favicon.ico')))

app.set('view engine', 'html')

app.locals.serviceName = 'Apply the Service Standard in DfE'

// Set up Nunjucks as the template engine
var nunjuckEnv = nunjucks.configure(
  [
    'app/views',
    'node_modules/govuk-frontend/dist/',
    'node_modules/dfe-frontend/packages/components',
  ],
  {
    autoescape: true,
    express: app,
  },
)

nunjuckEnv.addFilter('date', dateFilter)
markdown.register(nunjuckEnv, marked.parse)

// Set up static file serving for the app's assets.
// Use this before auth middleware, so that the assets can be served on the login screen.
app.use('/assets', express.static('public/assets'))

// Also, define robots.txt route before auth middleware.
app.get('/robots.txt', (_, res) => {
  res.type('text/plain')
  return res.send(`User-agent: *\nDisallow: ${config.allowRobots ? '' : '/'}`)
})

// Add the middleware and routes for auth.
skipAuth || app.use(isAuthenticated)
skipAuth || app.use('/auth', authRouter)

app.use('/', contentfulRouter)

// Render sitemap.xml in XML format
app.get('/sitemap.xml', (_, res) => {
  res.set({ 'Content-Type': 'application/xml' })
  res.render('sitemap.xml')
})

app.get('/search', (req, res) => {
  console.log(req.query['searchterm'])
  const query = req.query['searchterm'] || ''
  const resultsPerPage = 10
  let currentPage = parseInt(req.query.page, 10)
  const results = pageIndex.search(query)
  console.log('Results: ' + results)
  console.log('Query: ' + query)

  const maxPage = Math.ceil(results.length / resultsPerPage)
  if (!Number.isInteger(currentPage)) {
    currentPage = 1
  } else if (currentPage > maxPage || currentPage < 1) {
    currentPage = 1
  }

  const startingIndex = resultsPerPage * (currentPage - 1)
  const endingIndex = startingIndex + resultsPerPage

  res.render('search.html', {
    currentPage,
    maxPage,
    query,
    results: results.slice(startingIndex, endingIndex),
    resultsLen: results.length,
  })
})

if (config.env !== 'development') {
  setTimeout(() => {
    pageIndex.init()
  }, 2000)
}

// TODO - this route is not implemented in the frontend. Should it should be removed?
app.post('/submit-feedback', (req, res) => {
  const feedback = req.body.feedback_form_input
  const fullUrl = req.headers.referer || 'Unknown'

  //Send to notify after validation with recaptcha first
  //TODO: Implement recaptcha

  notify
    .sendEmail(process.env.FEEDBACK_TEMPLATE_ID, 'cdpt@justice.gov.uk', {
      personalisation: {
        feedback: feedback,
        page: fullUrl,
        service: 'Apply Service Standard in Justice Digital',
      },
    })
    .then((response) => {})
    .catch((err) => console.log(err))

  return res.sendStatus(200)
})

app.get('/service-standard', (req, res) => {
  return res.redirect('/')
})

// Route for handling Yes/No feedback submissions
app.post('/form-response/helpful', (req, res) => {
  const { response } = req.body
  const service = 'Apply the service standard'
  const pageURL = req.headers.referer || 'Unknown'
  const date = new Date().toISOString()

  // TODO: For now, log the submitted data, but later, write code to store it.
  console.log('Data', {
    Response: response,
    Service: service,
    URL: pageURL,
  })

  res.json({ success: true, message: 'Feedback submitted successfully' })

  // base('Data').create([
  //   {
  //     "fields": {
  //       "Response": response,
  //       "Service": service,
  //       "URL": pageURL
  //     }
  //   }
  // ], function (err) {
  //   if (err) {
  //     console.error(err);
  //     return res.status(500).send('Error saving to Airtable');
  //   }
  //   res.json({ success: true, message: 'Feedback submitted successfully' });
  // });
})

// New route for handling detailed feedback submissions
app.post('/form-response/feedback', (req, res) => {
  const { response } = req.body

  const service = 'Apply the service standard' // Example service name
  const pageURL = req.headers.referer || 'Unknown' // Attempt to capture the referrer URL
  const date = new Date().toISOString()

  // TODO: For now, log the submitted data, but later, write code to store it.
  console.log('Feedback', {
    Feedback: response,
    Service: service,
    URL: pageURL,
  })

  res.json({ success: true, message: 'Feedback submitted successfully' })

  // base('Feedback').create([{
  //   "fields": {
  //     "Feedback": response,
  //     "Service": service,
  //     "URL": pageURL
  //   }
  // }], function (err) {
  //   if (err) {
  //     console.error(err);
  //     return res.status(500).send('Error saving to Airtable');
  //   }
  //   res.json({ success: true, message: 'Feedback submitted successfully' });
  // });
})

app.get(/\.html?$/i, function (req, res) {
  var path = req.path
  var parts = path.split('.')
  parts.pop()
  path = parts.join('.')
  res.redirect(path)
})

app.get(/^([^.]+)$/, function (req, res, next) {
  matchRoutes(req, res, next)
})

// Handle 404 errors
app.use(function (req, res, next) {
  res.status(404).render('error.html')
})

// Handle 500 errors
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).render('error.html')
})

// Try to match a request to a template, for example a request for /test
// would look for /app/views/test.html
// and /app/views/test/index.html

function renderPath(path, res, next) {
  // Try to render the path
  res.render(path, function (error, html) {
    if (!error) {
      // Success - send the response
      res.set({ 'Content-type': 'text/html; charset=utf-8' })
      res.end(html)
      return
    }
    if (!error.message.startsWith('template not found')) {
      // We got an error other than template not found - call next with the error
      next(error)
      return
    }
    if (!path.endsWith('/index')) {
      // Maybe it's a folder - try to render [path]/index.html
      renderPath(path + '/index', res, next)
      return
    }
    // We got template not found both times - call next to trigger the 404 page
    next()
  })
}

matchRoutes = function (req, res, next) {
  var path = req.path

  // Remove the first slash, render won't work with it
  path = path.substr(1)

  // If it's blank, render the root index
  if (path === '') {
    path = 'index'
  }

  renderPath(path, res, next)
}

// Start the server
// Run application on configured port
app.listen(config.port)
