// Importing functions from app.js
import { updateWeather, error404 } from "./app.js";
// Default location in case geolocation is not available
const defaultLocation = "#/weather?lat=51.5073219&lon=-0.1276474" 

// Function to get current location using geolocation API
const currentLocation = function () {
  window.navigator.geolocation.getCurrentPosition(res => {
    const { latitude, longitude } = res.coords;

    // Update weather based on current location
    updateWeather(`lat=${latitude}`, `lon=${longitude}`);
  }, err => {
    // Redirect to default location if geolocation fails
    window.location.hash = defaultLocation;
  });
}

// Function to update weather based on searched location
const searchedLocation = query => updateWeather(...query.split("&"));

// Map containing routes and their corresponding functions
const routes = new Map([
  ["/current-location", currentLocation], // Route for current location
  ["/weather", searchedLocation]  // Route for searched location
]);

// Function to check and handle hash changes
const checkHash = function () {
  // Extract the route and query parameters from the hash
  const requestURL = window.location.hash.slice(1);

  const [route, query] = requestURL.includes ? requestURL.split("?") : [requestURL];

  // Check if route exists in routes map, then execute the corresponding function
  routes.get(route) ? routes.get(route)(query) : error404();  // Call error404 if route not found
}

// Event listener for hash changes
window.addEventListener("hashchange", checkHash);

// Event listener for page load
window.addEventListener("load", function () {
  // If no hash is present, redirect to default location
  if (!window.location.hash) {
    window.location.hash = "#/current-location";
  } else {
    // Otherwise, check the hash
    checkHash();
  }
});