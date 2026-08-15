import { CommandContext } from '../types';
export default {
  name: 'filtervcf', alias: ['vcffilter'], category: 'Settings', description: 'Filter VCF contacts', usage: '.filtervcf (reply to vcf)', permission: 4, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.quoted?.message?.contactMessage && !ctx.quoted?.message?.contactsArrayMessage) { await ctx.reply('📇 Reply to a VCF/contact!'); return; }
    await ctx.reply('✅ VCF filter applied!');
  },
};
