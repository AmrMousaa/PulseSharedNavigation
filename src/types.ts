/** A launchable app shown under a module in the sidebar. */
export interface NavApp {
  id: string;
  moduleId: string;
  name: string;
  url?: string;
  iconUrl?: string;
  description?: string;
  order?: number;
}

/** A module (group of apps) shown as an expandable row in the sidebar. */
export interface NavModule {
  id: string;
  name: string;
  iconUrl?: string;
  description?: string;
  order?: number;
  apps: NavApp[];
}

export interface ListOptions {
  select?: string[];
  filter?: string;
  orderBy?: string[];
  top?: number;
}

/**
 * The minimal Dataverse surface the navigation needs. Build one from your
 * app's generated `MicrosoftDataverseService` with `createDataverseClient`,
 * or implement it yourself (e.g. for tests or a non-Power Apps host).
 */
export interface DataverseClient {
  list<T = Record<string, unknown>>(entitySet: string, options?: ListOptions): Promise<T[]>;
  create<T = Record<string, unknown>>(entitySet: string, record: Record<string, unknown>): Promise<T>;
  update(entitySet: string, id: string, fields: Record<string, unknown>): Promise<void>;
  remove(entitySet: string, id: string): Promise<void>;
}

/** Signed-in user details, normally read from the Power Apps host context. */
export interface UserContext {
  objectId?: string;
  fullName?: string;
}

export interface CurrentUserAccess {
  userId: string;
  isSystemAdministrator: boolean;
  roleIds: Set<string>;
}

export interface NavFavorite {
  id: string;
  appId: string;
  order: number;
}
