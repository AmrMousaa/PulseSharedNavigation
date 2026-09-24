import type { DataverseClient, ListOptions } from '../types';

/** Pulse's Dataverse environment (where modules, apps, favorites and usage live). */
export const PULSE_ORGANIZATION_URL = 'https://org1cb63e1b.crm4.dynamics.com';

interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: { message?: string } | unknown;
}

/**
 * Structural type matching the `MicrosoftDataverseService` class that
 * `pac code add-data-source` generates for the Microsoft Dataverse connector.
 * Only the four cross-environment operations the navigation uses are required.
 */
export interface MicrosoftDataverseServiceLike {
  ListRecordsWithOrganization(
    organization: string,
    entityName: string,
    prefer?: string,
    accept?: string,
    x_ms_odata_metadata_full?: boolean,
    MSCRM_IncludeMipSensitivityLabel?: boolean,
    $select?: string,
    $filter?: string,
    $orderby?: string,
    $expand?: string,
    fetchXml?: string,
    $top?: number
  ): Promise<OperationResult<unknown>>;
  CreateRecordWithOrganization(
    prefer: string,
    accept: string,
    organization: string,
    entityName: string,
    item: Record<string, unknown>
  ): Promise<OperationResult<unknown>>;
  UpdateRecordWithOrganization(
    prefer: string,
    accept: string,
    organization: string,
    entityName: string,
    recordId: string,
    item: Record<string, unknown>
  ): Promise<OperationResult<unknown>>;
  DeleteRecordWithOrganization(organization: string, entityName: string, recordId: string): Promise<OperationResult<unknown>>;
}

const PREFER = 'return=representation,odata.include-annotations="*"';
const ACCEPT = 'application/json';

function errorMessage(result: OperationResult<unknown>, fallback: string): string {
  const err = result.error as { message?: string } | undefined;
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
export function createDataverseClient(
  service: MicrosoftDataverseServiceLike,
  organizationUrl: string = PULSE_ORGANIZATION_URL
): DataverseClient {
  return {
    async list<T>(entitySet: string, options: ListOptions = {}): Promise<T[]> {
      const result = await service.ListRecordsWithOrganization(
        organizationUrl,
        entitySet,
        PREFER,
        ACCEPT,
        undefined,
        undefined,
        options.select?.join(','),
        options.filter,
        options.orderBy?.join(','),
        undefined,
        undefined,
        options.top
      );
      if (!result.success) throw new Error(errorMessage(result, `Failed to load ${entitySet}.`));
      const page = result.data as { value?: T[] } | undefined;
      return page?.value ?? [];
    },

    async create<T>(entitySet: string, record: Record<string, unknown>): Promise<T> {
      const result = await service.CreateRecordWithOrganization(PREFER, ACCEPT, organizationUrl, entitySet, record);
      if (!result.success) throw new Error(errorMessage(result, `Failed to create ${entitySet} record.`));
      return result.data as T;
    },

    async update(entitySet: string, id: string, fields: Record<string, unknown>): Promise<void> {
      const result = await service.UpdateRecordWithOrganization(PREFER, ACCEPT, organizationUrl, entitySet, id, fields);
      if (!result.success) throw new Error(errorMessage(result, `Failed to update ${entitySet} record.`));
    },

    async remove(entitySet: string, id: string): Promise<void> {
      const result = await service.DeleteRecordWithOrganization(organizationUrl, entitySet, id);
      // The generated delete returns void on success; only fail on an explicit failure.
      if (result && result.success === false) throw new Error(errorMessage(result, `Failed to delete ${entitySet} record.`));
    },
  };
}
