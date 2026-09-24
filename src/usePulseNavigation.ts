import { useCallback, useEffect, useState } from 'react';
import { getContext } from '@microsoft/power-apps/app';
import { getCurrentUserAccess } from './data/currentUser';
import { loadNavigation } from './data/navigation';
import { recordAppUsage } from './data/usageTracking';
import { MAX_FAVORITES, useFavorites } from './data/useFavorites';
import { delay, USAGE_RECORD_TIMEOUT_MS, withHiddenNavbar } from './utils/launch';
import type { DataverseClient, NavApp, NavModule, UserContext } from './types';

export interface UsePulseNavigationOptions {
  /** Dataverse access to the Pulse environment — see `createDataverseClient`. */
  client: DataverseClient;
  /** Override how the signed-in user is resolved. Defaults to the Power Apps host context. */
  getUserContext?: () => Promise<UserContext>;
  /** Maximum pinned apps per user. Defaults to 5 (same as the Pulse hub). */
  maxFavorites?: number;
  /** Record launches in Pulse usage analytics. Defaults to true. */
  trackUsage?: boolean;
}

export type NavigationStatus = 'loading' | 'error' | 'ready';

async function defaultGetUserContext(): Promise<UserContext> {
  const context = await getContext();
  return { objectId: context.user.objectId, fullName: context.user.fullName };
}

/**
 * Loads everything the Pulse sidebar needs for the signed-in user: the
 * modules/apps their roles allow, their pinned apps, and a launcher that
 * records usage before navigating.
 */
export function usePulseNavigation({
  client,
  getUserContext = defaultGetUserContext,
  maxFavorites = MAX_FAVORITES,
  trackUsage = true,
}: UsePulseNavigationOptions) {
  const [status, setStatus] = useState<NavigationStatus>('loading');
  const [error, setError] = useState<string | undefined>();
  const [modules, setModules] = useState<NavModule[]>([]);
  const [userName, setUserName] = useState<string | undefined>();

  // Callers commonly pass an inline arrow for getUserContext; capture the
  // first one so a new function identity doesn't retrigger loads every render.
  const [userContextGetter] = useState(() => getUserContext);
  const getUserId = useCallback(
    async () => (await getCurrentUserAccess(client, userContextGetter)).userId,
    [client, userContextGetter]
  );

  const load = useCallback(async () => {
    setStatus('loading');
    setError(undefined);
    try {
      userContextGetter()
        .then((ctx) => setUserName(ctx.fullName))
        .catch(() => undefined);
      const access = await getCurrentUserAccess(client, userContextGetter);
      setModules(await loadNavigation(client, access));
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while loading navigation.');
      setStatus('error');
    }
  }, [client, userContextGetter]);

  useEffect(() => {
    load();
  }, [load]);

  const favorites = useFavorites(client, getUserId, maxFavorites);

  const launchApp = useCallback(
    async (app: NavApp) => {
      if (!app.url) return;
      if (trackUsage) {
        await Promise.race([recordAppUsage(client, app.id, getUserId), delay(USAGE_RECORD_TIMEOUT_MS)]);
      }
      window.location.href = withHiddenNavbar(app.url);
    },
    [client, getUserId, trackUsage]
  );

  return {
    status,
    error,
    modules,
    userName,
    retry: load,
    launchApp,
    ...favorites,
  };
}
