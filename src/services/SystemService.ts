import os from 'os';
import si from 'systeminformation';
import { formatUptime, detectPlatform } from '../utils/helpers';
import { commandRegistry } from '../core/PluginSystem';

export class SystemService {
  public getUptime(): { seconds: number; formatted: string } {
    const uptimeSeconds = Math.floor(process.uptime());
    return {
      seconds: uptimeSeconds,
      formatted: formatUptime(uptimeSeconds),
    };
  }

  public async getCPUUsage(): Promise<number> {
    try {
      const load = await si.currentLoad();
      return Math.round(load.currentLoad * 100) / 100;
    } catch {
      const cpus = os.cpus();
      const avgLoad = os.loadavg()[0] || 0;
      return cpus.length > 0 ? Math.min(100, Math.round((avgLoad / cpus.length) * 100)) : 0;
    }
  }

  public getRAMUsage(): {
    totalMb: number;
    usedMb: number;
    freeMb: number;
    usagePercent: number;
    formatted: string;
  } {
    const totalBytes = os.totalmem();
    const freeBytes = os.freemem();
    const usedBytes = totalBytes - freeBytes;

    const totalMb = Math.round(totalBytes / (1024 * 1024));
    const usedMb = Math.round(usedBytes / (1024 * 1024));
    const freeMb = Math.round(freeBytes / (1024 * 1024));
    const usagePercent = Math.round((usedBytes / totalBytes) * 1000) / 10;

    return {
      totalMb,
      usedMb,
      freeMb,
      usagePercent,
      formatted: `${usedMb}MB / ${totalMb}MB (${usagePercent}%)`,
    };
  }

  public async getStorage(): Promise<{
    fs: string;
    sizeGb: number;
    usedGb: number;
    availableGb: number;
    usePercent: number;
  }[]> {
    try {
      const disks = await si.fsSize();
      return disks.map(disk => ({
        fs: disk.fs,
        sizeGb: Math.round((disk.size / (1024 * 1024 * 1024)) * 100) / 100,
        usedGb: Math.round((disk.used / (1024 * 1024 * 1024)) * 100) / 100,
        availableGb: Math.round((disk.available / (1024 * 1024 * 1024)) * 100) / 100,
        usePercent: Math.round(disk.use * 10) / 10,
      }));
    } catch {
      return [];
    }
  }

  public getNodeVersion(): string {
    return process.version;
  }

  public getPlatform(): string {
    return detectPlatform();
  }

  public getLoadedPlugins(): { name: string; category: string }[] {
    const commands = commandRegistry.getAllCommands();
    return commands.map(cmd => ({
      name: cmd.name,
      category: cmd.category,
    }));
  }

  public getCommandCount(): number {
    return commandRegistry.getAllCommands().length;
  }
}

export const systemService = new SystemService();
export default systemService;
