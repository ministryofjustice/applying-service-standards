require('dotenv').config();

const client = require('../../middleware/contentful.js');

function cleanUpHtml(html) {
    return html
        .replace(/^\s*<p>|<\/p>\s*$/g, '')  // Strip <p> tags at the start and end
        .replace(/<p>\s*<\/p>/g, '')        // Remove empty <p></p> tags
        .replace(/<p>(\s*<br\s*\/?>\s*)<\/p>/g, '')  // Remove <p><br></p> sequences
        .trim();  // Remove any leading or trailing whitespace
}

function getContent() {

}

exports.g_home = async function (req, res) {
  let data = [];
  let standardPages = [];
  try {
      // Get the homepage
    const [page] = await Promise.all([
        client.getEntries({
            content_type: 'homepage',
        })
    ]);
    // Get the standards to list
    const [standard] = await Promise.all([
        client.getEntries({
            content_type: 'basic',
            'fields.pageType': 'Service standard',
        })
    ]);
    data = page.items.map(item => item.fields);
    standardPages = standard.items.map((item) => {
     return {
        page: item.fields,
        standard: item.fields.serviceStandard?.fields,
    };
    });
    console.log(standardPages[0].page.slug)
    return res.render(`demo/homepage.html`, { data , standardPages});

    } catch (error) {
        console.error('Error fetching data:', error.message)
        res.status(500).send('An error occurred while fetching the data.')
    }
}

exports.g_page = async function (req, res) {
    const { slug } = req.params;
    let data = [];
    let toc = [];
    let contentType = 'basic';
    let deliveryPhase = [];
    let serviceStandard = [];

    try {
        // Look for matching basic page
        const [page] = await Promise.all([
            client.getEntries({
                content_type: 'basic',
                'fields.slug': slug,
                include: 4,
            }),
        ]);

        if (page.total === 0) {
            const [landingPage] = await Promise.all([
                client.getEntries({
                    content_type: 'landing',
                    'fields.slug': slug,
                    include: 3,
                }),
            ]);
            data = landingPage.items.map(item => item.fields);
            toc = data[0].tableOfContents?.map(item => item.fields);
            contentType = 'landing';
        } else {
            data = page.items.map(item => item.fields);
        }

        const fields = data[0];
        const pageType = fields.pageType;

        if (pageType === 'Service standard') {
            serviceStandard = fields.serviceStandard.fields;
            console.log('serviceStandard', serviceStandard)
        } else if (pageType === 'Delivery phase') {
            deliveryPhase = fields.deliveryPhase?.fields;
        }
        return res.render(`demo/${contentType}.html`, { slug, fields, toc, deliveryPhase, serviceStandard });
    } catch (error) {
        console.error('Error fetching data:', error.message)
        res.status(500).send('An error occurred while fetching the data.')
    }
}