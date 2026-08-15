const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/commands/settings');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1-12 Toggle commands list: [filename, settingKey, name, description]
const toggles = [
  ['alwaysonline.ts', 'alwaysonline', 'alwaysonline', 'Toggle always online status'],
  ['autobio.ts', 'autobio', 'autobio', 'Toggle auto bio update'],
  ['autoblock.ts', 'autoblock', 'autoblock', 'Toggle auto block suspicious callers'],
  ['autoreact.ts', 'autoreact', 'autoreact', 'Toggle auto reaction to messages'],
  ['autoreactstatus.ts', 'autoreactstatus', 'autoreactstatus', 'Toggle auto reaction to status updates'],
  ['autoread.ts', 'autoread', 'autoread', 'Toggle auto read messages'],
  ['autorecord.ts', 'autorecord', 'autorecord', 'Toggle auto recording audio state'],
  ['autorecordtyping.ts', 'autorecordtyping', 'autorecordtyping', 'Toggle auto recording/typing indicator'],
  ['autosavestatus.ts', 'autosavestatus', 'autosavestatus', 'Toggle auto save status media'],
  ['autosend.ts', 'autosend', 'autosend', 'Toggle auto send features'],
  ['autotype.ts', 'autotype', 'autotype', 'Toggle auto typing presence'],
  ['autoviewstatus.ts', 'autoviewstatus', 'autoviewstatus', 'Toggle auto view status updates'],
];

for (const [filename, key, name, desc] of toggles) {
  const code = `import { Command } from '../../types/command';

const command: Command = {
  name: '${name}',
  alias: ['${name}toggle', 'set${name}'],
  category: 'settings',
  description: '${desc}',
  usage: '.${name} [on|off]',
  permission: 4,
  cooldown: 3,
  handler: async (ctx) => {
    const arg = ctx.args[0]?.toLowerCase().trim();
    const current = ctx.db.getSetting('${key}', 'disabled');
    let newState: string;

    if (arg === 'on' || arg === 'enable' || arg === 'true' || arg === '1') {
      newState = 'enabled';
    } else if (arg === 'off' || arg === 'disable' || arg === 'false' || arg === '0') {
      newState = 'disabled';
    } else {
      newState = current === 'enabled' ? 'disabled' : 'enabled';
    }

    ctx.db.setSetting('${key}', newState);
    const isEnabled = newState === 'enabled';
    return ctx.reply(\`⚙️ *${name}* is now *\${isEnabled ? 'ENABLED 🟢' : 'DISABLED 🔴'}*\`);
  },
};

export default command;
`;
  fs.writeFileSync(path.join(targetDir, filename), code);
}

console.log('Generated toggle settings commands 1-12.');
