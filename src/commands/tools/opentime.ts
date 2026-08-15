import { CommandContext } from '../types';

export default {
  name: 'opentime',
  alias: ['autoopen', 'timedopen'],
  category: 'tools',
  description: 'Automatically open group chat after specified duration (e.g. 10s, 5m, 1h)',
  usage: 'opentime <duration e.g. 10s|5m|1h>',
  permission: 2,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    if (!ctx.isGroup) {
      return await ctx.reply('⚠️ This command can only be used in a group chat.');
    }

    const timeArg = ctx.args[0];
    if (!timeArg) {
      return await ctx.reply('⚠️ Please specify a duration (e.g. `opentime 30s` or `opentime 10m`)');
    }

    const unit = timeArg.slice(-1).toLowerCase();
    const val = parseInt(timeArg.slice(0, -1), 10);

    if (isNaN(val) || val <= 0) {
      return await ctx.reply('❌ Invalid duration format.');
    }

    let ms = val * 1000;
    if (unit === 'm') ms = val * 60 * 1000;
    if (unit === 'h') ms = val * 60 * 60 * 1000;

    await ctx.reply(`⏱️ *Timer set! Group will automatically open in ${val}${unit}.*`);

    setTimeout(async () => {
      try {
        await ctx.client.groupSettingUpdate(ctx.jid, 'not_announcement');
        await ctx.client.sendMessage(ctx.jid, { text: '🔓 *Timer elapsed! Group is now OPEN for all members.*' });
      } catch (err) {
        // ignore
      }
    }, ms);
  },
};
