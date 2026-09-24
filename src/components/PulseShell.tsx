import { useState, type ReactNode } from 'react';
import { createDataverseClient, type MicrosoftDataverseServiceLike } from '../data/dataverseClient';
import type { DataverseClient } from '../types';
import { PulseMenuButton } from './PulseMenuButton';
import { PulseNavigation, type PulseNavigationProps } from './PulseNavigation';

export interface PulseShellProps extends Omit<PulseNavigationProps, 'client' | 'isOpen' | 'onClose'> {
  /** Your app's generated `MicrosoftDataverseService` (or pass a ready `client`). */
  dataverse?: MicrosoftDataverseServiceLike;
  client?: DataverseClient;
  /** Show the floating menu button (only visible when the sidebar is hidden). Defaults to true. */
  showMenuButton?: boolean;
  children?: ReactNode;
}

// One client per generated service, so re-renders don't create new clients
// (which would reset the navigation's cached user lookup and reload data).
const clientCache = new WeakMap<MicrosoftDataverseServiceLike, DataverseClient>();

function resolveClient(dataverse?: MicrosoftDataverseServiceLike, client?: DataverseClient): DataverseClient {
  if (client) return client;
  if (!dataverse) throw new Error('[pulse-shared-navigation] PulseShell needs a `dataverse` service or a `client`.');
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
export function PulseShell({ dataverse, client, showMenuButton = true, variant = 'docked', children, ...navProps }: PulseShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const resolved = resolveClient(dataverse, client);

  return (
    <>
      <PulseNavigation {...navProps} client={resolved} variant={variant} isOpen={isOpen} onClose={() => setIsOpen(false)} />
      {showMenuButton && (
        <PulseMenuButton
          className={`psn-floating-menu${variant === 'docked' ? ' psn-floating-menu-docked' : ''}`}
          onClick={() => setIsOpen(true)}
        />
      )}
      <div className={variant === 'docked' ? 'psn-docked-offset' : undefined}>{children}</div>
    </>
  );
}
