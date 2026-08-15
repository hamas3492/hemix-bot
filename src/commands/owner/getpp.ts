import axios from 'axios';
import { CommandContext } from '../types';
import { formatJid } from '../../utils/helpers';

export default {
  name: 'getpp',
  alias: ['getpfp', 'pfp', 'profilepic'],
  category: 'owner',
  description: 'Get profile picture of a user',
  usage: 'getpp [@mention|number|quoted]',
  permission: 4,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    let targetJid = ctx.sender;

    if (ctx.quoted && ctx.quoted.sender) {
      targetJid = ctx.quoted.sender;
    } else if (ctx.args[0]) {
      targetJid = formatJid(ctx.args[0]);
    }

    try {
      let ppUrl = '';
      if (ctx.client && ctx.client.profilePictureUrl) {
        ppUrl = await ctx.client.profilePictureUrl(targetJid, 'image');
      }

      if (!ppUrl) {
        await ctx.reply(`❌ Could not fetch profile picture for user \`${targetJid}\` (privacy settings or no profile picture).`);
        return;
      }

      const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
      const imgBuffer = Buffer.from(response.data);

      await ctx.replyMedia(imgBuffer, 'image/jpeg', `🖼️ *Profile Picture of:* \`${targetJid}\``);
    } catch {
      await ctx.reply(`❌ Failed to retrieve profile picture. The user might have hidden their profile picture.`);
    }
  },
};
