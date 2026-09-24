import type { DataverseClient } from '../src';

// In-memory stand-in for the Pulse Dataverse tables so the sidebar can be
// developed and demoed without a Power Apps host.
const tables: Record<string, Record<string, unknown>[]> = {
  systemusers: [{ systemuserid: 'user-1' }],
  roles: [{ roleid: 'role-staff', name: 'Staff' }],
  pulse_modules: [
    { pulse_moduleid: 'm-clinical', pulse_name: 'Clinical', pulse_order: 1 },
    { pulse_moduleid: 'm-finance', pulse_name: 'Finance', pulse_order: 2 },
    { pulse_moduleid: 'm-hr', pulse_name: 'Human Resources', pulse_order: 3 },
    { pulse_moduleid: 'm-quality', pulse_name: 'Quality & Policy', pulse_order: 4 },
  ],
  pulse_apps: [
    { pulse_appid: 'a-1', pulse_name: 'Patient Journey', pulse_appurl: 'https://example.com/pj', _pulse_module_value: 'm-clinical' },
    { pulse_appid: 'a-2', pulse_name: 'Bed Management', pulse_appurl: 'https://example.com/bed', _pulse_module_value: 'm-clinical' },
    { pulse_appid: 'a-3', pulse_name: 'OR Scheduling', _pulse_module_value: 'm-clinical' },
    { pulse_appid: 'a-4', pulse_name: 'Revenue Dashboard', pulse_appurl: 'https://example.com/rev', _pulse_module_value: 'm-finance' },
    { pulse_appid: 'a-5', pulse_name: 'Procurement', pulse_appurl: 'https://example.com/proc', _pulse_module_value: 'm-finance' },
    { pulse_appid: 'a-6', pulse_name: 'Leave Requests', pulse_appurl: 'https://example.com/leave', _pulse_module_value: 'm-hr' },
    { pulse_appid: 'a-7', pulse_name: 'TMS', pulse_appurl: 'https://example.com/tms', _pulse_module_value: 'm-quality' },
    { pulse_appid: 'a-8', pulse_name: 'Policy Module', pulse_appurl: 'https://example.com/policy', _pulse_module_value: 'm-quality' },
  ],
  pulse_apppermissions: ['a-1', 'a-2', 'a-3', 'a-4', 'a-5', 'a-6', 'a-7', 'a-8'].map((id) => ({
    _pulse_app_value: id,
    _pulse_securityrole_value: 'role-staff',
  })),
  pulse_favorites: [{ pulse_favoriteid: 'f-1', pulse_order: 0, _pulse_app_value: 'a-4' }],
  pulse_appusagestatses: [],
  pulse_appuserlastuseds: [],
};

const wait = () => new Promise((r) => setTimeout(r, 400));
let seq = 0;

export const mockClient: DataverseClient = {
  async list<T>(entitySet: string) {
    await wait();
    return (tables[entitySet] ?? []) as T[];
  },
  async create<T>(entitySet: string, record: Record<string, unknown>) {
    await wait();
    const row: Record<string, unknown> = { ...record };
    if (entitySet === 'pulse_favorites') {
      row.pulse_favoriteid = `f-new-${++seq}`;
      row._pulse_app_value = String(record['pulse_App@odata.bind']).match(/\((.*)\)/)?.[1];
    }
    (tables[entitySet] ??= []).push(row);
    return row as T;
  },
  async update() {
    await wait();
  },
  async remove(entitySet: string, id: string) {
    await wait();
    tables[entitySet] = (tables[entitySet] ?? []).filter((row) => !Object.values(row).includes(id));
  },
};
