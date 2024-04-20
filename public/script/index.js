import { displayCurrentWeather } from './currentWeather.js';
import { fetchHourlyWeather } from './fetchWeather.js';
import { drawChart, drawPrecipitationChart } from './drawCharts.js';

async function fetchDataAndDrawCharts(city) {
  const data = await fetchHourlyWeather(city);
  let latestWeather;
  if (data && data.length > 0) {
    latestWeather = displayCurrentWeather(data);
  }
  drawChart(
    data,
    latestWeather,
    'temperatureChart',
    'airTemperature',
    'Forecast Time',
    'Air Temperature (°C)'
  );
  drawPrecipitationChart(
    data,
    'precipitationChart',
    'totalPrecipitation',
    'Forecast Time UTC',
    'Total Precipitation (mm)'
  );
  drawChart(
    data,
    latestWeather,
    'feelsLikeTempChart',
    'feelsLikeTemperature',
    'Forecast Time',
    'Feels Like Temperature (°C)'
  );
  drawChart(
    data,
    latestWeather,
    'windSpeedChart',
    'windSpeed',
    'Forecast Time',
    'Wind Speed (km/h)'
  );
  drawChart(
    data,
    latestWeather,
    'windGustChart',
    'windGust',
    'Forecast Time',
    'Wind Gust (km/h)'
  );
  drawChart(
    data,
    latestWeather,
    'cloudCoverChart',
    'cloudCover',
    'Forecast Time',
    'Cloud Cover (%)'
  );
  drawChart(
    data,
    latestWeather,
    'pressureChart',
    'seaLevelPressure',
    'Forecast Time',
    'Sea Level Pressure (hPa)'
  );
  drawChart(
    data,
    latestWeather,
    'humidityChart',
    'relativeHumidity',
    'Forecast Time',
    'Relative Humidity (%)'
  );
}

fetchDataAndDrawCharts('vilnius');
