// Model-driven app pages (https://<org>.crm*.dynamics.com/main.aspx) reject any
// query-string parameter they don't recognise with a generic "An error has
// occurred" page, so `hidenavbar` must only be added to Power Apps (code/canvas)
// URLs. Model-driven URLs hide their chrome with their own `navbar=off` param.
function isModelDrivenUrl(url) {
    try {
        return new URL(url).hostname.toLowerCase().endsWith('.dynamics.com');
    }
    catch {
        return false;
    }
}
/** Appends `hidenavbar=true` so the launched Power App hides its own chrome (model-driven URLs are left as-is). */
export function withHiddenNavbar(url) {
    if (isModelDrivenUrl(url))
        return url;
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
