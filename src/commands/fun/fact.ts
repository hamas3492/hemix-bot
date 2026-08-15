import { Command } from '../../types/command';
import axios from 'axios';

const FALLBACK_FACTS = [
  'Honey never spoils. Archeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible!',
  'Bananas are curved because they grow towards the sun against gravity — a process called negative geotropism.',
  'A day on Venus is longer than a year on Venus. Venus takes 243 Earth days to rotate once on its axis.',
  'Octopuses have three hearts and blue blood.',
  'Sloths can hold their breath longer than dolphins — up to 40 minutes under water!'
];

const command: Command = {
  name: 'fact',
  alias: ['funfact', 'facts'],
  category: 'Fun',
  description: 'Get a random interesting fun fact',
  usage: '.fact',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    let fact = '';

    try {
      const res = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random', { timeout: 5000 });
      if (res.data?.text) {
        fact = res.data.text;
      }
    } catch (e) {
      try {
        const res2 = await axios.get('https://api.popcat.xyz/fact', { timeout: 5000 });
        if (res2.data?.fact) {
          fact = res2.data.fact;
        }
      } catch (err) {
        // Fallback
      }
    }

    if (!fact) {
      fact = FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];
    }

    const response =
      `🧠 *DID YOU KNOW?* 💡\n\n` +
      `"${fact}"\n\n` +
      `✨ _Knowledge is power!_`;

    await ctx.reply(response);
  },
};

export default command;
