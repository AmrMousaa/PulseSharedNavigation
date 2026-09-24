import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DataverseClient, NavFavorite } from '../types';

export const MAX_FAVORITES = 5;

interface FavoriteRow {
  pulse_favoriteid: string;
  pulse_order?: number;
  _pulse_app_value?: string;
}

function toFavorite(row: FavoriteRow): NavFavorite {
  return { id: row.pulse_favoriteid, appId: row._pulse_app_value ?? '', order: row.pulse_order ?? 0 };
}

function sortByOrder(favorites: NavFavorite[]): NavFavorite[] {
  return [...favorites].sort((a, b) => a.order - b.order);
}

/**
 * The signed-in user's pinned apps, shared with the Pulse hub (same
 * `pulse_favorites` table). Updates are optimistic and serialized per app so a
 * rapid pin/unpin/pin can't race an in-flight request.
 */
export function useFavorites(client: DataverseClient, getUserId: () => Promise<string>, maxFavorites = MAX_FAVORITES) {
  const [favorites, setFavorites] = useState<NavFavorite[]>([]);
  const [pendingAppIds, setPendingAppIds] = useState<Set<string>>(new Set());
  const favoritesRef = useRef<NavFavorite[]>([]);
  const queueRef = useRef<Map<string, Promise<void>>>(new Map());

  const commit = useCallback((next: NavFavorite[]) => {
    favoritesRef.current = next;
    setFavorites(next);
  }, []);

  const load = useCallback(async () => {
    const userId = await getUserId();
    const rows = await client.list<FavoriteRow>('pulse_favorites', {
      filter: `statecode eq 0 and _pulse_user_value eq ${userId}`,
      orderBy: ['pulse_order asc'],
      select: ['pulse_favoriteid', 'pulse_order', '_pulse_app_value'],
    });
    commit(sortByOrder(rows.map(toFavorite)));
  }, [client, getUserId, commit]);

  useEffect(() => {
    load().catch((err) => console.warn('[pulse-shared-navigation] Failed to load favorites:', err));
  }, [load]);

  const addFavorite = useCallback(
    async (appId: string) => {
      const snapshot = favoritesRef.current;
      if (snapshot.some((f) => f.appId === appId)) throw new Error('This app is already in your favorites.');
      if (snapshot.length >= maxFavorites) throw new Error(`You can only favorite up to ${maxFavorites} apps.`);

      const userId = await getUserId();
      const order = snapshot.length === 0 ? 0 : Math.max(...snapshot.map((f) => f.order)) + 1;
      const tempId = `temp-${appId}`;
      commit(sortByOrder([...favoritesRef.current, { id: tempId, appId, order }]));

      try {
        const created = await client.create<FavoriteRow>('pulse_favorites', {
          pulse_order: order,
          'pulse_App@odata.bind': `/pulse_apps(${appId})`,
          'pulse_user@odata.bind': `/systemusers(${userId})`,
          statecode: 0,
        });
        const saved: NavFavorite = { id: created?.pulse_favoriteid ?? tempId, appId, order };
        commit(sortByOrder(favoritesRef.current.map((f) => (f.id === tempId ? saved : f))));
        // Some connector versions don't return the created row; reload to get its real id.
        if (!created?.pulse_favoriteid) await load();
      } catch (err) {
        commit(favoritesRef.current.filter((f) => f.id !== tempId));
        throw err instanceof Error ? err : new Error('Failed to add favorite.');
      }
    },
    [client, getUserId, commit, load, maxFavorites]
  );

  const removeFavorite = useCallback(
    async (favoriteId: string) => {
      const snapshot = favoritesRef.current;
      const remaining = sortByOrder(snapshot.filter((f) => f.id !== favoriteId));
      const resequenced = remaining.map((f, index) => ({ ...f, order: index }));
      commit(resequenced);

      try {
        // A favorite removed before its create() resolved has nothing to delete yet.
        if (!favoriteId.startsWith('temp-')) await client.remove('pulse_favorites', favoriteId);
        const changed = resequenced.filter((f, index) => !f.id.startsWith('temp-') && f.order !== remaining[index].order);
        await Promise.all(changed.map((f) => client.update('pulse_favorites', f.id, { pulse_order: f.order })));
      } catch (err) {
        commit(snapshot);
        throw err instanceof Error ? err : new Error('Failed to remove favorite.');
      }
    },
    [client, commit]
  );

  const setPending = useCallback((appId: string, isPending: boolean) => {
    setPendingAppIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(appId);
      else next.delete(appId);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback(
    (appId: string) => {
      const previous = queueRef.current.get(appId) ?? Promise.resolve();
      setPending(appId, true);
      const next: Promise<void> = previous
        .catch(() => undefined)
        .then(async () => {
          const existing = favoritesRef.current.find((f) => f.appId === appId);
          if (existing) await removeFavorite(existing.id);
          else await addFavorite(appId);
        })
        .finally(() => {
          if (queueRef.current.get(appId) === next) {
            queueRef.current.delete(appId);
            setPending(appId, false);
          }
        });
      queueRef.current.set(appId, next);
      return next;
    },
    [addFavorite, removeFavorite, setPending]
  );

  const favoritedAppIds = useMemo(() => new Set(favorites.map((f) => f.appId).filter(Boolean)), [favorites]);

  return { favorites, favoritedAppIds, pendingAppIds, toggleFavorite, reloadFavorites: load };
}
