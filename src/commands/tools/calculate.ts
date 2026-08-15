import { CommandContext } from '../types';

export default {
  name: 'calculate',
  alias: ['calc', 'math', 'evalmath'],
  category: 'tools',
  description: 'Safe mathematical expression calculator',
  usage: 'calculate <expression>',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const expr = ctx.text || ctx.args.join(' ');
    if (!expr) {
      return await ctx.reply('⚠️ Please provide a mathematical expression (e.g. `calc (25 * 4) / 2`)');
    }

    const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
    const safeRegex = /^[0-9+\-*/%().\s,MathsincoqrtPIEpowabsceilfloorround**]+$/;

    if (!safeRegex.test(sanitized)) {
      return await ctx.reply('❌ Invalid expression. Only basic math operators and Math functions are allowed.');
    }

    try {
      const result = Function(`"use strict"; return (${sanitized})`)();
      await ctx.reply(`🧮 *CALCULATOR RESULT*\n\n📥 *Expression:* \`${expr}\`\n📤 *Result:* \`${result}\``);
    } catch (err) {
      await ctx.reply(`❌ Math Evaluation Error: ${(err as Error).message}`);
    }
  },
};
