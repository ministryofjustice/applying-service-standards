/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express')

const authProvider = require('../auth/provider')
const {
  OAUTH_REDIRECT_URI,
  OAUTH_LOGOUT_REDIRECT_URI,
} = require('../auth-config')

const router = express.Router()

router.get('/login-screen', authProvider.prompt({}))

router.get(
  '/login',
  authProvider.login({
    scopes: [],
    redirectUri: OAUTH_REDIRECT_URI,
    successRedirect: '/',
  }),
)

router.post('/redirect', authProvider.handleRedirect())

router.get(
  '/signout',
  authProvider.logout({
    postLogoutRedirectUri: OAUTH_LOGOUT_REDIRECT_URI,
  }),
)

module.exports = router
