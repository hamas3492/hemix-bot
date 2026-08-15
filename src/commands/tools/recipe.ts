import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'recipe',
  alias: ['cook', 'dishrecipe'],
  category: 'tools',
  description: 'Search food recipe instructions and ingredients',
  usage: 'recipe <dish name>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const query = ctx.text || ctx.args.join(' ');
    if (!query) {
      return await ctx.reply('⚠️ Please enter a dish name (e.g. `recipe Pizza` or `recipe Biryani`)');
    }

    try {
      const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`, { timeout: 8000 });
      const meal = res.data?.meals?.[0];

      if (!meal) {
        return await ctx.reply(`❌ No recipe found for "${query}".`);
      }

      let msg = `🍳 *RECIPE: ${meal.strMeal.toUpperCase()}*\n`;
      msg += `🏷️ *Category:* ${meal.strCategory} | 🌍 *Cuisine:* ${meal.strArea}\n\n`;
      msg += `📖 *Instructions:*\n${meal.strInstructions.slice(0, 1000)}...\n\n`;
      if (meal.strYoutube) msg += `🎥 *Video Tutorial:* ${meal.strYoutube}`;

      await ctx.reply(msg.trim());
    } catch (err) {
      await ctx.reply(`❌ Recipe search error: ${(err as Error).message}`);
    }
  },
};
