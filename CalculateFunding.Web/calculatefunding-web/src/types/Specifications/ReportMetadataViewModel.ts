import {ReportCategory} from "./ReportCategory";

export interface ReportMetadataViewModel {
    specificationReportIdentifier: string;
    name: string;
    category: ReportCategory;
    lastModified: Date;
    format: string;
    size: string;
}

