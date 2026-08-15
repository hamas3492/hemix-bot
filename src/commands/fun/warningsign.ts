import { CommandContext } from '../types';

export default {
  name: 'warningsign',
  alias: ['warnsign'],
  category: 'Fun',
  description: 'Warning sign generator',
  usage: '.warningsign <text>',
  permission: 1,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const text = ctx.text || 'Warning';
    await ctx.reply(`⚠️ WARNING ⚠️\n\n┌─────────────────┐\n│  ⚠️  ${text.toUpperCase()}  ⚠️  │\n└─────────────────┘`);
  },
};
