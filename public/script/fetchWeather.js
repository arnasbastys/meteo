export async function fetchHourlyWeather(city) {
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
