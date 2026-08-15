import { CommandContext } from '../types';

export default {
  name: 'fancy',
  alias: ['styletext', 'font'],
  category: 'tools',
  description: 'Fancy text font generator',
  usage: 'fancy <text>',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const input = ctx.text || ctx.args.join(' ');
    if (!input) {
      return await ctx.reply('⚠️ Please provide text to convert into fancy fonts!');
    }

    let res = `✨ *FANCY TEXT VARIATIONS*\n\n`;
    res += `1. *Bold:* *${input.toUpperCase()}*\n`;
    res += `2. *Monospace:* \`\`\`${input}\`\`\`\n`;
    res += `3. *Spaced:* ${input.split('').join(' ')}\n`;
    res += `4. *Reversed:* ${input.split('').reverse().join('')}\n`;
    res += `5. *Bracketed:* [ ${input} ]\n`;

    await ctx.reply(res);
  },
};
