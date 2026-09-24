import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { initials } from '../utils/launch';
import { ModuleIcon } from './ModuleIcon';
import { IconChevronLeft, IconChevronRight, IconLayers, IconSearch, IconStar } from './icons';
function highlight(text, query) {
    if (!query)
        return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1)
        return text;
    return (_jsxs(_Fragment, { children: [text.slice(0, idx), _jsx("mark", { children: text.slice(idx, idx + query.length) }), text.slice(idx + query.length)] }));
}
function onActivateKey(action) {
    return (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    };
}
export function PulseSidebar({ modules, isOpen, onClose, variant = 'overlay', onLaunchApp, onGoHome, currentModuleId, currentAppId, favoritedAppIds, pendingAppIds, onToggleFavorite, status = 'ready', error, onRetry, brandName = 'Andalusia Pulse', brandTagline = 'ENTERPRISE HUB', logo, userName, userSubtitle = 'Enterprise workspace', footer, searchPlaceholder = 'Search modules or apps', className, }) {
    const activeModuleId = useMemo(() => currentModuleId ?? modules.find((m) => m.apps.some((a) => a.id === currentAppId))?.id ?? null, [modules, currentModuleId, currentAppId]);
    const [expandedId, setExpandedId] = useState(null);
    const [hasUserToggled, setHasUserToggled] = useState(false);
    const [query, setQuery] = useState('');
    // Until the user expands/collapses something themselves, open the module of
    // the current app (or the first module, matching the Pulse hub).
    const effectiveExpandedId = hasUserToggled ? expandedId : (activeModuleId ?? modules[0]?.id ?? null);
    useEffect(() => {
        if (!isOpen)
            return;
        const onKey = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);
    const q = query.trim().toLowerCase();
    const filtered = modules
        .map((module) => {
        const moduleMatches = module.name.toLowerCase().includes(q);
        const apps = q && !moduleMatches ? module.apps.filter((app) => app.name.toLowerCase().includes(q)) : module.apps;
        if (q && !moduleMatches && apps.length === 0)
            return null;
        return { module, apps };
    })
        .filter((entry) => entry !== null);
    function toggleModule(moduleId) {
        setHasUserToggled(true);
        setExpandedId(effectiveExpandedId === moduleId ? null : moduleId);
    }
    let navBody;
    if (status === 'loading') {
        navBody = (_jsx("div", { className: "psn-skeleton", "aria-busy": "true", "aria-label": "Loading navigation", children: [0, 1, 2, 3, 4].map((i) => (_jsx("div", { className: "psn-skeleton-row" }, i))) }));
    }
    else if (status === 'error') {
        navBody = (_jsxs("div", { className: "psn-empty", role: "alert", children: [error ?? 'Could not load navigation.', onRetry && (_jsx("button", { type: "button", className: "psn-retry", onClick: onRetry, children: "Try again" }))] }));
    }
    else if (filtered.length === 0) {
        navBody = _jsx("div", { className: "psn-empty", children: q ? _jsxs(_Fragment, { children: ["No matches for \u201C", query, "\u201D"] }) : 'No apps available.' });
    }
    else {
        navBody = filtered.map(({ module, apps }) => {
            const isExpanded = module.id === effectiveExpandedId || Boolean(q);
            const isCurrent = module.id === activeModuleId;
            return (_jsxs("div", { className: `psn-item${isExpanded ? ' expanded' : ''}`, children: [_jsxs("div", { className: `psn-row${isCurrent ? ' current' : ''}`, role: "button", tabIndex: 0, "aria-expanded": isExpanded, onClick: () => toggleModule(module.id), onKeyDown: onActivateKey(() => toggleModule(module.id)), children: [_jsx("span", { className: "psn-row-icon", children: _jsx(ModuleIcon, { src: module.iconUrl, alt: module.name || 'Module', size: 18 }) }), _jsx("span", { className: "psn-label", children: highlight(module.name, q) }), _jsx("span", { className: "psn-count", children: apps.length }), _jsx(IconChevronRight, { className: "psn-chev", width: 13, height: 13, "aria-hidden": "true" })] }), _jsx("div", { className: "psn-sub", children: apps.map((app) => {
                            const isPinned = favoritedAppIds?.has(app.id) ?? false;
                            const isPending = pendingAppIds?.has(app.id) ?? false;
                            const disabled = !app.url;
                            const launch = () => {
                                if (disabled)
                                    return;
                                onLaunchApp(app, module);
                                onClose();
                            };
                            return (_jsxs("div", { className: `psn-app${disabled ? ' disabled' : ''}${app.id === currentAppId ? ' current' : ''}`, role: "button", tabIndex: isExpanded ? 0 : -1, "aria-disabled": disabled, "aria-current": app.id === currentAppId ? 'page' : undefined, title: app.description, onClick: launch, onKeyDown: onActivateKey(launch), children: [_jsx("span", { className: "psn-app-name", children: highlight(app.name, q) }), onToggleFavorite && (_jsx("span", { className: `psn-star${isPinned ? ' pinned' : ''}${isPending ? ' pending' : ''}`, role: "button", tabIndex: isExpanded ? 0 : -1, "aria-pressed": isPinned, "aria-label": isPinned ? `Unpin ${app.name}` : `Pin ${app.name}`, title: isPinned ? 'Unpin' : 'Pin app', onClick: (e) => {
                                            e.stopPropagation();
                                            onToggleFavorite(app.id);
                                        }, onKeyDown: (e) => {
                                            e.stopPropagation();
                                            onActivateKey(() => onToggleFavorite(app.id))(e);
                                        }, children: _jsx(IconStar, { width: 12, height: 12, filled: isPinned }) }))] }, app.id));
                        }) })] }, module.id));
        });
    }
    const rootClass = ['psn-root', `psn-${variant}`, isOpen ? 'open' : '', className ?? ''].filter(Boolean).join(' ');
    return (_jsxs("div", { className: rootClass, children: [_jsx("div", { className: "psn-backdrop", onClick: onClose, "aria-hidden": "true" }), _jsxs("aside", { className: "psn-sidebar", "aria-label": "Pulse navigation", children: [_jsx("div", { className: "psn-top" }), _jsxs("div", { className: "psn-header", children: [_jsxs("button", { type: "button", className: "psn-logo-btn", onClick: () => {
                                    onGoHome?.();
                                    onClose();
                                }, disabled: !onGoHome, children: [_jsx("span", { className: "psn-logo", "aria-hidden": "true", children: logo ?? _jsx(IconLayers, { width: 18, height: 18 }) }), _jsxs("span", { className: "psn-brand", children: [_jsx("span", { className: "n", children: brandName }), brandTagline && _jsx("span", { className: "s", children: brandTagline })] })] }), _jsx("button", { type: "button", className: "psn-collapse", onClick: onClose, "aria-label": "Close sidebar", children: _jsx(IconChevronLeft, { width: 14, height: 14 }) })] }), _jsx("div", { className: "psn-search", children: _jsxs("div", { className: "psn-search-in", children: [_jsx(IconSearch, { width: 14, height: 14, "aria-hidden": "true" }), _jsx("input", { type: "text", placeholder: searchPlaceholder, value: query, onChange: (e) => setQuery(e.target.value), "aria-label": searchPlaceholder })] }) }), _jsx("nav", { className: "psn-nav", "aria-label": "Modules and apps", children: navBody }), footer !== undefined ? (footer) : (_jsxs("div", { className: "psn-footer", children: [_jsx("div", { className: "psn-avatar", children: initials(userName) }), _jsxs("div", { className: "psn-user", children: [_jsx("div", { className: "un", children: userName ?? brandName }), _jsx("div", { className: "ur", children: userSubtitle })] })] }))] })] }));
}
