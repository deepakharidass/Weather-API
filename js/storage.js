/**
 * Storage Module - Handles Local Storage operations for user preferences and favorites
 */

const Storage = (() => {
    // Storage keys
    const KEYS = {
        PREFERENCES: 'weatherPreferences',
        FAVORITES: 'weatherFavorites',
        LAST_CITY: 'lastSearchedCity'
    };

    /**
     * Default preferences structure
     */
    const DEFAULT_PREFERENCES = {
        defaultCity: 'London',
        units: 'metric',
        theme: 'light'
    };

    /**
     * Initialize storage with default preferences if they don't exist
     */
    function init() {
        if (!getPreferences()) {
            savePreferences(DEFAULT_PREFERENCES);
        }
        loadTheme();
    }

    /**
     * Save user preferences to Local Storage
     * @param {Object} prefs - Preferences object
     */
    function savePreferences(prefs) {
        try {
            localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
            console.log('Preferences saved successfully');
        } catch (error) {
            console.error('Error saving preferences:', error);
            showStorageError('Failed to save preferences');
        }
    }

    /**
     * Load user preferences from Local Storage
     * @returns {Object} Preferences object or default preferences
     */
    function getPreferences() {
        try {
            const prefs = localStorage.getItem(KEYS.PREFERENCES);
            return prefs ? JSON.parse(prefs) : null;
        } catch (error) {
            console.error('Error loading preferences:', error);
            return DEFAULT_PREFERENCES;
        }
    }

    /**
     * Update a specific preference
     * @param {string} key - Preference key
     * @param {*} value - Preference value
     */
    function updatePreference(key, value) {
        try {
            const prefs = getPreferences() || DEFAULT_PREFERENCES;
            prefs[key] = value;
            savePreferences(prefs);
        } catch (error) {
            console.error('Error updating preference:', error);
        }
    }

    /**
     * Clear all preferences and reset to defaults
     */
    function clearPreferences() {
        try {
            localStorage.removeItem(KEYS.PREFERENCES);
            localStorage.removeItem(KEYS.FAVORITES);
            localStorage.removeItem(KEYS.LAST_CITY);
            savePreferences(DEFAULT_PREFERENCES);
            console.log('All preferences cleared');
        } catch (error) {
            console.error('Error clearing preferences:', error);
        }
    }

    /**
     * Save theme preference
     * @param {string} theme - 'light' or 'dark'
     */
    function saveTheme(theme) {
        try {
            updatePreference('theme', theme);
            applyTheme(theme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }

    /**
     * Load and apply saved theme
     */
    function loadTheme() {
        try {
            const prefs = getPreferences();
            const theme = prefs?.theme || 'light';
            applyTheme(theme);
        } catch (error) {
            console.error('Error loading theme:', error);
            applyTheme('light');
        }
    }

    /**
     * Apply theme to document
     * @param {string} theme - 'light' or 'dark'
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeButton(theme);
    }

    /**
     * Update theme button icon
     * @param {string} theme - 'light' or 'dark'
     */
    function updateThemeButton(theme) {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            const icon = themeBtn.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = theme === 'light' ? '🌙' : '☀️';
            }
        }
    }

    /**
     * Add city to favorites
     * @param {Object} cityData - City weather data
     */
    function addFavorite(cityData) {
        try {
            const favorites = getFavorites();
            
            // Check if city already exists
            const cityName = cityData.name.toLowerCase();
            const exists = favorites.some(fav => fav.name.toLowerCase() === cityName);
            
            if (exists) {
                console.log('City already in favorites');
                return false;
            }

            favorites.push({
                name: cityData.name,
                temperature: cityData.main.temp,
                description: cityData.weather[0].description,
                icon: cityData.weather[0].icon,
                timestamp: new Date().toISOString()
            });

            localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
            console.log('Favorite added successfully');
            return true;
        } catch (error) {
            console.error('Error adding favorite:', error);
            showStorageError('Failed to add favorite');
            return false;
        }
    }

    /**
     * Remove city from favorites
     * @param {string} cityName - City name to remove
     */
    function removeFavorite(cityName) {
        try {
            const favorites = getFavorites();
            const filtered = favorites.filter(fav => fav.name.toLowerCase() !== cityName.toLowerCase());
            localStorage.setItem(KEYS.FAVORITES, JSON.stringify(filtered));
            console.log('Favorite removed successfully');
            return true;
        } catch (error) {
            console.error('Error removing favorite:', error);
            showStorageError('Failed to remove favorite');
            return false;
        }
    }

    /**
     * Get all favorite cities
     * @returns {Array} Array of favorite cities
     */
    function getFavorites() {
        try {
            const favorites = localStorage.getItem(KEYS.FAVORITES);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    /**
     * Check if a city is in favorites
     * @param {string} cityName - City name to check
     * @returns {boolean} True if city is in favorites
     */
    function isFavorite(cityName) {
        const favorites = getFavorites();
        return favorites.some(fav => fav.name.toLowerCase() === cityName.toLowerCase());
    }

    /**
     * Clear all favorites
     */
    function clearFavorites() {
        try {
            localStorage.removeItem(KEYS.FAVORITES);
            console.log('All favorites cleared');
        } catch (error) {
            console.error('Error clearing favorites:', error);
        }
    }

    /**
     * Save last searched city
     * @param {string} cityName - City name
     */
    function saveLastCity(cityName) {
        try {
            localStorage.setItem(KEYS.LAST_CITY, cityName);
        } catch (error) {
            console.error('Error saving last city:', error);
        }
    }

    /**
     * Get last searched city
     * @returns {string} Last searched city name or default city
     */
    function getLastCity() {
        try {
            const lastCity = localStorage.getItem(KEYS.LAST_CITY);
            const prefs = getPreferences();
            return lastCity || prefs?.defaultCity || 'London';
        } catch (error) {
            console.error('Error getting last city:', error);
            return 'London';
        }
    }

    /**
     * Show storage error message
     * @param {string} message - Error message
     */
    function showStorageError(message) {
        console.warn('Storage error:', message);
        // Could dispatch an event or call error handler here
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage details
     */
    function getStorageInfo() {
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }
            return {
                totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
                itemCount: localStorage.length,
                available: 'Check browser storage settings'
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }

    /**
     * Export storage data as JSON
     * @returns {Object} All stored data
     */
    function exportData() {
        return {
            preferences: getPreferences(),
            favorites: getFavorites(),
            lastCity: getLastCity(),
            exportTime: new Date().toISOString()
        };
    }

    /**
     * Import storage data from JSON
     * @param {Object} data - Data to import
     */
    function importData(data) {
        try {
            if (data.preferences) savePreferences(data.preferences);
            if (data.favorites) localStorage.setItem(KEYS.FAVORITES, JSON.stringify(data.favorites));
            if (data.lastCity) saveLastCity(data.lastCity);
            console.log('Data imported successfully');
        } catch (error) {
            console.error('Error importing data:', error);
            showStorageError('Failed to import data');
        }
    }

    // Public API
    return {
        init,
        savePreferences,
        getPreferences,
        updatePreference,
        clearPreferences,
        saveTheme,
        loadTheme,
        applyTheme,
        addFavorite,
        removeFavorite,
        getFavorites,
        isFavorite,
        clearFavorites,
        saveLastCity,
        getLastCity,
        getStorageInfo,
        exportData,
        importData,
        KEYS,
        DEFAULT_PREFERENCES
    };
})();

// Initialize storage when script loads
Storage.init();
