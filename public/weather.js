async function fetchHourlyWeather(city) {
  const url = `https://light-meteo.deno.dev/weather/hourly/${city}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch hourly weather data:', error);
    return [];
  }
}

function drawChart(
  data,
  latestWeather,
  elementId,
  valueKey,
  label,
  yAxisLabel
) {
  const container = d3.select('#' + elementId);
  const containerWidth = parseInt(container.style('width'));
  const margin = { top: 40, right: 20, bottom: 60, left: 50 },
    width = containerWidth - margin.left - margin.right,
    height = (containerWidth / 3) * 2 - margin.top - margin.bottom;

  const svg = d3
    .select('#' + elementId)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Parse the date and format data
  const parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
  data = data
    .map((d) => {
      return {
        ...d,
        forecastTimeUtc: parseTime(d.forecastTimeUtc),
        [valueKey]: +d[valueKey],
      };
    })
    .filter((d) => !isNaN(d[valueKey]) && d.forecastTimeUtc != null);

  // Define scales
  const x = d3
    .scaleTime()
    .range([0, width])
    .domain(d3.extent(data, (d) => d.forecastTimeUtc));
  const y = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(data, (d) => d[valueKey])]);

  // Define the line
  const line = d3
    .line()
    .x((d) => x(d.forecastTimeUtc))
    .y((d) => y(d[valueKey]));

  // Add paths
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', line);

  // Add axes
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%H'))); // Format as HH

  svg.append('g').call(d3.axisLeft(y));

  // Add labels
  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text(yAxisLabel);

  svg
    .append('text')
    .attr('transform', `translate(${width / 2}, -20)`)
    .style('text-anchor', 'middle')
    .text(label);

  // Adding gradient to SVG
  const defs = svg.append('defs');
  const gradient = defs
    .append('linearGradient')
    .attr('id', 'gradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', y(0))
    .attr('x2', 0)
    .attr('y2', y(d3.max(data, (d) => d[valueKey])));

  gradient
    .append('stop')
    .attr('offset', '0%')
    .attr('style', 'stop-color: steelblue; stop-opacity: 1');
  gradient
    .append('stop')
    .attr('offset', '100%')
    .attr('style', 'stop-color: skyblue; stop-opacity: 1');

  svg
    .append('path')
    .datum(data)
    .attr('class', 'line gradient') // Use the gradient class
    .attr('d', line);

  const currentTime = new Date();
  svg
    .append('line')
    .attr('x1', x(currentTime))
    .attr('x2', x(currentTime))
    .attr('y1', 0)
    .attr('y2', height)
    .attr('class', 'current-time-marker')
    .style('stroke', 'red')
    .style('stroke-width', '2px')
    .style('stroke-dasharray', '5,5');

  // Add text label for current time marker
  svg
    .append('text')
    .attr('x', x(currentTime) + 5)
    .attr('y', 20)
    .text('Current Time')
    .style('fill', 'red')
    .style('font-size', '12px');

  svg
    .append('text')
    .attr('x', x(currentTime) + 5)
    .attr('y', y(latestWeather[valueKey]) - 10)
    .text(`Current value: ${latestWeather[valueKey]}`)
    .style('fill', 'blue')
    .style('font-size', '12px');
}

function displayCurrentWeather(weather) {
  const details = `
      <p>Temperature: ${weather.airTemperature}°C, Feels Like: ${weather.feelsLikeTemperature}°C</p>
      <p>Wind: ${weather.windSpeed} km/h gusting to ${weather.windGust} km/h from ${weather.windDirection} degrees</p>
      <p>Cloud Cover: ${weather.cloudCover}%, Humidity: ${weather.relativeHumidity}%</p>
      <p>Pressure: ${weather.seaLevelPressure} hPa, Precipitation: ${weather.totalPrecipitation} mm</p>
      <p>Condition: ${weather.conditionCode}</p>
  `;
  document.getElementById('weatherDetails').innerHTML = details;
}

async function fetchDataAndDrawCharts(city) {
  const data = await fetchHourlyWeather(city);
  const latestWeather = findClosestWeatherForecast(data);
  if (data && data.length > 0) {
    displayCurrentWeather(latestWeather);
  }
  drawChart(
    data,
    latestWeather,
    'temperatureChart',
    'airTemperature',
    'Forecast Time UTC',
    'Air Temperature (°C)'
  );
  drawChart(
    data,
    latestWeather,
    'feelsLikeTempChart',
    'feelsLikeTemperature',
    'Forecast Time UTC',
    'Feels Like Temperature (°C)'
  );
  drawChart(
    data,
    latestWeather,
    'windSpeedChart',
    'windSpeed',
    'Forecast Time UTC',
    'Wind Speed (km/h)'
  );
  drawChart(
    data,
    latestWeather,
    'windGustChart',
    'windGust',
    'Forecast Time UTC',
    'Wind Gust (km/h)'
  );
  drawChart(
    data,
    latestWeather,
    'cloudCoverChart',
    'cloudCover',
    'Forecast Time UTC',
    'Cloud Cover (%)'
  );
  drawChart(
    data,
    latestWeather,
    'pressureChart',
    'seaLevelPressure',
    'Forecast Time UTC',
    'Sea Level Pressure (hPa)'
  );
  drawChart(
    data,
    latestWeather,
    'humidityChart',
    'relativeHumidity',
    'Forecast Time UTC',
    'Relative Humidity (%)'
  );
  drawChart(
    data,
    latestWeather,
    'precipitationChart',
    'totalPrecipitation',
    'Forecast Time UTC',
    'Total Precipitation (mm)'
  );
}

function findClosestWeatherForecast(weatherData) {
  // Get the current date and time
  const now = new Date();

  // Function to calculate the absolute difference in hours between two dates
  function hourDifference(date1, date2) {
    return Math.abs(date1 - date2) / 36e5; // 36e5 is the number of milliseconds in an hour
  }

  // Initialize variables to keep track of the closest time and its index
  let closestForecast = null;
  let minimumDifference = Infinity;

  // Loop through the weather data
  weatherData.forEach((forecast) => {
    // Convert the forecast time string to a Date object
    const forecastTime = new Date(forecast.forecastTimeUtc);

    // Calculate the hour difference
    const difference = hourDifference(now, forecastTime);

    // Check if this time is closer than the current closest
    if (difference < minimumDifference) {
      closestForecast = forecast;
      minimumDifference = difference;
    }
  });

  // Return the closest forecast
  return closestForecast;
}

fetchDataAndDrawCharts('vilnius');
