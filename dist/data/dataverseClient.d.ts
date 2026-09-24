import type { DataverseClient } from '../types';
/** Pulse's Dataverse environment (where modules, apps, favorites and usage live). */
export declare const PULSE_ORGANIZATION_URL = "https://org1cb63e1b.crm4.dynamics.com";
interface OperationResult<T> {
    success: boolean;
    data?: T;
    error?: {
        message?: string;
    } | unknown;
}
/**
 * Structural type matching the `MicrosoftDataverseService` class that
 * `pac code add-data-source` generates for the Microsoft Dataverse connector.
 * Only the four cross-environment operations the navigation uses are required.
 */
export interface MicrosoftDataverseServiceLike {
    ListRecordsWithOrganization(organization: string, entityName: string, prefer?: string, accept?: string, x_ms_odata_metadata_full?: boolean, MSCRM_IncludeMipSensitivityLabel?: boolean, $select?: string, $filter?: string, $orderby?: string, $expand?: string, fetchXml?: string, $top?: number): Promise<OperationResult<unknown>>;
    CreateRecordWithOrganization(prefer: string, accept: string, organization: string, entityName: string, item: Record<string, unknown>): Promise<OperationResult<unknown>>;
    UpdateRecordWithOrganization(prefer: string, accept: string, organization: string, entityName: string, recordId: string, item: Record<string, unknown>): Promise<OperationResult<unknown>>;
    DeleteRecordWithOrganization(organization: string, entityName: string, recordId: string): Promise<OperationResult<unknown>>;
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
export declare function createDataverseClient(service: MicrosoftDataverseServiceLike, organizationUrl?: string): DataverseClient;
export {};
