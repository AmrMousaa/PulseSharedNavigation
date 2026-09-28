// Pulse Admin is Pulse's full-access role: it sees every app in the catalog.
// Dataverse's own System Administrator role deliberately grants nothing extra.
const PULSE_ADMIN_ROLE_NAME = 'Pulse Admin';
// The signed-in user's Dataverse id and role membership never change
// mid-session, but nearly every data operation needs them. Each lookup is a
// cross-environment round trip, so cache the in-flight/resolved result once
// per client instead of re-resolving it on every call.
const accessCache = new WeakMap();
export function getCurrentUserAccess(client, getUserContext) {
    let cached = accessCache.get(client);
    if (!cached) {
        cached = (async () => {
            const context = await getUserContext();
            if (!context.objectId)
                throw new Error('Unable to determine the current user.');
            const users = await client.list('systemusers', {
                filter: `azureactivedirectoryobjectid eq ${context.objectId}`,
                select: ['systemuserid'],
            });
            const userId = users[0]?.systemuserid;
            if (!userId)
                throw new Error('The current user was not found in Dataverse.');
            const roles = await client.list('roles', {
                filter: `systemuserroles_association/any(su:su/systemuserid eq ${userId})`,
                select: ['roleid', 'name'],
            });
            return {
                userId,
                roleIds: new Set(roles.map((role) => role.roleid)),
                isPulseAdmin: roles.some((role) => role.name === PULSE_ADMIN_ROLE_NAME),
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
