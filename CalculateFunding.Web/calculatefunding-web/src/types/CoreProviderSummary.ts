export interface CoreProviderSummary {
    providerVersionId: string;
    versionType: string;
    name: string;
    description: string;
    version: number;
    targetDate: Date;
    fundingStream: string;
    created: Date;
}

export interface ProviderSnapshot {
    providerSnapshotId: number;
    name: string;
    description: string;
    version: number;
    targetDate: Date;
    created: Date;
    fundingStreamCode: string;
    fundingStreamName: string;
}

export enum ProviderSource{
    CFS,
    FDZ
}