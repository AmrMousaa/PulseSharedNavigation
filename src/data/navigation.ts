import type { CurrentUserAccess, DataverseClient, NavApp, NavModule } from '../types';

const ACTIVE_FILTER = 'statecode eq 0';
const ORDER_BY = ['pulse_order asc'];

interface ModuleRow {
  pulse_moduleid: string;
  pulse_name?: string;
  pulse_iconurl?: string;
  pulse_description?: string;
  pulse_order?: number;
}

interface AppRow {
  pulse_appid: string;
  pulse_name?: string;
  pulse_appurl?: string;
  pulse_iconurl?: string;
  pulse_description?: string;
  pulse_order?: number;
  _pulse_module_value?: string;
}

interface PermissionRow {
  _pulse_app_value?: string;
  _pulse_securityrole_value?: string;
}

function canSeeApp(appId: string, requiredRoleIdsByApp: Map<string, Set<string>>, access: CurrentUserAccess): boolean {
  if (access.isSystemAdministrator) return true;
  const required = requiredRoleIdsByApp.get(appId);
  // An app with no role linked to it isn't visible to anyone yet — it needs
  // at least one Security Role assigned before it shows up in the catalog.
  if (!required || required.size === 0) return false;
  for (const roleId of required) {
    if (access.roleIds.has(roleId)) return true;
  }
  return false;
}

/**
 * Loads active Pulse modules and apps, keeps only the apps the current user's
 * security roles grant access to, and drops modules left with no visible apps.
 */
export async function loadNavigation(client: DataverseClient, access: CurrentUserAccess): Promise<NavModule[]> {
  const [moduleRows, appRows, permissionRows] = await Promise.all([
    client.list<ModuleRow>('pulse_modules', {
      filter: ACTIVE_FILTER,
      orderBy: ORDER_BY,
      select: ['pulse_moduleid', 'pulse_name', 'pulse_iconurl', 'pulse_description', 'pulse_order'],
    }),
    client.list<AppRow>('pulse_apps', {
      filter: ACTIVE_FILTER,
      orderBy: ORDER_BY,
      select: ['pulse_appid', 'pulse_name', 'pulse_appurl', 'pulse_iconurl', 'pulse_description', 'pulse_order', '_pulse_module_value'],
    }),
    client.list<PermissionRow>('pulse_apppermissions', {
      filter: ACTIVE_FILTER,
      select: ['_pulse_app_value', '_pulse_securityrole_value'],
    }),
  ]);

  const requiredRoleIdsByApp = new Map<string, Set<string>>();
  for (const permission of permissionRows) {
    const appId = permission._pulse_app_value;
    const roleId = permission._pulse_securityrole_value;
    if (!appId || !roleId) continue;
    const roleIds = requiredRoleIdsByApp.get(appId) ?? new Set<string>();
    roleIds.add(roleId);
    requiredRoleIdsByApp.set(appId, roleIds);
  }

  const appsByModule = new Map<string, NavApp[]>();
  for (const row of appRows) {
    const moduleId = row._pulse_module_value;
    if (!moduleId || !canSeeApp(row.pulse_appid, requiredRoleIdsByApp, access)) continue;
    const list = appsByModule.get(moduleId) ?? [];
    list.push({
      id: row.pulse_appid,
      moduleId,
      name: row.pulse_name ?? '',
      url: row.pulse_appurl,
      iconUrl: row.pulse_iconurl,
      description: row.pulse_description,
      order: row.pulse_order,
    });
    appsByModule.set(moduleId, list);
  }

  return moduleRows
    .filter((row) => appsByModule.has(row.pulse_moduleid))
    .map((row) => ({
      id: row.pulse_moduleid,
      name: row.pulse_name ?? '',
      iconUrl: row.pulse_iconurl,
      description: row.pulse_description,
      order: row.pulse_order,
      apps: appsByModule.get(row.pulse_moduleid) ?? [],
    }));
}
