/**
 * API Module - Handles all weather API operations using OpenWeatherMap API
 */

const WeatherAPI = (() => {
    // API Configuration
    const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';
    const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
    
    // API endpoints
    const ENDPOINTS = {
        WEATHER: `${BASE_URL}/weather`,
        FORECAST: `${BASE_URL}/forecast`,
        GEO: `${GEO_URL}/direct`,
        REVERSE_GEO: `${GEO_URL}/reverse`
    };

    // Cache for API responses
    const cache = new Map();
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    /**
     * Build query string from parameters
     * @param {Object} params - Query parameters
     * @returns {string} Query string
     */
    function buildQuery(params) {
        return Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
    }

    /**
     * Check if API key is configured
     * @returns {boolean} True if API key is configured
     */
    function isApiKeyConfigured() {
        return API_KEY !== 'YOUR_API_KEY_HERE' && API_KEY.trim() !== '';
    }

    /**
     * Validate API response
     * @param {Response} response - Fetch response
     * @returns {Object} Response data
     */
    async function validateResponse(response) {
        if (!response.ok) {
            let errorMessage = `HTTP Error: ${response.status}`;
            
            if (response.status === 401) {
                errorMessage = 'Invalid or missing API key. Please configure your API key.';
            } else if (response.status === 404) {
                errorMessage = 'City not found. Please try another search.';
            } else if (response.status === 429) {
                errorMessage = 'Too many requests. Please wait a moment and try again.';
            } else if (response.status >= 500) {
                errorMessage = 'Weather service is temporarily unavailable. Please try again later.';
            }
            
            throw new Error(errorMessage);
        }
        
        return response.json();
    }

    /**
     * Make API request with caching
     * @param {string} url - Request URL
     * @param {string} cacheKey - Cache key
     * @returns {Promise<Object>} Response data
     */
    async function makeRequest(url, cacheKey = null) {
        try {
            // Check cache first
            if (cacheKey && cache.has(cacheKey)) {
                const cached = cache.get(cacheKey);
                if (Date.now() - cached.timestamp < CACHE_DURATION) {
                    console.log('Returning cached data for:', cacheKey);
                    return cached.data;
                } else {
                    cache.delete(cacheKey);
                }
            }

            // Make API request
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await validateResponse(response);

            // Cache the response
            if (cacheKey) {
                cache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Fetch current weather for a city
     * @param {string} city - City name
     * @param {string} units - Temperature units (metric, imperial)
     * @returns {Promise<Object>} Weather data
     */
    async function getCurrentWeather(city, units = 'metric') {
        try {
            if (!isApiKeyConfigured()) {
                throw new Error('Please configure your OpenWeatherMap API key in js/api.js');
            }

            const params = {
                q: city,
                appid: API_KEY,
                units: units
            };

            const url = `${ENDPOINTS.WEATHER}?${buildQuery(params)}`;
            const cacheKey = `weather_${city}_${units}`;

            const data = await makeRequest(url, cacheKey);

            // Transform response data
            return {
                name: data.name,
                country: data.sys.country,
                coord: data.coord,
                temperature: data.main.temp,
                feelsLike: data.main.feels_like,
                tempMin: data.main.temp_min,
                tempMax: data.main.temp_max,
                pressure: data.main.pressure,
                humidity: data.main.humidity,
                visibility: data.visibility,
                windSpeed: data.wind.speed,
                windDeg: data.wind.deg,
                cloudiness: data.clouds.all,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                main: data.weather[0].main,
                timestamp: data.dt,
                sunrise: data.sys.sunrise,
                sunset: data.sys.sunset,
                raw: data // Keep raw data for reference
            };
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw error;
        }
    }

    /**
     * Fetch 5-day weather forecast
     * @param {string} city - City name
     * @param {string} units - Temperature units (metric, imperial)
     * @returns {Promise<Array>} Forecast data grouped by day
     */
    async function getForecast(city, units = 'metric') {
        try {
            if (!isApiKeyConfigured()) {
                throw new Error('Please configure your OpenWeatherMap API key in js/api.js');
            }

            const params = {
                q: city,
                appid: API_KEY,
                units: units
            };

            const url = `${ENDPOINTS.FORECAST}?${buildQuery(params)}`;
            const cacheKey = `forecast_${city}_${units}`;

            const data = await makeRequest(url, cacheKey);

            // Group forecast by day
            const forecastByDay = {};

            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                if (!forecastByDay[day]) {
                    forecastByDay[day] = {
                        date: date,
                        times: []
                    };
                }

                forecastByDay[day].times.push({
                    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    temperature: item.main.temp,
                    feelsLike: item.main.feels_like,
                    tempMin: item.main.temp_min,
                    tempMax: item.main.temp_max,
                    humidity: item.main.humidity,
                    pressure: item.main.pressure,
                    windSpeed: item.wind.speed,
                    cloudiness: item.clouds.all,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    main: item.weather[0].main,
                    timestamp: item.dt
                });
            });

            // Process to get daily summaries
            const daily = Object.entries(forecastByDay).map(([day, data]) => {
                const temps = data.times.map(t => t.temperature);
                const icons = data.times.map(t => t.icon);

                return {
                    day: day,
                    date: data.date,
                    tempMax: Math.max(...temps),
                    tempMin: Math.min(...temps),
                    tempAvg: Math.round(temps.reduce((a, b) => a + b) / temps.length),
                    description: data.times[0].description,
                    icon: data.times[0].icon,
                    main: data.times[0].main,
                    humidity: data.times[0].humidity,
                    windSpeed: data.times[0].windSpeed,
                    details: data.times
                };
            });

            // Return only 5 days
            return daily.slice(0, 5);
        } catch (error) {
            console.error('Error fetching forecast:', error);
            throw error;
        }
    }

    /**
     * Get weather icon URL
     * @param {string} iconCode - Weather icon code from API
     * @param {string} size - Icon size (1x, 2x, 4x)
     * @returns {string} Icon URL
     */
    function getWeatherIconUrl(iconCode, size = '2x') {
        return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
    }

    /**
     * Search cities by name with autocomplete
     * @param {string} city - City name to search
     * @returns {Promise<Array>} Array of matching cities
     */
    async function searchCities(city) {
        try {
            if (!isApiKeyConfigured()) {
                return [];
            }

            if (city.length < 2) {
                return [];
            }

            const params = {
                q: city,
                limit: 5,
                appid: API_KEY
            };

            const url = `${ENDPOINTS.GEO}?${buildQuery(params)}`;

            const data = await makeRequest(url, null);

            return data.map(item => ({
                name: item.name,
                country: item.country,
                state: item.state,
                lat: item.lat,
                lon: item.lon,
                displayName: `${item.name}, ${item.state ? item.state + ', ' : ''}${item.country}`
            }));
        } catch (error) {
            console.warn('Error searching cities:', error);
            return [];
        }
    }

    /**
     * Get weather by coordinates (geolocation)
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {string} units - Temperature units
     * @returns {Promise<Object>} Weather data
     */
    async function getWeatherByCoords(lat, lon, units = 'metric') {
        try {
            if (!isApiKeyConfigured()) {
                throw new Error('Please configure your OpenWeatherMap API key in js/api.js');
            }

            const params = {
                lat,
                lon,
                appid: API_KEY,
                units: units
            };

            const url = `${ENDPOINTS.WEATHER}?${buildQuery(params)}`;
            const cacheKey = `weather_${lat}_${lon}_${units}`;

            const data = await makeRequest(url, cacheKey);

            return {
                name: data.name,
                country: data.sys.country,
                coord: data.coord,
                temperature: data.main.temp,
                feelsLike: data.main.feels_like,
                tempMin: data.main.temp_min,
                tempMax: data.main.temp_max,
                pressure: data.main.pressure,
                humidity: data.main.humidity,
                visibility: data.visibility,
                windSpeed: data.wind.speed,
                windDeg: data.wind.deg,
                cloudiness: data.clouds.all,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                main: data.weather[0].main,
                timestamp: data.dt,
                sunrise: data.sys.sunrise,
                sunset: data.sys.sunset
            };
        } catch (error) {
            console.error('Error fetching weather by coordinates:', error);
            throw error;
        }
    }

    /**
     * Get reverse geocoding (city name from coordinates)
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} Location data
     */
    async function getReverseGeo(lat, lon) {
        try {
            if (!isApiKeyConfigured()) {
                return null;
            }

            const params = {
                lat,
                lon,
                limit: 1,
                appid: API_KEY
            };

            const url = `${ENDPOINTS.REVERSE_GEO}?${buildQuery(params)}`;

            const data = await makeRequest(url, null);

            if (data.length > 0) {
                return {
                    name: data[0].name,
                    country: data[0].country,
                    state: data[0].state,
                    lat: data[0].lat,
                    lon: data[0].lon
                };
            }
            return null;
        } catch (error) {
            console.warn('Error reverse geocoding:', error);
            return null;
        }
    }

    /**
     * Clear API cache
     */
    function clearCache() {
        cache.clear();
        console.log('API cache cleared');
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    function getCacheStats() {
        return {
            size: cache.size,
            entries: Array.from(cache.keys())
        };
    }

    /**
     * Format temperature with unit
     * @param {number} temp - Temperature value
     * @param {string} units - Units (metric, imperial)
     * @returns {string} Formatted temperature
     */
    function formatTemperature(temp, units = 'metric') {
        const unit = units === 'metric' ? '°C' : '°F';
        return `${Math.round(temp)}${unit}`;
    }

    /**
     * Format wind speed with unit
     * @param {number} speed - Wind speed
     * @param {string} units - Units (metric, imperial)
     * @returns {string} Formatted wind speed
     */
    function formatWindSpeed(speed, units = 'metric') {
        const unit = units === 'metric' ? 'm/s' : 'mph';
        return `${speed.toFixed(1)} ${unit}`;
    }

    /**
     * Get wind direction text from degrees
     * @param {number} degrees - Wind direction in degrees
     * @returns {string} Wind direction (N, NE, E, etc.)
     */
    function getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    // Public API
    return {
        getCurrentWeather,
        getForecast,
        getWeatherIconUrl,
        searchCities,
        getWeatherByCoords,
        getReverseGeo,
        clearCache,
        getCacheStats,
        formatTemperature,
        formatWindSpeed,
        getWindDirection,
        isApiKeyConfigured,
        BASE_URL,
        ENDPOINTS
    };
})();
