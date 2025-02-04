const skipAuth = process.env.OAUTH_SKIP_AUTH === 'true'

let msalConfig = {}

if (!skipAuth) {
  if (!process.env.OAUTH_CLIENT_ID) {
    throw new Error('Missing OAUTH_CLIENT_ID environment variable')
  }
  if (!process.env.OAUTH_TENANT_ID) {
    throw new Error('Missing OAUTH_TENANT_ID environment variable')
  }
  if (!process.env.OAUTH_CLIENT_SECRET) {
    throw new Error('Missing OAUTH_CLIENT_SECRET environment variable')
  }
  if (!process.env.EXPRESS_SESSION_SECRET) {
    throw new Error('Missing EXPRESS_SESSION_SECRET environment variable')
  }

  /**
   * Configuration object to be passed to MSAL instance on creation.
   * For a full list of MSAL Node configuration parameters, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
   */
  msalConfig = {
    auth: {
      clientId: process.env.OAUTH_CLIENT_ID, // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
      authority:
        'https://login.microsoftonline.com/' + process.env.OAUTH_TENANT_ID, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
      clientSecret: process.env.OAUTH_CLIENT_SECRET, // Client secret generated from the app registration in Azure portal
    },
    system: {
      loggerOptions: {
        loggerCallback(loglevel, message, containsPii) {
          console.log(message)
        },
        piiLoggingEnabled: false,
        logLevel: 3,
      },
    },
  }
}

module.exports = {
  skipAuth,
  msalConfig,
  OAUTH_REDIRECT_URI: `${process.env.BASE_URL}/auth/redirect`,
  OAUTH_LOGOUT_REDIRECT_URI: `${process.env.BASE_URL}/auth/login-screen?logged-out=true`,
}
