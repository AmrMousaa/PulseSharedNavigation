import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { NavApp, NavModule } from '../types';
import { initials } from '../utils/launch';
import { ModuleIcon } from './ModuleIcon';
import { IconChevronLeft, IconChevronRight, IconLayers, IconSearch, IconStar } from './icons';

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

function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function onActivateKey(action: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };
}

export function PulseSidebar({
  modules,
  isOpen,
  onClose,
  variant = 'overlay',
  onLaunchApp,
  onGoHome,
  currentModuleId,
  currentAppId,
  favoritedAppIds,
  pendingAppIds,
  onToggleFavorite,
  status = 'ready',
  error,
  onRetry,
  brandName = 'Andalusia Pulse',
  brandTagline = 'ENTERPRISE HUB',
  logo,
  userName,
  userSubtitle = 'Enterprise workspace',
  footer,
  searchPlaceholder = 'Search modules or apps',
  className,
}: PulseSidebarProps) {
  const activeModuleId = useMemo(
    () => currentModuleId ?? modules.find((m) => m.apps.some((a) => a.id === currentAppId))?.id ?? null,
    [modules, currentModuleId, currentAppId]
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasUserToggled, setHasUserToggled] = useState(false);
  const [query, setQuery] = useState('');

  // Until the user expands/collapses something themselves, open the module of
  // the current app (or the first module, matching the Pulse hub).
  const effectiveExpandedId = hasUserToggled ? expandedId : (activeModuleId ?? modules[0]?.id ?? null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();
  const filtered = modules
    .map((module) => {
      const moduleMatches = module.name.toLowerCase().includes(q);
      const apps = q && !moduleMatches ? module.apps.filter((app) => app.name.toLowerCase().includes(q)) : module.apps;
      if (q && !moduleMatches && apps.length === 0) return null;
      return { module, apps };
    })
    .filter((entry): entry is { module: NavModule; apps: NavApp[] } => entry !== null);

  function toggleModule(moduleId: string) {
    setHasUserToggled(true);
    setExpandedId(effectiveExpandedId === moduleId ? null : moduleId);
  }

  let navBody: ReactNode;
  if (status === 'loading') {
    navBody = (
      <div className="psn-skeleton" aria-busy="true" aria-label="Loading navigation">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="psn-skeleton-row" />
        ))}
      </div>
    );
  } else if (status === 'error') {
    navBody = (
      <div className="psn-empty" role="alert">
        {error ?? 'Could not load navigation.'}
        {onRetry && (
          <button type="button" className="psn-retry" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  } else if (filtered.length === 0) {
    navBody = <div className="psn-empty">{q ? <>No matches for &ldquo;{query}&rdquo;</> : 'No apps available.'}</div>;
  } else {
    navBody = filtered.map(({ module, apps }) => {
      const isExpanded = module.id === effectiveExpandedId || Boolean(q);
      const isCurrent = module.id === activeModuleId;
      return (
        <div key={module.id} className={`psn-item${isExpanded ? ' expanded' : ''}`}>
          <div
            className={`psn-row${isCurrent ? ' current' : ''}`}
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            onClick={() => toggleModule(module.id)}
            onKeyDown={onActivateKey(() => toggleModule(module.id))}
          >
            <span className="psn-row-icon">
              <ModuleIcon src={module.iconUrl} alt={module.name || 'Module'} size={18} />
            </span>
            <span className="psn-label">{highlight(module.name, q)}</span>
            <span className="psn-count">{apps.length}</span>
            <IconChevronRight className="psn-chev" width={13} height={13} aria-hidden="true" />
          </div>
          <div className="psn-sub">
            {apps.map((app) => {
              const isPinned = favoritedAppIds?.has(app.id) ?? false;
              const isPending = pendingAppIds?.has(app.id) ?? false;
              const disabled = !app.url;
              const launch = () => {
                if (disabled) return;
                onLaunchApp(app, module);
                onClose();
              };
              return (
                <div
                  key={app.id}
                  className={`psn-app${disabled ? ' disabled' : ''}${app.id === currentAppId ? ' current' : ''}`}
                  role="button"
                  tabIndex={isExpanded ? 0 : -1}
                  aria-disabled={disabled}
                  aria-current={app.id === currentAppId ? 'page' : undefined}
                  title={app.description}
                  onClick={launch}
                  onKeyDown={onActivateKey(launch)}
                >
                  <span className="psn-app-name">{highlight(app.name, q)}</span>
                  {onToggleFavorite && (
                    <span
                      className={`psn-star${isPinned ? ' pinned' : ''}${isPending ? ' pending' : ''}`}
                      role="button"
                      tabIndex={isExpanded ? 0 : -1}
                      aria-pressed={isPinned}
                      aria-label={isPinned ? `Unpin ${app.name}` : `Pin ${app.name}`}
                      title={isPinned ? 'Unpin' : 'Pin app'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(app.id);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        onActivateKey(() => onToggleFavorite(app.id))(e);
                      }}
                    >
                      <IconStar width={12} height={12} filled={isPinned} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  }

  const rootClass = ['psn-root', `psn-${variant}`, isOpen ? 'open' : '', className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <div className="psn-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="psn-sidebar" aria-label="Pulse navigation">
        <div className="psn-top" />
        <div className="psn-header">
          <button
            type="button"
            className="psn-logo-btn"
            onClick={() => {
              onGoHome?.();
              onClose();
            }}
            disabled={!onGoHome}
          >
            <span className="psn-logo" aria-hidden="true">
              {logo ?? <IconLayers width={18} height={18} />}
            </span>
            <span className="psn-brand">
              <span className="n">{brandName}</span>
              {brandTagline && <span className="s">{brandTagline}</span>}
            </span>
          </button>
          <button type="button" className="psn-collapse" onClick={onClose} aria-label="Close sidebar">
            <IconChevronLeft width={14} height={14} />
          </button>
        </div>

        <div className="psn-search">
          <div className="psn-search-in">
            <IconSearch width={14} height={14} aria-hidden="true" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={searchPlaceholder}
            />
          </div>
        </div>

        <nav className="psn-nav" aria-label="Modules and apps">
          {navBody}
        </nav>

        {footer !== undefined ? (
          footer
        ) : (
          <div className="psn-footer">
            <div className="psn-avatar">{initials(userName)}</div>
            <div className="psn-user">
              <div className="un">{userName ?? brandName}</div>
              <div className="ur">{userSubtitle}</div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
