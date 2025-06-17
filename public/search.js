// Function to fetch and display synopsis on demand
async function fetchSynopsis(storyLink, synopsisContainerId) {
    const synopsisContainer = document.getElementById(synopsisContainerId);
    synopsisContainer.innerHTML = 'Loading synopsis...'; // Show loading message

    try {
        const response = await fetch(`/.netlify/functions/get-synopsis?url=${encodeURIComponent(storyLink)}`);
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Backend get-synopsis function failed with status ${response.status}:`, errorBody);
            synopsisContainer.innerHTML = `<p class="error">Error fetching synopsis (Backend issue: ${response.status}).</p>`;
            return;
        }

        const data = await response.json();
        synopsisContainer.innerHTML = `<p>${data.synopsis}</p>`; // Display the fetched synopsis
    } catch (error) {
        console.error("Error fetching synopsis:", error);
        synopsisContainer.innerHTML = '<p class="error">Error loading synopsis. Please try again.</p>';
    }
}

// Unified function to perform the actual backend fetch and render results
async function executeSearch(searchInput, selectedCategories) {
    const resultsContainer = document.getElementById('results-container');
    // The initial clearing and loading message is handled by handleSearchClick

    let url = '';
    
    // Determine which backend endpoint to call based on input
    if (searchInput && selectedCategories.length > 0) {
        // Keyword AND Categories search
        url = `/.netlify/functions/scrape-categories?tags=${selectedCategories.join(',')}&query=${searchInput}`;
    } else if (searchInput && selectedCategories.length === 0) {
        // Keyword ONLY search
        url = `/.netlify/functions/scrape?query=${searchInput}`;
    } else if (!searchInput && selectedCategories.length > 0) {
        // Category ONLY search
        url = `/.netlify/functions/scrape-categories?tags=${selectedCategories.join(',')}&query=`; // query is empty
    } else {
        // This case should ideally be caught by handleSearchClick, but as a fallback:
        resultsContainer.innerHTML = '<p>Please enter a keyword or select at least one category.</p>';
        return;
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Backend function failed with status ${response.status}:`, errorBody);
            resultsContainer.innerHTML = `<p class="error">Error occurred while searching (Backend issue: ${response.status}). Please try again later or refine your search.</p>`;
            return;
        }

        const stories = await response.json();

        if (stories.length > 0) {
            resultsContainer.innerHTML = ''; // Clear loading message before displaying results
            stories.forEach((story, index) => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                
                // Generate a unique ID for the synopsis container for this story
                const synopsisContainerId = `synopsis-item-${index}`; 

                resultItem.innerHTML = `
                    <h3>${story.title}</h3>
                    <button class="show-synopsis-btn" data-story-link="${story.link}" data-synopsis-id="${synopsisContainerId}">Show Synopsis</button>
                    <br> <a href="${story.link}" target="_blank">Read more</a>
                    <div id="${synopsisContainerId}" class="synopsis-container"></div> `;
                resultsContainer.appendChild(resultItem);
            });

            // Attach event listeners to the "Show Synopsis" buttons
            document.querySelectorAll('.show-synopsis-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const storyLink = event.target.dataset.storyLink;
                    const synopsisId = event.target.dataset.synopsisId;
                    fetchSynopsis(storyLink, synopsisId);
                    event.target.style.display = 'none'; // Hide the button after click
                });
            });

        } else {
            resultsContainer.innerHTML = '<p>No results found.</p>';
        }
    } catch (error) {
        console.error("Fetch/JSON parsing error in executeSearch:", error);
        resultsContainer.innerHTML = '<p class="error">Error occurred while searching. Please check your network connection or try again.</p>';
    }
}

// Main handler for the search button click
function handleSearchClick() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const resultsContainer = document.getElementById('results-container');
    const searchButton = document.getElementById('search-button'); // Get button reference

    const selectedCategories = [];
    document.querySelectorAll('.categories input[type="checkbox"]:checked').forEach(checkbox => {
        selectedCategories.push(checkbox.id);
    });

    if (!searchInput && selectedCategories.length === 0) {
        resultsContainer.innerHTML = '<p>Please enter a keyword or select at least one category.</p>';
        return;
    }

    // Show loading feedback
    if (searchButton) {
        searchButton.textContent = 'Searching...';
        searchButton.disabled = true;
    }
    resultsContainer.innerHTML = '<div class="loading-bar"></div><p>Searching...</p>'; // Add loading bar and text

    // Call the unified executeSearch function and ensure button state is reset
    executeSearch(searchInput, selectedCategories).finally(() => {
        if (searchButton) {
            searchButton.textContent = 'Search';
            searchButton.disabled = false;
        }
    });
}

// --- REMOVED AUTOMATIC SEARCH ON CATEGORY CHANGE ---
// The following block has been removed to stop searches from triggering
// automatically when category checkboxes are changed:
/*
document.querySelectorAll('.categories input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', handleSearchClick);
});
*/