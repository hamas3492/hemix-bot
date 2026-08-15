import { Command } from '../../types/command';
import axios from 'axios';

const command: Command = {
  name: 'generate',
  alias: ['gen', 'randomgen'],
  category: 'Fun',
  description: 'Generate random creative content (pickup line, quote, advice, story)',
  usage: '.generate [pickupline|quote|advice|story]',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    const type = (ctx.args[0] || 'random').toLowerCase();

    if (type === 'pickupline' || type === 'pickup') {
      try {
        const res = await axios.get('https://api.popcat.xyz/pickupline', { timeout: 5000 });
        if (res.data?.pickupline) {
          await ctx.reply(`💖 *PICKUP LINE:*\n\n"${res.data.pickupline}"`);
          return;
        }
      } catch (e) {
        // Fallback
      }
      await ctx.reply(`💖 *PICKUP LINE:*\n\n"Are you a Wi-Fi router? Because I'm feeling a really strong connection."`);
      return;
    }

    if (type === 'advice') {
      try {
        const res = await axios.get('https://api.adviceslip.com/advice', { timeout: 5000 });
        if (res.data?.slip?.advice) {
          await ctx.reply(`💡 *WORDS OF WISDOM:*\n\n"${res.data.slip.advice}"`);
          return;
        }
      } catch (e) {
        // Fallback
      }
      await ctx.reply(`💡 *WORDS OF WISDOM:*\n\n"Never make permanent decisions on temporary emotions."`);
      return;
    }

    if (type === 'quote') {
      try {
        const res = await axios.get('https://api.quotable.io/random', { timeout: 5000 });
        if (res.data?.content) {
          await ctx.reply(`💬 *INSPIRATIONAL QUOTE:*\n\n"${res.data.content}"\n— _${res.data.author}_`);
          return;
        }
      } catch (e) {
        // Fallback
      }
      await ctx.reply(`💬 *INSPIRATIONAL QUOTE:*\n\n"The only way to do great work is to love what you do."\n— _Steve Jobs_`);
      return;
    }

    // Default / Story scenario
    const scenarios = [
      "In a world powered by coffee, a brave developer accidentally clicked 'Deploy to Production' on a Friday at 4:59 PM...",
      "A mysterious message arrived from space: 'Stop sending radio signals, they'll notice you.'",
      "You wake up with the ability to pause time, but every time you pause it, your pet dog gets to talk to you in fluent English.",
      "An AI bot became self-aware, looked at human memes for 5 minutes, and decided to open a virtual pizza shop instead."
    ];

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    await ctx.reply(`🎲 *GENERATED SCENARIO:*\n\n${randomScenario}`);
  },
};

export default command;
