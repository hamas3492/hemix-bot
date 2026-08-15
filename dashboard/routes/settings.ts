import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from './auth';
import { db } from '../../src/database';
import { config } from '../../src/config';

export const settingsRouter = Router();

// Apply auth middleware to all settings routes
settingsRouter.use(authMiddleware);

// GET /api/settings - get all bot settings
settingsRouter.get('/', (req: Request, res: Response) => {
  try {
    const rawSettings = db.query<{ key: string; value: string }>('SELECT key, value FROM settings');
    const dbSettingsObj: Record<string, string> = {};
    for (const row of rawSettings) {
      if (row.key !== 'dashboard_password') {
        dbSettingsObj[row.key] = row.value;
      }
    }

    const merged = {
      prefix: dbSettingsObj.prefix || config.botPrefix || '.',
      mode: dbSettingsObj.mode || config.botMode || 'private',
      botName: dbSettingsObj.botName || config.botName || 'Hemix',
      ownerName: dbSettingsObj.ownerName || config.ownerName || 'Owner',
      ownerNumber: dbSettingsObj.ownerNumber || config.ownerNumber || '',
      footer: dbSettingsObj.footer || config.footer || 'Powered by Hemix Bot V1.0',
      menuStyle: dbSettingsObj.menuStyle || String(config.menuStyle || '1'),
      timezone: dbSettingsObj.timezone || config.timezone || 'Asia/Karachi',
      version: config.version || '1.0.0',
    };

    res.json({ success: true, settings: merged, raw: dbSettingsObj });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch settings' });
  }
});

// PUT /api/settings - update settings
settingsRouter.put('/', (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid settings payload' });
      return;
    }

    const allowedKeys = ['prefix', 'mode', 'botName', 'ownerName', 'ownerNumber', 'footer', 'menuStyle', 'timezone'];

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        const valStr = String(body[key]);
        db.setSetting(key, valStr);

        // Update in-memory config
        if (key === 'prefix') config.botPrefix = valStr;
        if (key === 'mode') config.botMode = valStr as 'public' | 'private';
        if (key === 'botName') config.botName = valStr;
        if (key === 'ownerName') config.ownerName = valStr;
        if (key === 'ownerNumber') config.ownerNumber = valStr;
        if (key === 'footer') config.footer = valStr;
        if (key === 'menuStyle') config.menuStyle = valStr;
        if (key === 'timezone') config.timezone = valStr;
      }
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
});

// Helper to scan command files — CACHED (filesystem structure doesn't change at runtime)
let _cachedCommandList: { name: string; category: string; enabled: boolean }[] | null = null;
function getAllCommandsList(): { name: string; category: string; enabled: boolean }[] {
  if (_cachedCommandList !== null) {
    // Refresh enabled/disabled status from DB without re-scanning filesystem
    return _cachedCommandList.map(cmd => ({
      ...cmd,
      enabled: db.getSetting(`cmd_status_${cmd.name}`, 'enabled') !== 'disabled',
    }));
  }

  const result: { name: string; category: string; enabled: boolean }[] = [];
  const commandsDir = path.join(process.cwd(), 'src', 'commands');

  if (!fs.existsSync(commandsDir)) { _cachedCommandList = []; return result; }

  const categories = fs.readdirSync(commandsDir, { withFileTypes: true });

  for (const cat of categories) {
    if (cat.isDirectory()) {
      const catPath = path.join(commandsDir, cat.name);
      const files = fs.readdirSync(catPath);

      for (const file of files) {
        if ((file.endsWith('.ts') || file.endsWith('.js')) && file !== 'index.ts' && file !== 'types.ts') {
          const name = file.replace(/\.(ts|js)$/, '');
          const status = db.getSetting(`cmd_status_${name}`, 'enabled');
          const enabled = status !== 'disabled';
          result.push({ name, category: cat.name, enabled });
        }
      }
    }
  }

  _cachedCommandList = result;
  return result;
}

