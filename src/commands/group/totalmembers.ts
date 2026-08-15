import { CommandContext } from '../types';
export default {
  name: 'totalmembers', alias: ['members'], category: 'Group', description: 'Show total member count', usage: '.totalmembers', permission: 1, cooldown: 5,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup || !ctx.groupMetadata) { await ctx.reply('❌ Group only!'); return; }
    const count = ctx.groupMetadata.participants?.length || 0;
    const admins = ctx.groupMetadata.participants?.filter((p: any) => p.admin)?.length || 0;
    await ctx.reply(`👥 *Group Members*\n\n📊 Total: ${count}\n👮 Admins: ${admins}\n👤 Members: ${count - admins}`);
  },
};
