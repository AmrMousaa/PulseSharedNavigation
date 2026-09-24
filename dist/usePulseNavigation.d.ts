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
/**
 * Loads everything the Pulse sidebar needs for the signed-in user: the
 * modules/apps their roles allow, their pinned apps, and a launcher that
 * records usage before navigating.
 */
export declare function usePulseNavigation({ client, getUserContext, maxFavorites, trackUsage, }: UsePulseNavigationOptions): {
    favorites: import("./types").NavFavorite[];
    favoritedAppIds: Set<string>;
    pendingAppIds: Set<string>;
    toggleFavorite: (appId: string) => Promise<void>;
    reloadFavorites: () => Promise<void>;
    status: NavigationStatus;
    error: string | undefined;
    modules: NavModule[];
    userName: string | undefined;
    retry: () => Promise<void>;
    launchApp: (app: NavApp) => Promise<void>;
};
