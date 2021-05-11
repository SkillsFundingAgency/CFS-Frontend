import {UserPermissions} from "./UserPermissions";

export interface FundingStreamPermissions extends UserPermissions {
    fundingStreamId: string;
    fundingStreamName?: string;
}