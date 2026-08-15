import { Command } from '../../types/command';
import axios from 'axios';

const FALLBACK_JOKES = [
  { setup: 'Why do programmers prefer dark mode?', delivery: 'Because light attracts bugs!' },
  { setup: 'How many programmers does it take to change a light bulb?', delivery: "None. It's a hardware problem!" },
  { setup: 'Why do TypeScript developers wear glasses?', delivery: 'Because they cannot C#!' },
  { setup: 'There are 10 types of people in the world...', delivery: 'Those who understand binary, and those who don\'t.' }
];

const command: Command = {
  name: 'jokes',
  alias: ['joke', 'funny'],
  category: 'Fun',
  description: 'Get a random hilarious joke',
  usage: '.jokes',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    let setup = '';
    let delivery = '';

    try {
      const res = await axios.get('https://v2.jokeapi.dev/joke/Any?safe-mode', { timeout: 5000 });
      if (res.data) {
        if (res.data.type === 'single') {
          setup = res.data.joke;
        } else if (res.data.type === 'twopart') {
          setup = res.data.setup;
          delivery = res.data.delivery;
        }
      }
    } catch (e) {
      try {
        const res2 = await axios.get('https://official-joke-api.appspot.com/random_joke', { timeout: 5000 });
        if (res2.data) {
          setup = res2.data.setup;
          delivery = res2.data.punchline;
        }
      } catch (err) {
        // Fallback
      }
    }

    if (!setup) {
      const fb = FALLBACK_JOKES[Math.floor(Math.random() * FALLBACK_JOKES.length)];
      setup = fb.setup;
      delivery = fb.delivery;
    }

    let response = `😂 *RANDOM JOKE* 😂\n\n🗣️ ${setup}`;
    if (delivery) {
      response += `\n\n👉 *${delivery}*`;
    }

    await ctx.reply(response);
  },
};

export default command;
