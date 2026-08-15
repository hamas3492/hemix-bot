import { CommandContext } from '../types';

export default {
  name: 'pair',
  alias: ['pairing', 'paircode', 'link'],
  category: 'others',
  description: 'Generate pairing info link',
  usage: 'pair',
  permission: 0,
  cooldown: 5,
  handler: async (ctx: CommandContext) => {
    const port = ctx.config.port || 3000;
    const botName = ctx.config.botName || 'Hemix Bot';

    // Detect the dashboard URL dynamically.
    // On Katabump/Pterodactyl, the panel exposes the server via an
    // auto-assigned domain/IP — never "localhost". We try DASHBOARD_URL
    // from env first, then fall back to the server's hostname, then
    // finally to the PORT-only format as last resort.
    let dashboardUrl = process.env.DASHBOARD_URL || '';
    if (!dashboardUrl) {
      try {
        const os = require('os');
        const hostname = os.hostname();
        if (hostname && hostname !== 'localhost') {
          // Pterodactyl/Katabump containers usually have a meaningful hostname
          // but external access is via the panel's assigned domain — we can't
          // guess it, so we show the port with a note.
          dashboardUrl = `http://<your-server-address>:${port}`;
        } else {
          dashboardUrl = `http://<your-server-address>:${port}`;
        }
      } catch {
        dashboardUrl = `http://<your-server-address>:${port}`;
      }
    }

    const pairMsg = `╭─── [ 🔗 *PAIRING & DASHBOARD INFO* ] ───
│
├ 🤖 *Bot:* ${botName}
├ 🌐 *Dashboard:* ${dashboardUrl}
├ 🔑 *Pairing Method:* WhatsApp Web / Self-Pairing Code
│
├ 📌 *Instructions:*
│  1. Open the Web Dashboard URL shown above in your browser.
│  2. Enter your phone number with country code.
│  3. Enter the 8-digit code received into WhatsApp linked devices.
│
├ 💡 *Note:* Replace <your-server-address> with your Katabump panel's
│  assigned IP or domain. Set DASHBOARD_URL in .env to skip this.
│
┰────────────────────────────────────────
_${ctx.config.footer || 'Powered by Hemix Bot V1.0'}_`;

    await ctx.reply(pairMsg);
  },
};
