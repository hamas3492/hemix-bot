import { config } from '../config';
import { isOwner } from './helpers';
import { db as defaultDb } from '../database';

export enum PermissionLevel {
  USER = 1,
  GROUP_ADMIN = 2,
  SUDO = 3,
  OWNER = 4,
}

export interface PermissionContext {
  isGroup?: boolean;
  groupMetadata?: any;
  db?: typeof defaultDb;
}

export function checkPermission(
  senderJid: string,
  requiredLevel: PermissionLevel,
  context?: PermissionContext
): boolean {
  const database = context?.db || defaultDb;

  // Blocked users are denied at all permission levels
  if (database.isBlocked(senderJid)) {
    return false;
  }

  if (requiredLevel <= PermissionLevel.USER) {
    return true;
  }

  // Check Owner (Level 4)
  const isOwnerUser = isOwner(senderJid, config);
  if (isOwnerUser) {
    return true;
  }
  if (requiredLevel === PermissionLevel.OWNER) {
    return false;
  }

  // Check Sudo (Level 3)
  const isSudoUser = database.isSudo(senderJid);
  if (isSudoUser) {
    return true;
  }
  if (requiredLevel === PermissionLevel.SUDO) {
    return false;
  }

  // Check Group Admin (Level 2)
  if (requiredLevel === PermissionLevel.GROUP_ADMIN) {
    if (!context?.isGroup || !context.groupMetadata) {
      return false;
    }

    const participants = context.groupMetadata.participants || [];
    const cleanSender = senderJid.replace(/[^0-9]/g, '');
    const participant = participants.find((p: any) => {
      const pJid = p.id || p.jid || '';
      return pJid.replace(/[^0-9]/g, '') === cleanSender;
    });

    if (participant && (participant.admin === 'admin' || participant.admin === 'superadmin')) {
      return true;
    }
    return false;
  }

  return true;
}
