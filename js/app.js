/**
 * Main Application Module - Weather Dashboard
 * Handles UI interactions, data fetching, and user preferences
 */

const WeatherApp = (() => {
    // DOM Elements
    const elements = {
        // Search
        cityInput: document.getElementById('cityInput'),
        searchBtn: document.getElementById('searchBtn'),
        suggestionsList: document.getElementById('suggestionsList'),
        
        // Current Weather
        currentWeatherSection: document.getElementById('currentWeatherSection'),
        currentWeather: document.getElementById('currentWeather'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        errorMessage: document.getElementById('errorMessage'),
        
        // Weather Details
        cityName: document.getElementById('cityName'),
        weatherDate: document.getElementById('weatherDate'),
        weatherIcon: document.getElementById('weatherIcon'),
        temperature: document.getElementById('temperature'),
        tempUnit: document.getElementById('tempUnit'),
        weatherDescription: document.getElementById('weatherDescription'),
        humidity: document.getElementById('humidity'),
        windSpeed: document.getElementById('windSpeed'),
        feelsLike: document.getElementById('feelsLike'),
        pressure: document.getElementById('pressure'),
        addFavoriteBtn: document.getElementById('addFavoriteBtn'),
        
        // Preferences
        unitToggle: document.getElementById('unitToggle'),
        themeToggle: document.getElementById('themeToggle'),
        clearBtn: document.getElementById('clearBtn'),
        
        // Favorites
        favoritesSection: document.getElementById('favoritesSection'),
        favoritesList: document.getElementById('favoritesList'),
        
        // Forecast
        forecastSection: document.getElementById('forecastSection'),
        forecastContainer: document.getElementById('forecastContainer'),
        
        // Other
        body: document.body
    };

    // Application state
    let state = {
        currentCity: null,
        currentWeatherData: null,
        forecastData: null,
        units: 'metric',
        theme: 'light',
        isLoading: false
    };

    /**
     * Initialize the application
     */
    function init() {
        console.log('Initializing Weather Dashboard...');
        
        // Load preferences
        loadPreferences();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load last searched city or default
        const lastCity = Storage.getLastCity();
        loadWeather(lastCity);
        
        // Display favorites
        displayFavorites();
        
        console.log('Weather Dashboard initialized successfully');
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Search functionality
        elements.searchBtn.addEventListener('click', handleSearch);
        elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });

        // Search suggestions
        elements.cityInput.addEventListener('input', debounce(handleSearchInput, 300));

        // Preferences
        elements.unitToggle.addEventListener('change', handleUnitChange);
        elements.themeToggle.addEventListener('click', handleThemeToggle);
        elements.clearBtn.addEventListener('click', handleClearPreferences);

        // Favorites
        elements.addFavoriteBtn.addEventListener('click', handleAddFavorite);

        // Window resize
        window.addEventListener('resize', debounce(() => {
            console.log('Window resized - adjusting layout');
        }, 250));

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target !== elements.cityInput && e.target !== elements.suggestionsList) {
                elements.suggestionsList.innerHTML = '';
            }
        });
    }

    /**
     * Load user preferences from storage
     */
    function loadPreferences() {
        const prefs = Storage.getPreferences();
        state.units = prefs?.units || 'metric';
        state.theme = prefs?.theme || 'light';

        // Update UI
        elements.unitToggle.value = state.units;
        Storage.applyTheme(state.theme);
    }

    /**
     * Handle city search
     */
    async function handleSearch() {
        const city = elements.cityInput.value.trim();
        
        if (!city) {
            showError('Please enter a city name');
            return;
        }

        elements.suggestionsList.innerHTML = '';
        await loadWeather(city);
    }

    /**
     * Handle search input for autocomplete suggestions
     */
    async function handleSearchInput() {
        const city = elements.cityInput.value.trim();
        
        if (!city || city.length < 2) {
            elements.suggestionsList.innerHTML = '';
            return;
        }

        try {
            const suggestions = await WeatherAPI.searchCities(city);
            displaySuggestions(suggestions);
        } catch (error) {
            console.warn('Error fetching suggestions:', error);
        }
    }

    /**
     * Display autocomplete suggestions
     * @param {Array} suggestions - Array of city suggestions
     */
    function displaySuggestions(suggestions) {
        elements.suggestionsList.innerHTML = '';

        if (suggestions.length === 0) {
            elements.suggestionsList.innerHTML = '<div class="suggestion-item" style="opacity: 0.5;">No cities found</div>';
            return;
        }

        suggestions.forEach(city => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = city.displayName;
            div.setAttribute('role', 'option');
            div.addEventListener('click', () => {
                elements.cityInput.value = city.name;
                elements.suggestionsList.innerHTML = '';
                loadWeather(city.name);
            });
            elements.suggestionsList.appendChild(div);
        });
    }

    /**
     * Load weather data for a city
     * @param {string} city - City name
     */
    async function loadWeather(city) {
        if (!city) return;

        state.isLoading = true;
        showLoading(true);
        clearError();

        try {
            // Check if API is configured
            if (!WeatherAPI.isApiKeyConfigured()) {
                throw new Error('API key not configured. Please add your OpenWeatherMap API key to js/api.js');
            }

            // Fetch current weather
            state.currentWeatherData = await WeatherAPI.getCurrentWeather(city, state.units);
            state.currentCity = state.currentWeatherData.name;

            // Fetch forecast
            state.forecastData = await WeatherAPI.getForecast(city, state.units);

            // Update UI
            elements.cityInput.value = state.currentCity;
            Storage.saveLastCity(state.currentCity);
            
            displayCurrentWeather();
            displayForecast();
            displayFavorites();
            
            // Update favorite button
            updateFavoriteButton();

            console.log('Weather loaded successfully for:', state.currentCity);
        } catch (error) {
            console.error('Error loading weather:', error);
            showError(error.message);
        } finally {
            state.isLoading = false;
            showLoading(false);
        }
    }

    /**
     * Display current weather information
     */
    function displayCurrentWeather() {
        if (!state.currentWeatherData) return;

        const data = state.currentWeatherData;
        const unit = state.units === 'metric' ? '°C' : '°F';
        const windUnit = state.units === 'metric' ? 'm/s' : 'mph';

        // Update weather header
        elements.cityName.textContent = `${data.name}, ${data.country}`;
        elements.weatherDate.textContent = formatDate(new Date(data.timestamp * 1000));

        // Update weather icon
        const iconUrl = WeatherAPI.getWeatherIconUrl(data.icon, '4x');
        elements.weatherIcon.src = iconUrl;
        elements.weatherIcon.alt = data.description;

        // Update temperature
        elements.temperature.textContent = Math.round(data.temperature);
        elements.tempUnit.textContent = unit;
        elements.weatherDescription.textContent = data.description;

        // Update weather details
        elements.humidity.innerHTML = `<span class="info-label">Humidity</span><span class="info-value">${data.humidity}%</span>`;
        elements.windSpeed.innerHTML = `<span class="info-label">Wind Speed</span><span class="info-value">${data.windSpeed.toFixed(1)} ${windUnit}</span>`;
        elements.feelsLike.innerHTML = `<span class="info-label">Feels Like</span><span class="info-value">${Math.round(data.feelsLike)}${unit}</span>`;
        elements.pressure.innerHTML = `<span class="info-label">Pressure</span><span class="info-value">${data.pressure} mb</span>`;

        // Show current weather section
        elements.currentWeather.style.display = 'block';
        elements.forecastSection.style.display = 'block';
    }

    /**
     * Display 5-day forecast
     */
    function displayForecast() {
        if (!state.forecastData || state.forecastData.length === 0) {
            elements.forecastSection.style.display = 'none';
            return;
        }

        const unit = state.units === 'metric' ? '°C' : '°F';
        elements.forecastContainer.innerHTML = '';

        state.forecastData.forEach(day => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-day">${day.day}</div>
                <img src="${WeatherAPI.getWeatherIconUrl(day.icon, '2x')}" alt="${day.description}" class="forecast-icon">
                <div class="forecast-description">${day.description}</div>
                <div class="forecast-temp">
                    <span class="forecast-temp-max">${Math.round(day.tempMax)}${unit}</span>
                    <span class="forecast-temp-min">${Math.round(day.tempMin)}${unit}</span>
                </div>
                <div class="forecast-details">
                    💧 ${day.humidity}% | 💨 ${day.windSpeed.toFixed(1)}
                </div>
            `;
            elements.forecastContainer.appendChild(forecastItem);
        });

        elements.forecastSection.style.display = 'block';
    }

    /**
     * Display favorite cities
     */
    function displayFavorites() {
        const favorites = Storage.getFavorites();
        
        if (favorites.length === 0) {
            elements.favoritesSection.style.display = 'none';
            return;
        }

        const unit = state.units === 'metric' ? '°C' : '°F';
        elements.favoritesList.innerHTML = '';

        favorites.forEach(city => {
            const card = document.createElement('div');
            card.className = 'favorite-card';
            card.innerHTML = `
                <button class="favorite-card-remove" aria-label="Remove ${city.name} from favorites">×</button>
                <div class="favorite-card-name">${city.name}</div>
                <div class="favorite-card-temp">${Math.round(city.temperature)}${unit}</div>
                <div style="font-size: 0.9rem; opacity: 0.9; text-transform: capitalize;">${city.description}</div>
            `;

            // Click to load weather
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('favorite-card-remove')) {
                    loadWeather(city.name);
                }
            });

            // Remove button
            const removeBtn = card.querySelector('.favorite-card-remove');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (Storage.removeFavorite(city.name)) {
                    displayFavorites();
                    if (state.currentCity === city.name) {
                        updateFavoriteButton();
                    }
                }
            });

            elements.favoritesList.appendChild(card);
        });

        elements.favoritesSection.style.display = 'block';
    }

    /**
     * Handle adding city to favorites
     */
    function handleAddFavorite() {
        if (!state.currentWeatherData) {
            showError('Please search for a city first');
            return;
        }

        const success = Storage.addFavorite(state.currentWeatherData);
        
        if (success) {
            updateFavoriteButton();
            displayFavorites();
            showSuccess('City added to favorites!');
        } else {
            showError('City is already in favorites');
        }
    }

    /**
     * Update favorite button state
     */
    function updateFavoriteButton() {
        if (!state.currentCity) {
            elements.addFavoriteBtn.classList.remove('added');
            return;
        }

        const isFav = Storage.isFavorite(state.currentCity);
        
        if (isFav) {
            elements.addFavoriteBtn.classList.add('added');
            elements.addFavoriteBtn.textContent = '★ Added to Favorites';
        } else {
            elements.addFavoriteBtn.classList.remove('added');
            elements.addFavoriteBtn.textContent = '⭐ Add to Favorites';
        }
    }

    /**
     * Handle unit change
     */
    function handleUnitChange() {
        const newUnit = elements.unitToggle.value;
        state.units = newUnit;
        Storage.updatePreference('units', newUnit);

        if (state.currentWeatherData) {
            loadWeather(state.currentCity);
        }
    }

    /**
     * Handle theme toggle
     */
    function handleThemeToggle() {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        state.theme = newTheme;
        Storage.saveTheme(newTheme);
    }

    /**
     * Handle clear preferences
     */
    function handleClearPreferences() {
        if (window.confirm('Are you sure you want to clear all preferences and favorites? This cannot be undone.')) {
            Storage.clearPreferences();
            Storage.clearFavorites();
            location.reload();
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    function showError(message) {
        elements.errorMessage.style.display = 'block';
        elements.errorMessage.textContent = `❌ Error: ${message}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            clearError();
        }, 5000);
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    function showSuccess(message) {
        const tempElement = document.createElement('div');
        tempElement.className = 'error-message';
        tempElement.textContent = `✅ ${message}`;
        tempElement.style.backgroundColor = '#27ae60';
        tempElement.style.display = 'block';
        
        elements.errorMessage.parentNode.insertBefore(tempElement, elements.errorMessage.nextSibling);
        
        setTimeout(() => {
            tempElement.remove();
        }, 3000);
    }

    /**
     * Clear error message
     */
    function clearError() {
        elements.errorMessage.style.display = 'none';
    }

    /**
     * Show/hide loading spinner
     * @param {boolean} show - Show or hide
     */
    function showLoading(show) {
        if (show) {
            elements.loadingSpinner.style.display = 'flex';
            elements.currentWeather.style.display = 'none';
        } else {
            elements.loadingSpinner.style.display = 'none';
            if (state.currentWeatherData) {
                elements.currentWeather.style.display = 'block';
            }
        }

        elements.searchBtn.disabled = show;
    }

    /**
     * Format date for display
     * @param {Date} date - Date object
     * @returns {string} Formatted date string
     */
    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Debounce function for performance optimization
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
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

    /**
     * Get application state
     * @returns {Object} Current state
     */
    function getState() {
        return { ...state };
    }

    /**
     * Get weather details
     * @returns {Object} Current weather data
     */
    function getWeatherData() {
        return state.currentWeatherData;
    }

    /**
     * Get forecast data
     * @returns {Array} Forecast data
     */
    function getForecastData() {
        return state.forecastData;
    }

    // Public API
    return {
        init,
        loadWeather,
        getState,
        getWeatherData,
        getForecastData,
        displayFavorites,
        handleAddFavorite
    };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    WeatherApp.init();
});

// Handle errors not caught by try-catch
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
