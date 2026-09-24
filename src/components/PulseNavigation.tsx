import { useEffect, useState } from 'react';
import { usePulseNavigation, type UsePulseNavigationOptions } from '../usePulseNavigation';
import type { NavApp, NavModule } from '../types';
import { PulseSidebar, type PulseSidebarProps } from './PulseSidebar';

/** Default Pulse hub URL used by the logo/home button. */
export const PULSE_HUB_URL = 'https://apps.powerapps.com/play/e/cd78a59b-e16f-e4aa-b0a1-8e450a70ed56/a/2ffd8322-d1f1-4ffe-ac86-339fc6818a7b';

export interface PulseNavigationProps
  extends UsePulseNavigationOptions,
    Omit<
      PulseSidebarProps,
      | 'modules'
      | 'onLaunchApp'
      | 'favoritedAppIds'
      | 'pendingAppIds'
      | 'onToggleFavorite'
      | 'status'
      | 'error'
      | 'onRetry'
      | 'onGoHome'
    > {
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
export function PulseNavigation({
  client,
  getUserContext,
  maxFavorites,
  trackUsage,
  homeUrl = PULSE_HUB_URL,
  onGoHome,
  onLaunchApp,
  disableFavorites,
  onError,
  userName,
  ...sidebarProps
}: PulseNavigationProps) {
  const nav = usePulseNavigation({ client, getUserContext, maxFavorites, trackUsage });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const report = (message: string) => (onError ? onError(message) : setToast(message));

  const goHome = onGoHome ?? (homeUrl ? () => (window.location.href = homeUrl) : undefined);

  return (
    <>
      <PulseSidebar
        {...sidebarProps}
        modules={nav.modules}
        status={nav.status}
        error={nav.error}
        onRetry={nav.retry}
        userName={userName ?? nav.userName}
        onGoHome={goHome}
        onLaunchApp={onLaunchApp ?? ((app) => void nav.launchApp(app))}
        favoritedAppIds={nav.favoritedAppIds}
        pendingAppIds={nav.pendingAppIds}
        onToggleFavorite={
          disableFavorites
            ? undefined
            : (appId) =>
                nav.toggleFavorite(appId).catch((err) => report(err instanceof Error ? err.message : 'Failed to update favorites.'))
        }
      />
      {toast && (
        <div className="psn-toast" role="status" onClick={() => setToast(null)}>
          {toast}
        </div>
      )}
    </>
  );
}
