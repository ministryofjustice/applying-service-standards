require('dotenv').config();

const client = require('../../middleware/contentful.js');
const documentToHtmlString = require('@contentful/rich-text-html-renderer').documentToHtmlString;

/**
 * Cleans up HTML by removing unnecessary tags and whitespace.
 * @param {string} html - The HTML string to clean up.
 * @returns {string} - The cleaned-up HTML string.
 */
function cleanUpHtml(html) {
    return html
        .replace(/^\s*<p>|<\/p>\s*$/g, '')  // Strip <p> tags at the start and end
        .replace(/<p>\s*<\/p>/g, '')        // Remove empty <p></p> tags
        .replace(/<p>(\s*<br\s*\/?>\s*)<\/p>/g, '')  // Remove <p><br></p> sequences
        .trim();  // Remove any leading or trailing whitespace
}

/**
 * Converts a file size in bytes to a human-readable string.
 * @param {number} size - The file size in bytes.
 * @returns {string} - The human-readable file size.
 */
function convertFilesize(size) {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

/**
 * Extracts the file extension from a URL.
 * @param {string} url - The URL of the file.
 * @returns {string} - The file extension in uppercase.
 */
function getExtension(url) {
    return url.split('.').pop().toUpperCase();
}

/**
 * Retrieves linked content information from an entry.
 * Links can be to other content, assets, or external URLs so must be handled slightly differently.
 * @param {Object} entry - The entry object.
 * @returns {Object} - The linked content information.
 */
function getLinkedContent(entry) {
    if (entry.fields?.linkedContent) {
        return {
            type: 'linkedContent',
            url: `/${entry.fields.linkedContent.fields.slug}`,
        }
    }
    if (entry.fields?.linkedAsset) {
        return {
            type: 'linkedAsset',
            url: entry.fields.linkedAsset.fields.file.url,
            filesize: convertFilesize(entry.fields.linkedAsset.fields.file.details.size),
            filetype: getExtension(entry.fields.linkedAsset.fields.file.url),
            updatedDate: new Date(entry.fields.linkedAsset.sys.updatedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        }
    }
    if (entry.fields?.externalLink) {
        return {
            type: 'externalLink',
            url: entry.fields.externalLink,
        }
    }
}

/**
 * Retrieves sidebar navigation links from a navigation entry.
 * @param {Object} nav - The navigation entry object.
 * @returns {Array} - The sidebar navigation links or link collections.
 */
function getSidebarNavigation(nav) {
    return nav.fields.links?.map((link) => {
        if (link.fields?.links) {
            return {
                heading: link.fields.heading,
                sublinks: link.fields.links.map((sublink) => {
                    return {
                        title: sublink.fields.title,
                        slug: sublink.fields.slug,
                    }
                })
            }
        }
        return {
            title: link.fields.title,
            slug: link.fields.slug,
        }
    });
}

/**
 * Retrieves links from a table of contents entry.
 * @param {Array} toc - The table of contents entry array.
 * @returns {Array} - The table of contents links.
 */
function getTableOfContents(toc) {
    return toc.map((link) => {
        return {
            title: link.fields.title,
            slug: link.fields.slug,
            thumbnailImage: link.fields.thumbnailImage?.fields.file.url,
            description: link.fields.description,
        }
    });
}

/**
 * Retrieves service standard fields from an entry.
 * @param {Object} entry - The serviceStandard object.
 * @returns {Object} - The service standard fields.
 */
function getServiceStandardFields(entry) {
    return {
        name: entry.fields.name,
        standardNumber: entry.fields.standardNumber,
        relevantJobRoles: entry.fields.relevantJobRoles,
        serviceManualUrl: entry.fields.serviceManualUrl,
    }
}

/**
 * Retrieves delivery phase fields from an entry.
 * @param {Object} entry - The entry object.
 * @returns {Object} - The delivery phase fields.
 */
function getDeliveryPhaseFields(entry) {
    return {
        title: entry.fields.title,
    }
}

/**
 * Retrieves homepage fields from the 'homepage' content type.
 * @param {Object} entry - The homepage object.
 * @returns {Object} - The homepage fields.
 */
function getHomepageFields(entry) {
    const sidebarBlocks = entry.fields?.sidebarBlocks.map((block) => {
        return {
            heading: block.fields.heading,
            description: block.fields.description,
            linkedContent: getLinkedContent(block),
        }
    });
    return {
        title: entry.fields.title,
        description: cleanUpHtml(documentToHtmlString(entry.fields.description)),
        sidebarBlocks: sidebarBlocks,
    }
}

/**
 * Retrieves basic page fields from the 'basic' content type.
 * @param {Object} entry - The entry object.
 * @param {string} pageType - The page type, either 'Service standard', 'Delivery phase', or 'Service assessment'.
 * @returns {Object} - The basic page fields.
 */
function getBasicPageFields(entry, pageType) {
    let serviceStandardFields = {};
    let deliveryPhaseFields = {};
    let sidebar = [];

    if (pageType === 'Service standard') {
        serviceStandardFields = getServiceStandardFields(entry.fields.serviceStandard)
    } else if (pageType === 'Delivery phase') {
        deliveryPhaseFields = getDeliveryPhaseFields(entry.fields.deliveryPhase)
    }
    if (entry.fields.parent) {
        const parentFields = getLandingPageFields(entry.fields.parent);
        sidebar = parentFields.sidebarNavigation;
    }

    return {
        title: entry.fields.title,
        slug: entry.fields.slug,
        sidebar,
        pageType,
        description: entry.fields.description,
        content: cleanUpHtml(documentToHtmlString(entry.fields.content)),
        serviceStandard: serviceStandardFields,
        deliveryPhase: deliveryPhaseFields,
    }
}

/**
 * Retrieves landing page fields from the 'landing' content type.
 * @param {Object} entry - The entry object.
 * @returns {Object} - The landing page fields.
 */
function getLandingPageFields(entry) {
    let sidebarNavigation =  [];
    let tableOfContents =  [];
    if (entry.fields.sidebarNavigation) {
        sidebarNavigation = getSidebarNavigation(entry.fields.sidebarNavigation)
    }

    if (entry.fields.tableOfContents) {
        tableOfContents = getTableOfContents(entry.fields.tableOfContents)
    }

    return {
        title: entry.fields.title,
        slug: entry.fields.slug,
        description: cleanUpHtml(documentToHtmlString(entry.fields.description)),
        sidebarNavigation,
        tableOfContents,
    }
}

/**
 * Handles the homepage route and renders the homepage with the main content and service standards list.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.g_home = async function (req, res) {
    let mainContent = {};
    let serviceStandards = [];

    try {
        // Get the homepage entry
        const [homepage] = await Promise.all([
            client.getEntries({
                content_type: 'homepage',
                'fields.slug': 'homepage',
                include: 4, // The depth to reference entries within other entries
            })
        ]);

        mainContent = getHomepageFields(homepage.items[0]);

        // Get all the standards pages
        const [standardsPages] = await Promise.all([
            client.getEntries({
                content_type: 'basic',
                'fields.pageType': 'Service standard',
                include: 4,
            })
        ]);

        // Get the relevant fields for each standard page
        standardsPages.items.forEach((standardPage) => {
            serviceStandards.push(
                getBasicPageFields(standardPage, 'Service standard'),
            );
        });

        // Sort into alphanumeric order
        serviceStandards.sort((a, b) => {
            return a.serviceStandard?.standardNumber - b.serviceStandard?.standardNumber;
        });

        return res.render(`demo/homepage.html`, {mainContent, serviceStandards});

    } catch (error) {
        console.error('Error fetching data:', error.message)
        res.status(500).send('An error occurred while fetching the data.')
    }
}

/**
 * Handles the page route and renders the appropriate page based on the slug.
 * This applies to both 'landing' and 'basic' content types
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.g_page = async function (req, res) {
    const {slug} = req.params;
    // General
    let contentType = ''
    let mainContent = [];

    try {
        // Try to find a matching basic page
        const [basicPage] = await Promise.all([
            client.getEntries({
                content_type: 'basic',
                'fields.slug': slug,
                include: 4,
            }),
        ]);
        // If there isn't one, look for a landing page instead
        if (basicPage.total === 0) {
            const [landingPage] = await Promise.all([
                client.getEntries({
                    content_type: 'landing',
                    'fields.slug': slug,
                    include: 4,
                })
            ]);
            contentType = 'landing';
            mainContent = getLandingPageFields(landingPage.items[0]);
        }
        else {
            contentType = 'basic';
            mainContent = getBasicPageFields(basicPage.items[0], basicPage.items[0].fields.pageType);
        }
        return res.render(`demo/${contentType}.html`, {slug, contentType, mainContent});
    } catch (error) {
        console.error('Error fetching data:', error.message)
        res.status(500).send('An error occurred while fetching the data.')
    }
}