// GET /api/settings/commands - list all commands
settingsRouter.get('/commands', (req: Request, res: Response) => {
  try {
    const commands = getAllCommandsList();
    res.json({ success: true, commands, count: commands.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch commands' });
  }
});

// PUT /api/settings/commands/:name - enable/disable command
settingsRouter.put('/commands/:name', (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { enabled } = req.body;

    if (enabled === undefined) {
      res.status(400).json({ error: 'Field "enabled" (boolean) is required' });
      return;
    }

    const isEnabled = Boolean(enabled);
    db.setSetting(`cmd_status_${name}`, isEnabled ? 'enabled' : 'disabled');

    res.json({ success: true, name, enabled: isEnabled, message: `Command '${name}' ${isEnabled ? 'enabled' : 'disabled'}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update command' });
  }
});

// GET /api/settings/groups - list group settings
settingsRouter.get('/groups', (req: Request, res: Response) => {
  try {
    const rows = db.query<{ group_id: string; key: string; value: string }>('SELECT group_id, key, value FROM group_settings');
    const groupMap: Record<string, Record<string, string>> = {};

    for (const row of rows) {
      if (!groupMap[row.group_id]) {
        groupMap[row.group_id] = {};
      }
      groupMap[row.group_id][row.key] = row.value;
    }

    const result = Object.keys(groupMap).map((id) => ({
      groupId: id,
      settings: groupMap[id],
    }));

    res.json({ success: true, groups: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch group settings' });
  }
});

// PUT /api/settings/groups/:id - update group settings
settingsRouter.put('/groups/:id', (req: Request, res: Response) => {
  try {
    const groupId = req.params.id;
    const settingsObj = req.body;

    if (!settingsObj || typeof settingsObj !== 'object') {
      res.status(400).json({ error: 'Invalid settings object' });
      return;
    }

    for (const [key, val] of Object.entries(settingsObj)) {
      db.setGroupSetting(groupId, key, String(val));
    }

    res.json({ success: true, groupId, message: 'Group settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update group settings' });
  }
});

// GET /api/settings/ai - AI config
settingsRouter.get('/ai', (req: Request, res: Response) => {
  try {
    const aiConfigRow = db.getApiConfig('openai');
    const enabledSetting = db.getSetting('ai_enabled', 'true');

    const aiConfig = {
      enabled: enabledSetting === 'true',
      apiKey: aiConfigRow?.key_encrypted || db.getSetting('ai_api_key') || config.aiApiKey || '',
      baseUrl: aiConfigRow?.base_url || db.getSetting('ai_base_url') || config.aiBaseUrl || 'https://api.openai.com/v1',
      model: aiConfigRow?.model || db.getSetting('ai_model') || config.aiModel || 'gpt-3.5-turbo',
      provider: 'openai',
    };

    res.json({ success: true, ai: aiConfig });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch AI settings' });
  }
});

// PUT /api/settings/ai - update AI config
settingsRouter.put('/ai', (req: Request, res: Response) => {
  try {
    const { apiKey, baseUrl, model, enabled, provider } = req.body;

    if (enabled !== undefined) {
      db.setSetting('ai_enabled', enabled ? 'true' : 'false');
    }
    if (apiKey !== undefined) {
      db.setSetting('ai_api_key', apiKey);
      config.aiApiKey = apiKey;
    }
    if (baseUrl !== undefined) {
      db.setSetting('ai_base_url', baseUrl);
      config.aiBaseUrl = baseUrl;
    }
    if (model !== undefined) {
      db.setSetting('ai_model', model);
      config.aiModel = model;
    }

    db.setApiConfig(provider || 'openai', apiKey || config.aiApiKey || '', baseUrl || config.aiBaseUrl, model || config.aiModel);

    res.json({ success: true, message: 'AI configuration updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update AI settings' });
  }
});

// GET /api/settings/anti - anti features config per group
settingsRouter.get('/anti', (req: Request, res: Response) => {
  try {
    const rows = db.query<{ group_id: string; key: string; value: string }>(
      "SELECT group_id, key, value FROM group_settings WHERE key LIKE 'anti%'"
    );

    const groupMap: Record<string, Record<string, boolean | string>> = {};

    for (const row of rows) {
      if (!groupMap[row.group_id]) {
        groupMap[row.group_id] = {
          antiLink: false,
          antiBot: false,
          antiSpam: false,
          antiDelete: false,
          antiMedia: false,
          antiBadword: false,
        };
      }
      groupMap[row.group_id][row.key] = row.value === 'true' || row.value === '1';
    }

    res.json({ success: true, antiSettings: groupMap });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch anti settings' });
  }
});

// PUT /api/settings/anti/:groupId - update anti features
settingsRouter.put('/anti/:groupId', (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId;
    const body = req.body;

    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid anti settings payload' });
      return;
    }

    const antiKeys = ['antiLink', 'antiBot', 'antiSpam', 'antiDelete', 'antiMedia', 'antiBadword', 'warningLimit'];

    for (const key of antiKeys) {
      if (body[key] !== undefined) {
        db.setGroupSetting(groupId, key, String(body[key]));
      }
    }

    res.json({ success: true, groupId, message: `Anti-features updated for group ${groupId}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update anti settings' });
  }
});

// GET /api/settings/welcome - welcome/goodbye config
settingsRouter.get('/welcome', (req: Request, res: Response) => {
  try {
    const welcome = {
      welcomeEnabled: db.getSetting('welcome_enabled', 'false') === 'true',
      welcomeMessage: db.getSetting('welcome_message', 'Welcome @user to {group}! 🎉'),
      goodbyeEnabled: db.getSetting('goodbye_enabled', 'false') === 'true',
      goodbyeMessage: db.getSetting('goodbye_message', 'Goodbye @user, we will miss you! 👋'),
    };
    res.json({ success: true, welcome });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch welcome settings' });
  }
});

// PUT /api/settings/welcome - update welcome/goodbye
settingsRouter.put('/welcome', (req: Request, res: Response) => {
  try {
    const { welcomeEnabled, welcomeMessage, goodbyeEnabled, goodbyeMessage } = req.body;

    if (welcomeEnabled !== undefined) db.setSetting('welcome_enabled', welcomeEnabled ? 'true' : 'false');
    if (welcomeMessage !== undefined) db.setSetting('welcome_message', String(welcomeMessage));
    if (goodbyeEnabled !== undefined) db.setSetting('goodbye_enabled', goodbyeEnabled ? 'true' : 'false');
    if (goodbyeMessage !== undefined) db.setSetting('goodbye_message', String(goodbyeMessage));

    res.json({ success: true, message: 'Welcome/Goodbye settings updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update welcome settings' });
  }
});

// GET /api/settings/sticker - sticker settings
settingsRouter.get('/sticker', (req: Request, res: Response) => {
  try {
    const sticker = {
      packName: db.getSetting('sticker_pack', 'Hemix Bot Pack'),
      authorName: db.getSetting('sticker_author', 'Hemix Bot V1.0'),
    };
    res.json({ success: true, sticker });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch sticker settings' });
  }
});

// PUT /api/settings/sticker - update sticker settings
settingsRouter.put('/sticker', (req: Request, res: Response) => {
  try {
    const { packName, authorName } = req.body;

    if (packName !== undefined) db.setSetting('sticker_pack', String(packName));
    if (authorName !== undefined) db.setSetting('sticker_author', String(authorName));

    res.json({ success: true, message: 'Sticker settings updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update sticker settings' });
  }
});

// GET /api/settings/variables - environment variables
settingsRouter.get('/variables', (req: Request, res: Response) => {
  try {
    const rows = db.query<{ key: string; value: string }>('SELECT key, value FROM variables');
    res.json({ success: true, variables: rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch variables' });
  }
});

// PUT /api/settings/variables/:key - set variable
settingsRouter.put('/variables/:key', (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    const { value } = req.body;

    if (value === undefined) {
      res.status(400).json({ error: 'Value is required' });
      return;
    }

    db.setVariable(key, String(value));
    res.json({ success: true, key, value, message: `Variable '${key}' set successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to set variable' });
  }
});

// DELETE /api/settings/variables/:key - delete variable
settingsRouter.delete('/variables/:key', (req: Request, res: Response) => {
  try {
    const key = req.params.key;
    db.deleteVariable(key);
    res.json({ success: true, key, message: `Variable '${key}' deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete variable' });
  }
});

// GET /api/settings/sudo - list sudo users
settingsRouter.get('/sudo', (req: Request, res: Response) => {
  try {
    const sudos = db.getSudos();
    res.json({ success: true, sudos });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch sudo users' });
  }
});

// POST /api/settings/sudo - add sudo user
settingsRouter.post('/sudo', (req: Request, res: Response) => {
  try {
    const { jid } = req.body;
    if (!jid || typeof jid !== 'string') {
      res.status(400).json({ error: 'JID is required' });
      return;
    }

    db.addSudo(jid.trim());
    res.json({ success: true, jid, message: `Added ${jid} to sudo users` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add sudo user' });
  }
});

// DELETE /api/settings/sudo/:jid - remove sudo user
settingsRouter.delete('/sudo/:jid', (req: Request, res: Response) => {
  try {
    const jid = decodeURIComponent(req.params.jid);
    db.removeSudo(jid);
    res.json({ success: true, jid, message: `Removed ${jid} from sudo users` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to remove sudo user' });
  }
});

export default settingsRouter;
