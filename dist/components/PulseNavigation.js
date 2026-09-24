import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { usePulseNavigation } from '../usePulseNavigation';
import { PulseSidebar } from './PulseSidebar';
/** Default Pulse hub URL used by the logo/home button. */
export const PULSE_HUB_URL = 'https://apps.powerapps.com/play/e/cd78a59b-e16f-e4aa-b0a1-8e450a70ed56/a/2ffd8322-d1f1-4ffe-ac86-339fc6818a7b';
/**
 * Drop-in Pulse sidebar: loads the signed-in user's modules/apps/favorites
 * from the Pulse Dataverse environment and renders `PulseSidebar`.
 */
export function PulseNavigation({ client, getUserContext, maxFavorites, trackUsage, homeUrl = PULSE_HUB_URL, onGoHome, onLaunchApp, disableFavorites, onError, userName, ...sidebarProps }) {
    const nav = usePulseNavigation({ client, getUserContext, maxFavorites, trackUsage });
    const [toast, setToast] = useState(null);
    useEffect(() => {
        if (!toast)
            return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);
    const report = (message) => (onError ? onError(message) : setToast(message));
    const goHome = onGoHome ?? (homeUrl ? () => (window.location.href = homeUrl) : undefined);
    return (_jsxs(_Fragment, { children: [_jsx(PulseSidebar, { ...sidebarProps, modules: nav.modules, status: nav.status, error: nav.error, onRetry: nav.retry, userName: userName ?? nav.userName, onGoHome: goHome, onLaunchApp: onLaunchApp ?? ((app) => void nav.launchApp(app)), favoritedAppIds: nav.favoritedAppIds, pendingAppIds: nav.pendingAppIds, onToggleFavorite: disableFavorites
                    ? undefined
                    : (appId) => nav.toggleFavorite(appId).catch((err) => report(err instanceof Error ? err.message : 'Failed to update favorites.')) }), toast && (_jsx("div", { className: "psn-toast", role: "status", onClick: () => setToast(null), children: toast }))] }));
}
