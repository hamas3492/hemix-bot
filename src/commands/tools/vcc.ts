import { CommandContext } from '../types';

export default {
  name: 'vcc',
  alias: ['fakecard', 'democard'],
  category: 'tools',
  description: 'Generate demo/test virtual credit card details (For testing/dev only)',
  usage: 'vcc [visa|mastercard|amex]',
  permission: 0,
  cooldown: 2,
  handler: async (ctx: CommandContext) => {
    const brand = (ctx.args[0] || 'visa').toLowerCase();

    let prefix = '4532';
    if (brand === 'mastercard') prefix = '5412';
    if (brand === 'amex') prefix = '3782';

    let cardNum = prefix;
    for (let i = 0; i < 12; i++) {
      cardNum += Math.floor(Math.random() * 10);
    }

    const expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const expYear = String(new Date().getFullYear() + Math.floor(Math.random() * 4) + 1);
    const cvv = String(Math.floor(Math.random() * 899) + 100);

    const info = `💳 *DEMO VIRTUAL CREDIT CARD (TESTING ONLY)*

🏷️ *Card Brand:* ${brand.toUpperCase()}
🔢 *Card Number:* \`${cardNum.match(/.{1,4}/g)?.join(' ')}\`
📅 *Expiry Date:* ${expMonth}/${expYear}
🔐 *CVV:* ${cvv}
👤 *Cardholder:* Demo Test User

⚠️ *DISCLAIMER:* This card is generated strictly for software testing & development purposes. It cannot be used for actual purchases.`;

    await ctx.reply(info);
  },
};
