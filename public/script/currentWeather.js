export function displayCurrentWeather(data) {
  const latestWeather = findClosestWeatherForecast(data);
  const icon = getWeatherIcon(latestWeather.conditionCode); // Get the emoji based on the condition code

  const details = `
            <table>
                <tr>
                    <th><a href="#temperatureChart">Temperature:</a></th>
                    <td>${icon} ${latestWeather.airTemperature}°C</td>
                </tr>
                <tr>
                    <th><a href="#feelsLikeTempChart">Feels Like:</a></th>
                    <td>${icon} ${latestWeather.feelsLikeTemperature}°C</td>
                </tr>
                <tr>
                    <th><a href="#windSpeedChart">Wind:</a></th>
                    <td>${latestWeather.windSpeed} km/h</td>
                </tr>
                <tr>
                    <th><a href="#windGustChart">Gusts up to:</a></th>
                    <td>${latestWeather.windGust} km/h</td>
                </tr>
                <tr>
                    <th>Direction:</th>
                    <td>${latestWeather.windDirection}°</td>
                </tr>
                <tr>
                    <th><a href="#cloudCoverChart">Cloud Cover:</a></th>
                    <td>${latestWeather.cloudCover}%</td>
                </tr>
                <tr>
                    <th><a href="#humidityChart">Humidity:</a></th>
                    <td>${latestWeather.relativeHumidity}%</td>
                </tr>
                <tr>
                    <th><a href="#pressureChart">Pressure:</a></th>
                    <td>${latestWeather.seaLevelPressure} hPa</td>
                </tr>
                <tr>
                    <th><a href="#precipitationChart">Precipitation:</a></th>
                    <td>${latestWeather.totalPrecipitation} mm</td>
                </tr>
                <tr>
                    <th>Condition:</th>
                    <td>${latestWeather.conditionCode}</td> <!-- No chart for this, so no link -->
                </tr>
            </table>
        `;
  document.getElementById('weatherDetails').innerHTML = details;
  return latestWeather;
}

function getWeatherIcon(conditionCode) {
  const emojiMap = {
    clear: '☀️', // Sun emoji for clear weather
    cloudy: '☁️', // Cloud emoji for cloudy weather
    rain: '🌧️', // Cloud with rain emoji for rain
    thunderstorm: '⛈️', // Cloud with lightning and rain emoji for thunderstorm
    snow: '❄️', // Snowflake emoji for snow
    fog: '🌫️', // Fog emoji for fog
    'partly-cloudy': '⛅', // Sun behind cloud emoji for partly cloudy
    // Add more conditions and emojis as needed
  };

  // Return the emoji for the given condition code, or a default if not found
  return emojiMap[conditionCode.toLowerCase()] || '🌀'; // Cyclone emoji as default
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
