// Global Variables
let allDrinks = [];
let displayedDrinks = [];
let favorites = [];
let currentFilter = 'all';
let currentPage = 1;
const drinksPerPage = 12;

// API Endpoints
const COCKTAIL_API = 'https://www.thecocktaildb.com/api/json/v1/1/';
const COFFEE_RECIPES = [
    {
        idDrink: 'coffee1',
        strDrink: 'Espresso',
        strDrinkThumb: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e76?w=400',
        strCategory: 'Coffee',
        strAlcoholic: 'Non alcoholic',
        strInstructions: 'Espresso hazırlamak için öğütülmüş kahve çekirdeklerinden sıcak su geçirin. 25-30 saniye içinde 30ml espresso elde edin.',
        strIngredient1: 'Espresso çekirdekleri',
        strMeasure1: '18-20g'
    },
    {
        idDrink: 'coffee2',
        strDrink: 'Cappuccino',
        strDrinkThumb: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
        strCategory: 'Coffee',
        strAlcoholic: 'Non alcoholic',
        strInstructions: 'Espresso hazırladıktan sonra, süt köpüğü ekleyin. 1/3 espresso, 1/3 sıcak süt, 1/3 süt köpüğü oranında karıştırın.',
        strIngredient1: 'Espresso',
        strMeasure1: '30ml',
        strIngredient2: 'Süt',
        strMeasure2: '60ml'
    },
    {
        idDrink: 'coffee3',
        strDrink: 'Latte',
        strDrinkThumb: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400',
        strCategory: 'Coffee',
        strAlcoholic: 'Non alcoholic',
        strInstructions: 'Espresso üzerine bol miktarda buğulanmış süt ekleyin. Üzerine ince bir tabaka süt köpüğü ekleyin.',
        strIngredient1: 'Espresso',
        strMeasure1: '30ml',
        strIngredient2: 'Buğulanmış süt',
        strMeasure2: '150ml'
    },
    {
        idDrink: 'coffee4',
        strDrink: 'Americano',
        strDrinkThumb: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
        strCategory: 'Coffee',
        strAlcoholic: 'Non alcoholic',
        strInstructions: 'Çift espresso shot hazırlayın ve üzerine sıcak su ekleyin. Espresso lezzetini koruyarak sulandırın.',
        strIngredient1: 'Espresso',
        strMeasure1: '60ml',
        strIngredient2: 'Sıcak su',
        strMeasure2: '120ml'
    },
    {
        idDrink: 'coffee5',
        strDrink: 'Mocha',
        strDrinkThumb: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        strCategory: 'Coffee',
        strAlcoholic: 'Non alcoholic',
        strInstructions: 'Espresso, çikolata sosu ve buğulanmış süt karıştırın. Üzerine çırpılmış krema ekleyin.',
        strIngredient1: 'Espresso',
        strMeasure1: '30ml',
        strIngredient2: 'Çikolata sosu',
        strMeasure2: '15ml',
        strIngredient3: 'Buğulanmış süt',
        strMeasure3: '100ml'
    },
    {
        idDrink: 'coffee6',
        strDrink: 'Macchiato',
        strDrinkThumb: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400',
        strCategory: 'Coffee',
        strAlcoholic: 'Non alcoholic',
        strInstructions: 'Espresso hazırlayın ve üzerine bir kaşık süt köpüğü ekleyin. İtalyanca "lekeli" anlamına gelir.',
        strIngredient1: 'Espresso',
        strMeasure1: '30ml',
        strIngredient2: 'Süt köpüğü',
        strMeasure2: '1 kaşık'
    }
];

// DOM Elements
const loadingScreen = document.getElementById('loading');
const cocktailsGrid = document.getElementById('cocktailsGrid');
const coffeeGrid = document.getElementById('coffeeGrid');
const favoritesGrid = document.getElementById('favoritesGrid');
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.filter-tab');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const modal = document.getElementById('drinkModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Load favorites from localStorage simulation (using variables instead)
    loadFavorites();
    
    // Load initial cocktails
    await loadPopularCocktails();
    
    // Load coffee recipes
    loadCoffeeRecipes();
    
    // Setup event listeners
    setupEventListeners();
    
    // Hide loading screen
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
}

