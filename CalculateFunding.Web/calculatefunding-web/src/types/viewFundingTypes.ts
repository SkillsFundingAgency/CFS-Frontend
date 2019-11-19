export interface Specification {
    fundingPeriod: FundingPeriod;
    fundingStreams: FundingStream[];
    providerVersionId: string;
    description: string;
    isSelectedForFunding: boolean;
    approvalStatus: string;
    publishedResultsRefreshedAt?: null;
    lastCalculationUpdatedAt?: string | null;
    templateIds: TemplateIds;
    id: string;
    name: string;
}

export interface TemplateIds {
    PSG: string;
}

export interface FundingPeriod {
    id: string,
    name: string
}

export interface FundingTypes{
    id:string,
    name:string
}

export interface FundingStream {
    id: string,
    name: string
}