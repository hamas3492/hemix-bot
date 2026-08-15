import { Command } from '../../types/command';
import { getTargetJid } from '../../utils/groupHelpers';

const command: Command = {
  name: 'addsudo',
  alias: ['setsudo', 'newsudo'],
  category: 'group',
  description: 'Add a user as a sudo user (bot administrator)',
  usage: '.addsudo <@mention / number / reply>',
  permission: 4,
  cooldown: 3,
  handler: async (ctx) => {
    const targetJid = getTargetJid(ctx);
    if (!targetJid) {
      return ctx.reply('❌ Please mention a user, reply to their message, or enter their number.');
    }

    if (ctx.db.isSudo(targetJid)) {
      return ctx.reply('⚠️ User is already a sudo user.');
    }

    ctx.db.addSudo(targetJid);
    const num = targetJid.split('@')[0];
    return ctx.reply(`👑 User *@${num}* has been added as a Sudo user!`, { mentions: [targetJid] });
  },
};

export default command;
