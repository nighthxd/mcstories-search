// search.js
// Global map to store fetched synopses to avoid refetching
const fetchedSynopses = new Map();

// Corrected mapping for category short codes to full names from index.html labels
const categoryNames = {
    'bd': 'bondage',
    'be': 'bestiality',
    'ca': 'cannibalism',
    'cb': 'super-hero/heroine',
    'ds': 'dom and/or sub',
    'ex': 'exhibitionism',
    'fd': 'female dominant',
    'ff': 'female/female sex',
    'ft': 'fetish (usually clothing)',
    'fu': 'furry',
    'gr': 'growth/enlargement',
    'hm': 'humiliation',
    'hu': 'humor',
    'in': 'incest',
    'la': 'lactation',
    'ma': 'masturbation',
    'mc': 'mind control',
    'md': 'male dominant',
    'mf': 'male/female sex',
    'mm': 'male/male sex',
    'nc': 'non-consensual',
    'rb': 'robots',
    'sc': 'scatology',
    'sf': 'science fiction',
    'ts': 'time stop',
    'ws': 'watersports'
};

// Function to toggle synopsis visibility and fetch if not already loaded
async function toggleSynopsis(buttonElement, storyLink, synopsisContainerId) {
    const synopsisContainer = document.getElementById(synopsisContainerId);
    
    // Check if the synopsis is currently visible
    if (synopsisContainer.style.display === 'block') {
        // If visible, hide it
        synopsisContainer.style.display = 'none';
        buttonElement.textContent = 'Show Synopsis';
    } else {
        // If hidden, show loading message and fetch synopsis
        synopsisContainer.innerHTML = 'Loading synopsis...'; // Show loading message
        synopsisContainer.style.display = 'block'; // Make sure container is visible
        buttonElement.textContent = 'Hide Synopsis'; // Change button text

        // Check if synopsis is already fetched
        if (fetchedSynopses.has(storyLink)) {
            synopsisContainer.innerHTML = `<p>${fetchedSynopses.get(storyLink)}</p>`;
            return;
        }

        try {
            const response = await fetch(`/.netlify/functions/get-synopsis?url=${encodeURIComponent(storyLink)}`);
            
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Backend get-synopsis function failed with status ${response.status}:`, errorBody);
                synopsisContainer.innerHTML = `<p class="error">Error fetching synopsis (Backend issue: ${response.status}).</p>`;
                return;
            }

            const data = await response.json();
            const synopsisText = data.synopsis || 'Synopsis not available.';
            fetchedSynopses.set(storyLink, synopsisText); // Store fetched synopsis
            synopsisContainer.innerHTML = `<p>${synopsisText}</p>`; // Display the fetched synopsis
        } catch (error) {
            console.error("Error fetching synopsis:", error);
            synopsisContainer.innerHTML = '<p class="error">Error loading synopsis. Please try again.</p>';
        }
    }
}

// Unified function to perform the actual backend fetch and render results
async function executeSearch(searchInput, selectedCategories) {
    const resultsContainer = document.getElementById('results-container');
    // The initial clearing and loading message is handled by handleSearchClick

    let url = '';
    
    // Determine which backend endpoint to call based on input
    if (searchInput && selectedCategories.length > 0) {
        // Both search term and categories selected: use scrape-categories
        url = `/.netlify/functions/scrape-categories?query=${encodeURIComponent(searchInput)}&tags=${encodeURIComponent(selectedCategories.join(','))}`;
    } else if (searchInput) {
        // Only search term: use scrape
        url = `/.netlify/functions/scrape?query=${encodeURIComponent(searchInput)}`;
    } else if (selectedCategories.length > 0) {
        // Only categories selected: use scrape-categories with empty query
        url = `/.netlify/functions/scrape-categories?tags=${encodeURIComponent(selectedCategories.join(','))}`;
    } else {
        resultsContainer.innerHTML = '<p>Please enter a search term or select categories.</p>';
        return;
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Backend function failed with status ${response.status}:`, errorBody);
            resultsContainer.innerHTML = `<p class="error">Error fetching stories (Backend issue: ${response.status}).</p>`;
            return;
        }

        const stories = await response.json();
        renderResults(stories);
        if (stories.length > 0) {
            resultsContainer.innerHTML = ''; // Clear loading message before displaying results
            stories.forEach((story, index) => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                
                // Generate a unique ID for the synopsis container for this story
                const synopsisContainerId = `synopsis-item-${index}`; 

                resultItem.innerHTML = `
                    <h3>${story.title}</h3>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <button class="toggle-synopsis-btn" data-story-link="${story.link}" data-synopsis-id="${synopsisContainerId}">Show Synopsis</button>
                        <a href="${story.link}" target="_blank" class="read-more-btn">Read more</a>
                    </div>
                    <div id="${synopsisContainerId}" class="synopsis-container"></div> `;
                resultsContainer.appendChild(resultItem);
            });

            // Attach event listeners to the "Show/Hide Synopsis" buttons
            document.querySelectorAll('.toggle-synopsis-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const storyLink = event.target.dataset.storyLink;
                    const synopsisId = event.target.dataset.synopsisId;
                    toggleSynopsis(event.target, storyLink, synopsisId); // Pass the button element
                });
            });

        } else {
            resultsContainer.innerHTML = '<p>No results found.</p>';
        }
        renderResults(stories);
    } catch (error) {
        console.error("Error executing search:", error);
        resultsContainer.innerHTML = '<p class="error">Error performing search. Please try again.</p>';
    }
}

