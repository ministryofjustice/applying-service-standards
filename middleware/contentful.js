const contentful = require('contentful');

const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID || 'space_id',
    accessToken: process.env.CONTENTFUL_DELIVERY_API_TOKEN || 'contentful_api'
});

module.exports = client;