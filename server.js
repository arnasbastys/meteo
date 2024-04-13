import express, { static as staticFun } from 'express';
import fetch from 'node-fetch';
const app = express();
const PORT = 3000;

// Allow CORS for all resources (adjust in production)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// Serve static files from 'public' directory (if you have a frontend in the same project)
app.use(staticFun('public'));

// Proxy endpoint
app.get('/weather/:city', async (req, res) => {
  const city = req.params.city;
  const url = `https://api.meteo.lt/v1/places/${city}/forecasts/long-term`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.get('/weather/hourly/:city', async (req, res) => {
  const city = req.params.city;
  const url = `https://api.meteo.lt/v1/places/${city}/forecasts/long-term`;

  try {
    const response = await fetch(url);
    console.log(response);
    const data = await response.json();
    const { todayFormatted, tomorrowFormatted } = getDates();

    const hourlyData = data.forecastTimestamps.filter(
      (timestamp) =>
        timestamp.forecastTimeUtc.includes(todayFormatted) ||
        timestamp.forecastTimeUtc.includes(tomorrowFormatted)
    );

    res.json(hourlyData);
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

function getDates() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1); // Add one day to the current date

  // Convert dates to 'YYYY-MM-DD' format
  const formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const todayFormatted = today.toLocaleDateString('en-CA', formatOptions); // 'en-CA' uses 'YYYY-MM-DD' format
  const tomorrowFormatted = tomorrow.toLocaleDateString('en-CA', formatOptions);

  return { todayFormatted, tomorrowFormatted };
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
