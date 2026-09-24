import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createDataverseClient } from '../data/dataverseClient';
import { PulseMenuButton } from './PulseMenuButton';
import { PulseNavigation } from './PulseNavigation';
// One client per generated service, so re-renders don't create new clients
// (which would reset the navigation's cached user lookup and reload data).
const clientCache = new WeakMap();
function resolveClient(dataverse, client) {
    if (client)
        return client;
    if (!dataverse)
        throw new Error('[pulse-shared-navigation] PulseShell needs a `dataverse` service or a `client`.');
    let cached = clientCache.get(dataverse);
    if (!cached) {
        cached = createDataverseClient(dataverse);
        clientCache.set(dataverse, cached);
    }
    return cached;
}
/**
 * The zero-config way to add Pulse navigation: wrap your app with it.
 *
 * ```tsx
 * <PulseShell dataverse={MicrosoftDataverseService}>
 *   <App />
 * </PulseShell>
 * ```
 *
 * Docked on wide screens (content is offset automatically), a slide-in drawer
 * with a floating menu button on small screens.
 */
export function PulseShell({ dataverse, client, showMenuButton = true, variant = 'docked', children, ...navProps }) {
    const [isOpen, setIsOpen] = useState(false);
    const resolved = resolveClient(dataverse, client);
    return (_jsxs(_Fragment, { children: [_jsx(PulseNavigation, { ...navProps, client: resolved, variant: variant, isOpen: isOpen, onClose: () => setIsOpen(false) }), showMenuButton && (_jsx(PulseMenuButton, { className: `psn-floating-menu${variant === 'docked' ? ' psn-floating-menu-docked' : ''}`, onClick: () => setIsOpen(true) })), _jsx("div", { className: variant === 'docked' ? 'psn-docked-offset' : undefined, children: children })] }));
}
