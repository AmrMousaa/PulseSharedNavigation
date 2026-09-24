/** Pulse's Dataverse environment (where modules, apps, favorites and usage live). */
export const PULSE_ORGANIZATION_URL = 'https://org1cb63e1b.crm4.dynamics.com';
const PREFER = 'return=representation,odata.include-annotations="*"';
const ACCEPT = 'application/json';
function errorMessage(result, fallback) {
    const err = result.error;
    return err?.message ?? fallback;
}
/**
 * Wraps your app's generated `MicrosoftDataverseService` so the navigation can
 * read/write Pulse tables cross-environment.
 *
 * ```ts
 * import { MicrosoftDataverseService } from './generated/services/MicrosoftDataverseService';
 * const client = createDataverseClient(MicrosoftDataverseService);
 * ```
 */
export function createDataverseClient(service, organizationUrl = PULSE_ORGANIZATION_URL) {
    return {
        async list(entitySet, options = {}) {
            const result = await service.ListRecordsWithOrganization(organizationUrl, entitySet, PREFER, ACCEPT, undefined, undefined, options.select?.join(','), options.filter, options.orderBy?.join(','), undefined, undefined, options.top);
            if (!result.success)
                throw new Error(errorMessage(result, `Failed to load ${entitySet}.`));
            const page = result.data;
            return page?.value ?? [];
        },
        async create(entitySet, record) {
            const result = await service.CreateRecordWithOrganization(PREFER, ACCEPT, organizationUrl, entitySet, record);
            if (!result.success)
                throw new Error(errorMessage(result, `Failed to create ${entitySet} record.`));
            return result.data;
        },
        async update(entitySet, id, fields) {
            const result = await service.UpdateRecordWithOrganization(PREFER, ACCEPT, organizationUrl, entitySet, id, fields);
            if (!result.success)
                throw new Error(errorMessage(result, `Failed to update ${entitySet} record.`));
        },
        async remove(entitySet, id) {
            const result = await service.DeleteRecordWithOrganization(organizationUrl, entitySet, id);
            // The generated delete returns void on success; only fail on an explicit failure.
            if (result && result.success === false)
                throw new Error(errorMessage(result, `Failed to delete ${entitySet} record.`));
        },
    };
}
