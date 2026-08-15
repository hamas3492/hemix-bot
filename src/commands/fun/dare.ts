import { Command } from '../../types/command';
import axios from 'axios';

const FALLBACK_DARES = [
  'Send a screenshot of your home screen right now.',
  'Change your status/bio to "I love hemix bot" for 24 hours.',
  'Send a voice note singing the chorus of your favorite song.',
  'Text your best friend and tell them you accidentally broke their window.',
  'Send the last photo in your gallery with zero context.',
  'Post a random funny selfie in the group chat right now.',
  'Do 20 pushups and send a video/audio proof.'
];

const command: Command = {
  name: 'dare',
  alias: ['dares'],
  category: 'Fun',
  description: 'Get a random dare challenge for Truth or Dare',
  usage: '.dare',
  permission: 1,
  cooldown: 3,
  handler: async (ctx) => {
    let dareText = '';

    try {
      const res = await axios.get('https://api.truthordarebot.xyz/v1/dare', { timeout: 5000 });
      if (res.data?.question) {
        dareText = res.data.question;
      }
    } catch (e) {
      // API error fallback
    }

    if (!dareText) {
      dareText = FALLBACK_DARES[Math.floor(Math.random() * FALLBACK_DARES.length)];
    }

    const response =
      `🔥 *TRUTH OR DARE — DARE* 🔥\n\n` +
      `⚡ *Your Challenge:* ${dareText}\n\n` +
      `⏰ *You have 5 minutes to complete it!* No backing out! 😈`;

    await ctx.reply(response);
  },
};

export default command;