function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', debounce(searchDrinks, 300));
    
    // Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.type;
            filterDrinks();
        });
    });
    
    // Load more button
    loadMoreBtn.addEventListener('click', loadMoreDrinks);
    
    // Modal events
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            scrollToSection(target);
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// API Functions
async function loadPopularCocktails() {
    try {
        showLoading(cocktailsGrid);
        
        // Load multiple categories
        const categories = ['Cocktail', 'Ordinary_Drink', 'Shot'];
        const promises = categories.map(category => 
            fetch(`${COCKTAIL_API}filter.php?c=${category}`)
                .then(response => response.json())
        );
        
        const results = await Promise.all(promises);
        const cocktails = [];
        
        results.forEach(result => {
            if (result.drinks) {
                cocktails.push(...result.drinks.slice(0, 8));
            }
        });
        
        // Shuffle and get detailed info for each cocktail
        const shuffledCocktails = cocktails.sort(() => 0.5 - Math.random()).slice(0, 24);
        const detailedCocktails = await Promise.all(
            shuffledCocktails.map(cocktail => 
                fetch(`${COCKTAIL_API}lookup.php?i=${cocktail.idDrink}`)
                    .then(response => response.json())
                    .then(data => data.drinks[0])
            )
        );
        
        allDrinks = [...detailedCocktails, ...COFFEE_RECIPES];
        displayedDrinks = [...allDrinks];
        renderDrinks(cocktailsGrid, displayedDrinks.slice(0, drinksPerPage));
        
        hideLoading(cocktailsGrid);
    } catch (error) {
        console.error('Error loading cocktails:', error);
        showError(cocktailsGrid, 'Kokteyller yüklenirken hata oluştu');
    }
}

function loadCoffeeRecipes() {
    renderDrinks(coffeeGrid, COFFEE_RECIPES);
}

async function searchDrinks() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length === 0) {
        displayedDrinks = [...allDrinks];
        filterDrinks();
        return;
    }
    
    showLoading(cocktailsGrid);
    
    try {
        // Search in local drinks first
        let results = allDrinks.filter(drink => 
            drink.strDrink.toLowerCase().includes(query) ||
            (drink.strInstructions && drink.strInstructions.toLowerCase().includes(query))
        );
        
        // If no local results, search API
        if (results.length === 0) {
            const response = await fetch(`${COCKTAIL_API}search.php?s=${query}`);
            const data = await response.json();
            
            if (data.drinks) {
                results = data.drinks;
            }
        }
        
        displayedDrinks = results;
        currentPage = 1;
        filterDrinks();
        
    } catch (error) {
        console.error('Search error:', error);
        displayedDrinks = [];
        renderDrinks(cocktailsGrid, []);
    }
    
    hideLoading(cocktailsGrid);
}

