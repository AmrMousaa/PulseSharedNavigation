import type { CurrentUserAccess, DataverseClient, UserContext } from '../types';
export declare function getCurrentUserAccess(client: DataverseClient, getUserContext: () => Promise<UserContext>): Promise<CurrentUserAccess>;
