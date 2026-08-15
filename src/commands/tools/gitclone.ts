import { CommandContext } from '../types';
import axios from 'axios';

export default {
  name: 'gitclone',
  alias: ['github', 'ghclone'],
  category: 'tools',
  description: 'Fetch repository details and clone zip download link from GitHub',
  usage: 'gitclone <GitHub Repo URL>',
  permission: 0,
  cooldown: 3,
  handler: async (ctx: CommandContext) => {
    const url = ctx.args[0] || ctx.text;
    if (!url || !url.includes('github.com')) {
      return await ctx.reply('⚠️ Please provide a valid GitHub repo URL (e.g. `gitclone https://github.com/user/repo`)');
    }

    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return await ctx.reply('❌ Invalid GitHub repository format.');
    }

    const [, owner, repoRaw] = match;
    const repo = repoRaw.replace(/\.git$/, '');

    try {
      const apiRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { timeout: 8000 });
      const data = apiRes.data;

      const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${data.default_branch || 'main'}.zip`;

      const info = `📦 *GITHUB REPOSITORY INFO*

📁 *Name:* ${data.name}
👤 *Owner:* ${data.owner?.login}
⭐ *Stars:* ${data.stargazers_count} | 🍴 *Forks:* ${data.forks_count}
🐛 *Open Issues:* ${data.open_issues_count}
📜 *License:* ${data.license?.spdx_id || 'None'}
📝 *Description:* ${data.description || 'No description provided.'}

📥 *Download ZIP:*
${zipUrl}`;

      await ctx.reply(info);
    } catch (err) {
      await ctx.reply(`❌ Error fetching GitHub repository details: ${(err as Error).message}`);
    }
  },
};
