# Code Snippets & Api Reference

Quick reference guide for using the Weather Dashboard API and modifying the application.

## 📚 Table of Contents
- [Using Storage Module](#storage-module)
- [Using Weather API](#weather-api)
- [Using Main App](#main-app)
- [Common Customizations](#customizations)
- [Advanced Usage](#advanced)

---

## Storage Module

### Save User Preferences

```javascript
// Save complete preferences object
Storage.savePreferences({
    defaultCity: 'Tokyo',
    units: 'metric',
    theme: 'dark'
});

// Or update individual preference
Storage.updatePreference('units', 'imperial');
Storage.updatePreference('theme', 'light');
```

### Load User Preferences

```javascript
// Get all preferences
const prefs = Storage.getPreferences();
console.log(prefs.units);      // 'metric'
console.log(prefs.theme);      // 'light'
console.log(prefs.defaultCity); // 'London'

// Create defaults if needed
const prefs = Storage.getPreferences() || Storage.DEFAULT_PREFERENCES;
```

### Manage Favorites

```javascript
// Add a city to favorites
const cityData = {
    name: 'London',
    main: { temp: 15 },
    weather: [{ description: 'overcast', icon: '04d' }]
};
const success = Storage.addFavorite(cityData);

// Get all favorites
const favorites = Storage.getFavorites();
favorites.forEach(city => {
    console.log(city.name, city.temperature);
});

// Check if city is favorite
if (Storage.isFavorite('London')) {
    console.log('London is a favorite');
}

// Remove from favorites
Storage.removeFavorite('London');

// Clear all favorites
Storage.clearFavorites();
```

### Theme Management

```javascript
// Save theme preference
Storage.saveTheme('dark');

// Load and apply saved theme
Storage.loadTheme();

// Apply specific theme
Storage.applyTheme('light');

// Get current theme
const prefs = Storage.getPreferences();
console.log(prefs.theme); // 'light' or 'dark'
```

### Last Searched City

```javascript
// Save last searched city
Storage.saveLastCity('Paris');

// Get last searched city
const lastCity = Storage.getLastCity(); // 'Paris'
```

### Data Export/Import

```javascript
// Export all stored data as JSON
const allData = Storage.exportData();
console.log(allData);
// Output:
// {
//   preferences: {...},
//   favorites: [...],
//   lastCity: 'London',
//   exportTime: '2024-03-05T10:30:00Z'
// }

// Import data from exported JSON
Storage.importData(allData);
```

### Storage Information

```javascript
// Get storage usage info
const info = Storage.getStorageInfo();
console.log(info.totalSize);  // '2.50 KB'
console.log(info.itemCount);  // 3
```

---

## Weather API

### Fetch Current Weather

```javascript
// Get weather for a city
async function showWeather() {
    try {
        const weather = await WeatherAPI.getCurrentWeather('London', 'metric');
        
        console.log(weather.name);              // 'London'
        console.log(weather.temperature);       // 15
        console.log(weather.description);       // 'overcast clouds'
        console.log(weather.humidity);          // 72
        console.log(weather.windSpeed);         // 4.5
        console.log(weather.feelsLike);         // 14
        console.log(weather.pressure);          // 1013
        
        // Get icon URL
        const iconUrl = WeatherAPI.getWeatherIconUrl(weather.icon);
        document.querySelector('img').src = iconUrl;
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

showWeather();
```

### Fetch 5-Day Forecast

```javascript
// Get forecast for a city
async function showForecast() {
    try {
        const forecast = await WeatherAPI.getForecast('London', 'metric');
        
        forecast.forEach(day => {
            console.log(day.day);              // 'Mon, Mar 06'
            console.log(day.tempMax);          // 18
            console.log(day.tempMin);          // 12
            console.log(day.description);      // 'partly cloudy'
            console.log(day.humidity);         // 65
            console.log(day.windSpeed);        // 5.2
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

showForecast();
```

### Search Cities (Autocomplete)

```javascript
// Search for cities as user types
async function searchCities(query) {
    try {
        const cities = await WeatherAPI.searchCities(query);
        
        cities.forEach(city => {
            console.log(city.displayName);     // 'London, GB'
            console.log(city.name);            // 'London'
            console.log(city.country);         // 'GB'
            console.log(city.lat);             // 51.51
            console.log(city.lon);             // -0.13
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

searchCities('lon');
```

### Get Weather by Coordinates

```javascript
// Get weather for specific coordinates (geolocation)
async function getWeatherByLocation(latitude, longitude) {
    try {
        const weather = await WeatherAPI.getWeatherByCoords(latitude, longitude, 'metric');
        console.log(weather.name);             // City name
        console.log(weather.temperature);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

getWeatherByLocation(51.51, -0.13); // London coordinates
```

### Reverse Geocoding

```javascript
// Get city name from coordinates
async function getCityName(latitude, longitude) {
    try {
        const location = await WeatherAPI.getReverseGeo(latitude, longitude);
        console.log(location.name);            // 'London'
        console.log(location.country);         // 'GB'
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

getCityName(51.51, -0.13);
```

### Utility Functions

```javascript
// Format temperature
const temp = WeatherAPI.formatTemperature(15.7, 'metric');
console.log(temp); // '16°C'

const temp2 = WeatherAPI.formatTemperature(60.4, 'imperial');
console.log(temp2); // '60°F'

// Format wind speed
const wind = WeatherAPI.formatWindSpeed(4.5, 'metric');
console.log(wind); // '4.5 m/s'

const wind2 = WeatherAPI.formatWindSpeed(10, 'imperial');
console.log(wind2); // '10.0 mph'

// Get wind direction
const direction = WeatherAPI.getWindDirection(90);
console.log(direction); // 'E' (East)

// Get wind direction: 0=N, 45=NE, 90=E, 135=SE, 180=S, 225=SW, 270=W, 315=NW
```

### Cache Management

```javascript
// Clear API cache
WeatherAPI.clearCache();

// Get cache statistics
const stats = WeatherAPI.getCacheStats();
console.log(stats.size);    // Number of cached items
console.log(stats.entries); // Array of cached keys
```

### Check API Configuration

```javascript
// Check if API key is configured
if (WeatherAPI.isApiKeyConfigured()) {
    console.log('API is ready');
} else {
    console.log('Please configure API key');
}
```

---

## Main App

### Get Application State

```javascript
// Get current application state
const state = WeatherApp.getState();
console.log(state.currentCity);        // 'London'
console.log(state.units);              // 'metric'
console.log(state.theme);              // 'light'
console.log(state.isLoading);          // false
```

### Get Weather Data

```javascript
// Get current weather data
const weather = WeatherApp.getWeatherData();
console.log(weather.name);
console.log(weather.temperature);
console.log(weather.icon);
```

### Get Forecast Data

```javascript
// Get forecast data
const forecast = WeatherApp.getForecastData();
forecast.forEach(day => {
    console.log(day.day, day.tempMax, day.tempMin);
});
```

### Load Weather

```javascript
// Load weather for a city (same as search)
WeatherApp.loadWeather('Tokyo');

// With error handling
try {
    await WeatherApp.loadWeather('New York');
} catch (error) {
    console.error('Failed to load weather:', error);
}
```

### Display Favorites

```javascript
// Refresh favorites display
WeatherApp.displayFavorites();
```

### Add to Favorites

```javascript
// Programmatically add current weather to favorites
WeatherApp.handleAddFavorite();
```

---

## Customizations

### Change Primary Color

**File:** `css/styles.css` (Line 8)

```css
/* Before */
--primary-color: #3498db;

/* After - Change to any color */
--primary-color: #e74c3c;  /* Red */
--primary-color: #27ae60;  /* Green */
--primary-color: #f39c12;  /* Orange */
--primary-color: #9b59b6;  /* Purple */
```

### Add Custom Weather Details

**File:** `js/app.js` - In `displayCurrentWeather()` function

```javascript
// Add this to show visibility
function displayCurrentWeather() {
    // ... existing code ...
    
    // Add new detail
    const visibilityElement = document.createElement('div');
    visibilityElement.className = 'info-item';
    visibilityElement.innerHTML = `
        <span class="info-label">Visibility</span>
        <span class="info-value">${(data.visibility / 1000).toFixed(1)} km</span>
    `;
    elements.weatherInfoGrid.appendChild(visibilityElement);
}
```

### Customize Weather Icons

**File:** `js/app.js` - In `displayCurrentWeather()` function

```javascript
// Use custom emoji instead of API icons
const weatherEmojis = {
    '01d': '☀️',  // Clear sky day
    '01n': '🌙',  // Clear sky night
    '02d': '⛅',  // Few clouds day
    '02n': '☁️',  // Few clouds night
    '03d': '☁️',  // Scattered clouds
    '04d': '☁️',  // Broken clouds
    '09d': '🌧️',  // Shower rain
    '10d': '🌧️',  // Rain
    '11d': '⛈️',  // Thunderstorm
    '13d': '❄️',  // Snow
    '50d': '🌫️'   // Mist
};

// Use in display
elements.weatherIcon.textContent = weatherEmojis[data.icon] || '🌤️';
elements.weatherIcon.alt = data.description;
```

### Change Forecast Duration

**File:** `js/app.js` - In `displayForecast()` function

```javascript
// Show only 3 days instead of 5
state.forecastData.slice(0, 3).forEach(day => {
    // ... render day ...
});

// Or show 7 days
state.forecastData.slice(0, 7).forEach(day => {
    // ... render day ...
});
```

### Add Temperature Conversion

**File:** `js/app.js` - Add this utility function

```javascript
function convertTemperature(celsius, toUnit) {
    if (toUnit === 'fahrenheit') {
        return (celsius * 9/5) + 32;
    } else if (toUnit === 'kelvin') {
        return celsius + 273.15;
    }
    return celsius;
}

// Usage
const fahrenheit = convertTemperature(15, 'fahrenheit'); // 59
const kelvin = convertTemperature(15, 'kelvin');         // 288.15
```

---

## Advanced Usage

### Custom Error Handling

```javascript
// Add custom error handler
async function safeLoadWeather(city) {
    try {
        await WeatherApp.loadWeather(city);
    } catch (error) {
        if (error.message.includes('not found')) {
            showError('City not found. Did you mean a nearby city?');
        } else if (error.message.includes('API')) {
            showError('API error. Please check your configuration.');
        } else {
            showError('Unknown error: ' + error.message);
        }
    }
}
```

### Implement Geolocation

**Add to `js/app.js`:**

```javascript
function initiateGeolocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const weather = await WeatherAPI.getWeatherByCoords(latitude, longitude);
                    WeatherApp.loadWeather(weather.name);
                } catch (error) {
                    console.error('Geolocation error:', error);
                }
            },
            (error) => {
                console.error('Geolocation failed:', error);
            }
        );
    }
}

// Call on app start
// initiateGeolocation();
```

### Implement Auto-Refresh

**Add to `js/app.js`:**

```javascript
// Auto-refresh weather every 5 minutes
function startAutoRefresh(intervalMinutes = 5) {
    setInterval(() => {
        const state = WeatherApp.getState();
        if (state.currentCity) {
            console.log('Auto-refreshing weather...');
            WeatherApp.loadWeather(state.currentCity);
        }
    }, intervalMinutes * 60 * 1000);
}

// Start auto-refresh on app initialization
// startAutoRefresh(5);
```

### Implement Search History

**Add to `js/app.js`:**

```javascript
class SearchHistory {
    constructor() {
        this.key = 'searchHistory';
    }
    
    add(city) {
        let history = JSON.parse(localStorage.getItem(this.key)) || [];
        history = [city, ...history.filter(c => c !== city)].slice(0, 10);
        localStorage.setItem(this.key, JSON.stringify(history));
    }
    
    get() {
        return JSON.parse(localStorage.getItem(this.key)) || [];
    }
    
    clear() {
        localStorage.removeItem(this.key);
    }
}

const searchHistory = new SearchHistory();
searchHistory.add('London');
console.log(searchHistory.get()); // ['London', ...]
```

### Add Weather Notifications

**Add to `js/app.js`:**

```javascript
function showNotification(message) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('Weather Alert', {
                body: message,
                icon: WeatherAPI.getWeatherIconUrl('01d')
            });
        }
    }
}

// Request permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
```

### Export Weather Data

```javascript
function exportWeatherData() {
    const state = WeatherApp.getState();
    const weather = WeatherApp.getWeatherData();
    const forecast = WeatherApp.getForecastData();
    
    const data = {
        weather: weather,
        forecast: forecast,
        exportTime: new Date().toISOString()
    };
    
    // Download as JSON
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-${weather.name}-${Date.now()}.json`;
    link.click();
}
```

### Dark Mode Detection

**Add to `css/styles.css`:**

```css
/* Auto-detect system dark mode preference */
@media (prefers-color-scheme: dark) {
    :root {
        --bg-color: var(--dark-bg);
        --card-bg: var(--card-bg-dark);
        --text-color: var(--text-dark);
    }
}
```

---

## Event Dispatching Pattern

Create custom events for advanced app communication:

```javascript
// Dispatch custom event
const event = new CustomEvent('weatherLoaded', {
    detail: { city: 'London', temperature: 15 }
});
document.dispatchEvent(event);

// Listen for custom event
document.addEventListener('weatherLoaded', (e) => {
    console.log('Weather loaded for:', e.detail.city);
});
```

---

**More examples coming soon! Feel free to explore and modify the code.** 🎉
