// API key for NewsAPI
const API_KEY = '1bb3cf61e8924f15b2b5122093ee0ce9';
const newsContainer = document.getElementById('news-container');
const checkboxes = document.querySelectorAll('input[type="checkbox"]');

// Categories mapping for NewsAPI
const categoryMapping = {
    international: 'world',
    national: 'general',
    politics: 'politics',
    sports: 'sports'
};

// Function to create a news card
function createNewsCard(article) {
    const card = document.createElement('div');
    card.className = 'news-card';
    
    const image = article.urlToImage 
        ? `<img src="${article.urlToImage}" alt="${article.title}" class="news-image">`
        : '<div class="news-image" style="background-color: rgba(57, 73, 171, 0.8);"></div>';
    
    card.innerHTML = `
        ${image}
        <div class="news-content">
            <h3 class="news-title">${article.title}</h3>
            <p class="news-description">${article.description || 'No description available'}</p>
            <span class="news-category">${article.category || 'General'}</span>
            <a href="${article.url}" target="_blank">Read more</a>
        </div>
    `;
    
    return card;
}

// Function to create a clone of the news grid for continuous scrolling
function setupContinuousScrolling() {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;
    
    // Clone the news grid
    const clone = newsGrid.cloneNode(true);
    newsGrid.parentNode.appendChild(clone);
    
    // Reset animation when it completes
    newsGrid.addEventListener('animationend', () => {
        newsGrid.style.animation = 'none';
        setTimeout(() => {
            newsGrid.style.animation = 'scrollNews 400s linear infinite';
        }, 10);
    });
    
    clone.addEventListener('animationend', () => {
        clone.style.animation = 'none';
        setTimeout(() => {
            clone.style.animation = 'scrollNews 400s linear infinite';
        }, 10);
    });
}

// Function to fetch news
async function fetchNews() {
    const selectedCategories = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => categoryMapping[checkbox.id]);
    
    if (selectedCategories.length === 0) {
        newsContainer.innerHTML = '<p style="text-align: center; color: #ffd700;">Please select at least one category</p>';
        return;
    }

    try {
        const promises = selectedCategories.map(category =>
            fetch(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`)
                .then(response => response.json())
        );

        const results = await Promise.all(promises);
        const articles = results.flatMap(result => result.articles || []);
        
        // Clear previous news
        newsContainer.innerHTML = '';
        
        if (articles.length === 0) {
            newsContainer.innerHTML = '<p style="text-align: center; color: #ffd700;">No news articles found for the selected categories.</p>';
            return;
        }

        // Add category to each article and filter out duplicates
        const uniqueArticles = [];
        const seenUrls = new Set();

        articles.forEach(article => {
            if (!seenUrls.has(article.url)) {
                seenUrls.add(article.url);
                const category = selectedCategories.find(cat => 
                    article.url.toLowerCase().includes(cat) || 
                    article.title.toLowerCase().includes(cat)
                );
                article.category = category || 'General';
                uniqueArticles.push(article);
            }
        });

        // Sort by date (most recent first)
        uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        // Create news grid container
        const newsGrid = document.createElement('div');
        newsGrid.className = 'news-grid';
        
        // Display articles
        uniqueArticles.forEach(article => {
            newsGrid.appendChild(createNewsCard(article));
        });
        
        // Add the news grid to the container
        newsContainer.appendChild(newsGrid);
        
        // Setup continuous scrolling
        setupContinuousScrolling();
        
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContainer.innerHTML = '<p style="text-align: center; color: #ffd700;">Error loading news. Please try again later.</p>';
    }
}

// Add event listeners to checkboxes
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', fetchNews);
});

// Initial fetch
fetchNews();

// Refresh news every 5 minutes
setInterval(fetchNews, 5 * 60 * 1000); 