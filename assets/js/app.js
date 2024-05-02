// Importing fetchData and url from api.js
import { fetchData, url } from "./api.js";
// Importing module.js with alias module
import * as module from "./module.js";

// Function to add event listeners on multiple elements
const addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
}

// Selecting search view and search togglers
const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");

// Function to toggle search view
const toggleSearch = () => searchView.classList.toggle("active");
// Adding click event listener to search togglers
addEventOnElements(searchTogglers, "click", toggleSearch);

// Selecting search field and search result elements
const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");

// Initializing search timeout variables
let searchTimeout = null;
const searchTimeoutDuration = 500;

// Adding input event listener to search field
searchField.addEventListener("input", function () {

  // Clearing previous search timeout
  searchTimeout ?? clearTimeout(searchTimeout);

  // Handling empty search field case
  if (!searchField.value) {
    searchResult.classList.remove("active");
    searchResult.innerHTML = "";
    searchField.classList.remove("searching");
  } else {
    searchField.classList.add("searching");
  }

  // Handling search operation
  if (searchField.value) {
    searchTimeout = setTimeout(() => {
      // Fetching data based on search field value
      fetchData(url.geo(searchField.value), function (locations) {
        // Handling search result display
        searchField.classList.remove("searching");
        searchResult.classList.add("active");
        searchResult.innerHTML = `
          <ul class="view-list" data-search-list></ul>
        `;

        // Creating search result items
        const items = [];

        for (const { name, lat, lon, country, state } of locations) {
          const searchItem = document.createElement("li");
          searchItem.classList.add("view-item");

          searchItem.innerHTML = `
            <span class="m-icon">location_on</span>

            <div>
              <p class="item-title">${name}</p>

              <p class="label-2 item-subtitle">${state || ""} ${country}</p>
            </div>

            <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-toggler></a>
          `;

          searchResult.querySelector("[data-search-list]").appendChild(searchItem);
          items.push(searchItem.querySelector("[data-search-toggler]"));
        }

        // Adding event listeners to search result items
        addEventOnElements(items, "click", function () {
          toggleSearch();
          searchResult.classList.remove("active");
        })
      });
    }, searchTimeoutDuration);
  }

});

// Selecting various elements
const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const errorContent = document.querySelector("[data-error-content]");