// Function to render results
function renderResults(stories) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (stories.length === 0) {
        resultsContainer.innerHTML = '<p>No stories found matching your criteria.</p>';
        return;
    }

    const ul = document.createElement('ul');
    stories.forEach((story, index) => {
        const li = document.createElement('li');
        const synopsisContainerId = `synopsis-${index}`;

        // Create link for the story title
        const storyLink = document.createElement('a');
        storyLink.href = story.link;
        storyLink.textContent = story.title;
        storyLink.target = "_blank"; // Open in new tab
        storyLink.rel = "noopener noreferrer"; // Security best practice

        // Create categories display
        const categoriesSpan = document.createElement('span');
        categoriesSpan.className = 'story-categories';
        if (story.categories && story.categories.length > 0) {
            const fullCategoryNames = story.categories.map(catCode => categoryNames[catCode] || catCode);
            categoriesSpan.textContent = ` (${fullCategoryNames.join(', ')})`;
        }

        // Create synopsis toggle button
        const synopsisButton = document.createElement('button');
        synopsisButton.textContent = 'Show Synopsis';
        synopsisButton.className = 'synopsis-toggle-btn';
        synopsisButton.onclick = () => toggleSynopsis(synopsisButton, story.link, synopsisContainerId);

        // Create synopsis container
        const synopsisDiv = document.createElement('div');
        synopsisDiv.id = synopsisContainerId;
        synopsisDiv.className = 'synopsis-container';
        synopsisDiv.style.display = 'none'; // Hidden by default

        li.appendChild(storyLink);
        li.appendChild(categoriesSpan);
        li.appendChild(document.createElement('br')); // Line break
        li.appendChild(synopsisButton);
        li.appendChild(synopsisDiv);
        ul.appendChild(li);
    });
    resultsContainer.appendChild(ul);
}

// Handle search button click
function handleSearchClick() {
    const searchInput = document.getElementById('search-input').value.trim();
    const selectedCheckboxes = document.querySelectorAll('.categories input[type="checkbox"]:checked');
    const selectedCategories = Array.from(selectedCheckboxes).map(cb => cb.value.split('/').pop().replace('.html', ''));

    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<p>Searching...</p>'; // Show loading message

    executeSearch(searchInput, selectedCategories);
}

// --- Dark Mode Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');

// Function to set theme based on a boolean (true for dark, false for light)
function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Check for saved theme preference on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme === 'dark');
    } else {
        // Default to light mode if no preference saved or first visit
        setTheme(false); 
    }
});

// Event listener for the theme toggle button
if (themeToggleBtn) { // Check if the button exists before adding listener
    themeToggleBtn.addEventListener('click', () => {
        // Toggle the theme based on the current body class
        setTheme(!document.body.classList.contains('dark-mode'));
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