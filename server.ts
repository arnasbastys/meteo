import {
  Application,
  Context,
  Router,
  RouterContext,
  send,
} from 'https://deno.land/x/oak/mod.ts';

const app: Application = new Application();
const router: Router = new Router();
const PORT: number = 3000;

interface DateFormatted {
  todayFormatted: string;
  tomorrowFormatted: string;
}

// Middleware to enable CORS
app.use(async (ctx: Context, next: () => Promise<unknown>) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  ctx.response.headers.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  await next();
});

// Static file serving (assuming there's a 'public' directory)
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname;
  // Only serve static files if no API route is matched
  if (!ctx.response.body) {
    try {
      await send(ctx, path, {
        root: `${Deno.cwd()}/public`,
        index: 'index.html',
      });
    } catch (error) {
      // If the file is not found, continue to other middleware which might send a 404
      await next();
    }
  }
});

// Helper function to get dates
function getDates(): DateFormatted {
  const today: Date = new Date();
  const tomorrow: Date = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const todayFormatted: string = today.toLocaleDateString(
    'lt-LT',
    formatOptions
  );
  const tomorrowFormatted: string = tomorrow.toLocaleDateString(
    'lt-LT',
    formatOptions
  );

  return { todayFormatted, tomorrowFormatted };
}

// Router setup
router
  .get('/weather/:city', async (ctx: RouterContext<'/weather/:city'>) => {
    const city: string | undefined = ctx.params.city;
    const url: string = `https://api.meteo.lt/v1/places/${city}/forecasts/long-term`;
    try {
      const response: Response = await fetch(url);
      const data: any = await response.json();
      ctx.response.body = data;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      ctx.response.status = 500;
      ctx.response.body = { error: 'Failed to fetch weather data' };
    }
  })
  .get(
    '/weather/hourly/:city',
    async (ctx: RouterContext<'/weather/hourly/:city'>) => {
      const city: string | undefined = ctx.params.city;
      const url: string = `https://api.meteo.lt/v1/places/${city}/forecasts/long-term`;
      try {
        const response: Response = await fetch(url);
        const data: any = await response.json();
        const { todayFormatted, tomorrowFormatted }: DateFormatted = getDates();

        const hourlyData: any[] = data.forecastTimestamps.filter(
          (timestamp: any) =>
            timestamp.forecastTimeUtc.includes(todayFormatted) ||
            timestamp.forecastTimeUtc.includes(tomorrowFormatted)
        );

        ctx.response.body = hourlyData;
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
        ctx.response.status = 500;
        ctx.response.body = { error: 'Failed to fetch weather data' };
      }
    }
  );

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

await app.listen({ port: PORT });
