import type { DataverseClient, NavFavorite } from '../types';
export declare const MAX_FAVORITES = 5;
/**
 * The signed-in user's pinned apps, shared with the Pulse hub (same
 * `pulse_favorites` table). Updates are optimistic and serialized per app so a
 * rapid pin/unpin/pin can't race an in-flight request.
 */
export declare function useFavorites(client: DataverseClient, getUserId: () => Promise<string>, maxFavorites?: number): {
    favorites: NavFavorite[];
    favoritedAppIds: Set<string>;
    pendingAppIds: Set<string>;
    toggleFavorite: (appId: string) => Promise<void>;
    reloadFavorites: () => Promise<void>;
};
