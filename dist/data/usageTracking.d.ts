import type { DataverseClient } from '../types';
/**
 * Feeds the Pulse usage analytics dashboard. Never throws — failures are only
 * logged, so tracking can never block or break an app launch.
 */
export declare function recordAppUsage(client: DataverseClient, appId: string, getUserId: () => Promise<string>): Promise<void>;
