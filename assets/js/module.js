// Array containing names of days of the week
export const weekDayNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

// Array containing names of months
export const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Function to get local date from Unix timestamp and timezone offset
function getLocalDate(unixTimestamp, timezoneOffset) {
  return new Date((unixTimestamp + timezoneOffset) * 1000);
}

// Function to get formatted date
export const getDate = function (dateUnix, timezone) {
  const date = getLocalDate(dateUnix, timezone);
  const weekDayName = weekDayNames[date.getUTCDay()];
  const monthName = monthNames[date.getUTCMonth()];
  const day = date.getUTCDate();

  return `${weekDayName} ${day}, ${monthName}`;
}

// Function to get formatted time
export const getTime = function (timeUnix, timezone) {
  const date = getLocalDate(timeUnix, timezone);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? "PM" : "AM";

  return `${hours % 12 || 12}:${minutes} ${period}`;
}

// Function to get formatted hours
export const getHours = function (timeUnix, timezone) {
  const date = getLocalDate(timeUnix, timezone);
  const hours = date.getUTCHours();
  const period = hours >= 12 ? "PM" : "AM";

  return `${hours % 12 || 12} ${period}`;
}

// Function to convert meters per second to kilometers per hour
export const mpsToKmh = mps => {
  return mps * 3.6;
}

// Object containing AQI (Air Quality Index) text descriptions
export const aqiText = {
  1: {
    level: "Good",
    message: "Air quality is considered satisfactory, and air pollution poses little or no risk."
  },
  2: {
    level: "Fair",
    message: "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution."
  },
  3: {
    level: "Moderate",
    message: "Members of sensitive groups may experience health effects. The general public is not likely to be affected."
  },
  4: {
    level: "Poor",
    message: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."
  },
  5: {
    level: "Very Poor",
    message: "Health warnings of emergency conditions. The entire population is more likely to be affected."
  }
}
