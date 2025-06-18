const axios = require('axios');
const cheerio = require('cheerio');
const { searchall } = require('../../categories');
const excludedLinks = require('../../excludedLinks');

// scrapeWebsite function - now only fetches title and link
async function scrapeWebsite(url, searchQuery) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        let stories = [];
        $('a').each((i, element) => {
            const title = $(element).text().trim(); // Keep trimming for clean titles
            const link = $(element).attr('href');
            const fullLink = new URL(link, url).href;

            const isAuthorOrTagPage = fullLink.includes('https://mcstories.com/Authors') || fullLink.includes('https://mcstories.com/Tags/');
            const isExcluded = excludedLinks.has(fullLink);
            const matchesQuery = searchQuery === '' || title.toLowerCase().includes(searchQuery.toLowerCase());

            if (title && link && !isAuthorOrTagPage && !isExcluded && matchesQuery) {
                stories.push({ title, link: fullLink }); // Only push title and link
            }
        });

        return stories;
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return [];
    }
}

exports.handler = async (event, context) => {
    const searchQuery = event.queryStringParameters.query || '';

    try {
        let allStories = [];
        for (const url of searchall) {
            const stories = await scrapeWebsite(url, searchQuery);
            allStories = allStories.concat(stories);
        }
        
        // Remove duplicates based on title (and implicitly link, as they should be unique per title)
        const uniqueStories = [];
        const seenTitles = new Set(); // This is correctly declared as 'seenTitles'
        allStories.forEach(story => {
            if (!seenTitles.has(story.title)) {
                // FIX: Changed 'uniqueTitles.add' to 'seenTitles.add'
                seenTitles.add(story.title); 
                uniqueStories.push(story);
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(uniqueStories), // Return unique stories
        };
    } catch (error) {
        console.error("Error in scrape function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error occurred while scraping' }),
        };
    }
};