import type { CurrentUserAccess, DataverseClient, NavModule } from '../types';
/**
 * Loads active Pulse modules and apps, keeps only the apps the current user's
 * security roles grant access to, and drops modules left with no visible apps.
 */
export declare function loadNavigation(client: DataverseClient, access: CurrentUserAccess): Promise<NavModule[]>;
