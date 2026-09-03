// Search Google functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.querySelector('.search-bar');
    
    if (searchBar) {
        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchQuery = searchBar.value.trim();
                
                if (searchQuery) {
                    // Redirect to Google search with the query
                    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                    window.open(googleSearchUrl, '_blank');
                    
                    // Clear the search bar
                    searchBar.value = '';
                }
            }
        });
    }
});

// Search Games functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchGamesInput = document.getElementById('searchGames');
    
    if (searchGamesInput) {
        const gameCards = document.querySelectorAll('.game-card');
        
        searchGamesInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            gameCards.forEach(card => {
                const title = card.querySelector('.game-card-title')?.textContent.toLowerCase() || '';
                const description = card.querySelector('.game-card-description')?.textContent.toLowerCase() || '';
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});

// Navigation
document.addEventListener('DOMContentLoaded', () => {
    const gamesBtn = document.querySelector('a[href="/games"]');
    const appsBtn = document.querySelector('a[href="/apps"]');
    const homeBtn = document.querySelector('a[href="/"]');
    
    // Handle navigation
    if (gamesBtn) {
        gamesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = './games.html';
        });
    }
    
    if (appsBtn) {
        appsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = './apps.html';
        });
    }
    
    if (homeBtn && homeBtn !== gamesBtn && homeBtn !== appsBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = './index.html';
        });
    }
});
