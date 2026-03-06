# Weather Dashboard - Setup Guide

## ⚡ 5-Minute Quick Start

### Step 1: Get Your API Key (2 minutes)
1. Go to https://openweathermap.org/api
2. Click "Sign Up" → Create a free account
3. Go to "API keys" tab
4. Copy your default key (or create a new one)

### Step 2: Configure API Key (1 minute)
1. Open `js/api.js`
2. Find line 8: `const API_KEY = 'YOUR_API_KEY_HERE';`
3. Replace with your actual key: `const API_KEY = 'your_actual_key_here';`
4. Save the file

### Step 3: Run Application (2 minutes)
1. Open `index.html` in your web browser
2. Or use VS Code Live Server extension (right-click → Open with Live Server)
3. Done! 🎉

## 🎯 Key Features to Try

### 1. Search Weather
- Type a city name (e.g., "London", "Tokyo", "New York")
- Press Enter or click Search
- See current weather and 5-day forecast

### 2. Add Favorites
- Click "⭐ Add to Favorites"
- Your favorite cities appear in the Favorites section
- Click a favorite to view its weather

### 3. Change Units
- Use the "Units" dropdown
- Switch between Celsius and Fahrenheit
- Your preference is saved automatically

### 4. Toggle Theme
- Click the moon/sun button (🌙/☀️)
- Switch between light and dark mode
- Preference is saved in Local Storage

### 5. Clear Data
- Click "Clear Preferences"
- This resets all favorites and preferences

## 📁 Project Files

```
Weather Dashboard/
├── index.html                    # Main page (open this!)
├── js/
│   ├── app.js                   # Main application logic
│   ├── api.js                   # Weather API integration
│   └── storage.js               # Local Storage management
├── css/
│   └── styles.css               # All styling and responsive design
├── README.md                    # Full documentation
├── SETUP.md                     # This file
└── screenshots/                 # Add your screenshots here
```

## 🔑 API Key Configuration - Detailed

### Find Your API Key
1. Visit: https://openweathermap.org/api
2. Click "Sign Up" → Free tier includes:
   - Current weather
   - 5-day forecast
   - 1000 calls/day

### Where to Add Key

**File:** `js/api.js`  
**Line:** 8

**Before:**
```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
```

**After:**
```javascript
const API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
```

## 🚨 Common Issues & Solutions

### Issue: "API key not configured" error appears
- ✅ Solution: Make sure you've replaced `YOUR_API_KEY_HERE` with your actual key
- ✅ Check there are no extra spaces
- ✅ Reload the page after saving

### Issue: "City not found" error
- ✅ Try exact city names: "London" not "london"
- ✅ Include country code for ambiguous cities: "Springfield, US"
- ✅ Check spelling

### Issue: Autocomplete suggestions not showing
- ✅ Type at least 2 characters
- ✅ Check if your API key works (search should work even without suggestions)
- ✅ Wait a moment (suggestions are debounced for performance)

### Issue: Favorites not saving
- ✅ Check if Local Storage is enabled in browser
- ✅ Not using private/incognito mode
- ✅ Browser storage isn't full

### Issue: Page is blank or shows nothing
- ✅ Open browser Developer Tools (F12)
- ✅ Check the Console tab for error messages
- ✅ Make sure you're opening a file:// URL or using a local server

## 🌐 Hosting & Deployment

### Simple Local Testing
- Just open `index.html` in your browser
- Or use VS Code Live Server
- Works offline after first load

### Deploy to GitHub Pages (Free)
```bash
# 1. Create GitHub repository
# 2. Add your files
# 3. Go to Settings → Pages → Select main branch
# 4. Access at: https://username.github.io/repo-name
```

### Deploy to Netlify (Free)
```bash
# 1. Go to netlify.com
# 2. Click "New site from Git"
# 3. Connect your GitHub repo
# 4. Deploy automatically on every push
```

### Deploy to Your Own Server
```bash
# 1. Upload files via FTP/SFTP
# 2. Open index.html in browser
# 3. Done!
```

## 💡 Tips & Tricks

### Performance Tips
- Weather data is cached for 10 minutes
- Searching the same city soon uses cached data
- Saves API quota and loads faster

### User Experience Tips
- Search remembers your last city
- Favorites persist across sessions
- Theme preference is automatic
- All data stored locally in browser

### Development Tips
- Open browser DevTools (F12) to debug
- Console shows helpful logging messages
- Storage tab shows what's saved locally
- Network tab shows API calls

## 🔒 Privacy

- ✅ All data stored locally in YOUR browser
- ✅ No data sent to any server except OpenWeatherMap API
- ✅ No cookies or tracking
- ✅ Your preferences never leave your device

## 📊 API Limits (Free Tier)

- ✅ 1000 API calls per day
- ✅ Current weather + 5-day forecast
- ✅ Unlimited searches and favorites
- ✅ Caching reduces API usage

## 🛠️ Troubleshooting Checklist

Before reporting an issue:

- [ ] Is your API key correct?
- [ ] Did you reload the page after adding the API key?
- [ ] Does your API key work on OpenWeatherMap website?
- [ ] Are you using a web server (not file://) if deployed online?
- [ ] Check browser console (F12) for error messages
- [ ] Try a different city name
- [ ] Clear browser cache and reload

## 📚 Next Steps

### To Learn More
1. Read `README.md` for detailed documentation
2. Review code comments in `js/` files
3. Check OpenWeatherMap API docs
4. Experiment by modifying the code

### To Customize
1. Change colors in `css/styles.css` (line 8-18)
2. Add more weather data in `js/app.js`
3. Modify the UI in `index.html`
4. Create different themes

### To Extend
1. Add geolocation support
2. Implement weather alerts
3. Add multiple location tracking
4. Create a mobile app wrapper

## ✨ What You've Built

You now have a professional weather application with:
- ✅ Real-time data from OpenWeatherMap API
- ✅ Beautiful responsive UI
- ✅ Local Storage for preferences
- ✅ Error handling and loading states
- ✅ Dark mode support
- ✅ Favorites system
- ✅ 5-day forecast
- ✅ Full accessibility support

## 🎓 Learning Resources

**JavaScript Async/Await:**
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

**Fetch API:**
- https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

**Local Storage:**
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

**OpenWeatherMap API:**
- https://openweathermap.org/api

**CSS Grid & Flexbox:**
- https://css-tricks.com/snippets/css/complete-guide-grid/
- https://css-tricks.com/snippets/css/a-guide-to-flexbox/

## 📞 Quick Help

**Q: Where do I put my API key?**  
A: In `js/api.js` line 8, replace `YOUR_API_KEY_HERE`

**Q: How do I run it?**  
A: Open `index.html` in your browser

**Q: Will my data be saved?**  
A: Yes! Favorites and preferences save in Local Storage

**Q: How much does it cost?**  
A: It's free! (1000 API calls/day)

**Q: Can I use this on my website?**  
A: Yes! No attribution required

---

**Ready to use? Open `index.html` and start exploring!** 🌤️

Need help? Check the `README.md` file for comprehensive documentation.
