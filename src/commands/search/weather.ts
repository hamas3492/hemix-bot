import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'weather',
  alias: ['w'],
  category: 'Search',
  description: 'Get weather info',
  usage: '.weather <city>',
  permission: 1,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) { await ctx.reply('🌤️ Please provide a city name!'); return; }
    try {
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ctx.text)}&count=1`, { timeout: 10000 });
      if (!geoRes.data?.results?.[0]) { await ctx.reply('❌ City not found!'); return; }
      const { latitude, longitude, name, country } = geoRes.data.results[0];
      const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`, { timeout: 10000 });
      const w = weatherRes.data.current;
      const codeMap: Record<number, string> = { 0: '☀️ Clear sky', 1: '🌤️ Mainly clear', 2: '⛅ Partly cloudy', 3: '☁️ Overcast', 45: '🌫️ Foggy', 51: '🌦️ Light drizzle', 53: '🌧️ Drizzle', 61: '🌧️ Rain', 63: '🌧️ Rain', 65: '🌧️ Heavy rain', 71: '🌨️ Snow', 73: '🌨️ Snow', 75: '❄️ Heavy snow', 80: '🌦️ Rain showers', 81: '🌧️ Rain showers', 82: '⛈️ Violent rain', 95: '⛈️ Thunderstorm', 96: '⛈️ Thunderstorm with hail' };
      const desc = codeMap[w.weather_code] || '🌡️ Unknown';
      let text = `🌤️ *Weather: ${name}, ${country}*\n\n`;
      text += `${desc}\n`;
      text += `🌡️ Temperature: ${w.temperature_2m}°C (Feels like ${w.apparent_temperature}°C)\n`;
      text += `💧 Humidity: ${w.relative_humidity_2m}%\n`;
      text += `💨 Wind: ${w.wind_speed_10m} km/h`;
      await ctx.reply(text);
    } catch (err: any) { await ctx.reply(`❌ Error: ${err.message}`); }
  },
};
