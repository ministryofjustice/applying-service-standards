const client = require('../../middleware/contentful.js');

/**
 * Generates a URL from a slug and its parent entry.
 * @param {string} slug - The slug of the entry.
 * @param {Object} parent - The parent entry object.
 * @returns {string} - The generated URL.
 */
function getUrlFromSlug(slug, parent) {
    if (!parent?.fields) {
        return `/${slug}`;
    }
    return `/${parent.fields.slug}/${slug}`;
}

/**
 * Handles the search route and renders the search results.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.g_search = async function (req, res) {
    const { searchterm } = req.query;

    try {
        const entries = await client.getEntries({
            query: searchterm,
            content_type: 'basic',
            include: 4,
        });

        const results = entries.items.map((entry) => {
            return {
                title: entry.fields.title,
                url: getUrlFromSlug(entry.fields.slug, entry.fields.parent),
                description: entry.fields.description,
            }
        });

        return res.render(`demo/search.html`, {results});
    } catch (error) {
        console.error('Error fetching search results:', error.message);
        res.status(500).send('An error occurred while fetching the search results.');
    }
};