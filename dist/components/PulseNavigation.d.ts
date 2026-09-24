import { type UsePulseNavigationOptions } from '../usePulseNavigation';
import type { NavApp, NavModule } from '../types';
import { type PulseSidebarProps } from './PulseSidebar';
/** Default Pulse hub URL used by the logo/home button. */
export declare const PULSE_HUB_URL = "https://apps.powerapps.com/play/e/cd78a59b-e16f-e4aa-b0a1-8e450a70ed56/a/2ffd8322-d1f1-4ffe-ac86-339fc6818a7b";
export interface PulseNavigationProps extends UsePulseNavigationOptions, Omit<PulseSidebarProps, 'modules' | 'onLaunchApp' | 'favoritedAppIds' | 'pendingAppIds' | 'onToggleFavorite' | 'status' | 'error' | 'onRetry' | 'onGoHome'> {
    /** Where the logo navigates. Defaults to the Pulse hub. Pass `null` to disable. */
    homeUrl?: string | null;
    /** Override the logo click entirely (takes precedence over `homeUrl`). */
    onGoHome?: () => void;
    /** Override launching (default: record usage, then open the app in the same tab with `hidenavbar=true`). */
    onLaunchApp?: (app: NavApp, module: NavModule) => void;
    /** Hide the pin/star buttons. */
    disableFavorites?: boolean;
    /** Receive favorite errors (e.g. "max 5 favorites"). Defaults to a small built-in toast. */
    onError?: (message: string) => void;
}
/**
 * Drop-in Pulse sidebar: loads the signed-in user's modules/apps/favorites
 * from the Pulse Dataverse environment and renders `PulseSidebar`.
 */
export declare function PulseNavigation({ client, getUserContext, maxFavorites, trackUsage, homeUrl, onGoHome, onLaunchApp, disableFavorites, onError, userName, ...sidebarProps }: PulseNavigationProps): import("react").JSX.Element;
