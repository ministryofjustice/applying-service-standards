require('dotenv').config()

const contentful = require('contentful');

const client = contentful.createClient({
    space: process.env.spaceID || 'space_id',
    accessToken: process.env.contentfulLiveAPI || 'contentful_api'
});

module.exports = client;