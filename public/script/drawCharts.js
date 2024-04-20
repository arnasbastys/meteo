function setupSvgChart(elementId) {
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

  return { svg, margin, width, height };
}

const parseTime = (weatherData, valueKey) => {
  const parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
  const data = weatherData
    .map((d) => {
      const utcDate = parseTime(d.forecastTimeUtc);
      return {
        ...d,
        forecastTimeUtc: new Date(
          utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
        ),
        [valueKey]: +d[valueKey],
      };
    })
    .filter((d) => !isNaN(d[valueKey]) && d.forecastTimeUtc != null);

  return data;
};

export function drawChart(
  weatherData,
  latestWeather,
  elementId,
  valueKey,
  label,
  yAxisLabel
) {
  const { svg, margin, width, height } = setupSvgChart(elementId);
  // Parse the date and adjust to local time
  const data = parseTime(weatherData, valueKey);
  // Define scales
  const x = d3
    .scaleTime()
    .range([0, width])
    .domain(d3.extent(data, (d) => d.forecastTimeUtc));
  const y = d3
    .scaleLinear()
    .range([height, 0])
    .domain([
      d3.min(data, (d) => d[valueKey] - 1),
      d3.max(data, (d) => d[valueKey]),
    ]);

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

  svg.append('g').call(d3.axisLeft(y).tickFormat(d3.format('.0f')));

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
    .attr('y', height + margin.bottom)
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
  const formatTime = d3.timeFormat('%H:%M'); // Format the time to hour and minute

  svg
    .append('text')
    .attr('x', x(currentTime) + 5)
    .attr('y', 20)
    .text(formatTime(currentTime))
    .style('fill', 'red')
    .style('font-size', '12px');

  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', -20)
    .attr('text-anchor', 'middle')
    .text(`Current value: ${latestWeather[valueKey]}`)
    .style('fill', 'blue')
    .style('font-size', '15px');
}

export function drawPrecipitationChart(weatherData, elementId, valueKey) {
  const { svg, width, height } = setupSvgChart(elementId);

  const data = parseTime(weatherData, valueKey);

  // Scales
  const x = d3
    .scaleTime()
    .range([0, width])
    .domain(d3.extent(data, (d) => new Date(d.forecastTimeUtc)));

  const y = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(data, (d) => d[valueKey] + 0.2)]);

  // Create bars
  const barWidth = width / data.length; // Calculate bar width based on data length
  svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => x(new Date(d.forecastTimeUtc)) - barWidth / 2) // Adjust centering of the bar
    .attr('y', (d) => y(d[valueKey]))
    .attr('width', barWidth)
    .attr('height', (d) => height - y(d[valueKey]))
    .attr('fill', 'steelblue');

  // Generate tick values for every hour
  const allTicks = d3.timeHour.range(
    x.domain()[0],
    x.domain()[1],
    1 // Generate a tick for every hour
  );

  // Label every second hour, creating labels only for even hours
  const labeledTicks = allTicks.filter((d, i) => i % 2 === 0);

  // Add the x Axis with hourly ticks but labels only every two hours
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues(labeledTicks) // Use only the filtered ticks for labeling
        .tickFormat(d3.timeFormat('%H')) // Format hours
    );

  // Add hourly ticks without labels
  svg.append('g').attr('transform', `translate(0,${height})`).call(
    d3.axisBottom(x).tickValues(allTicks).tickSizeOuter(0).tickFormat('') // No label
  );

  // Add the y Axis
  svg.append('g').call(d3.axisLeft(y));

  // Current time marker
  const currentTime = new Date();
  const formatTime = d3.timeFormat('%H:%M');

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

  svg
    .append('text')
    .attr('x', x(currentTime) + 5)
    .attr('y', 20)
    .text(formatTime(currentTime))
    .style('fill', 'red')
    .style('font-size', '12px');
}
