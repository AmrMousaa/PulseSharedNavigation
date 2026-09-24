import type { CurrentUserAccess, DataverseClient, UserContext } from '../types';

const SYSTEM_ADMINISTRATOR_ROLE_NAME = 'System Administrator';

// The signed-in user's Dataverse id and role membership never change
// mid-session, but nearly every data operation needs them. Each lookup is a
// cross-environment round trip, so cache the in-flight/resolved result once
// per client instead of re-resolving it on every call.
const accessCache = new WeakMap<DataverseClient, Promise<CurrentUserAccess>>();

export function getCurrentUserAccess(
  client: DataverseClient,
  getUserContext: () => Promise<UserContext>
): Promise<CurrentUserAccess> {
  let cached = accessCache.get(client);
  if (!cached) {
    cached = (async () => {
      const context = await getUserContext();
      if (!context.objectId) throw new Error('Unable to determine the current user.');

      const users = await client.list<{ systemuserid: string }>('systemusers', {
        filter: `azureactivedirectoryobjectid eq ${context.objectId}`,
        select: ['systemuserid'],
      });
      const userId = users[0]?.systemuserid;
      if (!userId) throw new Error('The current user was not found in Dataverse.');

      const roles = await client.list<{ roleid: string; name?: string }>('roles', {
        filter: `systemuserroles_association/any(su:su/systemuserid eq ${userId})`,
        select: ['roleid', 'name'],
      });

      return {
        userId,
        roleIds: new Set(roles.map((role) => role.roleid)),
        isSystemAdministrator: roles.some((role) => role.name === SYSTEM_ADMINISTRATOR_ROLE_NAME),
      };
    })().catch((err) => {
      // Don't cache a failed lookup — let the next call retry.
      accessCache.delete(client);
      throw err;
    });
    accessCache.set(client, cached);
  }
  return cached;
}
