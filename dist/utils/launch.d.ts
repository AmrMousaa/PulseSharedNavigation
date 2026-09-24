/** Appends `hidenavbar=true` so the launched Power App hides its own chrome. */
export declare function withHiddenNavbar(url: string): string;
export declare const USAGE_RECORD_TIMEOUT_MS = 1500;
export declare function delay(ms: number): Promise<void>;
export declare function initials(name?: string, fallback?: string): string;
