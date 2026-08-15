import { CommandContext } from '../types';

export default {
  name: 'vcf',
  alias: ['contactfile', 'makevcf'],
  category: 'tools',
  description: 'Generate VCF contact file from user or text',
  usage: 'vcf <name> <number>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const name = ctx.args[0] || ctx.senderName || 'Contact';
    const number = ctx.args[1] || ctx.sender.replace(/[^0-9]/g, '');

    const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=CELL:+${number}
END:VCARD`;

    const buffer = Buffer.from(vcfContent, 'utf-8');

    try {
      await ctx.client.sendMessage(
        ctx.jid,
        {
          document: buffer,
          mimetype: 'text/vcard',
          fileName: `${name.replace(/\s+/g, '_')}.vcf`,
        },
        { quoted: ctx.message }
      );
    } catch (err) {
      await ctx.reply(`❌ Failed to send VCF file: ${(err as Error).message}`);
    }
  },
};
