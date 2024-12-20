/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
  auth: {
    clientId: process.env.OAUTH_CLIENT_ID, // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    authority: process.env.OAUTH_CLOUD_INSTANCE + process.env.OAUTH_TENANT_ID, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
    clientSecret: process.env.OAUTH_CLIENT_SECRET, // Client secret generated from the app registration in Azure portal
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 3,
    },
  },
};

const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI;
const OAUTH_LOGOUT_REDIRECT_URI = process.env.OAUTH_LOGOUT_REDIRECT_URI;
const OAUTH_GRAPH_ME_ENDPOINT =
  process.env.OAUTH_GRAPH_API_ENDPOINT + "v1.0/me";

module.exports = {
  msalConfig,
  OAUTH_REDIRECT_URI,
  OAUTH_LOGOUT_REDIRECT_URI,
  OAUTH_GRAPH_ME_ENDPOINT,
};
