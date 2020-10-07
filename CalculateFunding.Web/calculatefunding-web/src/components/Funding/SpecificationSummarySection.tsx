import React from "react";
import {SpecificationSummary} from "../../types/SpecificationSummary";

export interface ISpecificationSummarySectionProps {
    specification: SpecificationSummary | undefined,
    isLoadingSpecification: boolean,
}

export function SpecificationSummarySection(props: ISpecificationSummarySectionProps) {

    if (props.isLoadingSpecification) {
        return null;
    }
    if (props.specification) {
        return (
            <>
                <span className="govuk-caption-xl">Specification</span>
                <h1 className="govuk-heading-xl govuk-!-margin-bottom-2" data-testid="specName">{props.specification.name}</h1>
                <span className="govuk-caption-m">Funding period</span>
                <h1 className="govuk-heading-m" data-testid="fundingPeriodName">{props.specification.fundingPeriod.name}</h1>
                <span className="govuk-caption-m">Funding stream</span>
                <h1 className="govuk-heading-m" data-testid="fundingStreamName">{props.specification.fundingStreams[0].name}</h1>
            </>
        );
    } else {
        return null;
    }
}