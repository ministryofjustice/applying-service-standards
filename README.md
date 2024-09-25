# Apply the Service Standard

Guidance and information for working to the Government Service Standard in the Ministry of Justice.


## Prerequisites

Docker

## Then run the app

Add a .env file and add the following keys:

```
ASSET_PATH="/home/node/"
RECAPTCHA_PUBLIC=some_text
RECAPTCHA_SECRET=some_text
FEEDBACK_TEMPLATE_ID=notify_feedback_template
NOTIFY_API_KEY=preprod-notify-api-key

AIRTABLE_TOKEN=some_token
AIRTABLE_BASE_ID=some_id

BASE_URL=http://localhost:3052
```

Run `docker compose up`

> [!NOTE]
> You may see "Deprecation Warning: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0."
> These are from the GOV.UK Frontend and you do not need to do anything.
