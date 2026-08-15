import fs from 'fs';
import path from 'path';
import { db } from '../database';
import logger from '../utils/logger';
import { CommandContext, Command } from '../commands/types';

export { CommandContext, Command };

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private aliases: Map<string, string> = new Map();

  public register(command: Command): void {
    if (!command || !command.name) return;
    const nameLower = command.name.toLowerCase();
    this.commands.set(nameLower, command);

    if (command.alias && Array.isArray(command.alias)) {
      for (const alias of command.alias) {
        if (alias) {
          this.aliases.set(alias.toLowerCase(), nameLower);
        }
      }
    }

    try {
      const existing = db.getPlugin(nameLower);
      if (!existing) {
        db.setPlugin(nameLower, true, JSON.stringify({ category: command.category }));
      }
    } catch {
      // Ignore DB initialization errors
    }
  }

  public getCommand(nameOrAlias: string): Command | undefined {
    if (!nameOrAlias) return undefined;
    const normalized = nameOrAlias.toLowerCase();
    const direct = this.commands.get(normalized);
    if (direct) return direct;

    const aliasName = this.aliases.get(normalized);
    if (aliasName) {
      return this.commands.get(aliasName);
    }
    return undefined;
  }

  public getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  public getCommandsByCategory(): Map<string, Command[]> {
    const map = new Map<string, Command[]>();
    for (const cmd of this.commands.values()) {
      const cat = cmd.category || 'Others';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(cmd);
    }
    return map;
  }

  public loadCommandsFromDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) return;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        this.loadCommandsFromDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) && !entry.name.endsWith('.d.ts')) {
        try {
          const module = require(fullPath);
          const cmd: Command = module.default || module.command;

          if (cmd && cmd.name && typeof cmd.handler === 'function') {
            this.register(cmd);
            logger.debug(`Loaded command: ${cmd.name} from ${entry.name}`);
          }
        } catch (err) {
          logger.error(`Failed to load command file '${fullPath}': ${(err as Error).message}`);
        }
      }
    }
  }

  public loadAllCommands(): void {
    const commandsDir = path.join(__dirname, '..', 'commands');
    logger.info(`Loading commands from ${commandsDir}...`);
    this.loadCommandsFromDir(commandsDir);
    logger.info(`Total commands loaded: ${this.commands.size}`);
  }

  public async execute(nameOrAlias: string, ctx: CommandContext): Promise<boolean> {
    const cmd = this.getCommand(nameOrAlias);
    if (!cmd) return false;

    // Check plugin status in DB
    const pluginState = db.getPlugin(cmd.name.toLowerCase());
    if (pluginState && !pluginState.enabled) {
      await ctx.reply(`⚠️ Command '${cmd.name}' is currently disabled.`);
      return false;
    }

    try {
      await cmd.handler(ctx);
      return true;
    } catch (err) {
      logger.error(`Error executing command '${cmd.name}': ${(err as Error).message}`);
      await ctx.reply(`❌ Error running command: ${(err as Error).message || err}`);
      return false;
    }
  }
}

export const commandRegistry = new CommandRegistry();
export default commandRegistry;
