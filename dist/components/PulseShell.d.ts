import { type ReactNode } from 'react';
import { type MicrosoftDataverseServiceLike } from '../data/dataverseClient';
import type { DataverseClient } from '../types';
import { type PulseNavigationProps } from './PulseNavigation';
export interface PulseShellProps extends Omit<PulseNavigationProps, 'client' | 'isOpen' | 'onClose'> {
    /** Your app's generated `MicrosoftDataverseService` (or pass a ready `client`). */
    dataverse?: MicrosoftDataverseServiceLike;
    client?: DataverseClient;
    /** Show the floating menu button (only visible when the sidebar is hidden). Defaults to true. */
    showMenuButton?: boolean;
    children?: ReactNode;
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
export declare function PulseShell({ dataverse, client, showMenuButton, variant, children, ...navProps }: PulseShellProps): import("react").JSX.Element;
