export function displayCurrentWeather(data) {
  const latestWeather = findClosestWeatherForecast(data);
  const details = `
        <p>Temperature: ${latestWeather.airTemperature}°C, Feels Like: ${latestWeather.feelsLikeTemperature}°C</p>
        <p>Wind: ${latestWeather.windSpeed} km/h gusting to ${latestWeather.windGust} km/h from ${latestWeather.windDirection} degrees</p>
        <p>Cloud Cover: ${latestWeather.cloudCover}%, Humidity: ${latestWeather.relativeHumidity}%</p>
        <p>Pressure: ${latestWeather.seaLevelPressure} hPa, Precipitation: ${latestWeather.totalPrecipitation} mm</p>
        <p>Condition: ${latestWeather.conditionCode}</p>
    `;
  document.getElementById('weatherDetails').innerHTML = details;
  return latestWeather;
}

function findClosestWeatherForecast(forecasts) {
  // Get the current time in UTC+3 and convert it to UTC
  const now = new Date();
  const currentUtcTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  let closestForecast = null;
  let smallestDifference = Infinity;

  // Iterate through the forecast data to find the closest time
  forecasts.forEach((forecast) => {
    const forecastTime = new Date(forecast.forecastTimeUtc);
    const timeDifference = Math.abs(forecastTime - currentUtcTime);

    if (timeDifference < smallestDifference) {
      smallestDifference = timeDifference;
      closestForecast = forecast;
    }
  });

  return closestForecast;
}
