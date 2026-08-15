import { Command } from '../../types/command';
import { getTargetName } from '../../utils/media';
import axios from 'axios';

const FALLBACK_ROASTS = [
  "You're like a light bulb in a room with the blinds open — totally unnecessary.",
  "I'd agree with you, but then we'd both be wrong.",
  "You bring everyone so much joy... when you leave the room.",
  "I'm not saying I hate you, but if you were on fire and I had water, I'd drink it.",
  "Your WiFi connection is stronger than your arguments.",
  "If laughter is the best medicine, your face must be curing the world.",
  "You're proof that even mistakes can be persistent."
];

const command: Command = {
  name: 'bully',
  alias: ['roast', 'insult'],
  category: 'Fun',
  description: 'Playfully bully or roast a user',
  usage: '.bully [mention/name]',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    const target = getTargetName(ctx);
    let roast = '';

    try {
      const res = await axios.get('https://evilinsult.com/generate_nlbr.php?method=web&format=json', { timeout: 5000 });
      if (res.data && res.data.insult) {
        roast = res.data.insult;
      }
    } catch (e) {
      roast = FALLBACK_ROASTS[Math.floor(Math.random() * FALLBACK_ROASTS.length)];
    }

    if (!roast) {
      roast = FALLBACK_ROASTS[Math.floor(Math.random() * FALLBACK_ROASTS.length)];
    }

    await ctx.reply(`💥 *ROAST FOR ${target.toUpperCase()}* 💥\n\n"${roast}"\n\n_(Just playing around! 😉)_`);
  },
};

export default command;
