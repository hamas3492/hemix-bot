import { CommandContext } from '../types';

export default {
  name: 'broadcast',
  alias: ['bc'],
  category: 'owner',
  description: 'Broadcast message to all chats',
  usage: 'broadcast <message>',
  permission: 4,
  cooldown: 10,
  handler: async (ctx: CommandContext) => {
    if (!ctx.text) {
      await ctx.reply(`❌ Please provide a message to broadcast.\n\n*Usage:* \`${ctx.config.botPrefix}broadcast <message>\``);
      return;
    }

    await ctx.reply('📢 *Starting broadcast transmission...*');

    let successCount = 0;
    let failCount = 0;

    const bcText = `📢 *[ BROADCAST ANNOUNCEMENT ]*

${ctx.text}

─────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    try {
      if (ctx.client && ctx.client.groupFetchAllParticipating) {
        const groups = await ctx.client.groupFetchAllParticipating();
        const groupJids = Object.keys(groups);

        for (const gJid of groupJids) {
          try {
            await ctx.client.sendMessage(gJid, { text: bcText });
            successCount++;
          } catch {
            failCount++;
          }
        }
      } else {
        await ctx.client.sendMessage(ctx.jid, { text: bcText });
        successCount++;
      }
    } catch {
      failCount++;
    }

    await ctx.reply(
      `✅ *Broadcast Completed!*\n\n🟢 *Successful:* ${successCount}\n🔴 *Failed:* ${failCount}`
    );
  },
};
