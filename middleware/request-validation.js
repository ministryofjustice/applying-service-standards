const path = require('node:path')

function validatePath (req, res, next) {
  if (path.normalize(req.path).includes('..')) {
    res.status(400).send('Bad request')
    return
  }
  next()
}

module.exports = { validatePath }
