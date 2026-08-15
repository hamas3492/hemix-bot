import { CommandContext } from '../types';

export default {
  name: 'obfuscate',
  alias: ['obfuscatecode', 'jsobfuscate'],
  category: 'tools',
  description: 'Obfuscate JavaScript/TypeScript code snippet',
  usage: 'obfuscate <code>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const code = ctx.text || ctx.args.join(' ') || ctx.quoted?.message?.conversation;
    if (!code) {
      return await ctx.reply('⚠️ Please provide code to obfuscate.');
    }

    const b64 = Buffer.from(code).toString('base64');
    const obfuscated = `(function(_0x1a2b,_0x3c4d){const _0x5e6f=function(_0x7a8b){return Buffer.from(_0x7a8b,'base64').toString('utf-8');};eval(_0x5e6f('${b64}'));})();`;

    await ctx.reply(`🔒 *OBFUSCATED CODE:*\n\n\`\`\`javascript\n${obfuscated}\n\`\`\``);
  },
};
