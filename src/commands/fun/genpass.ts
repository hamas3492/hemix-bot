import { Command } from '../../types/command';
import crypto from 'crypto';

const command: Command = {
  name: 'genpass',
  alias: ['password', 'passgen', 'genpassword'],
  category: 'Fun',
  description: 'Generate a secure random password',
  usage: '.genpass [length]',
  permission: 1,
  cooldown: 2,
  handler: async (ctx) => {
    let length = parseInt(ctx.args[0], 10);
    if (isNaN(length) || length < 4) {
      length = 12;
    }
    if (length > 64) {
      length = 64;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      password += chars[randomBytes[i] % chars.length];
    }

    const strength = length >= 16 ? '💪 VERY STRONG' : length >= 12 ? '🔒 STRONG' : '⚠️ MEDIUM';

    const response =
      `🔑 *PASSWORD GENERATOR* 🔑\n\n` +
      `*Generated Password:* \`${password}\`\n` +
      `*Length:* ${length} characters\n` +
      `*Strength:* ${strength}\n\n` +
      `_Note: Keep your passwords safe and never share them with anyone!_`;

    await ctx.reply(response);
  },
};

export default command;
