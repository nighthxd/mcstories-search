const axios = require('axios');
const cheerio = require('cheerio');
const { tags } = require('../../categories');
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
const excludedLinks = require('../../excludedLinks');
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
const excludedLinks = require('../../excludedLinks');
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
>>>>>>> parent of 19dff86 (revert exclude cats)
=======
const excludedLinks = require('../../excludedLinks');
>>>>>>> parent of 5251731 (Added exclusions, may be broken)

// scrapeWebsite function - now only fetches title and link
async function scrapeWebsite(url, searchQuery) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        let stories = [];
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> parent of 19dff86 (revert exclude cats)
        const storyElements = $('a'); // Select all 'a' tags

        const categoryPromises = storyElements.map(async (i, element) => {
            const title = $(element).text().trim();
<<<<<<< HEAD
=======
        $('a').each((i, element) => {
            const title = $(element).text().trim(); // Keep trimming for clean titles
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
        $('a').each((i, element) => {
            const title = $(element).text().trim(); // Keep trimming for clean titles
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
>>>>>>> parent of 19dff86 (revert exclude cats)
=======
        $('a').each((i, element) => {
            const title = $(element).text().trim(); // Keep trimming for clean titles
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
            const link = $(element).attr('href');
            const fullLink = new URL(link, url).href;

            const isAuthorOrTagPage = fullLink.includes('https://mcstories.com/Authors') || fullLink.includes('https://mcstories.com/Tags/');
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> parent of 19dff86 (revert exclude cats)
            const matchesQuery = searchQuery === '' || title.toLowerCase().includes(searchQuery.toLowerCase());

            if (title && link && !isAuthorOrTagPage && matchesQuery) { // Removed !isExcluded from condition
                const categories = await fetchCategoriesForStory(fullLink);
                return { title, link: fullLink, categories };
<<<<<<< HEAD
=======
            const isExcluded = excludedLinks.has(fullLink);
            const matchesQuery = searchQuery === '' || title.toLowerCase().includes(searchQuery.toLowerCase());

            if (title && link && !isAuthorOrTagPage && !isExcluded && matchesQuery) {
                stories.push({ title, link: fullLink }); // Only push title and link
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
            const isExcluded = excludedLinks.has(fullLink);
            const matchesQuery = searchQuery === '' || title.toLowerCase().includes(searchQuery.toLowerCase());

            if (title && link && !isAuthorOrTagPage && !isExcluded && matchesQuery) {
                stories.push({ title, link: fullLink }); // Only push title and link
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
>>>>>>> parent of 19dff86 (revert exclude cats)
            }
            return null; // Return null for elements that don't match criteria
        }).get(); // .get() to convert Cheerio object to a standard array

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        stories = (await Promise.all(categoryPromises)).filter(story => story !== null);
=======
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
        stories = (await Promise.all(categoryPromises)).filter(story => story !== null);
>>>>>>> parent of 19dff86 (revert exclude cats)
=======
            const isExcluded = excludedLinks.has(fullLink);
            const matchesQuery = searchQuery === '' || title.toLowerCase().includes(searchQuery.toLowerCase());

            if (title && link && !isAuthorOrTagPage && !isExcluded && matchesQuery) {
                stories.push({ title, link: fullLink }); // Only push title and link
            }
        });

>>>>>>> parent of 5251731 (Added exclusions, may be broken)
        return stories;
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return [];
    }
}

exports.handler = async (event, context) => {
    const selectedTags = event.queryStringParameters.tags ? event.queryStringParameters.tags.split(',') : [];
    const searchQuery = event.queryStringParameters.query || '';

    try {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> parent of 19dff86 (revert exclude cats)
        let allStoriesPerTag = {};
        const scrapePromises = selectedTags.map(async tag => {
            const tagUrl = tags[tag];
            if (tagUrl) {
                return await scrapeWebsite(tagUrl, searchQuery);
            }
            return [];
        });

        const results = await Promise.all(scrapePromises);
        let filteredStories = [];

        if (results.length > 0) {
            // Filter each tag's stories by the search query first
            const allStoriesPerTagFilteredByKeyword = results.map(stories => 
                stories.filter(story => 
                    searchQuery === '' || story.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );

            let commonStories = [];
            if (allStoriesPerTagFilteredByKeyword.length > 0) {
                const firstTagStories = new Set(allStoriesPerTagFilteredByKeyword[0].map(s => s.link)); // Use link for robust comparison

                commonStories = allStoriesPerTagFilteredByKeyword[0].filter(story => firstTagStories.has(story.link));

                for (let i = 1; i < allStoriesPerTagFilteredByKeyword.length; i++) {
                    const currentTagStoriesSet = new Set(allStoriesPerTagFilteredByKeyword[i].map(s => s.link));
                    
                    commonStories = commonStories.filter(story =>
                        currentTagStoriesSet.has(story.link)
                    );
                }
            }
            filteredStories = commonStories;
        }

        // Remove duplicates based on link (more reliable than title alone)
<<<<<<< HEAD
=======
        if (searchQuery === '') {
            // Logic for Category only search
            if (tagArray.length === 1) {
                // If only one tag, scrape stories directly from that tag's URL
                const url = tags[tagArray[0]];
                if (url) {
                    const stories = await scrapeWebsite(url, searchQuery);
                    return {
                        statusCode: 200,
                        body: JSON.stringify(stories),
                    };
                } else {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({ error: 'Category URL not found' }),
                    };
                }
            } else {
                // If multiple tags, find common stories across all selected categories
                const allStoriesPerTag = [];
                for (const tag of tagArray) {
                    const url = tags[tag];
                    if (url) {
                        const stories = await scrapeWebsite(url, searchQuery);
                        allStoriesPerTag.push(stories);
                    }
                }

                let commonStories = [];
                if (allStoriesPerTag.length > 0) {
                    commonStories = allStoriesPerTag[0]; // Start with stories from the first tag
                    for (let i = 1; i < allStoriesPerTag.length; i++) {
                        const currentTagStories = allStoriesPerTag[i];
                        // Filter to keep only stories whose titles are present in the current tag's stories
                        commonStories = commonStories.filter(story =>
                            currentTagStories.some(s => s.title === story.title)
                        );
                    }
                }
                
                // Remove duplicates in commonStories if any
                const uniqueCommonStories = [];
                const seenTitles = new Set();
                commonStories.forEach(story => {
                    if (!seenTitles.has(story.title)) {
                        seenTitles.add(story.title);
                        uniqueCommonStories.push(story);
                    }
                });

                return {
                    statusCode: 200,
                    body: JSON.stringify(uniqueCommonStories),
                };
            }
        }

        // Logic for Keyword AND Categories search (intersection)
        const allStoriesPerTagFilteredByKeyword = [];
        for (const tag of tagArray) {
            const url = tags[tag];
            if (url) {
                // Scrape all stories from the category page, then filter by keyword
                let storiesFromCategory = await scrapeWebsite(url, searchQuery);
                
                storiesFromCategory = storiesFromCategory.filter(story => 
                    story.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
                
                allStoriesPerTagFilteredByKeyword.push(storiesFromCategory);
            }
        }

=======
        if (searchQuery === '') {
            // Logic for Category only search
            if (tagArray.length === 1) {
                // If only one tag, scrape stories directly from that tag's URL
                const url = tags[tagArray[0]];
                if (url) {
                    const stories = await scrapeWebsite(url, searchQuery);
                    return {
                        statusCode: 200,
                        body: JSON.stringify(stories),
                    };
                } else {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({ error: 'Category URL not found' }),
                    };
                }
            } else {
                // If multiple tags, find common stories across all selected categories
                const allStoriesPerTag = [];
                for (const tag of tagArray) {
                    const url = tags[tag];
                    if (url) {
                        const stories = await scrapeWebsite(url, searchQuery);
                        allStoriesPerTag.push(stories);
                    }
                }

                let commonStories = [];
                if (allStoriesPerTag.length > 0) {
                    commonStories = allStoriesPerTag[0]; // Start with stories from the first tag
                    for (let i = 1; i < allStoriesPerTag.length; i++) {
                        const currentTagStories = allStoriesPerTag[i];
                        // Filter to keep only stories whose titles are present in the current tag's stories
                        commonStories = commonStories.filter(story =>
                            currentTagStories.some(s => s.title === story.title)
                        );
                    }
                }
                
                // Remove duplicates in commonStories if any
                const uniqueCommonStories = [];
                const seenTitles = new Set();
                commonStories.forEach(story => {
                    if (!seenTitles.has(story.title)) {
                        seenTitles.add(story.title);
                        uniqueCommonStories.push(story);
                    }
                });

                return {
                    statusCode: 200,
                    body: JSON.stringify(uniqueCommonStories),
                };
            }
        }

        // Logic for Keyword AND Categories search (intersection)
        const allStoriesPerTagFilteredByKeyword = [];
        for (const tag of tagArray) {
            const url = tags[tag];
            if (url) {
                // Scrape all stories from the category page, then filter by keyword
                let storiesFromCategory = await scrapeWebsite(url, searchQuery);
                
                storiesFromCategory = storiesFromCategory.filter(story => 
                    story.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
                
                allStoriesPerTagFilteredByKeyword.push(storiesFromCategory);
            }
        }

>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
        if (searchQuery === '') {
            // Logic for Category only search
            if (tagArray.length === 1) {
                // If only one tag, scrape stories directly from that tag's URL
                const url = tags[tagArray[0]];
                if (url) {
                    const stories = await scrapeWebsite(url, searchQuery);
                    return {
                        statusCode: 200,
                        body: JSON.stringify(stories),
                    };
                } else {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({ error: 'Category URL not found' }),
                    };
                }
            } else {
                // If multiple tags, find common stories across all selected categories
                const allStoriesPerTag = [];
                for (const tag of tagArray) {
                    const url = tags[tag];
                    if (url) {
                        const stories = await scrapeWebsite(url, searchQuery);
                        allStoriesPerTag.push(stories);
                    }
                }

                let commonStories = [];
                if (allStoriesPerTag.length > 0) {
                    commonStories = allStoriesPerTag[0]; // Start with stories from the first tag
                    for (let i = 1; i < allStoriesPerTag.length; i++) {
                        const currentTagStories = allStoriesPerTag[i];
                        // Filter to keep only stories whose titles are present in the current tag's stories
                        commonStories = commonStories.filter(story =>
                            currentTagStories.some(s => s.title === story.title)
                        );
                    }
                }
                
                // Remove duplicates in commonStories if any
                const uniqueCommonStories = [];
                const seenTitles = new Set();
                commonStories.forEach(story => {
                    if (!seenTitles.has(story.title)) {
                        seenTitles.add(story.title);
                        uniqueCommonStories.push(story);
                    }
                });

                return {
                    statusCode: 200,
                    body: JSON.stringify(uniqueCommonStories),
                };
            }
        }

        // Logic for Keyword AND Categories search (intersection)
        const allStoriesPerTagFilteredByKeyword = [];
        for (const tag of tagArray) {
            const url = tags[tag];
            if (url) {
                // Scrape all stories from the category page, then filter by keyword
                let storiesFromCategory = await scrapeWebsite(url, searchQuery);
                
                storiesFromCategory = storiesFromCategory.filter(story => 
                    story.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
                
                allStoriesPerTagFilteredByKeyword.push(storiesFromCategory);
            }
        }

>>>>>>> parent of 5251731 (Added exclusions, may be broken)
        let combinedAndFilteredStories = [];
        if (allStoriesPerTagFilteredByKeyword.length > 0) {
            // Start with the keyword-filtered stories from the first tag
            combinedAndFilteredStories = allStoriesPerTagFilteredByKeyword[0];

            // Now, find the intersection with keyword-filtered stories from subsequent tags
            for (let i = 1; i < allStoriesPerTagFilteredByKeyword.length; i++) {
                const currentTagStories = allStoriesPerTagFilteredByKeyword[i];
                combinedAndFilteredStories = combinedAndFilteredStories.filter(story =>
                    currentTagStories.some(s => s.title === story.title)
                );
            }
        }
        
        // Remove any potential duplicates in the final list
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
=======
>>>>>>> parent of 19dff86 (revert exclude cats)
=======
>>>>>>> parent of 5251731 (Added exclusions, may be broken)
        const finalUniqueStories = [];
        const uniqueTitles = new Set();
        combinedAndFilteredStories.forEach(story => {
            if (!uniqueTitles.has(story.title)) {
                uniqueTitles.add(story.title);
                finalUniqueStories.push(story);
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(finalUniqueStories),
        };
    } catch (error) {
        console.error("Error in scrape-categories function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error occurred while scraping' }),
        };
    }
};