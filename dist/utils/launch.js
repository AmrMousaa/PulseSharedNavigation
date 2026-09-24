/** Appends `hidenavbar=true` so the launched Power App hides its own chrome. */
export function withHiddenNavbar(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}hidenavbar=true`;
}
// A same-tab navigation cancels in-flight requests once the page unloads, so
// usage tracking gets a brief, capped head start before we navigate. Tracking
// writes are cross-environment round trips; 1.5s keeps them from being lost
// without noticeably delaying the launch.
export const USAGE_RECORD_TIMEOUT_MS = 1500;
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export function initials(name, fallback = 'AP') {
    if (!name)
        return fallback;
    const chars = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '');
    return chars.join('') || fallback;
}
