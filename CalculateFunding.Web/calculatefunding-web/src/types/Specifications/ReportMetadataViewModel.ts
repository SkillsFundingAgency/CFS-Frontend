import {ReportCategory} from "./ReportCategory";
import React from "react";

export interface ReportMetadataViewModel {
    specificationReportIdentifier: string;
    name: string;
    category: ReportCategory;
    lastModified: Date;
    format: string;
    size: string;
    grouping: ReportGrouping,
    groupingLevel: ReportGroupingLevel
    reportType: ReportType
    expanded?: boolean,
    customRef?: React.MutableRefObject<null>,
}

export enum ReportGrouping {
    Undefined = "Undefined",
    Live = "Live",
    Provider = "Provider",
    Group = "Group",
    Profiling = "Profiling",
}

export enum ReportGroupingLevel {
    Undefined = "Undefined",
    Current = "Current",
    All = "All",
    Released = "Released"
}

export enum ReportType {
    Undefined,
    CurrentState,
    Released,
    History,
    HistoryProfileValues,
    CurrentProfileValues,
    CurrentOrganisationGroupValues,
    HistoryOrganisationGroupValues,
    HistoryPublishedProviderEstate,
    CalcResult,
    PublishedGroups
}

