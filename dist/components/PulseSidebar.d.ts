import { type ReactNode } from 'react';
import type { NavApp, NavModule } from '../types';
export interface PulseSidebarProps {
    /** Modules to show, each with the apps under it (already filtered for the user). */
    modules: NavModule[];
    /** Whether the sidebar is open (overlay mode, or docked mode on narrow screens). */
    isOpen: boolean;
    onClose: () => void;
    /**
     * `overlay` (default) slides in over the page, like the Pulse hub.
     * `docked` stays visible on screens ≥ 1024px and becomes an overlay below that.
     */
    variant?: 'overlay' | 'docked';
    /** Called when the user clicks an app that has a URL. */
    onLaunchApp: (app: NavApp, module: NavModule) => void;
    /** Called when the brand/logo is clicked. Hidden behavior if omitted. */
    onGoHome?: () => void;
    /** Module to highlight with the accent bar (e.g. the module of the current app). */
    currentModuleId?: string | null;
    /** App the user is currently in; its module is auto-expanded and the app highlighted. */
    currentAppId?: string | null;
    /** Pinned-app support. Stars are hidden when `onToggleFavorite` is not provided. */
    favoritedAppIds?: Set<string>;
    pendingAppIds?: Set<string>;
    onToggleFavorite?: (appId: string) => void;
    /** Loading / error display while data is being fetched. */
    status?: 'loading' | 'error' | 'ready';
    error?: string;
    onRetry?: () => void;
    /** Branding. */
    brandName?: string;
    brandTagline?: string;
    logo?: ReactNode;
    /** Footer user card. Pass `footer` to replace it entirely, or `null` to hide it. */
    userName?: string;
    userSubtitle?: string;
    footer?: ReactNode;
    searchPlaceholder?: string;
    className?: string;
}
export declare function PulseSidebar({ modules, isOpen, onClose, variant, onLaunchApp, onGoHome, currentModuleId, currentAppId, favoritedAppIds, pendingAppIds, onToggleFavorite, status, error, onRetry, brandName, brandTagline, logo, userName, userSubtitle, footer, searchPlaceholder, className, }: PulseSidebarProps): import("react").JSX.Element;
