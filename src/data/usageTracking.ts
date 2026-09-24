import type { DataverseClient } from '../types';

function todayDateOnly(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

async function recordDailyClick(client: DataverseClient, appId: string, today: string): Promise<void> {
  const [existing] = await client.list<{ pulse_appusagestatsid: string; pulse_clickcount?: number }>('pulse_appusagestatses', {
    filter: `_pulse_app_value eq ${appId} and pulse_date eq ${today}`,
    select: ['pulse_appusagestatsid', 'pulse_clickcount'],
  });
  if (existing) {
    // Two simultaneous clicks can both read the same count and undercount by
    // one. Accepted: the Pulse dashboard shows trends, not an audit count.
    await client.update('pulse_appusagestatses', existing.pulse_appusagestatsid, {
      pulse_clickcount: (existing.pulse_clickcount ?? 0) + 1,
    });
  } else {
    await client.create('pulse_appusagestatses', {
      'pulse_App@odata.bind': `/pulse_apps(${appId})`,
      pulse_date: today,
      pulse_clickcount: 1,
      statecode: 0,
    });
  }
}

async function recordLastUsed(client: DataverseClient, appId: string, userId: string, today: string): Promise<void> {
  const [existing] = await client.list<{ pulse_appuserlastusedid: string }>('pulse_appuserlastuseds', {
    filter: `_pulse_app_value eq ${appId} and _pulse_user_value eq ${userId}`,
    select: ['pulse_appuserlastusedid'],
  });
  if (existing) {
    await client.update('pulse_appuserlastuseds', existing.pulse_appuserlastusedid, { pulse_lastuseddate: today });
  } else {
    await client.create('pulse_appuserlastuseds', {
      'pulse_App@odata.bind': `/pulse_apps(${appId})`,
      'pulse_User@odata.bind': `/systemusers(${userId})`,
      pulse_lastuseddate: today,
      statecode: 0,
    });
  }
}

/**
 * Feeds the Pulse usage analytics dashboard. Never throws — failures are only
 * logged, so tracking can never block or break an app launch.
 */
export async function recordAppUsage(client: DataverseClient, appId: string, getUserId: () => Promise<string>): Promise<void> {
  try {
    const userId = await getUserId();
    const today = todayDateOnly();
    await Promise.allSettled([recordDailyClick(client, appId, today), recordLastUsed(client, appId, userId, today)]);
  } catch (err) {
    console.warn('[pulse-shared-navigation] Failed to record app usage:', err);
  }
}
