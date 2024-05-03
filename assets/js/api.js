// Define API Key
const api_key = "c66d748a5b199ff47c0278a451c2500a";

// Function to fetch data from OpenWeatherMap API
export const fetchData = function (URL, callback) {
  fetch(`${URL}&appid=${api_key}`)  // Fetch data using the provided URL and API key
    .then(res => res.json())   // Parse response as JSON
    .then(data => callback(data));  // Pass data to the callback function
}

// Object containing URLs for various weather API endpoints
export const url = {
  // URL for current weather data
  currentWeather(lat, lon) {  
    return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`
  },
  // URL for forecast data
  forecast(lat, lon) { 
    return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`
  },
  // URL for air pollution data
  airPollution(lat, lon) {  
    return `https://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}`
  },
  // URL for reverse geocoding
  reverseGeo(lat, lon) {  
    return `https://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`
  },
  // URL for geocoding
  geo(query) { 
    return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`
  }
}