function filterDrinks() {
    let filtered = [...displayedDrinks];
    
    switch (currentFilter) {
        case 'alcoholic':
            filtered = filtered.filter(drink => drink.strAlcoholic === 'Alcoholic');
            break;
        case 'non-alcoholic':
            filtered = filtered.filter(drink => 
                drink.strAlcoholic === 'Non alcoholic' || drink.strCategory === 'Coffee'
            );
            break;
        case 'coffee':
            filtered = filtered.filter(drink => drink.strCategory === 'Coffee');
            break;
    }
    
    renderDrinks(cocktailsGrid, filtered.slice(0, currentPage * drinksPerPage));
    
    // Show/hide load more button
    if (filtered.length > currentPage * drinksPerPage) {
        loadMoreBtn.style.display = 'inline-flex';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

function loadMoreDrinks() {
    currentPage++;
    filterDrinks();
}

// Render Functions
function renderDrinks(container, drinks) {
    if (drinks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Sonuç bulunamadı</h3>
                <p>Arama kriterlerinizi değiştirmeyi deneyin</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = drinks.map(drink => createDrinkCard(drink)).join('');
    
    // Add animation to cards
    const cards = container.querySelectorAll('.drink-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
}

function createDrinkCard(drink) {
    const isFavorite = favorites.some(fav => fav.idDrink === drink.idDrink);
    const description = truncateText(drink.strInstructions || 'Lezzetli bir içecek tarifi', 100);
    
    return `
        <div class="drink-card" onclick="openDrinkModal('${drink.idDrink}')">
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${drink.idDrink}')">
                <i class="fas fa-heart"></i>
            </button>
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="drink-image" loading="lazy">
            <div class="drink-info">
                <h3 class="drink-name">${drink.strDrink}</h3>
                <p class="drink-category">${getCategoryText(drink)}</p>
                <p class="drink-description">${description}</p>
            </div>
        </div>
    `;
}

// Modal Functions
async function openDrinkModal(drinkId) {
    let drink = allDrinks.find(d => d.idDrink === drinkId);
    
    if (!drink) {
        try {
            const response = await fetch(`${COCKTAIL_API}lookup.php?i=${drinkId}`);
            const data = await response.json();
            drink = data.drinks[0];
        } catch (error) {
            console.error('Error loading drink details:', error);
            return;
        }
    }
    
    const ingredients = getIngredients(drink);
    const isFavorite = favorites.some(fav => fav.idDrink === drink.idDrink);
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="modal-image">
            <div class="modal-overlay">
                <h2 class="modal-title">${drink.strDrink}</h2>
                <p class="modal-category">${getCategoryText(drink)}</p>
            </div>
        </div>
        <div class="modal-body">
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="toggleFavorite('${drink.idDrink}')">
                    <i class="fas fa-heart ${isFavorite ? 'active' : ''}"></i>
                    ${isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </button>
            </div>
            <div class="ingredients-section">
                <h3><i class="fas fa-list"></i> Malzemeler</h3>
                <div class="ingredients-list">
                    ${ingredients.map(ing => `
                        <div class="ingredient-item">
                            <span class="ingredient-name">${ing.name}</span>
                            <span class="ingredient-measure">${ing.measure}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="instructions-section">
                <h3><i class="fas fa-clipboard-list"></i> Hazırlanışı</h3>
                <p class="instructions">${drink.strInstructions || 'Hazırlanış talimatları mevcut değil.'}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModalFunc() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Favorites Functions
function toggleFavorite(drinkId) {
    const drink = allDrinks.find(d => d.idDrink === drinkId);
    if (!drink) return;
    
    const existingIndex = favorites.findIndex(fav => fav.idDrink === drinkId);
    
    if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
        showNotification('Favorilerden çıkarıldı', 'success');
    } else {
        favorites.push(drink);
        showNotification('Favorilere eklendi', 'success');
    }
    
    saveFavorites();
    updateFavoritesDisplay();
    updateFavoriteButtons();
}

function updateFavoritesDisplay() {
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="empty-favorites">
                <i class="fas fa-heart"></i>
                <h3>Henüz favori eklemediniz</h3>
                <p>Beğendiğiniz kokteyilleri kalp simgesine tıklayarak favorilere ekleyin</p>
            </div>
        `;
    } else {
        renderDrinks(favoritesGrid, favorites);
    }
}

function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const drinkId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
        const isFavorite = favorites.some(fav => fav.idDrink === drinkId);
        btn.classList.toggle('active', isFavorite);
    });
}

function loadFavorites() {
    // Simulate localStorage with in-memory storage
    favorites = [];
}

function saveFavorites() {
    // Simulate localStorage save
    console.log('Favorites saved:', favorites.length);
}

// Utility Functions
function getIngredients(drink) {
    const ingredients = [];
    
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim()) {
            ingredients.push({
                name: ingredient.trim(),
                measure: measure ? measure.trim() : 'Tat alana kadar'
            });
        }
    }
    
    return ingredients;
}

function getCategoryText(drink) {
    if (drink.strCategory === 'Coffee') {
        return 'Kahve';
    }
    return drink.strAlcoholic === 'Alcoholic' ? 'Alkollü' : 'Alkolsüz';
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading(container) {
    container.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Yükleniyor...</p>
        </div>
    `;
}

function hideLoading(container) {
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

function showError(container, message) {
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Hata</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Tekrar Dene</button>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Navigation Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const sectionTop = section.offsetTop - headerHeight;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// Random Cocktail Function
async function getRandomCocktail() {
    try {
        showNotification('Rastgele kokteyl aranıyor...', 'info');
        const response = await fetch(`${COCKTAIL_API}random.php`);
        const data = await response.json();
        
        if (data.drinks && data.drinks[0]) {
            openDrinkModal(data.drinks[0].idDrink);
        }
    } catch (error) {
        console.error('Error getting random cocktail:', error);
        showNotification('Rastgele kokteyl alınırken hata oluştu', 'error');
    }
}

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Add CSS for additional animations and styles
const additionalStyles = `
    .fade-in-up {
        animation: fadeInUp 0.6s ease forwards;
        opacity: 0;
        transform: translateY(30px);
    }
    
    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        grid-column: 1 / -1;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .error-message {
        text-align: center;
        padding: 3rem;
        grid-column: 1 / -1;
        color: #666;
    }
    
    .error-message i {
        font-size: 3rem;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        color: var(--dark-color);
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: var(--shadow-heavy);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1500;
        min-width: 250px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left: 4px solid #4CAF50;
    }
    
    .notification.error {
        border-left: 4px solid #f44336;
    }
    
    .notification.info {
        border-left: 4px solid var(--primary-color);
    }
    
    .modal-actions {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .empty-state {
        text-align: center;
        padding: 3rem;
        grid-column: 1 / -1;
        color: #666;
    }
    
    .empty-state i {
        font-size: 4rem;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
`;

// Add additional styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);