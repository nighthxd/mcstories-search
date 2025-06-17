const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async (event, context) => {
    const storyUrl = event.queryStringParameters.url;

    if (!storyUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Story URL is required.' }),
        };
    }

    try {
        const { data } = await axios.get(storyUrl);
        const $ = cheerio.load(data);
        
        // Extract the synopsis from the <section class="synopsis"></section> element
        const synopsis = $('section.synopsis').text().trim();

        return {
            statusCode: 200,
            body: JSON.stringify({ synopsis: synopsis || 'Synopsis not available.' }),
        };
    } catch (error) {
        console.error(`Error fetching synopsis for ${storyUrl}:`, error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error fetching synopsis.' }),
        };
    }
};