// Function to update weather
export const updateWeather = function (lat, lon) {

  // Displaying loading state
  loading.style.display = "grid";
  container.style.overflowY = "hidden";
  container.classList.remove("fade-in");
  errorContent.style.display = "none";

  // Selecting weather sections
  const currentWeatherSection = document.querySelector("[data-current-weather]");
  const highlightSection = document.querySelector("[data-highlights]");
  const hourlySection = document.querySelector("[data-hourly-forecast]");
  const forecastSection = document.querySelector("[data-5-day-forecast]");

  // Clearing previous weather data
  currentWeatherSection.innerHTML = "";
  highlightSection.innerHTML = "";
  hourlySection.innerHTML = "";
  forecastSection.innerHTML = "";

  // Disabling current location button if the page is not on current location view
  if (window.location.hash === "#/current-location") {
    currentLocationBtn.setAttribute("disabled", "");
  } else {
    currentLocationBtn.removeAttribute("disabled");
  }

  // Fetching current weather data
  fetchData(url.currentWeather(lat, lon), function (currentWeather) {

    // Destructuring current weather data
    const {
      weather,
      dt: dateUnix,
      sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
      main: { temp, feels_like, pressure, humidity },
      visibility,
      timezone
    } = currentWeather;
    const [{ description, icon }] = weather;

    // Converting temperature to Fahrenheit
    const tempFahrenheit = (temp * 9/5) + 32;
    const feelsLikeFahrenheit = (feels_like * 9/5) + 32;

    // Creating current weather card
    const card = document.createElement("div");
    card.classList.add("card", "card-lg", "current-weather-card");

    // Formatting date
    const dateFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', dateFormatOptions).format(new Date(dateUnix * 1000)); 

    // Adding HTML content to current weather card
    card.innerHTML = `
      <h2 class="title-2 card-title">Now</h2>

      <div class="weapper">
        <p class="heading">${parseInt(tempFahrenheit)}&deg;F</p>

        <img src="./assets/images/weather_icons/${icon}.png" width="64" height="64" alt="${description}"
          class="weather-icon">
      </div>

      <p class="body-3">${description}</p>

      <ul class="meta-list">

        <li class="meta-item">
          <span class="m-icon">calendar_today</span>

          <p class="title-3 meta-text">${formattedDate}</p> <!-- Display formatted date -->
        </li>

        <li class="meta-item">
          <span class="m-icon">location_on</span>

          <p class="title-3 meta-text" data-location></p>
        </li>

      </ul>
    `;

    // Fetching reverse geocoding data
    fetchData(url.reverseGeo(lat, lon), function ([{ name, state, country }]) {
      const locationString = state ? `${name}, ${state}, ${country}` : `${name}, ${country}`;
      card.querySelector("[data-location]").innerHTML = locationString;
    });

    // Appending current weather card to its section
    currentWeatherSection.appendChild(card);

    // Fetching air pollution data
    fetchData(url.airPollution(lat, lon), function (airPollution) {

      // Destructuring air pollution data
      const [{
        main: { aqi },
        components: { no2, o3, so2, pm2_5 }
      }] = airPollution.list;

      // Creating air pollution highlight card
      const card = document.createElement("div");
      card.classList.add("card", "card-lg");

      // Adding HTML content to air pollution highlight card
      card.innerHTML = `
        <h2 class="title-2" id="highlights-label">Today's Highlights</h2>

        <div class="highlight-list">

          <div class="card card-sm highlight-card one">

            <h3 class="title-3">Air Quality Index</h3>

            <div class="wrapper">

              <span class="m-icon">air</span>

              <ul class="card-list">

                <li class="card-item">
                  <p class="title-1">${pm2_5.toPrecision(3)}</p>

                  <p class="label-1">PM<sub>2.5</sub></p>
                </li>

                <li class="card-item">
                  <p class="title-1">${so2.toPrecision(3)}</p>

                  <p class="label-1">SO<sub>2</sub></p>
                </li>

                <li class="card-item">
                  <p class="title-1">${no2.toPrecision(3)}</p>

                  <p class="label-1">NO<sub>2</sub></p>
                </li>

                <li class="card-item">
                  <p class="title-1">${o3.toPrecision(3)}</p>

                  <p class="label-1">O<sub>3</sub></p>
                </li>

              </ul>

            </div>

            <span class="badge aqi-${aqi} label-${aqi}" title="${module.aqiText[aqi].message}">
              ${module.aqiText[aqi].level}
            </span>

          </div>

          <div class="card card-sm highlight-card two">

            <h3 class="title-3">Sunrise & Sunset</h3>

            <div class="card-list">

              <div class="card-item">
                <span class="m-icon">clear_day</span>

                <div>
                  <p class="label-1">Sunrise</p>

                  <p class="title-1">${module.getTime(sunriseUnixUTC, timezone)}</p>
                </div>
              </div>

              <div class="card-item">
                <span class="m-icon">clear_night</span>

                <div>
                  <p class="label-1">Sunset</p>

                  <p class="title-1">${module.getTime(sunsetUnixUTC, timezone)}</p>
                </div>
              </div>

            </div>

          </div>

          <div class="card card-sm highlight-card">

            <h3 class="title-3">Humidity</h3>

            <div class="wrapper">
              <span class="m-icon">humidity_percentage</span>

              <p class="title-1">${humidity}<sub>%</sub></p>
            </div>

          </div>

          <div class="card card-sm highlight-card">

            <h3 class="title-3">Pressure</h3>

            <div class="wrapper">
              <span class="m-icon">airwave</span>

              <p class="title-1">${pressure}<sub>hPa</sub></p>
            </div>

          </div>

          <div class="card card-sm highlight-card">

            <h3 class="title-3">Visibility</h3>

            <div class="wrapper">
              <span class="m-icon">visibility</span>

              <p class="title-1">${(visibility / 1000 * 0.621371).toFixed(2)}<sub>mi</sub></p>
            </div>

          </div>

          <div class="card card-sm highlight-card">

            <h3 class="title-3">Feels Like</h3>

            <div class="wrapper">
              <span class="m-icon">thermostat</span>

              <p class="title-1">${parseInt(feelsLikeFahrenheit)}&deg;<sup>F</sup></p>
            </div>

          </div>

        </div>
      `;

      // Appending air pollution highlight card to its section
      highlightSection.appendChild(card);

    });

    // Fetching forecast data
    fetchData(url.forecast(lat, lon), function (forecast) {

      // Destructuring forecast data
      const {
        list: forecastList,
        city: { timezone }
      } = forecast;

      // Creating HTML structure for hourly forecast
      hourlySection.innerHTML = `
        <h2 class="title-2">Today at</h2>

        <div class="slider-container">
          <ul class="slider-list" data-temp></ul>

          <ul class="slider-list" data-wind></ul>
        </div>
      `;

      // Looping through forecast data for hourly forecast
      for (const [index, data] of forecastList.entries()) {

        if (index > 7) break;

        const {
          dt: dateTimeUnix,
          main: { temp },
          weather,
          wind: { deg: windDirection, speed: windSpeed }
        } = data
        const [{ icon, description }] = weather

        const tempFahrenheit = (temp * 9/5) + 32;

        const windSpeedMph = windSpeed * 2.23694;

        // Creating HTML for each hourly forecast item
        const tempLi = document.createElement("li");
        tempLi.classList.add("slider-item");

        tempLi.innerHTML = `
          <div class="card card-sm slider-card">

            <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>

            <img src="./assets/images/weather_icons/${icon}.png" width="48" height="48" loading="lazy" alt="${description}"
              class="weather-icon" title="${description}">

            <p class="body-3">${parseInt(tempFahrenheit)}&deg;F</p>

          </div>
        `;
        hourlySection.querySelector("[data-temp]").appendChild(tempLi);

        const windLi = document.createElement("li");
        windLi.classList.add("slider-item");

        windLi.innerHTML = `
        <div class="card card-sm slider-card">

          <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>

          <img src="./assets/images/weather_icons/direction.png" width="48" height="48" loading="lazy" alt="direction"
            class="weather-icon" style="transform: rotate(${windDirection - 180}deg)">

          <p class="body-3">${windSpeedMph.toFixed(2)} mph</p>

        </div>
        `;
        hourlySection.querySelector("[data-wind]").appendChild(windLi);

      }

      // Creating HTML structure for 5-day forecast
      forecastSection.innerHTML = `
        <h2 class="title-2" id="forecast-label">5-Day Forecast</h2>
        
        <div class="card card-lg forecast-card">
          <ul data-forecast-list></ul>
        </div>
      `;

      // Looping through forecast data for 5-day forecast
      for (let i = 0; i < forecastList.length; i += 8) {
        const {
          main: { temp_max, humidity }, // Extracting humidity data
          weather,
          wind: { speed }, // Extracting wind speed data
          dt_txt
        } = forecastList[i];
        const [{ icon, description }] = weather;
        const date = new Date(dt_txt);

        const tempMaxFahrenheit = (temp_max * 9/5) + 32;

        // Creating HTML for each forecast item
        const li = document.createElement("li");
        li.classList.add("card-item");

        li.innerHTML = `
          <div class="icon-wrapper">
            <img src="./assets/images/weather_icons/${icon}.png" width="36" height="36" alt="${description}"
              class="weather-icon" title="${description}">
            
            <span class="span">
              <p class="title-2">${parseInt(tempMaxFahrenheit)}&deg;F</p> <!-- Only displaying max temperature -->
              <p class="label-1">Wind: ${speed} m/s</p> <!-- Displaying wind speed -->
              <p class="label-1">Humidity: ${humidity}%</p> <!-- Displaying humidity -->
            </span>
          </div>
          
          <p class="label-1">${module.weekDayNames[date.getUTCDay()]}, ${module.monthNames[date.getUTCMonth()]} ${date.getDate()}</p>
        `;
        forecastSection.querySelector("[data-forecast-list]").appendChild(li);
      }

      // Hiding loading state and displaying weather container
      loading.style.display = "none";
      container.style.overflowY = "overlay";
      container.classList.add("fade-in");
    });

  });

}

// Function to display 404 error
export const error404 = () => errorContent.style.display = "flex";
