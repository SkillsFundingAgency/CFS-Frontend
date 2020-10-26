import React from "react";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {ProviderSummary} from "../../types/ProviderSummary";
import {LoadingFieldStatus} from "../LoadingFieldStatus";

export interface ProviderSummarySectionProps {
    specification: SpecificationSummary | undefined,
    isLoadingSpecification: boolean,
    providerVersion: ProviderSummary | undefined,
    isLoadingProviderVersion: boolean
}

export function ProviderSummarySection(props: ProviderSummarySectionProps) {

    return (<div className="govuk-grid-row govuk-!-margin-bottom-5">
        <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Provider name</span>
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">
                {props.isLoadingProviderVersion ? <LoadingFieldStatus title="Loading..."/> : props.providerVersion ? props.providerVersion.name : ""}
            </h1>
            <span className="govuk-caption-m">Specification</span>
            <h1 className="govuk-heading-m">
                {props.isLoadingSpecification ?
                    <LoadingFieldStatus title="Loading..."/> : props.specification ? props.specification.name : ""}
            </h1>
            <span className="govuk-caption-m">Funding period</span>
            <h1 className="govuk-heading-m">
                {props.isLoadingSpecification ? <LoadingFieldStatus title="Loading..."/> : props.specification ? props.specification.fundingPeriod?.name : ""}
            </h1>
            <span className="govuk-caption-m">Funding stream</span>
            <h1 className="govuk-heading-m">
                {props.isLoadingSpecification ? <LoadingFieldStatus title="Loading..."/> : props.specification ? props.specification.fundingStreams[0].name : ""}
            </h1>
        </div>
    </div>);
}