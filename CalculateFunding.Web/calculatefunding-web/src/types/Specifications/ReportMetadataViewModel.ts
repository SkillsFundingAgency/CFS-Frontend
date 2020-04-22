export interface SpecificationReportIdentifier {
    jobType: string;
    specificationId: string;
    fundingStreamId?: any;
    fundingPeriodId?: any;
    fundingLineCode?: any;
}

export interface ReportMetadataViewModel {
    specificationReportIdentifier: SpecificationReportIdentifier;
    name: string;
    category: string;
    lastModified: Date;
    format: string;
    size: string;
}