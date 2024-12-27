# Apply the Service Standard

Guidance and information for working to the Government Service Standard in the Ministry of Justice.


## Prerequisites

Docker

## Then run the app

Run `make run`

## Access points

Hot reload version (BrowserSync)<br>
**http://localhost:3000**

The application<br>
**http://localhost:3052**

BrowserSync UI<br>
**http://localhost:3001**



> [!NOTE]
> You may see "Deprecation Warning: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0."
> These are from the GOV.UK Frontend and you do not need to do anything.


## Azure Setup

### Useful links

- [Ministry of Justice | Overview](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview)
- App [justicedigital-centraldigital-applying-service-standards-preprod](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/quickStartType~/null/sourceType/Microsoft_AAD_IAM/appId/efc3d5de-4f3c-42c3-87ec-04a1f98578b9)
- App [justicedigital-centraldigital-applying-service-standards](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/quickStartType~/null/sourceType/Microsoft_AAD_IAM/appId/b6f721ef-2dc5-47f1-a07a-71dad1a0c0b9)

### Register an application

1. Go to the Azure portal and sign in with your account.
2. Click on the `Microsoft Entra ID` service.
3. Click on `App registrations`.
4. Click on `New registration`.
5. Fill in the form (adjust to the environment):
   - Name: `justicedigital-centraldigital-applying-service-standards`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: `Web` and `https://dev-applying-service-standards.apps.live.cloud-platform.service.justice.gov.uk/oauth/redirect`
     or `TBC` etc.
6. Copy the `Application (client) ID` and `Directory (tenant) ID` values,
  make them available as environment variables `OAUTH_CLIENT_ID`, `OAUTH_TENANT_ID`.
7. Click on `Certificates & secrets` > `New client secret`.
8. Fill in the form:
   - Description: `Staging`
   - Expires: `18 months`
9. Set a reminder to update the client secret before it expires.
10. Copy the `Value` value, make it available as environment variable `OAUTH_CLIENT_SECRET`.
11. Make a request the Identity Team, that `User.Read` API permissions be added to the app.

The oauth2 flow should now work with the Azure AD/Entra ID application.
You can get an Access Token, Refresh Token and an expiry of the token.

### Auth in this codebase

The implementation of Entra ID in this codebase is based on the tutorial 
[Sign in users and acquire a token for Microsoft Graph in a Node.js & Express web app](https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-v2-nodejs-webapp-msal).

Having followed the tutorial, some changes were made to the file names to match the project structure.

In this project, auth is limited to the following files:

- `.env` - where the environment variables are defined.
- `index.js` - where auth middleware is applied and routes are mounted.
- `app/auth/middleware` - where the auth middleware is defined.
- `app/auth/provider.js` - where the auth provider is defined.
- `app/routes/auth.js` - where the auth routes are defined.
- `app/views/login-screen.html` - where the login screen is defined.
- `app/views/layouts/main--logged-out.html` - where the layout for the logged out state is defined.
- `app/views/layouts/_header--logged-out.html` - where a stripped down header for the logged out state is defined.
- `app/views/layouts/_footer--logged-out.html` - where a stripped down footer for the logged out state is defined.

The auth middleware is applied to all routes except the auth routes.

To turn off auth for an environment, set `OAUTH_SKIP_AUTH` to `true` in the environment variables.
