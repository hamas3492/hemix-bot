import { CommandContext } from '../types';

export default {
  name: 'code',
  alias: ['formatcode', 'prettycode'],
  category: 'tools',
  description: 'Code snippet formatter',
  usage: 'code <language> <code>',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const lang = ctx.args[0] || 'js';
    const codeBody = ctx.args.slice(1).join(' ') || ctx.quoted?.message?.conversation || ctx.quoted?.message?.extendedTextMessage?.text;

    if (!codeBody) {
      return await ctx.reply('⚠️ Please provide code to format or reply to a message containing code.');
    }

    const formatted = `\`\`\`${lang}\n${codeBody.trim()}\n\`\`\``;
    await ctx.reply(`💻 *FORMATTED CODE (${lang.toUpperCase()}):*\n\n${formatted}`);
  },
};
